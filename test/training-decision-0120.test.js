"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.0-preview.user.js");
function boot(){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","mock-api-key");
 const store=new Map();
 function node(tag){return {tag,id:"",style:{},children:[],dataset:{},innerHTML:"",textContent:"",
  append(...items){this.children.push(...items)},appendChild(x){this.children.push(x)},addEventListener(k,fn){this["on"+k]=fn},setAttribute(){}}}
 const body=node("body"),head=node("head");
 const document={body,head,createElement:node,addEventListener(){},
  getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}};
 const window={setInterval(){}};
 const injection=source.replace(/\}\)\(\);\s*$/,`window.__test={nextDecision,nextDecisionCard,bookAssessment,educationOpportunities,enhancerRows,today,getData:()=>data,setData:v=>{data=v},getConfig:()=>cfg,getButton:()=>button,opened:()=>opened,setPlan:v=>{lp=v},setCurrent:v=>{updated=v}};})();`);
 assert.notEqual(injection,source,"test must attach to the userscript closure");
 new Function("document","location","window","localStorage","PDA_httpGet",injection)(
  document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,async()=>({status:200,responseText:"{}"}));
 return {api:window.__test,window,document};
}
function state(stat=200000000){
 const v=x=>({value:x});
 return {
  stats:{battlestats:{strength:v(stat),speed:v(2000000),defense:v(1800000),dexterity:v(1900000)}},
  gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Training Gym",energy_cost:25,modifiers:{strength:75,speed:60,defense:50,dexterity:40}}]},
  bars:{bars:{energy:{current:150,maximum:150,interval:600,increment:5},happy:{current:3500,maximum:3500}}},
  cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:true}},
  perks:{perks:{book_perks:[]}},books:[{id:744,amount:1,usable:true}]
 };
}
function ready(a,data=state()){a.setData(data);a.setCurrent(Date.now());a.getConfig().stat="strength";a.getConfig().mode="training";a.getConfig().sleepEnabled=false;a.setPlan([])}
test("v0.12 userscript boots in the TornPDA injection wrapper and keeps the HJ button",()=>{
 const s=fs.readFileSync(FILE,"utf8");
 assert.match(s,/@version\s+0\.12\.0/);
 assert.ok(s.length<85000,"keep preview compact enough for TornPDA");
 assert.doesNotMatch(s,/[“”‘’]/);
 assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 const a=boot();
 assert.equal(a.window.__TornHappyJumpLoaded,"0.12.0");
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
 assert.equal(a.api.getConfig().sleepStart,"23:00");
});
test("a scheduled Xanax due soon always outranks an owned book and available course",()=>{
 const a=boot();ready(a.api);
 const now=Date.now()/1000;
 a.api.setPlan([{method:"natural",events:[{kind:"XANAX",t:now+90,detail:"Take Xanax manually"}],affordable:true,gain:100}]);
 const x=a.api.nextDecision();
 assert.equal(x.kind,"due");assert.match(x.title,/Xanax/);
 assert.match(a.api.today(),/Best next action/);
 assert.doesNotMatch(a.api.today(),/Biggest training improvement/);
});
test("only verified usable owned threshold book with known inactive book-perks can be a review action",()=>{
 const a=boot();ready(a.api);
 assert.equal(a.api.nextDecision().kind,"book");
 assert.match(a.api.nextDecision().title,/Brawn Over Brains/);
 ready(a.api,state(199999999));
 assert.notEqual(a.api.nextDecision().kind,"book","never suggest pre-threshold use");
 const unknown=state();unknown.books=[{id:744,amount:1}];ready(a.api,unknown);
 assert.notEqual(a.api.nextDecision().kind,"book","unknown usability is not permission to consume");
 const absent=state();absent.books=[];ready(a.api,absent);
 assert.notEqual(a.api.nextDecision().kind,"book","unowned books are not actions");
 const unknownPerks=state();delete unknownPerks.perks;ready(a.api,unknownPerks);
 assert.notEqual(a.api.nextDecision().kind,"book","unknown active book state blocks recommendation");
 const active=state();active.perks.perks.book_perks=["Some active book"];ready(a.api,active);
 assert.notEqual(a.api.nextDecision().kind,"book","active book blocks concurrent use");
});
test("stale full-state snapshot cannot produce an actionable book or drug recommendation",()=>{
 const a=boot();ready(a.api);
 a.api.setCurrent(Date.now()-16*60000);
 assert.equal(a.api.nextDecision().kind,"stale");
 assert.match(a.api.today(),/Refresh before taking an action/);
});
test("enhancer quotes expire after fifteen minutes rather than appearing as live market prices",()=>{
 const a=boot(),s=state();s.enhancerOffers={strength:[{price:430000000,amount:1}]};s.priceUpdated=Date.now();ready(a.api,s);
 assert.equal(a.api.enhancerRows().find(x=>x.stat==="strength").price,430000000);
 s.priceUpdated=Date.now()-16*60000;
 assert.equal(a.api.enhancerRows().find(x=>x.stat==="strength").price,null);
 assert.match(a.api.today(),/Best next action/);
});
test("available education is recommended only when no imminent training action exists",()=>{
 const a=boot(),s=state(1250000);s.books=[];s.education={education_completed:[100],education_current:0};
 s.educationCatalog={education:{"100":{code:"SPT1430",name:"Intro",prerequisites:[]},"101":{code:"SPT2440",name:"Strength Course",prerequisites:[100]}}};
 ready(a.api,s);
 assert.equal(a.api.nextDecision().kind,"education");
 assert.match(a.api.nextDecision().title,/Strength Course/);
 a.api.setPlan([{method:"natural",affordable:true,gain:10,events:[{kind:"TRAIN",t:Date.now()/1000+120,detail:"Train manually"}]}]);
 assert.equal(a.api.nextDecision().kind,"due");
});
