import requests
import os

def test_analyze():
    url = "http://localhost:8000/api/detect/analyze"
    # Find the latest generated image
    files = [f for f in os.listdir(r"C:\Users\kajal\.gemini\antigravity\brain\11a79235-1907-4232-942b-d0d545ce73bf") if "synthetic_test_image" in f]
    if not files:
        print("No test image found.")
        return
    
    latest_img = os.path.join(r"C:\Users\kajal\.gemini\antigravity\brain\11a79235-1907-4232-942b-d0d545ce73bf", sorted(files)[-1])
    print(f"Testing image: {latest_img}")
    
    with open(latest_img, 'rb') as f:
        response = requests.post(url, files={'file': f})
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Is Deepfake: {data.get('is_deepfake')}")
        print(f"Confidence: {data.get('confidence')}")
        print(f"Forensic Report: {data.get('forensic_report')}")
        print(f"Legal Guidance: {data.get('legal_guidance')}")
        print(f"Signals: {data.get('signals')}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    test_analyze()
