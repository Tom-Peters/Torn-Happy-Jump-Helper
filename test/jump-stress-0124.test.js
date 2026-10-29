"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.4-preview.user.js");
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
 const injected=source.replace(/\}\)\(\);\s*$/,"window.__test={jumpStress,jumpBreakEven,jumpValueCard,jumpValueBrief,jumpVerdictLabel,simulate,optimizerResults,nextDecision,compare,today,setData:v=>{data=v},setPrices:v=>{prices=v},setInventory:v=>{inv=v},getInput:loadInput,getConfig:()=>cfg,setUpdated:t=>{updated=t},setPlan:v=>{lp=v},setSelected:v=>{sm=v}};})();");
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
test("v0.12.4 boots on TornPDA with the HJ launcher and only read-only requests",()=>{
 const s=fs.readFileSync(FILE,"utf8");assert.match(s,/@version\s+0\.12\.3/);
 assert.ok(s.length<106000);assert.doesNotMatch(s,/[“”‘’]/);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();assert.equal(a.window.__TornHappyJumpLoaded,"0.12.4");
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
 assert.match(a.core.jumpValueCard(),/resale opportunity cost of owned items/);
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
 assert.equal(robust.downsideGain,70);
 assert.equal(robust.upsideGain,130);
 assert.equal(robust.stressedExtraCash,26);
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
