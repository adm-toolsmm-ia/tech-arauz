"""
Agent service layer - Business logic for agent configuration
Handles: CRUD, versionamento, breaking change detection, RLS
"""

import logging
import uuid
from datetime import datetime
from typing import Optional
from decimal import Decimal

from supabase import AsyncClient

from app.agents.models import (
    AgentConfigModel,
    AgentVersionModel,
    AgentHeadModel,
    CreateAgentRequest,
    UpdateAgentDraftRequest,
    PublishAgentRequest,
    RollbackAgentRequest,
)

logger = logging.getLogger(__name__)


class AgentServiceError(Exception):
    """Agent service error"""
    pass


class AgentService:
    """Agent configuration service"""
    
    def __init__(self, supabase_client: AsyncClient):
        self.supabase = supabase_client
    
    async def list_agents(
        self,
        tenant_id: str,
        status: Optional[str] = None,
        tag: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[AgentHeadModel], int]:
        """List agents for tenant with optional filters"""
        query = self.supabase.table("agents").select("*").eq("tenant_id", tenant_id)
        
        if status:
            query = query.eq("status", status)
        if tag and tag != "":
            # Search in tags array
            query = query.contains("tags", [tag])
        if search:
            # Search in name or description
            query = query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
        
        # Get total count
        count_query = self.supabase.table("agents").select("id", count="exact").eq("tenant_id", tenant_id)
        if status:
            count_query = count_query.eq("status", status)
        if tag and tag != "":
            count_query = count_query.contains("tags", [tag])
        if search:
            count_query = count_query.or_(f"name.ilike.%{search}%,description.ilike.%{search}%")
        
        count_response = await count_query
        total = count_response.count if count_response.count is not None else 0
        
        # Paginate and fetch
        offset = (page - 1) * page_size
        response = await query.order("updated_at", desc=True).range(offset, offset + page_size - 1)
        
        agents = []
        for row in response.data or []:
            agent = self._row_to_agent_head(row)
            agents.append(agent)
        
        return agents, total
    
    async def get_agent(self, agent_id: str, tenant_id: str) -> AgentHeadModel:
        """Get single agent by ID"""
        response = await self.supabase.table("agents").select("*").eq("id", agent_id).eq("tenant_id", tenant_id).single()
        
        if not response.data:
            raise AgentServiceError(f"Agent {agent_id} not found")
        
        return self._row_to_agent_head(response.data)
    
    async def create_agent(
        self,
        tenant_id: str,
        user_id: str,
        request: CreateAgentRequest,
    ) -> AgentHeadModel:
        """Create new agent (draft)"""
        agent_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        # Validate slug uniqueness within tenant
        existing = await self.supabase.table("agents").select("id").eq("tenant_id", tenant_id).eq("slug", request.slug)
        if existing.data:
            raise AgentServiceError(f"Slug '{request.slug}' already exists in this tenant")
        
        data = {
            "id": agent_id,
            "tenant_id": tenant_id,
            "name": request.name,
            "slug": request.slug,
            "description": request.description,
            "status": "draft",
            "owners": [user_id],
            "tags": [],
            "created_at": now,
            "updated_at": now,
            "created_by": user_id,
            "updated_by": user_id,
        }
        
        response = await self.supabase.table("agents").insert([data]).select("*").single()
        return self._row_to_agent_head(response.data)
    
    async def update_agent_draft(
        self,
        agent_id: str,
        tenant_id: str,
        user_id: str,
        request: UpdateAgentDraftRequest,
    ) -> AgentHeadModel:
        """Update agent draft"""
        # Verify agent exists and is draft
        agent = await self.get_agent(agent_id, tenant_id)
        if agent.status != "draft":
            raise AgentServiceError(f"Cannot edit published agent {agent_id}")
        
        # Check slug uniqueness if changed
        if request.slug and request.slug != agent.slug:
            existing = await self.supabase.table("agents").select("id").eq("tenant_id", tenant_id).eq("slug", request.slug)
            if existing.data:
                raise AgentServiceError(f"Slug '{request.slug}' already exists")
        
        now = datetime.utcnow().isoformat()
        update_data = request.model_dump(exclude_none=True)
        update_data["updated_at"] = now
        update_data["updated_by"] = user_id
        
        response = await self.supabase.table("agents").update(update_data).eq("id", agent_id).eq("tenant_id", tenant_id).select("*").single()
        return self._row_to_agent_head(response.data)
    
    async def delete_agent_draft(self, agent_id: str, tenant_id: str) -> None:
        """Delete unpublished agent"""
        agent = await self.get_agent(agent_id, tenant_id)
        if agent.status == "published":
            raise AgentServiceError("Cannot delete published agent")
        
        await self.supabase.table("agents").delete().eq("id", agent_id).eq("tenant_id", tenant_id)
    
    async def publish_agent(
        self,
        agent_id: str,
        tenant_id: str,
        user_id: str,
        request: PublishAgentRequest,
    ) -> AgentVersionModel:
        """Publish agent draft → create immutable version"""
        # Get current draft
        agent_row = await self.supabase.table("agents").select("*").eq("id", agent_id).eq("tenant_id", tenant_id).single()
        agent = self._row_to_agent_head(agent_row.data)
        
        if agent.status != "draft":
            raise AgentServiceError(f"Agent {agent_id} is not in draft status")
        
        # Build AgentConfig snapshot
        config = self._build_agent_config(agent_row.data)
        
        # Get next version
        next_version = await self._get_next_version(agent_id)
        
        # Detect breaking changes
        breaking_change = False
        if agent.current_version:
            breaking_change = await self._detect_breaking_change(agent_id, config)
        
        # Create version record
        version_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        version_data = {
            "id": version_id,
            "agent_id": agent_id,
            "version": next_version,
            "status": "published",
            "agent_config": config.model_dump(),
            "commit_message": request.commit_message,
            "change_reason": request.change_reason,
            "breaking_change": breaking_change,
            "created_at": now,
            "created_by": user_id,
        }
        
        response = await self.supabase.table("agent_versions").insert([version_data]).select("*").single()
        
        # Update agent status to published, current_version
        await self.supabase.table("agents").update({
            "status": "published",
            "updated_at": now,
            "updated_by": user_id,
        }).eq("id", agent_id)
        
        return self._row_to_agent_version(response.data)
    
    async def rollback_agent(
        self,
        agent_id: str,
        tenant_id: str,
        user_id: str,
        request: RollbackAgentRequest,
    ) -> None:
        """Rollback to previous version"""
        # Get version
        version_response = await self.supabase.table("agent_versions").select("*").eq("agent_id", agent_id).eq("version", request.target_version).single()
        
        if not version_response.data:
            raise AgentServiceError(f"Version {request.target_version} not found")
        
        version = version_response.data
        config_dict = version["agent_config"]
        
        # Restore config as draft
        now = datetime.utcnow().isoformat()
        update_data = {
            "status": "draft",
            "name": config_dict.get("name"),
            "slug": config_dict.get("slug"),
            "description": config_dict.get("description"),
            "owners": config_dict.get("owners"),
            "tags": config_dict.get("tags"),
            "persona": config_dict.get("persona"),
            "prompt_objective": config_dict.get("prompt_objective"),
            "prompt_instructions": config_dict.get("prompt_instructions"),
            "prompt_template": config_dict.get("prompt_template"),
            "output_schema": config_dict.get("output_schema"),
            "model_provider": config_dict.get("model", {}).get("provider"),
            "model_id": config_dict.get("model", {}).get("model_id"),
            "model_temperature": config_dict.get("model", {}).get("temperature"),
            "model_top_p": config_dict.get("model", {}).get("top_p"),
            "model_max_tokens": config_dict.get("model", {}).get("max_tokens"),
            "model_presence_penalty": config_dict.get("model", {}).get("presence_penalty"),
            "model_frequency_penalty": config_dict.get("model", {}).get("frequency_penalty"),
            "model_stop_sequences": config_dict.get("model", {}).get("stop_sequences"),
            "model_response_format": config_dict.get("model", {}).get("response_format"),
            "model_endpoint_overrides": config_dict.get("model", {}).get("endpoint_overrides"),
            "updated_at": now,
            "updated_by": user_id,
        }
        
        await self.supabase.table("agents").update(update_data).eq("id", agent_id).eq("tenant_id", tenant_id)
    
    async def export_agent_version(
        self,
        agent_id: str,
        tenant_id: str,
        version: Optional[str] = None,
    ) -> dict:
        """Export agent version as canonical JSON. If version is None, exports current published version."""
        agent = await self.get_agent(agent_id, tenant_id)
        target_version = version or agent.current_version
        if not target_version:
            raise AgentServiceError(f"Agent {agent_id} has no published version")
        
        version_response = await self.supabase.table("agent_versions").select("*").eq("agent_id", agent_id).eq("version", target_version).single()
        
        if not version_response.data:
            raise AgentServiceError(f"Version {target_version} not found")
        
        return version_response.data["agent_config"]
    
    async def get_agent_versions(
        self,
        agent_id: str,
        tenant_id: str,
        page: int = 1,
        page_size: int = 10,
    ) -> list[AgentVersionModel]:
        """Get all versions of an agent with pagination"""
        # Verify agent exists
        await self.get_agent(agent_id, tenant_id)
        
        offset = (page - 1) * page_size
        response = await (
            self.supabase.table("agent_versions")
            .select("*")
            .eq("agent_id", agent_id)
            .order("created_at", desc=True)
            .range(offset, offset + page_size - 1)
        )
        
        versions = []
        for row in response.data or []:
            version = self._row_to_agent_version(row)
            versions.append(version)
        
        return versions
    
    # =========================================================================
    # Helper methods
    # =========================================================================
    
    def _row_to_agent_head(self, row: dict) -> AgentHeadModel:
        """Convert DB row to AgentHeadModel"""
        return AgentHeadModel(
            id=row["id"],
            name=row["name"],
            slug=row["slug"],
            status=row["status"],
            tags=row.get("tags"),
            model_id=row.get("model_id", ""),
            owners=row.get("owners", []),
            current_version=row.get("current_version"),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            created_by=row["created_by"],
            updated_by=row["updated_by"],
        )
    
    def _row_to_agent_version(self, row: dict) -> AgentVersionModel:
        """Convert DB row to AgentVersionModel"""
        return AgentVersionModel(
            id=row["id"],
            agent_id=row["agent_id"],
            version=row["version"],
            status=row["status"],
            agent_config=AgentConfigModel(**row["agent_config"]),
            commit_message=row.get("commit_message"),
            change_reason=row.get("change_reason"),
            breaking_change=row.get("breaking_change", False),
            created_at=row["created_at"],
            created_by=row["created_by"],
        )
    
    def _build_agent_config(self, row: dict) -> AgentConfigModel:
        """Build AgentConfigModel from DB row"""
        return AgentConfigModel(
            id=row["id"],
            name=row["name"],
            slug=row["slug"],
            description=row.get("description"),
            owners=row.get("owners", []),
            tags=row.get("tags"),
            status=row["status"],
            persona=row.get("persona"),
            prompt_objective=row["prompt_objective"],
            prompt_instructions=row.get("prompt_instructions", []),
            prompt_template=row["prompt_template"],
            output_schema=row.get("output_schema"),
            model={
                "provider": row.get("model_provider"),
                "model_id": row.get("model_id"),
                "temperature": row.get("model_temperature"),
                "top_p": row.get("model_top_p"),
                "max_tokens": row.get("model_max_tokens"),
                "presence_penalty": row.get("model_presence_penalty"),
                "frequency_penalty": row.get("model_frequency_penalty"),
                "stop_sequences": row.get("model_stop_sequences"),
                "response_format": row.get("model_response_format"),
                "endpoint_overrides": row.get("model_endpoint_overrides"),
            },
        )
    
    async def _get_next_version(self, agent_id: str) -> str:
        """Get next semver version for agent"""
        response = await self.supabase.table("agent_versions").select("version").eq("agent_id", agent_id).order("version", desc=True).limit(1)
        
        if not response.data:
            return "1.0.0"
        
        current_version = response.data[0]["version"]
        parts = current_version.split(".")
        patch = int(parts[2]) + 1
        return f"{parts[0]}.{parts[1]}.{patch}"
    
    async def _detect_breaking_change(self, agent_id: str, new_config: AgentConfigModel) -> bool:
        """Detect if changes are breaking"""
        # Get previous published version
        response = await self.supabase.table("agent_versions").select("agent_config").eq("agent_id", agent_id).eq("status", "published").order("created_at", desc=True).limit(1)
        
        if not response.data:
            return False
        
        old_config_dict = response.data[0]["agent_config"]
        old_config = AgentConfigModel(**old_config_dict)
        
        # Check if output_schema changed incompatibly
        if old_config.output_schema and new_config.output_schema:
            old_required = old_config.output_schema.get("required", [])
            new_required = new_config.output_schema.get("required", [])
            
            # Breaking if required fields removed
            for field in old_required:
                if field not in new_required:
                    return True
            
            # Breaking if field type changed
            old_props = old_config.output_schema.get("properties", {})
            new_props = new_config.output_schema.get("properties", {})
            
            for field, old_prop in old_props.items():
                if field in new_props:
                    if old_prop.get("type") != new_props[field].get("type"):
                        return True
        
        return False
