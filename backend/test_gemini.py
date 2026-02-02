import asyncio
import os
from dotenv import load_dotenv
from google import genai

load_dotenv()

api_key = os.getenv("GOOGLE_API_KEY")
print(f"API Key found: {bool(api_key)}")
if api_key:
    print(f"Key starts with: {api_key[:5]}...")

def test_simple_text():
    print("Testing simple text generation with new SDK...")
    try:
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents="Hello, are you working?"
        )
        print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_simple_text()
