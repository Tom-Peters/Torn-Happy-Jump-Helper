'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Torn-Happy-Jump-Helper-preview.user.js'),'utf8');
function fixture(state=null,reply={wars:{ranked:null}}){
 let now=2000000000000;const events=[],writes=[],calls=[];
 const code=source.slice(source.indexOf('let rankedWarState='),source.indexOf('function syncTrainingPage()'));
 const ctx={eventAlerts:()=>[],get:()=>state,put:(k,v)=>writes.push(v),Tm:()=>now,Fl:Math.floor,Do:{hidden:false,dispatchEvent:e=>events.push(e)},
 CustomEvent:function(type,x){this.type=type;this.detail=x.detail;},api:async path=>{calls.push(path);if(reply instanceof Error)throw reply;return reply;}};
 const api=vm.runInNewContext(code+';({parseTrainingWar,trainingWarHold,refreshTrainingWar,publishTrainingHold,set:(v)=>rankedWarState=v})',ctx);
 return {api,events,calls,writes,ctx,tick:n=>now+=n,now};
}
test('official nullable ranked shape, future start, current war and ended war are distinct',()=>{
 const {api,now}=fixture(),time=now/1000;
 assert.equal(api.parseTrainingWar({wars:{ranked:null}},time).status,'clear');
 assert.equal(api.parseTrainingWar({wars:{ranked:{start:time+60,end:null}}},time).status,'scheduled');
 assert.equal(api.parseTrainingWar({wars:{ranked:{start:time-60,end:0}}},time).status,'active');
 assert.equal(api.parseTrainingWar({wars:{ranked:{start:time-60,end:time}}},time).status,'clear');
 for(const response of [{},{wars:{}},{wars:{ranked:{start:time}}}])assert.throws(()=>api.parseTrainingWar(response,time));
});
test('scheduled war activates at start; stale all-clear holds and stale active never resumes',()=>{
 const f=fixture();assert.equal(f.api.trainingWarHold(),true);
 f.api.set({status:'scheduled',start:f.now/1000+60,checked:f.now});assert.equal(f.api.trainingWarHold(),false);
 f.tick(60000);assert.equal(f.api.trainingWarHold(),true);
 f.api.set({status:'clear',checked:f.now});f.tick(600001);assert.equal(f.api.trainingWarHold(),true);
 f.api.set({status:'active',checked:1});assert.equal(f.api.trainingWarHold(),true);
});
test('failed API cannot clear active hold; reads are throttled and foreground only',async()=>{
 const f=fixture({status:'active',checked:1},new Error('unavailable'));
 await f.api.refreshTrainingWar();assert.equal(f.api.trainingWarHold(),true);assert.equal(f.writes.length,0);
 const n=f.calls.length;await f.api.refreshTrainingWar();assert.equal(f.calls.length,n);
 f.tick(60001);f.ctx.Do.hidden=true;await f.api.refreshTrainingWar();assert.equal(f.calls.length,n);
});
test('confirmed war end clears hold and hold publication removes actionable training reminders',async()=>{
 const f=fixture({status:'active',checked:1});f.api.publishTrainingHold();
 assert.equal(f.events.find(x=>x.type==='staxx:notice').detail.count,0);
 assert.equal(f.events.find(x=>x.type==='staxx:actions').detail.items[0].id,'war-hold');
 await f.api.refreshTrainingWar();assert.equal(f.api.trainingWarHold(),false);
});
