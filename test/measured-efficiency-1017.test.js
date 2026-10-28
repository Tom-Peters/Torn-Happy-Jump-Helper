"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.10.17-compat.user.js");
function boot(respond){
  const code=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","fixture-test-key");
  const store=new Map(),calls=[];
  function element(tag){return {tag,style:{},children:[],dataset:{},innerHTML:"",textContent:"",
    append(...xs){this.children.push(...xs)},appendChild(x){this.children.push(x)},
    addEventListener(event,fn){this["on"+event]=fn},setAttribute(){},
    get id(){return this._id},set id(value){this._id=value}};}
  const body=element("body"),head=element("head");
  const document={body,head,createElement:element,addEventListener(){},
    getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
  const localStorage={getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,String(v))}};
  const window={setInterval(){}};
  const instrumented=code.replace(/\}\)\(\);\s*$/, "window.__autoTests={readLog,scanGym,cgCard,gCh,getLogs:()=>al,getStatus:()=>ls,setFocus:stat=>{cfg.stat=stat},setDays:v=>{sp=v},wSe,dAc,aFl,oldDue,setWatch:x=>{watch=x},setRefills:x=>{data.refills={refills:{energy:x}}},mCard};})();");
  assert.notEqual(instrumented,code);
  const PDA_httpGet=async (url,headers)=>{calls.push({url,headers});const data=respond(url);
    return {status:200,responseText:JSON.stringify(data)}};
  new Function("document","location","window","localStorage","PDA_httpGet",instrumented)(
    document,{hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,PDA_httpGet);
  return {core:window.__autoTests,document,window,store,calls};
}
const now=Math.floor(Date.now()/1000);
const sample={id:"gym-train-1",timestamp:now-60,log:5301,data:{stat:"speed",stat_gain:10000,energy_used:150}};
test("phone-compatible automatic-log build retains launcher and no paste field",()=>{
  const src=fs.readFileSync(FILE,"utf8");
  assert.ok(src.length<60000,"keep working phone size threshold");
  assert.match(src,/@version\s+0\.10\.17/);
  assert.doesNotMatch(src,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
  assert.match(src,/\/user\/log\?limit=100/);
  assert.ok(!src.includes('id="hhj-copiedlog"'));
  const a=boot(()=>({log:[]}));
  assert.ok(a.document.getElementById("hhj-launch"));
  assert.ok(a.document.getElementById("hhj-compact-panel"));
  assert.equal(a.window.__TornHappyJumpLoaded,"0.10.17");
});
test("automatically finds +10000 stat gain from read-only Torn gym log",async()=>{
  const a=boot(()=>({log:[sample],_metadata:{links:{next:null}}}));
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,1);
  assert.equal(a.core.getLogs()[0].amount,10000);
  assert.match(a.core.cgCard(),/10,000/);
  assert.equal(a.calls.length,1);
  assert.ok(a.calls[0].url.includes("log=5301"));
  assert.equal(a.calls[0].headers.Authorization,"ApiKey fixture-test-key");
  assert.ok(a.store.has("hhj-compact-v1:gym-api-logs"));
});
test("repeat scans do not double count the same gym event",async()=>{
  const a=boot(()=>({log:[sample]}));
  await a.core.scanGym(true);
  await a.core.scanGym(true);
  assert.equal(a.core.getLogs().length,1);
  assert.match(a.core.cgCard(),/7 days:<\/b> \+10,000/);
});
test("no extra requests when reopened within one minute",async()=>{
  const a=boot(()=>({log:[sample]}));
  await a.core.scanGym();
  await a.core.scanGym();
  assert.equal(a.calls.length,1);
});
test("no access to personal logs reports permission issue without fabricating gains",async()=>{
  const a=boot(()=>({error:{code:7,error:"Incorrect permissions"}}));
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,0);
  assert.match(a.core.getStatus(),/Log scan failed/);
  assert.match(a.core.getStatus(),/Torn error 7/);
});
test("unknown log format does not create imaginary stat gains",async()=>{
  const a=boot(()=>({log:[{id:"new-shape",timestamp:now-60,data:{energy_used:150}}]}));
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,0);
  assert.match(a.core.getStatus(),/without stat data/);
});
test("follows next-page links only on the Torn user-log endpoint",async()=>{
  const next="https://api.torn.com/v2/user/log?log=5301&limit=100&from=1700000000";
  const a=boot(u=>u.includes("from=1700000000")
    ? {log:[{id:"two",timestamp:now-30,data:{stat:"strength",gain:2500}}]}
    : {log:[sample],_metadata:{links:{next}}});
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,2);
  assert.equal(a.calls.length,2);
  const b=boot(()=>({log:[sample],_metadata:{links:{next:"https://evil.example/steal"}}}));
  await b.core.scanGym();
  assert.equal(b.calls.length,1,"never follow non-Torn pagination URLs");
  assert.match(b.core.getStatus(),/Invalid log page/);
});

test("empty log 5301 response falls back to gym category 125",async()=>{
  const a=boot(url=>url.includes("cat=125")?{log:[sample]}:{log:[]});
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,1);
  assert.equal(a.core.getLogs()[0].amount,10000);
  assert.match(a.core.getStatus(),/5301:0/);
  assert.match(a.core.getStatus(),/Gym category:1/);
  assert.equal(a.calls.length,2);
});
test("empty gym category falls back to bounded unfiltered diagnostics",async()=>{
  const example={...sample,details:{id:5301,title:"Gym train",category:"Gym"}};
  const a=boot(url=>url.includes("log=5301")||url.includes("cat=125")?{log:[]}:{log:[example]});
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,1);
  assert.equal(a.calls.length,3);
  assert.match(a.core.getStatus(),/sample:1/);
});
test("unknown gym log format reports field names without leaking values",async()=>{
  const a=boot(url=>url.includes("cat=125")?{log:[{id:"x",timestamp:now-60,data:{a_new_field:"private sample contents",value:999}}]}:{log:[]});
  await a.core.scanGym();
  assert.match(a.core.getStatus(),/without stat data/);
  assert.match(a.core.getStatus(),/a_new_field/);
  assert.doesNotMatch(a.core.getStatus(),/private sample contents/);
  assert.equal(a.core.getLogs().length,0);
});
test("existing recognized entries do not trigger category fallback on later scans",async()=>{
  const a=boot(()=>({log:[sample]}));
  await a.core.scanGym(true);
  await a.core.scanGym(true);
  assert.equal(a.calls.length,2);
  assert.equal(a.core.getLogs().length,1);
});

test("real Torn Gym category structure reads strength_increased, trains and energy_used",async()=>{
  const actual={id:"gym-real-001",timestamp:now-100,details:{id:5300,category:"Gym",title:"Gym train"},data:{
    trains:3,energy_used:30,strength_before:1412069,strength_after:1452966,
    strength_increased:40897,happy_used:15,gym:"Premier Fitness"}};
  const a=boot(url=>url.includes("cat=125")?{log:[actual]}:{log:[]});
  await a.core.scanGym();
  assert.equal(a.core.getLogs().length,1);
  assert.deepEqual(a.core.getLogs().map(x=>({stat:x.stat,amount:x.amount,trains:x.trains,energy:x.energy})),
    [{stat:"strength",amount:40897,trains:3,energy:30}]);
  a.core.setFocus("strength");
  assert.match(a.core.cgCard(),/40,897/);
  assert.match(a.core.cgCard(),/3 trains/);
  assert.match(a.core.getStatus(),/Gym category:1/);
  assert.doesNotMatch(a.core.getStatus(),/unknown/);
});
test("all four stats are detected by their *_increased field names",()=>{
  const a=boot(()=>({log:[]}));
  const training=(stat,value,i)=>({id:"gym_"+i,timestamp:now-1,
    data:{trains:1,energy_used:10,[stat+"_before"]:1000,[stat+"_after"]:1000+value,[stat+"_increased"]:value}});
  for(const [i,stat] of ["strength","defense","speed","dexterity"].entries()){
    const x=a.core.readLog(training(stat,2500+i,i));
    assert.equal(x?.stat,stat);
    assert.equal(x?.amount,2500+i);
  }
});
test("54 real-format gym events are parsed once, never multiplied by repeated refresh",async()=>{
  const entries=Array.from({length:54},(_,i)=>({
    id:"gym-event-"+i,timestamp:now-i*60,details:{id:5300,category:"Gym",title:"Gym train"},
    data:{trains:2,energy_used:20,strength_before:1400000+i*1500,
      strength_after:1401500+i*1500,strength_increased:1500,happy_used:10,gym:"Example gym"}}));
  const a=boot(url=>url.includes("cat=125")?{log:entries}:{log:[]});
  await a.core.scanGym(true);
  assert.equal(a.core.getLogs().length,54);
  assert.match(a.core.getStatus(),/54 new/);
  await a.core.scanGym(true);
  assert.equal(a.core.getLogs().length,54);
  assert.match(a.core.getStatus(),/0 new/);
  a.core.setFocus("strength");
  assert.match(a.core.cgCard(),/81,000/);
});
test("no fabricated events for zero or negative gains, or ambiguous multiple positive stats",()=>{
  const a=boot(()=>({log:[]}));
  for(const data of [{strength_increased:0},{strength_increased:-100},
    {strength_increased:500,speed_increased:250}]){
    assert.equal(a.core.readLog({id:"bad",timestamp:now,data}),null);
  }
});

test("7-day graph uses gym log gains and does not compare incompatible forecasts",async()=>{
  const example={id:"strength-sample",timestamp:now-120,data:{strength_increased:10000,trains:5,energy_used:50}};
  const a=boot(url=>url.includes("cat=125")?{log:[example]}:{log:[]});
  await a.core.scanGym(true);
  a.core.setFocus("strength");
  const html=a.core.gCh();
  assert.match(html,/verified gym gains/);
  assert.match(html,/10,000/);
  assert.match(html,/5 trains/);
  assert.match(html,/50 E/);
  assert.doesNotMatch(html,/Scheduled \(matched\)/);
  assert.doesNotMatch(html,/Observed \(matched\)/);
});
test("no gym entry is shown as no record, never falsely recorded as zero gain",()=>{
  const a=boot(()=>({log:[]}));
  a.core.setFocus("strength");
  const html=a.core.gCh();
  assert.match(html,/No gym record/);
  assert.match(html,/no record does not prove zero gains/);
  assert.doesNotMatch(html,/0 sessions/);
});
test("seven day chart filters to the focused stat and respects daily visibility control",async()=>{
  const entries=[
    {id:"strength",timestamp:now-60,data:{strength_increased:20000,trains:10,energy_used:100}},
    {id:"speed",timestamp:now-30,data:{speed_increased:9000,trains:3,energy_used:30}}
  ];
  const a=boot(url=>url.includes("cat=125")?{log:entries}:{log:[]});
  await a.core.scanGym(true);
  a.core.setFocus("strength");a.core.setDays(false);
  const html=a.core.gCh();
  assert.match(html,/20,000/);
  assert.doesNotMatch(html,/9,000/);
  assert.doesNotMatch(html,/No gym record/);
  a.core.setFocus("speed");
  assert.match(a.core.gCh(),/9,000/);
});
test("mobile HJ styles retain legitimate justify-content declarations",()=>{
 const source=fs.readFileSync(FILE,"utf8");
 assert.match(source,/justify-content:space-between/);
 assert.match(source,/justify-content:flex-start/);
 assert.doesNotMatch(source,/justify-ct/);
});

test("confirmed Torn training in the action panel uses actual gym logs, not inferred snapshot gains",async()=>{
 const t=Math.floor(Date.now()/1000),entry={id:"latest-gym",timestamp:t-45,data:{strength_increased:3452,trains:2,energy_used:20}};
 const a=boot(u=>u.includes("cat=125")?{log:[entry]}:{log:[]});
 await a.core.scanGym(true);
 const html=a.core.aFl({method:"natural",events:[{kind:"XANAX",t:t+3600,detail:"Take Xanax manually"}]});
 assert.match(html,/Latest confirmed training/);
 assert.match(html,/3,452 strength/);
 assert.match(html,/2 trains/);
 assert.match(html,/Next recommended:<\/b> XANAX/);
 assert.doesNotMatch(html,/Likely training/);
});
test("gym logs near a planned training time prevent a false missed-action alert",async()=>{
 const t=Math.floor(Date.now()/1000),entry={id:"matched-gym",timestamp:t-900,data:{strength_increased:10000,trains:6}};
 const a=boot(u=>u.includes("cat=125")?{log:[entry]}:{log:[]});
 await a.core.scanGym(true);
 a.core.setFocus("strength");
 const ev={kind:"TRAIN",t:t-900,stat:"strength",method:"natural",detail:"Train manually"};
 assert.equal(a.core.wSe(ev),true);
 a.core.setWatch(ev);
 assert.equal(a.core.oldDue({method:"natural"}),null);
});
test("off-schedule gym trains are recognised but do not complete an unrelated scheduled step",async()=>{
 const t=Math.floor(Date.now()/1000),entry={id:"unscheduled",timestamp:t-1800,data:{strength_increased:10000,trains:6}};
 const a=boot(u=>u.includes("cat=125")?{log:[entry]}:{log:[]});
 await a.core.scanGym(true);
 a.core.setFocus("strength");
 const ev={kind:"TRAIN",t:t,stat:"strength",method:"natural",detail:"Train manually"};
 assert.equal(a.core.wSe(ev),false);
 assert.equal(a.core.dAc({method:"natural",events:[ev]},t)?.kind,"TRAIN");
 assert.match(a.core.aFl({method:"natural",events:[ev]}),/10,000 strength/);
});
test("used daily refill hides only today's refill, never tomorrow's",()=>{
 const a=boot(()=>({log:[]}));
 a.core.setRefills(true);
 const t=Math.floor(Date.now()/1000),today=Date.parse(new Date(t*1000).toISOString().slice(0,10)+"T12:00:00Z")/1000;
 assert.equal(a.core.wSe({kind:"REFILL",t:today}),true);
 assert.equal(a.core.wSe({kind:"REFILL",t:today+86400}),false);
});
test("a scheduled train with no matching log can still be confirmed manually",()=>{
 const a=boot(()=>({log:[]}));
 a.core.setFocus("strength");
 const t=Math.floor(Date.now()/1000);
 const ev={kind:"TRAIN",t,stat:"strength",method:"natural",detail:"Train normally"};
 assert.match(a.core.aFl({method:"natural",events:[ev]}),/Confirm TRAIN/);
});

test("measured efficiency separates the 25 E gym from 10 E training",async()=>{
 const t=Math.floor(Date.now()/1000),pairs=[
 [2,3452,50],[10,17147,250],[6,10188,150],[6,10110,150],[1,1679,25],
 [78,48099,780],[2,24000,50]];
 const rows=pairs.map(([trains,strength_increased,energy_used],i)=>({
 id:"gym-"+i,timestamp:t-i*60,data:{trains,strength_increased,energy_used}}));
 const a=boot(u=>u.includes("cat=125")?{log:rows}:{log:[]});
 await a.core.scanGym(true);a.core.setFocus("strength");
 const mk=cost=>a.core.mCard({cost,happy:3400,value:1452966,dots:1,m:1});
 const h=mk(25);
 assert.match(h,/Measured training efficiency/);
 assert.match(h,/1,7[0-9]{2}/,"25E sessions have typical gain around 1700 per train");
 assert.match(h,/5 comparable sessions/);
 assert.match(h,/1 outliers excluded/);
 assert.match(h,/25 E\/train/);
 const old=mk(10);
 assert.match(old,/Need 3 sessions at 10 E\/train/);
 assert.doesNotMatch(old,/1,7[0-9]{2}/);
});
test("no comparable logs does not claim invented measured efficiency",()=>{
 const a=boot(()=>({log:[]}));
 a.core.setFocus("strength");
 assert.match(a.core.mCard({cost:25,happy:3400,value:1000000,dots:1,m:1}),/Need 3 sessions/);
 assert.equal(a.core.mCard(null),"");
});
test("boosted outliers do not move the median away from ordinary training",async()=>{
 const t=Math.floor(Date.now()/1000);
 const rows=[[1000,1],[1050,1],[1100,1],[80000,1]].map(([gain,trains],i)=>({
 id:"outlier-"+i,timestamp:t-i*120,data:{strength_increased:gain,trains,energy_used:25}}));
 const a=boot(u=>u.includes("cat=125")?{log:rows}:{log:[]});
 await a.core.scanGym(true);a.core.setFocus("strength");
 const h=a.core.mCard({cost:25,happy:3000,value:1000000,dots:1,m:1});
 assert.match(h,/\+1,050/);
 assert.match(h,/3 comparable sessions/);
 assert.match(h,/1 outliers excluded/);
});
