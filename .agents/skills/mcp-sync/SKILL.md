---
name: mcp-sync
description: Rules and instructions for maintaining synchronization between Careto database schema/business logic and the Careto MCP Server endpoints/tools.
---

# MCP Server & Schema Sync Skill

This skill enforces 1:1 synchronization between Careto's core data models, sync mechanisms, database schema, and the external **Model Context Protocol (MCP)** server tools.

## When to Trigger
Trigger this skill whenever making changes to:
1. Database tables in `server/db/schema.ts`.
2. Sync records structure or logic in `api/_lib/sync.ts`.
3. AI vision prompts or parser types in `api/_lib/ai/prompts.ts` or `api/_lib/ai/types.ts`.
4. Vehicle fields or calculations (fuel grades, distance units, efficiency, tanks).

---

## Mandatory Maintenance Checklist

When any of the above components are added or modified:

### 1. Check MCP Tool Definitions (`api/_lib/mcp/tools.ts`)
- Verify if any input schemas in `CARETO_MCP_TOOLS` need updated parameters or descriptions.
- Ensure new entity tables or fields are supported in `careto_add_entry`, `careto_analyze_spendings`, or `careto_get_vehicle_details`.

### 2. Update Tool Execution Logic (`executeMCPTool` in `api/_lib/mcp/tools.ts`)
- Ensure SQL queries or `records` table operations map new fields accurately.
- Update data calculation logic (spendings total, unit conversions, overdue reminders) if business logic changes.

### 3. Update MCP Documentation & Specs
- Update `SPEC.md` under MCP Server section if new tools are introduced.
- Run typecheck and linting commands to verify MCP handler integrity:
  ```bash
  npm run typecheck
  npm run lint
  ```

---

## Key Files Reference

- **MCP Tools Registry & Handlers**: `api/_lib/mcp/tools.ts`
- **MCP Server API Endpoint**: `api/mcp/[action].ts`
- **Database Schema**: `server/db/schema.ts`
- **API Key Management**: `api/keys/[action].ts` & `src/features/settings/components/ApiKeysSettingsCard/ApiKeysSettingsCard.tsx`
