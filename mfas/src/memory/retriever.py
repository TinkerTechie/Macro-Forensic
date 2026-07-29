"""
retriever.py

Thin abstraction over the vector database.

Every AI agent should use this module rather than directly
calling Qdrant.
"""

from __future__ import annotations

from src.memory.vector_db import get_vector_db


def search(
    query: str,
    top_k: int = 5,
):

    db = get_vector_db()

    return db.search(
        query=query,
        top_k=top_k,
    )