# SaveMax AI — Phase 0 discovery

Date: 2026-10-04. Scope: source inspection and read-only production inspection. No application source, database records, services or production configuration changed. The complete owner-provided master plan has been copied into this repository. This report is an integration assessment, not a complete penetration test or load test.

## Conclusion

The locked architecture can sit alongside the existing application without replacing Next.js or MongoDB. The application does not yet provide a secure autonomous-agent interface. Implement tenant-scoped service authentication, persistent approval enforcement and a draft adapter before granting any AI production write access. Complete Property Hunter first; defer Lead Hunter, sending and the full Command Center.

## Current architecture and evidence

| Area | Current implementation |
| --- | --- |
| Application | Next.js App Router, TypeScript, React; `package.json` declares Next `^16.0.10`, React `19.2.1`, Mongoose `^9.0.0`, NextAuth `^5.0.0-beta.30`, Tailwind 4. These are manifest versions, not a verified deployed dependency inventory. |
| Routes | `app/` pages and `app/api/**/route.ts` handlers; tenant administration and separate `app/superadmin` area. |
| Data | `models/`, `lib/mongodb.ts`, `lib/initModels.ts`; MongoDB/Mongoose owns business records. |
| Authentication | `auth.ts`: credential login, bcrypt password checking, JWT sessions, populated role and organization. |
| Authorization | `lib/rbac.ts`, `lib/tenant.ts`, `middleware.ts`; handlers must enforce API permissions themselves. |
| Storefront | `lib/public-site.ts`, `app/site/[slug]/[[...path]]/page.tsx`; middleware rewrites `/` to Save Max. Public visibility currently requires property status `Available`. |
| Public listing intake | `app/api/public/sites/[slug]/submissions/route.ts`, `lib/public-account.ts`, `lib/listing-submission.ts`: authenticated customer submission, validated fields/photos, tenant binding, explicit `Pending` status. |
| Existing AI | `app/api/property-assistant/route.ts`, `app/api/ai-reports/route.ts`, `models/Settings.ts`: direct OpenAI Chat Completions calls; configurable model with `gpt-4o` fallback. No persistent Property Hunter or Codex integration found in inspected application paths. |

The existing knowledge graph is indexed, but its architecture snapshot omits recent storefront additions. Current files were inspected to resolve that discrepancy.

## Property mapping

`models/Property.ts` requires title, description, property type, purpose, price, area size, address/city/country and creator. Types: Apartment, House, Villa, Land, Commercial, Office, Shop. Purposes: Sale, Rent, Lease. Statuses: Available, Sold, Rented, Booked, Pending; default is Available. Area unit defaults to sqft; explicitly map Dutch source areas to sqm. Price period defaults to month; require month/year for rental or lease data and do not display a recurring suffix for sales.

Organization is indexed but optional at schema level. Agent/owner reference User. Images have URL and featured flag; optional media, amenities and SEO fields exist. There is no distinct DRAFT state, publication version, approval record, source identifier or idempotency constraint. Public visibility is coupled to availability.

`app/api/properties/route.ts` is a human-session CRUD endpoint, with tenant injection and permission checks. Its creation payload accepts supplied fields and otherwise inherits model defaults. Do not use it as an unrestricted AI insertion endpoint.

Recommended V1 adapter: validated AI draft -> MongoDB Property with explicit Pending, explicit organization and dedicated integration creator, plus provenance/candidate ID/version metadata. Never inherit Available. Publishing should conditionally change only the approved version to Available. A future independent publication state would be cleaner, but requires an agreed migration and storefront/admin changes.

## Leads, customers and inquiries

`models/Inquiry.ts` requires a property, name, email and message. It supports New, Follow-up, Contacted, Closed and Junk, optional unit/agent/customer, notes and organization. It has no prospect provenance, consent, suppression or outreach lifecycle.

`app/api/customers/route.ts` reads and creates **User** records with Customer roles and customerDetails. `models/Customer.ts` also exists, but is not the canonical store used by that endpoint. Do not integrate by assuming the similarly named model is authoritative.

`app/api/inquiries/route.ts` creation binds customer to the authenticated user. It cannot be reused unchanged for an AI-created prospect associated with another customer. Research prospects belong in PostgreSQL first. Promote only validated, legitimate contacts to business records under an explicitly designed CRM handoff; a researched prospect is not automatically an inbound inquiry.

## Authentication and security findings

These are source-level findings; no exploit attempts were performed.

1. Existing AI endpoints lack handler authentication, RBAC and tenant filters. Property assistant GET queries properties globally; assistant POST and AI reports use global settings/data. Protect and scope these before extending AI access. The new Agent API must not inherit this pattern.
2. In `auth.ts`, JWT session update accepts supplied permissions. Permissions should be derived exclusively from trusted server-side role data; do not accept a client permission object.
3. The RBAC view check compares against `none`; false or undefined can pass that preliminary check when a resource object exists. Normalize and explicitly validate allowed scope values.
4. Tenant helper behavior for a session without an organization can target organization-null records, and injection can leave a payload unchanged. Service access must deny missing tenant identity rather than using these fallbacks.
5. Global Settings stores the OpenAI key as a string field. Do not pass it to prompts or agents; use restricted secret storage and redact logs. Secret values were not inspected.
6. A human Agent role is not a machine service principal. Never use the owner's admin password or SuperAdmin session for AI execution.

## Production snapshot

Read-only SSH inspection confirmed:

- Service `holirotis-propertynext`: active, user `propertynext`.
- Working directory `/opt/holirotis-propertynext/releases/20261004-map-referrer`.
- Host Node `v20.20.2`.
- MongoDB container `holirotis-propertynext-mongo`, bound to `127.0.0.1:27027`.
- RAM: 7,940 MiB total, 5,308 MiB available at inspection.
- Swap: 2,008 / 2,047 MiB used.
- Root disk: 76 / 96 GB used, 20 GB available, 80% utilization.
- Load averages: 0.48 / 0.48 / 0.50. A snapshot does not establish sustained capacity.

Keep the new AI workload on a separate VPS as proposed. No AI VPS address or verified server credentials have been supplied. Do not install crawling/browser workers on the website server based on spare RAM alone. Full Nginx/environment inventory, backup restoration and deployment dependency reconciliation remain release work; this inspection did not expose secret values or alter running services.

Relevant application environment names include MONGODB_URI, NEXTAUTH_SECRET and NEXTAUTH_URL. AI infrastructure will need its own database credentials, service keys, encryption secrets and provider authentication, outside source control.

## Recommended Agent API contract

Keep `/api/agent/v1` inside Next.js. PostgreSQL owns operational tasks/candidates/approvals; MongoDB owns application records. Do not duplicate canonical candidates into MongoDB merely to fit a route name.

| Operation | Proposed endpoint | Authority |
| --- | --- | --- |
| Health/capabilities | GET `/api/agent/v1/status` | Tenant-scoped service read |
| Match existing listings | GET `/api/agent/v1/properties` | Bounded tenant projection |
| Create draft | POST `/api/agent/v1/property-drafts` | Validated candidate and idempotency key |
| Update draft | PATCH `/api/agent/v1/property-drafts/:id` | Pending-only, expected version |
| Publish | POST `/api/agent/v1/property-drafts/:id/publish` | Verified human approval for exact payload/version |

Design lead endpoints later. Omit delete and outreach-send permissions from the first service credential.

Require hashed, rotatable service credentials bound to one organization and a fixed scope set. Derive tenant from credentials, never request payload. Apply field allowlists, bounded inputs, rate limits, private-network/IP restrictions where feasible, TLS and audit correlation IDs. Never grant direct MongoDB access to OpenClaw or n8n.

Approvals must bind organization, target, action, payload hash/version, approver, expiry and execution result. An AI caller cannot self-approve. The trusted publish handler verifies an approval through an authenticated approval service or signed assertion and enforces replay protection locally. An arbitrary approval ID from the caller is insufficient.

Use durable idempotency and conditional writes. PostgreSQL and MongoDB cannot share one ordinary transaction: track requested/applied/reconciled outcomes, persist Mongo result IDs, and reconcile retries after timeouts. A retry must not duplicate a draft or re-publish an edited payload. Do not rely on n8n run history as the only business audit trail.

## Locked-stack conflicts and decisions

### Draft terminology

CURRENT SYSTEM: Pending exists; DRAFT and independent publication status do not.

LOCKED REQUIREMENT: Create a non-public draft, publish only with approval.

CONFLICT: Directly writing Available bypasses that boundary; adding DRAFT without migration breaks existing assumptions.

RECOMMENDED RESOLUTION: V1 Pending adapter with provenance/version and explicit publication gate; consider separate publication state later.

WAITING FOR OWNER APPROVAL: Agreement on draft mapping before implementation.

### Automatic draft permission

CURRENT SYSTEM: No autonomous draft policy.

LOCKED REQUIREMENT: Section 7 permits automatic drafts; section 12 and Phase 4 describe approved candidate -> draft.

CONFLICT: The document gives two different candidate-to-draft gates.

RECOMMENDED RESOLUTION: Initially require candidate approval for MongoDB draft creation; automatic research and PostgreSQL candidate storage continue. Publishing always requires separate approval of the final draft.

WAITING FOR OWNER APPROVAL: Choose the intended draft gate.

### Existing AI provider

CURRENT SYSTEM: Generic Chat Completions features with configurable model/gpt-4o fallback.

LOCKED REQUIREMENT: Codex is the new reasoning layer.

CONFLICT: Existing features are not a Codex integration and must not be silently treated as one.

RECOMMENDED RESOLUTION: Keep SaveMax AI's Codex adapter separate; scope/harden existing endpoints before integration. No alternative primary model is proposed.

WAITING FOR OWNER APPROVAL: Server account/auth method and whether legacy AI features should remain available.

### Runtime integration readiness

CURRENT SYSTEM: No verified OpenClaw deployment or end-to-end Codex connection.

LOCKED REQUIREMENT: OpenClaw + Codex, self-hosted persistent operations.

CONFLICT: Selecting the products does not establish compatible configured versions, credentials or account limits.

RECOMMENDED RESOLUTION: Pin versions and prove one private, constrained tool call with the actual account before building the workflow. Official Codex documentation supports ChatGPT and API-key sign-in, including headless device authentication, and recommends API keys for programmatic CLI workflows. Account availability and the OpenClaw adapter remain unverified. See [official authentication documentation](https://learn.chatgpt.com/docs/auth).

WAITING FOR OWNER APPROVAL: AI server and credential/billing choice; no credential transfer or provider call occurred in discovery.

## V1 delivery sequence and acceptance

1. Resolve draft policy, provide AI VPS, select supported Codex credentials, define approved sources/rights and initial search/scoring criteria.
2. Prepare isolated Docker services for the locked stack; separate n8n's internal database from SaveMax operational data/users, backups and resource limits; keep gateway, database and browser-debug ports private. Verify recovery and a constrained OpenClaw/Codex call.
3. Implement narrowly scoped Agent API and the security findings required for its safe boundary. Acceptance: cross-tenant access denied, absent tenant denied, duplicate request returns one draft, draft stays non-public, revoked key denied.
4. Build one approved-source Property Hunter: task -> extraction -> normalized provenance -> deduplication -> scored candidates -> simple review. Store rejected/incomplete candidates and retry history. Missing facts stay missing; source content cannot instruct the agent to change tools or permissions.
5. Add candidate approval -> Pending draft preview. Validate mandatory fields, image rights, EUR/area units and correct sale/rent/lease pricing. Candidate duplicates must link to existing records.
6. Add exact-version publication approval. Acceptance: missing/expired/wrong-tenant approvals denied; edited draft invalidates approval; retry reconciles one publication; resulting property appears through the existing storefront filter.
7. Add bounded n8n schedules and meaningful notifications, then Lead Hunter, approved outreach and the full Command Center in the master plan's order.

No implementation or deployment was performed. Remaining external inputs are the AI server, supported account credentials, source permissions, market/scoring criteria and the draft-policy decision. Detailed vendor deployment compatibility and source-specific legal review are not established by this repository assessment.
