const fs=require('fs'),mongoose=require('mongoose'),crypto=require('crypto');
(async()=>{
 const uri=fs.readFileSync('.env.local','utf8').match(/^MONGODB_URI=(.*)$/m)[1].trim();
 await mongoose.connect(uri);
 const db=mongoose.connection;
 const org=await db.collection('organizations').findOne({slug:'save-max',status:'active'});
 if(!org)throw Error('Save Max tenant not found');
 const names=['Sample - Amsterdam Canal Apartment','Sample - Rotterdam Family House','Sample - Utrecht City Apartment','Sample - The Hague Garden Villa','Sample - Eindhoven Office Suite'];
 const properties=await db.collection('properties').find({organization:org._id,title:{$in:names}}).toArray();
 if(properties.length!==5)throw Error('Expected five sample properties');
 const amenities=await db.collection('amenities').find({organization:org._id,status:'Active'}).toArray();
 if(amenities.length<5)throw Error('Not enough active tenant amenities');
 const backup='/opt/holirotis-propertynext/backups/savemax-amenities-before-'+Date.now()+'.json';
 fs.writeFileSync(backup,JSON.stringify(properties.map(p=>({_id:p._id,amenities:p.amenities||[]})),null,2),{mode:0o600});
 for(const property of properties){
 const shuffled=[...amenities];
 for(let i=shuffled.length-1;i>0;i--){const j=crypto.randomInt(i+1);[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
 const selected=shuffled.slice(0,crypto.randomInt(3,7)).map(a=>a.name);
 const result=await db.collection('properties').updateOne({_id:property._id,organization:org._id},{$set:{amenities:selected,updatedAt:new Date()}});
 if(result.matchedCount!==1)throw Error('Property update failed');
 }
 const saved=await db.collection('properties').find({organization:org._id,title:{$in:names}},{projection:{title:1,amenities:1}}).toArray();
 for(const p of saved)if(!p.amenities.length||p.amenities.some(n=>!amenities.some(a=>a.name===n)))throw Error('Assignment verification failed');
 console.log(JSON.stringify(saved.map(p=>({property:p.title,amenities:p.amenities})),null,2));
 await mongoose.disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});