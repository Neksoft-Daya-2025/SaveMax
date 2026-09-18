/* Developed by RUDRA via NEKLLM */
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '..');
const docs = path.join(root, 'docs/software-knowledge');
const vault = path.join(root, 'SaveMax');
const inv = JSON.parse(fs.readFileSync(path.join(docs, 'inventory.json'), 'utf8'));
fs.mkdirSync(path.join(vault, 'Software Knowledge'), { recursive: true });
for (const name of ['README.md', 'INVENTORY.md', 'GAPS.md']) {
  const text = fs.readFileSync(path.join(docs, name), 'utf8').replaceAll('](../../', '](' + pathToFileURL(root + path.sep).href);
  fs.writeFileSync(path.join(vault, 'Software Knowledge', name), text);
}
fs.copyFileSync(path.join(docs, 'inventory.json'), path.join(vault, 'Software Knowledge/inventory.json'));
const reports = [];
function canvas(name) {
  const nodes = [], edges = [];
  const text = (id, title, body, x, y, color = '4', width = 360, height = 230) => {
    nodes.push({ id, type: 'text', text: `## ${title}\n\n${body}`, x, y, width, height, color }); return id;
  };
  const file = (id, name, x, y) => { nodes.push({ id, type: 'file', file: name, x, y, width: 440, height: 320 }); return id; };
  const edge = (a, b, label = '', color = '4', fromSide = 'right', toSide = 'left') => edges.push({ id: `e${edges.length}`, fromNode: a, toNode: b, fromSide, toSide, toEnd: 'arrow', label, color });
  const group = (id, label, x, y, width, height) => nodes.unshift({ id, type: 'group', label, x, y, width, height });
  const save = () => {
    const ids = new Set(nodes.map(n => n.id));
    if (ids.size !== nodes.length || edges.some(e => !ids.has(e.fromNode) || !ids.has(e.toNode))) throw new Error('Invalid nodes/edges');
    for (const n of nodes.filter(n => n.type === 'file')) if (!fs.existsSync(path.join(vault, n.file))) throw new Error('Missing file ' + n.file);
    const cards = nodes.filter(n => n.type !== 'group');
    for (let i = 0; i < cards.length; i++) for (let j = i + 1; j < cards.length; j++) {
      const a = cards[i], b = cards[j];
      if (a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y) throw new Error(`Overlapping cards: ${a.id}, ${b.id}`);
    }
    fs.writeFileSync(path.join(vault, name + '.canvas'), JSON.stringify({ nodes, edges }, null, 2));
    reports.push({ canvas: name, nodes: nodes.length, edges: edges.length, brokenEdges: 0, missingFiles: 0, overlappingCards: 0 });
  };
  return { text, file, edge, group, save };
}
const o = canvas('SaveMAX System Overview');
o.text('start', 'SaveMAX software map', `Source snapshot: ${inv.generatedAt.slice(0,10)}\n\n${inv.pages.length} pages · ${inv.apis.length} API route files · ${inv.models.length} models\n\nBlue: source map. Orange: caveat. Red: known gap. Arrows show relationships, not proof of successful execution.`, 0, 0, '5', 420, 280);
o.file('workflows', 'SaveMAX Workflows.canvas', 520, 0);
o.file('routes', 'SaveMAX Route Map.canvas', 1040, 0);
o.file('data', 'SaveMAX Data Model.canvas', 1560, 0);
o.edge('start', 'workflows', 'processes'); o.edge('workflows', 'routes', 'entry points'); o.edge('routes', 'data', 'storage map');
const overview = [
 ['public', 'Public frontend', 'Homepage placeholder; login; organization registration; public property/unit detail. Complete public browsing frontend pending.'],
 ['platform', 'Platform administration', 'Superadmin: organizations, subscriptions, global users, SaaS configuration, website content and profile.'],
 ['workspace', 'Organization workspace', 'Admin, Agent, Customer and Owner. Saved role permissions determine access; names alone do not.'],
 ['auth', 'Authentication and permissions', 'NextAuth credentials + bcrypt. Session → action permission → tenant/ownership scope. auth.ts; lib/rbac.ts; lib/tenant.ts.'],
 ['property', 'Property operations', 'Properties, units, amenities, agents and owners. Public detail and workspace management are separate surfaces.'],
 ['customer', 'Customer operations', 'Customers, bookings, inquiries, contracts, maintenance and customer dashboard.'],
 ['finance', 'Financial operations', 'Payments, invoice records, deposits, commissions, expenses, payroll, collection and reports.'],
 ['admin', 'Administration and content', 'Users, roles, staff, suppliers, settings, blogs, FAQs and reviews.'],
 ['stack', 'Application stack', 'Next.js App Router + React + TypeScript + Tailwind. API handlers and UI live in System. MongoDB through Mongoose.'],
 ['integrations', 'Integrations and AI', 'SMTP/Nodemailer; Twilio; maps dependency; AI-labelled routes. Configuration and successful external behavior remain unverified.'],
 ['brain', 'Separate SaveMAX Brain', 'Sibling lead-research project; interface established on port 4640. Not the System backend. Technical documentation stays here.'],
 ['risk', 'Known gaps', 'Property mutation scoping; contract reference validation; public document exposure; partial financial writes; session revocation and unresolved dashboard input warning.']
];
overview.forEach(([id,title,body],i) => o.text(id,title,body,(i%4)*520,480+Math.floor(i/4)*360,id==='risk'?'1':id==='integrations'?'2':'4',420,260));
o.edge('public','auth','protected actions'); o.edge('platform','auth','root session'); o.edge('workspace','auth','role + tenant');
o.edge('property','customer','booking / contract'); o.edge('customer','finance','accounting'); o.edge('stack','integrations','configured services');
o.file('guide','Software Knowledge/README.md',0,1660); o.file('gaps','Software Knowledge/GAPS.md',520,1660); o.file('inventory','Software Knowledge/INVENTORY.md',1040,1660);
o.edge('risk','gaps','review details','1','bottom','top');
const w = canvas('SaveMAX Workflows');
w.text('legend','Workflow reading guide','Each horizontal lane is a separate process. These flows summarize inspected source, not completed runtime tests. Orange/red steps identify uncertainty or defects. Other inventoried modules need deeper behavioral tracing.',0,-340,'5',700,230);
const flows = [
 ['Platform setup', [['Open setup','/setup → /api/setup'],['Check root exists','Existing root blocks initialization.'],['Create platform identity','Root user, role and SaaS settings.'],['Review setup safety','Concurrency and rollback require validation.','2']]],
 ['Organization onboarding', [['Submit organization','/create-organization → /api/public/organizations'],['Validate registration','Required fields, administrator email duplication, slug and plan.'],['Create tenant','Organization → default roles → administrator.'],['Review provisioning','Sequential failure recovery and default permission semantics need checks.','2']]],
 ['Sign-in and authorization', [['Credentials','Normalize email; load user, role and organization.'],['Login validation','Compare bcrypt hash; reject inactive user / suspended organization.'],['Issue session','Identity, role, permissions and organization stored in JWT/session.'],['Route and authorize','Middleware destination; each API must check action + resource scope.'],['Revocation gap','Test existing sessions after suspension or role reassignment.','2']]],
 ['Property read and mutation', [['Workspace request','/properties → /api/properties or /api/properties/[id]'],['Read guards','checkPermission + propertyViewFilter.'],['Scoped result','Tenant scope; own mode uses createdBy, agent or owner.'],['Mutation discrepancy','PUT/DELETE authenticate but use unscoped ID mutations.','1']]],
 ['Public booking', [['Property detail','Public /property/[id] or /unit/[id]; submitted contact/date.'],['Validate resources','Validate fields, property and unit relationship.'],['Associate user','Find email match or create guest. Email submission is not identity proof.','2'],['Create booking','Organization comes from property. Review abuse/identity requirements.']]],
 ['Contract creation', [['Submit contract','/api/contracts POST; create permission + authentication.'],['Resolve property owner','Reads property by ID; tenant and unit relationship checks incomplete.','1'],['Create contract','Inject caller organization; set owner from property.'],['Update availability','Sale → Sold; Rent/Lease → Rented. Unit branch counts available units before property update.'],['Partial-write risk','No enclosing transaction in inspected handler. Define recovery.','2']]],
 ['Payment and commission', [['Record payment','Clean optional references; resolve tenant timezone.'],['Create invoice record','Generate identifier and initial deposit history.'],['Save payment','Inject tenant and processedBy.'],['Attempt commission','Load property agent, calculate percentage/fixed commission.'],['Reconciliation gap','Commission failure is logged; payment still succeeds. Commission tenant association needs review.','2']]],
 ['Profile update', [['Edit profile','/profile or /superadmin/profile'],['Save identity','/api/profile saves account changes.'],['Refresh session','JWT reloads identity from database; client requests session update.'],['Header display','Header should use refreshed session. Regression coverage still required.','2']]],
 ['Notification delivery', [['Caller invokes helper','lib/notifications.ts; not every workflow is proven to invoke it.'],['Resolve configuration','Fetch settings over HTTP, then environment fallback.'],['Prepare provider','SMTP transporter or Twilio client.'],['Attempt delivery','Return success or false. No real delivery tested in this mapping.','2']]]
];
flows.forEach(([title, steps],row) => {
 const y=row*410;
 w.group('lane'+row,title,-30,y-65,steps.length*450,355);
 steps.forEach(([heading,body,color],col) => {
   const id=`w${row}_${col}`; w.text(id,heading,body,col*450,y,color||'4',370,250);
   if(col) w.edge(`w${row}_${col-1}`,id,'then');
 });
});
w.save();
const r=canvas('SaveMAX Route Map');
r.text('legend','Complete route inventory','Every page and API route from inventory.json appears below. Routes are grouped by URL area for navigation only; grouping does not prove a page calls a particular API. Handler methods are statically extracted. Authentication/authorization must be checked separately.',0,-360,'5',850,240);
const areas=new Map();
for(const p of inv.pages) { const k=p.route.split('/')[1]||'home'; if(!areas.has(k))areas.set(k,{pages:[],apis:[]}); areas.get(k).pages.push(p); }
for(const a of inv.apis) { const k=a.route.split('/')[2]||'root'; if(!areas.has(k))areas.set(k,{pages:[],apis:[]}); areas.get(k).apis.push(a); }
let y=0;
for(const [area,data] of [...areas].sort((a,b)=>a[0].localeCompare(b[0]))) {
 const height=Math.max(180,110+Math.max(data.pages.length,data.apis.length)*85);
 const id='area_'+area;
 r.text(id,area,`${data.pages.length} page routes\n\n${data.apis.length} API route files`,0,y,'5',260,180);
 r.text(id+'_pages','Pages',data.pages.map(p=>`**${p.route}**\n\`${p.file}\``).join('\n\n')||'No page route in this URL area.',360,y,'4',650,height);
 r.text(id+'_apis','API handlers',data.apis.map(a=>`**${a.methods.join(' / ')} ${a.route}**\n\`${a.file}\``).join('\n\n')||'No API route in this URL area.',1120,y,'3',780,height);
 r.edge(id,id+'_pages','page inventory'); r.edge(id+'_pages',id+'_apis','same URL area only');
 y+=height+100;
}
r.save();
const d=canvas('SaveMAX Data Model');
d.text('legend','Mongoose model relationships','All 23 model files and literal ref declarations. Arrows mean “references”, not a database-enforced foreign key. Tenant consistency and cascades need application checks. See INVENTORY for fields and source definitions for validation/hooks.',0,-380,'5',800,230);
const modelIds=new Set(inv.models.map(m=>path.basename(m.file,'.ts')));
inv.models.forEach((m,i)=>{
 const id=path.basename(m.file,'.ts');
 const fields=m.schemas.flatMap(s=>s.fields);
 const body=`Source: \`${m.file}\`\n\nFields: ${fields.join(', ')}\n\nReferences: ${m.references.join(', ')||'none detected'}`;
 d.text(id,id,body,(i%5)*610,Math.floor(i/5)*740,'4',500,Math.max(360,Math.ceil(body.length/52)*22+120));
 for(const target of m.references) if(modelIds.has(target))d.edge(id,target,'ref','3');
});
d.save();
o.save();
fs.writeFileSync(path.join(vault,'SaveMAX Start Here.md'), `# SaveMAX software canvas\n\nStart with [[SaveMAX System Overview]].\n\n- [[SaveMAX Workflows]] — nine inspected process lanes\n- [[SaveMAX Route Map]] — all ${inv.pages.length} pages and ${inv.apis.length} API route files\n- [[SaveMAX Data Model]] — ${inv.models.length} models and their references\n- [[Software Knowledge/README|Software guide]]\n- [[Software Knowledge/GAPS|Known gaps and required verification]]\n- [[Software Knowledge/INVENTORY|Full source inventory]]\n\nSource snapshot: ${inv.generatedAt}. This is a source-backed map, not certification of runtime correctness. Existing app and database were not changed.\n\nTo refresh from System: run \`node scripts/software-inventory.cjs\`, then \`node scripts/software-canvas.cjs\`. Generated canvas files and copied reference notes are overwritten by regeneration; keep manual notes in separate files.\n`);
fs.writeFileSync(path.join(docs,'canvas-validation.json'),JSON.stringify({generatedAt:new Date().toISOString(),reports},null,2));
console.log(JSON.stringify(reports,null,2));
require('./software-guardrails.cjs');
