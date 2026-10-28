"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const file=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.19-compat.user.js");
function boot(reply,pre={}){const src=fs.readFileSync(file,"utf8").replace("###PDA-APIKEY###","test-placeholder");
 const store=new Map(Object.entries(pre).map(([k,v])=>["hhj-compact-v1:"+k,JSON.stringify(v)])),calls=[];
 function node(tag){return {tag,style:{},children:[],dataset:{},innerHTML:"",textContent:"",
 append(...xs){this.children.push(...xs)},appendChild(v){this.children.push(v)},addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},get id(){return this._id},set id(v){this._id=v}}}
 const body=node("body"),head=node("head"),document={body,head,createElement:node,addEventListener(){},getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}},window={setInterval(){}},localStorage={getItem(k){return store.has(k)?store.get(k):null},setItem(k,v){store.set(k,String(v))}};
 const patched=src.replace(/\}\)\(\);\s*$/,"window.__test={scanActivity,scanGym,aDone,refill,aFl,getActs:()=>actLog,getLogs:()=>al,setStat:k=>{cfg.stat=k}};})();");
 assert.notEqual(src,patched);
 const PDA_httpGet=async(url,headers)=>{calls.push({url,headers});return {status:200,responseText:JSON.stringify(reply?.(url)||{log:[]})}};
 new Function("document","window","location","localStorage","PDA_httpGet",patched)(document,window,{hostname:"www.torn.com",pathname:"/gym.php"},localStorage,PDA_httpGet);
 return {window,document,store,calls,core:window.__test};
}
const timestamp=()=>Math.floor(Date.now()/1000),entry=(id,log,title,t)=>({id,timestamp:t,details:{id:log,title},data:{}});
test("v0.10.19 mounts the original phone-proven launcher and does not require user action buttons",()=>{
 const s=fs.readFileSync(file,"utf8"),a=boot();
 assert.match(s,/@version\s+0\.10\.19/);assert.ok(s.length<59000);
 assert.ok(a.document.getElementById("hhj-launch"));assert.ok(a.document.getElementById("hhj-compact-panel"));
 assert.equal(a.window.__TornHappyJumpLoaded,"0.10.19");
 for(const x of ["I did it","Missed it · Replan","Not sure",'data-act="mark-used"','data-act="note-done"','data-act="watch-done"'])assert.equal(s.includes(x),false,x);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("refill and Xanax are auto-observed and deduplicated from read-only Torn logs",async()=>{
 const t=timestamp(),events=[entry("1",2290,"Xanax use",t-60),entry("2",4900,"Energy refill",t-120)],a=boot(u=>u.includes("log=2290,4900")?{log:events}:{log:[]});
 await a.core.scanActivity();
 assert.equal(a.core.getActs().length,2);assert.equal(a.core.refill(),"used");
 assert.equal(a.core.aDone({kind:"REFILL",t}),true);
 assert.equal(a.core.aDone({kind:"XANAX",t}),true);
 assert.equal(a.core.aDone({kind:"XANAX",t:t+7200}),false);
 assert.equal(a.calls.length,1);assert.equal(a.calls[0].headers.Authorization,"ApiKey test-placeholder");
 await a.core.scanActivity();assert.equal(a.calls.length,1);
 assert.equal(JSON.parse(a.store.get("hhj-compact-v1:auto-activity-v19")).length,2);
});
test("saved activity is preserved and yesterday's refill does not satisfy today",()=>{
 const t=timestamp(),midnight=Math.floor(t/86400)*86400,a=boot(null,{"auto-activity-v19":[{id:"r",t:midnight-120,kind:"REFILL"}]});
 assert.equal(a.core.aDone({kind:"REFILL",t:midnight-60}),true);
 assert.equal(a.core.aDone({kind:"REFILL",t:midnight+60}),false);
 assert.equal(a.core.aDone({kind:"REFILL",t:midnight+86460}),false);
});
test("verified gym training is recognised, but a different scheduled session stays unverified",async()=>{
 const t=timestamp(),a=boot(u=>u.includes("cat=125")?{log:[{id:"gym1",timestamp:t-3600,data:{strength_increased:10000,trains:6,energy_used:150}}]}:{log:[]});
 a.core.setStat("strength");await a.core.scanGym(true);
 assert.equal(a.core.aDone({kind:"TRAIN",t:t-3600}),true);
 assert.equal(a.core.aDone({kind:"TRAIN",t:t+3600}),false);
 const noon=Math.floor(t/86400)*86400+86400+43200; const html=a.core.aFl({events:[{kind:"TRAIN",t:noon,detail:"Next train"}]});
 assert.match(html,/Latest confirmed training/);assert.match(html,/10,000 strength/);assert.match(html,/Next:/);
 assert.doesNotMatch(html,/I did it|Missed it|Not sure/);
});
test("Ecstasy alone does not prove a happy jump, a nearby verified gym session corroborates it",async()=>{
 const t=timestamp(),a=boot(u=>u.includes("log=2290,4900")?{log:[entry("ec",2290,"Ecstasy use",t-120)]}:u.includes("cat=125")?{log:[{id:"gym",timestamp:t-100,data:{strength_increased:10000,trains:1,energy_used:25}}]}:{log:[]});
 await a.core.scanActivity();assert.equal(a.core.aDone({kind:"JUMP",t:t-120}),false);
 await a.core.scanGym(true);assert.equal(a.core.aDone({kind:"JUMP",t:t-120}),true);
});
