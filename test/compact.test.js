"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");

const S=path.join(__dirname,"..","Torn-Happy-Jump-Helper.user.js");
function setup(apiRefillUsed=true,category21=false,clock="2026-10-26T21:23:00Z",settings=null,strengthDots=70,pathname="/index.php",seedVerification=null,seedPartial=null,seedActions=null){
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
  let nowMs=Date.parse(clock);
  const date=class extends Date {static now(){return nowMs}};
  const map=new Map();
  if(settings)map.set("hhj-compact-v1:settings",JSON.stringify(settings));
  if(seedVerification)map.set("hhj-compact-v1:verification",JSON.stringify(seedVerification));
  if(typeof seedPartial==="boolean")map.set("hhj-compact-v1:show-partial",JSON.stringify(seedPartial));
  if(seedActions)map.set("hhj-compact-v1:action-notes",JSON.stringify(seedActions));
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
  const injected=source.replace(/\}\)\(\);\s*$/, "window.__HJTEST={refillStatus,refresh,plans,loadInput,simulate,gymDots,trainEstimate,summary,readGymResult,actualComparison,sleeping,progressLog};})();");
  new Function("document","location","window","localStorage","PDA_httpGet","Date",injected)(
    document,{hostname:"www.torn.com",pathname},w,localStorage,PDA_httpGet,date);
  return {source,document,window:w,storage:localStorage,requests,btn:document.getElementById("hhj-launch"),
    core:w.__HJTEST,refresh:()=>w.__HJTEST.refresh(),fixture,advance:(secs)=>{nowMs+=1000*secs;}};
}
test("CSP-safe installed script is compact, self-contained and includes no eval or external script loader",()=>{
  const src=fs.readFileSync(S,"utf8");
  assert.ok(src.length<57000,"Keep the direct install far below the failed 78 KB preview size");
  assert.match(src,/@run-at\s+document-end/);
  assert.match(src,/@version\s+0\.9\.9/);
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
  assert.equal(a.window.__TornHappyJumpLoaded,"0.9.9");
  assert.equal(a.window.__TornHappyJumpStage.phase,"mounted");
  a.btn.onclick();
  assert.match(a.document.getElementById("hhj-compact-panel").children[1].innerHTML,/(?:Refreshing|Refresh data)/);
});
test("true Torn refill flag excludes another same-day refill and train-to-refill sequence",async()=>{
  const a=setup(true);
  await a.btn.onclick();
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
  await used.btn.onclick();
  const usedHTML=used.document.getElementById("hhj-compact-panel").children[1].innerHTML;
  assert.match(usedHTML,/Next daily reset 00:00 UTC/);
  assert.ok(!usedHTML.includes('data-act="mark-used"'));
  const ready=setup(false);
  await ready.btn.onclick();
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
  await a.btn.onclick();
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
  await a.btn.onclick();
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
  await a.btn.onclick();
  const natural=a.core.plans().find(p=>p.method==="natural");
  const refill=natural.events.find(e=>e.kind==="REFILL");
  assert.ok(refill,"An available refill must appear");
  assert.ok(refill.t<Date.parse("2026-10-27T12:00:00Z")/1000,
    "Do not postpone a ready refill until noon UTC");
  const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
  assert.match(html,/Refill ready — postpone until awake/);
  assert.match(html,/Next step · selected forecast/);
});
test("open modal sits above launcher and shows saved budget and lower-cost alternatives",async()=>{
  const a=setup(false,false,"2026-10-27T06:24:00Z",{budget:50000000});
  const panel=a.document.getElementById("hhj-compact-panel");
  await a.btn.onclick();
  assert.match(panel.style.cssText,/z-index:2147483647/);
  assert.match(a.btn.style.cssText,/display:none!important/);
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
 await a.btn.onclick();
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
 await a.btn.onclick();
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
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"plan"}};}}});
 assert.match(panel.children[1].innerHTML,/Totals in this 24-hour window/);
 assert.ok(!panel.children[1].innerHTML.includes("in seven days"));
 panel.onclick({target:{closest(){return {dataset:{act:"horizon",val:"168"}};}}});
 assert.match(panel.children[1].innerHTML,/Totals in this 7-day window/);
});

test("Torn API v2 gym dots are already in display units; no second division by ten",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",{budget:50000000});
 await a.btn.onclick();
 // The existing fixture uses a historical API x10 strength value of 70.
 const p=a.core.loadInput();
 assert.ok(p.dots>=7,"Legacy x10 API scale should still normalize to gym dots");
 assert.ok(a.document.getElementById("hhj-compact-panel").children[1].innerHTML.includes("Per gym train"));
});

test("v2 Atlas gym modifiers 7.0 yield hundreds of Strength per 10-energy train",async()=>{
 const a=setup(false,false,"2026-10-27T09:52:00Z",
  {budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
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
 await a.btn.onclick();
 const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
 assert.match(html,/Compare with Torn/);
 assert.match(html,/640.5/);
 assert.match(html,/Model estimates now/);
 assert.match(html,/Per gym train/);
});

test("v0.9.9 keeps the mobile launcher visible before API work",()=>{
 const a=setup(false,false,new Date(2026,9,27,21,30).toISOString());
 assert.ok(a.btn);
 assert.equal(a.requests.length,0);
 assert.equal(a.window.__TornHappyJumpLoaded,"0.9.9");
 a.btn.onclick();
 assert.ok(a.btn.style.cssText.includes("display:none!important"));
 const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
 assert.match(html,/(?:Refreshing|Refresh data)/);
});
test("sleep schedule suppresses every manual action 22–08 and trains before bed and on waking",async()=>{
 const from=new Date(2026,9,27,21,30).toISOString();
 const a=setup(false,false,from,{budget:50000000,stat:"strength",sleepEnabled:true,
 sleepStart:"22:00",sleepEnd:"08:00"},7);
 await a.btn.onclick();
 const bed=new Date(2026,9,27,22,0).getTime()/1000;
 const wake=new Date(2026,9,28,8,0).getTime()/1000;
 assert.equal(a.core.sleeping(bed),true);
 assert.equal(a.core.sleeping(wake),false);
 for(const p of a.core.plans())assert.ok(!p.events.some(e=>e.t>=bed&&e.t<wake),
  "No gym, drug, booster or refill instructions during sleep");
 const plan=a.core.plans().find(p=>p.method==="natural");
 assert.ok(plan.events.some(e=>e.kind==="TRAIN"&&e.t<bed&&e.detail.includes("before bed")));
 assert.ok(plan.events.some(e=>e.kind==="TRAIN"&&e.t>=wake&&e.detail.includes("after waking")));
 const day=a.core.summary(plan,24);
 assert.ok(day.lost>0&&day.sleepLost>0&&day.sleepLost<=day.lost);
});
test("disabling sleep settings makes the regular schedule unrestricted",async()=>{
 const a=setup(false,false,new Date(2026,9,27,21,30).toISOString(),
 {budget:50000000,stat:"strength",sleepEnabled:false},7);
 await a.btn.onclick();
 const bed=new Date(2026,9,27,22,0).getTime()/1000,wake=new Date(2026,9,28,8,0).getTime()/1000;
 assert.equal(a.core.sleeping(bed),false);
 const p=a.core.plans().find(x=>x.method==="xanax");
 assert.ok(p.events.some(x=>x.t>=bed&&x.t<wake));
 assert.equal(a.core.summary(p,24).sleepLost,0);
});
test("Settings exposes local 22:00 to 08:00 sleep controls",()=>{
 const a=setup();a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"settings"}};}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/id="hhj-sleepenabled"/);
 assert.match(html,/id="hhj-sleepstart"/);
 assert.match(html,/value="22:00"/);
 assert.match(html,/id="hhj-sleepend"/);
 assert.match(html,/value="08:00"/);
});

test("rolling verification starts with a baseline, then records real stat gains after refresh",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
  {budget:50000000,stat:"strength",sleepEnabled:true},7);
 assert.equal(a.requests.length,0);
 await a.btn.onclick();
 assert.ok(a.storage.getItem("hhj-compact-v1:rolling-plan"));
 assert.equal(a.storage.getItem("hhj-compact-v1:verification"),null,
  "First refresh must not fabricate prior gains");
 a.advance(3600);
 a.fixture["/user/battlestats"].battlestats.strength.value+=610.45;
 await a.refresh();
 const records=JSON.parse(a.storage.getItem("hhj-compact-v1:verification"));
 assert.equal(records.length,1);
 assert.ok(Math.abs(records[0].observed.strength-610.45)<.01);
 assert.equal(records[0].stat,"strength");
 assert.ok(Number.isFinite(records[0].expected));
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 assert.match(panel.children[1].innerHTML,/Observed stat gains/);
 assert.match(panel.children[1].innerHTML,/last seven days/);
 assert.match(panel.children[1].innerHTML,/Clear rolling history/);
});
test("rolling history is cleared without wiping budget or other saved settings",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",{budget:50000000,stat:"speed"});
 await a.btn.onclick();a.advance(7200);await a.refresh();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 panel.onclick({target:{closest(){return {dataset:{act:"clearverification"}}}}});
 assert.equal(a.storage.getItem("hhj-compact-v1:verification"),"[]");
 assert.equal(a.storage.getItem("hhj-compact-v1:rolling-plan"),"null");
 assert.equal(JSON.parse(a.storage.getItem("hhj-compact-v1:settings")).budget,50000000);
});

test("Progress compares matched observed training with a one-train baseline, not 7-day forecast",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
  {budget:50000000,stat:"strength",sleepEnabled:true},7);
 await a.btn.onclick();
 const initial=JSON.parse(a.storage.getItem("hhj-compact-v1:rolling-plan"));
 assert.ok(initial.single.strength>0);
 assert.equal(initial.gymId,9);
 a.advance(3600);
 // Synthetic training observation, not user stat data: one ordinary 10E train.
 const observed=initial.single.strength*1.006;
 a.fixture["/user/battlestats"].battlestats.strength.value+=observed;
 await a.refresh();
 const samples=JSON.parse(a.storage.getItem("hhj-compact-v1:verification"));
 assert.equal(samples.length,1);
 assert.equal(samples[0].inferred,1);
 assert.equal(samples[0].single,initial.single.strength);
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/Latest matching interval: estimated/);
 assert.match(html,/per inferred train/);
 assert.match(html,/Latest recorded gain/);
 assert.ok(!html.includes("Last interval: planned +"),"Never compare full forecast directly against one train");
 assert.ok(!html.includes("Observed changes"),"Remove once-per-day zero card");
 assert.match(html,/Daily totals/);
});
test("multi-stat or book-like gains do not invent a per-train calibration",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
  {budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 const first=JSON.parse(a.storage.getItem("hhj-compact-v1:rolling-plan"));
 a.advance(500);
 a.fixture["/user/battlestats"].battlestats.strength.value+=first.single.strength*1.85;
 a.fixture["/user/battlestats"].battlestats.speed.value+=250;
 await a.refresh();
 const sample=JSON.parse(a.storage.getItem("hhj-compact-v1:verification"))[0];
 assert.equal(sample.inferred,null);
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 assert.match(panel.children[1].innerHTML,/No reliable individual-train comparison/);
 assert.ok(!panel.children[1].innerHTML.includes("Estimated per train"));
});
test("legacy v0.9.3 observations remain visible but do not claim a matched baseline",async()=>{
 const legacy=[{t:Date.parse("2026-10-27T08:30:00Z")/1000,stat:"strength",
  expected:29000,observed:{strength:630,defense:0,speed:0,dexterity:0},method:"xanax"}];
 const a=setup(false,false,"2026-10-27T09:00:00Z",
  {budget:50000000,stat:"strength"},7,"/index.php",legacy);
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/Observed stat gains/);
 assert.match(html,/No reliable individual-train comparison/);
 assert.match(html,/Partial coverage/);
 assert.ok(!html.includes("Last interval: planned +"));
 assert.ok(!html.includes("Observed changes"));
 assert.match(html,/str: 630/);
});

test("each HJ open refreshes once while initial injection and closing never call Torn",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",{budget:50000000});
 const calls=()=>a.requests.filter(x=>x.includes("/user/bars")).length;
 assert.equal(calls(),0,"Injecting the script must not call the API");
 await a.btn.onclick();
 assert.equal(calls(),1,"First opening must refresh exactly once");
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"close"}};}}});
 assert.equal(panel.style.display,"none");
 assert.equal(calls(),1,"Closing must not refresh");
 a.advance(360);
 await a.btn.onclick();
 assert.equal(calls(),2,"Reopening must refresh exactly once");
 assert.equal(panel.style.display,"block");
 assert.equal(JSON.parse(a.storage.getItem("hhj-compact-v1:verification")).length,1,
 "Reopen should add a real-versus-forecast checkpoint after the elapsed interval");
});
test("Progress charts measured gains from actual stored refresh intervals, not projected values",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
  {budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 const initial=JSON.parse(a.storage.getItem("hhj-compact-v1:rolling-plan"));
 a.advance(3600);
 a.fixture["/user/battlestats"].battlestats.strength.value+=initial.single.strength;
 await a.refresh();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}};}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/7-day strength · observed vs planned/);
 assert.match(html,/Paired bars compare the same refresh intervals only/);
 assert.match(html,/background:#4bdecb/);
 assert.match(html,/background:#8aa2fa/);
 assert.match(html,/Partial/);
 assert.match(html,/Observed stat gains · last seven days/);
 assert.ok(!html.includes("2026-10-26"),"No fabricated unobserved previous-day bar");
});
test("reopening preserves last selected tab; refreshed content keeps its scroll position",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",{budget:50000000});
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}};}}});
 const content=panel.children[1];content.scrollTop=250;
 panel.onclick({target:{closest(){return {dataset:{act:"close"}};}}});
 a.advance(400);
 await a.btn.onclick();
 assert.match(content.innerHTML,/Observed stat gains/);
 assert.equal(content.scrollTop,250);
});

test("a zero-change reopen never hides last meaningful gain or resets recorded total",async()=>{
 const a=setup(false,false,"2026-10-27T17:00:00Z",
  {budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 const baseline=JSON.parse(a.storage.getItem("hhj-compact-v1:rolling-plan"));
 a.advance(240);
 a.fixture["/user/battlestats"].battlestats.strength.value+=baseline.single.strength;
 await a.refresh();
 a.advance(240);
 a.fixture["/user/battlestats"].battlestats.strength.value+=baseline.single.strength;
 await a.refresh();
 a.advance(240);
 await a.refresh(); // No training after last refresh.
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 const html=panel.children[1].innerHTML;
 const total=Math.round(2*baseline.single.strength).toLocaleString("en-GB");
 assert.match(html,/Latest recorded gain/);
 assert.match(html,/Latest refresh: no new strength gain/);
 assert.match(html,/2 checks with stat increases/);
 assert.match(html,/1 checks without a new stat increase/);
 assert.match(html,/checks, not individual gym trains/);
 assert.match(html,/Partial coverage/);
 assert.ok(html.includes("+"+total),"Two measured gains should remain in today's chart");
 assert.ok(!html.includes("Latest measured change: +0"));
});
test("the empty day after its first baseline is not interpreted as proven zero training",async()=>{
 const a=setup(false,false,"2026-10-27T17:00:00Z",{stat:"strength"});
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/No measured refresh intervals yet/);
 assert.match(html,/Open HJ to set a baseline/);
 assert.ok(!html.includes("checks without a new stat increase today"));
});

test("partial-day toggle hides incomplete days but preserves their recorded history",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",{budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 const first=JSON.parse(a.storage.getItem("hhj-compact-v1:rolling-plan"));
 a.advance(3600);
 a.fixture["/user/battlestats"].battlestats.strength.value+=first.single.strength;
 await a.refresh();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}};}}});
 let html=panel.children[1].innerHTML;
 assert.match(html,/Show partial days/);
 assert.match(html,/ON · Show all/);
 assert.match(html,/10-27 · Partial/);
 assert.match(html,/Scheduled/);
 panel.onclick({target:{closest(){return {dataset:{act:"partial"}};}}});
 html=panel.children[1].innerHTML;
 assert.match(html,/OFF · Covered only/);
 assert.match(html,/No days meet this filter/);
 assert.ok(html.includes("Recorded today"),"Hiding partial bars never hides measured totals");
 assert.equal(a.storage.getItem("hhj-compact-v1:show-partial"),"false");
 panel.onclick({target:{closest(){return {dataset:{act:"partial"}};}}});
 assert.match(panel.children[1].innerHTML,/ON · Show all/);
 assert.equal(a.storage.getItem("hhj-compact-v1:show-partial"),"true");
});
test("same-window actual/planned excludes unrelated focused-stat forecasts",async()=>{
 const fake=[
 {t:Date.parse("2026-10-27T10:00:00Z")/1000,from:Date.parse("2026-10-27T09:00:00Z")/1000,
  stat:"strength",forecastStat:"strength",expected:900,observed:{strength:610,defense:0,speed:0,dexterity:0}},
 {t:Date.parse("2026-10-27T12:00:00Z")/1000,from:Date.parse("2026-10-27T10:00:00Z")/1000,
  stat:"speed",forecastStat:"speed",expected:4000,observed:{strength:310,defense:0,speed:4000,dexterity:0}}
 ];
 const a=setup(false,false,"2026-10-27T13:00:00Z",{budget:50000000,stat:"strength"},7,"/index.php",fake);
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}};}}});
 const html=panel.children[1].innerHTML;
 assert.match(html,/1 comparable intervals/);
 assert.match(html,/Observed \(matched\) \+610/);
 assert.match(html,/Scheduled \(matched\) \+900/);
 assert.match(html,/Partial/);
 assert.match(html,/str: 920/);
 assert.ok(!html.includes("Scheduled (matched) +4,900"),
 "Forecasts for another focus stat must not be combined with strength forecasts");
});
test("a near-full UTC day with continuous tracked intervals qualifies as covered, absent days do not",async()=>{
 const midnight=Date.parse("2026-10-26T00:00:00Z")/1000,segments=[];
 let prior=midnight+300;
 for(let i=0;i<12;i++){
  const t=i===11?midnight+86400-300:midnight+300+(i+1)*7200;
  segments.push({t,from:prior,stat:"strength",forecastStat:"strength",expected:100,
   observed:{strength:105,defense:0,speed:0,dexterity:0}});
  prior=t;
 }
 const a=setup(false,false,"2026-10-27T10:00:00Z",
 {budget:50000000,stat:"strength"},7,"/index.php",segments);
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}};}}});
 let html=panel.children[1].innerHTML;
 assert.match(html,/10-26 · Covered/);
 panel.onclick({target:{closest(){return {dataset:{act:"partial"}};}}});
 html=panel.children[1].innerHTML;
 assert.match(html,/10-26 · Covered/);
 assert.match(html,/OFF · Covered only/);
 assert.ok(!html.includes("10-27 · Partial"));
});

test("coverage toggle persists across a fresh userscript installation and never deletes checkpoint history",async()=>{
 const seed=[{t:Date.parse("2026-10-26T09:30:00Z")/1000,
 from:Date.parse("2026-10-26T09:00:00Z")/1000,stat:"strength",forecastStat:"strength",
 expected:120,observed:{strength:115,speed:0,defense:0,dexterity:0}}];
 const a=setup(false,false,"2026-10-27T09:00:00Z",{stat:"strength"},7,"/index.php",seed);
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 assert.match(panel.children[1].innerHTML,/ON · Show all/);
 panel.onclick({target:{closest(){return {dataset:{act:"partial"}}}}});
 assert.equal(a.storage.getItem("hhj-compact-v1:show-partial"),"false");
 const originalHistory=a.storage.getItem("hhj-compact-v1:verification");
 assert.match(panel.children[1].innerHTML,/OFF · Covered only/);
 const b=setup(false,false,"2026-10-27T09:00:00Z",{stat:"strength"},7,"/index.php",seed,false);
 await b.btn.onclick();
 const p=b.document.getElementById("hhj-compact-panel");
 p.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 assert.match(p.children[1].innerHTML,/OFF · Covered only/);
 assert.match(p.children[1].innerHTML,/No days meet this filter/);
 assert.equal(a.storage.getItem("hhj-compact-v1:verification"),originalHistory);
 p.onclick({target:{closest(){return {dataset:{act:"partial"}}}}});
 assert.equal(b.storage.getItem("hhj-compact-v1:show-partial"),"true");
 assert.match(p.children[1].innerHTML,/10-26 · Partial/);
});
test("changed stat cannot relabel a previous strength forecast as a speed forecast",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
 {budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 a.advance(3600);
 a.fixture["/user/battlestats"].battlestats.speed.value+=490;
 await a.refresh();
 const record=JSON.parse(a.storage.getItem("hhj-compact-v1:verification"))[0];
 assert.equal(record.stat,"speed","Inferred trained stat comes from observed change");
 assert.equal(record.forecastStat,"strength","Stored forecast retains the originally selected focus");
 const panel=a.document.getElementById("hhj-compact-panel");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 let html=panel.children[1].innerHTML;
 assert.match(html,/1 comparable intervals/);
 assert.match(html,/Observed \(matched\) \+0/);
 assert.ok(!html.includes("Scheduled (matched) +0"),"Forecast should be nonzero if training was scheduled");
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"today"}}}}});
 panel.onclick({target:{closest(){return {dataset:{act:"stat",val:"speed"}}}}});
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 html=panel.children[1].innerHTML;
 assert.match(html,/No comparable plan/);
 assert.match(html,/Recorded \+490/);
 assert.ok(!html.includes("Scheduled (matched)"),"No mismatched strength forecast can display as a speed forecast");
});
test("legacy intervals without forecast focus keep observed totals but suppress invented paired comparisons",async()=>{
 const old=[{t:Date.parse("2026-10-26T11:00:00Z")/1000,
 from:Date.parse("2026-10-26T10:30:00Z")/1000,stat:"strength",expected:29000,
 observed:{strength:611,defense:0,speed:0,dexterity:0}}];
 const a=setup(false,false,"2026-10-27T09:00:00Z",{stat:"strength"},7,"/index.php",old);
 await a.btn.onclick();const p=a.document.getElementById("hhj-compact-panel");
 p.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 const html=p.children[1].innerHTML;
 assert.match(html,/10-26 · Partial/);
 assert.match(html,/No comparable plan/);
 assert.match(html,/Recorded \+611/);
 assert.ok(!html.includes("Scheduled (matched) +29,000"));
 assert.match(html,/str: 611/);
});
test("overlapping duplicate checkpoints cannot manufacture covered days",async()=>{
 const day=Date.parse("2026-10-26T00:00:00Z")/1000,entries=[];
 for(let i=0;i<16;i++)entries.push({t:day+2*3600,from:day+300,stat:"strength",
 forecastStat:"strength",expected:30,observed:{strength:40,defense:0,speed:0,dexterity:0}});
 entries.push({t:day+86400-300,from:day+86400-3900,stat:"strength",
 forecastStat:"strength",expected:45,observed:{strength:45,defense:0,speed:0,dexterity:0}});
 const a=setup(false,false,"2026-10-27T09:00:00Z",
 {stat:"strength"},7,"/index.php",entries);
 await a.btn.onclick();const p=a.document.getElementById("hhj-compact-panel");
 p.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}}}}});
 let html=p.children[1].innerHTML;
 assert.match(html,/10-26 · Partial/);
 p.onclick({target:{closest(){return {dataset:{act:"partial"}}}}});
 html=p.children[1].innerHTML;
 assert.match(html,/No days meet this filter/);
});

test("v0.9.9 opens a Just happened → Next action card on Today and Schedule",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",{budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 let html=panel.children[1].innerHTML;
 assert.match(html,/Just happened → Next action/);
 assert.match(html,/Next recommended:/);
 assert.match(html,/No gains detected/);
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"plan"}};}}});
 html=panel.children[1].innerHTML;
 assert.match(html,/Just happened → Next action/);
 assert.match(html,/Next recommended:/);
 panel.onclick({target:{closest(){return {dataset:{act:"tab",val:"progress"}};}}});
 html=panel.children[1].innerHTML;
 assert.match(html,/Just happened → Next action/);
 assert.match(html,/Observed stat gains/);
});
test("last snapshot gain is surfaced but never asserted as a precisely identified action",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",{budget:50000000,stat:"strength"},7);
 await a.btn.onclick();
 a.advance(900);
 a.fixture["/user/battlestats"].battlestats.strength.value+=610.25;
 await a.refresh();
 const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
 assert.match(html,/Detected:/);
 assert.match(html,/strength/);
 assert.match(html,/Snapshot:/);
 assert.match(html,/Just happened → Next action/);
 assert.match(html,/Next recommended:/);
});
test("user can self-report a due action and undo it without inventing Torn stat gains",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
 {budget:50000000,stat:"strength"},7);
 a.fixture["/user/cooldowns"].cooldowns.drug=0;
 a.fixture["/user/bars"].bars.energy.current=150;
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 let html=panel.children[1].innerHTML;
 assert.match(html,/I completed this in Torn/);
 const statBefore=a.fixture["/user/battlestats"].battlestats.strength.value;
 panel.onclick({target:{closest(){return {dataset:{act:"note-done"}};}}});
 const notes=JSON.parse(a.storage.getItem("hhj-compact-v1:action-notes"));
 assert.equal(notes.length,1);
 assert.ok(notes[0].kind==="TRAIN"||notes[0].kind==="XANAX"||notes[0].kind==="REFILL");
 assert.equal(notes[0].method,"xanax");
 assert.equal(a.fixture["/user/battlestats"].battlestats.strength.value,statBefore);
 assert.ok(a.requests.every(url=>url.startsWith("https://api.torn.com/v2/")));
 html=panel.children[1].innerHTML;
 assert.match(html,/You marked done/);
 panel.onclick({target:{closest(){return {dataset:{act:"undo-note"}};}}});
 assert.equal(a.storage.getItem("hhj-compact-v1:action-notes"),"[]");
 assert.equal(a.fixture["/user/battlestats"].battlestats.strength.value,statBefore);
});
test("distant hypothetical actions cannot be marked completed before they are due",async()=>{
 const a=setup(true,false,"2026-10-27T09:00:00Z",
 {budget:50000000,stat:"strength",refills:false},7);
 a.fixture["/user/cooldowns"].cooldowns.drug=21600;
 a.fixture["/user/bars"].bars.energy.current=0;
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 const html=panel.children[1].innerHTML;
 assert.match(html,/Record completion when due/);
 assert.ok(!html.includes('data-act="note-done"'));
 panel.onclick({target:{closest(){return {dataset:{act:"note-done"}};}}});
 assert.equal(a.storage.getItem("hhj-compact-v1:action-notes"),null);
});
test("self-reported action notes from a previous session display without claiming API verification",async()=>{
 const seed=[{t:Date.parse("2026-10-27T08:30:00Z")/1000,kind:"TRAIN",
  scheduled:Date.parse("2026-10-27T08:30:00Z")/1000,method:"natural"}];
 const a=setup(false,false,"2026-10-27T09:00:00Z",
 {budget:50000000,stat:"strength"},7,"/index.php",null,null,seed);
 await a.btn.onclick();
 const html=a.document.getElementById("hhj-compact-panel").children[1].innerHTML;
 assert.match(html,/You marked done:.*TRAIN/);
 assert.match(html,/Self-reported, not verified/);
 assert.equal(JSON.parse(a.storage.getItem("hhj-compact-v1:action-notes")).length,1);
});

test("repeated taps on the same scheduled action do not create duplicate confirmations",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
 {budget:50000000,stat:"strength"},7);
 a.fixture["/user/cooldowns"].cooldowns.drug=0;
 a.fixture["/user/bars"].bars.energy.current=150;
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 const tap=()=>panel.onclick({target:{closest(){return {dataset:{act:"note-done"}};}}});
 tap();tap();
 const notes=JSON.parse(a.storage.getItem("hhj-compact-v1:action-notes"));
 assert.equal(notes.length,1);
 assert.equal(typeof notes[0].t,"number");
});
test("generic manual completion never silently marks an energy refill used",async()=>{
 const a=setup(false,false,"2026-10-27T09:00:00Z",
 {budget:50000000,stat:"strength"},7);
 a.fixture["/user/bars"].bars.energy.current=5;
 a.fixture["/user/cooldowns"].cooldowns.drug=72000;
 await a.btn.onclick();
 const panel=a.document.getElementById("hhj-compact-panel");
 assert.match(panel.children[1].innerHTML,/Next recommended:/);
 panel.onclick({target:{closest(){return {dataset:{act:"note-done"}};}}});
 const notes=JSON.parse(a.storage.getItem("hhj-compact-v1:action-notes"));
 assert.equal(notes[0].kind,"REFILL");
 assert.equal(a.storage.getItem("hhj-compact-v1:used-day"),null,
 "The separate refill API/manual override remains authoritative");
});
