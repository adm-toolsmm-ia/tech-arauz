"""
Orchestrator Graph - Grafo principal de orquestração
Roteia requests para agentes especializados
"""

from typing import Annotated, TypedDict

from langchain_core.messages import HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages


# =============================================================================
# State
# =============================================================================


class OrchestratorState(TypedDict):
    """Estado do orquestrador."""

    messages: Annotated[list, add_messages]
    next_agent: str | None
    final_output: str | None


# =============================================================================
# Nodes
# =============================================================================


def router_node(state: OrchestratorState) -> OrchestratorState:
    """
    Nó de roteamento - decide qual agente usar.
    
    TODO: Implementar lógica de classificação de intent
    """
    # Por enquanto, sempre usa agente geral
    return {
        **state,
        "next_agent": "general",
    }


def general_agent_node(state: OrchestratorState) -> OrchestratorState:
    """
    Nó do agente geral.
    
    TODO: Implementar chamada real ao LLM
    """
    last_message = state["messages"][-1] if state["messages"] else None
    user_input = last_message.content if last_message else ""

    # Mock response
    response = f"Recebi sua mensagem: {user_input}"

    return {
        **state,
        "messages": [AIMessage(content=response)],
        "final_output": response,
    }


def should_continue(state: OrchestratorState) -> str:
    """Decide se continua ou encerra."""
    if state.get("final_output"):
        return END
    return state.get("next_agent", "general")


# =============================================================================
# Graph Builder
# =============================================================================


def build_orchestrator() -> StateGraph:
    """
    Constrói o grafo do orquestrador.

    Returns:
        StateGraph compilado
    """
    # Cria o grafo
    graph = StateGraph(OrchestratorState)

    # Adiciona nós
    graph.add_node("router", router_node)
    graph.add_node("general", general_agent_node)

    # Define entry point
    graph.set_entry_point("router")

    # Adiciona edges condicionais
    graph.add_conditional_edges(
        "router",
        should_continue,
        {
            "general": "general",
            END: END,
        },
    )

    # Agente geral sempre termina
    graph.add_edge("general", END)

    return graph.compile()


# Singleton do grafo compilado
orchestrator = build_orchestrator()
