"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),
  fs=require("node:fs"),path=require("node:path"),vm=require("node:vm");
const file=path.join(__dirname,"..","Torn-Happy-Jump-Helper-Enhanced.user.js");
function setup(){
  const code=fs.readFileSync(file,"utf8").replace("###PDA-APIKEY###","fixture-key");
  const mounted=new Map();
  function node(tag){
    return {tag,id:"",style:{},dataset:{},children:[],innerHTML:"",textContent:"",
      append(...children){children.forEach(c=>this.appendChild(c));},
      appendChild(child){this.children.push(child);if(child.id)mounted.set(child.id,child);return child;},
      addEventListener(name,fn){this["on"+name]=fn;},setAttribute(){},
      querySelector(){return null;},querySelectorAll(){return []},remove(){},
    };
  }
  const body=node("body"),head=node("head");
  const document={body,head,documentElement:node("html"),createElement:node,
    getElementById(id){return mounted.get(id)||null;},addEventListener(){}};
  const fixture={
    "/user/bars":{bars:{energy:{current:65,maximum:150,interval:120,increment:1},
      happy:{current:3475,maximum:3475}}},
    "/user/cooldowns":{cooldowns:{drug:14000,booster:22000}},
    "/user/battlestats":{battlestats:{strength:{value:1300000},speed:{value:2000000},
      defense:{value:1200000},dexterity:{value:1000000}}},
    "/user/gym":{gym:{id:9,name:"Test Gym"}},
    "/torn/gyms":{gyms:[{id:9,name:"Test Gym",energy_cost:10,cost:100,
      modifiers:{strength:70,speed:75,defense:70,dexterity:70}}]},
    "/user/refills":{refills:{energy:true}},
    "/user/perks":{perks:{job:["+5% gym gains"],faction:["Reduces booster cooldown by 10%"]}},
    "/market/pointsmarket":{pointsmarket:[{cost:25000,quantity:5000}]}
  };
  let requests=0;
  async function PDA_httpGet(url,headers){
    requests++;
    assert.equal(headers.Authorization,"ApiKey fixture-key");
    const key=url.slice("https://api.torn.com/v2".length);
    let value=fixture[key];
    if(key.startsWith("/market/")&&key.includes("/itemmarket"))
      value={itemmarket:{listings:[{price:250000,amount:5000}]}};
    if(key.startsWith("/user/inventory"))
      value={inventory:{items:[]}};
    return {status:200,responseText:JSON.stringify(value||{error:{code:21}})};
  }
  const window={setInterval(){},addEventListener(){}};
  const storage=new Map(),localStorage={getItem(k){return storage.get(k)||null},
    setItem(k,v){storage.set(k,String(v))}};
  const ctx=vm.createContext({document,location:{hostname:"www.torn.com",pathname:"/gym.php"},
    window,localStorage,PDA_httpGet,console},
    {codeGeneration:{strings:false,wasm:false}});
  vm.runInContext(code,ctx,{timeout:5000});
  return {mounted,document,window,requests:()=>requests};
}
test("enhanced 32KB preview mounts before networking under strict CSP",()=>{
  const text=fs.readFileSync(file,"utf8");
  assert.ok(text.length<40000);
  assert.match(text,/@version\s+0\.9\.0/);
  assert.ok(!/\b(?:eval|Function)\s*\(/.test(text));
  const x=setup();
  const launch=x.mounted.get("hhj-launch");
  assert.ok(launch);
  assert.equal(x.requests(),0);
  launch.onclick();
  assert.match(x.mounted.get("hhj-compact-panel").children[1].innerHTML,/Refresh Torn data/);
  assert.equal(x.requests(),0);
});
test("enhanced full weekly scorer handles live v2 data, refill already USED and 7-day plans",async()=>{
  const x=setup(),panel=x.mounted.get("hhj-compact-panel");
  x.mounted.get("hhj-launch").onclick();
  panel.onclick({target:{closest(){return {dataset:{act:"refresh"}}}}});
  // Trigger each pending fetch and render; API responses are immediately resolved.
  for(let i=0;i<30;i++)await Promise.resolve();
  const html=panel.children[1].innerHTML;
  assert.ok(x.requests()>8,"Refreshed several Torn API endpoints");
  assert.match(html,/USED/,"Torn energy=true must show refill already used");
  assert.match(html,/Projected seven-day training/);
  assert.ok(!/Train before available daily point refill/.test(html),
    "A spent refill must not be offered as the next step");
  panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"compare"}}}}});
  assert.match(panel.children[1].innerHTML,/Compare scenarios/);
  assert.match(panel.children[1].innerHTML,/Happy|Candy|chocolate|eDVD/i);
});
