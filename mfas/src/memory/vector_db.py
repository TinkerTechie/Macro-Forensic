"""
vector_db.py

Qdrant Vector Database Manager

Responsibilities
----------------
• Create collection
• Insert vectors
• Semantic search
• Delete collection
• Collection statistics
"""

from __future__ import annotations

import logging

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
)

from langchain_huggingface import HuggingFaceEmbeddings

from config.settings import (
    QDRANT_URL,
    VECTOR_COLLECTION_NAME,
    EMBEDDING_DIMENSIONS,
    EMBEDDING_MODEL_NAME,
)

logger = logging.getLogger(__name__)


class VectorDatabaseManager:
    """
    Wrapper around Qdrant.

    Handles:
    • Collection creation
    • Embedding generation
    • Vector insertion
    • Semantic search
    """

    def __init__(self):

        logger.info("Connecting to Qdrant...")

        self.client = QdrantClient(
            url=QDRANT_URL,
            check_compatibility=False,
        )

        self.collection_name = VECTOR_COLLECTION_NAME

        self.embedding_model = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME
        )

        self.dimensions = EMBEDDING_DIMENSIONS or 384

        self._ensure_collection()

    # ==========================================================
    # Collection
    # ==========================================================

    def _ensure_collection(self):

        collections = self.client.get_collections().collections

        names = [c.name for c in collections]

        if self.collection_name not in names:

            logger.info(
                "Creating collection '%s'...",
                self.collection_name,
            )

            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.dimensions,
                    distance=Distance.COSINE,
                ),
            )

            logger.info("Collection created.")

        else:
            logger.info(
                "Collection '%s' already exists.",
                self.collection_name,
            )

    # ==========================================================
    # Insert
    # ==========================================================

    def insert_chunks(
        self,
        points: list[PointStruct],
    ):

        logger.info(
            "Uploading %d vectors...",
            len(points),
        )

        self.client.upsert(
            collection_name=self.collection_name,
            wait=True,
            points=points,
        )

        logger.info("Upload complete.")

    # ==========================================================
    # Search
    # ==========================================================

    def search(
        self,
        query: str,
        top_k: int = 5,
    ) -> list[dict]:

        logger.info(
            "Searching Qdrant for '%s'",
            query,
        )

        query_vector = self.embedding_model.embed_query(query)

        response = self.client.query_points(
            collection_name=self.collection_name,
            query=query_vector,
            limit=top_k,
            with_payload=True,
        )

        output = []

        # Qdrant >=1.18 returns QueryResponse
        points = getattr(response, "points", None)

        # Older SDK fallback
        if points is None:
            points = getattr(response, "result", [])

        for point in points:

            payload = point.payload or {}

            output.append(
                {
                    "text": payload.get(
                        "text",
                        "",
                    ),
                    "source_document": payload.get(
                        "source",
                        "unknown",
                    ),
                    "chunk_index": payload.get(
                        "chunk_index",
                    ),
                    "score": point.score,
                }
            )

        logger.info(
            "Retrieved %d chunks.",
            len(output),
        )

        return output

    # ==========================================================
    # Utilities
    # ==========================================================

    def collection_info(self):

        return self.client.get_collection(
            self.collection_name
        )

    def delete_collection(self):

        logger.warning(
            "Deleting collection '%s'",
            self.collection_name,
        )

        self.client.delete_collection(
            self.collection_name
        )


# ==========================================================
# Singleton
# ==========================================================

_vector_db: VectorDatabaseManager | None = None


def get_vector_db() -> VectorDatabaseManager:

    global _vector_db

    if _vector_db is None:
        _vector_db = VectorDatabaseManager()

    return _vector_db