import io
import os
import json
import hashlib
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

FORENSICS_SYSTEM_PROMPT = """You are an expert digital forensics analyst. OriginX system has flagged this image. 

CRITICAL MISSION: You must identify if this is a modern high-quality AI generation (DALL-E 3, Midjourney v6).
Modern AI often hides behind "perfect" textures. 

LOOK FOR:
- "Over-smoothing": Areas with zero sensor noise.
- "Spectral Ringing": Sharp periodic artifacts in boundaries.
- "Anatomical Perfection": Iris symmetry that is mathematically perfect.

RULE: If the image looks "too perfect" to be a real-world photograph, classify as SYNTHETIC. Do not give INCONCLUSIVE unless absolutely necessary.

Return ONLY valid JSON:
{
  "verdict": "SYNTHETIC" | "AUTHENTIC",
  "confidence": float 0.0-1.0,
  "probable_method": "DIFFUSION" | "GAN" | "AUTHENTIC" | "UNKNOWN",
  "artifacts_found": [list],
  "summary": "Forensic proof of why it's synthetic or real"
}"""


def _ela_score(image_bytes: bytes) -> float:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=75)
        compressed = Image.open(buf).convert("RGB")
        orig_arr = np.array(img, dtype=float)
        comp_arr = np.array(compressed, dtype=float)
        diff = np.abs(orig_arr - comp_arr)
        ela = np.mean(diff) / 255.0
        return float(min(ela * 20.0, 1.0))
    except Exception:
        return 0.3


def _noise_score(image_bytes: bytes) -> float:
    """Detects 'too clean' noise patterns. Modern AI is typically < 9.0 std."""
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        arr = np.array(img, dtype=float)
        smoothed = gaussian_filter(arr, sigma=2)
        noise = arr - smoothed
        std = np.std(noise)
        
        # AGGRESSIVE: Modern AI smoothing is often disguised.
        if std < 9.0:
            score = 0.98  # Extremely high suspicion for clean digital textures
        elif std < 12.0:
            score = 0.80
        elif std > 28.0:
            score = 0.05  # High sensor noise
        else:
            score = 0.80 - ((std - 12.0) / 16.0) * 0.75
        
        return float(np.clip(score, 0.0, 1.0))
    except Exception:
        return 0.3


def _fft_score(image_bytes: bytes) -> float:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        arr = np.array(img, dtype=float)
        fft = np.fft.fft2(arr)
        fft_mag = np.abs(np.fft.fftshift(fft))
        h, w = fft_mag.shape
        cy, cx = h // 2, w // 2
        radius = min(h, w) // 8
        ring = fft_mag[cy - radius:cy + radius, cx - radius:cx + radius]
        periodicity = float(np.max(ring) / (np.mean(ring) + 1e-8))
        
        score = min((periodicity - 1.0) / 8.0, 1.0) # More sensitive
        return float(np.clip(score, 0.0, 1.0))
    except Exception:
        return 0.3


def _spectral_score(image_bytes: bytes) -> float:
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("L")
        arr = np.array(img, dtype=float)
        gx, gy = np.gradient(arr)
        mag = np.sqrt(gx**2 + gy**2)
        energy_variance = np.var(mag)
        
        # AI images are often "too flat" in high frequency energy
        if energy_variance < 80.0: 
            return 0.95
        if energy_variance > 6000.0: 
            return 0.85
        return 0.15
    except Exception:
        return 0.2


def _image_hash(image_bytes: bytes) -> str:
    return hashlib.sha256(image_bytes).hexdigest()


def _gemini_analyze(image_bytes: bytes, auto_confidence: float) -> dict | None:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            system_instruction=FORENSICS_SYSTEM_PROMPT,
        )
        import PIL.Image
        pil_img = PIL.Image.open(io.BytesIO(image_bytes)).convert("RGB")
        response = model.generate_content([
            pil_img,
            f"SYSTEM FLAG: {auto_confidence:.0%} suspicious. "
            f"DANGER: This image is suspect of being AI-GENERATED. "
            f"Hunt for 'over-perfection' and 'upscaling artifacts'. "
            f"DO NOT MISS subtle AI textures.",
        ])
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception:
        return None


def detect_deepfake(image_bytes: bytes) -> dict:
    ela = _ela_score(image_bytes)
    noise = _noise_score(image_bytes)
    freq = _fft_score(image_bytes)
    spect = _spectral_score(image_bytes)
    
    # Weighting: Heavily favor Noise and Spectral for modern diffusion
    confidence = (ela * 0.10) + (noise * 0.40) + (freq * 0.20) + (spect * 0.30)
    
    # Lower synergy threshold for amplification
    signals = [ela, noise, freq, spect]
    high_signals = [s for s in signals if s > 0.55]
    if len(high_signals) >= 2:
        boost = (len(high_signals) - 1) * 0.15
        confidence = min(confidence + boost, 1.0)
    
    is_deepfake = confidence > 0.45 # Aggressive threshold
    
    print(f"[FORENSICS] LOG -> ELA: {ela:.3f} | NOISE: {noise:.3f} | FFT: {freq:.3f} | SPECT: {spect:.3f} | CONF: {confidence:.3f}")
    
    gemini_result = None
    if 0.25 < confidence < 1.0 and GEMINI_API_KEY:
        gemini_result = _gemini_analyze(image_bytes, confidence)
        if gemini_result:
            g_conf = gemini_result.get("confidence", confidence)
            v = gemini_result.get("verdict")
            print(f"[FORENSICS] GEMINI -> Verdict: {v} | Peer Conf: {g_conf:.3f}")
            if v == "SYNTHETIC":
                confidence = max(confidence, 0.75, g_conf)
                is_deepfake = True
            elif v == "AUTHENTIC" and confidence < 0.60:
                confidence = min(confidence, g_conf)
                is_deepfake = confidence > 0.45

    return {
        "is_deepfake": bool(is_deepfake),
        "confidence": round(float(confidence), 3),
        "signals": {
            "ela_score": round(ela, 3),
            "noise_score": round(noise, 3),
            "freq_score": round(freq, 3),
            "spectral_score": round(spect, 3),
        },
        "gemini_analysis": gemini_result,
        "image_hash": _image_hash(image_bytes),
    }
