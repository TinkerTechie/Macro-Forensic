import os
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY="gsk_your_groq_api_key_here"
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password123")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
VECTOR_COLLECTION_NAME = "mfas_10k_chunks"
EMBEDDING_DIMENSIONS = 384 
# config/settings.py
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"