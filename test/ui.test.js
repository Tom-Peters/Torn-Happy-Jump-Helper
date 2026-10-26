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
function setup(gymPage=false,inventoryMode="error"){
  const body=createNode("body"), root=createNode("html");
  const document={body,documentElement:root,createElement:createNode,getElementById:()=>null};
  const tabs=["today","compare","steps","gyms","bonuses","progress","settings"].map(name=>({dataset:{tab:name},onclick:null}));
  const modes=["training","happyjump"].map(mode=>({dataset:{mode},onclick:null}));
  const comparisons=["all","training","happyjump"].map(mode=>({dataset:{compareMode:mode},onclick:null}));
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
    let payload;
    if(endpoint.startsWith("/user/inventory")){
      const cat=decodeURIComponent(endpoint.match(/cat=([^&]+)/)?.[1]||"");
      if(inventoryMode==="partial"){
        if(cat==="Drug")payload={inventory:{items:[{id:206,name:"Xanax",amount:8,faction_owned:false}]},_metadata:{total:1}};
        else if(cat==="Book")payload={inventory:{items:[{id:744,name:"Brawn Over Brains",amount:1,faction_owned:false}]},_metadata:{total:1}};
        else if(cat==="Booster")payload={inventory:{items:[]},_metadata:{total:0}};
        else payload={error:{code:21}};
      } else payload={error:{code:21}};
    } else payload=fixture[endpoint]||{error:{code:4}};
    return {status:200,responseText:JSON.stringify(payload)};
  };
  const source=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.full.js"),"utf8")
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
    "[data-plan]":[],"[data-goal]":[],"[data-step]":[],"[data-mode]":modes,"[data-compare-mode]":comparisons,"[data-hours]":hours};
  return {launcher,panel,refresh,tabs,modes,comparisons,hours,manualConfirm,requests};
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
  assert.match(app.panel.innerHTML,/Progress/);
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
  assert.match(app.panel.innerHTML,/All methods/);
  app.comparisons.find(x=>x.dataset.compareMode==="training").onclick();
  assert.match(app.panel.innerHTML,/Regular Xanax training/);
  app.comparisons.find(x=>x.dataset.compareMode==="happyjump").onclick();
  assert.match(app.panel.innerHTML,/Candy micro|eDVD/);
  app.modes.find(x=>x.dataset.mode==="happyjump").onclick();
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
  const source=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.full.js"),"utf8")
    .replace("###PDA-APIKEY###","placeholder-key");
  let clock=Date.now();
  class FakeDate extends Date {static now(){return clock;}}
  new Function("document","location","window","localStorage","Date",source)(
    document,{hostname:"www.torn.com",pathname:"/index.php"},
    {setInterval(fn){heartbeat=fn;}},{getItem(){return null;},setItem(){}},FakeDate);
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
  clock+=6000;
  heartbeat();
  assert.equal(document.getElementById("hhj-launch"),launcher);
  assert.ok(document.getElementById("hhj-panel"));
});

test("Torn page global module.exports cannot suppress the HJ launcher",()=>{
  let handler;
  const document={
    body:createNode("body"),documentElement:createNode("html"),
    createElement:createNode,
    getElementById(){return null;},
    addEventListener(){}
  };
  const window={setInterval(fn){handler=fn;}};
  const foreignModule={exports:{otherScript:true}};
  const code=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.full.js"),"utf8")
    .replace("###PDA-APIKEY###","placeholder-key");
  new Function("document","window","location","localStorage","module",code)(
    document,window,{hostname:"www.torn.com",pathname:"/index.php"},
    {getItem(){return null;},setItem(){}},foreignModule);
  assert.ok(document.body.children.some(x=>x.id==="hhj-launch"),
    "HJ must appear even when Torn exposes module.exports");
  assert.ok(document.body.children.some(x=>x.id==="hhj-panel"));
  assert.equal(foreignModule.exports.otherScript,true);
  assert.ok(!foreignModule.exports.schedule,"foreign module should not be overwritten");
  assert.equal(window.__TornHappyJumpLoaded,"0.6.1");
  assert.equal(window.__TornHappyJumpStage.phase,"mounted");
});

test("tiny TornPDA launcher appears before it downloads the heavyweight engine",async()=>{
  const root=createNode("html"),body=createNode("body");
  const origAppend=body.appendChild.bind(body);
  body.appendChild=x=>{origAppend(x);x.remove=()=>{body.children=body.children.filter(y=>y!==x)};};
  body.append=(...xs)=>xs.forEach(x=>body.appendChild(x));
  const document={body,documentElement:root,createElement(tag){
    const x=createNode(tag);
    x.replaceChildren=(...xs)=>{x.children=xs;};
    return x;
  },getElementById(id){return body.children.find(x=>x.id===id)||null;},addEventListener(){}};
  const window={setInterval(){},__HHJLoader:null};
  const location={hostname:"www.torn.com"};
  const core=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.full.js"),"utf8");
  const installed=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8")
    .replace("###PDA-APIKEY###","example-test-key");
  assert.ok(installed.length<7000,"installable launcher must remain lightweight");
  let downloaded="",clicked=0;
  const PDA_httpGet=async url=>{
    downloaded=url;
    return {status:200,responseText:core};
  };
  function FakeFunction(source){
    assert.match(source,/sourceURL=Torn-Happy-Jump-Helper.full.js/);
    assert.ok(source.includes("example-test-key"),"TornPDA key substitution must reach fetched core");
    return ()=>{
      const real=document.createElement("button");
      real.id="hhj-launch";
      real.click=()=>{clicked++;};
      body.appendChild(real);
      window.__TornHappyJumpLoaded="0.6.1";
    };
  }
  new Function("document","window","location","PDA_httpGet","Function",installed)(
    document,window,location,PDA_httpGet,FakeFunction);
  const launch=document.getElementById("hhj-quick-launch");
  assert.ok(launch,"launcher must mount without API, engine or settings");
  assert.equal(downloaded,"");
  assert.equal(typeof launch.onclick,"function");
  await launch.onclick();
  assert.match(downloaded,/raw.githubusercontent.com\/Tom-Peters\/Torn-Happy-Jump-Helper/);
  assert.equal(clicked,1);
  assert.equal(window.__HHJLoader.status,"ready");
  assert.equal(document.getElementById("hhj-quick-launch"),null);
});
test("launcher remains visible and shows error when heavyweight engine fails to download",async()=>{
  const body=createNode("body"),document={
    body,documentElement:createNode("html"),createElement(tag){
      const x=createNode(tag);
      x.replaceChildren=()=>{x.children=[];};
      return x;
    },getElementById(id){return body.children.find(x=>x.id===id)||null;},addEventListener(){}
  };
  const window={setInterval(){}},location={hostname:"www.torn.com"};
  const installed=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js"),"utf8");
  new Function("document","window","location","PDA_httpGet",installed)(
    document,window,location,async()=>({status:503,responseText:"Unavailable"}));
  assert.ok(document.getElementById("hhj-quick-launch"));
  await document.getElementById("hhj-quick-launch").onclick();
  assert.ok(document.getElementById("hhj-quick-launch"),
    "launcher should remain clickable after load error");
  const panel=document.getElementById("hhj-loader-status");
  assert.ok(panel.children.some(x=>String(x.textContent).includes("HTTP 503")));
});

test("Progress displays current base stats and supports empty local history",async()=>{
  const app=setup();
  app.launcher.onclick();
  await app.refresh.onclick();
  app.tabs.find(x=>x.dataset.tab==="progress").onclick();
  assert.match(app.panel.innerHTML,/Progress & long-term goals/);
  assert.match(app.panel.innerHTML,/Your current base stats/);
  assert.match(app.panel.innerHTML,/Observed changes/);
  assert.match(app.panel.innerHTML,/Clear local history/);
  assert.match(app.panel.innerHTML,/No account history, API keys or stats are uploaded/);
});
test("Plan shows daily gains and supply checklist",async()=>{
  const app=setup();
  app.launcher.onclick();
  await app.refresh.onclick();
  app.tabs.find(x=>x.dataset.tab==="steps").onclick();
  assert.match(app.panel.innerHTML,/Daily gain breakdown/);
  assert.match(app.panel.innerHTML,/Shopping & supply checklist/);
});

test("partial category failure preserves verified inventory and book data",async()=>{
  const app=setup(false,"partial");
  app.launcher.onclick();
  await app.refresh.onclick();
  assert.match(app.panel.innerHTML,/Some inventory categories failed/);
  app.tabs.find(x=>x.dataset.tab==="bonuses").onclick();
  assert.match(app.panel.innerHTML,/Brawn Over Brains/);
  assert.match(app.panel.innerHTML,/still-usable status is unverified/);
  assert.ok(app.requests.some(x=>x.url.includes("cat=Book")));
  assert.ok(app.requests.some(x=>x.url.includes("cat=Drug")));
});
test("Plan displays cooldown sensitivity alongside full weekly gain forecast",async()=>{
  const app=setup(false,"partial");
  app.launcher.onclick();
  await app.refresh.onclick();
  app.modes.find(x=>x.dataset.mode==="happyjump").onclick();
  app.tabs.find(x=>x.dataset.tab==="steps").onclick();
  assert.match(app.panel.innerHTML,/Cooldown sensitivity/);
  assert.match(app.panel.innerHTML,/Ecstasy 200m/);
  assert.match(app.panel.innerHTML,/Daily gain breakdown/);
});

test("Today prioritises a compact planned action and does not claim an action is due early",async()=>{
  const app=setup();
  app.launcher.onclick();
  await app.refresh.onclick();
  assert.match(app.panel.innerHTML,/NEXT PLANNED ACTION/);
  assert.match(app.panel.innerHTML,/hhj-action-countdown/);
  assert.match(app.panel.innerHTML,/MAXIMUM WEEKLY GAIN/);
  assert.match(app.panel.innerHTML,/configured, not verified cash on hand/);
  assert.match(app.panel.innerHTML,/swipe horizontally for more/);
});
