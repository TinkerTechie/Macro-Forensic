"""
MFAS End-to-End Pipeline

Coordinates every subsystem.

PDF
 ↓
Parser
 ↓
Chunker
 ↓
Qdrant
 ↓
Entity Extraction
 ↓
Neo4j
 ↓
LangGraph
 ↓
Answer
"""

from __future__ import annotations

import logging
from pathlib import Path

from src.ingestion.parse_10k import get_ingestor
from src.ingestion.chunker import get_chunker

from src.graph.entity_extractor import EntityExtractor
from src.graph.graph_builder import GraphBuilder

from src.agents.workflow import workflow

logger = logging.getLogger(__name__)


class MFASPipeline:

    def __init__(self):

        self.ingestor = get_ingestor()
        self.chunker = get_chunker()

        self.extractor = EntityExtractor()
        self.graph_builder = GraphBuilder()

    # ----------------------------------------------------------
    # INGEST
    # ----------------------------------------------------------

    def ingest(
        self,
        pdf_path: str | Path,
    ):

        pdf_path = Path(pdf_path)

        logger.info("Starting ingestion for %s", pdf_path)

        markdown = self.ingestor.parse_pdf(pdf_path)

        chunk_result = self.chunker.process_and_store(
            markdown,
            pdf_path.name,
        )

        self.graph_builder.ensure_constraints()

        for index, chunk in enumerate(chunk_result["chunk_texts"]):

            extraction = self.extractor.extract(
                chunk_text=chunk,
                source_doc_id=pdf_path.stem,
                source_chunk_id=f"{pdf_path.stem}_{index}",
            )

            self.graph_builder.ingest_extraction(
                extraction
            )

        logger.info("Finished ingesting %s", pdf_path.name)

        return chunk_result

    # ----------------------------------------------------------
    # ASK
    # ----------------------------------------------------------

    def ask(
        self,
        question: str,
    ) -> str:

        result = workflow.invoke(
            {
                "question": question,
            }
        )

        return result["final_answer"]

    def ask_stream(
        self,
        question: str,
    ):
        """
        Yields JSON strings of the execution state for SSE streaming.
        """
        import json
        
        # We use stream_mode="updates" to get state changes after each node
        for event in workflow.stream({"question": question}, stream_mode="updates"):
            for node_name, state_update in event.items():
                
                # Determine the message/content to display for this node
                content = ""
                confidence = None
                
                if node_name == "supervisor":
                    content = f"Routing question. Determined route: {state_update.get('route', 'unknown')}"
                elif node_name == "graph_agent":
                    content = "Traversed Knowledge Graph for relevant entities."
                elif node_name == "retrieval_agent":
                    content = f"Retrieved relevant documents from Vector DB."
                elif node_name == "risk_agent":
                    content = "Analyzed evidence for risk factors and contradictions."
                elif node_name == "report_agent":
                    content = "Compiled final validation and report."
                    confidence = state_update.get("confidence")

                yield json.dumps({
                    "event": "agent_update",
                    "agent": node_name,
                    "content": content,
                    "confidence": confidence,
                    "final_answer": state_update.get("final_answer")
                }) + "\n\n"