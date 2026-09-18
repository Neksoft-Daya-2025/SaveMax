/* Developed by RUDRA via NEKLLM */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const vault = path.join(root, 'SaveMax');
fs.copyFileSync(path.join(root, 'docs/software-knowledge/WHAT-NOT-TO-DO.md'), path.join(vault, 'Software Knowledge/WHAT-NOT-TO-DO.md'));
const nodes = [], edges = [];
function card(id, title, body, x, y, color='1', width=440, height=300) {
 nodes.push({id,type:'text',text:`## ${title}\n\n${body}`,x,y,width,height,color});
}
function arrow(a,b,label='then',color='4') { edges.push({id:`edge${edges.length}`,fromNode:a,toNode:b,fromSide:'right',toSide:'left',toEnd:'arrow',label,color}); }
card('intro','SaveMAX — What not to do','Project boundaries and lessons from the current source findings. These are team guardrails, not claims of implemented protection. Read the linked guide for full details.',0,-380,'5',940,230);
const rules=[
 ['Scope','Do not mix System with the lead-research Brain.\n\nDo not replace standalone frontend pages with anchors.\n\nDo not turn a small edit into unrelated work or deployment.'],
 ['Access','Do not equate login with authorization.\n\nDo not trust browser-supplied tenant or role IDs.\n\nDo not use truthiness for string permissions such as none.'],
 ['Privacy','Do not expose full records publicly.\n\nDo not treat an email submission as verified ownership.\n\nDo not publish credentials or private customer data.'],
 ['Data','Do not reset real data for a demo.\n\nDo not assume Mongoose references enforce tenant boundaries or cascades.\n\nDo not interchange Property and Unit records.'],
 ['Financial workflows','Do not hide partial failures.\n\nDo not equate a payment record with gateway settlement.\n\nDefine recovery for contract/status and payment/commission writes.'],
 ['Evidence','Do not call an inventory a full audit.\n\nDo not mark unresolved warnings as fixed.\n\nDo not assume integrations work because a page or dependency exists.'],
 ['Production','Do not deploy outside the requested scope.\n\nReview setup, seed, debug, test and backup endpoint guards.\n\nDo not claim readiness while known access/privacy gaps remain open.'],
 ['Documentation','Do not overwrite manual canvas work by regenerating blindly.\n\nKeep manual additions separate or change the generator.\n\nKeep source findings distinct from runtime evidence.']
];
rules.forEach(([title,body],i)=>card('rule'+i,title,body,(i%4)*540,Math.floor(i/4)*410));
nodes.push({id:'guide',type:'file',file:'Software Knowledge/WHAT-NOT-TO-DO.md',x:0,y:870,width:600,height:370});
nodes.push({id:'gaps',type:'file',file:'Software Knowledge/GAPS.md',x:720,y:870,width:600,height:370});
const steps=[['Scope','Identify the requested task and mode.'],['Inspect','Read relevant source and known gaps.'],['Change','Make the smallest appropriate change.'],['Verify','Check the affected behavior; record limits.'],['Document','Update findings and workflow notes.'],['Deploy if requested','Only within explicit deployment scope.']];
steps.forEach(([title,body],i)=>{card('step'+i,title,body,i*370,1420,'4',300,200);if(i)arrow('step'+(i-1),'step'+i);});
edges.push({id:'retry',fromNode:'step3',toNode:'step2',fromSide:'bottom',toSide:'bottom',toEnd:'arrow',label:'defect found → revise',color:'1'});
const ids=new Set(nodes.map(n=>n.id));
if(ids.size!==nodes.length||edges.some(e=>!ids.has(e.fromNode)||!ids.has(e.toNode)))throw Error('Invalid canvas connections');
for(const n of nodes.filter(n=>n.type==='file'))if(!fs.existsSync(path.join(vault,n.file)))throw Error('Missing linked note');
for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const a=nodes[i],b=nodes[j];if(a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y)throw Error('Overlapping cards');}
fs.writeFileSync(path.join(vault,'SaveMAX What Not To Do.canvas'),JSON.stringify({nodes,edges},null,2));
const start=path.join(vault,'SaveMAX Start Here.md');
let home=fs.readFileSync(start,'utf8');
if(!home.includes('[[SaveMAX What Not To Do]]')){home+='\n## Team guardrails\n\n- [[SaveMAX What Not To Do]] — boundaries and safe working sequence\n- [[Software Knowledge/WHAT-NOT-TO-DO|What not to do — full guide]]\n';fs.writeFileSync(start,home);}
console.log(`Guardrails canvas: ${nodes.length} nodes, ${edges.length} edges; links, IDs and non-overlap validated.`);
