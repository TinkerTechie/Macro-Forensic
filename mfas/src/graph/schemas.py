"""
schemas.py

Single source of truth for the graph data contract.

Both `entity_extractor.py` (producer — LLM output must validate against
these) and `graph_builder.py` (consumer — translates these into Cypher
params) import from here. Nothing else in src/graph/ should define its
own overlapping entity/relationship shapes.
"""

from __future__ import annotations

from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator


# --------------------------------------------------------------------------
# Enums
# --------------------------------------------------------------------------

class EntityRole(str, Enum):
    PARENT = "PARENT"
    SUBSIDIARY = "SUBSIDIARY"
    SHELL = "SHELL"          # flagged separately — often the fraud signal
    AFFILIATE = "AFFILIATE"
    UNKNOWN = "UNKNOWN"


class RelationshipType(str, Enum):
    OWNS = "OWNS"                    # equity ownership
    CONTROLS = "CONTROLS"            # de facto control without full ownership
    GUARANTEES = "GUARANTEES"        # parent guarantees subsidiary debt
    CONSOLIDATES = "CONSOLIDATES"    # accounting consolidation relationship


class ObligationRelationshipType(str, Enum):
    HOLDS = "HOLDS"                  # entity directly owes/holds the obligation
    GUARANTEES = "GUARANTEES"        # entity guarantees someone else's obligation


# --------------------------------------------------------------------------
# Node-shaped entities
# --------------------------------------------------------------------------

class CompanyEntity(BaseModel):
    """Graph node contract for a :Company."""
    name: str = Field(..., description="Full legal or commonly-used entity name as written in the filing.")
    role: EntityRole = Field(default=EntityRole.UNKNOWN)
    jurisdiction: Optional[str] = Field(None, description="State/country of incorporation, if stated.")
    is_newly_formed: bool = Field(
        False, description="True if text indicates recent formation — a shell-company signal."
    )

    @field_validator("name")
    @classmethod
    def _clean_name(cls, v: str) -> str:
        return v.strip()

    @property
    def node_label(self) -> str:
        return "Company"

    @property
    def match_property(self) -> str:
        """Property used to MERGE this node (uniqueness key)."""
        return "name"


class DebtInstrument(BaseModel):
    """Graph node contract for a :DebtObligation."""
    instrument_type: str = Field(..., description="e.g. 'senior secured notes', 'term loan'.")
    amount_usd: Optional[float] = Field(None, description="Face value in raw USD.")
    maturity_date: Optional[str] = Field(None, description="ISO date if stated.")

    @property
    def node_label(self) -> str:
        return "DebtObligation"

    @property
    def match_property(self) -> str:
        # Debt instruments don't have a natural unique name like companies do,
        # so graph_builder derives a synthetic key (see graph_builder.py).
        return "instrument_key"


# --------------------------------------------------------------------------
# Edge-shaped relationships
# --------------------------------------------------------------------------

class OwnershipRelationship(BaseModel):
    """Edge contract: (parent)-[relationship_type]->(child)."""
    parent_name: str
    child_name: str
    relationship_type: RelationshipType = Field(default=RelationshipType.OWNS)
    ownership_percentage: Optional[float] = Field(None, ge=0, le=100)
    evidence_text: str = Field(..., description="Verbatim snippet (<= 40 words) supporting this edge.")


class DebtObligationLink(BaseModel):
    """Edge contract: (entity)-[HOLDS|GUARANTEES]->(:DebtObligation).

    Note: this replaces the flatter `DebtObligation` DTO from the first draft.
    The instrument itself is now a proper node (`DebtInstrument`), and this
    model is just the edge connecting an entity to it — matching the
    node/edge separation the rest of the graph uses.
    """
    entity_name: str
    instrument: DebtInstrument
    relationship_type: ObligationRelationshipType = Field(default=ObligationRelationshipType.HOLDS)
    evidence_text: str = Field(..., description="Verbatim snippet (<= 40 words) supporting this fact.")


# --------------------------------------------------------------------------
# Top-level extraction contract
# --------------------------------------------------------------------------

class ExtractionResult(BaseModel):
    """Full structured extraction for a single text chunk.

    This is what entity_extractor.py must produce and what
    graph_builder.py consumes to build Cypher calls.
    """
    companies: List[CompanyEntity] = Field(default_factory=list)
    ownership_relationships: List[OwnershipRelationship] = Field(default_factory=list)
    debt_links: List[DebtObligationLink] = Field(default_factory=list)
    contains_contagion_signal: bool = Field(
        False,
        description=(
            "True when this chunk shows BOTH an ownership/control relationship AND a debt "
            "obligation tied to the controlled entity — the core fraud-contagion pattern."
        ),
    )

    # Provenance — populated by the caller (entity_extractor), not the LLM.
    source_chunk_id: Optional[str] = None
    source_doc_id: Optional[str] = None