# SaveMax Agent API — approval and draft increment

Live base URL: `https://www.holirotis.nl/api/agent/v1` (deployed 2026-10-04).

Implemented: authenticated status, bounded tenant property reads, PostgreSQL candidate approval requests and approved Pending draft creation. No NextAuth session, admin cookie or SuperAdmin permission grants service access. Server configuration binds the credential to one organization and a non-SuperAdmin active creator. Suspended/cancelled organizations are denied. Human review uses a separate session-authenticated API and verifies the current user directly in MongoDB.

| Method | Route | Scope | Behavior |
| --- | --- | --- | --- |
| GET | `/status` | `status:read` | Configuration/capability status; publishing always disabled |
| GET | `/properties?page=1&limit=20&purpose=Sale` | `properties:read` | Tenant-only projection, max 50 records/page; optional purpose and status enums |
| POST | `/draft-approvals` | `drafts:create` | Validate and persist candidate/version payload for review; no MongoDB draft yet |
| POST | `/property-drafts` | `drafts:create` | Create only the exact approved payload, with Pending status |

Sale reads omit pricePeriod. Service reads exclude descriptions, images, exact street addresses, contact information, organization settings and financial records. Authorized human reviewers can see the exact submitted address/description. Responses use `{success,data,requestId}` or `{success:false,error:{code,message},requestId}` and are not cached. No browser CORS access is enabled. No delete/publish/outreach routes are provided.

## Credential provisioning

Generate a cryptographically random token beginning `smx_` followed by at least 43 base64url characters. Keep the raw token only in the caller's secret store. Save its SHA-256 hash in the existing server's protected environment file; do not paste either into logs or source control.

Required environment variables:

```text
SAVEMAX_AGENT_ENABLED=true
SAVEMAX_AGENT_KEY_SHA256=<64-character lowercase hex SHA-256>
SAVEMAX_AGENT_ORGANIZATION_ID=<existing tenant ObjectId>
SAVEMAX_AGENT_CREATOR_ID=<active non-SuperAdmin user in that tenant>
SAVEMAX_AGENT_KEY_EXPIRES_AT=<future ISO timestamp>
SAVEMAX_AGENT_SCOPES=status:read,properties:read
SAVEMAX_AI_DATABASE_URL=<private PostgreSQL connection URI>
```

Client sends `Authorization: Bearer <raw token>`. No credential is enabled by default. Disable or replace its hash to revoke/rotate. One credential per deployment is supported initially; multiple principals require a later registry. Apply an upstream IP allowlist and nginx rate limit during deployment. In-process throttling permits 60 authenticated requests/minute but resets on restart and is not a distributed limiter. Wrong-token requests should also be throttled upstream.

Before enabling draft operations, apply `migrations/savemax/001_draft_approvals.sql` with a migration credential against a dedicated PostgreSQL database. The runtime DB user needs SELECT/INSERT/UPDATE on the approval table and SELECT/INSERT plus sequence usage on the event table; it should not have schema administration rights. PostgreSQL must remain private. For approved drafts, add `drafts:create` to the service scopes. Configure NEXTAUTH_URL to the exact public origin for human review CSRF checks. `/status` capabilities describe configuration, not a database migration health probe.

## Approval workflow

Owner confirmed on 2026-10-04: human approval is required **before draft creation**, and publishing requires a separate approval. Approval state and audit events live in PostgreSQL. MongoDB contains the resulting property and a small agentImport provenance reference.

1. Service POST `/draft-approvals` with `{candidateId,draft}`. Candidate identifiers accept letters, digits, `.`, `_`, `:`, `-` and are 1–120 characters. Use a stable candidate/version ID for retries. Same ID/same normalized payload returns the existing request; changed payload returns 409 and requires a new version ID.
2. A database-verified SuperAdmin visits `/superadmin/ai-approvals` inside the SuperAdmin layout; an active tenant owner (`Organization.adminUser`) visits `/ai-approvals` inside the tenant layout. SuperAdmins opening the tenant URL are redirected to the platform route. The shared review component identifies the configured organization and shows the exact structured text, address, dimensions and pricing. Rights to advertise must be confirmed before approval. Neither service credentials nor session-supplied permission overrides authorize review. Tenant navigation uses `/api/agent-review/access` to show the link only to an authorized owner; the SuperAdmin menu links directly to its own route.
3. GET `/api/agent-review/approvals` lists the last 50 tenant requests. POST `/api/agent-review/approvals/:id` accepts `{decision:"APPROVED",rightsConfirmed:true}` or `{decision:"REJECTED"}`. Only unexpired PENDING requests may be decided; cross-tenant IDs are denied. Requests expire after seven days. An expired/rejected candidate needs a new version request.
4. Service POST `/property-drafts` with only `{approvalId}`. The API checks the tenant, locks the PostgreSQL approval row and checks state, human approver, expiry and payload hash. It writes the stored payload, never caller-supplied property fields. MongoDB status is forced to Pending, area to sqm, with no images or featured flags.
5. A reserved MongoDB ObjectId and set-on-insert write prevent duplication across retries/concurrent requests. A MongoDB success followed by PostgreSQL failure can reconcile on the next unexpired retry. Existing properties are never overwritten. Completed approval retries return the stored property ID. If expiry/deletion/manual changes prevent reconciliation, leave the non-public record for manual review rather than recreate or overwrite it.

Audit events record requested, approved/rejected and draft-created actions in the same PostgreSQL transaction as their corresponding state transition. A draft remains unpublished; publication approval is a later increment. Image imports, independent candidate research tables and draft editing are not included yet.

Example draft fields:

```json
{
  "candidateId": "approved-feed:example-123:v1",
  "draft": {
    "title": "Example Amsterdam apartment",
    "description": "Example property description for review; replace with verified source facts.",
    "propertyType": "Apartment", "purpose": "Sale", "price": 400000,
    "areaSize": 80, "areaUnit": "sqm", "bedrooms": 2, "bathrooms": 1,
    "address": "Example 1", "city": "Amsterdam", "country": "Netherlands",
    "rightsConfirmed": true
  }
}
```

For Rent/Lease also provide pricePeriod `month` or `year`. Unsupported fields, numeric strings, invalid dimensions and missing rights are rejected. External images are not accepted in this increment.

The API and approval workflow were deployed on 2026-10-04. PostgreSQL is configured privately on localhost; the application has a restricted runtime role. A tenant-bound service credential is stored in the server's protected secret directory. OpenClaw, n8n, Firecrawl and Chromium have not been installed by this deployment. Missing PostgreSQL configuration fails closed.

## Verification

Run focused tests: `npx tsx --test tests/agent-policy.test.mjs tests/agent-draft.test.mjs`.

Run targeted type checking: `npx tsc --project tsconfig.agent-check.json`.

Tests cover bad/missing keys, expiration, disabled configuration, absent tenant/creator, forbidden scope, tenant override/injection attempts, pagination limits, approval state/expiry, rights, input allowlists and stable payload hashing after PostgreSQL JSONB key reordering. These unit tests alone do not prove production behavior; database and deployed HTTPS integration results are recorded below. Runtime dependency audit reports no known vulnerabilities; five existing development-tool findings remain in the ESLint dependency chain.

## Live verification and operations

The build passed and 19 integration assertions passed against both the staged release and the public HTTPS address. Verification included actual human login/review, approval-required enforcement, rejected/expired/cross-tenant denial, concurrent draft retries, Mongo-success/approval-state recovery and persistent audit events. Synthetic test records were removed, leaving no synthetic properties or approval records. Homepage, login, rental listings and a homepage JavaScript asset returned 200; anonymous review access redirects to login and the service API returns 401 with no-store headers.

- Live release: `/opt/holirotis-propertynext/releases/20261004-approval-routing` (includes the role-specific routing correction).
- Previous release retained: `/opt/holirotis-propertynext/releases/20261004-map-referrer`.
- Service: `holirotis-propertynext`, port 3070 on localhost.
- PostgreSQL container: `savemax-ai-postgres`, localhost port 27028, pinned image digest `sha256:d74eeac9a635390a49bc21bd49fccd973de707e2a53a76ac49b552b8712ec46f`, persistent volume `savemax-ai-postgres-data`, memory limit 256 MiB and CPU limit 0.5.
- The runtime PostgreSQL role cannot delete audit events; verification cleanup used an administrative identity rather than widening application permissions.
- Private caller credential: `/opt/savemax-ai/secrets/agent-client.json`, root access only. Never expose this file through the website or paste its token into chat.
- Key expiration: 2027-01-02 UTC; renew or rotate before expiration.
- Business DB backup: `/opt/savemax-ai/backups/holirotis-before-agent-api.archive.gz`.
- Initial approval DB backup: `/opt/savemax-ai/backups/approvals-initial.dump`.
- Nginx throttles `/api/agent/v1/` at 5 requests/second per IP with burst 30, plus the application's 60 authenticated requests/minute limit. The zone definition is in `/etc/nginx/sites-enabled/savemax-agent-limits.conf` because this server does not include conf.d files.
- Rollback configuration: `/opt/holirotis-propertynext/backups/service-before-agent-api.service` and `nginx-before-agent-api.conf`. Restore the service configuration and restart to select the prior release; do not delete the persistent approval DB when rolling back.

The existing middleware convention produces a Next.js deprecation warning. Five development-tool audit findings remain; the runtime audit has no known findings. Browser interaction/visual QA and scheduled backup automation were not performed by this API release.

### Approval routing correction

The initial `/ai-approvals` page inherited the tenant dashboard shell even for SuperAdmins. The correction follows the existing App Router structure: `app/superadmin/ai-approvals/page.tsx` inherits `app/superadmin/layout.tsx`; `app/ai-approvals/page.tsx` remains the tenant-owner entry. Both reuse `components/agent/ApprovalReview.tsx`, with server-side database authorization and the configured organization name. The tenant sidebar capability request controls link visibility without granting privileges.

The corrected release passed the production build, targeted source checks and eight route/access assertions on staging and public HTTPS: login required; SuperAdmin old URL redirect; platform shell/navigation; role-specific capability URLs; tenant-owner shell; platform access denied to the tenant owner; non-owner access denied despite session role/permission claims. Existing homepage, login, rental listings, asset loading and API authentication checks also passed. No business or approval records were altered by this routing verification. The prior API release remains available, with `/opt/holirotis-propertynext/backups/service-before-approval-routing.service` for rollback.

