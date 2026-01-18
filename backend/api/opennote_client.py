"""
OpenNote API client for generating educational materials.
Generates notebooks, flashcards, and practice problems from curriculum topics.
Falls back to Gemini generation if OpenNote API is unavailable.
"""
import os
import json
import re
import aiohttp
from typing import Dict, List, Optional
import google.generativeai as genai

OPENNOTE_API_KEY = os.getenv("OPENNOTE_API_KEY")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)


def clean_and_parse_json(text: str) -> Dict:
    """
    Clean and parse JSON from LLM response, handling common formatting issues.
    """
    # Remove markdown code blocks
    text = text.strip()
    text = re.sub(r'^```json\s*', '', text)
    text = re.sub(r'^```\s*', '', text)
    text = re.sub(r'\s*```$', '', text)
    text = text.strip()

    # Try direct parsing first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Fix common issues
    # Remove trailing commas before closing brackets/braces
    text = re.sub(r',(\s*[}\]])', r'\1', text)

    # Try parsing again
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # Try to extract JSON object from text
    match = re.search(r'\{[\s\S]*\}', text)
    if match:
        try:
            extracted = match.group(0)
            # Remove trailing commas
            extracted = re.sub(r',(\s*[}\]])', r'\1', extracted)
            return json.loads(extracted)
        except json.JSONDecodeError:
            pass

    # Final fallback - raise the error
    raise json.JSONDecodeError("Could not parse JSON from response", text, 0)


class OpenNoteClient:
    """Client for OpenNote API or Gemini fallback."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or OPENNOTE_API_KEY
        self.base_url = "https://api.opennote.com/v1"
        self.use_gemini_fallback = not self.api_key

    async def generate_materials(self, curriculum_data: Dict) -> Dict:
        """
        Generate all study materials from curriculum.

        Args:
            curriculum_data: Dict with metadata and topics list

        Returns:
            Dict with notebook, flashcards, and practice_problems
        """
        topics = curriculum_data.get("topics", [])
        metadata = curriculum_data.get("metadata", {})

        if not topics:
            return self._empty_materials()

        # Use Gemini fallback for now (OpenNote API integration can be added later)
        print(f"[OpenNote] Generating materials for {len(topics)} topics using Gemini")
        return await self._generate_with_gemini(topics, metadata)

    async def _generate_with_gemini(self, topics: List[Dict], metadata: Dict) -> Dict:
        """Generate materials using Gemini as fallback."""
        if not GOOGLE_API_KEY:
            print("[OpenNote] No API key available, returning mock materials")
            return self._generate_mock_materials(topics, metadata)

        try:
            notebook = await self._generate_notebook(topics, metadata)
            flashcards = await self._generate_flashcards(topics, metadata)
            problems = await self._generate_practice_problems(topics, metadata)

            return {
                "notebook": notebook,
                "flashcards": flashcards,
                "practice_problems": problems
            }
        except Exception as e:
            print(f"[OpenNote] Gemini generation failed: {e}")
            return self._generate_mock_materials(topics, metadata)

    async def _generate_notebook(self, topics: List[Dict], metadata: Dict) -> Dict:
        """Generate notebook content using Gemini."""
        course_name = metadata.get("title", "Course")
        topics_text = "\n".join([
            f"- {t.get('label')}: {t.get('description', '')}"
            for t in topics
        ])

        prompt = f"""Create a study notebook for the course: {course_name}

Topics:
{topics_text}

Generate a structured notebook with sections for each topic. Return ONLY valid JSON (no markdown, no explanation).

Format:
{{
  "title": "Study Notebook: {course_name}",
  "sections": [
    {{
      "title": "Topic Name",
      "content": "Detailed explanation of the topic in 2-3 paragraphs. Include key concepts, formulas if relevant, and examples."
    }},
    ...
  ]
}}

Generate comprehensive educational content for each topic."""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            if response.text:
                return clean_and_parse_json(response.text)
        except Exception as e:
            print(f"[OpenNote] Notebook generation error: {e}")

        # Fallback notebook
        return {
            "title": f"Study Notebook: {course_name}",
            "sections": [
                {
                    "title": t.get("label", "Topic"),
                    "content": t.get("description", "Content for this topic.")
                }
                for t in topics
            ]
        }

    async def _generate_flashcards(self, topics: List[Dict], metadata: Dict) -> Dict:
        """Generate flashcards using Gemini."""
        course_name = metadata.get("title", "Course")
        topics_text = "\n".join([
            f"- {t.get('label')}: {t.get('description', '')}"
            for t in topics
        ])

        prompt = f"""Create flashcards for studying: {course_name}

Topics:
{topics_text}

Generate 10-15 flashcards covering key concepts from all topics. Return ONLY valid JSON.

Format:
{{
  "title": "Flashcards: {course_name}",
  "cards": [
    {{
      "question": "What is...?",
      "answer": "It is..."
    }},
    ...
  ]
}}

Make questions clear and answers concise but complete."""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            if response.text:
                return clean_and_parse_json(response.text)
        except Exception as e:
            print(f"[OpenNote] Flashcard generation error: {e}")

        # Fallback flashcards
        return {
            "title": f"Flashcards: {course_name}",
            "cards": [
                {
                    "question": f"What is {t.get('label', 'this topic')}?",
                    "answer": t.get("summary", t.get("description", "A key concept in the course."))
                }
                for t in topics[:10]
            ]
        }

    async def _generate_practice_problems(self, topics: List[Dict], metadata: Dict) -> Dict:
        """Generate practice problems using Gemini."""
        course_name = metadata.get("title", "Course")
        topics_text = "\n".join([
            f"- {t.get('label')}: {t.get('description', '')}"
            for t in topics
        ])

        prompt = f"""Create practice problems for: {course_name}

Topics:
{topics_text}

Generate 5-8 practice problems covering the key concepts. Return ONLY valid JSON.

Format:
{{
  "title": "Practice Problems: {course_name}",
  "problems": [
    {{
      "question": "Explain or solve...",
      "solution": "The answer is... Here's why..."
    }},
    ...
  ]
}}

Include a mix of conceptual and application questions. Make solutions educational."""

        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)

            if response.text:
                return clean_and_parse_json(response.text)
        except Exception as e:
            print(f"[OpenNote] Practice problems generation error: {e}")

        # Fallback problems
        return {
            "title": f"Practice Problems: {course_name}",
            "problems": [
                {
                    "question": f"Explain the key concepts of {t.get('label', 'this topic')} and how they apply in practice.",
                    "solution": t.get("description", "This topic covers important concepts that are fundamental to understanding the subject.")
                }
                for t in topics[:5]
            ]
        }

    def _generate_mock_materials(self, topics: List[Dict], metadata: Dict) -> Dict:
        """Generate mock materials when no API is available."""
        course_name = metadata.get("title", "Course")

        return {
            "notebook": {
                "title": f"Study Notebook: {course_name}",
                "sections": [
                    {
                        "title": t.get("label", "Topic"),
                        "content": t.get("description", "Study content for this topic. Review the key concepts and make sure you understand the fundamentals before moving on.")
                    }
                    for t in topics
                ]
            },
            "flashcards": {
                "title": f"Flashcards: {course_name}",
                "cards": [
                    {
                        "question": f"What is {t.get('label', 'this topic')}?",
                        "answer": t.get("summary", t.get("description", "A key concept in the course."))
                    }
                    for t in topics
                ]
            },
            "practice_problems": {
                "title": f"Practice Problems: {course_name}",
                "problems": [
                    {
                        "question": f"Explain the main concepts of {t.get('label', 'this topic')}.",
                        "solution": t.get("description", "Review the topic materials for the complete answer.")
                    }
                    for t in topics[:5]
                ]
            }
        }

    def _empty_materials(self) -> Dict:
        """Return empty materials structure."""
        return {
            "notebook": {"title": "Study Notebook", "sections": []},
            "flashcards": {"title": "Flashcards", "cards": []},
            "practice_problems": {"title": "Practice Problems", "problems": []}
        }


async def generate_opennote_materials(curriculum_data: Dict) -> Dict:
    """
    Convenience function to generate OpenNote materials.
    """
    client = OpenNoteClient()
    return await client.generate_materials(curriculum_data)
