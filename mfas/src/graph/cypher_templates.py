"""
cypher_templates.py

Reusable, business-agnostic Cypher templates for the MFAS Knowledge Graph.

Responsibilities:
- Generic node CRUD operations
- Generic relationship CRUD operations
- Schema constraints
- Generic analytical queries

Business logic belongs in graph_builder.py.
"""

from __future__ import annotations

# ==============================================================================
# Constraints
# ==============================================================================

CREATE_UNIQUE_CONSTRAINT = """
CREATE CONSTRAINT IF NOT EXISTS
FOR (n:{label})
REQUIRE n.{property} IS UNIQUE
"""

# ==============================================================================
# Generic Node Operations
# ==============================================================================

MERGE_NODE = """
MERGE (n:{label} {{ {match_property}: $match_value }})
ON CREATE SET
    n += $properties,
    n.created_at = timestamp(),
    n.updated_at = timestamp()
ON MATCH SET
    n += $properties,
    n.updated_at = timestamp()
RETURN n
"""

GET_NODE_BY_KEY = """
MATCH (n:{label} {{ {match_property}: $match_value }})
RETURN n
"""

DELETE_NODE = """
MATCH (n:{label} {{ {match_property}: $match_value }})
DETACH DELETE n
"""

COUNT_NODES = """
MATCH (n:{label})
RETURN count(n) AS count
"""

# ==============================================================================
# Generic Relationship Operations
# ==============================================================================

MERGE_RELATIONSHIP = """
MATCH (a:{from_label} {{ {from_match_property}: $from_value }})
MATCH (b:{to_label} {{ {to_match_property}: $to_value }})

MERGE (a)-[r:{relationship_type}]->(b)

ON CREATE SET
    r += $rel_properties,
    r.created_at = timestamp(),
    r.updated_at = timestamp()

ON MATCH SET
    r += $rel_properties,
    r.updated_at = timestamp()

RETURN r
"""

GET_OUTGOING_RELATIONSHIPS = """
MATCH (n:{label} {{ {match_property}: $match_value }})-[r]->(m)

RETURN
    type(r) AS relationship_type,
    r AS relationship_properties,
    labels(m) AS target_labels,
    m AS target_node
"""

COUNT_RELATIONSHIPS = """
MATCH ()-[r:{relationship_type}]->()
RETURN count(r) AS count
"""

# ==============================================================================
# Database Utilities
# ==============================================================================

CLEAR_DATABASE = """
MATCH (n)
DETACH DELETE n
"""

# ==============================================================================
# Fraud / Contagion Queries
# ==============================================================================

FIND_CONTAGION_PATHS = """
MATCH path =
    (origin:Company)
    -[:OWNS|CONTROLS|CONSOLIDATES*1..{max_hops}]
    ->
    (intermediate:Company)
    -[:HOLDS|GUARANTEES]->
    (instrument:DebtObligation)

WHERE origin.name = $origin_name

RETURN
    path,
   [
    node IN nodes(path)
    |
    coalesce(
        node.name,
        node.instrument_type,
        node.instrument_key
    )
]
AS entity_chain,
    instrument.instrument_type AS instrument_type,
    instrument.amount_usd AS exposure_amount

ORDER BY coalesce(exposure_amount, 0) DESC
"""

FIND_ALL_CONTAGION_PATHS = """
MATCH path =
    (origin:Company)
    -[:OWNS|CONTROLS|CONSOLIDATES*1..{max_hops}]
    ->
    (intermediate:Company)
    -[:HOLDS|GUARANTEES]->
    (instrument:DebtObligation)

RETURN
    path,
    [
    node IN nodes(path)
    |
    coalesce(
        node.name,
        node.instrument_type,
        node.instrument_key
    )
]
AS entity_chain,
    instrument.instrument_type AS instrument_type,
    instrument.amount_usd AS exposure_amount

ORDER BY coalesce(exposure_amount, 0) DESC

LIMIT $limit
"""

# ==============================================================================
# Health Check Queries
# ==============================================================================

DATABASE_STATS = """
CALL db.stats.retrieve("GRAPH COUNTS")
YIELD data

RETURN data
"""

PING_QUERY = """
RETURN 1 AS healthy
"""