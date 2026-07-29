"""
workflow.py

MFAS LangGraph Workflow

This module connects every AI agent into a single execution graph.

Workflow

    User Question
          │
          ▼
     Supervisor
      /   |    \
 Graph Retrieval Unclear
      \   /
       ▼ ▼
     Risk Agent
          │
          ▼
    Report Agent
          │
          ▼
         END
"""

from __future__ import annotations

import logging

from langgraph.graph import END, StateGraph
from langgraph.graph.state import CompiledStateGraph

from src.agents.graph_agent import run_graph_agent
from src.agents.report_agent import run_report_agent
from src.agents.retrieval_agent import run_retrieval_agent
from src.agents.risk_agent import run_risk_agent
from src.agents.state import AgentState
from src.agents.supervisor import (
    route_condition,
    run_supervisor,
)

logger = logging.getLogger(__name__)


# ============================================================
# Routing
# ============================================================

def graph_route(state: AgentState) -> str:
    """
    Decide what happens after Graph Agent.
    """

    if state.get("route") == "both":
        return "retrieval_agent"

    return "risk_agent"


# ============================================================
# Workflow Builder
# ============================================================

def build_workflow() -> CompiledStateGraph:
    """
    Build and compile the MFAS LangGraph workflow.
    """

    logger.info("Building LangGraph workflow...")

    workflow = StateGraph(AgentState)

    # --------------------------------------------------------
    # Nodes
    # --------------------------------------------------------

    workflow.add_node(
        "supervisor",
        run_supervisor,
    )

    workflow.add_node(
        "graph_agent",
        run_graph_agent,
    )

    workflow.add_node(
        "retrieval_agent",
        run_retrieval_agent,
    )

    workflow.add_node(
        "risk_agent",
        run_risk_agent,
    )

    workflow.add_node(
        "report_agent",
        run_report_agent,
    )

    # --------------------------------------------------------
    # Entry
    # --------------------------------------------------------

    workflow.set_entry_point(
        "supervisor",
    )

    # --------------------------------------------------------
    # Supervisor Routing
    # --------------------------------------------------------

    workflow.add_conditional_edges(
        "supervisor",
        route_condition,
        {
            "graph": "graph_agent",
            "retrieval": "retrieval_agent",
            "both": "graph_agent",
            "unclear": "report_agent",
        },
    )

    # --------------------------------------------------------
    # Graph Routing
    # --------------------------------------------------------

    workflow.add_conditional_edges(
        "graph_agent",
        graph_route,
        {
            "retrieval_agent": "retrieval_agent",
            "risk_agent": "risk_agent",
        },
    )

    # --------------------------------------------------------
    # Fixed Edges
    # --------------------------------------------------------

    workflow.add_edge(
        "retrieval_agent",
        "risk_agent",
    )

    workflow.add_edge(
        "risk_agent",
        "report_agent",
    )

    workflow.add_edge(
        "report_agent",
        END,
    )

    logger.info("Workflow compiled successfully.")

    return workflow.compile()


# ============================================================
# Singleton Workflow
# ============================================================

workflow = build_workflow()


# ============================================================
# Local Test
# ============================================================

if __name__ == "__main__":

    logging.basicConfig(level=logging.INFO)

    result = workflow.invoke(
        {
            "question":
            "Does Apple have debt exposure through subsidiaries?"
        }
    )

    print("\n")
    print("=" * 80)
    print(result["final_answer"])
    print("=" * 80)