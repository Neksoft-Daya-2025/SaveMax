# SAVEMAX AI --- MASTER IMPLEMENTATION PLAN

## 1. Project Purpose

Build a persistent, server-hosted autonomous AI operations system for
the Savemax real-estate business, integrated with the existing Holirotis
property-management platform.

This is **not** primarily a chatbot or generic "second brain."

The objective is an AI business operator capable of continuously:

1.  Finding potential real-estate properties from approved internet
    sources and property feeds/APIs.
2.  Extracting and normalizing property information.
3.  Removing duplicates.
4.  Evaluating and scoring properties against Savemax criteria.
5.  Presenting candidates for human approval.
6.  Preparing approved properties for the existing Holirotis system.
7.  Publishing properties after required approval.
8.  Finding legitimate potential leads for properties.
9.  Qualifying and organizing leads.
10. Preparing personalized outreach.
11. Tracking activity, responses, decisions and workflow history.
12. Running recurring workflows without requiring the owner's laptop to
    remain online.

The system should eventually function as a persistent AI employee for
Savemax.

------------------------------------------------------------------------

## 2. Existing Production System

Existing website: `https://www.holirotis.nl/`

The website is based on **Property Next --- AI Powered Property Listing
& Management System**.

Existing application technology/functionality includes:

-   Next.js
-   TypeScript
-   MongoDB / Mongoose
-   Properties
-   Units
-   Customers
-   Agents
-   Inquiries/leads
-   Bookings
-   Authentication / permissions
-   Existing production website

### Important

The existing Property Next/Holirotis application must **NOT** be
replaced.

Its MongoDB database remains the authoritative business/application
database.

The AI system will operate alongside it.

------------------------------------------------------------------------

## 3. Locked V1 Technology Stack

These architectural choices are **LOCKED** unless the owner explicitly
approves a change.

### OpenClaw --- Agent Runtime

Role:

-   Primary autonomous agent runtime
-   User/agent interaction
-   Tool invocation
-   Agent execution
-   Long-running AI operations
-   Connection to Codex
-   Command interpretation

OpenClaw should be self-hosted on the Savemax AI VPS.

### n8n --- Workflow Engine

Role:

-   Deterministic workflows
-   Scheduled jobs
-   Recurring workflows
-   Webhooks
-   Data pipelines
-   Retry logic
-   Workflow monitoring
-   Approval workflows
-   Integration between services

OpenClaw handles agentic reasoning. n8n handles predictable/repeatable
business processes.

Do not unnecessarily duplicate responsibility between them.

### Codex --- AI / LLM

**STATUS: LOCKED**

Codex is the selected reasoning/intelligence layer.

Do **NOT** introduce Claude, Gemini or another primary LLM unless
explicitly requested.

Before implementation, verify the supported server-side
authentication/integration method for the available Codex/OpenAI
account. Do not assume a ChatGPT subscription automatically provides API
billing or server API credentials.

### PostgreSQL --- AI Operational Database

PostgreSQL stores AI/automation-specific operational information,
including:

-   agent tasks
-   agent runs
-   property candidates
-   property sources
-   scoring results
-   rejected candidates
-   approvals
-   workflow state
-   research history
-   lead candidates
-   lead sources
-   outreach state
-   agent decisions
-   audit logs

PostgreSQL does **NOT** replace MongoDB.

### MongoDB --- Existing Application Database

MongoDB continues serving Holirotis/Property Next, including:

-   published properties
-   customers
-   agents
-   inquiries
-   bookings
-   units
-   existing application records

### Firecrawl + Chromium --- Web Research

Firecrawl role:

-   Web discovery
-   Crawling
-   Structured extraction
-   Content extraction

Chromium role:

-   Interactive browser research
-   JavaScript-heavy websites
-   Navigation where ordinary extraction is insufficient

Prefer legitimate APIs, feeds and permitted public sources when
available.

Respect source terms, access controls, robots requirements and
applicable privacy/anti-spam laws. Do not bypass authentication,
CAPTCHAs or technical access restrictions.

### Savemax Agent API

A secure API layer must be added to the Holirotis application.

Agents should **NOT** primarily operate Holirotis by clicking through
the admin UI.

Preferred architecture:

`AI Agent → authenticated Savemax API → Holirotis → MongoDB`

Potential API areas:

-   `/api/agent/properties/candidates`
-   `/api/agent/properties/create-draft`
-   `/api/agent/properties/update-draft`
-   `/api/agent/properties/publish`
-   `/api/agent/leads/create`
-   `/api/agent/leads/qualify`
-   `/api/agent/tasks`
-   `/api/agent/approvals`
-   `/api/agent/status`

Exact routes must be designed after inspecting the existing application
architecture.

------------------------------------------------------------------------

## 4. High-Level Architecture

``` text
                    USER
                      |
                      v
                  OPENCLAW
                      |
                    CODEX
                      |
           +----------+----------+
           |                     |
           v                     v
          n8n                PostgreSQL
           |
      +----+----+
      |         |
      v         v
 Firecrawl   Chromium
      |         |
      +----+----+
           |
           v
        INTERNET
           |
           v
 PROPERTY DISCOVERY
           |
           v
 NORMALIZE / DEDUPLICATE
           |
           v
       AI SCORING
           |
           v
     HUMAN APPROVAL
           |
           v
      SAVEMAX API
           |
           v
       HOLIROTIS
           |
           v
        MongoDB
```

After publication:

``` text
PROPERTY
   |
   v
LEAD HUNTER
   |
   v
DISCOVERY
   |
   v
QUALIFICATION
   |
   v
CRM / INQUIRIES
   |
   v
OUTREACH PREPARATION
   |
   v
APPROVAL
   |
   v
OUTREACH / FOLLOW-UP
```

------------------------------------------------------------------------

## 5. Deployment Architecture

### VPS 1 --- Existing Holirotis Production

Contains:

-   Holirotis
-   Property Next
-   MongoDB or its existing MongoDB connection
-   Savemax Agent API

Do not destabilize this server.

### VPS 2 --- Savemax AI

Preferred separate Hostinger VPS.

Dockerized services should include:

-   OpenClaw
-   n8n
-   PostgreSQL
-   Firecrawl
-   Chromium/browser environment
-   reverse proxy where required
-   supporting workers/services

Browser automation, crawling and AI jobs can consume significant
RAM/CPU. Failure of an AI worker must not take the public Holirotis
website offline.

If only one VPS is initially available, inspect available resources
before deployment. Do **NOT** assume it is safe to colocate everything.

------------------------------------------------------------------------

## 6. Network Security

Do **NOT** expose these services directly to the public internet:

-   PostgreSQL
-   MongoDB
-   Chromium debugging ports
-   internal Firecrawl services
-   internal n8n services unless properly proxied/authenticated
-   OpenClaw internal gateway

Use:

-   Docker private networks
-   firewall rules
-   authenticated reverse proxy
-   HTTPS
-   strong service credentials
-   secrets/environment management
-   API authentication
-   least-privilege permissions

Possible public interfaces:

-   `https://www.holirotis.nl`
-   later: `https://ai.holirotis.nl`

The AI Command Center must require authentication.

------------------------------------------------------------------------

## 7. Permission Model

The AI must **NOT** receive unrestricted production authority initially.

  -----------------------------------------------------------------------
  Action                              V1 Permission
  ----------------------------------- -----------------------------------
  SEARCH_PROPERTY                     Automatic

  ANALYZE_PROPERTY                    Automatic

  SCORE_PROPERTY                      Automatic

  REJECT_LOW_SCORE                    Automatic, retain audit record

  CREATE_PROPERTY_DRAFT               Automatic

  PUBLISH_PROPERTY                    Human approval required

  EDIT_PUBLISHED_PROPERTY             Approval required initially

  DELETE_PROPERTY                     Always requires approval

  FIND_LEADS                          Automatic

  QUALIFY_LEADS                       Automatic

  CREATE_LEAD_RECORD                  Automatic subject to compliance
                                      rules

  PREPARE_OUTREACH                    Automatic

  SEND_OUTREACH                       Approval required initially

  BULK_OUTREACH                       Explicit approval required

  DESTRUCTIVE_DATABASE_ACTIONS        Not allowed without explicit
                                      authorization
  -----------------------------------------------------------------------

Every important agent action should be auditable.

------------------------------------------------------------------------

## 8. Property Hunter --- V1 Primary Workflow

Property Hunter is the **FIRST major business workflow**.

Do not begin by building every possible agent. Complete Property Hunter
end-to-end first.

Example command:

> Find investment properties around Amsterdam below €600,000 with strong
> rental potential.

Expected process:

1.  Parse requirements.
2.  Create agent task.
3.  Identify configured/approved property sources.
4.  Search sources.
5.  Extract candidate information.
6.  Normalize data.
7.  Detect duplicates.
8.  Store candidates in PostgreSQL.
9.  Analyze candidate quality.
10. Score candidates.
11. Reject clearly unsuitable candidates while retaining reason/history.
12. Rank remaining candidates.
13. Present candidates to user.

User can then approve selected candidates, e.g. `Approve 1, 3 and 5.`

The system prepares those properties for Holirotis.

------------------------------------------------------------------------

## 9. Property Scoring

The scoring system should be configurable rather than hardcoded into
prompts.

Possible dimensions:

-   asking price
-   price per m²
-   location
-   rental potential
-   estimated yield
-   property condition
-   property type
-   transport access
-   local amenities
-   market comparison
-   estimated demand
-   potential renovation requirement
-   completeness/reliability of source data

Store:

-   total score
-   score components
-   reasoning summary
-   model/version used
-   source information
-   timestamp

Scoring rules will evolve. Design accordingly.

------------------------------------------------------------------------

## 10. Duplicate Detection

Duplicate prevention is essential.

Potential duplicate signals:

-   source URL
-   source property ID
-   address
-   postcode
-   latitude/longitude
-   price
-   image fingerprints if later necessary
-   title similarity
-   property attributes

Do not repeatedly show the same property as "new."

PostgreSQL should remember previously discovered candidates even when
rejected.

------------------------------------------------------------------------

## 11. Human Approval

Approval is a first-class concept.

Do **NOT** implement approval merely as a chat convention.

Create persistent approval records.

Possible states:

-   PENDING
-   APPROVED
-   REJECTED
-   EXPIRED
-   CANCELLED

Record:

-   requested action
-   target entity
-   requesting agent
-   reasoning
-   timestamp
-   approving user
-   approval timestamp
-   resulting execution

------------------------------------------------------------------------

## 12. Holirotis Property Creation

After approval:

1.  Generate normalized property title.
2.  Prepare structured description.
3.  Prepare SEO information where applicable.
4.  Map property attributes to the existing Property Next schema.
5.  Validate images and permitted usage/source.
6.  Validate mandatory fields.
7.  Create DRAFT through Savemax API.
8.  Return draft preview/status.
9.  Publish only when required approval exists.

Do not allow an AI hallucination to create invalid database records. Use
schema validation.

------------------------------------------------------------------------

## 13. Lead Hunter

Implement after Property Hunter → Approval → Holirotis publishing works
reliably.

Example:

> Find potential buyers/investors for property #152.

Workflow:

`Property → buyer/investor profile → legitimate sources + existing CRM → prospects → validation/enrichment → deduplication → scoring → storage → outreach preparation → approval → contact → outcome tracking`

Do not scrape or use private/personal information in ways that violate
privacy law, source terms or anti-spam requirements.

Prefer business/public contact information and opted-in/existing CRM
data.

------------------------------------------------------------------------

## 14. Continuous Operations

The system should support both command-driven and scheduled autonomous
work.

### Command-driven

> Find properties below €500k in Rotterdam.

### Scheduled

For example, every morning:

1.  Search configured markets.
2.  Find newly available properties.
3.  Deduplicate against history.
4.  Score.
5.  Prepare candidate report.
6.  Notify user only when useful candidates exist.

The system should operate even when the user's laptop is offline.

------------------------------------------------------------------------

## 15. AI Operational Data Model

Do not finalize schema until the existing application has been
inspected.

PostgreSQL will likely require entities resembling:

-   `agent_tasks`
-   `agent_runs`
-   `agent_events`
-   `property_candidates`
-   `property_candidate_sources`
-   `property_scores`
-   `property_rejections`
-   `approvals`
-   `research_runs`
-   `research_sources`
-   `lead_candidates`
-   `lead_sources`
-   `lead_scores`
-   `outreach_drafts`
-   `outreach_events`
-   `workflow_runs`
-   `agent_audit_log`

Potential future tables:

-   `agent_memory`
-   `market_profiles`
-   `search_profiles`
-   `scoring_profiles`
-   `source_configs`

Do not create unnecessary complexity before V1 requires it.

------------------------------------------------------------------------

## 16. Observability

Every autonomous workflow must be inspectable.

Record:

-   task start
-   initiator
-   inputs
-   tools used
-   sources visited
-   candidate counts
-   errors
-   retries
-   model usage where available
-   decisions
-   approval requests
-   final actions
-   completion state

Do not store secrets in logs.

------------------------------------------------------------------------

## 17. Failure Handling

The system must fail safely.

-   Firecrawl failure → retry according to policy.
-   Incomplete source data → mark candidate incomplete.
-   Codex cannot confidently classify → request review rather than
    invent facts.
-   Savemax API rejects data → do not retry indefinitely.
-   Publishing fails → leave property as draft/pending.
-   Duplicate detected → do not create another listing.
-   Approval missing → do not publish/send/delete.

------------------------------------------------------------------------

## 18. AI Command Center

Eventually create an authenticated AI Command Center, potentially at:

`ai.holirotis.nl`

Possible dashboard information:

-   Agent status
-   Properties scanned
-   Candidates discovered
-   Candidates qualified
-   Awaiting approval
-   Drafts created
-   Properties published
-   Leads discovered
-   Leads qualified
-   Outreach prepared/sent
-   Replies
-   Recent agent runs
-   Pending approvals
-   Errors requiring attention

Include a command interface such as:

> Find investment properties under €600k around Amsterdam.

The dashboard is **NOT** the first implementation priority. Build the
backend workflow first.

------------------------------------------------------------------------

## 19. Do Not Do These Things

Do **NOT**:

-   replace Property Next
-   replace MongoDB with PostgreSQL
-   introduce another LLM without approval
-   allow autonomous destructive actions
-   expose databases publicly
-   hardcode credentials
-   store secrets in prompts
-   let browser automation become the primary Holirotis integration
-   publish properties without required approval
-   bulk-message leads without explicit authorization
-   scrape prohibited/private sources
-   build five agents before Property Hunter works
-   modify production architecture without inspecting it first

------------------------------------------------------------------------

## 20. Implementation Order

### Phase 0 --- Discovery

Inspect existing Holirotis repository.

Determine:

-   Next.js structure/version
-   authentication architecture
-   authorization/RBAC
-   MongoDB schemas
-   property schema
-   inquiry/customer schema
-   API conventions
-   deployment configuration
-   Docker configuration if present
-   environment variables
-   existing OpenAI functionality
-   existing admin architecture

**DO NOT MODIFY PRODUCTION CODE DURING INITIAL DISCOVERY.**

Produce findings first.

### Phase 1 --- AI Infrastructure

Prepare Savemax AI server.

Install/configure:

-   OpenClaw
-   n8n
-   PostgreSQL
-   Firecrawl
-   Chromium

Configure secure Docker/network architecture and verify service health.

### Phase 2 --- Savemax Agent API

Create secure API integration between AI infrastructure and Holirotis.

Start with minimal read/write operations necessary for property drafts.

Implement authentication, authorization, validation and audit logging.

### Phase 3 --- Property Hunter MVP

Implement:

`search → extract → normalize → deduplicate → store → score → rank → candidate presentation`

No automatic publication.

### Phase 4 --- Approval + Draft

Persistent approval workflow.

Approved candidate → Holirotis draft.

Verify schema mappings.

### Phase 5 --- Publishing

Approved draft → publish.

Add safeguards.

### Phase 6 --- Scheduled Property Discovery

n8n scheduled workflows.

Daily/periodic discovery.

Only surface genuinely useful new candidates.

### Phase 7 --- Lead Hunter

Lead discovery, qualification, deduplication and CRM/inquiry
integration.

### Phase 8 --- Outreach

Generate personalized outreach → human approval → send through approved
channels → track results.

### Phase 9 --- Command Center

Build AI dashboard.

------------------------------------------------------------------------

## 21. First Codex Instruction

Before writing code:

1.  Read this entire document.
2.  Treat items marked **LOCKED** as requirements.
3.  Inspect the existing Holirotis repository thoroughly.
4.  Do **NOT** make production changes yet.
5.  Produce a technical discovery report containing:
    -   repository architecture
    -   relevant directories/files
    -   current property model
    -   current lead/inquiry model
    -   authentication/RBAC model
    -   existing API architecture
    -   current deployment architecture
    -   existing AI/OpenAI integrations
    -   integration risks
    -   recommended Savemax API design
    -   recommended V1 implementation plan
6.  Identify assumptions in this document that conflict with the actual
    repository.
7.  Do not silently change architecture.

If a conflict exists, report:

``` text
CURRENT SYSTEM:
LOCKED REQUIREMENT:
CONFLICT:
RECOMMENDED RESOLUTION:
WAITING FOR OWNER APPROVAL:
```

------------------------------------------------------------------------

## 22. Owner's Core Requirement

The owner wants a system that behaves like a persistent AI business
operator.

Example lifecycle:

**Owner:** Find me potential real-estate properties.

**AI:** Researches approved internet sources, finds candidates,
cleans/analyzes them, stores its work, and presents the best candidates.

**Owner:** List 2, 5 and 7.

**AI:** Creates validated Holirotis drafts, obtains/uses required
approval, and publishes approved listings.

**Owner:** Now find leads for those properties.

**AI:** Researches appropriate sources, finds and qualifies prospects,
stores them, prepares outreach, waits for required communication
approval, and tracks outcomes.

This is a **CONTINUOUS system**.

It must remember operational history and avoid repeatedly starting from
zero.

------------------------------------------------------------------------

## 23. Final Locked Stack

``` text
OpenClaw
    +
n8n
    +
PostgreSQL
    +
Firecrawl
    +
Chromium
    +
Codex
    +
Savemax Agent API
    +
Existing Holirotis / Property Next
    +
Existing MongoDB
```

This is the baseline architecture.

**Do not redesign the stack merely because another framework is
preferred. Any architectural change to a locked component requires owner
approval.**

## 24. Owner decision — 2026-10-04

Human approval is required before the Agent API creates a MongoDB property draft. Research candidates and approval requests may be stored automatically in PostgreSQL. Publishing requires a separate approval and remains disabled in the current API increment. This resolves the differing draft gates described in section 7 and section 12/Phase 4.
