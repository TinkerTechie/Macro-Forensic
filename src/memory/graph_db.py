from neo4j import GraphDatabase
from config.settings import NEO4J_URI, NEO4J_USERNAME, NEO4J_PASSWORD

class Neo4jManager:
    def __init__(self):
        self.driver = GraphDatabase.driver(
            NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD)
        )
        self._initialize_constraints()

    def close(self):
        self.driver.close()

    def execute_query(self, query: str, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters or {})
            return [record.data() for record in result]

    def _initialize_constraints(self):
        constraint_query = """
        CREATE CONSTRAINT unique_entity_name IF NOT EXISTS 
        FOR (e:Entity) REQUIRE e.name IS UNIQUE
        """
        self.execute_query(constraint_query)
        print("Neo4j: Initialized connection and constraints.")

graph_db = Neo4jManager()
