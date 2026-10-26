// ==UserScript==
// @name         Torn Happy Jump Helper
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      0.7.0
// @description  Compact CSP-safe TornPDA gym, Happy jump and book planner (read only)
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function(){
"use strict";
const KEY="###PDA-APIKEY###", BASE="https://api.torn.com/v2", VER="0.7.0";
if(!/^(www\.)?torn\.com$/.test(location.hostname))return;
const N="hhj-compact-v1",ST=["strength","defense","speed","dexterity"], ITEMS={
 xanax:206,ecstasy:197,lollipop:310,dvd:366
};
const fmt=n=>Number.isFinite(n)?Math.round(n).toLocaleString("en-US"):"—";
const cash=n=>Number.isFinite(n)?"$"+fmt(n):"Price unknown";
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const utc=t=>new Date(t*1000).toISOString().slice(0,16).replace("T"," ")+" UTC";
const day=t=>new Date(t*1000).toISOString().slice(0,10);
const get=(k,alt)=>{try{const x=localStorage.getItem(N+":"+k);return x===null?alt:JSON.parse(x)}catch(_){return alt}};
const put=(k,v)=>{try{localStorage.setItem(N+":"+k,JSON.stringify(v))}catch(_){}};
const CFG={budget:50000000,stat:"speed",mode:"training",refills:true,horizon:24,theme:"dark",gymBonus:0};
let cfg={...CFG,...get("settings",{})},data={},prices={},inv={},errs=[],busy=false,updated=0,tab="today",opened=false,lastPlan=null,selectedMethod="auto",history=get("history",[]),verified=get("gyms",{}),start=Date.now()/1000;
const refillStatus=(raw,t=Date.now()/1000)=>get("used-day",null)===day(t)?
 "used":raw===true?"used":raw===false?"ready":"unknown";
const refill=()=>refillStatus(data.refills?.refills?.energy);
const gym=()=>{const all=data.gyms?.gyms||[];return all.find(x=>+x.id===+data.gym?.gym?.id)||null};
const stats=()=>Object.fromEntries(ST.map(k=>[k,+data.stats?.battlestats?.[k]?.value||0]));
const energy=()=>data.bars?.bars?.energy||{}, happy=()=>data.bars?.bars?.happy||{};
const cd=()=>data.cooldowns?.cooldowns||{};
const perkRows=()=>Object.entries(data.perks?.perks||{}).flatMap(([type,entries])=>
 (Array.isArray(entries)?entries:[]).filter(x=>typeof x==="string"&&/gym|training|energy|happy|happiness|drug|cooldown|booster|candy|refill|xanax|ecstasy|DVD/i.test(x)).map(description=>({type,description})));
const bonus=stat=>perkRows().reduce((n,r)=>{
 const d=r.description, p=+(d.match(/(\d+(?:\.\d+)?)\s*%/)||[])[1];
 const scoped=d.match(/\b(strength|speed|defen[cs]e|dexterity)\b/i)?.[1]?.toLowerCase().replace("defence","defense");
 return n+(p>0&&p<=200&&/gym.{0,12}gains?|gains?.{0,12}gym/i.test(d)&&!/decreas|reduc|lower|penalty/i.test(d)&&(!scoped||scoped===stat)?p/100:0);
},1+Math.max(0,+cfg.gymBonus||0)/100);
function gain(e,h,s,dots,cost=10,m=1){
 let steps=Math.floor(e/cost),sum=0,ss=s,hh=h;
 while(steps-->0){const g=Math.max(0,((3.480061091e-7*Math.log(hh+250)+3.091619094e-6)*ss+
  6.82775184551527e-5*(hh+250)-0.0301431777)*dots*cost*m);
  sum+=g;ss+=g;hh=Math.max(0,hh-cost*0.5)}
 return sum;
}
function basket(item,n,stock=0){
 const buy=Math.max(0,n-stock);if(!buy)return 0;
 const rows=[...(prices[item]||[])].filter(x=>x.price>0&&x.amount>0).sort((a,b)=>a.price-b.price);
 let remaining=buy,total=0;for(const r of rows){const take=Math.min(remaining,r.amount);remaining-=take;total+=take*r.price;if(!remaining)return total}
 return Infinity;
}
function loadInput(){
 const g=gym(),b=stats(),k=cfg.stat,bar=energy(),h=happy();
 if(!g||!(b[k]>0)||!(+g.modifiers?.[k]>0)||!(h.maximum>0))return null;
 return {gym:g,stat:k,value:b[k],dots:g.modifiers[k]/10,cost:g.energy_cost||10,
 energy:bar.current||0,maxE:bar.maximum||150,regen:bar.interval||120,inc:bar.increment||1,
 happy:h.current||h.maximum,maxH:h.maximum,drug:cd().drug||0,booster:cd().booster||0,
 m:bonus(k),refill:refill(),now:Date.now()/1000};
}
function simulate(method,input,hours=168){
 const p=input,now=Math.ceil(p.now/60)*60,until=now+3600*hours,cap=p.maxE;
 let e=p.energy,h=p.happy,stat=p.value,nextDrug=now+p.drug,spent=0,gainTotal=0,trainedE=0,regenLost=0,drugCount=0,jumps=0;
 const events=[],count={xanax:0,ecstasy:0,lollipop:0,dvd:0,points:0},day0=day(now);
 let firstRefill=p.refill!=="ready",yday="",refilled=false,bank=0,stack=0,boosterCD=p.booster,cost=0,available=true;
 const add=(t,kind,detail,q=0,g=0)=>events.push({t,kind,detail,q,g});
 const bookCost=(name,n)=>name==="points"?basket("points",n,inv.points||0):basket(name,n,inv[name]||0);
 const afford=(name,num=1)=>{const newTotal=bookCost(name,count[name]+num),old=bookCost(name,count[name]);return Number.isFinite(newTotal)&&cost+newTotal-old<=cfg.budget};
 const use=(name,n)=>{const old=bookCost(name,count[name]);count[name]+=n;const next=bookCost(name,count[name]);cost+=next-old;};
 const train=(t,label)=>{const used=Math.floor(e/p.cost)*p.cost;if(!used)return;
  const g=gain(used,h,stat,p.dots,p.cost,p.m);e-=used;h=Math.max(0,h-used*.5);stat+=g;gainTotal+=g;trainedE+=used;add(t,"TRAIN",label+" · "+used+" E · +"+fmt(g)+" "+p.stat,used,g)};
 for(let t=now;t<until;t+=60){
  const d=day(t);
  if(d!==yday){yday=d;refilled=d===day0?firstRefill:false}
  if(t>now){bank+=60;boosterCD=Math.max(0,boosterCD-60);
   while(bank>=p.regen){bank-=p.regen;if(e<cap)e=Math.min(cap,e+p.inc);else regenLost+=p.inc}
  }
  if(t%900===0){h=h>p.maxH?p.maxH:Math.min(p.maxH,h+5)}
  if(method==="natural"||method==="xanax"){
   if(method==="xanax"&&t>=nextDrug&&e<=750&&afford("xanax")){use("xanax",1);drugCount++;e=Math.min(1000,e+250);h+=75;
     nextDrug=t+7*3600;add(t,"XANAX","Take Xanax manually; estimated +250 E",250);train(t,"Train after Xanax")}
   else if(e>=cap)train(t,"Train naturally regenerated energy");
   if(cfg.refills&&!refilled&&e<cap&&afford("points",30)&&t%86400>=12*3600){
    if(e>=p.cost)train(t,"Train before available daily point refill");
    const restored=cap-e;use("points",30);refilled=true;e=cap;
    add(t,"REFILL","Spend 30 points manually; restore "+restored+" E up to "+cap,restored);train(t,"Train refilled energy");
   }
  }else if(method==="happy"){
    // Conservative single happy jump; do not assert a reliable 7-day repeat.
    if(jumps>0)continue;
    if(stack<3&&t>=nextDrug&&e<=750&&afford("xanax")){use("xanax",1);stack++;e=Math.min(1000,e+250);h+=75;
      nextDrug=t+7*3600;add(t,"XANAX","Stack Xanax "+stack+"/3",250)}
    if(stack===3&&t>=nextDrug&&boosterCD===0&&t%900===60&&afford("lollipop",4)&&afford("ecstasy")){
      use("lollipop",4);use("ecstasy",1);h=Math.min(99999,2*(h+4*25));jumps++;
      add(t,"JUMP","Use 4 lollipops, then Ecstasy, then train immediately · estimated Happy "+fmt(h));
      train(t,"Happy-jump gym training");
    }
  }
 }
 return {method,events,gain:gainTotal,cost,energy:trainedE,lost:regenLost,drugs:drugCount,jumps,count,
   start:now,end:until,affordable:cost<=cfg.budget&&Number.isFinite(cost),
   note:method==="happy"?"Single prepared Happy jump only; not a reliable repeated weekly forecast":
   "Assumes every manual action happens on time and future Xanax cooldowns are 7 hours"};
}
function plans(){const p=loadInput();if(!p)return [];return ["natural","xanax","happy"].map(k=>simulate(k,p));}
function activePlan(){
 const list=lastPlan||[];if(!list.length)return null;
 if(selectedMethod!=="auto")return list.find(x=>x.method===selectedMethod)||list[0];
 return list.filter(x=>x.method!=="happy"&&x.affordable).sort((a,b)=>b.gain-a.gain)[0]||list[0];
}
function projection(s,g){return [50000000,100000000,200000000,1000000000].map(goal=>{
 let value=s,weeks=0;while(value<goal&&weeks<5200){value+=Math.max(0,g*(1+Math.max(0,value-s)*0.00000002));weeks++}
 return {goal,weeks:value>=goal?weeks:null,spend:value>=goal?weeks*(activePlan()?.cost||0):null};
})}
async function api(path){
 if(KEY.includes("PDA-APIKEY"))throw Error("TornPDA did not substitute its API key");
 const url=BASE+path,headers={Authorization:"ApiKey "+KEY,Accept:"application/json"};
 const r=typeof PDA_httpGet==="function"?await PDA_httpGet(url,headers):
  await window.flutter_inappwebview.callHandler("PDA_httpGet",url,headers);
 if(r.status!==200)throw Error("HTTP "+r.status);
 const body=JSON.parse(r.responseText);if(body.error)throw Error("Torn error "+body.error.code);
 return body;
}
async function refresh(){
 if(busy)return;busy=true;errs=[];draw();
 const paths={bars:"/user/bars",cooldowns:"/user/cooldowns",stats:"/user/battlestats",
  gym:"/user/gym",gyms:"/torn/gyms",refills:"/user/refills",perks:"/user/perks"};
 for(const [k,id] of Object.entries(ITEMS))paths["m_"+k]="/market/"+id+"/itemmarket?limit=100";
 paths.m_points="/market/pointsmarket";
 let next={};inv={};prices={};const jobs=Object.entries(paths);
 let index=0;
 const worker=async()=>{while(index<jobs.length){const [name,path]=jobs[index++];try{
   const v=await api(path);if(name.startsWith("m_"))prices[name.slice(2)]=name==="m_points"?
     (v.pointsmarket||[]).map(x=>({price:x.cost,amount:x.quantity})):
     v.itemmarket?.listings||[];else next[name]=v;
 }catch(err){errs.push(name+": "+String(err.message).slice(0,70))}}};
 await Promise.all([worker(),worker(),worker()]);
 data=next;
 for(const cat of ["Drug","Candy","Book","Booster"]){try{
   const v=await api("/user/inventory?cat="+cat+"&limit=250");
   if(cat==="Drug"||cat==="Candy"||cat==="Booster")for(const row of v.inventory?.items||[]){
    for(const [name,id] of Object.entries(ITEMS))if(row.id===id&&!row.faction_owned)inv[name]=(inv[name]||0)+(row.amount||0)}
   if(cat==="Book")data.books=v.inventory?.items||[];
  }catch(e){errs.push("Inventory "+cat+": "+String(e.message).slice(0,60))}}
 updated=Date.now();const st=stats();
 if(Object.values(st).some(x=>x>0)){const today=day(Date.now()/1000),last=history[history.length-1];
   if(!last||last.d!==today){history.push({d:today,s:st});history=history.slice(-90);put("history",history)}}
 lastPlan=plans();busy=false;draw();
}
function save(){put("settings",cfg);lastPlan=plans();draw()}
const ui=document.createElement("div");ui.id="hhj-compact-panel";ui.style.cssText="display:none;position:fixed;z-index:2147483646;inset:12% 8px 9% 8px;max-width:580px;margin:auto;background:#0b1726;border:2px solid #52d9c5;border-radius:15px;color:white;font:14px/1.4 system-ui;overflow:hidden;box-shadow:0 8px 50px #000c";
const content=document.createElement("div");content.style.cssText="height:calc(100% - 72px);overflow:auto;padding:12px";
const header=document.createElement("div");header.style.cssText="display:flex;justify-content:space-between;align-items:center;padding:12px;background:#182b42";
header.innerHTML="<b>⚡ HAPPY JUMP HELPER</b><span>READ ONLY · v"+VER+"</span><button data-act='close'>✕</button>";
ui.append(header,content);
const button=document.createElement("button");button.id="hhj-launch";button.textContent="HJ ◉";button.type="button";
button.style.cssText="position:fixed!important;top:43%!important;right:6px!important;z-index:2147483647!important;background:#067f77!important;color:#fff!important;border:2px solid #adfff0!important;border-radius:25px!important;padding:12px 15px!important;font:800 15px system-ui!important;box-shadow:0 6px 18px #000b!important;display:block!important;visibility:visible!important;opacity:1!important";
const css=document.createElement("style");css.textContent="#hhj-compact-panel button,#hhj-compact-panel select,#hhj-compact-panel input{background:#223a55;color:white;border:1px solid #52748d;border-radius:8px;padding:8px;font:inherit}#hhj-compact-panel button.on{background:#087e74;border-color:#4be6cf}#hhj-compact-panel button:disabled{opacity:.45}#hhj-compact-panel .tabs{display:flex;overflow-x:auto;gap:5px;padding-bottom:8px}#hhj-compact-panel .card{background:#172a40;border:1px solid #426078;border-radius:12px;margin:9px 0;padding:12px}#hhj-compact-panel .hero{border-color:#58decc}#hhj-compact-panel .row{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:6px 0;flex-wrap:wrap}#hhj-compact-panel .sub{opacity:.75;font-size:12px}#hhj-compact-panel h3{margin:6px 0 12px;font-size:16px}#hhj-compact-panel .good{color:#86f1d7}#hhj-compact-panel .warn{color:#ffd598}";
function mount(){if(!document.body)return;for(const el of [button,ui])if(!document.getElementById(el.id))document.body.appendChild(el);
 if(!document.getElementById("hhj-mini-css")){css.id="hhj-mini-css";(document.head||document.body).appendChild(css)}}
function controls(title,active,choices,act){return '<div class="row"><b>'+esc(title)+'</b></div><div class="row">'+choices.map(([k,v])=>'<button data-act="'+act+'" data-val="'+esc(k)+'"'+(k===active?' class="on"':'')+'>'+esc(v)+'</button>').join("")+"</div>"}
function card(t,b,cls=""){return '<section class="card '+cls+'"><h3>'+esc(t)+'</h3>'+b+"</section>"}
function today(){
 const p=loadInput(),a=activePlan(),next=a?.events.find(x=>x.t>=Date.now()/1000),
     current=stats();
 let out=controls("Training method",cfg.mode,[["training","Regular"],["happy","Happy jump"]],"mode");
 out+='<div class="row"><button data-act="refresh"'+(busy?' disabled':'')+'>↻ '+(busy?'Refreshing':'Refresh Torn data')+'</button><span class="sub">'+(updated?'Updated '+new Date(updated).toLocaleTimeString():'Not loaded')+'</span></div>';
 if(errs.length)out+=card("API diagnostics",errs.map(x=>"<p class='sub'>"+esc(x)+"</p>").join(""));
 if(!p)return out+card("Waiting for live data","Refresh Torn data to load your current gym, battle stats, energy and cooldowns.");
 out+=card("Next manual action",next?
  "<div class='row'><b>"+esc(next.kind)+"</b><b>"+utc(next.t)+"</b></div><p>"+esc(next.detail)+"</p><p class='sub'>Actual Torn values take priority. This is a conditional forecast.</p><button data-act='tab' data-val='plan'>View plan</button>":
  "No remaining actions are scheduled. Refresh to replan.","hero");
 out+=card("Daily point refill",'<div class="row"><b>'+(refill()==="used"?"USED":refill()==="ready"?"AVAILABLE":"UNKNOWN")+
  '</b><button data-act="mark-used">Mark used today</button></div><p class="sub">API true means used; missing values never count as ready. Any manual mark expires at UTC midnight.</p>');
 if(a)out+=card("Projected seven-day training","<div class='row'><b>"+esc(a.method)+"</b><b class='good'>+"+fmt(a.gain)+" "+esc(cfg.stat)+"</b></div>"+
  "<p>"+cash(a.cost)+" budgeted · "+fmt(a.energy)+" energy trained · "+a.count.xanax+" Xanax</p><p class='sub'>"+esc(a.note)+"</p>");
 out+=card("Live snapshot",'<div class="row"><span>Energy</span><b>'+fmt(p.energy)+"/"+fmt(p.maxE)+'</b></div>'+
  '<div class="row"><span>Happy</span><b>'+fmt(p.happy)+"/"+fmt(p.maxH)+'</b></div>'+
  '<div class="row"><span>Drug cooldown</span><b>'+fmt(p.drug/60)+' min</b></div>'+
  '<div class="row"><span>Booster cooldown</span><b>'+fmt(p.booster/60)+' min</b></div>'+
  '<div class="row"><span>Active gym</span><b>'+esc(p.gym.name)+'</b></div>');
 out+=controls("Focus stat",cfg.stat,ST.map(k=>[k,k[0].toUpperCase()+k.slice(1)]),"stat");
 return out;
}
function compare(){const list=lastPlan||plans();return '<h3>Compare scenarios</h3><p class="sub">Weekly natural/Xanax projections versus ONE prepared Happy jump (not an equivalent weekly-repeat forecast). Market prices can be incomplete.</p>'+
 list.map(x=>card(x.method.toUpperCase(),'<div class="row"><b>+'+fmt(x.gain)+" "+esc(cfg.stat)+'</b><b>'+cash(x.cost)+
 '</b></div><p class="sub">'+esc(x.note)+'</p><p class="sub">Energy '+fmt(x.energy)+' · Xanax '+x.count.xanax+
  ' · jumps '+x.jumps+'</p><button data-act="choose" data-val="'+x.method+'">View this method</button>')).join("")}
function plan(){
 const p=activePlan(),h=+cfg.horizon||24;if(!p)return card("No plan","Refresh live data first.");
 const until=Date.now()/1000+h*3600,events=p.events.filter(x=>x.t>=Date.now()/1000&&x.t<until);
 return controls("Time window",String(h),[["24","Next 24h"],["168","7 days"]],"horizon")+
  card("Forecast details","<b>+"+fmt(p.gain)+" "+esc(cfg.stat)+"</b> · "+cash(p.cost)+" in seven days"+
   "<p class='sub'>"+esc(p.note)+"</p>")+
  (events.length?events.slice(0,80).map(x=>card(utc(x.t),"["+x.kind+"] "+esc(x.detail))).join(""):
   card("No actions","No remaining actions in this window."))+
  (events.length>80?"<p class='sub'>Showing first 80 of "+events.length+" actions.</p>":"");
}
function gyms(){
 const g=gym(),all=data.gyms?.gyms||[],k=cfg.stat;let html=g?
 card("Active gym",esc(g.name)+" · "+((g.modifiers?.[k]||0)/10).toFixed(1)+" dots "+esc(k)):
 card("Gym unavailable","Refresh first");
 const eligible=all.filter(x=>x.id!==g?.id&&["owned","buy"].includes(verified[x.id])&&
  (x.modifiers?.[k]||0)>(g?.modifiers?.[k]||0)).sort((a,b)=>b.modifiers[k]-a.modifiers[k]);
 html+=card("Better verified gyms",eligible.length?eligible.map(x=>"<p><b>"+esc(x.name)+"</b> · "+(x.modifiers[k]/10).toFixed(1)+
  " dots · "+(verified[x.id]==="buy"?"Unlocked but not purchased ("+cash(x.cost)+")":"Owned")+"</p>").join(""):
  "No better verified gym. Unseen or locked gyms are deliberately excluded.");
 if(/\/gym\.php$/.test(location.pathname||"")&&all.length)html+=card("Confirm visible gym",
  '<p class="sub">Only confirm gyms that Torn currently shows unlocked on this page.</p><select id="hhj-gymlist">'+
  all.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+
  '</select><button data-act="gym-owned">Owned</button><button data-act="gym-buy">Can buy</button>');
 else html+=card("Verify gym access","Open Torn's Gym page, reopen HJ, and confirm visible gym memberships. The full catalogue alone does not prove an unlock.");
 return html;
}
function perks(){
 const rows=perkRows(),books=data.books||[];
 return card("Training effects",rows.length?rows.map(x=>"<p><b>"+esc(x.type)+"</b> · "+esc(x.description)+"</p>").join(""):"No relevant perks loaded.")+
 card("Gym books and future use",books.filter(x=>x.id>=744&&x.id<=787&&x.amount>0).map(x=>{
  const stat={744:"strength",745:"speed",746:"defense",747:"dexterity"}[x.id];
  return "<p><b>"+esc(x.name||"Book #"+x.id)+"</b> · "+(stat?
   "Save to 200m "+stat+" for the full +10m cap":
   "Save until a high-output 31-day training block")+
   ". <span class='sub'>Used copies can remain visible: usability unverified.</span></p>"
 }).join("")||"Book inventory unavailable or no books returned.");
}
function progress(){
 const st=stats(),a=activePlan(),first=history[0],last=history[history.length-1];
 return card("Base battle stats",ST.map(k=>"<div class='row'><span>"+k+"</span><b>"+fmt(st[k])+"</b></div>").join(""))+
 card("Observed changes",first&&last&&first!==last?
 ST.map(k=>"<div class='row'><span>"+k+"</span><b>+"+fmt(last.s[k]-first.s[k])+"</b></div>").join(""):
 "Refresh on a later day to see actual changes. Stored locally only.")+
 card("Long-term estimates",a?projection(st[cfg.stat],a.gain).map(x=>
 "<div class='row'><b>"+fmt(x.goal)+"</b><span>"+(x.weeks===null?"Outside model":x.weeks+" weeks")+"</span></div>").join(""):
 "Refresh for targets.")+
 '<button data-act="clearhistory">Clear local history</button>';
}
function settings(){return card("Planner settings",
  '<label>Weekly budget <input id="hhj-budget" type="number" min="0" value="'+cfg.budget+'"></label>'+
  '<p><label><input id="hhj-refills" type="checkbox"'+(cfg.refills?" checked":"")+'> Compare daily points refills</label></p>'+
  '<p><label>Manual extra gym bonus % <input id="hhj-gymbonus" type="number" min="0" max="200" value="'+cfg.gymBonus+'"></label></p>'+
  '<button data-act="save">Save settings</button><p class="sub">A budget is a preference, not verified cash on hand. Stats and history stay on this device.</p>')}
const labels=[["today","Today"],["compare","Compare"],["plan","Plan"],["gyms","Gyms"],["perks","Perks & books"],["progress","Progress"],["settings","Settings"]];
function draw(){
 if(!opened)return;
 content.innerHTML='<nav class="tabs">'+labels.map(([k,v])=>
 '<button class="'+(k===tab?'on':'')+'" data-act="tab" data-val="'+k+'">'+v+'</button>').join("")+
 '</nav>'+(tab==="today"?today():tab==="compare"?compare():tab==="plan"?plan():
 tab==="gyms"?gyms():tab==="perks"?perks():tab==="progress"?progress():settings())+
 '<p class="sub">IamEEKY · Forecast only · No automated Torn actions · v'+VER+'</p>';
}
button.addEventListener("click",()=>{opened=!opened;ui.style.display=opened?"block":"none";if(opened)draw()});
ui.addEventListener("click",event=>{
 const b=event.target.closest("button");if(!b)return;
 const act=b.dataset.act,val=b.dataset.val;
 if(act==="close"){opened=false;ui.style.display="none"}
 if(act==="refresh")refresh();
 if(act==="tab"){tab=val;draw()}
 if(act==="stat"){cfg.stat=val;selectedMethod="auto";save()}
 if(act==="mode"){cfg.mode=val;selectedMethod=val==="happy"?"happy":"auto";save()}
 if(act==="choose"){selectedMethod=val;tab="plan";draw()}
 if(act==="horizon"){cfg.horizon=+val;save()}
 if(act==="mark-used"){put("used-day",day(Date.now()/1000));lastPlan=plans();draw()}
 if(act==="clearhistory"){history=[];put("history",[]);draw()}
 if(act==="gym-owned"||act==="gym-buy"){const id=+content.querySelector("#hhj-gymlist")?.value;
  if(id&&/\/gym\.php$/.test(location.pathname||"")){verified[id]=act==="gym-owned"?"owned":"buy";put("gyms",verified);draw()}}
 if(act==="save"){
  cfg.budget=Math.max(0,+content.querySelector("#hhj-budget")?.value||0);
  cfg.refills=!!content.querySelector("#hhj-refills")?.checked;
  cfg.gymBonus=Math.min(200,Math.max(0,+content.querySelector("#hhj-gymbonus")?.value||0));save()}
});
mount();document.addEventListener?.("DOMContentLoaded",mount,{once:true});
window.setInterval(()=>{mount();},5000);
if(typeof window!=="undefined"){window.__TornHappyJumpLoaded=VER;window.__TornHappyJumpStage={version:VER,phase:"mounted"};}
})();
