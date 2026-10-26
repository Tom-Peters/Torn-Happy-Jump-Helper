"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const path=require("node:path");
const SCRIPT=path.join(__dirname,"..","Torn-Happy-Jump-Helper-Advanced.user.js");

test("advanced preview boots under Torn CSP with real full features and no auto API requests",()=>{
  const source=fs.readFileSync(SCRIPT,"utf8");
  assert.match(source,/@name\s+Torn Happy Jump Helper Advanced Preview/);
  assert.match(source,/@version\s+0\.8\.0/);
  assert.ok(source.includes("###PDA-APIKEY###"));
  assert.ok(!/\bnew\s+Function\s*\(|\beval\s*\(/.test(source));
  const mounted=new Map();
  function element(tag){
    return {tag,id:"",style:{},dataset:{},children:[],innerHTML:"",textContent:"",
      append(...xs){for(const x of xs)this.appendChild(x);},
      appendChild(x){this.children.push(x);if(x.id)mounted.set(x.id,x);return x;},
      setAttribute(){},
      addEventListener(k,fn){this["on"+k]=fn;},
      querySelector(){return element("button");},querySelectorAll(){return [];},
      getClientRects(){return [{width:1}]}
    };
  }
  const body=element("body"),head=element("head"),root=element("html");
  const document={body,head,documentElement:root,createElement:element,
    getElementById(id){return mounted.get(id)||null;},
    addEventListener(){}};
  let requests=0;
  const browser={document,location:{hostname:"www.torn.com",pathname:"/index.php"},
    window:{setInterval(){},setTimeout(){},addEventListener(){}},
    localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
    PDA_httpGet(){requests++;throw Error("No HTTP should run on startup")}
  };
  const ctx=vm.createContext(browser,{codeGeneration:{strings:false,wasm:false}});
  vm.runInContext(source,ctx,{timeout:6000});
  assert.equal(requests,0);
  const launcher=mounted.get("hhj-launch");
  const panel=mounted.get("hhj-panel");
  assert.ok(launcher,"advanced HJ floating button must mount");
  assert.ok(panel,"advanced dashboard panel must mount");
  assert.equal(browser.window.__TornHappyJumpStage.phase,"mounted");
  assert.equal(browser.window.__TornHappyJumpLoaded,"0.8.0");
  assert.equal(typeof launcher.onclick,"function");
  launcher.onclick();
  assert.equal(panel.style.display,"flex");
  assert.match(panel.innerHTML,/Compare/);
  assert.match(panel.innerHTML,/Perks/);
  assert.match(panel.innerHTML,/Progress/);
  assert.equal(requests,0,"Opening an empty panel should not send background API requests");
});
