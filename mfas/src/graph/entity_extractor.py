"""
entity_extractor.py

Phase 3 - Knowledge Graph Entity Extraction

Uses:
- Groq
- Instructor
- Pydantic

Input:
    Raw markdown chunk

Output:
    ExtractionResult
"""

from __future__ import annotations

import hashlib
import logging
from typing import Optional

import instructor
from groq import Groq

from config.settings import GROQ_API_KEY
from src.graph.schemas import ExtractionResult

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """
You are a senior forensic financial analyst.

Extract structured information from SEC 10-K / 10-Q filings.

Extract ONLY information explicitly stated.

Return ONLY structured data matching the supplied schema.

Extract:

1. Companies
   - Parent
   - Subsidiary
   - Affiliate
   - Shell entity

2. Ownership relationships
   - OWNS
   - CONTROLS
   - GUARANTEES
   - CONSOLIDATES

3. Debt obligations
   - Instrument
   - Amount
   - Maturity
   - Entity responsible

Rules:

- Never invent entities.
- Never infer ownership percentages.
- Never infer debt amounts.
- Use null if unknown.
- Evidence snippets must be short (<40 words).
- Mark newly formed entities when explicitly stated.
- contains_contagion_signal=True only if BOTH
  ownership/control and debt appear together.
"""


class EntityExtractor:
    """
    Converts one markdown chunk into an ExtractionResult.
    """

    def __init__(
        self,
        model: str = "llama-3.3-70b-versatile",
        temperature: float = 0.0,
        max_retries: int = 2,
    ):

        self.model = model
        self.temperature = temperature
        self.max_retries = max_retries

        raw_client = Groq(
            api_key=GROQ_API_KEY,
        )

        self.client = instructor.from_groq(
            raw_client,
            mode=instructor.Mode.TOOLS,
        )

        logger.info(
            "EntityExtractor initialized using model %s",
            self.model,
        )

    def extract(
        self,
        chunk_text: str,
        source_doc_id: str,
        source_chunk_id: Optional[str] = None,
    ) -> ExtractionResult:

        if not chunk_text.strip():
            raise ValueError("Empty chunk supplied.")

        chunk_id = (
            source_chunk_id
            or self._chunk_id(chunk_text)
        )

        logger.info(
            "Extracting entities from chunk %s",
            chunk_id,
        )

        try:

            result: ExtractionResult = (
                self.client.chat.completions.create(
                    model=self.model,
                    temperature=self.temperature,
                    max_completion_tokens=2048,
                    response_model=ExtractionResult,
                    messages=[
                        {
                            "role": "system",
                            "content": SYSTEM_PROMPT,
                        },
                        {
                            "role": "user",
                            "content": chunk_text,
                        },
                    ],
                )
            )

        except Exception as exc:

            logger.exception(
                "Extraction failed for chunk %s",
                chunk_id,
            )

            result = ExtractionResult()

        result.source_doc_id = source_doc_id
        result.source_chunk_id = chunk_id

        logger.info(
            "Companies=%d | Ownership=%d | Debt=%d",
            len(result.companies),
            len(result.ownership_relationships),
            len(result.debt_links),
        )

        return result

    def extract_batch(
        self,
        chunks: list[dict],
    ) -> list[ExtractionResult]:

        results = []

        for chunk in chunks:

            results.append(
                self.extract(
                    chunk_text=chunk["text"],
                    source_doc_id=chunk.get(
                        "doc_id",
                        "unknown",
                    ),
                    source_chunk_id=chunk.get(
                        "chunk_id",
                    ),
                )
            )

        return results

    @staticmethod
    def _chunk_id(
        text: str,
    ) -> str:

        return hashlib.sha256(
            text.encode("utf-8")
        ).hexdigest()[:16]


if __name__ == "__main__":

    logging.basicConfig(level=logging.INFO)

    sample = """
    Apple Inc. owns 100% of Apple Operations International.

    Apple Operations International issued
    $500 million of senior secured notes
    due in 2028.

    Apple Inc. guarantees the debt.
    """

    extractor = EntityExtractor()

    result = extractor.extract(
        chunk_text=sample,
        source_doc_id="APPLE_TEST",
    )

    print(result.model_dump_json(indent=2))