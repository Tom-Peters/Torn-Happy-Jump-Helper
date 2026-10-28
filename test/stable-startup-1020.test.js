"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const target=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.20-compat.user.js");
const stable=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.16-compat.user.js");
function boot(){
 const raw=fs.readFileSync(target,"utf8").replace("###PDA-APIKEY###","fixture-key");
 function element(tag){return {tag,children:[],style:{},dataset:{},textContent:"",innerHTML:"",
  append(...a){this.children.push(...a)},appendChild(a){this.children.push(a)},
  addEventListener(k,v){this["on"+k]=v},setAttribute(){},
  get id(){return this._id},set id(x){this._id=x}};}
 const body=element("body"),head=element("head"),local=new Map();
 const document={body,head,createElement:element,addEventListener(){},getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const window={setInterval(){}},localStorage={getItem(k){return local.get(k)||null},setItem(k,v){local.set(k,String(v))}};
 const patched=raw.replace(/\}\)\(\);\s*$/, "window.__test20={aFl,wSe,readLog,setLogs:logs=>{al=logs},setFocus:k=>{cfg.stat=k},getCfg:()=>cfg};})();");
 assert.notEqual(patched,raw);
 new Function("document","window","localStorage","location","PDA_httpGet",patched)(document,window,localStorage,{hostname:"www.torn.com",pathname:"/gym.php"},async()=>({status:200,responseText:"{}"}));
 return {document,window,local,core:window.__test20};
}
test("retains exact phone-confirmed bootstrap declarations except version",()=>{
 const source=fs.readFileSync(target,"utf8"),baseline=fs.readFileSync(stable,"utf8");
 assert.ok(source.length<59000);
 const marker="const N=\"hhj-compact-v1\"";
 const ahead=s=>s.slice(s.indexOf(marker),s.indexOf("function today("));
 assert.equal(ahead(source),ahead(baseline),"startup, API and planning declarations before the changed Today UI must remain byte-identical");
 assert.match(source,/@version\s+0\.10\.20/);
 assert.match(source,/@run-at\s+document-end/);
 assert.match(source,/###PDA-APIKEY###/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("original launcher and panel mount with new version",()=>{
 const a=boot();assert.ok(a.document.getElementById("hhj-launch"));
 assert.ok(a.document.getElementById("hhj-compact-panel"));
 assert.equal(a.window.__TornHappyJumpLoaded,"0.10.20");
});
test("confirmed gym gain displays without manual confirmation buttons",()=>{
 const a=boot(),now=Math.floor(Date.now()/1000);
 a.core.setFocus("strength");
 a.core.setLogs([{id:"g1",t:now-180,stat:"strength",amount:3452,trains:2,energy:50}]);
 const html=a.core.aFl({method:"natural",events:[{kind:"TRAIN",t:now+1800,detail:"Train next"}]});
 assert.match(html,/3,452 strength/);assert.match(html,/2 trains/);
 assert.match(html,/Next recommendation/);
 for(const unwanted of ["I did it","Missed it","Not sure","Confirm TRAIN","Mark refill used","Clear manual mark"])
  assert.ok(!html.includes(unwanted),unwanted);
});
test("script contains no visible manual-completion controls",()=>{
 const text=fs.readFileSync(target,"utf8");
 for(const label of ['data-act="mark-used"','data-act="clear-refill"','data-act="note-done"','data-act="watch-done"','data-act="watch-missed"'])
  assert.ok(!text.includes(label),label);
});
