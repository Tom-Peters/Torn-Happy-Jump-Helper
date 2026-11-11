"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
const begin=src.indexOf("function publishHubAlerts(){"),end=src.indexOf("function badge(){",begin);
assert.ok(begin>0&&end>begin,"Happy Jump alert publication found");
const snippet=src.slice(begin,end)+";publishHubAlerts";
function published(updated,miniFresh){
 const now=Date.UTC(2026,10,1,18,0),events=[];
 const ctx={trainingWarHold:()=>false,updated,miniFresh,Tm:()=>now,Mx:Math.max,Ce:Math.ceil,Fl:Math.floor,fmt:String,
  coachFresh:()=>now-Math.max(updated,miniFresh)<=4*60000,reportedOverdose:()=>null,priorityAction:()=>null,aPl:()=>({events:[]}),
  loadInput:()=>({energy:0,cost:25}),nextDecision:()=>({kind:"none"}),
  summary:()=>({gain:1200,trains:3}),cfg:{stat:"strength"},
  Do:{dispatchEvent:e=>events.push(e)},CustomEvent:function(type,init){this.type=type;this.detail=init.detail;}};
 vm.runInNewContext(snippet,ctx)();
 return {events,actions:events.find(e=>e.type==="staxx:actions").detail,summary:events.find(e=>e.type==="staxx:summary").detail};
}
test("successful mini refresh makes gym forecasts current despite older full refresh",()=>{
 const now=Date.UTC(2026,10,1,18,0),r=published(now-3600000,now-2000);
 assert.ok(!r.actions.items.some(e=>e.id==="refresh-happy"));
 assert.equal(r.summary.updated,now-2000);
});
test("both data sources stale: do not claim a current training opportunity",()=>{
 const now=Date.UTC(2026,10,1,18,0),r=published(now-3600000,now-1800000);
 assert.ok(r.actions.items.some(e=>e.id==="refresh-happy"));
});
test("background gym check can trigger eligible full refresh without repeated writes",()=>{
 assert.match(src,/finally\{miniBusy=false;miniLast=now;autoFullRefreshV230\(\)\}/);
 assert.match(src,/if\(last&&t-last<45\*60000\)return/);
 assert.doesNotMatch(src,/fetch\([^)]*method\s*:\s*["']POST["']/i);
});
