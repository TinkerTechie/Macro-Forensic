"""
report_agent.py

Final Report Agent

Responsibilities
----------------
1. Combine outputs from every previous agent.
2. Produce the final user-facing response.
3. Clearly separate:
   - Graph findings
   - Retrieved filing text
   - Risk narrative
4. Never invent evidence.
"""

from __future__ import annotations

import logging

import instructor
from groq import Groq

from config.settings import (
    GROQ_API_KEY,
    GROQ_MODEL,
)

from src.agents.prompts import REPORT_AGENT_PROMPT
from src.agents.state import AgentState

logger = logging.getLogger(__name__)


# ============================================================
# LLM Client
# ============================================================

_client = Groq(api_key=GROQ_API_KEY)


# ============================================================
# Prompt Builder
# ============================================================

def _build_prompt(state: AgentState) -> str:

    graph_section = []

    for fact in state.get("graph_facts", []):

        graph_section.append(
            f"""
Entity Chain:
{" → ".join(fact["entity_chain"])}

Instrument:
{fact["instrument_type"]}

Exposure:
{fact["exposure_amount"]}

Source:
{fact["source_query"]}
"""
        )

    retrieval_section = []

    for chunk in state.get("text_chunks", []):

        retrieval_section.append(
            f"""
Document:
{chunk["source_document"]}

Similarity:
{chunk["score"]:.3f}

Text:
{chunk["text"]}
"""
        )

    return f"""
User Question

{state["question"]}


Graph Findings

{chr(10).join(graph_section) if graph_section else "(none)"}


Supporting Filing Text

{chr(10).join(retrieval_section) if retrieval_section else "(none)"}


Risk Narrative

{state.get("risk_narrative","(none)")}

Risk Level

{state.get("risk_level","unknown")}
"""


# ============================================================
# Public Node
# ============================================================

def run_report_agent(
    state: AgentState,
) -> AgentState:

    logger.info("Running Report Agent")

    try:

        prompt = _build_prompt(state)

        completion = _client.chat.completions.create(
            model=GROQ_MODEL,
            temperature=0,
            messages=[
                {
                    "role": "system",
                    "content": REPORT_AGENT_PROMPT,
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
        )

        state["final_answer"] = (
            completion.choices[0]
            .message.content
        )

        logger.info(
            "Report generated successfully."
        )

    except Exception as exc:

        logger.exception(
            "Report Agent failed."
        )

        state.setdefault(
            "errors",
            [],
        ).append(str(exc))

        state["final_answer"] = (
            "Unable to generate the final report."
        )

    return state