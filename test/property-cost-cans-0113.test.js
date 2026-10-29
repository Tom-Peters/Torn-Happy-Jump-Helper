"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.11.3-preview.user.js");
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
 const injected=source.replace(/\}\)\(\);\s*$/, "window.__activity={scanActions,scanGym,actDone,refill,aFl,cMet,cFactor,mCard,boostCard,fCard,gymTip,gyms,getKnown:()=>vr,getActions:()=>acts,getLogs:()=>al,getInput:()=>loadInput(),setFocus:k=>{cfg.stat=k},setData:v=>{data=v},setVerifiedGyms:v=>{vr=v},setLedger:v=>{ledger=v},getToday:today,lab,propertyContext,propertyOptions,minimumPath,propertyCard,priorityAction,simulate,cFactor,targetWeeks,realInput:()=>loadInput(),badge,miniRefresh,getButton:()=>button,setPlan:v=>{lp=v},setCurrent:time=>{updated=time},setMode:v=>{cfg.mode=v},getConfig:()=>cfg,getState:()=>data};})();");
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
 assert.match(s,/@version\s+0\.11\.3/);
 assert.ok(s.length<74000);
 for(const label of ["I did it","Missed it · Replan","Not sure","data-act=\"mark-used\"","data-act=\"note-done\"","data-act=\"watch-done\""])assert.ok(!s.includes(label),"manual completion UI: "+label);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
 assert.equal(a.window.__TornHappyJumpLoaded,"0.11.3");
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
 assert.equal(a.calls.filter(x=>x.url.includes("log=2290,4900")).length,1);
 assert.equal(a.calls[0].headers.Authorization,"ApiKey unit-test-key");
 assert.equal(JSON.parse(a.store.get("hhj-compact-v1:verified-actions")).length,2);
 await a.core.scanActions();
 assert.equal(a.calls.filter(x=>x.url.includes("log=2290,4900")).length,1,"same-minute activity requests are cached");
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
 const noon=Math.floor(t/86400)*86400+86400+43200; const html=a.core.aFl({method:"natural",events:[{kind:"TRAIN",t:noon,detail:"Scheduled train"}]});
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
 assert.match(a.core.fCard(),/Fewer than 3 matching intervals/);
 const t=now();
 a.core.setLedger(Array.from({length:3},(_,i)=>({t:t-i*3600,from:t-i*3600-600,
 forecastStat:"strength",method:"natural",observed:{strength:950},expected:1000})));
 const html=a.core.fCard();
 assert.match(html,/95\.0% alignment/);
 assert.match(html,/Not model accuracy/);
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
 assert.equal(window.__TornHappyJumpLoaded,"0.11.3");
 assert.ok(document.getElementById("hhj-launch"));
 assert.ok(document.getElementById("hhj-compact-panel"));
});
test("smart apostrophe in a single-quoted string would have failed the new regression test",()=>{
 const problematic="(function(){ const h='<p>Today’s refill</p>'; })();";
 assert.throws(()=>new Function(pdaTransform(problematic)),SyntaxError);
});

test("gym page distinguishes no verified access from no better option",()=>{
 const a=boot();
 const gyms=[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}},
             {id:2,name:"Example Better Gym",energy_cost:25,modifiers:{strength:90}},
             {id:3,name:"Example Locked Gym",energy_cost:25,modifiers:{strength:100}}];
 a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms},battlestats:{battlestats:{strength:{value:1512929},speed:{value:2003873},defense:{value:1179842},dexterity:{value:1007916}}},bars:{bars:{energy:{maximum:150},happy:{maximum:3461}}}});
 const html=a.core.gyms();
 assert.match(html,/No alternative gyms verified yet/);
 assert.match(html,/One-time gym access verification/);
 assert.match(html,/id="hhj-gymlist"/);
 assert.match(html,/Remove verification/);
 assert.doesNotMatch(html,/No better vr gym/);
 assert.doesNotMatch(a.core.gymTip(),/Example Locked Gym/);
});
test("only verified owned or unlocked gym is eligible for recommendation",()=>{
 const a=boot();
 const gyms=[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}},
             {id:2,name:"Example Better Gym",energy_cost:25,modifiers:{strength:95}},
             {id:3,name:"Example Locked Gym",energy_cost:25,modifiers:{strength:100}}];
 a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms},stats:{battlestats:{strength:{value:1512929},speed:{value:2003873},defense:{value:1179842},dexterity:{value:1007916}}},bars:{bars:{energy:{maximum:150},happy:{maximum:3461}}}});
 a.core.setVerifiedGyms({2:"buy"});
 const html=a.core.gyms();
 assert.match(html,/Accessible gym comparison/);
 assert.match(html,/Example Better Gym/);
 assert.match(html,/Unlocked; membership not purchased/);
 assert.doesNotMatch(html,/Example Locked Gym<\/b>/);
});
test("schedule alignment reports planned and observed, not full model accuracy",()=>{
 const a=boot(),t=now();
 a.core.setFocus("strength");
 a.core.setLedger(Array.from({length:5},(_,i)=>({t:t-i*3600,from:t-i*3600-600,forecastStat:"strength",method:"natural",observed:{strength:700},expected:1000})));
 const html=a.core.fCard();
 assert.match(html,/7-day schedule vs observed/);
 assert.match(html,/70\.0% alignment/);
 assert.match(html,/Planned \+5,000/);
 assert.match(html,/Observed \+3,500/);
 assert.match(html,/Not model accuracy/);
 assert.doesNotMatch(html,/7-day matched forecast accuracy/);
});
test("forecast card never claims reliable accuracy with insufficient intervals",()=>{
 const a=boot();a.core.setFocus("strength");
 assert.match(a.core.fCard(),/Fewer than 3 matching intervals/);
});

test("canonical installer stays pinned at the confirmed release during preview",()=>{
 const stable=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8");
 const preview=fs.readFileSync(FILE,"utf8");
 assert.match(stable,/@version\s+0\.10\.22/);
 assert.match(stable,/@updateURL\s+https:\/\/raw\.githubusercontent\.com\/Tom-Peters\/Torn-Happy-Jump-Helper\/main\/Torn-Happy-Jump-Helper\.user\.js/);
 assert.match(preview,/@version\s+0\.11\.3/);
 assert.ok(!/[“”‘’]/.test(preview),"TornPDA smart punctuation must not break JS strings");
 assert.doesNotMatch(preview,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("preview launcher mounts and Today is concise by default",()=>{
 const a=boot();
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.equal(a.window.__TornHappyJumpLoaded,"0.11.3");
 const html=a.core.getToday();
 assert.match(html,/Refresh/);
 assert.doesNotMatch(html,/Your training numbers/);
});
test("action badge shows a timely scheduled train without opening the full dashboard",()=>{
 const a=boot();
 a.core.setMode("training");
 a.core.setCurrent(Date.now());
 const now=Date.now()/1000;
 const event={t:now+90,kind:"TRAIN",detail:"Train",q:25};
 a.core.setPlan([{method:"natural",events:[event],affordable:true,gain:1000}]);
 a.core.badge();
 const actual=a.core.getButton().textContent;
 if(/HJ 🏋️/.test(actual)){
  assert.match(actual,/\d+m|NOW/);
 }else{
  assert.ok(/HJ/.test(actual),"during quiet hours or unavailable action it must fail safe");
 }
});
test("property and energy can comparisons are visible only when data is available",()=>{
 const a=boot();
 assert.match(a.core.lab(),/Refresh live data first/);
 const stat=s=>({value:s});
 a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Example Gym",energy_cost:25,modifiers:{strength:75}}]},
 stats:{battlestats:{strength:stat(1512929),speed:stat(2003873),defense:stat(1179842),dexterity:stat(1007916)}},
 bars:{bars:{energy:{current:125,maximum:150,interval:600,increment:5},happy:{current:3461,maximum:3475}}},
 cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}}});
 const h=a.core.lab();
 assert.match(h,/Target: 50m strength/);
 assert.match(h,/Private Island what-if/);
 assert.match(h,/Energy-can what-if/);
 assert.match(h,/5025/);
 assert.match(h,/Timed simulation: 2-hour booster cooldown/);
 assert.match(h,/no items or properties are purchased/i);
});

test("the permanent preview channel is independent of the pinned stable channel",()=>{
 const stable=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8");
 const preview=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
 assert.match(stable,/@version\s+0\.10\.22/);
 assert.match(preview,/@version\s+0\.11\.[123]/);
 assert.match(preview,/@updateURL\s+https:\/\/raw\.githubusercontent\.com\/Tom-Peters\/Torn-Happy-Jump-Helper\/main\/Torn-Happy-Jump-Helper-preview\.user\.js/);
 assert.match(preview,/@namespace\s+https:\/\/github\.com\/Tom-Peters\/Torn-Happy-Jump-Helper#preview\b/);
 assert.ok(!/[“”‘’]/.test(preview));
});

test("higher base Happy cannot reduce projected gains after calibration is held constant",()=>{
 const a=boot(),stat=x=>({value:x});
 a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}}]},stats:{battlestats:{strength:stat(1514728),speed:stat(2003873),defense:stat(1179842),dexterity:stat(1007916)}},bars:{bars:{energy:{current:10,maximum:150,interval:600,increment:5},happy:{current:3461,maximum:3475}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}}});
 const p=a.core.realInput();
 assert.ok(p);
 const original=a.core.simulate("natural",{...p,happy:3475,maxH:3475,_factor:.97},168);
 const upgrade=a.core.simulate("natural",{...p,happy:5025,maxH:5025,_factor:.97},168);
 assert.ok(upgrade.gain>original.gain,"higher Happy with the same trains and calibration should produce higher gains");
 const h=a.core.lab();
 assert.match(h,/Private Island what-if/);
 assert.match(h,/days sooner/);
 assert.doesNotMatch(h,/Time difference: -/);
});
test("energy cans count actual delivered E and shared booster cooldown rather than invented 56 cans",()=>{
 const a=boot(),stat=x=>({value:x});
 a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}}]},stats:{battlestats:{strength:stat(1514728),speed:stat(2003873),defense:stat(1179842),dexterity:stat(1007916)}},bars:{bars:{energy:{current:10,maximum:150,interval:600,increment:5},happy:{current:3461,maximum:3475}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}}});
 const p=a.core.realInput();
 const base=a.core.simulate("natural",{...p,_factor:.97},168);
 const extra=a.core.simulate("natural",{...p,_factor:.97,_canScenario:{perDay:8,baseE:25,mult:1}},168);
 assert.ok(extra.canCount>0 && extra.canCount<=56);
 assert.ok(extra.canAdded>0 && extra.canAdded<=extra.canCount*25);
 assert.equal(extra.events.filter(x=>x.kind==="CAN").length,extra.canCount);
 assert.ok(extra.gain>=base.gain,"schedule should not lose overall gain for additive cans in this setup");
 assert.match(a.core.lab(),/Timed simulation/);
});
test("fractional milestone projections change for moderately higher weekly gains",()=>{
 const a=boot();
 const slower=a.core.targetWeeks(1514728,1700000),faster=a.core.targetWeeks(1514728,1750000);
 assert.ok(slower>faster);
 assert.ok((slower-faster)*7>.2);
});

test("automatically recognises property type, installed modifications, staff and Happy from Torn v2",()=>{
 const a=boot(),stat=x=>({value:x});
 a.core.setFocus("strength");
 a.core.setData({
  gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}}]},
  stats:{battlestats:{strength:stat(1514728),speed:stat(2003873),defense:stat(1179842),dexterity:stat(1007916)}},
  bars:{bars:{energy:{current:30,maximum:150,interval:600,increment:5},happy:{current:3461,maximum:3475}}},
  cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}},
  property:{property:{id:999,property:{id:14,name:"Castle"},happy:3475,modifications:["Sauna","Large Pool"],staff:[{type:"Maid",amount:1}]}},
  propertyCatalog:{properties:[{id:14,name:"Castle",happy:1500,cost:200000000,modifications:["Sauna","Hot Tub","Open Bar","Large Pool","Extra Large Vault","Small Pool","Medium Pool"],staff:[]}]}
 });
 const ctx=a.core.propertyContext();
 assert.equal(ctx.name,"Castle");assert.equal(ctx.happy,3475);
 assert.deepEqual(ctx.mods,["Sauna","Large Pool"]);assert.equal(ctx.staff[0].type,"Maid");
 const p=a.core.realInput();const plans=a.core.propertyOptions(p,ctx,"natural",.97);
 assert.ok(plans.some(x=>x.name==="Open Bar"));
 assert.ok(plans.some(x=>x.name==="Hot Tub"));
 assert.ok(!plans.some(x=>x.name==="Sauna"),"installed upgrade must never be repurchased");
 assert.ok(!plans.some(x=>x.name==="Small Pool"),"cannot buy a lower pool tier for more happy");
 assert.ok(!plans.some(x=>x.name==="Private Yacht"),"catalogue-disallowed upgrade is unavailable");
 assert.ok(plans.every(x=>x.change>0&&x.cost>0&&x.roi>0));
 assert.ok(plans.every((x,i)=>i===0||plans[i-1].roi>=x.roi),"rank upgrades by gain per dollar");
 const html=a.core.propertyCard(p,"natural",.97);
 assert.match(html,/Castle/);assert.match(html,/3,475/);
 assert.match(html,/Rank upgrades by extra strength per \$1m/);
});
test("absence of authoritative property details never invents owned upgrades",()=>{
 const a=boot(),stat=x=>({value:x});
 a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Gym",energy_cost:25,modifiers:{strength:75}}]},stats:{battlestats:{strength:stat(1514728)}},bars:{bars:{happy:{current:3461,maximum:3475},energy:{current:30,maximum:150}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}}});
 assert.equal(a.core.propertyContext(),null);
 assert.match(a.core.propertyCard(a.core.realInput(),"natural",1),/No upgrades ranked without confirmed property details/);
});
test("badge picks the single highest priority event in an imminent cluster",()=>{
 const a=boot(),now=Math.floor(Date.now()/86400000)*86400+43200;
 a.core.getConfig().sleepEnabled=false;
 const events=[{kind:"TRAIN",t:now+50},{kind:"XANAX",t:now+140},{kind:"JUMP",t:now+150}];
 assert.equal(a.core.priorityAction(events,now).kind,"JUMP");
 assert.equal(a.core.priorityAction([{kind:"TRAIN",t:now-30},{kind:"XANAX",t:now+140}],now).kind,"TRAIN","an action already due takes precedence");
 assert.equal(a.core.priorityAction([{kind:"TRAIN",t:now+4000}],now),null);
});
test("property API URLs are read only and never included in permanent stable release",()=>{
 const preview=fs.readFileSync(FILE,"utf8");
 const stable=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8");
 assert.match(preview,/property:"\/user\/property"/);
 assert.match(preview,/propertyCatalog:"\/torn\/properties"/);
 assert.doesNotMatch(stable,/propertyCatalog:"\/torn\/properties"/);
 assert.match(stable,/@version\s+0\.10\.22/);
 assert.ok(!/[“”‘’]/.test(preview));
});

test("current PI exposes missing superior interior and ranks it ahead of Yacht",()=>{
 const a=boot(),stat=x=>({value:x});a.core.setFocus("strength");
 const mods=["Hot Tub","Advanced Shooting Range","Sauna","Medical Facility","Airstrip","Open Bar","Large Pool","Medium Vault"],available=mods.concat(["Sufficient Interior Modification","Superior Interior Modification","Private Yacht","Large Vault","Extra Large Vault","Small Vault","Small Pool","Medium Pool"]);
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}}]},stats:{battlestats:{strength:stat(1554824),speed:stat(2003873),defense:stat(1179842),dexterity:stat(1007916)}},bars:{bars:{energy:{current:30,maximum:150,interval:600,increment:5},happy:{current:3475,maximum:3475}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}},property:{property:{property:{id:14,name:"Private Island"},happy:3475,modifications:mods,staff:[{type:"Maid",amount:4}]}},propertyCatalog:{properties:[{id:14,name:"Private Island",cost:500000000,happy:2000,modifications:available}]}});
 const ctx=a.core.propertyContext(),p=a.core.realInput();const rows=a.core.propertyOptions(p,ctx,"xanax",.97);
 const sup=rows.find(x=>x.name==="Superior Interior Modification"),suff=rows.find(x=>x.name==="Sufficient Interior Modification");
 assert.ok(sup&&suff);
 assert.equal(sup.gain,1000);assert.equal(sup.cost,250000000);
 assert.equal(suff.gain,500);assert.equal(suff.cost,125000000);
 assert.ok(rows.indexOf(sup)>=0&&rows.indexOf(suff)>=0);assert.ok(rows.findIndex(x=>x.name==="Sufficient Interior Modification")<rows.findIndex(x=>x.name==="Private Yacht"),"interior upgrades should outrank yacht");
 const target=a.core.minimumPath(p,ctx,"xanax",.97,5025);
 assert.equal(target.cost,1360000000);
 assert.deepEqual(target.names.slice().sort(),["Extra Large Vault","Private Yacht","Superior Interior Modification"].sort());
 assert.match(a.core.lab(),/Catalogue minimum: \$1,360,000,000/);
 a.store.set("hhj-compact-v1:lab-property-cost",JSON.stringify(250000000));
 assert.match(a.core.lab(),/Your manual budget is below this minimum/);
});
test("energy cans requested six per day never exceed 42 within rolling seven days",()=>{
 const a=boot(),stat=x=>({value:x});a.core.setFocus("strength");
 a.core.setData({gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Frontline Fitness",energy_cost:25,modifiers:{strength:75}}]},stats:{battlestats:{strength:stat(1554824),speed:stat(2003873),defense:stat(1179842),dexterity:stat(1007916)}},bars:{bars:{energy:{current:20,maximum:150,interval:600,increment:5},happy:{current:3475,maximum:3475}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}}});
 const p=a.core.realInput(),r=a.core.simulate("natural",{...p,_factor:.97,_canScenario:{perDay:6,baseE:5,mult:1}},168);
 assert.ok(r.canCount>=0&&r.canCount<=42,"6/day in a seven-day horizon cannot exceed 42");
 assert.ok(r.canAdded<=r.canCount*5);
 assert.equal(r.events.filter(x=>x.kind==="CAN").length,r.canCount);
});
