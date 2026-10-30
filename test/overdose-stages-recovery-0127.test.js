"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.7-preview.user.js");
function boot(){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","test-key");
 const store=new Map();
 function node(tag){return {tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",
 append(...items){this.children.push(...items)},appendChild(x){this.children.push(x)},
 addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},get id(){return this._id},set id(v){this._id=v}}}
 const body=node("body"),head=node("head");
 const document={body,head,createElement:node,addEventListener(){},
 getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}};
 const window={setInterval(){}};
 const injected=source.replace(/\}\)\(\);\s*$/,"window.__test={reportedOverdose,noteOverdose,clearOverdose,overdoseRecoveryCard,badge,drugOdOdds,overdoseStageCost,overdoseStageCard,odRecoverySnapshot,overdoseForecast,jumpSuccessAssumption,jumpRiskAssessment,replacementCost,settings,jumpStress,jumpBreakEven,jumpValueCard,jumpValueBrief,jumpVerdictLabel,simulate,optimizerResults,nextDecision,compare,today,setData:v=>{data=v},setPrices:v=>{prices=v},setInventory:v=>{inv=v},getInput:loadInput,getConfig:()=>cfg,setUpdated:t=>{updated=t},setPlan:v=>{lp=v},setSelected:v=>{sm=v}};})();");
 assert.notEqual(injected,source);
 new Function("document","location","window","localStorage","PDA_httpGet",injected)(
  document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,
  async()=>({status:200,responseText:"{}"}));
 return {core:window.__test,document,window,store};
}
function configure(a,{stat=125000,budget=100000000,prices=true,own={}}={}){
 const v=n=>({value:n});
 a.core.setData({
  stats:{battlestats:{strength:v(stat),speed:v(190000),defense:v(180000),dexterity:v(170000)}},
  gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Gym",energy_cost:25,modifiers:{strength:70,speed:50,defense:50,dexterity:50}}]},
  bars:{bars:{energy:{current:60,maximum:150,interval:600,increment:5},happy:{current:3500,maximum:3500}}},
  cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:false}},
  perks:{perks:{book_perks:[]}}
 });
 a.core.setPrices(prices?{
   xanax:[{price:70000,amount:200}],ecstasy:[{price:100000,amount:100}],
   dvd:[{price:50000,amount:100}],lollipop:[{price:500,amount:400}],
   points:[{price:1000,amount:20000}]
 }:{xanax:[{price:70000,amount:100}]});
 a.core.setInventory(own);
 const cfg=a.core.getConfig();cfg.budget=budget;cfg.stat="strength";cfg.mode="training";cfg.refills=true;
 cfg.sleepEnabled=false;cfg.ownedPoints=0;cfg.manualPrices={};
 a.core.setUpdated(Date.now());
}
test("v0.12.7 boots on TornPDA with the HJ launcher and only read-only requests",()=>{
 const s=fs.readFileSync(FILE,"utf8");assert.match(s,/@version\s+0\.12\.6/);
 assert.ok(s.length<120000);assert.doesNotMatch(s,/[“”‘’]/);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();assert.equal(a.window.__TornHappyJumpLoaded,"0.12.7");
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
});
test("candy and eDVD jumps are compared against equal-time regular alternatives, not seven days",()=>{
 const a=boot();configure(a);
 const result=a.core.jumpBreakEven();
 assert.equal(result.rows.length,2);
 for(const row of result.rows){
  assert.ok(!["unavailable","unknown"].includes(row.verdict),row.reason);
  assert.ok(row.hours>=25&&row.hours<168);
  assert.equal(row.extraGain,row.jumpGain-row.regularGain);
  assert.equal(row.extraCash,row.jumpCost-row.regularCost);
  assert.equal(row.extraPct,100*row.extraGain/row.regularGain);
  assert.ok(["natural","xanax"].includes(row.regularMethod));
  assert.ok(row.energy>0);
 }
 const html=a.core.jumpValueCard();
 assert.match(html,/Happy Jump break-even/);
 assert.match(html,/Net stat advantage/);
 assert.match(html,/same time window and budget/);
 assert.match(a.core.compare(),/Happy Jump break-even/);
 assert.match(a.core.today(),/Is a Happy Jump worth it/);
});
test("at high focused stats the adviser can favour regular training rather than always recommending jumps",()=>{
 const a=boot();configure(a,{stat:50000000});
 const result=a.core.jumpBreakEven();
 assert.ok(result.rows.every(r=>r.verdict==="skip"||r.verdict==="tradeoff"),JSON.stringify(result.rows.map(r=>({v:r.verdict,d:r.extraGain,p:r.extraPct}))));
 assert.ok(!result.rows.some(r=>r.verdict==="consider"));
});
test("missing market prices do not create imaginary zero-priced jump kits",()=>{
 const a=boot();configure(a,{prices:false});
 const result=a.core.jumpBreakEven();
 assert.equal(result.rows.length,2);
 assert.ok(result.rows.every(r=>r.verdict==="unavailable"));
 assert.match(a.core.jumpValueCard(),/item prices or inventory could not be confirmed/);
});
test("stale, incomplete or missing gym state prompts refresh instead of a jump verdict",()=>{
 const a=boot();
 assert.deepEqual(a.core.jumpBreakEven().rows,[]);
 assert.match(a.core.jumpValueCard(),/current gym and battle-stat reading/);
 configure(a);
 a.core.setUpdated(Date.now()-16*60000);
 assert.deepEqual(a.core.jumpBreakEven().rows,[]);
 assert.match(a.core.jumpValueBrief(),/full refresh is needed/);
});
test("owning consumables counts as zero new spending but does not count them as free opportunity cost",()=>{
 const a=boot();configure(a,{budget:0,prices:false,own:{xanax:4,ecstasy:1,dvd:4,lollipop:48}});
 const rows=a.core.jumpBreakEven().rows;
 assert.equal(rows.length,2);
 assert.ok(rows.every(x=>x.verdict!=="unavailable"));
 assert.ok(rows.every(x=>x.jumpCost===0));
 assert.match(a.core.jumpValueCard(),/Consumed item replacement value/);
});
test("unfavourable jump in Happy mode blocks blind due-now recommendation without blocking manual schedules",()=>{
 const a=boot();configure(a,{stat:50000000});
 a.core.getConfig().mode="happy";
 a.core.setPlan([{method:"happy",affordable:true,gain:100,jumps:1,events:[{kind:"XANAX",t:Date.now()/1000+60,detail:"Stack"}]}]);
 a.core.setSelected("happy");
 const answer=a.core.nextDecision();
 assert.equal(answer.kind,"strategy");
 assert.equal(answer.tab,"compare");
 assert.match(answer.title,/Review jump value/);
});

test("pessimistic gain and price stress calculation is deterministic and mathematically bounded",()=>{
 const a=boot();
 const robust=a.core.jumpStress(200,100,80,70,1000);
 assert.ok(Math.abs(robust.downsideGain-70)<1e-8);
 assert.ok(Math.abs(robust.upsideGain-130)<1e-8);
 assert.ok(Math.abs(robust.stressedExtraCash-26)<1e-8);
 assert.ok(robust.robust);
 const weak=a.core.jumpStress(120,100,80,70,1000);
 assert.ok(weak.downsideGain<0);
 assert.ok(weak.upsideGain>0);
 assert.equal(weak.robust,false);
 const noSpending=a.core.jumpStress(140,100,10,20,null);
 assert.ok(noSpending.robust,"a net cheaper jump with material stressed gains can still qualify");
});
test("actual jump forecasts contain labelled upside, downside and regeneration opportunity cost",()=>{
 const a=boot();configure(a);
 const rows=a.core.jumpBreakEven().rows;
 assert.equal(rows.length,2);
 for(const row of rows){
  assert.ok(Number.isFinite(row.downsideGain));
  assert.ok(Number.isFinite(row.upsideGain));
  assert.ok(row.downsideGain<row.upsideGain);
  assert.ok(row.jumpOverflow>=0);
  assert.ok(row.regularOverflow>=0);
  assert.equal(row.robust,row.gainHolds&&row.valueHolds);
  if(row.baseVerdict==="consider"&&!row.robust)assert.equal(row.verdict,"tradeoff");
  assert.equal(row.downsideGain,row.jumpGain*.9-row.regularGain*1.1);
 }
 const html=a.core.jumpValueCard();
 assert.match(html,/Scenario stress check/);
 assert.match(html,/Hypothetical, not a probability range/);
 assert.match(html,/Forecast energy regeneration lost by jump completion/);
 assert.match(html,/not a confidence interval/);
});
test("unknown or stale prices do not create an invented stress-tested positive verdict",()=>{
 const a=boot();configure(a,{prices:false});
 const rows=a.core.jumpBreakEven().rows;
 assert.equal(rows.length,2);
 assert.ok(rows.every(row=>row.verdict==="unavailable"));
 assert.ok(rows.every(row=>row.robust===undefined));
 a.core.setUpdated(Date.now()-31*60000);
 assert.equal(a.core.jumpBreakEven().rows.length,0);
});
test("high stats keep a conservative recommendation in Happy mode even under optimistic stress case",()=>{
 const a=boot();configure(a,{stat:50000000});
 const rows=a.core.jumpBreakEven().rows;
 assert.ok(rows.every(row=>row.verdict==="skip"||row.verdict==="tradeoff"));
 a.core.getConfig().mode="happy";
 a.core.setPlan([{method:"happy",affordable:true,gain:100,jumps:1,events:[{kind:"XANAX",t:Date.now()/1000+60,detail:"Stack"}]}]);
 a.core.setSelected("happy");
 assert.equal(a.core.nextDecision().kind,"strategy");
});

test("risk assumption is unset until user explicitly supplies a valid 0-100 percentage",()=>{
 const a=boot();configure(a);
 assert.equal(a.core.jumpSuccessAssumption(),null);
 const c=a.core.getConfig();
 for(const v of [null,"",undefined,-1,101,"unknown",Infinity]){c.jumpSuccessPct=v;assert.equal(a.core.jumpSuccessAssumption(),null)}
 c.jumpSuccessPct=0;assert.equal(a.core.jumpSuccessAssumption(),0);
 c.jumpSuccessPct=80.5;assert.equal(a.core.jumpSuccessAssumption(),80.5);
 c.jumpSuccessPct=100;assert.equal(a.core.jumpSuccessAssumption(),100);
});
test("synthetic jump risk computes honest parity odds and expected gains, never an official probability",()=>{
 const a=boot();configure(a);
 a.core.getConfig().jumpSuccessPct=80;
 const event={kind:"JUMP",t:1000};
 const jump={gain:1000,cost:100,events:[{kind:"TRAIN",t:900,g:100,q:25},event,{kind:"TRAIN",t:1000,g:900,q:750}],count:{xanax:4,ecstasy:1,dvd:4}};
 const regular={gain:600,cost:30,events:[{kind:"TRAIN",t:950,g:600,q:500}],count:{points:30}};
 const r=a.core.jumpRiskAssessment(jump,regular,event);
 assert.equal(r.failedGain,100);
 assert.ok(Math.abs(r.parityPct-100*500/900)<1e-9);
 assert.ok(Math.abs(r.targetPct-100*530/900)<1e-9);
 assert.equal(r.expectedGain,820);
 assert.equal(r.expectedExtra,220);
 assert.ok(Math.abs(r.expectedExtraPct-100*220/600)<1e-9);
 assert.equal(r.jumpEnergy,775);
 assert.equal(r.regularEnergy,500);
 assert.equal(r.energyGap,-275);
 assert.ok(r.jumpReplacement>0);
 assert.equal(r.regularReplacement,30000);
 assert.equal(r.replacementExtra,r.jumpReplacement-r.regularReplacement);
});
test("owned jump supplies have zero new purchase cost but a nonzero replacement-price proxy",()=>{
 const a=boot();configure(a,{budget:0,own:{xanax:4,ecstasy:1,dvd:4,lollipop:48}});
 const rows=a.core.jumpBreakEven().rows;
 assert.equal(rows.length,2);
 for(const r of rows){
  assert.notEqual(r.verdict,"unavailable");
  assert.equal(r.jumpCost,0);
  assert.ok(r.jumpReplacement>0);
  assert.ok(r.ownedJumpReplacement>0);
  assert.ok(r.replacementExtra>0);
  assert.ok(r.targetPct!==null);
  assert.equal(r.expectedGain,null);
  assert.notEqual(r.verdict,"consider");
 }
 assert.match(a.core.jumpValueCard(),/Consumed item replacement value/);
 assert.match(a.core.jumpValueCard(),/No chance supplied/);
});
test("unpriced owned supplies never become a fictitious free replacement value",()=>{
 const a=boot();configure(a,{budget:0,prices:false,own:{xanax:4,ecstasy:1,dvd:4,lollipop:48}});
 const rows=a.core.jumpBreakEven().rows;
 assert.equal(rows.length,2);
 assert.ok(rows.every(x=>x.jumpCost===0));
 assert.ok(rows.every(x=>x.jumpReplacement===null));
 assert.match(a.core.jumpValueCard(),/Price unknown/);
 assert.ok(rows.every(x=>x.verdict!=="consider"));
});
test("changing assumed odds recomputes cached forecasts, and low completion odds prevent positive recommendation",()=>{
 const a=boot();configure(a);
 const before=a.core.jumpBreakEven();
 assert.equal(before.rows[0].successPct,null);
 const cfg=a.core.getConfig();cfg.jumpSuccessPct=5;
 const after=a.core.jumpBreakEven();
 assert.notEqual(before,after);
 for(const r of after.rows){
  if(r.verdict==="unavailable"||r.verdict==="unknown")continue;
  assert.equal(r.successPct,5);
  assert.ok(Number.isFinite(r.expectedGain));
  assert.equal(r.expectedExtra,r.expectedGain-r.regularGain);
  assert.equal(r.verdict,"skip");
 }
 cfg.jumpSuccessPct=100;
 const high=a.core.jumpBreakEven();
 assert.ok(high.rows.every(r=>r.successPct===100));
});
test("risk odds remain an optional setting and warnings disclose conservative failure assumptions",()=>{
 const a=boot();configure(a);
 assert.match(a.core.settings(),/id="hhj-jump-success"/);
 assert.match(a.core.settings(),/Leave blank when unknown/);
 const html=a.core.jumpValueCard();
 assert.match(html,/Success chance needed for \+5% gains/);
 assert.match(html,/the first overdose/);
 assert.match(html,/buy-price proxy/);
 assert.match(html,/Energy trained by jump time/);
 assert.match(html,/rather than official/);
});

test("overdose inputs default unknown, are independent, and reject invalid values",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();
 assert.equal(a.core.drugOdOdds("xanax"),null);assert.equal(a.core.drugOdOdds("ecstasy"),null);
 for(const value of [null,"",-1,101,Infinity,"??"]){c.xanaxOdPct=value;assert.equal(a.core.drugOdOdds("xanax"),null)}
 c.xanaxOdPct=2;c.ecstasyOdPct=5;
 assert.equal(a.core.drugOdOdds("xanax"),2);assert.equal(a.core.drugOdOdds("ecstasy"),5);
});
test("four independent Xanax OD chances and one Ecstasy chance compound correctly",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();c.xanaxOdPct=2;c.ecstasyOdPct=5;
 const e=[0,1,2,3].map(i=>({kind:"XANAX",t:i*100,spent:100,odEnergy:250*i,odHappy:1000+i}));
 e.push({kind:"JUMP",t:400,spent:200,odEnergy:1000,odHappy:11000});
 e.push({kind:"TRAIN",t:400,g:10000,q:1000});
 const plan={method:"happy",events:e,gain:10000,cost:600};
 const result=a.core.overdoseForecast(plan);
 assert.ok(result.available);
 const survival=Math.pow(.98,4)*.95;
 assert.ok(Math.abs(result.successPct-100*survival)<1e-8);
 assert.ok(Math.abs(result.anyOdPct-100*(1-survival))<1e-8);
 assert.equal(result.branches.length,5);
 assert.ok(Math.abs(result.branches[0].probability-.02)<1e-10);
 assert.ok(Math.abs(result.branches[1].probability-.98*.02)<1e-10);
 assert.ok(Math.abs(result.branches[4].probability-Math.pow(.98,4)*.05)<1e-10);
 assert.ok(Math.abs(result.expectedGain-survival*10000)<1e-8);
 assert.ok(result.expectedSpend>0&&result.expectedSpend<600);
 assert.ok(result.expectedHospitalMin>0);
 assert.ok(result.expectedEnergyLost>0&&result.expectedHappyLost>0);
 assert.ok(result.xanaxOdPct>0&&result.ecstasyOdPct>0);
});
test("100% Xanax OD stops at first dose, keeps earlier stat gains, and incurs hospital impact",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();c.xanaxOdPct=100;c.ecstasyOdPct=0;
 const events=[{kind:"TRAIN",t:1,g:123,q:25},{kind:"XANAX",t:2,spent:70000,odEnergy:250,odHappy:1000},{kind:"TRAIN",t:2,g:900,q:250},{kind:"XANAX",t:3,spent:70000}];
 const r=a.core.overdoseForecast({method:"xanax",events,gain:1023,cost:140000});
 assert.equal(r.successPct,0);assert.equal(r.anyOdPct,100);
 assert.equal(r.expectedGain,123);assert.equal(r.expectedSpend,70000);
 assert.equal(r.expectedEnergyLost,250);assert.equal(r.expectedHappyLost,1000);
 assert.equal(r.expectedHospitalMin,5000);
 assert.equal(r.branches[1].probability,0);
});
test("Ecstasy OD can destroy a fully stacked jump, including consumed boosters, without Xanax hospital exposure",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();c.xanaxOdPct=0;c.ecstasyOdPct=100;
 const events=[{kind:"TRAIN",t:0,g:60},{kind:"XANAX",t:1,spent:100},{kind:"XANAX",t:2,spent:100},{kind:"XANAX",t:3,spent:100},{kind:"XANAX",t:4,spent:100},{kind:"JUMP",t:5,spent:150,odEnergy:1000,odHappy:12000},{kind:"TRAIN",t:5,g:900,q:1000}];
 const r=a.core.overdoseForecast({method:"happy-candy",events,gain:960,cost:550});
 assert.equal(r.successPct,0);assert.equal(r.expectedGain,60);assert.equal(r.expectedSpend,550);
 assert.equal(r.expectedEnergyLost,1000);assert.equal(r.expectedHappyLost,12000);
 assert.equal(r.expectedHospitalMin,0);assert.equal(r.ecstasyOdPct,100);
});
test("regular Natural training has zero drug overdose risk even when OD settings are missing",()=>{
 const a=boot();configure(a);
 const r=a.core.overdoseForecast({method:"natural",events:[{kind:"TRAIN",t:1,g:500,spent:0}],gain:500,cost:0});
 assert.equal(r.available,true);assert.equal(r.successPct,100);assert.equal(r.expectedGain,500);
 assert.equal(r.anyOdPct,0);assert.equal(r.attempts,0);
 const unknown=a.core.overdoseForecast({method:"xanax",events:[{kind:"XANAX",t:1,spent:10}],gain:0,cost:10});
 assert.equal(unknown.available,false);
});
test("real jump and Xanax models expose energy and happy at each potential overdose",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();c.xanaxOdPct=2;c.ecstasyOdPct=5;
 const r=a.core.jumpBreakEven();
 assert.equal(r.rows.length,2);
 for(const row of r.rows){
  assert.ok(row.odReady);
  assert.equal(row.odJump.branches.length,5);
  assert.equal(row.odJump.attempts,5);
  assert.ok(row.odRegular.available);
  assert.ok(row.odJump.branches.every(x=>x.energyLost!==null&&x.happyLost!==null));
  assert.ok(row.odJump.expectedGain<=row.jumpGain+1e-6);
  assert.ok(row.odRegular.expectedGain<=row.regularGain+1e-6);
 }
 const html=a.core.jumpValueCard();
 assert.match(html,/Overdose-aware comparison/);assert.match(html,/First OD on Xanax/);
 assert.match(html,/5,000 minutes of hospital time/);
 assert.match(html,/first OD on Ecstasy/);
});
test("risk memo invalidates when either drug-specific probability changes",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();c.xanaxOdPct=0;c.ecstasyOdPct=0;
 const base=a.core.jumpBreakEven();assert.ok(base.rows.every(x=>x.odJump.successPct===100));
 c.xanaxOdPct=10;const changed=a.core.jumpBreakEven();assert.notEqual(changed,base);
 assert.ok(changed.rows.every(x=>x.odJump.successPct<100));
 c.ecstasyOdPct=50;const later=a.core.jumpBreakEven();assert.notEqual(later,changed);
 assert.ok(later.rows.every(x=>x.odJump.successPct<changed.rows[0].odJump.successPct));
});
test("per-dose OD settings are clearly labeled hypothetical, and leave the prior aggregate input intact",()=>{
 const a=boot();configure(a);
 const html=a.core.settings();
 assert.match(html,/id="hhj-xanax-od"/);assert.match(html,/id="hhj-ecstasy-od"/);
 assert.match(html,/Leave blank if unknown/);assert.match(html,/faction/);
 assert.match(html,/id="hhj-jump-success"/);
});

test("a self-reported overdose pauses recommendations and replaces the floating training badge",()=>{
 const a=boot();configure(a);a.core.getConfig().mode="happy";
 assert.equal(a.core.reportedOverdose(),null);
 assert.match(a.core.overdoseRecoveryCard(),/Report Xanax OD/);
 assert.equal(a.core.noteOverdose("xanax"),true);
 assert.equal(a.core.reportedOverdose().drug,"xanax");
 const reason=a.core.nextDecision();
 assert.equal(reason.kind,"overdose");
 assert.match(reason.title,/pause drug planning/);
 assert.match(a.core.overdoseRecoveryCard(),/XANAX overdose reported manually/);
 a.core.badge();
 assert.match(a.document.getElementById("hhj-launch").textContent,/⚠/);
 assert.equal(a.core.noteOverdose("not-a-drug"),false);
 a.core.clearOverdose();
 assert.equal(a.core.reportedOverdose(),null);
 assert.match(a.core.overdoseRecoveryCard(),/Report Ecstasy OD/);
});
test("Ecstasy overdose can be logged separately without declaring an API-detected event",()=>{
 const a=boot();configure(a);
 assert.equal(a.core.noteOverdose("ecstasy"),true);
 const held=a.core.reportedOverdose();
 assert.equal(held.drug,"ecstasy");assert.ok(held.t>0);
 assert.match(a.core.overdoseRecoveryCard(),/reported manually/);
 assert.equal(a.core.nextDecision().tab,"today");
});

test("v0.12.7 first-OD probability breakdown includes the dose that triggers the overdose",()=>{
 const a=boot();configure(a);const c=a.core.getConfig();c.xanaxOdPct=2;c.ecstasyOdPct=5;
 const ev=[0,1,2,3].map(i=>({kind:"XANAX",t:100+i*100,spent:70000,odEnergy:250*(i+1),odHappy:75*(i+1)}));
 ev.push({kind:"JUMP",t:500,spent:300000,odEnergy:1000,odHappy:12000},{kind:"TRAIN",t:500,g:10000,q:1000});
 const r=a.core.overdoseForecast({method:"happy",events:ev,gain:10000,cost:580000,count:{xanax:4,ecstasy:1,dvd:4}});
 assert.ok(r.available);
 assert.equal(r.branches.length,5);
 assert.ok(Math.abs(r.branches.reduce((n,b)=>n+b.probability,0)+r.successPct/100-1)<1e-10);
 assert.equal(r.branches[0].ordinal,1);
 assert.equal(r.branches[3].ordinal,4);
 assert.equal(r.branches[4].drug,"ecstasy");
 assert.equal(r.branches[4].replacementCost,4*70000+4*50000+100000);
 assert.equal(r.branches[2].replacementCost,3*70000);
 assert.equal(r.branches[0].spendThrough,70000);
 assert.equal(r.branches[4].spendThrough,580000);
 assert.ok(r.expectedFailurePurchase>0&&r.expectedFailurePurchase<r.expectedSpend);
 assert.ok(r.expectedFailureReplacement>0);
 const html=a.core.overdoseStageCard(r);
 assert.match(html,/Xanax dose 4/);assert.match(html,/Ecstasy dose/);
 assert.match(html,/First OD here/);assert.match(html,/The dose causing an OD|the dose triggering it|An OD consumes the dose that triggered it/);
});
test("unpriced items retain unknown OD replacement value rather than being treated as free",()=>{
 const a=boot();configure(a,{prices:false,own:{xanax:4,ecstasy:1,dvd:4,lollipop:48}});
 const c=a.core.getConfig();c.xanaxOdPct=10;c.ecstasyOdPct=10;
 const r=a.core.overdoseForecast({method:"happy",events:[
 {kind:"XANAX",t:1,spent:0},{kind:"XANAX",t:2,spent:0},{kind:"XANAX",t:3,spent:0},{kind:"XANAX",t:4,spent:0},{kind:"JUMP",t:5,spent:0}
 ],gain:500,cost:0,count:{xanax:4,ecstasy:1,dvd:4}});
 assert.ok(r.available);
 assert.equal(r.expectedFailureReplacement,null);
 assert.match(a.core.overdoseStageCard(r),/Price unknown/);
});
test("pure recovery snapshot distinguishes Xanax reference end from verified live hospital status",()=>{
 const a=boot();configure(a);
 a.core.noteOverdose("xanax");
 const held=a.core.reportedOverdose();
 assert.ok(held);
 const r=a.core.odRecoverySnapshot(held,held.t+3600);
 assert.equal(r.referenceEnd,held.t+5000*60);
 assert.equal(r.remainingMinutes,4940);
 assert.equal(r.energy,60);
 assert.equal(r.happy,3500);
 assert.equal(r.drugCooldown,0);
 assert.match(a.core.overdoseRecoveryCard(),/Not an actual hospital countdown/);
 assert.match(a.core.overdoseRecoveryCard(),/5,000 minutes/);
 assert.match(a.core.overdoseRecoveryCard(),/Refresh current bars/);
});
test("recovery hold is resistant to accidental clearing and pauses Today and the Schedule",()=>{
 const a=boot();configure(a);
 assert.ok(a.core.noteOverdose("ecstasy"));
 const held=a.core.reportedOverdose();
 assert.ok(held);
 assert.match(a.core.overdoseRecoveryCard(),/Ecstasy OD/);
 assert.match(a.core.overdoseRecoveryCard(),/I have recovered/);
 assert.match(a.core.today(),/Forecast suspended/);
 assert.doesNotMatch(a.core.today(),/Is a Happy Jump worth it/);
 assert.match(a.core.plan(),/Schedule paused/);
 assert.equal(a.core.nextDecision().kind,"overdose");
 const ui=a.document.getElementById("hhj-compact-panel");
 assert.ok(ui&&typeof ui.onclick==="function");
 const click=act=>ui.onclick({target:{closest:()=>({dataset:{act}})}});
 click("od-clear");
 assert.ok(a.core.reportedOverdose(),"first click only opens confirmation");
 assert.match(a.core.overdoseRecoveryCard(),/Confirm recovered/);
 click("od-cancel-clear");
 assert.ok(a.core.reportedOverdose());
 assert.doesNotMatch(a.core.overdoseRecoveryCard(),/Confirm that Torn shows/);
 click("od-confirm-clear");
 assert.ok(a.core.reportedOverdose(),"confirmation cannot bypass the first step");
 click("od-clear");
 click("od-confirm-clear");
 assert.equal(a.core.reportedOverdose(),null);
 assert.match(a.core.today(),/Is a Happy Jump worth it/);
});
test("Ecstasy report shows no fabricated 5,000 minute hospital estimate; stale bars are marked unknown",()=>{
 const a=boot();configure(a);a.core.noteOverdose("ecstasy");
 a.core.setUpdated(Date.now()-16*60000);
 const r=a.core.odRecoverySnapshot(a.core.reportedOverdose());
 assert.equal(r.referenceEnd,null);
 assert.equal(r.fresh,false);assert.equal(r.energy,null);
 assert.match(a.core.overdoseRecoveryCard(),/no Xanax-style 5,000-minute hospital effect/);
 assert.match(a.core.overdoseRecoveryCard(),/have not been freshly checked/);
});
test("actual overdose stage details appear only for confirmed hypothetical rate inputs",()=>{
 const a=boot();configure(a);
 assert.doesNotMatch(a.core.jumpValueCard(),/Show risk at each dose/);
 const c=a.core.getConfig();c.xanaxOdPct=2;c.ecstasyOdPct=5;
 assert.match(a.core.jumpValueCard(),/Show risk at each dose/);
 assert.match(a.core.jumpValueCard(),/First overdose/);
 assert.ok(a.core.jumpBreakEven().rows.every(x=>x.odJump.expectedFailurePurchase>=0));
});
