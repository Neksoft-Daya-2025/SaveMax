# Save Max website changelog

## 0.1.3 — 2026-10-07

- Scope Save Max sign-in to its organization so the admin email can be used independently of the other site in the shared database.
- Resolve the signed-in user's profile by account ID when an email is shared across organizations.

## 0.1.2 — 2026-10-07

- Set the public phone and address on `www.savemax.ro` to the Romania contact details.
- Route public property phone links through the Save Max contact number on that domain.

## 0.1.1 — 2026-10-07

- Changed the Save Max public contact and support email to `contact@savemax.ro`.
- Updated support email defaults and fallbacks in the application.
- Routed Save Max property detail email links through the central contact address while preserving agent login accounts.

## 0.1.0 — 2026-10-07

- Synced the live Save Max property website source from the release serving `www.holirotis.nl`.
- Added the public site, property listings, account and listing flows, agent API, assets, and supporting source files to `System/`.
- Deployed the same website on `www.savemax.ro` with a separate Next.js process and domain specific authentication URL.

Release tags use the form `savemax-site-vX.Y.Z`.
