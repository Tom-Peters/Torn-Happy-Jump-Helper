"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),
path=require("node:path"),vm=require("node:vm");
const SOURCE=path.join(__dirname,"..","Torn-Happy-Jump-Advanced-Companion.user.js");
function setup(){
 let requests=[];
 const map=new Map(),storage=new Map();
 const createElement=tag=>({
   tag,id:"",style:{},dataset:{},children:[],textContent:"",innerHTML:"",
   appendChild(x){this.children.push(x);if(x.id)map.set(x.id,x);return x;},
   append(...xs){xs.forEach(x=>this.appendChild(x));},
   addEventListener(k,fn){this["on"+k]=fn;},
   get firstElementChild(){return this.children[0]||null;},
   querySelector(){return null;}
 });
 const head=createElement("head"),body=createElement("body");
 const compact=createElement("section");compact.id="hhj-compact-panel";
 compact.appendChild(createElement("header"));body.appendChild(compact);
 const document={body,head,createElement,getElementById(id){return map.get(id)||null;},addEventListener(){}};
 const localStorage={getItem(k){return storage.get(k)??null;},
   setItem(k,v){storage.set(k,String(v));},removeItem(k){storage.delete(k)}};
 storage.set("hhj-compact-v1:gyms",JSON.stringify({"2":"buy","3":"locked","4":"owned"}));
 const fixture={
  "/user/battlestats":{battlestats:{strength:{value:1200000},speed:{value:2000000},defense:{value:1100000},dexterity:{value:1000000}}},
  "/user/bars":{bars:{energy:{maximum:150,current:95},happy:{maximum:3500,current:3500}}},
  "/user/gym":{gym:{id:1,name:"Current gym"}},
  "/torn/gyms":{gyms:[
   {id:1,name:"Current gym",modifiers:{speed:60},energy_cost:10,cost:100},
   {id:2,name:"Better gym",modifiers:{speed:80},energy_cost:10,cost:100000},
   {id:3,name:"Locked gym",modifiers:{speed:100},energy_cost:10,cost:20000},
   {id:4,name:"Elites",modifiers:{speed:95},energy_cost:10,cost:200000}
  ]},
  "/user/perks":{perks:{faction:["10% increase to speed gym gains"],
   merit:["+25% effective battle speed"],stock:["+5% bank interest"]}},
  "/user/refills":{refills:{energy:true}},
  "/user/travel":{travel:{destination:"Torn"}},
  "/user/inventory?cat=Book&limit=250":{inventory:{items:[
    {id:745,name:"Time Is In The Mind",amount:1,faction_owned:false}]}}
 };
 const browser={
  document,window:{setInterval(){},__HHJAdvancedCompanion:null},
  location:{hostname:"www.torn.com"},localStorage,
  PDA_httpGet:async(url,headers)=>{
   requests.push(url);assert.ok(url.startsWith("https://api.torn.com/v2/"));
   assert.equal(headers.Authorization,"ApiKey fixture-key");
   const key=url.slice("https://api.torn.com/v2".length);
   return {status:200,responseText:JSON.stringify(fixture[key]||{error:{code:21}})};
  }
 };
 const source=fs.readFileSync(SOURCE,"utf8").replace("###PDA-APIKEY###","fixture-key")
  .replace(/\}\)\(\);\s*$/, "window.__HHJCompanionTest={refresh,mod,stats,auditGym,books,perks};})();");
 const sandbox=vm.createContext(browser,{codeGeneration:{strings:false,wasm:false}});
 vm.runInContext(source,sandbox,{timeout:4000});
 return {browser,document,map,requests,compact,sandbox,api:browser.window.__HHJCompanionTest};
}
test("Companion is compact, CSP safe, and never changes stable HJ userscript",()=>{
 const s=fs.readFileSync(SOURCE,"utf8");
 assert.ok(s.length<23000,"Keep companion below working compact HJ size");
 assert.match(s,/@run-at\s+document-end/);
 assert.match(s,/@name\s+Torn Happy Jump Advanced Companion/);
 assert.match(s,/@author\s+IamEEKY/);
 assert.ok(!/\bnew\s+Function\s*\(|\beval\s*\(|\bimport\s*\(/.test(s));
 assert.ok(!/PDA_http(?:Post|Put|Patch|Delete)/.test(s));
});
test("Advanced entry appears in stable panel without HTTP at boot",()=>{
 const p=setup();
 assert.equal(p.requests.length,0);
 assert.ok(p.document.getElementById("hhj-advanced-companion-open"));
 assert.equal(p.browser.window.__HHJAdvancedCompanion,"0.9.0");
 assert.ok(p.document.getElementById("hhj-compact-panel"));
 const btn=p.document.getElementById("hhj-advanced-companion-open");
 btn.onclick();
 assert.equal(p.document.getElementById("hhj-advanced-companion").style.display,"block");
 assert.match(p.document.getElementById("hhj-advanced-companion").children[1].innerHTML,/Gyms/);
 assert.equal(p.requests.length,0);
});
test("Manual Refresh loads relevant perks, books and gym proof only",async()=>{
 const p=setup();await p.api.refresh();
 assert.equal(p.requests.length,8);
 assert.equal(p.api.stats().speed,2000000);
 const perks=p.api.perks();
 assert.match(perks,/gym gains/);
 assert.ok(!perks.includes("effective battle speed"));
 assert.ok(!perks.includes("bank interest"));
 const gym=p.api.auditGym();
 assert.equal(gym.length,1);
 assert.equal(gym[0].gym.name,"Better gym");
 assert.ok(gym[0].change>0);
 assert.match(p.api.books(),/200,000,000 speed/);
 assert.match(p.api.books(),/unread\/usable status/i);
});
