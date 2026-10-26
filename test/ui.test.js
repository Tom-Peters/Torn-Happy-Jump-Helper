"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

// Fixture contains invented stats, generic item-market prices and no real API keys.
function createNode(tag){
  return {
    tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",
    setAttribute(){},
    append(...items){this.children.push(...items);},
    appendChild(item){this.children.push(item);},
    addEventListener(name,callback){this["on"+name]=callback;},
    querySelector(selector){return this.cache?.[selector]||null;},
    querySelectorAll(selector){return this.lists?.[selector]||[];}
  };
}
function setup(gymPage=false){
  const body=createNode("body"), root=createNode("html");
  const document={body,documentElement:root,createElement:createNode,getElementById:()=>null};
  const tabs=["today","compare","steps","gyms","bonuses","settings"].map(name=>({dataset:{tab:name},onclick:null}));
  const modes=["training","happyjump"].map(mode=>({dataset:{mode},onclick:null}));
  const hours=[24,168].map(h=>({dataset:{hours:String(h)},onclick:null}));
  const requests=[];
  const fixture={
    "/user/bars":{bars:{energy:{current:150,maximum:150,interval:120,increment:1},happy:{current:5000,maximum:5000}}},
    "/user/cooldowns":{cooldowns:{drug:0,booster:0}},
    "/user/battlestats":{battlestats:{strength:{value:1000},speed:{value:2000},defense:{value:1500},dexterity:{value:500}}},
    "/user/gym":{gym:{id:9,name:"Example gym"}},
    "/torn/gyms":{gyms:[
      {id:9,name:"Example gym",cost:100,energy_cost:10,modifiers:{strength:50,speed:50,defense:50,dexterity:50}},
      {id:10,name:"Better gym",cost:50000,energy_cost:10,modifiers:{strength:75,speed:75,defense:75,dexterity:75}}
    ]},
    "/user/perks":{perks:{merit:["+25% effective battle strength"],stock:["+10% bank interest"],job:["+5% gym gains","Reduce booster cooldown by 10%"]}},
    "/user/refills":{refills:{energy:true}},
    "/user/travel":{travel:{destination:"United Kingdom",time_left:0}},
    "/market/pointsmarket":{pointsmarket:[{cost:25000,quantity:10000}]}
  };
  for(const id of [310,35,36,366,206,197])
    fixture["/market/"+id+"/itemmarket?limit=100"]={itemmarket:{cache_timestamp:Math.round(Date.now()/1000),listings:[{price:1000,amount:100000}]}};
  const PDA_httpGet=async(url,headers)=>{
    requests.push({url,headers});
    assert.ok(url.startsWith("https://api.torn.com/v2/"),"Only official Torn API may be queried");
    assert.ok(!url.includes("test-placeholder-key"),"API key must not appear in URL");
    assert.equal(headers.Authorization,"ApiKey test-placeholder-key");
    const endpoint=url.replace("https://api.torn.com/v2","");
    return {status:200,responseText:JSON.stringify(endpoint.startsWith("/user/inventory")?{error:{code:21}}:(fixture[endpoint]||{error:{code:4}}))};
  };
  const source=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8")
    .replace("###PDA-APIKEY###","test-placeholder-key");
  new Function("document","location","window","localStorage","PDA_httpGet",source)(
    document,{hostname:"www.torn.com",pathname:gymPage?"/gym.php":"/index.php"},{setInterval(){}},{getItem(){return null;},setItem(){}},PDA_httpGet);
  const launcher=body.children.find(x=>x.id==="hhj-launch");
  const panel=body.children.find(x=>x.id==="hhj-panel");
  const refresh={onclick:null,disabled:false};
  const close={onclick:null};
  const manualGym={value:"10"},manualStatus={value:"buy"},manualConfirm={onclick:null};
  panel.cache={"#hhj-refresh":refresh,"#hhj-close":close,"#hhj-timer":{textContent:""},
    "#hhj-manual-gym":manualGym,"#hhj-manual-status":manualStatus,
    "#hhj-manual-confirm":manualConfirm};
  panel.lists={"#hhj-refresh":[refresh],"[data-tab]":tabs,"[data-field]":[],
    "[data-plan]":[],"[data-goal]":[],"[data-step]":[],"[data-mode]":modes,"[data-hours]":hours};
  return {launcher,panel,refresh,tabs,modes,hours,manualConfirm,requests};
}
test("TornPDA script opens with readable six-tab panel",()=>{
  const app=setup();
  app.launcher.onclick();
  assert.match(app.panel.innerHTML,/Today/);
  assert.match(app.panel.innerHTML,/Compare/);
  assert.match(app.panel.innerHTML,/Plan/);
  assert.match(app.panel.innerHTML,/Settings/);
  assert.match(app.panel.innerHTML,/Perks/);
  assert.match(app.panel.innerHTML,/Gyms/);
  assert.match(app.panel.innerHTML,/Training schedule/);
  assert.match(app.panel.innerHTML,/Happy-jump schedule/);
  assert.match(app.panel.innerHTML,/Refresh Torn data/);
  assert.equal(app.panel.dataset.theme,"dark");
  assert.equal(typeof app.refresh.onclick,"function");
});
test("API error 21 degrades inventory while stats, market, travel and tabs still work",async()=>{
  const app=setup();
  app.launcher.onclick();
  await app.refresh.onclick();
  assert.match(app.panel.innerHTML,/Inventory optional/);
  assert.match(app.panel.innerHTML,/error 21/);
  assert.match(app.panel.innerHTML,/Travel detected/);
  assert.match(app.panel.innerHTML,/United Kingdom/);
  assert.match(app.panel.innerHTML,/500/); // Invented weakest stat fixture.
  assert.match(app.panel.innerHTML,/Your next training decision/);
  assert.ok(app.requests.some(x=>x.url.includes("inventory?cat=Drug&limit=250")));
  app.tabs.find(x=>x.dataset.tab==="compare").onclick();
  assert.match(app.panel.innerHTML,/Compare training methods/);
  app.tabs.find(x=>x.dataset.tab==="settings").onclick();
  assert.match(app.panel.innerHTML,/High contrast dark/);
  app.tabs.find(x=>x.dataset.tab==="steps").onclick();
  assert.match(app.panel.innerHTML,/Next 24 hours/);
  assert.match(app.panel.innerHTML,/Full 7 days/);
  app.tabs.find(x=>x.dataset.tab==="gyms").onclick();
  assert.match(app.panel.innerHTML,/Capture visible gyms/);
  app.tabs.find(x=>x.dataset.tab==="bonuses").onclick();
  assert.match(app.panel.innerHTML,/Training-related perks/);
  assert.match(app.panel.innerHTML,/Book inventory unavailable/);
  app.tabs.find(x=>x.dataset.tab==="settings").onclick();
  assert.match(app.panel.innerHTML,/Compare both choices/);
  assert.match(app.panel.innerHTML,/Regular training \(no jumps\)/);
  assert.ok(app.requests.every(x=>x.url.startsWith("https://api.torn.com/v2/")));
});

test("schedule mode controls switch from regular training to jump-specific plans",async()=>{
  const app=setup();
  app.launcher.onclick();
  await app.refresh.onclick();
  app.tabs.find(x=>x.dataset.tab==="compare").onclick();
  assert.match(app.panel.innerHTML,/Regular Xanax training/);
  app.modes.find(x=>x.dataset.mode==="happyjump").onclick();
  assert.match(app.panel.innerHTML,/Candy micro|eDVD/);
  app.tabs.find(x=>x.dataset.tab==="steps").onclick();
  assert.match(app.panel.innerHTML,/Next 24 hours/);
  app.hours.find(x=>x.dataset.hours==="168").onclick();
  assert.match(app.panel.innerHTML,/Manual actions · 168 hours/);
  assert.ok(app.requests.every(x=>x.url.startsWith("https://api.torn.com/v2/")));
});
test("manual visible-gym confirmation recommends unpurchased better gym without changing Torn",async()=>{
  const app=setup(true);
  app.launcher.onclick();
  await app.refresh.onclick();
  app.tabs.find(x=>x.dataset.tab==="gyms").onclick();
  assert.equal(typeof app.manualConfirm.onclick,"function");
  app.manualConfirm.onclick();
  assert.match(app.panel.innerHTML,/Better gym/);
  assert.match(app.panel.innerHTML,/Buy manually in Torn/);
  assert.match(app.panel.innerHTML,/projected gain/);
  assert.ok(app.requests.every(x=>x.url.startsWith("https://api.torn.com/v2/")));
});
test("irrelevant merits and financial stock benefits do not appear in Perks screen",async()=>{
  const app=setup();
  app.launcher.onclick();
  await app.refresh.onclick();
  app.tabs.find(x=>x.dataset.tab==="bonuses").onclick();
  assert.match(app.panel.innerHTML,/gym gains/);
  assert.match(app.panel.innerHTML,/booster cooldown/);
  assert.ok(!app.panel.innerHTML.includes("effective battle strength"));
  assert.ok(!app.panel.innerHTML.includes("bank interest"));
  assert.match(app.panel.innerHTML,/Long-term battle-stat milestones/);
  assert.match(app.panel.innerHTML,/When to activate your books/);
});

test("launcher mounts after late TornPDA body creation and recovers after navigation",()=>{
  let domReady, heartbeat;
  let activeBody=null;
  const root=createNode("html");
  const document={
    body:null,documentElement:root,createElement:createNode,
    addEventListener(name,fn){if(name==="DOMContentLoaded")domReady=fn;},
    getElementById(id){return activeBody?.children.find(x=>x.id===id)||null;}
  };
  const source=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8")
    .replace("###PDA-APIKEY###","placeholder-key");
  new Function("document","location","window","localStorage",source)(
    document,{hostname:"www.torn.com",pathname:"/index.php"},
    {setInterval(fn){heartbeat=fn;}},{getItem(){return null;},setItem(){}});
  assert.equal(document.body,null);
  assert.equal(typeof domReady,"function");
  activeBody=createNode("body");
  document.body=activeBody;
  domReady();
  assert.ok(document.getElementById("hhj-launch"));
  assert.ok(document.getElementById("hhj-panel"));
  const launcher=document.getElementById("hhj-launch");
  const mountedChildren=activeBody.children.length;
  heartbeat();
  assert.equal(activeBody.children.length,mountedChildren);
  // Torn replaces the whole <body> node during navigation.
  activeBody=createNode("body");
  document.body=activeBody;
  heartbeat();
  assert.equal(document.getElementById("hhj-launch"),launcher);
  assert.ok(document.getElementById("hhj-panel"));
});
