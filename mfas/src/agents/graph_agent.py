"""
graph_agent.py

Graph Explorer Agent

Responsibilities
----------------
1. Decide which Neo4j query template should answer the user's question.
2. Execute ONLY approved Cypher templates.
3. Convert Neo4j records into GraphFacts.
4. Store results inside AgentState.

The agent NEVER generates raw Cypher.
Only predefined templates from cypher_templates.py are allowed.
"""

from __future__ import annotations

import logging
from typing import Literal

import instructor
from groq import Groq
from pydantic import BaseModel, Field

from config.settings import (
    GROQ_API_KEY,
    GROQ_MODEL,
    GRAPH_AGENT_LIMIT,
    GRAPH_AGENT_MAX_HOPS,
)

from src.agents.prompts import GRAPH_AGENT_PROMPT
from src.agents.state import (
    AgentState,
    GraphFact,
)

from src.graph import cypher_templates as ct
from src.graph.graph_db import get_graph_db

logger = logging.getLogger(__name__)


# ============================================================
# LLM Client
# ============================================================

_client = instructor.from_groq(
    Groq(api_key=GROQ_API_KEY),
    mode=instructor.Mode.TOOLS,
)


# ============================================================
# Structured Planning Schema
# ============================================================

class GraphQueryPlan(BaseModel):
    """
    LLM decides WHICH approved query to execute.
    """

    template: Literal[
        "FIND_CONTAGION_PATHS",
        "FIND_ALL_CONTAGION_PATHS",
        "NONE",
    ]

    origin_name: str | None = Field(
        default=None,
        description="Company name for FIND_CONTAGION_PATHS.",
    )

    max_hops: int = Field(
        default=GRAPH_AGENT_MAX_HOPS,
        ge=1,
        le=6,
    )

    limit: int = Field(
        default=GRAPH_AGENT_LIMIT,
        ge=1,
        le=100,
    )

    rationale: str


# ============================================================
# Planning
# ============================================================

def _plan_query(question: str) -> GraphQueryPlan:
    """
    Ask the LLM which approved query template should be executed.
    """

    return _client.chat.completions.create(
        model=GROQ_MODEL,
        response_model=GraphQueryPlan,
        temperature=0,
        messages=[
            {
                "role": "system",
                "content": GRAPH_AGENT_PROMPT,
            },
            {
                "role": "user",
                "content": question,
            },
        ],
    )


# ============================================================
# Query Execution
# ============================================================

def _execute_plan(plan: GraphQueryPlan):
    """
    Convert the LLM plan into an approved Cypher query.
    """

    if plan.template == "FIND_CONTAGION_PATHS":

        if not plan.origin_name:
            raise ValueError(
                "Origin company missing."
            )

        query = ct.FIND_CONTAGION_PATHS.format(
            max_hops=plan.max_hops
        )

        params = {
            "origin_name": plan.origin_name,
        }

    elif plan.template == "FIND_ALL_CONTAGION_PATHS":

        query = ct.FIND_ALL_CONTAGION_PATHS.format(
            max_hops=plan.max_hops
        )

        params = {
            "limit": plan.limit,
        }

    else:

        return [], "NONE"

    db = get_graph_db()

    records = db.execute_read(
        query,
        params,
    )

    return records, plan.template


# ============================================================
# Neo4j -> GraphFacts
# ============================================================

def _convert_records(
    records: list[dict],
    template: str,
) -> list[GraphFact]:

    facts: list[GraphFact] = []

    for record in records:

        facts.append(
            GraphFact(
                entity_chain=record.get(
                    "entity_chain",
                    [],
                ),
                relationship_type="contagion_path",
                instrument_type=record.get(
                    "instrument_type",
                ),
                exposure_amount=record.get(
                    "exposure_amount",
                ),
                source_query=template,
            )
        )

    return facts


# ============================================================
# Public Entry Point
# ============================================================

def run_graph_agent(
    state: AgentState,
) -> AgentState:

    question = state["question"]

    logger.info(
        "Graph Agent received question: %s",
        question,
    )

    try:

        plan = _plan_query(question)

        logger.info(
            "Selected template=%s rationale=%s",
            plan.template,
            plan.rationale,
        )

        if plan.template == "NONE":

            state["graph_facts"] = []
            state["cypher_used"] = []

            state.setdefault(
                "errors",
                [],
            ).append(
                "No graph query template matched."
            )

            return state

        records, template = _execute_plan(
            plan
        )

        facts = _convert_records(
            records,
            template,
        )

        state["graph_facts"] = facts

        # Store template name instead of raw Cypher
        state["cypher_used"] = [
            template
        ]

        logger.info(
            "Retrieved %d graph facts.",
            len(facts),
        )

    except Exception as exc:

        logger.exception(
            "Graph agent failed."
        )

        state.setdefault(
            "errors",
            [],
        ).append(str(exc))

        state["graph_facts"] = []

        state["cypher_used"] = []

    return state