import os
import json


def generate_forensic_report(detection_result: dict) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            f"You are a helpful digital safety assistant for OriginX. Use simple, non-technical language. "
            f"Given this detection result: {json.dumps(detection_result)}, explain in 2-3 short sentences "
            f"if this image is safe or suspicious. Use an analogy like a 'security seal' and tell the user "
            f"if they should be worried about deepfake manipulation."
        )
        return response.text
    except Exception:
        return "Our system has completed the scan. Please check the Safety Status for a quick summary."


def parse_consent_policy(natural_language: str) -> dict:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            f"Parse this consent statement into JSON flags for OriginX. "
            f"Statement: '{natural_language}'. Return ONLY a JSON object with these boolean keys: "
            f"commercial_use, ai_training, derivative_works, political_use, artistic_use, resharing, attribution_required."
        )
        text = response.text.strip().replace("```json", "").replace("```", "").strip()
        return json.loads(text)
    except Exception:
        return {
            "commercial_use": False,
            "ai_training": False,
            "derivative_works": False,
            "political_use": False,
            "artistic_use": False,
            "resharing": False,
            "attribution_required": False,
        }


def analyze_image_forensics(image_bytes: bytes, auto_confidence: float) -> str:
    try:
        import google.generativeai as genai
        import PIL.Image
        import io
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
        model = genai.GenerativeModel("gemini-1.5-flash")
        pil_img = PIL.Image.open(io.BytesIO(image_bytes)).convert("RGB")
        response = model.generate_content([
            pil_img,
            f"As a forensic expert for OriginX, describe in 3-5 sentences what visual artifacts "
            f"you observe. Our system scored it {auto_confidence:.0%} suspicious."
        ])
        return response.text
    except Exception:
        return "OriginX visual analysis unavailable."


def generate_violation_notice(matched_user: str, platform: str) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(
            f"Generate a formal data rights violation notice for OriginX. "
            f"The victim @{matched_user} had their consent signature detected in synthetic media on {platform}. "
            f"Include formal opening, violation description, removal demand, placeholder for date and signature. Under 200 words."
        )
        return response.text
    except Exception:
        return "OriginX notice generation unavailable. Please consult legal counsel."


def generate_legal_guidance(detection_result: dict, watermark_found: bool) -> str:
    try:
        import google.generativeai as genai
        genai.configure(api_key=os.environ.get("GEMINI_API_KEY", ""))
        model = genai.GenerativeModel("gemini-1.5-flash")
        
        context = "The image is AUTHENTIC and your original watermark was found." if watermark_found and not detection_result["is_deepfake"] else \
                  "The image is a DEEPFAKE and your watermark was found (CONSENT VIOLATION)." if watermark_found and detection_result["is_deepfake"] else \
                  "The image is a DEEPFAKE and NO watermark was found." if detection_result["is_deepfake"] else \
                  "The image is clean/authentic but NO watermark was found."
                  
        response = model.generate_content(
            f"You are a Legal Rights Advisor for OriginX. Provide a numbered list of 3-4 actionable 'Next Steps' "
            f"for a user based on this situation: {context}. "
            f"Include advice on DMCA takedowns, reporting to platforms, or securing their digital identity. "
            f"Keep it supportive and clear. Maximum 150 words."
        )
        return response.text
    except Exception:
        return "1. Monitor your digital footprint.\n2. Enable two-factor authentication on social accounts.\n3. Consider watermarking future uploads on OriginX."