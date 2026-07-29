"""
graph_builder.py

Converts extracted entities into Neo4j nodes and relationships.

Business logic belongs here.
Database logic belongs in graph_db.py.
Cypher belongs in cypher_templates.py.
"""

from __future__ import annotations

import hashlib
import logging

from src.graph import cypher_templates as ct
from src.graph.graph_db import GraphDBManager, get_graph_db
from src.graph.schemas import (
    CompanyEntity,
    DebtInstrument,
    DebtObligationLink,
    ExtractionResult,
    OwnershipRelationship,
)

logger = logging.getLogger(__name__)


class GraphBuilder:
    """
    Converts ExtractionResult objects into Neo4j graph structures.
    """

    def __init__(self, db: GraphDBManager | None = None):
        self.db = db or get_graph_db()

    # ==========================================================
    # Schema Initialization
    # ==========================================================

    def ensure_constraints(self) -> None:
        """
        Create uniqueness constraints.
        Safe to run multiple times.
        """

        constraints = [
            ("Company", "name"),
            ("DebtObligation", "instrument_key"),
        ]

        for label, prop in constraints:
            query = ct.CREATE_UNIQUE_CONSTRAINT.format(
                label=label,
                property=prop,
            )

            self.db.execute_write(query)

        logger.info("Neo4j constraints verified.")

    # ==========================================================
    # Public API
    # ==========================================================

    def ingest_extraction(self, result: ExtractionResult) -> None:
        """
        Store one ExtractionResult in Neo4j.
        """

        logger.info(
            "Processing extraction from %s (chunk %s)",
            result.source_doc_id,
            result.source_chunk_id,
        )

        for company in result.companies:
            self._merge_company(company, result)

        for relationship in result.ownership_relationships:
            self._merge_ownership(relationship, result)

        for debt in result.debt_links:
            self._merge_debt_relationship(debt, result)

        logger.info(
            "Finished graph ingestion "
            "(companies=%d ownership=%d debt_links=%d)",
            len(result.companies),
            len(result.ownership_relationships),
            len(result.debt_links),
        )

        if result.contains_contagion_signal:
            logger.warning(
                "Contagion signal detected in %s chunk %s",
                result.source_doc_id,
                result.source_chunk_id,
            )

    def ingest_batch(
        self,
        results: list[ExtractionResult],
    ) -> None:

        for result in results:
            self.ingest_extraction(result)

    # ==========================================================
    # Company Nodes
    # ==========================================================

    def _merge_company(
        self,
        company: CompanyEntity,
        source: ExtractionResult,
    ) -> None:

        query = ct.MERGE_NODE.format(
            label=company.node_label,
            match_property=company.match_property,
        )

        params = {
            "match_value": company.name,
            "properties": {
                "role": company.role.value,
                "jurisdiction": company.jurisdiction,
                "is_newly_formed": company.is_newly_formed,
                "source_doc_id": source.source_doc_id,
            },
        }

        self.db.execute_write(query, params)

    # ==========================================================
    # Debt Nodes
    # ==========================================================

    def _merge_debt_instrument(
        self,
        instrument: DebtInstrument,
        entity_name: str,
    ) -> str:

        instrument_key = self._instrument_key(
            instrument,
            entity_name,
        )

        query = ct.MERGE_NODE.format(
            label=instrument.node_label,
            match_property=instrument.match_property,
        )

        params = {
            "match_value": instrument_key,
            "properties": {
                "instrument_key": instrument_key,
                "instrument_type": instrument.instrument_type,
                "amount_usd": instrument.amount_usd,
                "maturity_date": instrument.maturity_date,
            },
        }

        self.db.execute_write(query, params)

        return instrument_key

    # ==========================================================
    # Relationships
    # ==========================================================

    def _merge_ownership(
        self,
        relationship: OwnershipRelationship,
        source: ExtractionResult,
    ) -> None:

        query = ct.MERGE_RELATIONSHIP.format(
            from_label="Company",
            from_match_property="name",
            to_label="Company",
            to_match_property="name",
            relationship_type=relationship.relationship_type.value,
        )

        params = {
            "from_value": relationship.parent_name,
            "to_value": relationship.child_name,
            "rel_properties": {
                "ownership_percentage": relationship.ownership_percentage,
                "evidence_text": relationship.evidence_text,
                "source_doc_id": source.source_doc_id,
                "source_chunk_id": source.source_chunk_id,
            },
        }

        self.db.execute_write(query, params)

    def _merge_debt_relationship(
        self,
        debt: DebtObligationLink,
        source: ExtractionResult,
    ) -> None:

        instrument_key = self._merge_debt_instrument(
            debt.instrument,
            debt.entity_name,
        )

        query = ct.MERGE_RELATIONSHIP.format(
            from_label="Company",
            from_match_property="name",
            to_label="DebtObligation",
            to_match_property="instrument_key",
            relationship_type=debt.relationship_type.value,
        )

        params = {
            "from_value": debt.entity_name,
            "to_value": instrument_key,
            "rel_properties": {
                "evidence_text": debt.evidence_text,
                "source_doc_id": source.source_doc_id,
                "source_chunk_id": source.source_chunk_id,
            },
        }

        self.db.execute_write(query, params)

    # ==========================================================
    # Graph Analytics
    # ==========================================================

    def find_contagion_paths(
        self,
        origin_company: str,
        max_hops: int = 4,
    ):

        query = ct.FIND_CONTAGION_PATHS.format(
            max_hops=max_hops,
        )

        return self.db.execute_read(
            query,
            {
                "origin_name": origin_company,
            },
        )

    def find_all_contagion_paths(
        self,
        max_hops: int = 4,
        limit: int = 100,
    ):

        query = ct.FIND_ALL_CONTAGION_PATHS.format(
            max_hops=max_hops,
        )

        return self.db.execute_read(
            query,
            {
                "limit": limit,
            },
        )

    # ==========================================================
    # Helpers
    # ==========================================================

    @staticmethod
    def _instrument_key(
        instrument: DebtInstrument,
        entity_name: str,
    ) -> str:

        raw = (
            f"{entity_name}|"
            f"{instrument.instrument_type}|"
            f"{instrument.amount_usd}|"
            f"{instrument.maturity_date}"
        )

        return hashlib.sha256(
            raw.encode("utf-8")
        ).hexdigest()[:20]