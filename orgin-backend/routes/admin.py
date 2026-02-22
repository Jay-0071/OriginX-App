from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import OriginRegistry, WatermarkedMedia
from services.auth_service import get_current_user_handle
from pydantic import BaseModel

router = APIRouter()

class UserStatusUpdate(BaseModel):
    is_active: bool

def require_admin(handle: str = Depends(get_current_user_handle), db: Session = Depends(get_db)):
    user = db.query(OriginRegistry).filter(OriginRegistry.user_handle == handle).first()
    if not user or not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin privileges required")
    return user

@router.get("/users")
def get_users(admin: OriginRegistry = Depends(require_admin), db: Session = Depends(get_db)):
    users = db.query(OriginRegistry).all()
    return [
        {
            "id": u.id,
            "user_handle": u.user_handle,
            "is_admin": bool(u.is_admin),
            "is_active": bool(u.is_active),
            "registered_at": u.registered_at.isoformat(),
            "media_count": u.media_count,
            "public_key_hash": u.public_key_hash[:12] + "..."
        }
        for u in users
    ]

@router.patch("/users/{handle}/status")
def toggle_user_active(handle: str, update: UserStatusUpdate, admin: OriginRegistry = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(OriginRegistry).filter(OriginRegistry.user_handle == handle).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.user_handle == admin.user_handle and not update.is_active:
        raise HTTPException(status_code=400, detail="Cannot deactivate your own admin account")

    user.is_active = update.is_active
    db.commit()
    return {"message": f"User @{handle} status updated to {'active' if update.is_active else 'inactive'}"}

@router.delete("/users/{handle}")
def delete_user(handle: str, admin: OriginRegistry = Depends(require_admin), db: Session = Depends(get_db)):
    import json
    from database.models import ProvenanceLog

    user = db.query(OriginRegistry).filter(OriginRegistry.user_handle == handle).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.user_handle == admin.user_handle:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")

    try:
        # 1. Clean up associated media records
        db.query(WatermarkedMedia).filter(WatermarkedMedia.user_handle == handle).delete()
        
        # 2. Scrub handle from ProvenanceLog JSON arrays
        logs = db.query(ProvenanceLog).all()
        for log in logs:
            try:
                handles = json.loads(log.matched_user_handles)
                if handle in handles:
                    handles.remove(handle)
                    log.matched_user_handles = json.dumps(handles)
            except json.JSONDecodeError:
                pass # Ignore malformed logs

        # 3. Delete the user
        db.delete(user)
        db.commit()
        return {"message": f"User @{handle} and all associated records deleted"}
    except Exception as e:
        db.rollback()
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Database constraint error during deletion: {str(e)}")
