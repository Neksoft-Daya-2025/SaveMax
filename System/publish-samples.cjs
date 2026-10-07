const fs=require('fs'),mongoose=require('mongoose');
(async()=>{
 const uri=fs.readFileSync('.env.local','utf8').match(/^MONGODB_URI=(.*)$/m)[1].trim();await mongoose.connect(uri);
 const db=mongoose.connection;
 const org=await db.collection('organizations').findOne({slug:'save-max',status:'active'});if(!org)throw Error('Save Max not found');
 const ids=['6ac131d46c648219ca6aa810','6ac131d46c648219ca6aa811','6ac131d46c648219ca6aa812','6ac131d46c648219ca6aa813','6ac131d46c648219ca6aa814'].map(id=>new mongoose.Types.ObjectId(id));
 const rows=await db.collection('properties').find({_id:{$in:ids},organization:org._id}).toArray();if(rows.length!==5)throw Error('Expected five samples');
 fs.writeFileSync('/opt/holirotis-propertynext/backups/sample-publication-before-site.json',JSON.stringify(rows.map(p=>({_id:p._id,status:p.status,images:p.images,coordinates:p.location?.coordinates})),null,2),{mode:0o600});
 const photos=['photo-1600607687920-4e2a09cf159d','photo-1600566753086-00f18fb6b3ea','photo-1600210492486-724fe5c67fb0','photo-1600607687939-ce8a6c25118c','photo-1497366754035-f200968a6e72'];
 const points=[[52.3676,4.9041],[51.9244,4.4777],[52.0907,5.1214],[52.0705,4.3007],[51.4416,5.4697]];
 for(let i=0;i<ids.length;i++){
 const p=rows.find(p=>p._id.equals(ids[i]));
 if(!/fictional sample|sample -/i.test(p.title+' '+p.description))throw Error('Record is no longer a sample, refusing to publish');
 const update={status:'Available',updatedAt:new Date()};
 if(!p.images?.length)update.images=[{url:'https://images.unsplash.com/'+photos[i]+'?auto=format&fit=crop&w=1600&q=85',isFeatured:true},{url:'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=85',isFeatured:false}];
 if(!p.location?.coordinates?.lat)update['location.coordinates']={lat:points[i][0],lng:points[i][1]};
 await db.collection('properties').updateOne({_id:p._id,organization:org._id},{$set:update});
 }
 console.log('Published 5 labelled demonstration properties; prior data backed up.');await mongoose.disconnect();
})().catch(e=>{console.error(e.message);process.exit(1)});