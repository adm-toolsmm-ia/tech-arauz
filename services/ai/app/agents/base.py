"""
Base Agent - Estrutura base para agentes LangGraph
"""

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Any, Optional
from dataclasses import dataclass

from langchain_core.messages import BaseMessage


@dataclass
class AgentState:
    """Estado compartilhado entre nós do grafo."""

    messages: list[BaseMessage]
    input: str
    output: Optional[str] = None
    metadata: dict[str, Any] | None = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()


class BaseAgent(ABC):
    """
    Classe base para agentes LangGraph.

    Cada agente deve implementar:
    - build_graph(): Constrói o grafo de estados
    - run(): Executa o agente com um input
    """

    def __init__(self, agent_id: str, name: str):
        self.agent_id = agent_id
        self.name = name
        self.graph = None

    @abstractmethod
    def build_graph(self) -> Any:
        """
        Constrói o StateGraph do agente.

        Returns:
            StateGraph compilado pronto para execução
        """
        pass

    @abstractmethod
    async def run(self, input_text: str, config: dict | None = None) -> AgentState:
        """
        Executa o agente com o input fornecido.

        Args:
            input_text: Texto de entrada do usuário
            config: Configurações opcionais

        Returns:
            Estado final após execução
        """
        pass

    def get_info(self) -> dict:
        """Retorna informações do agente."""
        return {
            "id": self.agent_id,
            "name": self.name,
            "has_graph": self.graph is not None,
        }
