"""
retrieval_agent.py

Temporal Retrieval Agent.

Searches the Qdrant vector database for filing chunks relevant to the
user's question.

This agent does NOT perform reasoning or summarization.
It only retrieves evidence.
"""

from __future__ import annotations

import logging

from src.agents.state import MFASState, RetrievedChunk
from src.ingestion.chunker import get_chunker
from src.memory.vector_db import get_vector_db
from config.settings import TOP_K
logger = logging.getLogger(__name__)




def run_retrieval_agent(state: MFASState) -> MFASState:
    """
    Retrieve relevant filing chunks from Qdrant.
    """

    question = state.get("question", "").strip()

    if not question:
        state.setdefault("errors", []).append(
            "Retrieval agent received an empty question."
        )
        state["retrieved_chunks"] = []
        return state

    try:

        chunker = get_chunker()
        vector_db = get_vector_db()

        query_vector = chunker.embeddings.embed_query(
            question
        )

        response = vector_db.client.query_points(
            collection_name=vector_db.collection_name,
            query=query_vector,
            limit=TOP_K,
        )

        retrieved = []

        for point in response.points:

            payload = point.payload or {}

            retrieved.append(
                RetrievedChunk(
                    text=payload.get("text", ""),
                    source_document=payload.get(
                        "source",
                        "unknown",
                    ),
                    score=float(point.score),
                    chunk_id=str(point.id),
                )
            )

        logger.info(
            "Retrieved %d chunks.",
            len(retrieved),
        )

        state["retrieved_chunks"] = retrieved

    except Exception as exc:

        logger.exception(
            "Retrieval agent failed."
        )

        state.setdefault("errors", []).append(
            str(exc)
        )

        state["retrieved_chunks"] = []

    return state