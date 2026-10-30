// Focused v0.12.7 behavior tests. Prior v0.12.6 tests run separately.
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
 const injected=source.replace(/\}\)\(\);\s*$/,"window.__test={reportedOverdose,noteOverdose,clearOverdose,overdoseRecoveryCard,badge,drugOdOdds,overdoseStageCost,overdoseStageCard,odRecoverySnapshot,overdoseForecast,jumpSuccessAssumption,jumpRiskAssessment,replacementCost,settings,jumpStress,jumpBreakEven,jumpValueCard,jumpValueBrief,jumpVerdictLabel,simulate,optimizerResults,nextDecision,compare,today,plan,setData:v=>{data=v},setPrices:v=>{prices=v},setInventory:v=>{inv=v},getInput:loadInput,getConfig:()=>cfg,setUpdated:t=>{updated=t},setPlan:v=>{lp=v},setSelected:v=>{sm=v}};})();");
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
 assert.match(a.core.jumpValueCard(),/first overdose|FIRST overdose|First OD here/i);
 assert.ok(a.core.jumpBreakEven().rows.every(x=>x.odJump.expectedFailurePurchase>=0));
});

test("an overdose hold remains visible without gym data and hides due actions and stale progress forecasts",()=>{
 const empty=boot();
 empty.core.noteOverdose("xanax");
 assert.match(empty.core.today(),/Overdose recovery hold/);
 assert.match(empty.core.today(),/Live data unavailable/);
 const a=boot();configure(a);
 a.core.noteOverdose("xanax");
 const html=a.core.today();
 assert.match(html,/Forecast suspended/);
 assert.match(html,/Paused/);
 assert.doesNotMatch(html,/Verified activity → Next action/);
 assert.doesNotMatch(html,/Next 7 days:/);
 assert.doesNotMatch(html,/Energy, point refill and overnight waste/);
 assert.match(a.core.plan(),/Schedule paused/);
});
