"""
risk_agent.py

Risk Assessment Agent

Responsibilities
----------------
1. Interpret graph facts retrieved from Neo4j.
2. Optionally use supporting filing text from Qdrant.
3. Produce a grounded risk narrative.
4. Never invent evidence.
5. Every statement must be traceable to retrieved facts.

This agent NEVER queries databases directly.
It only reasons over evidence already stored inside AgentState.
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
)

from src.agents.prompts import RISK_AGENT_PROMPT
from src.agents.state import AgentState

logger = logging.getLogger(__name__)


# ============================================================
# LLM Client
# ============================================================

_client = instructor.from_groq(
    Groq(api_key=GROQ_API_KEY),
    mode=instructor.Mode.TOOLS,
)


# ============================================================
# Structured Output
# ============================================================

class RiskAssessment(BaseModel):
    """
    Structured output returned by the Risk Agent.
    """

    risk_narrative: str

    risk_level: Literal[
        "low",
        "medium",
        "high",
        "unknown",
    ]

    cited_facts: list[str] = Field(
        default_factory=list,
        description=(
            "Facts that directly support the narrative."
        ),
    )


# ============================================================
# Prompt Construction
# ============================================================

def _build_graph_section(state: AgentState) -> str:

    facts = state.get("graph_facts", [])

    if not facts:
        return "(none)"

    lines = []

    for fact in facts:

        lines.append(
            (
                f"- chain={fact['entity_chain']} | "
                f"instrument={fact['instrument_type']} | "
                f"amount={fact['exposure_amount']} | "
                f"query={fact['source_query']}"
            )
        )

    return "\n".join(lines)


def _build_text_section(state: AgentState) -> str:

    chunks = state.get("text_chunks", [])

    if not chunks:
        return "(none)"

    lines = []

    for chunk in chunks:

        lines.append(
            (
                f"- [{chunk['source_document']}] "
                f"{chunk['text'][:300]}"
            )
        )

    return "\n".join(lines)


def _build_prompt(state: AgentState) -> str:

    return (
        f"Question:\n"
        f"{state['question']}\n\n"

        f"Graph Facts:\n"
        f"{_build_graph_section(state)}\n\n"

        f"Supporting Filing Text:\n"
        f"{_build_text_section(state)}"
    )


# ============================================================
# LLM Call
# ============================================================

def _assess_risk(prompt: str) -> RiskAssessment:

    return _client.chat.completions.create(
        model=GROQ_MODEL,
        temperature=0,
        response_model=RiskAssessment,
        messages=[
            {
                "role": "system",
                "content": RISK_AGENT_PROMPT,
            },
            {
                "role": "user",
                "content": prompt,
            },
        ],
    )


# ============================================================
# Public Node
# ============================================================

def run_risk_agent(
    state: AgentState,
) -> AgentState:

    logger.info("Running Risk Agent")

    if not state.get("graph_facts"):

        logger.info(
            "No graph facts available."
        )

        state["risk_narrative"] = (
            "No supporting graph evidence was retrieved."
        )

        state["risk_level"] = "unknown"

        state["cited_facts"] = []

        return state

    try:

        prompt = _build_prompt(state)

        assessment = _assess_risk(prompt)

        state["risk_narrative"] = (
            assessment.risk_narrative
        )

        state["risk_level"] = (
            assessment.risk_level
        )

        state["cited_facts"] = (
            assessment.cited_facts
        )

        logger.info(
            "Risk assessment completed (%s).",
            assessment.risk_level,
        )

    except Exception as exc:

        logger.exception(
            "Risk Agent failed."
        )

        state.setdefault(
            "errors",
            [],
        ).append(str(exc))

        state["risk_narrative"] = (
            "Unable to generate a risk assessment."
        )

        state["risk_level"] = "unknown"

        state["cited_facts"] = []

    return state