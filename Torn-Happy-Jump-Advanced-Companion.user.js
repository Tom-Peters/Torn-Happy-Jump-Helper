// ==UserScript==
// @name         Torn Happy Jump Advanced Companion
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper#companion
// @version      0.9.0
// @description  Read-only perks, book timing, gyms and stat goals for stable HJ 0.7
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function(){
"use strict";
const KEY="###PDA-APIKEY###", API="https://api.torn.com/v2", VER="0.9.0", ID="hhj-advanced-companion";
if(!/^(www\.)?torn\.com$/i.test(location.hostname))return;
const ST=["strength","defense","speed","dexterity"];
const BOOKS={744:["strength","stat"],745:["speed","stat"],746:["defense","stat"],747:["dexterity","stat"],
 757:["all","gym20"],758:["strength","gym30"],759:["defense","gym30"],
 760:["speed","gym30"],761:["dexterity","gym30"],770:["all","happy"],
 773:["all","addiction"],774:["all","regen"],779:["all","cooldown"],
 782:["all","energy"],783:["all","candy"],784:["all","energy"],785:["all","repeat"]};
const fmt=n=>Number.isFinite(n)?Math.round(n).toLocaleString("en-GB"):"—";
const money=n=>Number.isFinite(n)?"$"+fmt(n):"Unverified";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const value=(key,def)=>{try{const x=localStorage.getItem(key);return x===null?def:JSON.parse(x)}catch(_){return def}};
const saved=value("hhj-compact-v1:settings",{}), cfg0={stat:saved.stat||"speed",budget:saved.budget||50000000,bonus:0,weeklyGain:0};
let cfg={...cfg0,...value("hhj-a-companion-settings",{})},data={},errors=[],busy=false,updated=0,tab="today";
const stats=()=>Object.fromEntries(ST.map(k=>[k,+data.stats?.battlestats?.[k]?.value||0]));
const gym=()=>data.gyms?.gyms?.find(g=>+g.id===+data.gym?.gym?.id)||null;
const day=()=>new Date().toISOString().slice(0,10);
function relevant(){
 return Object.entries(data.perks?.perks||{}).flatMap(([source,items])=>
  (Array.isArray(items)?items:[]).filter(x=>typeof x==="string"&&
   /gym|train|energy|happ|drug|xanax|booster|candy|cooldown|refill|erotic.*dvd/i.test(x))
   .map(description=>({source,description})));
}
function mod(){
 let percentage=100+Math.max(0,Math.min(200,+cfg.bonus||0)),applied=[];
 for(const p of relevant()){
  const description=p.description,pct=+(description.match(/(\d+(?:\.\d+)?)\s*%/)||[])[1]||0;
  const scope=description.match(/\b(strength|defen[cs]e|speed|dexterity)\b/i)?.[1]
   ?.toLowerCase().replace("defence","defense");
  if(pct>0&&pct<=200&&/gym.{0,20}gain|gain.{0,20}gym/i.test(description)&&
   !/decreas|reduc|lower|penalty/i.test(description)&&(!scope||scope===cfg.stat)){
   percentage+=pct;applied.push(p.source+": "+description);
  }
 }
 return {factor:percentage/100,applied};
}
function gained(e,h,s,dots,gymE,factor){
 let n=Math.floor(e/gymE),total=0;
 while(n-- >0){
  const increase=Math.max(0,((3.480061091e-7*Math.log(h+250)+3.091619094e-6)*s+
   6.82775184551527e-5*(h+250)-0.0301431777)*dots*gymE*factor);
  total+=increase;s+=increase;h=Math.max(0,h-gymE*0.5);
 }
 return total;
}
function gymEligible(g,s){
 const n=String(g?.name||"").toLowerCase();
 const a=s.strength||0,b=s.speed||0,c=s.defense||0,d=s.dexterity||0;
 if(n.includes("balboas"))return c+d>=1.25*(a+b);
 if(n.includes("frontline"))return a+b>=1.25*(c+d);
 if(n.includes("gym 3000"))return a>=1.25*Math.max(b,c,d);
 if(n.includes("isoyamas"))return c>=1.25*Math.max(a,b,d);
 if(n.includes("total rebound"))return b>=1.25*Math.max(a,c,d);
 if(n==="elites")return d>=1.25*Math.max(a,b,c);
 if(n.includes("sports science"))return false;
 return true;
}
function auditGym(){
 const current=gym(),s=stats()[cfg.stat],E=data.bars?.bars?.energy?.maximum||150;
 const h=data.bars?.bars?.happy?.maximum||5000;
 const statuses=value("hhj-compact-v1:gyms",{});
 if(!current)return [];
 const baseline=gained(E,h,s,+current.modifiers?.[cfg.stat]/10,current.energy_cost||10,mod().factor);
 return (data.gyms?.gyms||[]).filter(x=>x.id!==current.id&&["buy","owned"].includes(statuses[x.id])&&gymEligible(x,stats()))
  .map(x=>{
   const projected=gained(E,h,s,+x.modifiers?.[cfg.stat]/10,x.energy_cost||10,mod().factor);
   return {gym:x,status:statuses[x.id],projected,change:baseline>0?100*(projected/baseline-1):0};
  }).filter(x=>x.change>0.1).sort((a,b)=>b.change-a.change);
}
async function get(path){
 if(KEY.includes("PDA-APIKEY"))throw Error("TornPDA key substitution unavailable");
 const headers={Authorization:"ApiKey "+KEY,Accept:"application/json"};
 const response=typeof PDA_httpGet==="function"?await PDA_httpGet(API+path,headers):
  await window.flutter_inappwebview.callHandler("PDA_httpGet",API+path,headers);
 if(response.status!==200)throw Error("HTTP "+response.status);
 const v=JSON.parse(response.responseText);
 if(v.error)throw Error("Torn API "+v.error.code);
 return v;
}
async function refresh(){
 if(busy)return;
 busy=true;errors=[];data={};show();
 const urls={stats:"/user/battlestats",bars:"/user/bars",gym:"/user/gym",
  gyms:"/torn/gyms",perks:"/user/perks",refills:"/user/refills",travel:"/user/travel"};
 let jobs=Object.entries(urls),cursor=0;
 async function worker(){
  while(cursor<jobs.length){
   const [k,p]=jobs[cursor++];
   try{data[k]=await get(p)}catch(err){errors.push(k+": "+String(err.message))}
  }
 }
 await Promise.all([worker(),worker()]);
 try{
  const books=await get("/user/inventory?cat=Book&limit=250");
  data.books=books.inventory?.items||[];
 }catch(err){errors.push("Book inventory: "+String(err.message))}
 updated=Date.now();busy=false;show();
}
function box(title,body){
 return '<section class="hhja-box"><h3>'+esc(title)+'</h3>'+body+'</section>';
}
function today(){
 const current=gym(),st=stats(),m=mod(),r=data.refills?.refills?.energy;
 const refillUsed=value("hhj-compact-v1:used-day",null)===day()||r===true;
 const refillLabel=refillUsed?"USED":r===false?"AVAILABLE":"UNKNOWN";
 return box("Training overview",!current?"Press Refresh to load training data.":
  '<div class="hhja-row"><span>Selected stat</span><b>'+esc(cfg.stat)+': '+fmt(st[cfg.stat])+'</b></div>'+
  '<div class="hhja-row"><span>Current gym</span><b>'+esc(current.name)+'</b></div>'+
  '<div class="hhja-row"><span>Gym multiplier</span><b>'+(m.factor*100).toFixed(1)+'%</b></div>'+
  '<div class="hhja-row"><span>Daily 30-point refill</span><b>'+refillLabel+'</b></div>'+
  '<p class="hhja-small">Uses the same refill convention as the working HJ: true means used. No game actions are performed.</p>')+
  box("Training improvements",'<div class="hhja-row"><span>Verified superior gyms</span><b>'+
  auditGym().length+'</b></div><div class="hhja-row"><span>Relevant perks</span><b>'+relevant().length+
  '</b></div><div class="hhja-row"><span>Books returned</span><b>'+
  (data.books?.length??"Unavailable")+'</b></div>'+
  '<p class="hhja-small">Choose Gyms, Perks, Books or Goals for details. The original HJ timetable remains in the main dashboard.</p>');
}
function gyms(){
 const current=gym(),all=auditGym();
 let text=box("Current gym",current?
  esc(current.name)+' · '+((current.modifiers?.[cfg.stat]||0)/10).toFixed(1)+
  ' dots for '+esc(cfg.stat):"No current gym data.");
 text+=box("Verified gym improvements",all.length?all.map(x=>
  '<p><b>'+esc(x.gym.name)+'</b> · <b>+'+x.change.toFixed(1)+'%</b> estimated improvement for the same energy session. '+
  (x.status==="buy"?"Previously confirmed unlocked and unpurchased, membership "+money(x.gym.cost):
   "Already owned; switch manually in Torn.")+'</p>').join(""):
  "No superior locally verified eligible gym. The full Torn catalogue is not proof of access; specialist gym restrictions are checked conservatively.");
 text+='<p class="hhja-small">Confirm gyms from Torn → Gym using the regular HJ Gyms tab. The companion reads those local confirmations only.</p>';
 return text;
}
function perks(){
 const rows=relevant(),m=mod();
 return box("Applied gym-gain bonuses",
  '<b>'+Math.round(m.factor*1000)/10+'% total model factor</b>'+
  '<p class="hhja-small">Only positive, matching gym-gain percentages are added. Effective combat-stat merits and unrelated stock bonuses are excluded.</p>'+
  (m.applied.map(x=>'<p>'+esc(x)+'</p>').join("")||"No applicable positive gym-gain bonuses parsed."))+
  box("Other training-related descriptions",rows.length?rows.map(x=>
  '<p><b>'+esc(x.source)+'</b> · '+esc(x.description)+'</p>').join(""):"No training-related perks returned.");
}
function weeklyPace(){
 const panel=document.getElementById("hhj-compact-panel");
 const cards=panel?.querySelectorAll?.(".card")||[];
 for(const card of cards){
  if(card.querySelector?.("h3")?.textContent?.trim()!=="Projected seven-day training")continue;
  const text=card.textContent||"";
  const m=text.match(/\+([\d,]+)\s+(strength|speed|defense|dexterity)/i);
  if(m&&m[2].toLowerCase()===cfg.stat){
   const rate=+m[1].replace(/,/g,"");
   if(rate>0&&Number.isFinite(rate))return {rate,source:"Current regular HJ projection"};
  }
 }
 return {rate:Math.max(0,+cfg.weeklyGain||0),source:"Manual weekly pace in Settings"};
}
function milestone(aim){
 const start=stats()[cfg.stat],weekly=weeklyPace().rate;
 if(start>=aim)return 0;
 if(!(start>0&&weekly>0))return null;
 const g=gym(),e=data.bars?.bars?.energy?.maximum||150,h=data.bars?.bars?.happy?.maximum||5000;
 const dots=(g?.modifiers?.[cfg.stat]||0)/10,gymE=g?.energy_cost||10;
 const base=dots?gained(e,h,start,dots,gymE,mod().factor):0;
 const delta=Math.max(100000,start*0.05);
 const high=dots?gained(e,h,start+delta,dots,gymE,mod().factor):0;
 const slope=base>0?Math.max(0,weekly*(high-base)/(delta*base)):0;
 let v=start;
 for(let n=1;n<=5200;n++){
  v+=Math.max(0,weekly+slope*(v-start));
  if(v>=aim)return n;
 }
 return null;
}
function books(){
 const rows=data.books,weekly=weeklyPace().rate;
 if(!Array.isArray(rows))return box("Book inventory unavailable","Not loaded. No owned books are assumed.");
 const visible=rows.filter(x=>x.amount>0&&!x.faction_owned);
 return box("Book advice",visible.length?visible.map(b=>{
  const meta=BOOKS[b.id],stat=meta?.[0],kind=meta?.[1],current=stats()[stat]||0;
  let advice="Review the book's effect; save until a period when you can use it consistently.";
  if(kind==="stat")advice="SAVE until 200,000,000 "+stat+
   " for its full +10,000,000 cap. If used now the theoretical bonus is +"+fmt(Math.min(10000000,current*0.05))+
   ". Current time-to-target estimate using configured weekly gains: "+
   (weekly>0?(stat===cfg.stat?(milestone(200000000)===null?"beyond model":fmt(milestone(200000000))+" weeks"):fmt(Math.ceil(Math.max(0,200000000-current)/weekly))+" weeks"):"not available")+".";
  else if(kind?.startsWith("gym"))advice="SAVE for a high-output 31-day "+(stat==="all"?"gym":stat)+
   " training month. At your configured weekly training pace, the illustrative 31-day extra is +"+
   (weekly>0?fmt(weekly*31/7*(kind==="gym20"?0.2:0.3)):"unknown")+".";
  return '<p><b>'+esc(b.name||"Book #"+b.id)+'</b><br>'+esc(advice)+
   '<br><span class="hhja-small">Inventory copies may already have been read. Usability cannot be confirmed.</span></p>';
 }).join(""):"No books reported. A missing category is not assumed to be empty.");
}
function goals(){
 const current=stats()[cfg.stat],pace=weeklyPace(),weekly=pace.rate;
 const goals=[50000000,100000000,200000000,1000000000];
 return box("Future "+cfg.stat+" targets",
  '<p class="hhja-small">A scenario at your manually configured weekly gain rate. This does not assume future gyms, books, events or inflation.</p>'+
  goals.map(x=>'<div class="hhja-row"><b>'+fmt(x)+'</b><span>'+
   (current>=x?"Reached":weekly>0?(milestone(x)===null?"Beyond model":fmt(milestone(x))+" weeks"):"Set weekly pace in Settings")+
   '</span></div>').join(""));
}
function settings(){
 return box("Advanced companion settings",
  '<label>Focus stat <select id="hhja-stat">'+ST.map(s=>
   '<option value="'+s+'"'+(cfg.stat===s?' selected':'')+'>'+s+'</option>').join("")+'</select></label>'+
  '<p><label>Manual additional gym bonus % <input id="hhja-bonus" type="number" value="'+cfg.bonus+'" min="0" max="200"></label></p>'+
  '<p><label>Fallback weekly gain for future dates <input id="hhja-week" type="number" value="'+cfg.weeklyGain+'" min="0"></label></p>'+
  '<button type="button" data-act="save">Save companion settings</button>'+
  '<p class="hhja-small">The original HJ simulator remains the source for your action timetable. No credentials, inventory or stat values are uploaded by the companion.</p>');
}
const panel=document.createElement("div");panel.id=ID;panel.style.cssText=
 "display:none;position:fixed;inset:10% 8px 9% 8px;z-index:2147483647;max-width:580px;margin:auto;border:2px solid #5ae5d0;border-radius:14px;background:#0d1b29;color:white;font:14px/1.45 system-ui;overflow:hidden;box-shadow:0 8px 40px #000d";
const header=document.createElement("div");
header.style.cssText="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:12px;background:#173148";
header.innerHTML='<b>⚡ HJ Advanced Companion</b><span>v'+VER+'</span><button type="button" data-act="close">✕</button>';
const body=document.createElement("div");body.style.cssText="height:calc(100% - 65px);padding:12px;overflow:auto";
panel.append(header,body);
const css=document.createElement("style");css.id=ID+"-css";
css.textContent="#"+ID+" button,#"+ID+" select,#"+ID+" input{background:#29465f;border:1px solid #59778b;border-radius:8px;padding:8px;color:white;font:inherit}#"+ID+" .hhja-nav{display:flex;gap:5px;overflow:auto;position:sticky;top:0;background:#0d1b29;padding:4px 0}#"+ID+" .hhja-nav button{flex:0 0 auto}#"+ID+" .hhja-nav button.on{background:#078b82}#"+ID+" .hhja-box{margin:10px 0;padding:12px;border:1px solid #456678;border-radius:12px;background:#1a3043}#"+ID+" .hhja-box h3{margin:0 0 10px;font-size:16px}#"+ID+" .hhja-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 0;flex-wrap:wrap}#"+ID+" .hhja-small{opacity:.7;font-size:12px}#"+ID+" p{margin:8px 0}";
const tabs=[["today","Overview"],["gyms","Gyms"],["perks","Perks"],["books","Books"],["goals","Goals"],["settings","Settings"]];
function show(){
 body.innerHTML='<nav class="hhja-nav">'+tabs.map(([key,title])=>
  '<button type="button" data-tab="'+key+'"'+(tab===key?' class="on"':'')+'>'+title+'</button>').join("")+
 '</nav><div class="hhja-row"><button type="button" data-act="refresh"'+(busy?' disabled':'')+'>'+
 (busy?"Refreshing…":"↻ Refresh relevant Torn data")+'</button><small>'+
 (updated?new Date(updated).toLocaleTimeString():"Not loaded")+'</small></div>'+
 (tab==="today"?today():tab==="gyms"?gyms():tab==="perks"?perks():tab==="books"?books():
  tab==="goals"?goals():settings())+
 (errors.length?box("Unavailable sources",errors.map(e=>'<p class="hhja-small">'+esc(e)+'</p>').join("")):"")+
 '<p class="hhja-small">IamEEKY · Read-only training analysis · '+VER+'</p>';
}
function attach(){
 const base=document.getElementById("hhj-compact-panel");
 if(!base||!document.body)return;
 if(!document.getElementById(panel.id))document.body.appendChild(panel);
 if(!document.getElementById(css.id))(document.head||document.body).appendChild(css);
 const baseHeader=base.firstElementChild||base.children?.[0];
 if(baseHeader&&!document.getElementById(ID+"-open")){
  const button=document.createElement("button");
  button.id=ID+"-open";button.textContent="Advanced";button.type="button";
  button.style.cssText="background:#087f77;color:white;border:1px solid #7ae9d8;border-radius:8px;padding:7px 9px;font:700 12px system-ui";
  button.addEventListener("click",()=>{panel.style.display="block";show()});
  baseHeader.appendChild(button);
 }
}
panel.addEventListener("click",event=>{
 const t=event.target.closest("button");if(!t)return;
 if(t.dataset.tab){tab=t.dataset.tab;show();return}
 if(t.dataset.act==="close"){panel.style.display="none";return}
 if(t.dataset.act==="refresh"){refresh();return}
 if(t.dataset.act==="save"){
  cfg.stat=body.querySelector("#hhja-stat")?.value||"speed";
  cfg.bonus=Math.max(0,Math.min(200,+body.querySelector("#hhja-bonus")?.value||0));
  cfg.weeklyGain=Math.max(0,+body.querySelector("#hhja-week")?.value||0);
  try{localStorage.setItem("hhj-a-companion-settings",JSON.stringify(cfg))}catch(_){}
  show();
 }
});
attach();document.addEventListener?.("DOMContentLoaded",attach,{once:true});
window.setInterval(attach,3000);
if(typeof window!=="undefined")window.__HHJAdvancedCompanion=VER;
})();
