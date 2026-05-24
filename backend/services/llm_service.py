"""
LLM service wrapper for Groq API integration.

Uses Groq's hosted LLMs to generate structured news articles.
Falls back to a mock response when the API key is not configured.
"""

import json
import logging

from groq import AsyncGroq

from config import settings
from models.article import ArticleResponse

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an award-winning senior journalist writing for a prestigious newspaper.

Given a topic brief, write a well-researched, engaging news article.

RULES:
- Write in a professional, authoritative journalistic tone
- Include a compelling headline
- Write a 1-2 sentence summary/lead
- The main content should be 4-6 paragraphs, totaling 300-500 words
- Include quotes from fictional but realistic expert sources
- Assign one category from: World, Politics, Business, Technology, Science, Health, Sports, Arts, Opinion

Return ONLY valid JSON with exactly these keys:
{
  "title": "headline here",
  "summary": "1-2 sentence lead",
  "content": "full article body with paragraphs separated by \\n\\n",
  "category": "one of the categories listed above"
}"""

MOCK_RESPONSE = ArticleResponse(
    title="The Future of Artificial Intelligence in Everyday Life",
    summary=(
        "AI is rapidly moving from research labs into daily applications, "
        "reshaping industries and redefining how people interact with technology."
    ),
    content=(
        "Artificial intelligence has transitioned from a niche area of computer science "
        "into one of the most transformative forces of the modern era. From voice assistants "
        "to medical diagnostics, AI-powered systems are becoming deeply embedded in the fabric "
        "of everyday life.\n\n"
        "The acceleration has been driven by advances in large language models, increased "
        "computational power, and the availability of vast datasets. Companies across sectors "
        "are deploying AI solutions to streamline operations, enhance customer experiences, and "
        "unlock new revenue streams.\n\n"
        '"We are witnessing a paradigm shift," said Dr. Sarah Chen, director of AI research at '
        'Stanford University. "The tools we are building today will redefine every industry '
        'within the next decade."\n\n'
        "Experts predict that within the next decade, AI will be as ubiquitous as the internet "
        "itself, fundamentally altering education, healthcare, transportation, and creative industries."
    ),
    category="Technology",
)


async def generate_article(topic: str) -> ArticleResponse:
    """
    Generate an article from a topic brief using Groq.

    Falls back to a mock response when GROQ_API_KEY is not set.
    """
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        logger.info("No Groq API key configured — returning mock article")
        return MOCK_RESPONSE

    try:
        client = AsyncGroq(api_key=settings.GROQ_API_KEY)

        chat = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Write a news article about: {topic}"},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=4096,
        )

        raw = chat.choices[0].message.content
        data = json.loads(raw)

        return ArticleResponse(
            title=data.get("title", "Untitled"),
            summary=data.get("summary", ""),
            content=data.get("content", ""),
            category=data.get("category", "General"),
        )

    except Exception as e:
        logger.error("Groq API call failed: %s", e)
        raise
