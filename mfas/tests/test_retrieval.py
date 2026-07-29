from src.ingestion.chunker import get_chunker
from src.memory.vector_db import get_vector_db


def search(query: str, top_k: int = 5):
    chunker = get_chunker()
    vector_db = get_vector_db()

    query_vector = chunker.embeddings.embed_query(query)

    response = vector_db.client.query_points(
        collection_name=vector_db.collection_name,
        query=query_vector,
        limit=top_k,
    )
    results = response.points

    print("\n" + "=" * 60)
    print(f"QUERY: {query}")
    print("=" * 60)

    if not results:
        print("No results found.")
        return

    for i, hit in enumerate(results, start=1):
        print(f"\n[{i}] Score: {hit.score:.4f}")
        print(f"    Source: {hit.payload.get('source')}")
        print(f"    Chunk Index: {hit.payload.get('chunk_index')}")
        print(f"    Text: {hit.payload.get('text')[:300]}...")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    search("What are the company's main risk factors?")
