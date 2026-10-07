const fs=require('fs'),ts=require('typescript'),Module=require('module'),assert=require('assert/strict');
function load(name){const p=require('path').resolve('models/'+name+'.ts');const m=new Module(p,module);m.filename=p;m.paths=module.paths;m._compile(ts.transpileModule(fs.readFileSync(p,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,p);return m.exports.default;}
const Organization=load('Organization'),Settings=load('Settings');
const org=new Organization({name:'Test',slug:'test',email:'test@example.com',settings:{kvkNumber:' 00123456 ',currency:'EUR'}});
assert.equal(org.settings.kvkNumber,'00123456');assert.equal(org.toObject().settings.kvkNumber,'00123456');assert.equal(org.settings.currency,'EUR');
const global=new Settings({storeName:'Test',kvkNumber:' 00123456 '});assert.equal(global.kvkNumber,'00123456');assert.equal(new Settings().kvkNumber,'');
console.log('PASS: tenant and global KVK fields retained; whitespace trimmed; leading zeros preserved; optional empty default');