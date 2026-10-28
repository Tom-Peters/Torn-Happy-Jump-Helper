"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.21-compat.user.js");
function boot(reply){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","unit-test-key");
 const store=new Map(),calls=[];
 function node(tag){return {tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",
 append(...items){this.children.push(...items)},appendChild(v){this.children.push(v)},
 addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},
 get id(){return this._id},set id(v){this._id=v}}}
 const body=node("body"),head=node("head");
 const document={body,head,createElement:node,addEventListener(){},
 getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}};
 const window={setInterval(){}};
 const injected=source.replace(/\}\)\(\);\s*$/, "window.__activity={scanActions,scanGym,actDone,refill,aFl,cMet,cFactor,mCard,boostCard,fCard,gymTip,getActions:()=>acts,getLogs:()=>al,getInput:()=>loadInput(),setFocus:k=>{cfg.stat=k},setData:v=>{data=v},setVerifiedGyms:v=>{vr=v},setLedger:v=>{ledger=v},getToday:today};})();");
 assert.notEqual(injected,source);
 const PDA_httpGet=async(url,headers)=>({status:200,responseText:JSON.stringify((calls.push({url,headers}),reply?.(url)||{log:[]}))});
 new Function("document","location","window","localStorage","PDA_httpGet",injected)(
 document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,PDA_httpGet);
 return {core:window.__activity,store,document,window,calls};
}
const now=()=>Math.floor(Date.now()/1000);
const activity=(id,kind,t)=>({id:String(id),timestamp:t,details:{id:kind,title:kind===4900?"Energy refill":"Xanax use"},data:{}});
test("v0.10.18 is a compact launcher without any manual action confirmations",()=>{
 const s=fs.readFileSync(FILE,"utf8");
 assert.match(s,/@version\s+0\.10\.21/);
 assert.ok(s.length<60000);
 for(const label of ["I did it","Missed it · Replan","Not sure","data-act=\"mark-used\"","data-act=\"note-done\"","data-act=\"watch-done\""])assert.ok(!s.includes(label),"manual completion UI: "+label);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
 assert.equal(a.window.__TornHappyJumpLoaded,"0.10.21");
});
test("Xanax and point refill are read from Torn activity, never submitted to Torn",async()=>{
 const t=now(),entries=[activity("refill-1",4900,t-120),activity("xanax-1",2290,t-60)];
 const a=boot(url=>url.includes("log=2290,4900")?{log:entries}:{log:[]});
 await a.core.scanActions();
 assert.equal(a.core.getActions().length,2);
 assert.equal(a.core.refill(),"used");
 assert.equal(a.core.actDone({kind:"REFILL",t}),true);
 assert.equal(a.core.actDone({kind:"XANAX",t}),true);
 assert.equal(a.core.actDone({kind:"XANAX",t:t+7200}),false);
 assert.equal(a.calls.length,1);
 assert.equal(a.calls[0].headers.Authorization,"ApiKey unit-test-key");
 assert.equal(JSON.parse(a.store.get("hhj-compact-v1:verified-actions")).length,2);
 await a.core.scanActions();
 assert.equal(a.calls.length,1,"same-minute actions are cached");
});
test("refill activity from yesterday cannot confirm today's or tomorrow's refill",async()=>{
 const t=now(),start=Math.floor(t/86400)*86400;
 const a=boot(url=>({log:[activity("old-refill",4900,start-60)]}));
 await a.core.scanActions();
 assert.equal(a.core.actDone({kind:"REFILL",t:start-100}),true);
 assert.equal(a.core.actDone({kind:"REFILL",t:start+100}),false);
 assert.equal(a.core.actDone({kind:"REFILL",t:start+86500}),false);
});
test("recorded off-plan gym training is known but cannot prove an unrelated scheduled train",async()=>{
 const t=now(),entry={id:"gym-1",timestamp:t-3600,data:{strength_increased:10000,trains:5,energy_used:125}};
 const a=boot(url=>url.includes("cat=125")?{log:[entry]}:{log:[]});
 await a.core.scanGym(true);
 a.core.setFocus("strength");
 assert.equal(a.core.actDone({kind:"TRAIN",t:t-3600}),true);
 assert.equal(a.core.actDone({kind:"TRAIN",t:t+1800}),false);
 const html=a.core.aFl({method:"natural",events:[{kind:"TRAIN",t:t+1800,detail:"Scheduled train"}]});
 assert.match(html,/Latest gym training/);
 assert.match(html,/Next:/);
 assert.doesNotMatch(html,/Confirm TRAIN|I did it|Missed it/);
});
test("calibration needs consistent comparable samples and leaves extreme model mismatch untouched",async()=>{
 const t=now(),rows=Array.from({length:8},(_,i)=>({id:"gym-"+i,timestamp:t-90*i,
 data:{strength_increased:1000+i*5,trains:1,energy_used:25}}));
 const a=boot(url=>url.includes("cat=125")?{log:rows}:{log:[]});
 await a.core.scanGym(true);a.core.setFocus("strength");
 const p={stat:"strength",cost:25,happy:3000,value:1000000,dots:1,m:1,gym:{name:"Gym"}};
 const result=a.core.cMet(p);
 assert.equal(result.kept,8);
 assert.equal(result.ready,false,"a major unproven formula mismatch must not be auto-applied");
 assert.equal(a.core.cFactor(p),1);
 assert.match(a.core.mCard(p),/Not yet calibrated/);
});
test("matching gym and energy can automatically calibrate a moderate consistent difference",async()=>{
 const t=now(),p={stat:"strength",cost:25,happy:3000,value:1000000,dots:1,m:1,gym:{name:"Example"}};
 const raw=(3.480061091e-7*Math.log(3000+250)+3.091619094e-6)*1000000+6.82775184551527e-5*(3000+250)-0.0301431777;
 const predicted=raw*25;
 const rows=Array.from({length:8},(_,i)=>({id:"consistent-"+i,timestamp:t-i*120,
 data:{strength_increased:predicted*1.1*(1+(i-3)*0.001),trains:1,energy_used:25,gym:"Example"}}));
 const a=boot(url=>url.includes("cat=125")?{log:rows}:{log:[]});
 await a.core.scanGym(true);a.core.setFocus("strength");
 const x=a.core.cMet(p);
 assert.equal(x.ready,true);
 assert.ok(x.factor>1.08&&x.factor<1.12);
 assert.match(a.core.mCard(p),/Automatic ×1\.10/);
});
test("forecast accuracy requires three paired intervals and never claims full coverage",()=>{
 const a=boot();
 a.core.setFocus("strength");
 assert.match(a.core.fCard(),/Not enough matched/);
 const t=now();
 a.core.setLedger(Array.from({length:3},(_,i)=>({t:t-i*3600,from:t-i*3600-600,
 forecastStat:"strength",method:"natural",observed:{strength:950},expected:1000})));
 const html=a.core.fCard();
 assert.match(html,/95\.0% agreement/);
 assert.match(html,/Partial snapshot coverage/);
});

test("Ecstasy plus nearby verified gym training infers a jump; drug use alone does not",async()=>{
 const t=now(),entries=[{id:"ecstasy-1",timestamp:t-120,details:{id:2290,title:"Ecstasy use"},data:{}}];
 const gymLog={id:"jump-train-1",timestamp:t-60,data:{strength_increased:24000,trains:1,energy_used:25}};
 const a=boot(url=>url.includes("log=2290,4900")?{log:entries}:url.includes("cat=125")?{log:[gymLog]}:{log:[]});
 a.core.setFocus("strength");
 await a.core.scanActions();
 assert.equal(a.core.actDone({kind:"JUMP",t:t-120}),false,"drug event alone is not a confirmed completed jump");
 await a.core.scanGym(true);
 assert.equal(a.core.actDone({kind:"JUMP",t:t-120}),true);
 assert.equal(a.core.actDone({kind:"JUMP",t:t+5400}),false);
 assert.equal(a.core.getActions()[0].kind,"ECSTASY");
});
test("better-gym recommendations only include previously verified access and respect eligibility",()=>{
 const a=boot();
 a.core.setFocus("strength");
 const one={id:1,name:"Existing Gym",energy_cost:25,modifiers:{strength:20,speed:20,defense:20,dexterity:20}};
 const better={id:2,name:"Higher Gym",energy_cost:25,modifiers:{strength:50,speed:20,defense:20,dexterity:20}};
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[one,better]},battlestats:{battlestats:{strength:{value:1452966},speed:{value:2000000},defense:{value:1000000},dexterity:{value:1000000}}},bars:{bars:{energy:{maximum:150},happy:{maximum:3500,current:3500}}}});
 assert.equal(a.core.gymTip(),"","an unverified better gym must not be claimed accessible");
 a.core.setVerifiedGyms({2:"owned"});
 assert.match(a.core.gymTip(),/Better gym available/);
 assert.match(a.core.gymTip(),/Higher Gym/);
});

// TornPDA's userscripts_provider.dart adaptSource() replaces smart punctuation first.
function pdaTransform(source){return '(function(){const PDA_storage=undefined;'+source.replaceAll('###PDA-APIKEY###','unit-test-key').replace(/[“”]/g,'"').replace(/[‘’]/g,"'")+'})();'}
test("full Android-injection wrapper parses after TornPDA smart-quote normalisation",()=>{
 const source=fs.readFileSync(FILE,"utf8");
 assert.equal(/[“”‘’]/.test(source),false,"Do not use curly quotes which TornPDA rewrites before evaluating JS");
 const wrapped=pdaTransform(source);
 const fn=new Function("document","window","location","localStorage","PDA_httpGet",wrapped);
 assert.equal(typeof fn,"function");
});
test("actual TornPDA pre-processing still creates HJ launcher and loaded marker",()=>{
 const source=fs.readFileSync(FILE,"utf8");
 const document=(()=>{const body={children:[],appendChild(x){this.children.push(x)}},head={children:[],appendChild(x){this.children.push(x)}};return {
  body,head,createElement(tag){return {tag,id:"",style:{},children:[],textContent:"",innerHTML:"",append(...x){this.children.push(...x)},appendChild(x){this.children.push(x)},addEventListener(){}}},
  addEventListener(){},getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}
 }})();
 const window={setInterval(){}};
 const localStorage={getItem(){return null},setItem(){}};
 const wrapped=pdaTransform(source);
 new Function("document","window","location","localStorage","PDA_httpGet",wrapped)(document,window,{hostname:"www.torn.com",pathname:"/gym.php"},localStorage,async()=>({status:200,responseText:"{}"}));
 assert.equal(window.__TornHappyJumpLoaded,"0.10.21");
 assert.ok(document.getElementById("hhj-launch"));
 assert.ok(document.getElementById("hhj-compact-panel"));
});
test("smart apostrophe in a single-quoted string would have failed the new regression test",()=>{
 const problematic="(function(){ const h='<p>Today’s refill</p>'; })();";
 assert.throws(()=>new Function(pdaTransform(problematic)),SyntaxError);
});
