# Knowledge gaps and source findings

Assessment: 18 September 2026. Findings below are source observations, not evidence that a live exploit occurred. No application fixes or database changes were made as part of this documentation task.

## Priority findings

| Priority | Finding and evidence | Required next verification or change |
|---|---|---|
| High | [Property PUT/DELETE](../../app/api/properties/[id]/route.ts) authenticate but use unscoped `findByIdAndUpdate`/`findByIdAndDelete`; GET has stronger access filtering. | Enforce action permissions, organization and appropriate ownership for mutations. Test denied roles and cross-organization IDs. |
| High | [Contract POST](../../app/api/contracts/route.ts) reads property by ID and updates submitted unit by ID without proving both belong to the caller's organization or to each other. | Validate all referenced parties/resources within tenant scope before writes. |
| High | [Public property GET](../../app/api/public/property/[id]/route.ts) returns a full property record; [Property schema](../../models/Property.ts) includes document URLs and identity references. | Define an explicit public field allowlist and publication policy. Inspect unit output similarly. |
| Medium | Property PUT's submitted `units` branch creates Property records, while a separate Unit model exists; individual create failures can be swallowed. | Resolve intended data semantics and define atomic/partial-success behavior before changing it. |
| Medium | Contract create and status changes are sequential; payment commission creation failure does not fail payment creation. | Verify recovery/reconciliation behavior and decide where transactions are required. |
| Medium | [Payment POST](../../app/api/payments/route.ts) creates commission without an explicit organization field in that payload. | Check schema hooks/defaults and commission tenant queries; verify association and visibility. |
| Medium | [Public booking](../../app/api/public/bookings/route.ts) associates an existing user based on a submitted email. | Define guest identity verification and prevent unverified submissions being treated as account-authorized actions. |
| Medium | [Auth JWT](../../auth.ts) identity refresh does not establish immediate account/org revocation or changed role reassignment for existing sessions. | Test inactive user, suspended org and role changes using already-issued sessions. |
| Medium | [Default role helper](../../lib/tenant.ts) mixes boolean and string view values; `none` is truthy in JavaScript. | Check newly provisioned Customer/Agent navigation with exact view comparisons throughout the app. |
| Review | [Notification settings fetch](../../lib/notifications.ts) makes a server HTTP request without forwarding a user session. | Verify whether protected settings can be read and whether configured credentials are available through the intended secure path. |

## Outstanding behavioral questions

- The reported controlled-to-uncontrolled input warning on `/dashboard` has not been reproduced with the exact role and action. Keep it open until the triggering input is identified and a regression is verified.
- AI-labelled pages are inventoried, but actual provider readiness, fallback behavior, cost controls and factual grounding have not been certified.
- Production access to debug, test, seed and setup endpoints needs a dedicated review. Their existence is not itself proof of exposure; inspect guards and deployment conditions.
- Upload validation, backup privacy/restore, deletion dependencies, monetary rounding, invoice uniqueness, date boundaries, report reconciliation and subscription enforcement require targeted checks.
- All 72 API route files are inventoried; this is not a complete per-method authorization audit. Other handlers may have similar scoping gaps.
- Current process status, database contents/indexes and external service credentials were not validated in this documentation pass.

## Evidence needed before claiming comprehensive behavioral coverage

1. A per-handler matrix for unauthenticated, Superadmin, organization Admin, Agent, Customer and Owner access, including two distinct organizations and `own` permission cases.
2. End-to-end create/update/delete flows with validation failures and missing/deleted related records.
3. Contract/payment/commission reconciliation after partial failure and concurrent requests.
4. Profile/session refresh and revocation tests using already-open sessions.
5. Public response privacy, upload, setup/seed/debug and backup checks.
6. Runtime verification of each integration using safe test destinations and provider test modes where available.

Record date, source revision or file snapshot, scenario, expected result and actual evidence. Mark a finding resolved only after the implementation and targeted verification support that conclusion.
