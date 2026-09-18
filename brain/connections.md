# Connections

Registry of every system your AIOS can reach. Filled by `/onboard` from Q4-Q7 answers; expanded over time as you wire new tools. `/audit` checks this file for domain coverage and freshness.

| # | Domain | Tool | Mechanism | Auth | Last checked |
|---|---|---|---|---|---|
| 1 | Revenue / Financials | Not specified | not yet connected | — | — |
| 2 | Customer interactions | Not specified | not yet connected | — | — |
| 3 | Calendar | Not specified | not yet connected | — | — |
| 4 | Communication | Not specified | not yet connected | — | — |
| 5 | Project / task tracking | Not specified | not yet connected | — | — |
| 6 | Meeting intelligence | Not specified | not yet connected | — | — |
| 7 | Knowledge / files | Not specified | not yet connected | — | — |

**Mechanism options:** `mcp` (MCP server), `script` (Python/Bash hitting an API, in `scripts/`), `export` (CSV/JSON dump pipeline), `key+ref` (`.env` key + `references/{tool}-api.md` guide), `not yet connected`.

When you wire a new tool, also save `references/{tool}-api.md` capturing endpoints, auth flow, and common queries — researched-once-saved-forever.

## Local lead workspace

Local files are available in this folder. leads/leads.csv is the initial tracker. No external CRM, email, lead provider, or scheduled automation is configured. Web research availability depends on the tools in the active Codex session; it is not a persistent connection.
