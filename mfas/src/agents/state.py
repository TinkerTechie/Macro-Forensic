"""
state.py

Shared state object passed between every node in the MFAS LangGraph workflow.

Every agent reads from and writes to this single state object.

Pipeline:

User
   ↓
Supervisor
   ↓
Retriever ──┐
            │
Graph Agent ├──► Risk Agent ───► Report Agent
            │
            └──────────────────────────────►

The state should remain:
- Flat
- Serializable
- Free of database connections or LLM clients
"""

from __future__ import annotations

from typing import Any, Literal, Optional, TypedDict, Annotated

from langgraph.graph.message import add_messages


# ==============================================================================
# Vector Search Result
# ==============================================================================


class RetrievedChunk(TypedDict):
    """
    One chunk retrieved from Qdrant.
    """

    text: str
    source_document: str
    score: float
    chunk_id: Optional[str]


# ==============================================================================
# Graph Search Result
# ==============================================================================


class GraphFact(TypedDict):
    """
    One graph fact returned from Neo4j.
    """

    entity_chain: list[str]

    relationship_type: str

    instrument_type: Optional[str]

    exposure_amount: Optional[float]

    source_query: str


# ==============================================================================
# Shared Workflow State
# ==============================================================================


class MFASState(TypedDict, total=False):
    """
    Shared state flowing through the LangGraph workflow.

    Every node reads this object,
    updates only its own section,
    and returns the updated state.
    """

    # ------------------------------------------------------------------
    # User Input
    # ------------------------------------------------------------------

    question: str

    messages: Annotated[list, add_messages]

    # ------------------------------------------------------------------
    # Supervisor
    # ------------------------------------------------------------------

    route: Literal[
        "graph",
        "retrieval",
        "both",
        "report",
        "unclear",
    ]

    routing_rationale: str

    # ------------------------------------------------------------------
    # Vector Memory (Qdrant)
    # ------------------------------------------------------------------

    retrieved_chunks: list[RetrievedChunk]

    # ------------------------------------------------------------------
    # Graph Memory (Neo4j)
    # ------------------------------------------------------------------

    graph_results: list[GraphFact]

    cypher_used: list[str]

    # ------------------------------------------------------------------
    # Structured Extraction
    # ------------------------------------------------------------------

    extracted_entities: list[dict[str, Any]]

    # ------------------------------------------------------------------
    # Risk Analysis
    # ------------------------------------------------------------------

    risk_level: Literal[
        "low",
        "medium",
        "high",
        "critical",
        "unknown",
    ]

    confidence: float

    risk_narrative: str

    cited_facts: list[str]

    # ------------------------------------------------------------------
    # Final Report
    # ------------------------------------------------------------------

    final_answer: str

    # ------------------------------------------------------------------
    # Errors
    # ------------------------------------------------------------------

    errors: list[str]

    # ------------------------------------------------------------------
    # Metadata
    # ------------------------------------------------------------------

    metadata: dict[str, Any]

AgentState = MFASState