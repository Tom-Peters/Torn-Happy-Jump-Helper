"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const S=path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js");
function setup(apiRefillUsed=true,category21=false,clock="2026-10-26T21:23:00Z",settings=null,strengthDots=70,pathname="/index.php"){
  const source=fs.readFileSync(S,"utf8").replace("###PDA-APIKEY###","safe-fixture-key");
  const elements=[];
  function node(tag){return {tag,style:{},children:[],dataset:{},innerHTML:"",textContent:"",
    append(...x){this.children.push(...x);},appendChild(x){this.children.push(x);},
    addEventListener(k,fn){this["on"+k]=fn;},setAttribute(){},
    get id(){return this._id;},set id(x){this._id=x;}};}
  const body=node("body"),head=node("head");
  const document={body,head,createElement:node,addEventListener(){},
    getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null;}};
  const w={setInterval(){},__TornHappyJumpLoaded:null};
  const date=class extends Date {static now(){return Date.parse(clock)}};
  const map=new Map();
  if(settings)map.set("hhj-compact-v1:settings",JSON.stringify(settings));
  const localStorage={getItem(k){return map.has(k)?map.get(k):null;},
    setItem(k,v){map.set(k,String(v));}};
  const fixture={
    "/user/bars":{bars:{energy:{current:65,maximum:150,interval:120,increment:1},
      happy:{current:3475,maximum:3475}}},
    "/user/cooldowns":{cooldowns:{drug:13680,booster:28000}},
    "/user/battlestats":{battlestats:{
      speed:{value:2000000},strength:{value:1350000},defense:{value:1180000},dexterity:{value:1000000}}},
    "/user/gym":{gym:{id:9,name:"Example Gym"}},
    "/torn/gyms":{gyms:[{id:9,name:"Example Gym",energy_cost:10,
      modifiers:{speed:75,strength:strengthDots,defense:70,dexterity:70}}]},
    "/user/refills":{refills:{energy:apiRefillUsed}},
    "/user/perks":{perks:{faction:["Increases speed gym gains by 10%"],
      merit:["+30% effective speed"]}},
    "/market/pointsmarket":{pointsmarket:[{cost:25000,quantity:5000}]}
  };
  let requests=[];
  async function PDA_httpGet(url,headers){
    requests.push(url);
    assert.ok(url.startsWith("https://api.torn.com/v2/"));
    assert.equal(headers.Authorization,"ApiKey safe-fixture-key");
    const p=url.slice("https://api.torn.com/v2".length);
    let value=fixture[p];
    if(p.startsWith("/market/")&&p.includes("/itemmarket"))value={itemmarket:{listings:[{price:750000,amount:500}]}};
    if(p.startsWith("/user/inventory"))value=category21&&p.includes("?cat=")?{error:{code:21}}:{inventory:{items:category21?[{id:206,amount:2,name:"Xanax",faction_owned:false}]:[]}};
    return {status:200,responseText:JSON.stringify(value||{error:{code:21}})};
  }
  const injected=source.replace(/\}\)\(\);\s*$/, "window.__HJTEST={refillStatus,refresh,plans,loadInput,simulate,gymDots,trainEstimate,summary,readGymResult,actualComparison};})();");
  new Function("document","location","window","localStorage","PDA_httpGet","Date",injected)(
    document,{hostname:"www.torn.com",pathname},w,localStorage,PDA_httpGet,date);
  return {source,document,window:w,storage:localStorage,requests,btn:document.getElementById("hhj-launch"),
    core:w.__HJTEST,refresh:()=>w.__HJTEST.refresh()};
}
test("CSP-safe installed script is compact, self-contained and includes no eval or external script loader",()=>{
  const src=fs.readFileSync(S,"utf8");
  assert.ok(src.length<55000,"Keep the direct install far below the failed 78 KB preview size");
  assert.match(src,/@run-at\s+document-end/);
  assert.match(src,/@version\s+0\.9\.1/);
  assert.ok(!/\beval\s*\(|\bnew\s+Function\s*\(|\bimport\s*\(|createObjectURL\s*\(/.test(src));
  assert.ok(src.includes("###PDA-APIKEY###"));
  assert.ok(src.includes("xanax:206,ecstasy:197,lollipop:310,dvd:366"));
});
test("HJ is visible immediately, before any API request or complex computation",()=>{
  const a=setup();
  assert.ok(a.btn);
  assert.ok(a.btn.style.cssText.includes("z-index:2147483645"));
  assert.ok(a.document.getElementById("hhj-compact-panel"));
  assert.equal(a.requests.length,0);
  assert.equal(a.window.__TornHappyJumpLoaded,"0.9.1");
  assert.equal(a.window.__TornHappyJumpStage.phase,"mounted");
  a.btn.onclick();
  assert.match(a.document.getElementById("hhj-compact-panel").children[1].innerHTML,/Refresh data/);
});
test("true Torn refill flag excludes another same-day refill and train-to-refill sequence",async()=>{
  const a=setup(true);
  a.btn.onclick();
  await a.refresh();
  const plans=a.core.plans(),limit=Date.parse("2026-10-27T00:00:00Z")/1000;
  assert.equal(a.core.refillStatus(true,Date.parse("2026-10-26T21:23:00Z")/1000),"used");
  for(const plan of plans){
    const current=plan.events.filter(e=>e.t<limit);
    assert.ok(!current.some(e=>e.kind==="REFILL"),"No refill on used day");
    assert.ok(!current.some(e=>e.detail.includes("Train before available daily point refill")));
  }
  assert.match(a.document.getElementById("hhj-compact-panel").children[1].innerHTML,/USED/);
});
test("false refill flag is available, but manual used mark wins for UTC date",async()=>{
  const a=setup(false);
  assert.equal(a.core.refillStatus(false,Date.parse("2026-10-26T21:23:00Z")/1000),"ready");
  a.storage.setItem("hhj-compact-v1:used-day",JSON.stringify("2026-10-26"));
  assert.equal(a.core.refillStatus(false,Date.parse("2026-10-26T21:23:00Z")/1000),"used");
  assert.equal(a.core.refillStatus(false,Date.parse("2026-10-27T00:01:00Z")/1000),"ready");
});

test("HJ launcher disappears behind the open panel and returns when panel closes",()=>{
  const a=setup();
  const panel=a.document.getElementById("hhj-compact-panel");
  assert.match(a.btn.style.cssText,/display:block!important/);
  a.btn.onclick();
  assert.equal(panel.style.display,"block");
  assert.match(a.btn.style.cssText,/display:none!important/);
  panel.onclick({target:{closest(){return {dataset:{act:"close"}};}}});
  assert.equal(panel.style.display,"none");
  assert.match(a.btn.style.cssText,/display:block!important/);
  a.btn.onclick();
  assert.equal(panel.style.display,"block");
  assert.match(a.btn.style.cssText,/display:none!important/);
});
test("compact tab bar uses horizontally scrollable non-wrapping buttons",()=>{
  const a=setup();
  const css=a.document.getElementById("hhj-mini-css").textContent;
  assert.match(css,/\.tabs\{display:flex;overflow-x:auto/);
  assert.match(css,/\.tabs button\{flex:0 0 auto;white-space:nowrap/);
  assert.match(css,/position:sticky/);
  a.btn.onclick();
  assert.match(a.document.getElementById("hhj-compact-panel").children[1].innerHTML,/class="row choices"/);
});
test("used refill has no redundant Mark used action; manual override can be cleared",async()=>{
  const used=setup(true);
  used.btn.onclick();await used.refresh();
  const usedHTML=used.document.getElementById("hhj-compact-panel").children[1].innerHTML;
  assert.match(usedHTML,/Next daily reset 00:00 UTC/);
  assert.ok(!usedHTML.includes('data-act="mark-used"'));
  const ready=setup(false);
  ready.btn.onclick();await ready.refresh();
  const p=ready.document.getElementById("hhj-compact-panel");
  assert.match(p.children[1].innerHTML,/data-act="mark-used"/);
  p.onclick({target:{closest(){return {dataset:{act:"mark-used"}};}}});
  assert.match(p.children[1].innerHTML,/Clear manual mark/);
  assert.ok(!p.children[1].innerHTML.includes('data-act="mark-used"'));
  p.onclick({target:{closest(){return {dataset:{act:"clear-refill"}};}}});
  assert.match(p.children[1].innerHTML,/data-act="mark-used"/);
});

test("inventory API error 21 falls back once to unfiltered inventory and retains owned quantities",async()=>{
  const a=setup(false,true);
  a.btn.onclick();
  await a.refresh();
  assert.equal(a.requests.filter(x=>x.includes("/user/inventory?limit=250&offset=0")).length,1,
    "One cached unfiltered inventory fetch should serve all four categories");
  assert.ok(a.requests.some(x=>x.includes("/user/inventory?cat=drug")),
    "Retry lowercase category before falling back");
  const panel=a.document.getElementById("hhj-compact-panel");
  assert.match(panel.children[1].innerHTML,/category 21; unfiltered fallback used/);
  assert.match(panel.children[1].innerHTML,/What should I do\?/);
});

test("realistic jump options require full kits and never confuse candy with eDVDs",async()=>{
  const a=setup(true,false,"2026-10-27T09:52:00Z",{budget:10000000});
  a.btn.onclick();
  await a.refresh();
  const all=a.core.plans(),candy=all.find(x=>x.method==="happy-candy"),
    dvd=all.find(x=>x.method==="happy");
  assert.equal(all.length,4);
  assert.ok(candy&&dvd,"Both Happy jump strategies must be present");
  assert.equal(candy.jumps,0,"48 high-priced candies should be blocked by $10m budget");
  assert.equal(candy.count.lollipop,0,"Do not spend an incomplete kit");
  assert.equal(dvd.jumps,1,"Four eDVDs + four Xanax + Ecstasy fit the fixture budget");
  assert.equal(dvd.count.xanax,4);
  assert.equal(dvd.count.dvd,4);
  assert.equal(dvd.count.ecstasy,1);
  assert.equal(dvd.count.lollipop,0,"eDVD jump must not substitute cheap candies");
  assert.ok(dvd.events.some(e=>e.kind==="JUMP"&&e.detail.includes("Erotic DVDs")));
  assert.ok(!a.document.getElementById("hhj-compact-panel").children[1].innerHTML.includes("No fully funded Happy jump forecast"),
    "An affordable eDVD jump must remain selectable");
});

test("available refill is scheduled before noon UTC rather than delayed arbitrarily",async()=>{
  const a=setup(false,false,"2026-10-27T06:24:00Z");
  a.btn.onclick();
  await a.refresh();
  const natural=a.core.plans().find(p=>p.method==="natural");
  const refill=natural.events.find(e=>e.kind==="REFILL");
  assert.ok(refill,"An available refill must appear");
  assert.ok(refill.t<Date.parse("2026-10-27T12:00:00Z")/1000,
    "Do not postpone a ready refill until noon UTC");
  const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
  assert.match(html,/Priority: daily 30-point refill is READY/);
  assert.match(html,/Next step · selected forecast/);
});
test("open modal sits above launcher and shows saved budget and lower-cost alternatives",async()=>{
  const a=setup(false,false,"2026-10-27T06:24:00Z",{budget:50000000});
  const panel=a.document.getElementById("hhj-compact-panel");
  a.btn.onclick();
  assert.match(panel.style.cssText,/z-index:2147483647/);
  assert.match(a.btn.style.cssText,/display:none!important/);
  await a.refresh();
  const html=panel.children[1].innerHTML;
  assert.match(html,/Weekly spending limit: \$50,000,000/);
  assert.match(html,/Lower-cost option/);
  assert.match(html,/30-point energy refill/);
});

test("full screen is edge to edge and no launcher overlays an open dashboard",()=>{
 const a=setup(false);
 const panel=a.document.getElementById("hhj-compact-panel");
 assert.match(panel.style.cssText,/inset:0!important/);
 assert.match(panel.style.cssText,/width:100vw!important/);
 assert.match(panel.style.cssText,/height:100dvh!important/);
 assert.match(panel.style.cssText,/max-width:none!important/);
 a.btn.onclick();
 assert.match(a.btn.style.cssText,/display:none!important/);
 assert.match(panel.style.cssText,/z-index:2147483647/);
});
test("per-train, 24h and 7-day gains match the actions in each exact period",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",{budget:50000000});
 a.btn.onclick();await a.refresh();
 const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
 assert.match(html,/Per gym train/);
 assert.match(html,/Train current/);
 assert.match(html,/Next 24 hours/);
 assert.match(html,/Next 7 days/);
 assert.match(html,/\$50,000,000/);
 const p=a.core.plans().find(x=>x.method==="xanax");
 const s=(events)=>events.reduce((v,x)=>v+(x.g||0),0);
 const spent=(events)=>events.reduce((v,x)=>v+(x.spent||0),0);
 const day=p.events.filter(e=>e.t<p.start+86400);
 assert.ok(Math.abs(s(p.events)-p.gain)<0.000001);
 assert.ok(s(day)<=p.gain);
 assert.ok(Math.abs(spent(p.events)-p.cost)<0.000001);
 assert.ok(spent(day)<=p.cost);
});
test("comparison retains all tabs and provides independent forecasts for every stat",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",{budget:50000000});
 a.btn.onclick();await a.refresh();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"compare"}};}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/All four stats/);
 assert.match(html,/Per train/);
 assert.match(html,/24 hours/);
 assert.match(html,/7 days/);
 assert.match(html,/stat-row/);
 assert.match(html,/Candy Happy jump/);
 assert.match(html,/eDVD Happy jump/);
});
test("schedule 24 hours never labels a seven-day total as the shorter window",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",{budget:50000000});
 a.btn.onclick();await a.refresh();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"plan"}};}}});
 assert.match(panel.children[1].innerHTML,/Totals in this 24-hour window/);
 assert.ok(!panel.children[1].innerHTML.includes("in seven days"));
 panel.onclick({target:{closest(){return {dataset:{act:"horizon",val:"168"}};}}});
 assert.match(panel.children[1].innerHTML,/Totals in this 7-day window/);
});

test("Torn API v2 gym dots are already in display units; no second division by ten",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",{budget:50000000});
 a.btn.onclick();await a.refresh();
 // The existing fixture uses a historical API x10 strength value of 70.
 const p=a.core.loadInput();
 assert.ok(p.dots>=7,"Legacy x10 API scale should still normalize to gym dots");
 assert.ok(a.document.getElementById("hhj-compact-panel").children[1].innerHTML.includes("Per gym train"));
});

test("v2 Atlas gym modifiers 7.0 yield hundreds of Strength per 10-energy train",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",
  {budget:50000000,stat:"strength"},7);
 a.btn.onclick();await a.refresh();
 const p=a.core.loadInput();
 assert.equal(p.dots,7,"Do not divide v2 gym dots by ten");
 assert.equal(a.core.gymDots(70),7,"Old x10 gym format remains compatible");
 assert.equal(a.core.gymDots(7),7,"Current v2 gym values use display dots");
 assert.equal(a.core.gymDots(0),0,"Unavailable stat gym gains stay zero");
 const perTrain=a.core.trainEstimate(p);
 assert.ok(perTrain>500&&perTrain<750,"Atlas 10E estimated gain should be hundreds");
 const regular=a.core.plans().find(x=>x.method==="natural");
 assert.ok(regular.gain>3000,"Daily/weekly events must not remain a tenth of real gains");
 assert.ok(Math.abs(a.core.summary(regular,168).gain-regular.gain)<0.00001);
});

test("Gym page observation compares a read-only train result with calculated gain",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",
  {budget:50000000,stat:"strength"},7,"/gym.php");
 a.document.body.innerText="You completed one 10E training exercise. You gained 640.50 strength";
 const observed=a.core.readGymResult();
 assert.equal(observed.stat,"strength");
 assert.equal(observed.amount,640.5);
 assert.ok(!a.source.includes("640.50 strength"),
  "Observed player data must not be bundled into the public userscript");
 a.btn.onclick();await a.refresh();
 const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
 assert.match(html,/Compare with Torn/);
 assert.match(html,/640.5/);
 assert.match(html,/Model estimates now/);
 assert.match(html,/Per gym train/);
});
