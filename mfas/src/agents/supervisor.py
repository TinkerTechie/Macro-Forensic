"""
supervisor.py

LangGraph entry node.

Routes a user's question to the correct specialist agent.

Responsibilities
----------------
- Decide routing only
- Never answer the question
- Never access Qdrant or Neo4j
"""

from __future__ import annotations

import logging
from typing import Literal

import instructor
from groq import Groq
from pydantic import BaseModel

from config.settings import GROQ_API_KEY, GROQ_MODEL
from src.agents.prompts import SUPERVISOR_PROMPT
from src.agents.state import MFASState

logger = logging.getLogger(__name__)

_client = None


def get_client():
    """
    Lazily initialize the Groq client.
    """
    global _client

    if _client is None:
        raw = Groq(api_key=GROQ_API_KEY)
        _client = instructor.from_groq(
            raw,
            mode=instructor.Mode.TOOLS,
        )

    return _client


class RoutingDecision(BaseModel):
    """
    Structured output from the Supervisor.
    """

    route: Literal[
        "graph",
        "retrieval",
        "both",
        "report",
        "unclear",
    ]

    routing_rationale: str


def run_supervisor(state: MFASState) -> MFASState:
    """
    Decide which agent should execute next.
    """

    question = state.get("question", "").strip()

    if not question:
        state.setdefault("errors", []).append(
            "Empty user question."
        )
        state["route"] = "unclear"
        state["routing_rationale"] = "Question was empty."
        return state

    try:

        decision = get_client().chat.completions.create(
            model=GROQ_MODEL,
            temperature=0,
            response_model=RoutingDecision,
            messages=[
                {
                    "role": "system",
                    "content": SUPERVISOR_PROMPT,
                },
                {
                    "role": "user",
                    "content": question,
                },
            ],
        )

        logger.info(
            "Supervisor routed '%s' -> %s",
            question,
            decision.route,
        )

        state["route"] = decision.route
        state["routing_rationale"] = (
            decision.routing_rationale
        )

    except Exception as exc:

        logger.exception(
            "Supervisor routing failed."
        )

        state.setdefault("errors", []).append(
            str(exc)
        )

        state["route"] = "unclear"
        state["routing_rationale"] = (
            "Routing failed."
        )

    return state


def route_condition(state: MFASState) -> str:
    """
    Used by LangGraph conditional edges.
    """

    return state.get(
        "route",
        "unclear",
    )