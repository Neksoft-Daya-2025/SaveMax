# SaveMAX setup and team instructions

These commands target Windows PowerShell. Run them on your development machine. The repository contains source code, not the existing local database or account passwords.

## 1. Install prerequisites

Install Git, Node.js 22 with npm, and Docker Desktop. Start Docker Desktop using Linux containers. Obsidian is optional for the visual maps. Check:

```powershell
git --version
node --version
npm --version
docker version
```

## 2. Get the project

Run this in your chosen parent folder:

```powershell
git clone https://github.com/Neksoft-Daya-2025/SaveMax.git
cd SaveMax
```

The repository root contains `System` (application) and `brain` (lead-research workspace). All subsequent relative paths assume this root unless stated otherwise.

## 3. Start MongoDB

For a NEW local installation, create a persistent container:

```powershell
docker volume create savemax-local-mongo-data
docker run -d --name savemax-local-mongo --restart unless-stopped -p 127.0.0.1:27017:27017 -v savemax-local-mongo-data:/data/db mongo:8.0
```

If that container already exists, use `docker start savemax-local-mongo` instead. Do not delete an existing container or volume to resolve a name conflict. If port 27017 is already occupied, inspect the existing database before creating another one.

Check the database separately from the website:

```powershell
docker exec savemax-local-mongo mongosh --quiet --eval 'db.adminCommand({ping:1})'
```

Expected result includes `ok: 1`. This local configuration binds MongoDB only to loopback and is not a production database setup.

## 4. Configure and run System

```powershell
cd System
npm ci
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
notepad .env.local
```

Create `.env.local` with the following contents. Replace the secret placeholder with the generated value:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/property-next
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=PASTE_YOUR_GENERATED_SECRET_HERE
```

Keep `.env.local` private. Do not replace an existing secret unnecessarily, as changing it invalidates sessions. Optional SMTP, Twilio and other integration variable names are listed in [the inventory](software-knowledge/INVENTORY.md); those services need their own configuration.

```powershell
npm run dev
```

Keep this terminal running. Open http://localhost:3000. On a fresh database, visit http://localhost:3000/setup to create the platform administrator, then sign in at http://localhost:3000/login. If setup reports that a root account already exists, use that account; do not reset the database.

The homepage is currently a frontend-team placeholder. `/properties` is workspace property management; `/property/[id]` is a public detail route requiring a real record ID. Existing local/demo accounts are not recreated simply by cloning the repository. Demo autofill buttons do not prove matching database accounts exist.

## 5. Configure and run SaveMAX Brain

Open another PowerShell terminal at the repository root:

```powershell
cd brain/apps/3d-brain
```

On first setup only, create the local configuration:

```powershell
Copy-Item brain.config.example.json brain.config.json
```

Do not overwrite an existing custom configuration. Then:

```powershell
npm ci
npm run build
npm start
```

Open http://localhost:4640. The build is required on a fresh clone because generated renderer assets are excluded from Git. This interface is separate from System and does not use the System MongoDB database.

Relevant input belongs in the Brain's `context`, `workflows`, `references` and `decisions` folders. Use Markdown, clear headings, sources and dates; distinguish confirmed information from assumptions. Use the interface's rebuild action after note edits, or run `npm run build:graph` from the app folder. Restart after changing configuration or server code.

Private lead records and outreach data are excluded from Git. Create your private local tracker when needed. Do not add private notes to the public repository. Brain has no configured CRM or outreach delivery connection merely because it starts successfully.

## 6. Open the software maps

In Obsidian, choose **Open folder as vault** and select `System/SaveMax`. Open **SaveMAX Start Here.md**. It links to the overview, nine workflow lanes, route map, model map and What Not To Do canvas.

To regenerate the maps, run from `System`:

```powershell
node scripts/software-inventory.cjs
node scripts/software-canvas.cjs
```

Regeneration overwrites generated maps and reference-note copies. Keep manual notes separately or edit the generators. Regeneration also refreshes source links for your local checkout path.

## 7. Daily use and stopping

- Start Docker and the existing MongoDB container, then run `npm run dev` in `System`.
- Run `npm start` in `brain/apps/3d-brain` when you need Brain; rebuild its renderer after source changes.
- Stop each Node process with Ctrl+C in its terminal. Stop MongoDB with `docker stop savemax-local-mongo` if desired. Keep its persistent volume.
- Before deleting or migrating a database, make and verify a backup. The Git repository is not a database backup.

## 8. Common problems

| Symptom | Check |
|---|---|
| Website cannot connect to MongoDB | Docker running, container started, database ping successful, `.env.local` URI correct; restart Next after env changes. |
| Port 3000 or 4640 occupied | Check whether the intended app already runs. Do not terminate unrelated processes. |
| Login fails after cloning | Accounts live in MongoDB. Complete fresh setup or use credentials for the connected database. |
| Brain missing config or renderer | Copy the example once, install dependencies and run the Brain build. |
| Canvas links refer to another machine | Regenerate the canvases from your checkout. |
| GitHub push returns 403 | `gh api user --jq .login` shows the CLI account. Browser login and commit author email are different from push credentials. |

For GitHub CLI authentication, if installed, run `gh auth login --hostname github.com --git-protocol https --web`, sign into an account with repository write access, then run `gh auth setup-git`.

## 9. Team changes and publishing

Work from your cloned repository. Check `git status`, create a focused branch, make the change and run the relevant checks. Stage intended files explicitly, inspect `git diff --cached`, commit and push that branch for review. Never stage `.env.local`, database exports or private lead records. Keep third-party licenses and attribution.

Uploading source to GitHub does not deploy the app. Production deployment needs a separately selected host, secure database and configuration, and resolution or explicit assessment of [known gaps](software-knowledge/GAPS.md). The current maps are source documentation, not proof of production readiness.

See [What Not To Do](software-knowledge/WHAT-NOT-TO-DO.md) for development guardrails. No application runtime tests were performed when adding this guide.
