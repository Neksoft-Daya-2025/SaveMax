# SaveMAX

**Start here: [Full setup and team instructions](System/docs/SETUP.md)**

SaveMAX application, source documentation, Obsidian canvases and SaveMAX Brain.

## Contents

- `System/`: Next.js property platform, MongoDB models, and the public Save Max website.
- `System/docs/software-knowledge/`: architecture, route/model inventory and known gaps.
- `System/SaveMax/`: Obsidian vault with system and workflow canvases. Open this folder as a vault.
- `brain/`: AIS-OS-based lead research workspace and local 3D interface.

## Run System locally

Use Node.js 22 and a local MongoDB instance. In `System`, run `npm ci`, create `.env.local` with the values below, then run `npm run dev`.

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/property-next
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-new-random-secret
```

Generate a secret with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Do not commit real environment files. Review the environment variable inventory for optional integrations. Open http://localhost:3000. Initial platform setup is available at `/setup` when no root account exists.

## Run Brain locally

In `brain/apps/3d-brain`, copy `brain.config.example.json` to `brain.config.json`, run `npm ci`, `npm run build`, then `npm start`. Open http://localhost:4640. Generated files and private research are excluded from version control. Source folders in the example configuration are relative to the Brain folder.

## Status and attribution

`System/` includes the source of the Save Max property website currently served on `www.holirotis.nl` and `www.savemax.ro`. See [the deployment guide](System/DEPLOYMENT.md) and [changelog](System/CHANGELOG.md). Read `System/docs/software-knowledge/GAPS.md` before extending production features; that inventory predates this live source import.

SaveMAX development credit: Neksoft Global Service Pvt. Ltd. Source attribution: Developed by RUDRA via NEKLLM.

Brain derives from https://github.com/nateherkai/AIS-OS. Its original license and notices are retained in `brain/LICENSE`; renderer dependency notices are retained with the app. This repository does not grant additional rights over third-party materials.

Local credentials, database contents, private leads, dependencies, build output and personal Obsidian settings are intentionally excluded.

Save Max website releases are tagged `savemax-site-vX.Y.Z` so the deployed site can be traced independently from the Brain workspace.
