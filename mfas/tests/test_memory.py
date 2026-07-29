from pathlib import Path

from src.ingestion.parse_10k import get_ingestor
from src.ingestion.chunker import get_chunker


def main():
    pdf_path = Path("data/apple_10k.htm")

    try:
        ingestor = get_ingestor()

        markdown = ingestor.parse_pdf(pdf_path)

        chunker = get_chunker()

        result = chunker.process_and_store(
            text=markdown,
            source_name=pdf_path,
        )

        print("\n" + "=" * 60)
        print("MFAS MEMORY PIPELINE COMPLETE")
        print("=" * 60)
        print(f"Source   : {result['source']}")
        print(f"Chunks   : {result['chunks']}")
        print(f"Vectors  : {result['vectors']}")
        print("=" * 60)

    except Exception as exc:
        print(f"\nPipeline failed:\n{exc}")


if __name__ == "__main__":
    main()