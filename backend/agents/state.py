"""
LangGraph state definitions for the article generation pipeline.

Defines the shared state that flows through agent nodes.
"""

from typing import TypedDict


class ArticleState(TypedDict, total=False):
    topic: str
    research: str
    outline: str
    draft: str
    final_article: str
    category: str
    status: str
