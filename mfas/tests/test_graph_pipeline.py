"""
test_graph_pipeline.py

End-to-end integration test for the Knowledge Graph pipeline.

Flow:
Raw Text
    ↓
EntityExtractor (Groq)
    ↓
ExtractionResult (Pydantic)
    ↓
GraphBuilder
    ↓
Neo4j
"""

import logging
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))
from src.graph.entity_extractor import EntityExtractor
from src.graph.graph_builder import GraphBuilder

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def run_integration_test():

    print("\n" + "=" * 70)
    print("🚀 MFAS GRAPH PIPELINE INTEGRATION TEST")
    print("=" * 70)

    sample_text = """
    In March 2023, Meridian Holdings Inc. formed a wholly-owned subsidiary,
    Northgate Capital LLC, incorporated in Delaware.

    Meridian Holdings Inc. owns 100% of Northgate Capital LLC.

    In June 2023, Northgate Capital LLC issued
    $500 million in senior secured notes due 2028,
    guaranteed by Meridian Holdings Inc.
    """

    try:

        # -------------------------------------------------------
        # Extract entities
        # -------------------------------------------------------

        print("\n🧠 Running Entity Extraction...\n")

        extractor = EntityExtractor()

        extraction_result = extractor.extract(
            chunk_text=sample_text,
            source_doc_id="TEST-10K-001",
        )

        print("✅ Extraction Complete\n")

        print(extraction_result.model_dump_json(indent=2))

        print("\nSummary")
        print("-" * 40)
        print(f"Companies        : {len(extraction_result.companies)}")
        print(f"Ownership Edges  : {len(extraction_result.ownership_relationships)}")
        print(f"Debt Links       : {len(extraction_result.debt_links)}")
        print(f"Contagion Signal : {extraction_result.contains_contagion_signal}")

        # -------------------------------------------------------
        # Build graph
        # -------------------------------------------------------

        print("\n🌐 Building Neo4j Graph...\n")

        builder = GraphBuilder()

        builder.ensure_constraints()

        builder.ingest_extraction(extraction_result)

        print("✅ Graph successfully written to Neo4j.")

        # -------------------------------------------------------
        # Run graph query
        # -------------------------------------------------------

        print("\n🔍 Running Contagion Query...\n")

        paths = builder.find_contagion_paths(
            "Meridian Holdings Inc."
        )

        print(f"Found {len(paths)} contagion path(s).\n")

        for i, path in enumerate(paths, start=1):

            print(f"Path {i}")

            if "entity_chain" in path:
                print("Chain :", " → ".join(path["entity_chain"]))

            print("Instrument :", path.get("instrument_type"))
            print("Exposure   :", path.get("exposure_amount"))
            print()

        print("=" * 70)
        print("🎉 GRAPH PIPELINE TEST PASSED")
        print("=" * 70)

        print("\nOpen Neo4j Browser:")
        print("http://localhost:7474")

        print("\nRun:")

        print("""
MATCH (n)
RETURN n;
""")

        print("""
MATCH p=()-[]->()
RETURN p;
""")

    except Exception as exc:

        logger.exception("Integration test failed.")

        print("\n❌ GRAPH PIPELINE TEST FAILED")
        print(exc)

        raise


if __name__ == "__main__":
    run_integration_test()