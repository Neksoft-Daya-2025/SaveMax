const fs = require('fs');
const Module = require('module');
const ts = require('typescript');
const mongoose = require('mongoose');
const env = fs.readFileSync('.env.local','utf8');
const uri = env.match(/^MONGODB_URI=(.*)$/m)[1].trim();
const modelPath = require('path').resolve('models/Property.ts');
const compiled = ts.transpileModule(fs.readFileSync(modelPath,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
const mod = new Module(modelPath,module); mod.filename=modelPath; mod.paths=module.paths; mod._compile(compiled,modelPath);
const Property=mod.exports.default;
(async()=>{
 await mongoose.connect(uri);
 const org=await mongoose.connection.collection('organizations').findOne({slug:'save-max',status:'active'});
 if(!org) throw new Error('Active Save Max tenant not found');
 const admin=await mongoose.connection.collection('users').findOne({organization:org._id,email:'savemax@gmail.com',status:'Active'});
 if(!admin) throw new Error('Save Max administrator not found');
 const specs=[
 ['Sample - Amsterdam Canal Apartment','Apartment','Sale',425000,85,2,1,'Amsterdam','North Holland'],
 ['Sample - Rotterdam Family House','House','Sale',550000,145,4,2,'Rotterdam','South Holland'],
 ['Sample - Utrecht City Apartment','Apartment','Rent',1650,70,2,1,'Utrecht','Utrecht'],
 ['Sample - The Hague Garden Villa','Villa','Sale',895000,220,5,3,'The Hague','South Holland'],
 ['Sample - Eindhoven Office Suite','Office','Lease',2250,120,0,2,'Eindhoven','North Brabant']
 ];
 const titles=specs.map(s=>s[0]);
 const existing=await Property.find({organization:org._id,title:{$in:titles}}).lean();
 const records=specs.filter(s=>!existing.some(p=>p.title===s[0])).map((s,i)=>({
 title:s[0],propertyType:s[1],purpose:s[2],price:s[3],areaSize:s[4],bedrooms:s[5],bathrooms:s[6],
 areaUnit:'sqm',status:'Pending',isNegotiable:false,parking:s[1]==='Villa'?2:1,
 description:'Fictional sample property created for Save Max setup and testing. The address and price are illustrative, not a real property offer. '+(s[2]==='Sale'?'Price is in EUR.':'Price is in EUR per month.'),
 location:{address:'Sample address '+(i+1)+' (fictional)',city:s[7],state:s[8],country:'Netherlands'},
 amenities:[],images:[],nearbyPlaces:[],isFeatured:false,isHot:false,organization:org._id,createdBy:admin._id
 }));
 for(const data of records) await new Property(data).validate();
 if(records.length) await Property.insertMany(records,{ordered:true});
 const saved=await Property.find({organization:org._id,title:{$in:titles}}).select('title status purpose price organization createdBy').lean();
 if(saved.length!==5) throw new Error('Expected five sample properties');
 console.log(JSON.stringify({tenant:org.name,created:records.length,verified:saved.length,properties:saved},null,2));
 await mongoose.disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});