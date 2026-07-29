"""
main.py

MFAS Entry Point

Usage

    python main.py

This script demonstrates the complete MFAS pipeline:

PDF
 ↓
LlamaParse
 ↓
Chunking
 ↓
Qdrant
 ↓
Entity Extraction
 ↓
Neo4j
 ↓
LangGraph
 ↓
Final Report
"""

from __future__ import annotations

import logging
from pathlib import Path

from src.pipeline.orchestrator import MFASPipeline

logging.basicConfig(
    level=logging.INFO,
    format="%(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


def main():

    print("\n")
    print("=" * 80)
    print("MFAS - Macro Forensic Alert System")
    print("=" * 80)

    # ---------------------------------------------------------
    # Configure
    # ---------------------------------------------------------

    pdf_path = Path("data/apple_10k.pdf")

    question = (
        "Does Apple have debt exposure through subsidiaries?"
    )

    # ---------------------------------------------------------
    # Pipeline
    # ---------------------------------------------------------

    pipeline = MFASPipeline()

    # ---------------------------------------------------------
    # Ingestion
    # ---------------------------------------------------------

    print("\n📄 Ingesting document...\n")

    stats = pipeline.ingest(pdf_path)

    print("\n✅ Ingestion Complete\n")

    print("Document :", stats.get("source", "N/A"))
    print("Chunks   :", stats.get("chunks", 0))
    print("Vectors  :", stats.get("vectors", 0))

    # ---------------------------------------------------------
    # Ask Question
    # ---------------------------------------------------------

    print("\n")
    print("=" * 80)
    print("Question")
    print("=" * 80)

    print(question)

    print("\n")
    print("=" * 80)
    print("MFAS Report")
    print("=" * 80)

    answer = pipeline.ask(question)

    print(answer)

    print("\n")
    print("=" * 80)
    print("Pipeline Finished")
    print("=" * 80)


if __name__ == "__main__":
    main()