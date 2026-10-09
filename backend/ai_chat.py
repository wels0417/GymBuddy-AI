
import os
from google import genai
from google.genai import types


api_key = os.getenv("GEMINI_API_KEY")


client = genai.Client(api_key=api_key) if api_key else None

SYSTEM_PROMPT = """
You are GymBuddy AI, a friendly fitness and workout assistant.
Give helpful, practical, beginner-friendly advice about exercise,
workout routines, recovery, and general fitness.
Encourage safe exercise habits and remind users to consult a
qualified professional for medical concerns.
"""

def get_ai_response(message: str) -> str:
    if client is None:
        raise RuntimeError(
            "GEMINI_API_KEY is missing from the server environment."
        )

    response = client.models.generate_content(
        model="gemini-3.8-flash",
        contents=message,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            max_output_tokens=500,
        ),
    )

    if not response.text:
        raise RuntimeError("Gemini returned an empty response.")

    return response.text
