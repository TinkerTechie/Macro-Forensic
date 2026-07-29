import os
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from config.settings import QDRANT_URL, VECTOR_COLLECTION_NAME, EMBEDDING_DIMENSIONS

class VectorDatabaseManager:
    def __init__(self):
        print(f"Connecting to Qdrant at {QDRANT_URL}...")
        self.client = QdrantClient(url=QDRANT_URL)
        self.collection_name = VECTOR_COLLECTION_NAME
        # Safeguard: Force 384 dimensions for HuggingFace local models
        self.dimensions = EMBEDDING_DIMENSIONS if EMBEDDING_DIMENSIONS else 384
        self._ensure_collection_exists()

    def _ensure_collection_exists(self):
        """Creates the collection if it doesn't exist, using the correct dimensions."""
        try:
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if self.collection_name not in collection_names:
                print(f"Creating Qdrant collection '{self.collection_name}' with {self.dimensions} dimensions...")
                self.client.create_collection(
                    collection_name=self.collection_name,
                    vectors_config=VectorParams(
                        size=self.dimensions, 
                        distance=Distance.COSINE
                    )
                )
                print("Collection created successfully.")
            else:
                print(f"Qdrant collection '{self.collection_name}' already exists.")
        except Exception as e:
            print(f"Failed to initialize Qdrant collection: {e}")

    def insert_chunks(self, points):
        """Inserts list of PointStruct points into Qdrant."""
        try:
            self.client.upsert(
                collection_name=self.collection_name,
                wait=True,
                points=points
            )
        except Exception as e:
            print(f"Failed to insert vectors into Qdrant: {e}")
            raise e

# Support both import styles
vector_db = VectorDatabaseManager()

def get_vector_db():
    return vector_db
