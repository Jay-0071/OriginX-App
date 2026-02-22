import requests
import io
from PIL import Image, ImageDraw
import json
import time
import os

BASE_URL = "http://localhost:8000"

def create_image(text, bg_color):
    """Create a distinct test image"""
    img = Image.new('RGB', (300, 200), color=bg_color)
    draw = ImageDraw.Draw(img)
    draw.text((50, 50), text, fill='black')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def verify_hmac_security():
    print("\n=== Testing Cryptographic HMAC Security ===")
    
    # 1. Create Source Image A
    img_a_bytes = create_image("IMAGE A", "lightblue")
    
    # 2. Register user
    reg_data = {
        "user_handle": "alice_hmac",
        "password": "alicepassword",
        "watermark_seed": "alice_seed"
    }
    try:
        requests.post(f"{BASE_URL}/api/consent/register", json=reg_data)
    except:
        pass
        
    # 3. Embed Watermark into Image A
    print("Embedding watermark into Image A...")
    files_a = {'file': ('image_a.png', img_a_bytes, 'image/png')}
    data_a = {
        'user_handle': 'alice_hmac',
        'password': 'alicepassword',
        'consent_accepted': 'true'
    }
    
    resp_a = requests.post(f"{BASE_URL}/api/watermark/embed", files=files_a, data=data_a)
    if resp_a.status_code != 200:
        print(f"✗ Failed to embed Image A: {resp_a.text}")
        return False
        
    watermarked_a_bytes = resp_a.content
    with open('watermarked_a.png', 'wb') as f:
        f.write(watermarked_a_bytes)
        
    # 4. Extract from Image A (Should Succeed)
    print("Extracting from Image A...")
    with open('watermarked_a.png', 'rb') as f:
        resp_extract_a = requests.post(f"{BASE_URL}/api/watermark/extract", files={'file': f}).json()
        
    if resp_extract_a.get('found') and resp_extract_a.get('matched_user') == 'alice_hmac':
         print("✓ Expected: Successfully extracted and verified signature from Image A.")
    else:
         print(f"✗ Failed: Could not verify signature from Image A: {resp_extract_a}")
         return False
         
    # 5. Extract the payload using our internal script logic to simulate the Hacker
    from services.watermark_service import extract_watermark, _lsb_embed
    extracted_payload_hex = extract_watermark(watermarked_a_bytes)
    print(f"\nHACKER SIMULATION: Extracted Payload Hex: {extracted_payload_hex}")
    
    # 6. Create Image B (The Hacker's fake image)
    img_b_bytes = create_image("IMAGE B - HACKER FAKE", "lightcoral")
    
    # 7. Hacker injects Alice's payload into Image B
    print("Hacker injecting Alice's payload into Image B...")
    hacked_image_b_bytes = _lsb_embed(img_b_bytes.getvalue(), extracted_payload_hex)
    with open('hacked_image_b.png', 'wb') as f:
        f.write(hacked_image_b_bytes)
        
    # 8. OriginX Verification of Image B
    print("Extracting from Image B (Hacked Image)...")
    with open('hacked_image_b.png', 'rb') as f:
         resp_extract_b = requests.post(f"{BASE_URL}/api/watermark/extract", files={'file': f}).json()

    if not resp_extract_b.get('found'):
         print("✓ Expected: Verification FAILED! The system successfully rejected the copied payload.")
         print(f"  Reason: {resp_extract_b.get('message')}")
         return True
    else:
         print("✗ CRITICAL FAILURE: System accepted the copied payload!")
         return False

if __name__ == "__main__":
    import os
    import sys
    sys.path.append(os.path.dirname(os.path.abspath(__file__)))
    
    success = verify_hmac_security()
    if success:
         print("\n🎉 SECURITY TEST PASSED: Image-Bound HMAC prevents payload copying attacks!")
    else:
         print("\n⚠️ SECURITY TEST FAILED")
