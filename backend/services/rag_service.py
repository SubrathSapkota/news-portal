"""
RAG service stub.

Will handle retrieval-augmented generation when the RAG pipeline is implemented.
"""


async def retrieve_context(query: str) -> str:
    """Retrieve relevant context for a given query from the knowledge base."""
    raise NotImplementedError("RAG pipeline not yet implemented")
