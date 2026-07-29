import logging

from src.memory.retriever import search

logging.basicConfig(level=logging.INFO)


def main():

    results = search(
        "debt exposure through subsidiaries",
        top_k=3,
    )

    print()

    for i, chunk in enumerate(results, 1):

        print("=" * 80)
        print("Result", i)
        print("Score :", chunk["score"])
        print("Source:", chunk["source_document"])
        print()
        print(chunk["text"][:600])


if __name__ == "__main__":
    main()