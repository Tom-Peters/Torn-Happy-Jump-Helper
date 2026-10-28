"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const TARGET=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.9-compat.user.js");
const BACKUP=path.join(__dirname,"..","archive","Torn-Happy-Jump-Helper-v0.10.4-screenshot-confirmed.user.js");
function boot({time="2026-10-28T00:20:00Z",rolling=null,awakeUntil=null}={}){
  const raw=fs.readFileSync(TARGET,"utf8").replace("###PDA-APIKEY###","test-fixture-key");
  const map=new Map();
  if(rolling)map.set("hhj-compact-v1:rolling-plan",JSON.stringify(rolling));
  if(awakeUntil!==null)map.set("hhj-compact-v1:awake-until",JSON.stringify(awakeUntil));
  const localStorage={getItem(k){return map.has(k)?map.get(k):null;},setItem(k,v){map.set(k,String(v));}};
  function node(tag){return {tag,style:{},children:[],dataset:{},textContent:"",innerHTML:"",
    append(...items){this.children.push(...items);},appendChild(x){this.children.push(x);},
    addEventListener(event,fn){this["on"+event]=fn;},setAttribute(){},
    get id(){return this._id;},set id(value){this._id=value;}};}
  const body=node("body"),head=node("head");
  const document={body,head,createElement:node,addEventListener(){},
    getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null;}};
  const window={setInterval(){},__TornHappyJumpLoaded:null};
  let now=Date.parse(time);
  const Clock=class extends Date {static now(){return now}};
  const injected=raw.replace(/\}\)\(\);\s*$/, "window.__HJCOMPAT_TEST={checkpoint,sleeping,refillStatus,getRolling:()=>rolling,getLedger:()=>ledger};})();");
  assert.notEqual(injected,raw,"Test instrumentation must attach to the userscript");
  new Function("document","window","location","localStorage","Date","PDA_httpGet",injected)(
    document,window,{hostname:"www.torn.com",pathname:"/gym.php"},localStorage,Clock,async()=>({status:200,responseText:"{}"}));
  return {document,window,map,core:window.__HJCOMPAT_TEST,now:()=>now,advance(ms){now+=ms;}};
}
test("compat stays close to the known-working phone script and preserves the API placeholder",()=>{
  const src=fs.readFileSync(TARGET,"utf8"),backup=fs.readFileSync(BACKUP,"utf8");
  assert.ok(src.length<60000,"Compatibility release must remain below 60 KB");
  assert.ok(src.length<backup.length+500,"No large risky injection expansion");
  assert.match(src,/@version\s+0\.10\.9/);
  assert.match(src,/@run-at\s+document-end/);
  assert.match(src,/###PDA-APIKEY###/);
  assert.doesNotMatch(src,/\b(?:eval|new Function)\s*\(/);
  assert.doesNotMatch(src,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("compat launcher mounts in the same way as the working v0.10.4",()=>{
  const a=boot();
  assert.ok(a.document.getElementById("hhj-launch"));
  assert.ok(a.document.getElementById("hhj-compact-panel"));
  assert.equal(a.window.__TornHappyJumpLoaded,"0.10.9");
});
test("quick positive gym gain is stored even within 30 seconds",()=>{
  const t=Date.parse("2026-10-28T00:20:00Z")/1000;
  const stats={speed:2000000,strength:1350000,defense:1180000,dexterity:1000000};
  const a=boot({rolling:{t:t-10,s:stats,stat:"speed",method:"natural",events:[]}});
  assert.equal(a.core.checkpoint({...stats,speed:2010000}),true);
  assert.equal(a.core.getLedger().length,1);
  assert.equal(a.core.getLedger()[0].observed.speed,10000);
});
test("identical fast API reads preserve the checkpoint until a real gain arrives",()=>{
  const t=Date.parse("2026-10-28T00:20:00Z")/1000;
  const stats={speed:2000000,strength:1350000,defense:1180000,dexterity:1000000};
  const a=boot({rolling:{t:t-10,s:stats,stat:"speed",method:"natural",events:[]}});
  assert.equal(a.core.checkpoint(stats),false);
  assert.equal(a.core.getLedger().length,0);
  assert.equal(a.core.getRolling().t,t-10);
  a.advance(2000);
  assert.equal(a.core.checkpoint({...stats,speed:2010000}),true);
  assert.equal(a.core.getLedger()[0].observed.speed,10000);
});
test("staying awake can override bedtime for the next hour",()=>{
  const t=Date.parse("2026-10-28T00:20:00Z")/1000;
  const defaultCase=boot();
  assert.equal(defaultCase.core.sleeping(t),true);
  const awakeCase=boot({awakeUntil:t+3600});
  assert.equal(awakeCase.core.sleeping(t),false);
  assert.equal(awakeCase.core.sleeping(t+3900),true);
});
