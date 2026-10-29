"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.2-preview.user.js");
function boot(){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","fixture-api-key");
 const store=new Map();
 function node(tag){return {tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",
  append(...v){this.children.push(...v)},appendChild(x){this.children.push(x)},
  addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},
  get id(){return this._id},set id(v){this._id=v}}}
 const body=node("body"),head=node("head");
 const document={body,head,createElement:node,addEventListener(){},
   getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}};
 const window={setInterval(){}};
 const injected=source.replace(/\}\)\(\);\s*$/,`window.__optimizer={simulate,optimizerResults,optimizerCard,getCompare:compare,getPlan:plan,getInput:loadInput,getState:()=>data,setState:v=>{data=v},setPrices:v=>{prices=v},setInventory:v=>{inv=v},getConfig:()=>cfg,getUi:()=>ui,getButton:()=>button,getMode:()=>sm,refreshPlan:()=>{lp=plans()},getSelected:()=>aPl()};})();`);
 assert.notEqual(injected,source);
 new Function("document","location","window","localStorage","PDA_httpGet",injected)(
   document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,
   async()=>({status:200,responseText:"{}"}));
 return {core:window.__optimizer,window,document,store};
}
function prepare(a,{budget=2000000,stock={},priceOverrides={}}={}){
 const stat=x=>({value:x});
 a.core.setState({
  stats:{battlestats:{strength:stat(2000000),speed:stat(1900000),defense:stat(1800000),dexterity:stat(1700000)}},
  gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Fixture Gym",energy_cost:25,modifiers:{strength:75,speed:70,defense:65,dexterity:60}}]},
  bars:{bars:{energy:{current:50,maximum:150,interval:600,increment:5},happy:{current:3500,maximum:3500}}},
  cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:false}},perks:{perks:{}}
 });
 a.core.setInventory(stock);
 a.core.setPrices({points:[{price:1000,amount:20000}],xanax:[{price:70000,amount:500}],...priceOverrides});
 const cfg=a.core.getConfig();cfg.stat="strength";cfg.budget=budget;cfg.refills=true;cfg.sleepEnabled=false;cfg.mode="training";
}
test("v0.12.2 parses in the TornPDA wrapper, keeps floating HJ and remains read-only",()=>{
 const text=fs.readFileSync(FILE,"utf8");
 assert.match(text,/@version\s+0\.12\.2/);
 assert.ok(text.length<100000);
 assert.doesNotMatch(text,/[“”‘’]/);
 assert.doesNotMatch(text,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();
 assert.equal(a.window.__TornHappyJumpLoaded,"0.12.2");
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
});
test("optimizer compares four matched seven-day scenarios and ranks maximum gains",()=>{
 const a=boot();prepare(a);
 const result=a.core.optimizerResults();
 assert.equal(result.scenarios.length,4);
 assert.ok(result.max);
 assert.equal(result.max.method,"xanax");
 assert.ok(result.max.gain>0);
 assert.ok(result.value.gain>=result.max.gain*.95);
 assert.ok(result.value.cost<=result.max.cost);
 assert.ok(result.frontier.every(x=>x.feasible));
 const natural=result.scenarios.find(x=>x.method==="natural"&&!x.refills);
 const refill=result.scenarios.find(x=>x.method==="natural"&&x.refills);
 assert.ok(refill.gain>=natural.gain);
 assert.equal(natural.refillsUsed,0);
 assert.ok(refill.refillsUsed>0);
 assert.match(a.core.optimizerCard(),/Seven-day training optimiser/);
});
test("manual scenario budget never exceeds limit, and no-refill variants ignore global toggle",()=>{
 const a=boot();prepare(a,{budget:0});
 const x=a.core.optimizerResults();
 assert.ok(x.max&&x.max.cost===0,"natural training remains possible at zero spend");
 assert.equal(x.max.refills,false);
 assert.equal(x.max.method,"natural");
 assert.ok(x.scenarios.every(v=>!v.feasible||v.cost<=0));
 const p=a.core.getInput();
 const forecast=a.core.simulate("natural",p,168,{budget:0,refills:false});
 assert.equal(forecast.count.points,0);
 assert.equal(forecast.cost,0);
});
test("an unpriced Xanax or points refill must not be a recommended paid scenario",()=>{
 const a=boot();prepare(a,{priceOverrides:{xanax:[],points:[]}});
 const r=a.core.optimizerResults();
 assert.ok(r.max);
 assert.equal(r.max.method,"natural");
 assert.equal(r.max.refills,false);
 assert.equal(r.scenarios.filter(x=>x.feasible).length,1);
 assert.match(r.scenarios.find(x=>x.method==="xanax").reason,/No affordable Xanax/);
 assert.match(r.scenarios.find(x=>x.method==="natural"&&x.refills).reason,/No affordable refill/);
});
test("owned items incur no purchase cost and do not result in double-counting",()=>{
 const a=boot();prepare(a,{budget:0,stock:{points:500,xanax:50}});
 const r=a.core.optimizerResults();
 assert.ok(r.scenarios.some(x=>x.feasible&&x.method==="xanax"&&x.drugs>0));
 assert.ok(r.scenarios.some(x=>x.feasible&&x.refills&&x.refillsUsed>0));
 assert.ok(r.scenarios.every(x=>x.cost===0));
 assert.match(a.core.optimizerCard(),/Owned consumables count as zero additional purchase cost/);
});
test("only a verified feasible optimizer choice updates schedule and settings",()=>{
 const a=boot();prepare(a,{priceOverrides:{xanax:[],points:[]}});
 const choose=(value)=>a.core.getUi().onclick({target:{closest:()=>({dataset:{act:"optimizer-choose",val:value}})}});
 choose("xanax:1");
 assert.equal(a.core.getMode(),"auto","blocked scenario cannot be selected");
 choose("natural:0");
 assert.equal(a.core.getMode(),"natural");
 assert.equal(a.core.getConfig().refills,false);
 assert.equal(a.core.getConfig().mode,"training");
 assert.equal(a.core.getSelected().method,"natural");
 assert.match(a.store.get("hhj-compact-v1:settings"),/"refills":false/);
});
test("comparison shows cost and gain trade-off, and does not mix Happy jumps into weekly regular ranking",()=>{
 const a=boot();prepare(a);
 const html=a.core.getCompare();
 assert.match(html,/Seven-day training optimiser/);
 assert.match(html,/Maximum stat gains/);
 assert.match(html,/within 95% of maximum gains/);
 assert.match(html,/Use this schedule/);
 const rows=a.core.optimizerResults().scenarios;
 assert.equal(rows.length,4);
 assert.ok(rows.every(x=>x.method==="natural"||x.method==="xanax"));
 assert.ok(rows.every(x=>x.refillsUsed===0||x.refills));
});
