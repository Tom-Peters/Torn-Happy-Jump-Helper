"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.10-compat.user.js");
function boot(){
  const raw=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","test-only-placeholder");
  const map=new Map(),body=node("body"),head=node("head");
  function node(tag){return {tag,style:{},children:[],dataset:{},textContent:"",innerHTML:"",
    append(...xs){this.children.push(...xs);},appendChild(x){this.children.push(x);},
    addEventListener(k,fn){this["on"+k]=fn;},setAttribute(){},
    querySelector(){return null;},
    get id(){return this._id;},set id(x){this._id=x;}};}
  const document={body,head,createElement:node,addEventListener(){},
    getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null;}};
  const window={setInterval(){}};
  const localStorage={getItem(k){return map.get(k)||null;},setItem(k,v){map.set(k,String(v));}};
  const injected=raw.replace(/\}\)\(\);\s*$/,"window.__HJ1010={importCopiedLog,progressLog,checkpoint,getCopied:()=>cl,getLedger:()=>ledger};})();");
  assert.notEqual(injected,raw);
  new Function("document","window","location","localStorage","PDA_httpGet",injected)(
    document,window,{hostname:"www.torn.com",pathname:"/gym.php"},localStorage,async()=>({status:200,responseText:"{}"}));
  return {document,window,map,core:window.__HJ1010};
}
const training="You used 10 energy and 5 happiness training your speed 1 times in a gym, increasing it by 10,000 to 2,003,873.";
test("compact recovery version retains a small standalone phone-compatible launcher",()=>{
  const s=fs.readFileSync(FILE,"utf8");
  assert.ok(s.length<60000,"the compatibility build must remain below 60 KB");
  assert.match(s,/@version\s+0\.10\.10/);
  assert.match(s,/@run-at\s+document-end/);
  assert.match(s,/###PDA-APIKEY###/);
  assert.doesNotMatch(s,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
  const a=boot();
  assert.ok(a.document.getElementById("hhj-launch"));
  assert.ok(a.document.getElementById("hhj-compact-panel"));
  assert.equal(a.window.__TornHappyJumpLoaded,"0.10.10");
});
test("a missed +10000 gym gain can be imported from a copied gym result",()=>{
  const a=boot();
  assert.equal(a.core.importCopiedLog(training),1);
  assert.equal(a.core.getCopied()[0].amount,10000);
  assert.equal(a.core.getCopied()[0].after,2003873);
  assert.equal(a.core.getCopied()[0].stat,"speed");
  assert.equal(a.core.getLedger().length,0,"import must not fabricate API snapshot gains");
  assert.match(a.core.progressLog(),/10,000/);
});
test("repeated or overlapping log imports do not duplicate results",()=>{
  const a=boot();
  assert.equal(a.core.importCopiedLog(training+"\n"+training),1);
  assert.equal(a.core.importCopiedLog(training),0);
  assert.equal(a.core.getCopied().length,1);
  assert.equal(a.core.getLedger().length,0);
});
test("bad pasted data is ignored and never counted as a gym result",()=>{
  const a=boot();
  assert.equal(a.core.importCopiedLog("You used 10 energy training your speed, increasing it by NOPE to 2,003,873."),0);
  assert.equal(a.core.importCopiedLog("You used 0 energy training your speed, increasing it by 10,000 to 2,003,873."),0);
  assert.equal(a.core.getCopied().length,0);
});
test("imported results persist with the existing local storage namespace",()=>{
  const a=boot();
  a.core.importCopiedLog(training);
  const saved=JSON.parse(a.map.get("hhj-compact-v1:copied-gym-logs"));
  assert.equal(saved.length,1);
  assert.equal(saved[0].amount,10000);
  assert.match(a.core.progressLog(),/not verified|separately/i);
});
