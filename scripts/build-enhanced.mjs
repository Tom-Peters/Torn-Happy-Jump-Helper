import {readFileSync,writeFileSync} from "node:fs";
import {minify} from "terser";
const compact=readFileSync("Torn-Happy-Jump-Helper.user.js","utf8");
const full=readFileSync("Torn-Happy-Jump-Helper.full.js","utf8");
const outputName="Torn-Happy-Jump-Helper-Enhanced.user.js";
const meta=compact.match(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
if(!meta)throw Error("Missing TornPDA metadata");
const header=meta[0].replace("@name         Torn Happy Jump Helper","@name         Torn Happy Jump Helper Enhanced Preview")
  .replace("@version      0.7.1","@version      0.9.0")
  .replace(/@updateURL\s+[^\n]+/,"@updateURL    https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/"+outputName)
  .replace(/@downloadURL\s+[^\n]+/,"@downloadURL  https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/"+outputName);
let body=compact.slice(meta[0].length).replaceAll("0.7.1","0.9.0");
const extract=name=>{
  const start=full.indexOf("  function "+name+"(");
  if(start<0)throw Error("Missing original "+name);
  const tail=full.slice(start+3);
  const after=tail.search(/\n  (?:function|async function|const|let|class) [A-Za-z_$]/);
  if(after<0)throw Error("Cannot find end "+name);
  return full.slice(start,start+3+after)+"\n";
};
const decl=name=>{
  const start=full.indexOf("  const "+name+" =");
  if(start<0)throw Error("Missing original constant "+name);
  const tail=full.slice(start+3),after=tail.search(/\n  (?:function|async function|const|let|class) [A-Za-z_$]/);
  if(after<0)throw Error("No end "+name);
  return full.slice(start,start+3+after)+"\n";
};
const selected=["marketCost","gainTrain","gainRegular","baseline","strategies","schedule","score",
 "auditPerks","bookAdvice","gymCatalog","gymEligibility","gymSuggestions","targetProjection"];
let engine="const clamp=(v,a,b)=>Math.max(a,Math.min(b,Number.isFinite(+v)?+v:a));\n"+
 decl("ITEMS").replace(/const ITEMS\s*=/,"const ADV_ITEMS =");
for(const n of selected)engine+=extract(n);
engine=engine.replaceAll("ITEMS[","ADV_ITEMS[");
engine+=decl("BOOK_INFO");
const adapter=String.raw`
function actualInput(){
 const p=loadInput();if(!p)return null;
 const market={},owned={...inv};
 for(const key of Object.keys(ADV_ITEMS))market[key]={listings:prices[key]||[]};
 market.points={listings:prices.points||[]};
 return {now:p.now,stat:p.value,statName:p.stat,dots:p.dots,mod:p.m,
  gymCost:p.cost,maxE:p.maxE,baseHappy:p.maxH,currentEnergy:p.energy,currentHappy:p.happy,
  drugCooldown:p.drug,boosterCooldown:p.booster,
  regenInterval:p.regen,regenIncrement:p.inc,regenHour:p.inc*3600/p.regen,
  happyLoss:0.5,budget:cfg.budget,books:market,owned,
  inventoryReady:true,refillReady:p.refill==="ready",refillMode:cfg.refills?"both":"no",
  refill:cfg.refills,maxJumpsDaily:2,boosterCap:24,dvdHappy:2500,candyPercent:0,
  boosterReduction:0,consumableReduction:0,ignoreHappyReset:false,candyBookMultiplier:1,
  returnHours:0,available:true,xanaxHours:7};
}
function plans(){
 const p=actualInput();if(!p)return [];
 const scored=score(p);
 return [...scored.baseline,...scored.options].map(x=>{
  const t=x.timeline;
  return {method:x.id,name:x.name,kind:x.jumps>0?"happy":"training",
   events:(t?.events||[]).map(e=>({t:e.time,kind:e.kind.toUpperCase(),detail:e.detail,q:e.qty,g:e.gain})),
   gain:t?.gain||0,cost:t?.cost??NaN,energy:t?.energyTrained||0,lost:t?.lostRegen||0,
   drugs:t?.counts?.xanax||0,jumps:t?.jumps||0,count:t?.counts||{},
   start:t?.start,end:t?.end,affordable:!!x.known&&x.cost<=cfg.budget,
   note:x.jumps>0?(x.name+" · "+x.jumps+" projected jumps/week; cooldown assumptions may vary"):
   (x.name+" · regular training over seven days"),raw:x};
 });
}
function activePlan(){
 const arr=lastPlan||[];
 if(selectedMethod!=="auto")return arr.find(x=>x.method===selectedMethod)||null;
 const eligible=arr.filter(x=>x.affordable&&(cfg.mode==="happy"?x.kind==="happy":x.kind==="training"));
 return eligible.sort((x,y)=>y.gain-x.gain)[0]||null;
}
`;
const start=body.indexOf("function simulate(");
const end=body.indexOf("function projection(",start);
if(start<0||end<0)throw Error("Cannot replace simple planner");
body=body.slice(0,start)+engine+adapter+body.slice(end);
body=body.replace('const ITEMS={\n xanax:206,ecstasy:197,lollipop:310,dvd:366\n};',
 'const ITEMS={xanax:206,ecstasy:197,lollipop:310,chocolate:35,bigChocolate:36,dvd:366};');
body=body.replace("const bonus=stat=>perkRows().reduce(", "const compactUnusedBonus=stat=>perkRows().reduce(");
const bStart=body.indexOf("const compactUnusedBonus="),bEnd=body.indexOf("function gain(",bStart);
if(bStart<0||bEnd<0)throw Error("Cannot replace bonus");
body=body.slice(0,bStart)+"const bonus=stat=>auditPerks(data.perks,stat).factor+Math.max(0,+cfg.gymBonus||0)/100;\n"+body.slice(bEnd);
body=body.replace('if(act==="mode"){cfg.mode=val;selectedMethod=val==="happy"?"happy":"auto";save()}',
 'if(act==="mode"){cfg.mode=val;selectedMethod="auto";save()}');
body=body.replace('"<p>"+cash(a.cost)+" budgeted · "+fmt(a.energy)+" energy trained · "+a.count.xanax+" Xanax</p>',
 '"<p>"+cash(a.cost)+" budgeted · "+fmt(a.energy)+" energy trained · "+(a.count.xanax||0)+" Xanax · "+a.jumps+" Happy jumps</p>');
body=body.replace('card(x.method.toUpperCase(),', 'card(x.name||x.method.toUpperCase(),');
body=body.replace('const list=lastPlan||plans();return', 'const list=(lastPlan||plans()).filter(x=>x.affordable).sort((a,b)=>b.gain-a.gain).slice(0,18);return');
body=body.replace('"Weekly natural/Xanax projections versus ONE prepared Happy jump (not an equivalent weekly-repeat forecast). Market prices can be incomplete."',
 '"Accurate seven-day forecasts for natural, Xanax and prepared Happy-jump strategies; prices and future cooldowns are conditional."');
body=body.replace('const eligible=all.filter(x=>x.id!==g?.id&&["owned","buy"].includes(verified[x.id])&&\n  (x.modifiers?.[k]||0)>(g?.modifiers?.[k]||0)).sort((a,b)=>b.modifiers[k]-a.modifiers[k]);',
 'const eligible=gymSuggestions(gymCatalog(data.gyms),g?.id,verified,k,stats(),{energy:energy().maximum,stat:stats()[k],happy:happy().current,mod:bonus(k)}).filter(x=>x.status!=="active"&&x.improvement>0);');
body=body.replace('eligible.map(x=>"<p><b>"+esc(x.name)+"</b> · "+(x.modifiers[k]/10).toFixed(1)+\n  " dots · "+(verified[x.id]==="buy"?"Unlocked but not purchased ("+cash(x.cost)+")":"Owned")+"</p>")',
 'eligible.map(x=>"<p><b>"+esc(x.name)+"</b> · "+x.dots.toFixed(1)+" dots · +"+x.improvement.toFixed(1)+"% projected gains · "+(x.status==="buy"?"Unlocked but unpurchased ("+cash(x.cost)+")":"Owned")+"</p>")');
body=body.replace('const rows=perkRows(),books=data.books||[];', 'const rows=perkRows(),books=bookAdvice(data.books||[],stats(),activePlan()?.gain||0,cfg.stat);');
const bookStart=body.indexOf('card("Gym books and future use"'),bookEnd=body.indexOf('\n}',bookStart);
if(bookStart<0||bookEnd<0)throw Error("Book UI bounds");
body=body.slice(0,bookStart)+'card("Gym books and future use",books.map(x=>"<p><b>"+esc(x.name)+"</b> · "+esc(x.recommendation)+"<br><span class=\\"sub\\">"+esc(x.ownership)+"</span></p>").join("")||"Book inventory unavailable or no books returned.");'+body.slice(bookEnd);
body=body.replace('function projection(s,g){', 'function projection(s,g){');
body=body.replace('const labels=[', 'const labels=[');
body=body.replace('if(typeof window!=="undefined"){window.__TornHappyJumpLoaded=VER;', 'if(typeof window!=="undefined"){window.__TornHappyJumpLoaded=VER;');
const result=await minify(body,{compress:{passes:2,defaults:true,unsafe:false},mangle:{toplevel:false},format:{comments:false},toplevel:false});
if(result.error||!result.code)throw result.error||Error("No built output");
const output=header+"\n"+result.code+"\n";
if(/\bnew\s+Function\s*\(|\beval\s*\(/.test(output))throw Error("No unsafe eval permitted");
if(!output.includes("###PDA-APIKEY###"))throw Error("Missing PDA API token");
writeFileSync(outputName,output);
console.log("Enhanced: "+output.length+" bytes; original compact "+compact.length+"; advanced engine "+full.length);
