# Save Max website deployment

The deployed source is in `System/`. The original live instance runs as `holirotis-propertynext.service` on port 3070. The `www.savemax.ro` instance runs from `/home/savemax/htdocs/www.savemax.ro` as `savemax-propertynext.service` on port 3000. Nginx redirects each bare domain to its `www` host.

Both instances currently use the same MongoDB and Save Max AI database, so site content and account data are shared. Each instance has its own private `.env.local`, `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`. Keep these secrets, database contents, dependencies, and `.next` output out of Git.

## Update

1. Back up the current application, private environment, and databases.
2. Deploy the desired `System/` version to the target runtime directory without overwriting `.env.local`.
3. Run `npm ci` and `npm run build` as the site user.
4. Restart the corresponding systemd service.
5. Verify the homepage, property pages, static assets, sign in flow, and API health before switching traffic.

## Rollback

Check out the previous `savemax-site-vX.Y.Z` tag, rebuild, and restart. Restore a matching database backup if the release changed stored data. Retain the prior Nginx configuration until the new release is verified.
