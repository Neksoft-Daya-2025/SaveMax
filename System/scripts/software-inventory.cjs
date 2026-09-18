/* Developed by RUDRA via NEKLLM */
// Read source only; never load application code, environment files, or the database.
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'docs/software-knowledge');
const walk = dir => fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${dir}/${e.name}`) : [`${dir}/${e.name}`]);
const files = ['app', 'components', 'models', 'lib', 'hooks', 'types'].filter(d => fs.existsSync(path.join(root, d))).flatMap(walk).filter(f => /\.[cm]?[jt]sx?$/.test(f));
for (const f of fs.readdirSync(root)) if (/\.[cm]?[jt]sx?$/.test(f)) files.push(f);
files.sort();
const route = f => '/' + f.split('/').slice(1, -1).filter(s => !s.startsWith('(')).join('/');
const link = f => `[${f}](../../${f})`;
const pages = [], apis = [], schemas = [], env = new Set();
for (const file of files) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true);
  for (const match of source.matchAll(/process\.env\.([A-Z][A-Z0-9_]*)/g)) env.add(match[1]);
  if (/\/page\.[jt]sx?$/.test(file)) pages.push({ route: route(file), file });
  if (/\/route\.[jt]sx?$/.test(file)) {
    const methods = new Set();
    for (const statement of ast.statements) {
      if (ts.isVariableStatement(statement) && statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword)) {
        for (const declaration of statement.declarationList.declarations) {
          if (ts.isObjectBindingPattern(declaration.name)) for (const e of declaration.name.elements) methods.add(e.name.getText(ast));
          else if (ts.isIdentifier(declaration.name)) methods.add(declaration.name.text);
        }
      }
      if (ts.isFunctionDeclaration(statement) && statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) && statement.name) methods.add(statement.name.text);
      if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) for (const e of statement.exportClause.elements) methods.add(e.name.text);
    }
    apis.push({ route: route(file), file, methods: [...methods].filter(m => /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)$/.test(m)) });
  }
  if (file.startsWith('models/')) {
    const found = [];
    const visit = node => {
      if (ts.isNewExpression(node) && /(^|\.)Schema$/.test(node.expression.getText(ast)) && node.arguments?.[0] && ts.isObjectLiteralExpression(node.arguments[0])) {
        found.push({ fields: node.arguments[0].properties.map(p => p.name?.getText(ast)).filter(Boolean), line: ast.getLineAndCharacterOfPosition(node.getStart(ast)).line + 1 });
      }
      ts.forEachChild(node, visit);
    };
    visit(ast);
    schemas.push({ file, schemas: found, references: [...new Set([...source.matchAll(/ref:\s*['"]([^'"]+)['"]/g)].map(m => m[1]))] });
  }
}
fs.mkdirSync(out, { recursive: true });
const inventory = { generatedAt: new Date().toISOString(), sourceFiles: files, pages, apis, models: schemas, environmentVariableNames: [...env].sort() };
fs.writeFileSync(path.join(out, 'inventory.json'), JSON.stringify(inventory, null, 2) + '\n');
const lines = ['# Source inventory', '', 'Regenerate with `node scripts/software-inventory.cjs` from System. This reads source without starting the app or accessing its database. Generated inventory is a snapshot, not proof of working features or authorization.', '', `Coverage: ${files.length} application/config source files, ${pages.length} page routes, ${apis.length} API route files, ${schemas.length} model files.`, '', '## Pages', '', '| Route | Source |', '|---|---|', ...pages.map(p => `| \`${p.route}\` | ${link(p.file)} |`), '', '## API routes', '', 'Methods are exported handler names; access controls and middleware must be reviewed separately. Dynamic segments retain Next.js notation.', '', '| Route | Methods | Source |', '|---|---|---|', ...apis.map(p => `| \`${p.route}\` | ${p.methods.join(', ')} | ${link(p.file)} |`), '', '## Models', '', 'Fields are top-level fields of each literal Schema declaration, including nested schema declarations when present. Follow source links for types, validation, defaults, indexes, hooks and nested fields. References are literal Mongoose ref declarations.', '', ...schemas.flatMap(m => [`### ${path.basename(m.file, '.ts')}`, '', `Source: ${link(m.file)}. References: ${m.references.join(', ') || 'none detected'}.`, '', ...m.schemas.map(s => `Schema at line ${s.line}: ${s.fields.map(f => '`' + f + '`').join(', ')}.`), '']), '## Environment variable names', '', 'Names only; values and secrets are intentionally excluded. Presence in code does not mean the integration is configured.', '', ...[...env].sort().map(n => `- \`${n}\``), '', '## Coverage limits', '', 'Includes app, components, models, lib, hooks, types and root JavaScript/TypeScript files. Excludes dependencies, generated output, uploaded assets, sibling Brain, scripts and non-code configuration. AST extraction covers named exported handlers and literal Schema fields; computed schemas, aliases and runtime-generated routes require manual review.', ''];
fs.writeFileSync(path.join(out, 'INVENTORY.md'), lines.join('\n'));
console.log(JSON.stringify({ sourceFiles: files.length, pages: pages.length, apiRoutes: apis.length, models: schemas.length }));
