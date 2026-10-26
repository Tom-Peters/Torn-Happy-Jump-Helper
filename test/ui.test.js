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
function setup(){
  const body=createNode("body"), root=createNode("html");
  const document={body,documentElement:root,createElement:createNode,getElementById:()=>null};
  const tabs=["today","compare","steps","bonuses","settings"].map(name=>({dataset:{tab:name},onclick:null}));
  const requests=[];
  const fixture={
    "/user/bars":{bars:{energy:{current:150,maximum:150,interval:120,increment:1},happy:{current:5000,maximum:5000}}},
    "/user/cooldowns":{cooldowns:{drug:0,booster:0}},
    "/user/battlestats":{battlestats:{strength:{value:1000},speed:{value:2000},defense:{value:1500},dexterity:{value:500}}},
    "/user/gym":{gym:{id:9,name:"Example gym"}},
    "/torn/gyms":{gyms:[{id:9,name:"Example gym",energy_cost:10,modifiers:{strength:50,speed:50,defense:50,dexterity:50}}]},
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
    document,{hostname:"www.torn.com"},{setInterval(){}},{getItem(){return null;},setItem(){}},PDA_httpGet);
  const launcher=body.children.find(x=>x.id==="hhj-launch");
  const panel=body.children.find(x=>x.id==="hhj-panel");
  const refresh={onclick:null,disabled:false};
  const close={onclick:null};
  panel.cache={"#hhj-refresh":refresh,"#hhj-close":close,"#hhj-timer":{textContent:""}};
  panel.lists={"#hhj-refresh":[refresh],"[data-tab]":tabs,"[data-field]":[],"[data-plan]":[],"[data-goal]":[],"[data-step]":[]};
  return {launcher,panel,refresh,tabs,requests};
}
test("TornPDA script opens with readable four-tab panel",()=>{
  const app=setup();
  app.launcher.onclick();
  assert.match(app.panel.innerHTML,/Today/);
  assert.match(app.panel.innerHTML,/Compare/);
  assert.match(app.panel.innerHTML,/Plan/);
  assert.match(app.panel.innerHTML,/Settings/);
  assert.match(app.panel.innerHTML,/Perks/);
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
  app.tabs.find(x=>x.dataset.tab==="bonuses").onclick();
  assert.match(app.panel.innerHTML,/Passive effects & books/);
  assert.match(app.panel.innerHTML,/Book inventory unavailable/);
  app.tabs.find(x=>x.dataset.tab==="settings").onclick();
  assert.match(app.panel.innerHTML,/Compare both choices/);
  assert.match(app.panel.innerHTML,/Stats per Happy jump/);
  assert.ok(app.requests.every(x=>x.url.startsWith("https://api.torn.com/v2/")));
});
