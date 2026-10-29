"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.1-preview.user.js");
function boot(reply=()=>({log:[]})){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","unit-test-key");
 const store=new Map(),calls=[];
 function node(tag){return {tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",append(...items){this.children.push(...items)},appendChild(v){this.children.push(v)},addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},get id(){return this._id},set id(v){this._id=v}}}
 const body=node("body"),head=node("head");
 const document={body,head,createElement:node,addEventListener(){},getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}};
 const window={setInterval(){}};
 const injected=source.replace(/\}\)\(\);\s*$/,`window.__test={refresh,miniRefresh,scanActions,recordStatSnapshot,statEvidence,statSampleCard,getToday:today,getProgress:progress,nextDecision,actDone,refill,loadInput,priorityAction,resetActions:()=>{actChecked=0},getActions:()=>acts,getActivityCoverage:()=>activityCoverage,getUpdated:()=>updated,getMiniFresh:()=>miniFresh,getData:()=>data,setData:v=>{data=v},getConfig:()=>cfg,setUpdated:v=>{updated=v},setPlan:v=>{lp=v},getButton:()=>button};})();`);
 assert.notEqual(injected,source);
 const PDA_httpGet=async(url,headers)=>({status:200,responseText:JSON.stringify((calls.push({url,headers}),reply(url)))});
 new Function("document","location","window","localStorage","PDA_httpGet",injected)(
 document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,PDA_httpGet);
 return {core:window.__test,window,document,store,calls};
}
const now=()=>Math.floor(Date.now()/1000);
const stats=s=>({strength:{value:s},speed:{value:2000000},defense:{value:1800000},dexterity:{value:1900000}});
const state=s=>({
 stats:{battlestats:stats(s)},gym:{gym:{id:1}},
 gyms:{gyms:[{id:1,name:"Sample Gym",energy_cost:25,modifiers:{strength:75,speed:60,defense:50,dexterity:40}}]},
 bars:{bars:{energy:{current:90,maximum:150,interval:600,increment:5},happy:{current:3475,maximum:3475}}},
 cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}},perks:{perks:{book_perks:[]}}
});
test("v0.12.1 is a self-contained, read-only TornPDA preview with the HJ launcher",()=>{
 const s=fs.readFileSync(FILE,"utf8");
 assert.match(s,/@version\s+0\.12\.1/);
 assert.ok(s.length<85000);
 assert.ok(!/[“”‘’]/.test(s));
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();
 assert.equal(a.window.__TornHappyJumpLoaded,"0.12.1");
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
});
test("two actual stat snapshots show off-plan +10k, and are separate from gym-log totals",()=>{
 const a=boot(),t=now();
 a.core.setData(state(1000000));
 assert.equal(a.core.recordStatSnapshot({strength:1000000,speed:2000000,defense:1800000,dexterity:1900000},t-3600),true);
 assert.equal(a.core.recordStatSnapshot({strength:1010000,speed:2000000,defense:1800000,dexterity:1900000},t),true);
 assert.equal(a.core.recordStatSnapshot({strength:1010000,speed:2000000,defense:1800000,dexterity:1900000},t+1),false);
 a.core.getConfig().stat="strength";
 assert.equal(a.core.statEvidence().latest.delta,10000);
 assert.equal(a.core.statEvidence().week.delta,10000);
 assert.match(a.core.statSampleCard(),/\+10,000 strength/);
 assert.match(a.core.statSampleCard(),/not guaranteed gym-only gains/);
 assert.match(a.core.statSampleCard(),/never added/);
 assert.match(a.core.getProgress(),/Actual stat changes/);
 assert.equal(JSON.parse(a.store.get("hhj-compact-v1:stat-samples")).length,2);
});
test("baseline alone is not mislabelled as a gain and missing readings do not become zero",()=>{
 const a=boot(),t=now(),start={strength:1000000,speed:2000000,defense:1800000,dexterity:1900000};
 a.core.getConfig().stat="strength";
 assert.equal(a.core.recordStatSnapshot(start,t-90),true);
 assert.equal(a.core.statEvidence().latest,null);
 assert.match(a.core.statSampleCard(),/Only one stat reading/);
 assert.equal(a.core.recordStatSnapshot({strength:1000000,speed:0,defense:1800000,dexterity:1900000},t),false);
 assert.equal(a.core.recordStatSnapshot({...start,strength:1002000},t),true);
 assert.equal(a.core.statEvidence().latest.delta,2000);
});
test("activity pagination records a refill on second page and deduplicates IDs",async()=>{
 const t=now(),entry={id:"refill-2",timestamp:t-60,details:{id:4900,title:"Energy refill"},data:{}};
 const next="https://api.torn.com/v2/user/log?log=2290%2C4900&from="+(t-3600)+"&limit=100&offset=100";
 const a=boot(url=>url.includes("/user/log?")?
  url.includes("offset=100")?{log:[entry,entry]}:{log:Array.from({length:100},(_,i)=>({id:"other-"+i,timestamp:t-300,details:{id:1999,title:"Other"},data:{}})),_metadata:{links:{next}}}:{log:[]});
 await a.core.scanActions();
 assert.equal(a.core.getActions().length,1);
 assert.equal(a.core.refill(),"used");
 assert.equal(a.core.actDone({kind:"REFILL",t}),true);
 assert.equal(a.calls.filter(x=>x.url.includes("/user/log?")).length,2);
 assert.match(a.core.getActivityCoverage(),/2 page/);
 const again=a.core.getActions().length;
 await a.core.scanActions();
 assert.equal(a.core.getActions().length,again);
 assert.equal(a.calls.filter(x=>x.url.includes("/user/log?")).length,2,"successful activity scans are short-cached");
});
test("an invalid or cross-origin activity page does not leak the API key",async()=>{
 const t=now(),a=boot(url=>({log:[{id:"unrelated",timestamp:t-100,details:{id:1234,title:"Other"},data:{}}],_metadata:{links:{next:"https://evil.example/collect?key=stolen"}}}));
 await a.core.scanActions();
 assert.match(a.core.getActivityCoverage(),/Unavailable: Invalid activity cursor/);
 assert.equal(a.calls.filter(x=>x.url.includes("/user/log?")).length,1);
 assert.ok(a.calls.every(x=>x.url.startsWith("https://api.torn.com/")));
});
test("partial mini-refresh never upgrades full-state freshness or mutates only some fields",async()=>{
 const prev=state(1000000),a=boot(url=>{
  if(url.includes("/user/bars"))return {bars:{energy:{current:1,maximum:150}}}; // no happy, incomplete
  return {log:[]};
 });
 a.core.setData(prev);
 a.core.setUpdated(Date.now()-20*60000);
 await a.core.miniRefresh();
 assert.equal(a.core.getData().bars.bars.energy.current,90);
 assert.equal(a.core.getMiniFresh(),0);
 assert.equal(a.core.nextDecision().kind,"stale");
 assert.match(a.core.getButton().textContent,/HJ/);
});
test("a full Torn refresh cannot claim fresh live recommendations when vital API selections are absent",async()=>{
 const a=boot(url=>{
  if(url.includes("/user/battlestats"))return {battlestats:stats(1000000)};
  if(url.includes("/user/bars"))return {bars:{energy:{current:90,maximum:150},happy:{current:3475,maximum:3475}}};
  if(url.includes("/user/gym"))return {gym:{id:1}};
  if(url.includes("/torn/gyms"))return {gyms:state(1000000).gyms.gyms};
  // intentionally omit real cooldown and refills
  return {log:[]};
 });
 await a.core.refresh();
 assert.equal(a.core.getUpdated(),0);
 assert.equal(a.core.nextDecision().kind,"stale");
});
