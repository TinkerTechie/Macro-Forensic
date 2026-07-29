import logging
import uuid
from pathlib import Path

from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client.models import PointStruct

from config.settings import EMBEDDING_MODEL_NAME
from src.memory.vector_db import get_vector_db

logger = logging.getLogger(__name__)

NAMESPACE = uuid.UUID("12345678-1234-5678-1234-567812345678")
def make_point_id(source_name: str, chunk_index: int) -> str:
    """Generate a deterministic UUID from source + chunk index."""
    key = f"{source_name}:{chunk_index}"
    return str(uuid.uuid5(NAMESPACE, key))
class TextChunker:
    """
    Splits parsed documents into overlapping chunks,
    generates embeddings, and stores them in Qdrant.
    """

    def __init__(self) -> None:
        logger.info(
            "Loading embedding model '%s'...",
            EMBEDDING_MODEL_NAME,
        )

        self.embeddings = HuggingFaceEmbeddings(
            model_name=EMBEDDING_MODEL_NAME
        )

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=[
                "\n\n",
                "\n",
                " ",
                "",
            ],
        )

        logger.info("Embedding model loaded successfully.")

    def process_and_store(
        self,
        text: str,
        source_name: str | Path,
    ) -> dict:
        """
        Split text, generate embeddings,
        and store them in Qdrant.

        Returns:
            Dictionary containing ingestion statistics.
        """

        if not text or not text.strip():
            raise ValueError("Input text is empty.")

        logger.info("Chunking document '%s'...", source_name)

        chunks = self.splitter.split_text(text)

        if not chunks:
            raise ValueError("No chunks were generated.")

        logger.info(
            "Generated %d chunks.",
            len(chunks),
        )

        try:
            vectors = self.embeddings.embed_documents(chunks)
        except Exception as exc:
            logger.exception("Embedding generation failed.")
            raise RuntimeError(
                "Failed to generate embeddings."
            ) from exc

        if len(chunks) != len(vectors):
            raise RuntimeError(
                "Mismatch between chunks and embeddings."
            )

        points = []

        for index, (chunk, vector) in enumerate(zip(chunks, vectors)):
            points.append(
                PointStruct(
                    id=make_point_id(str(source_name), index),
                    vector=vector,
                    payload={
                        "text": chunk,
                        "source": str(source_name),
                        "chunk_index": index,
                    },
                )
            )

        logger.info(
            "Storing %d vectors in Qdrant...",
            len(points),
        )

        try:
            vector_db = get_vector_db()
            vector_db.insert_chunks(points)
        except Exception as exc:
            logger.exception("Failed to store vectors.")
            raise RuntimeError(
                "Failed to store embeddings in Qdrant."
            ) from exc

        logger.info("Successfully stored all vectors.")

        return {
            "source": str(source_name),
            "chunks": len(chunks),
            "vectors": len(vectors),

            # Needed by the Graph Builder
            "chunk_texts": chunks,

            # Useful metadata for future processing
    "chunk_metadata": [
        {
            "chunk_index": i,
            "source": str(source_name),
        }
        for i in range(len(chunks))
    ],
}


# ------------------------------------------------------------
# Lazy Singleton
# ------------------------------------------------------------

_chunker: TextChunker | None = None


def get_chunker() -> TextChunker:
    """
    Return a lazily initialized TextChunker singleton.
    """

    global _chunker

    if _chunker is None:
        _chunker = TextChunker()

    return _chunker