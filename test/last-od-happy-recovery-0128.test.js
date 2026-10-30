"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.8-preview.user.js");
function boot(reply=()=>({log:[]})){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","test-key");
 const store=new Map(),requests=[];
 function node(tag){return {tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",
 append(...a){this.children.push(...a)},appendChild(x){this.children.push(x)},
 addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},get id(){return this._id},set id(x){this._id=x}}}
 const body=node("body"),head=node("head"),document={body,head,createElement:node,addEventListener(){},
 getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const window={setInterval(){}},localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
 const source2=source.replace(/\}\)\(\);\s*$/,"window.__test={lastOD,parseODLog,rememberOD,scanLastOD,labelLastOD,odSource,drugOdOdds,happyRecoveryMath,recoveryFloors,simulateRecovery,happyRecoveryCard,overdoseRecoveryCard,reportedOverdose,noteOverdose,clearOverdose,jumpBreakEven,overdoseForecast,settings,loadInput,simulate,plans,plan,compare,today,nextDecision,setData:v=>{data=v},setUpdated:v=>{updated=v},setInventory:v=>{inv=v},setPrices:v=>{prices=v},getConfig:()=>cfg,odScanStatus:()=>lastOdStatus};})();");
 assert.notEqual(source2,source,"test hooks must inject before userscript closure");
 new Function("document","location","window","localStorage","PDA_httpGet",source2)(document,
 {hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,
 async (url,headers)=>{requests.push({url,headers});const data=reply(url);return {status:200,responseText:JSON.stringify(data)}});
 return {core:window.__test,window,document,store,requests};
}
function setup(a,{happy=0,maxH=3500,energy=0}={}){
 const v=value=>({value});
 a.core.setData({
 stats:{battlestats:{strength:v(125000),speed:v(190000),defense:v(180000),dexterity:v(170000)}},
 gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Gym",energy_cost:25,modifiers:{strength:70,speed:50,defense:50,dexterity:50}}]},
 bars:{bars:{energy:{current:energy,maximum:150,interval:600,increment:5},happy:{current:happy,maximum:maxH}}},
 cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:false}},
 perks:{perks:{faction_perks:[],job_perks:[]}}
 });
 a.core.setPrices({xanax:[{price:70000,amount:200}],ecstasy:[{price:100000,amount:100}],
 dvd:[{price:50000,amount:100}],lollipop:[{price:500,amount:400}],points:[{price:1000,amount:20000}]});
 a.core.setInventory({});
 const cfg=a.core.getConfig();cfg.stat="strength";cfg.refills=true;cfg.budget=100000000;cfg.sleepEnabled=false;
 a.core.setUpdated(Date.now());
}
test("v0.12.8 is independently installable read-only preview with HJ launcher",()=>{
 const s=fs.readFileSync(FILE,"utf8");assert.match(s,/@version\s+0\.12\.8/);
 assert.match(s,/@author\s+IamEEKY/);assert.match(s,/@updateURL\s+https:\/\/raw\.githubusercontent\.com\/Tom-Peters\/Torn-Happy-Jump-Helper\/main\/Torn-Happy-Jump-Helper-v0.12.8-preview.user.js/);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.ok(s.length<136000);
 const a=boot();assert.equal(a.window.__TornHappyJumpLoaded,"0.12.8");
 assert.ok(a.document.getElementById("hhj-launch"));
});
test("community reference odds are labelled approximate and respect explicitly entered protections",()=>{
 const a=boot();const c=a.core.getConfig();
 assert.equal(a.core.drugOdOdds("xanax"),2.5);assert.equal(a.core.drugOdOdds("ecstasy"),5);
 assert.match(a.core.odSource("xanax"),/Community estimate/);
 c.odFactionReduction=30;c.odNightclub=true;
 assert.ok(Math.abs(a.core.drugOdOdds("xanax")-0.875)<1e-8);
 assert.ok(Math.abs(a.core.drugOdOdds("ecstasy")-1.75)<1e-8);
 c.xanaxOdPct=7;assert.equal(a.core.drugOdOdds("xanax"),7);
 assert.match(a.core.odSource("xanax"),/Manual effective/);
 c.xanaxOdPct=0;assert.equal(a.core.drugOdOdds("xanax"),0);
 c.xanaxOdPct=null;c.odEstimateMode="manual";
 assert.equal(a.core.drugOdOdds("xanax"),null);
 assert.equal(a.core.drugOdOdds("ecstasy"),null);
 assert.match(a.core.settings(),/community overdose estimates|community OD estimates/i);
 assert.match(a.core.settings(),/NOT official Torn-published rates/);
});
test("parses only genuine Torn overdose log 2291 with verified timestamp and no guessed drug",()=>{
 const a=boot();const t=Math.floor(Date.now()/1000)-100;
 const item=id=>({id:"example",timestamp:t,details:{id,title:"Overdose"},data:{}});
 assert.equal(a.core.parseODLog(item(2290)),null);
 assert.deepEqual(a.core.parseODLog(item(2291)),{drug:"unknown",t,source:"api",id:"example"});
 assert.equal(a.core.parseODLog({...item(2291),timestamp:0}),null);
 assert.equal(a.core.parseODLog({...item(2291),timestamp:t+86400*30}),null);
 assert.equal(a.core.parseODLog({...item(2291),data:{drug_name:"Xanax"}}).drug,"xanax");
 assert.equal(a.core.parseODLog({...item(2291),data:{item_id:197}}).drug,"ecstasy");
});
test("a recent verified OD is persisted, automatically holds scheduling and is not re-triggered after acknowledgement",async()=>{
 const now=Math.floor(Date.now()/1000),first=now-2400,second=now-50;
 let events=[{id:"od-first",timestamp:first,details:{id:2291,title:"Drug overdose"},data:{drug_name:"Xanax"}}];
 const a=boot(url=>url.includes("log=2291")?{log:events}:{});
 setup(a);
 await a.core.scanLastOD(true);
 assert.equal(a.core.lastOD().t,first);
 assert.equal(a.core.lastOD().drug,"xanax");
 assert.equal(a.core.lastOD().source,"api");
 assert.equal(a.core.reportedOverdose().t,first);
 assert.equal(a.core.nextDecision().kind,"overdose");
 assert.match(a.core.plan(),/Schedule paused/);
 assert.match(a.core.compare(),/Comparison paused/);
 assert.match(a.core.today(),/Happiness recovery|After overdose/);
 assert.match(a.core.overdoseRecoveryCard(),/verified from Torn log/);
 assert.ok(a.requests.some(r=>r.url.includes("/user/log?log=2291")));
 assert.ok(a.requests.filter(r=>r.url.includes("log=2291")).every(r=>!r.url.includes("key=")));
 a.core.clearOverdose();
 assert.equal(a.core.reportedOverdose(),null);
 await a.core.scanLastOD(true);
 assert.equal(a.core.reportedOverdose(),null,"previous acknowledged overdose should not re-open");
 events=[{id:"od-second",timestamp:second,details:{id:2291,title:"Drug overdose"},data:{drug_name:"Ecstasy"}},...events];
 await a.core.scanLastOD(true);
 assert.equal(a.core.lastOD().drug,"ecstasy");
 assert.equal(a.core.reportedOverdose().t,second);
 assert.match(a.core.overdoseRecoveryCard(),/Ecstasy OD/);
});
test("an older logged OD stays visible as history but does not force a fresh recovery hold",async()=>{
 const t=Math.floor(Date.now()/1000)-12*86400;
 const a=boot(url=>url.includes("log=2291")?{log:[{id:"old",timestamp:t,details:{id:2291,title:"Drug overdose"},data:{drug:"Ecstasy"}}]}:{});
 setup(a,{happy:3500,energy:150});
 await a.core.scanLastOD(true);
 assert.equal(a.core.lastOD().t,t);
 assert.equal(a.core.reportedOverdose(),null);
 assert.match(a.core.overdoseRecoveryCard(),/Last overdose:/);
 assert.doesNotMatch(a.core.today(),/After overdose: Happy-aware training/);
});
test("missing log permission is disclosed and does not invent a last OD",async()=>{
 const a=boot(url=>url.includes("log=2291")?{error:{code:16,error:"Permission denied"}}:{});
 await a.core.scanLastOD(true);
 assert.equal(a.core.lastOD(),null);
 assert.match(a.core.odScanStatus(),/OD log unavailable/);
 assert.equal(a.core.reportedOverdose(),null);
 assert.match(a.core.overdoseRecoveryCard(),/custom API key/);
});
test("zero Happy remains zero; simulation compares train-now against waiting for Happy recovery",()=>{
 const a=boot();setup(a,{happy:0,energy:150});
 const p=a.core.loadInput();
 assert.equal(p.happy,0,"not property max 3500");
 const math=a.core.happyRecoveryMath(p,.25);
 assert.equal(math.target,875);assert.equal(math.missing,875);assert.equal(math.minutes,2625);
 const floors=a.core.recoveryFloors(p);assert.ok(floors.includes(0));assert.ok(floors.includes(875));
 const immediate=a.core.simulate("natural",p,168,{minHappy:0,refills:false});
 const delayed=a.core.simulate("natural",p,168,{minHappy:875,refills:false});
 assert.ok(immediate.gain>=0&&delayed.gain>=0);
 const aWait=delayed.events.filter(x=>x.kind==="TRAIN");
 assert.ok(aWait.every(x=>x.t>=Math.floor(p.now/60)*60+2600*60-60));
 const best=a.core.simulateRecovery("natural",p,168,{refills:false});
 assert.ok(best.gain>=immediate.gain-1e-6);
 assert.ok(best.gain>=delayed.gain-1e-6);
 assert.match(a.core.happyRecoveryCard(),/Live Happy: 0 \/ 3,500/);
 assert.match(a.core.happyRecoveryCard(),/Train-now|train now|immediate/);
});
test("a known recent OD without identified drug never invents Xanax hospital timing",()=>{
 const a=boot();setup(a);const ts=Date.now()/1000-300;
 a.core.rememberOD({drug:"unknown",t:ts,source:"api",id:"unknown"});
 assert.equal(a.core.reportedOverdose().drug,"unknown");
 const html=a.core.overdoseRecoveryCard();
 assert.match(html,/Drug type not identified/);
 assert.doesNotMatch(html,/Xanax hospital reference/);
});

test("unknown drug can be labelled manually without changing the verified Torn OD time",()=>{
 const a=boot();setup(a,{happy:0});
 const t=Date.now()/1000-600;
 a.core.rememberOD({drug:"unknown",t,source:"api",id:"real-log-id"});
 assert.equal(a.core.labelLastOD("cannabis"),false);
 assert.match(a.core.overdoseRecoveryCard(),/It was Xanax/);
 assert.equal(a.core.labelLastOD("xanax"),true);
 assert.equal(a.core.lastOD().t,t);
 assert.equal(a.core.reportedOverdose().t,t);
 assert.equal(a.core.lastOD().drug,"xanax");
 assert.equal(a.core.lastOD().drugSource,"manual");
 a.core.rememberOD({drug:"unknown",t,source:"api",id:"real-log-id"});
 assert.equal(a.core.lastOD().drug,"xanax");
 assert.equal(a.core.labelLastOD("ecstasy"),false);
});
test("wait-for-Happy strategy postpones purchases as well as gym trains",()=>{
 const a=boot();setup(a,{happy:0,energy:60});
 const p=a.core.loadInput(),limit=875;
 for(const mode of ["natural","xanax"]){
  const model=a.core.simulate(mode,p,168,{refills:true,budget:100000000,minHappy:limit});
  const actions=model.events.filter(e=>["TRAIN","XANAX","REFILL","CAN"].includes(e.kind));
  assert.ok(actions.length>0);
  assert.ok(actions.every(e=>e.t>=Math.floor(p.now/60)*60+2500*60),"No consumption or gym training while happiness below minimum.");
 }
});

test("verified OD log corrects a recent manually approximated timestamp without losing drug identity",()=>{
 const a=boot();setup(a);
 a.core.noteOverdose("ecstasy");
 const manual=a.core.lastOD();assert.equal(manual.source,"manual");
 const verified=manual.t-120;
 assert.ok(a.core.rememberOD({drug:"unknown",t:verified,source:"api",id:"od-api-id"}));
 const saved=a.core.lastOD();
 assert.equal(saved.t,verified);assert.equal(saved.source,"api");assert.equal(saved.drug,"ecstasy");
 assert.equal(saved.drugSource,"manual");
 assert.equal(a.core.reportedOverdose().t,verified);
 assert.equal(a.core.reportedOverdose().source,"api");
 assert.equal(a.core.reportedOverdose().drug,"ecstasy");
});
