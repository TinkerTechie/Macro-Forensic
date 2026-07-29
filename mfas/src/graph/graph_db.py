"""
graph_db.py

Neo4j connection manager for the MFAS Knowledge Graph.

Responsibilities:
- Manage Neo4j connection lifecycle
- Execute generic read/write Cypher queries
- Hide Neo4j driver details from the rest of the application
"""

from __future__ import annotations

import logging
from typing import Any

from neo4j import Driver, GraphDatabase

from config.settings import (
    NEO4J_URI,
    NEO4J_USERNAME,
    NEO4J_PASSWORD,
)

logger = logging.getLogger(__name__)


class GraphDBManager:
    """
    Generic Neo4j connection manager.

    This class is responsible ONLY for:
    - Connecting to Neo4j
    - Executing Cypher queries
    - Managing the driver lifecycle

    Business logic belongs in graph_builder.py.
    """

    def __init__(
        self,
        uri: str | None = None,
        user: str | None = None,
        password: str | None = None,
    ) -> None:

        self.uri = uri or NEO4J_URI
        self.user = user or NEO4J_USERNAME
        self.password = password or NEO4J_PASSWORD

        self.driver: Driver | None = None

        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password),
            )

            self.driver.verify_connectivity()

            logger.info(
                "Connected to Neo4j at %s",
                self.uri,
            )

        except Exception as exc:
            logger.exception("Failed to connect to Neo4j.")

            raise RuntimeError(
                "Unable to connect to Neo4j."
            ) from exc

    # ---------------------------------------------------------
    # Context Manager
    # ---------------------------------------------------------

    def __enter__(self) -> "GraphDBManager":
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        self.close()

    # ---------------------------------------------------------
    # Connection Management
    # ---------------------------------------------------------

    def close(self) -> None:
        """
        Close the Neo4j driver.
        """

        if self.driver is not None:
            self.driver.close()
            self.driver = None

            logger.info("Neo4j connection closed.")

    # ---------------------------------------------------------
    # Write Queries
    # ---------------------------------------------------------

    def execute_write(
        self,
        query: str,
        params: dict[str, Any] | None = None,
    ) -> list[dict]:
        """
        Execute a write Cypher query.

        Args:
            query:
                Cypher query.

            params:
                Optional query parameters.

        Returns:
            List of dictionaries.
        """

        if self.driver is None:
            raise RuntimeError("Neo4j connection is closed.")

        params = params or {}

        try:
            with self.driver.session() as session:

                result = session.execute_write(
                    lambda tx: list(
                        tx.run(query, **params)
                    )
                )

                return [record.data() for record in result]

        except Exception as exc:
            logger.exception("Neo4j write query failed.")

            raise RuntimeError(
                "Failed to execute write query."
            ) from exc

    # ---------------------------------------------------------
    # Read Queries
    # ---------------------------------------------------------

    def execute_read(
        self,
        query: str,
        params: dict[str, Any] | None = None,
    ) -> list[dict]:
        """
        Execute a read Cypher query.

        Args:
            query:
                Cypher query.

            params:
                Optional query parameters.

        Returns:
            List of dictionaries.
        """

        if self.driver is None:
            raise RuntimeError("Neo4j connection is closed.")

        params = params or {}

        try:
            with self.driver.session() as session:

                result = session.execute_read(
                    lambda tx: list(
                        tx.run(query, **params)
                    )
                )

                return [record.data() for record in result]

        except Exception as exc:
            logger.exception("Neo4j read query failed.")

            raise RuntimeError(
                "Failed to execute read query."
            ) from exc

    # ---------------------------------------------------------
    # Health Check
    # ---------------------------------------------------------

    def verify_connectivity(self) -> bool:
        """
        Verify that the Neo4j connection is healthy.
        """

        if self.driver is None:
            return False

        try:
            self.driver.verify_connectivity()

            logger.info("Neo4j connectivity verified.")

            return True

        except Exception:
            logger.exception("Neo4j connectivity check failed.")

            return False


# ---------------------------------------------------------
# Lazy Singleton
# ---------------------------------------------------------

_graph_db: GraphDBManager | None = None


def get_graph_db() -> GraphDBManager:
    """
    Return a lazily initialized GraphDBManager singleton.
    """

    global _graph_db

    if _graph_db is None:
        _graph_db = GraphDBManager()

    return _graph_db