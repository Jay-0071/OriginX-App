from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os
from database.db import init_db, engine, SessionLocal
from database.models import OriginRegistry
from services.merkle_service import merkle_tree
from services.watermark_service import compute_signature
from routes import consent, watermark, detect, admin

app = FastAPI(
    title="OriginX API",
    description="Data Dignity and Deepfake Accountability",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(consent.router, prefix="/api/consent", tags=["Consent"])
app.include_router(watermark.router, prefix="/api/watermark", tags=["Watermark"])
app.include_router(detect.router, prefix="/api/detect", tags=["Detection"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


@app.on_event("startup")
def startup():
    init_db()
    _migrate_schema()
    _backfill_signature_hashes()
    _backfill_admin()


def _migrate_schema():
    """Add new columns to existing tables if they don't exist (SQLite migration)."""
    import sqlite3
    conn = sqlite3.connect("originx.db")
    cursor = conn.cursor()

    # Add signature_hash, password_hash, and secret_key to origin_registry if missing
    cursor.execute("PRAGMA table_info(origin_registry)")
    columns = [row[1] for row in cursor.fetchall()]
    if "signature_hash" not in columns:
        cursor.execute("ALTER TABLE origin_registry ADD COLUMN signature_hash TEXT")
        print("[MIGRATE] Added signature_hash to origin_registry")
    if "password_hash" not in columns:
        cursor.execute("ALTER TABLE origin_registry ADD COLUMN password_hash TEXT")
        print("[MIGRATE] Added password_hash to origin_registry")
    if "secret_key" not in columns:
        cursor.execute("ALTER TABLE origin_registry ADD COLUMN secret_key TEXT")
        print("[MIGRATE] Added secret_key to origin_registry")
    if "is_admin" not in columns:
        cursor.execute("ALTER TABLE origin_registry ADD COLUMN is_admin BOOLEAN DEFAULT 0")
        print("[MIGRATE] Added is_admin to origin_registry")
    if "is_active" not in columns:
        cursor.execute("ALTER TABLE origin_registry ADD COLUMN is_active BOOLEAN DEFAULT 1")
        print("[MIGRATE] Added is_active to origin_registry")

    # Add signature_hash to watermarked_media if it exists but is missing the column
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='watermarked_media'")
    if cursor.fetchone():
        cursor.execute("PRAGMA table_info(watermarked_media)")
        wm_columns = [row[1] for row in cursor.fetchall()]
        if "signature_hash" not in wm_columns:
            cursor.execute("ALTER TABLE watermarked_media ADD COLUMN signature_hash TEXT DEFAULT ''")
            print("[MIGRATE] Added signature_hash to watermarked_media")
        # Remove old column reference (watermark_seed_prefix) — SQLite can't drop columns, just ignore it

    conn.commit()
    conn.close()


def _backfill_admin():
    """Ensure the first user is an admin if no admins exist."""
    db = SessionLocal()
    try:
        from database.models import OriginRegistry
        # In SQLite, Boolean is often 0/1
        admin_exists = db.query(OriginRegistry).filter(OriginRegistry.is_admin == 1).first()
        if not admin_exists:
            first_user = db.query(OriginRegistry).order_by(OriginRegistry.registered_at.asc()).first()
            if first_user:
                first_user.is_admin = True
                db.commit()
                print(f"[AUTH] Promoted @{first_user.user_handle} to SYSTEM ADMIN")
    finally:
        db.close()


def _backfill_signature_hashes():
    """Compute signature_hash for any existing users that don't have it."""
    db = SessionLocal()
    try:
        users = db.query(OriginRegistry).filter(
            (OriginRegistry.signature_hash == None) | (OriginRegistry.signature_hash == "")
        ).all()
        if users:
            for user in users:
                user.signature_hash = compute_signature(user.watermark_seed)
                print(f"[BACKFILL] @{user.user_handle} → sig={user.signature_hash}")
            db.commit()
            print(f"[BACKFILL] Updated {len(users)} users with signature_hash")
        else:
            print("[BACKFILL] All users have signature_hash ✓")
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "platform": "OriginX",
        "tagline": "Whose reality was stolen?",
        "merkle_root": merkle_tree.get_root(),
        "version": "1.0.0",
    }


# Serve static files from frontend dist folder (must be after all API routes)
frontend_dist = Path(__file__).parent.parent / "originx-protocol-main" / "dist"
if frontend_dist.exists():
    # Serve static assets
    app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    
    # Serve root
    @app.get("/")
    async def serve_root():
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"error": "Frontend not found"}, 404
    
    # Serve index.html for all non-API routes (SPA routing)
    # This catch-all must be registered LAST after all API routes
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        # Skip API routes (they're handled above)
        if full_path.startswith("api/"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="API endpoint not found")
        # Serve index.html for SPA routing
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(str(index_path))
        return {"error": "Frontend not found"}, 404


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)