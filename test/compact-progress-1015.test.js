"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const SRC=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.15-compat.user.js");
function boot(){
 const source=fs.readFileSync(SRC,"utf8").replace("###PDA-APIKEY###","test-only-key");
 const store=new Map(),body=node("body"),head=node("head");
 function node(tag){return {tag,style:{},children:[],dataset:{},innerHTML:"",textContent:"",
  append(...x){this.children.push(...x)},appendChild(x){this.children.push(x)},
  addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},
  get id(){return this._id},set id(v){this._id=v}}}
 const document={body,head,createElement:node,addEventListener(){},
  getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const window={setInterval(){}},localStorage={getItem(k){return store.get(k)||null},
  setItem(k,v){store.set(k,String(v))}};
 const modified=source.replace(/\}\)\(\);\s*$/,"window.__probe={pLg,cgCard,gCh,readLog,getRecorded:()=>al};})();");
 assert.notEqual(source,modified);
 new Function("document","location","window","localStorage","PDA_httpGet",modified)(
  document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,
  async()=>({status:200,responseText:"{}"}));
 return {window,document,probe:window.__probe,store};
}
test("phone-compatible v0.10.15 mounts with the original launcher and remains compact",()=>{
 const source=fs.readFileSync(SRC,"utf8"),a=boot();
 assert.ok(source.length<60000);
 assert.match(source,/@version\s+0\.10\.15/);
 assert.match(source,/@run-at\s+document-end/);
 assert.ok(a.document.getElementById("hhj-launch"));
 assert.equal(a.window.__TornHappyJumpLoaded,"0.10.15");
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("old API snapshot totals are kept inside optional advanced details",()=>{
 const a=boot(),html=a.probe.pLg();
 assert.match(html,/<details><summary>Advanced · API snapshot history \(partial\)<\/summary>/);
 assert.match(html,/Observed stat gains · last seven days/);
 assert.match(html,/may miss actions and overlap with gym logs/);
 assert.match(html,/Clear rolling history/);
 assert.match(html,/verified gym gains/);
 assert.ok(html.indexOf("verified gym gains")<html.indexOf("Advanced · API snapshot history"));
});
test("gym log diagnostic numbers are accessible but no longer fill the main progress card",()=>{
 const a=boot(),html=a.probe.cgCard();
 assert.match(html,/<details><summary>Scan diagnostics<\/summary>/);
 assert.match(html,/Scan logs/);
 assert.match(html,/No verified gym entries yet/);
});
test("restoring the old script remains possible without changing shared local storage keys",()=>{
 const source=fs.readFileSync(SRC,"utf8");
 assert.match(source,/hhj-compact-v1/);
 assert.match(source,/gym-api-logs/);
 assert.match(source,/gym-log-checked-13/);
 assert.doesNotMatch(source,/localStorage\.clear\(/);
});
