"""
LangGraph article generation agent scaffold.

This will orchestrate the multi-step article generation pipeline:
  1. Research → gather context and sources
  2. Outline → structure the article
  3. Draft   → write the full article
  4. Review  → polish and fact-check
"""

from agents.state import ArticleState


async def research_node(state: ArticleState) -> ArticleState:
    """Gather research and context for the given topic."""
    raise NotImplementedError


async def outline_node(state: ArticleState) -> ArticleState:
    """Create a structured outline from the research."""
    raise NotImplementedError


async def draft_node(state: ArticleState) -> ArticleState:
    """Write the full article draft from the outline."""
    raise NotImplementedError


async def review_node(state: ArticleState) -> ArticleState:
    """Review and refine the draft article."""
    raise NotImplementedError


def build_article_graph():
    """
    Construct and return the LangGraph StateGraph for article generation.

    Usage (when implemented):
        graph = build_article_graph()
        result = await graph.ainvoke({"topic": "AI in healthcare"})
    """
    raise NotImplementedError
