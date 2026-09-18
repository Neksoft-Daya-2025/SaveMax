# SaveMAX — What not to do

Team guardrails derived from the agreed project scope and the source findings in [GAPS.md](GAPS.md). These are guidance, not evidence that the application already enforces them. Existing instructions from the user take precedence; recommendations below do not create new approval requirements.

## Project boundaries

- **Do not mix System with the lead-research Brain.** Keep application implementation and technical maps in System; Brain remains for business context, leads, research workflows and decisions.
- **Do not replace standalone frontend pages with anchor sections.** The public frontend is assigned to the team; preserve login and workspace routes when that frontend is implemented.
- **Do not treat a design edit as authorization to deploy, alter a database or change unrelated behavior.** Follow the task routing policy and use checks proportionate to the request.
- **Do not overwrite existing work or hand-edited canvas notes during regeneration.** The generated canvases are rebuilt by the generator; put manual additions in separate notes, or update the generator for persistent changes.

## Access and privacy

- **Do not equate being logged in with permission to change a record.** Check the requested action, organization and ownership on the server. The current property PUT/DELETE handlers are a known gap, not a pattern to copy.
- **Do not trust organization, owner, role or related-record IDs supplied by a browser.** Derive identity from the session and verify every related record belongs to the allowed tenant and resource.
- **Do not use truthiness for string permissions.** `none` is a nonempty string. Compare allowed values explicitly.
- **Do not treat a submitted email as verified account ownership.** Public booking needs a clear guest/identity policy.
- **Do not expose complete database records through public APIs.** Select explicitly approved public fields; property documents and internal references need privacy review.
- **Do not assume hiding a button protects an API, or that role changes immediately revoke an existing session.** Verify direct requests and already-open sessions.

## Data and financial integrity

- **Do not delete or reset real data to make a demo work.** Use clearly separated demo records and accounts; never publish real account credentials.
- **Do not assume Mongoose references enforce tenant boundaries, foreign keys or deletion cascades.** Validate relationships and define deletion behavior explicitly.
- **Do not treat Property and Unit as interchangeable records.** Resolve the existing property mutation discrepancy before extending it.
- **Do not report an entire business workflow as successful when only the first write succeeded.** Contract/status changes and payment/commission creation need defined recovery or reconciliation for partial failures.
- **Do not describe a recorded payment as money settled by a gateway.** Payment records and external payment confirmation are distinct facts.
- **Do not place passwords, tokens, private customer data or database dumps in canvases, source comments or shared documentation.** Document variable names and configuration steps without secret values.

## Verification and release

- **Do not call an inventoried feature fully tested.** Route/model coverage is not behavioral coverage; keep source evidence and runtime evidence separate.
- **Do not claim 100% knowledge, production readiness or security from the canvas.** The unresolved findings remain open until fixed and verified.
- **Do not assume SMTP, SMS, maps or AI work because dependencies or pages exist.** Verify configuration and behavior with appropriate test data; do not send real messages merely to populate a demo.
- **Do not dismiss the dashboard input warning without reproducing its trigger.** Identify the exact role, input and action, then verify the correction.
- **Do not expose setup, seed, debug, backup or test endpoints in production without reviewing their access and environment guards.** Existence alone is not proof of a vulnerability, but each requires a deliberate review.
- **Do not run full builds, browser checks or deployments for every small edit.** Follow the requested mode; run targeted checks for actual behavior changes and requested broader checks when appropriate.

## Working sequence

Identify the requested scope → inspect the relevant source and known gaps → make the smallest appropriate change → verify the affected behavior at the required level → update the documentation → deploy only within explicit deployment scope.

If verification finds a defect, return to the implementation step. If the task is documentation-only, update the map and record limitations without claiming application fixes.
