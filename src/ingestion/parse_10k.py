from pathlib import Path
import logging

from llama_parse import LlamaParse

from config.settings import LLAMA_CLOUD_API_KEY

logger = logging.getLogger(__name__)


class DocumentIngestor:
    """
    Handles PDF ingestion using LlamaParse.

    Converts SEC filings (10-K/10-Q) into Markdown while preserving
    financial tables and document structure for downstream chunking
    and embedding.
    """

    def __init__(self) -> None:
        """Initialize the LlamaParse client."""

        if not LLAMA_CLOUD_API_KEY:
            raise ValueError(
                "LLAMA_CLOUD_API_KEY is missing. "
                "Please configure it in your .env file."
            )

        self.parser = LlamaParse(
            api_key=LLAMA_CLOUD_API_KEY,
            result_type="markdown",
            language="en",
            num_workers=4,
            verbose=True,
        )

    def parse_pdf(self, file_path: str | Path) -> str:
        """
        Parse a PDF and return its contents as a single Markdown string.

        Args:
            file_path: Path to the PDF.

        Returns:
            A Markdown representation of the document.

        Raises:
            FileNotFoundError:
                If the PDF does not exist.

            RuntimeError:
                If parsing fails.

            ValueError:
                If no text was extracted.
        """

        pdf_path = Path(file_path)

        if not pdf_path.exists():
            raise FileNotFoundError(f"PDF not found: {pdf_path}")

        logger.info("Starting ingestion of %s", pdf_path)

        try:
            documents = self.parser.load_data(str(pdf_path))
        except Exception as exc:
            logger.exception("LlamaParse failed.")
            raise RuntimeError(
                f"Failed to parse PDF: {pdf_path}"
            ) from exc

        if not documents:
            raise ValueError("LlamaParse returned no documents.")

        markdown = "\n\n".join(
            doc.text
            for doc in documents
            if doc.text and doc.text.strip()
        )

        if not markdown.strip():
            raise ValueError("Document was parsed but no text was extracted.")

        logger.info(
            "Extraction complete (%d characters).",
            len(markdown),
        )

        return markdown


# ------------------------------------------------------------------
# Lazy singleton
# ------------------------------------------------------------------

_ingestor: DocumentIngestor | None = None


def get_ingestor() -> DocumentIngestor:
    """
    Return a lazily initialized DocumentIngestor singleton.

    The parser is only created when first needed, preventing
    import-time failures if configuration is incomplete.
    """

    global _ingestor

    if _ingestor is None:
        _ingestor = DocumentIngestor()

    return _ingestor