const fs=require('fs'),ts=require('typescript'),Module=require('module'),mongoose=require('mongoose');
function model(name){const path=require('path').resolve('models/'+name+'.ts');const mod=new Module(path,module);mod.filename=path;mod.paths=module.paths;mod._compile(ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText,path);return mod.exports.default;}
const User=model('User'),Role=model('Role'),Property=model('Property');
(async()=>{
 await mongoose.connect(fs.readFileSync('.env.local','utf8').match(/^MONGODB_URI=(.*)$/m)[1].trim());
 const org=await mongoose.connection.collection('organizations').findOne({slug:'save-max',status:'active'});
 if(!org)throw Error('Save Max tenant not found');
 const agentRole=await Role.findOne({organization:org._id,name:'Agent'}),ownerRole=await Role.findOne({organization:org._id,name:'Owner'});
 if(!agentRole||!ownerRole)throw Error('Tenant Agent or Owner role missing');
 const groups=[
 {agent:'Sample - Emma de Vries',agentEmail:'savemax.agent.emma@example.com',specialization:['Apartment'],experience:6,owner:'Sample - Canal Homes',ownerEmail:'savemax.owner.canal@example.com',company:'Sample Canal Homes',properties:['Sample - Amsterdam Canal Apartment','Sample - Utrecht City Apartment']},
 {agent:'Sample - Lucas van Dijk',agentEmail:'savemax.agent.lucas@example.com',specialization:['House','Villa'],experience:8,owner:'Sample - Westland Estates',ownerEmail:'savemax.owner.westland@example.com',company:'Sample Westland Estates',properties:['Sample - Rotterdam Family House','Sample - The Hague Garden Villa']},
 {agent:'Sample - Sophie Jansen',agentEmail:'savemax.agent.sophie@example.com',specialization:['Office','Commercial'],experience:5,owner:'Sample - Brabant Commercial',ownerEmail:'savemax.owner.brabant@example.com',company:'Sample Brabant Commercial',properties:['Sample - Eindhoven Office Suite']}
 ];
 const titles=groups.flatMap(g=>g.properties);
 const properties=await Property.find({organization:org._id,title:{$in:titles}}).lean();
 if(properties.length!==5)throw Error('Expected five Save Max sample properties');
 const docs=[];
 for(const g of groups){docs.push({name:g.agent,email:g.agentEmail,role:agentRole._id,organization:org._id,status:'Active',emailVerified:false,agentDetails:{commissionType:'percentage',commissionValue:2,specialization:g.specialization,experience:g.experience}});docs.push({name:g.owner,email:g.ownerEmail,role:ownerRole._id,organization:org._id,status:'Active',emailVerified:false,ownerDetails:{companyName:g.company}});}
 for(const data of docs){await new User(data).validate();const existing=await User.findOne({email:data.email});if(existing&&(!existing.organization?.equals(org._id)||!existing.role?.equals(data.role)))throw Error('Placeholder email conflicts with another record');}
 fs.writeFileSync('/opt/holirotis-propertynext/backups/savemax-agent-owner-before-'+Date.now()+'.json',JSON.stringify(properties.map(p=>({_id:p._id,agent:p.agent||null,owner:p.owner||null})),null,2),{mode:0o600});
 let created=0;
 for(const data of docs){if(!await User.findOne({organization:org._id,email:data.email})){await User.create(data);created++;}}
 const result=[];
 for(const g of groups){const agent=await User.findOne({organization:org._id,email:g.agentEmail}),owner=await User.findOne({organization:org._id,email:g.ownerEmail});
 for(const title of g.properties){const p=await Property.findOneAndUpdate({organization:org._id,title},{$set:{agent:agent._id,owner:owner._id}},{new:true,runValidators:true}).populate('agent','name organization role').populate('owner','name organization role');
 if(!p||!p.agent.organization.equals(org._id)||!p.owner.organization.equals(org._id)||!p.agent.role.equals(agentRole._id)||!p.owner.role.equals(ownerRole._id))throw Error('Assignment verification failed');
 result.push({property:title,agent:p.agent.name,owner:p.owner.name});}}
 console.log(JSON.stringify({createdUsers:created,verifiedAssignments:result.length,assignments:result},null,2));
 await mongoose.disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});