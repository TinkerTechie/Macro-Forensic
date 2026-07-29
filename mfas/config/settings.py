import os
from dotenv import load_dotenv

load_dotenv()
TOP_K = int(os.getenv("TOP_K", "5"))
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
LLAMA_CLOUD_API_KEY = os.getenv("LLAMA_CLOUD_API_KEY")

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")

QDRANT_URL = os.getenv("QDRANT_URL", "http://localhost:6333")
VECTOR_COLLECTION_NAME = "mfas_10k_chunks"
EMBEDDING_DIMENSIONS = 384 
# config/settings.py
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

GROQ_MODEL = "llama-3.3-70b-versatile"
GRAPH_AGENT_MAX_HOPS = 3
GRAPH_AGENT_LIMIT = 25