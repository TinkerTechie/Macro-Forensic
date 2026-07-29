from pathlib import Path

from src.ingestion.parse_10k import get_ingestor


def main() -> None:
    pdf_path = Path("data/sample.pdf")

    print("=" * 60)
    print("MFAS - LlamaParse Smoke Test")
    print("=" * 60)
    print(f"Parsing PDF: {pdf_path}\n")

    try:
        ingestor = get_ingestor()

        markdown = ingestor.parse_pdf(pdf_path)

        output_path = Path("data/sample.md")
        output_path.write_text(markdown, encoding="utf-8")

        print("=" * 60)
        print("EXTRACTION PREVIEW")
        print("=" * 60)

        preview_length = min(1000, len(markdown))
        print(markdown[:preview_length])

        print("\n" + "=" * 60)
        print("EXTRACTION SUMMARY")
        print("=" * 60)
        print(f"Output File        : {output_path}")
        print(f"Characters Parsed  : {len(markdown):,}")
        print(f"Preview Length     : {preview_length}")
        print("=" * 60)

    except Exception as exc:
        print("\n" + "=" * 60)
        print("PARSING FAILED")
        print("=" * 60)
        print(exc)


if __name__ == "__main__":
    main()