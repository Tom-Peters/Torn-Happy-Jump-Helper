// ==UserScript==
// @name         Torn Happy Jump Helper
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      0.7.2
// @description  Compact CSP-safe TornPDA gym, Happy jump and book planner (read only)
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js
// @downloadURL  https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js
// @grant        none
// ==/UserScript==
(function(){
"use strict";
const KEY="###PDA-APIKEY###", BASE="https://api.torn.com/v2", VER="0.7.2";
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
const CFG={budget:10000000,stat:"speed",mode:"training",refills:true,horizon:24,theme:"dark",gymBonus:0,ownedPoints:0,manualPrices:{}};
let cfg={...CFG,...get("settings",{})},data={},prices={},inv={},errs=[],busy=false,updated=0,tab="today",opened=false,lastPlan=null,selectedMethod=cfg.mode==="happy"?"happy":"auto",history=get("history",[]),verified=get("gyms",{}),start=Date.now()/1000;
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
 const rows=[...(prices[item]||[])].filter(x=>Number.isFinite(+x.price)&&+x.price>0&&+x.amount>0).sort((a,b)=>a.price-b.price);
 let remaining=buy,total=0;for(const r of rows){const take=Math.min(remaining,r.amount);remaining-=take;total+=take*r.price;if(!remaining)return total}
 const manual=+cfg.manualPrices?.[item];return manual>0&&Number.isFinite(manual)?total+remaining*manual:Infinity;
}
function owned(name){return name==="points"?Math.max(0,+cfg.ownedPoints||0):Math.max(0,+inv[name]||0)}
function needs(plan){return Object.entries(plan?.count||{}).filter(([,num])=>num>0).map(([name,num])=>({name,num,have:owned(name),missing:Math.max(0,num-owned(name)),price:basket(name,num,owned(name))}));}
function gymEligible(g,b){
 const n=String(g?.name||"").toLowerCase(),a=b.strength||0,v=b.speed||0,c=b.defense||0,d=b.dexterity||0;
 if(n.includes("balboas"))return c+d>=1.25*(a+v);
 if(n.includes("frontline"))return a+v>=1.25*(c+d);
 if(n.includes("gym 3000"))return a>=1.25*Math.max(v,c,d);
 if(n.includes("isoyamas"))return c>=1.25*Math.max(a,v,d);
 if(n.includes("total rebound"))return v>=1.25*Math.max(a,c,d);
 if(n==="elites")return d>=1.25*Math.max(a,v,c);
 if(n.includes("sports science"))return false;
 return true;
}
function sessionGain(g,k,e,h,b){return gain(e,h,b[k],(+g.modifiers?.[k]||0)/10,g.energy_cost||10,bonus(k));}
function statAdvice(){
 const b=stats(),g=gym(),e=energy().maximum||150,h=happy().maximum||5000;
 if(!g||!ST.every(k=>b[k]>0))return null;
 const baseline=ST.map(k=>({stat:k,current:b[k],gain:sessionGain(g,k,e,h,b)}));
 return {balance:[...baseline].sort((x,y)=>x.current-y.current)[0],value:[...baseline].sort((x,y)=>y.gain-x.gain)[0]};
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
 const bookCost=(name,n)=>basket(name,n,owned(name));
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
    if(stack===3&&t>=nextDrug&&boosterCD===0&&t%900===60&&afford("lollipop",4)&&afford("ecstasy")&&cost+Math.max(0,bookCost("lollipop",count.lollipop+4)-bookCost("lollipop",count.lollipop))+Math.max(0,bookCost("ecstasy",count.ecstasy+1)-bookCost("ecstasy",count.ecstasy))<=cfg.budget){
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
 try{lastPlan=plans()}catch(e){lastPlan=null;errs.push("Planner: "+String(e.message).slice(0,90))}busy=false;draw();
}
function save(){put("settings",cfg);try{lastPlan=plans()}catch(e){lastPlan=null;errs.push("Planner: "+String(e.message).slice(0,90))}draw()}
const ui=document.createElement("div");ui.id="hhj-compact-panel";ui.style.cssText="display:none;position:fixed;z-index:2147483646;inset:12% 8px 9% 8px;max-width:580px;margin:auto;background:#0b1726;border:2px solid #52d9c5;border-radius:15px;color:white;font:14px/1.4 system-ui;overflow:hidden;box-shadow:0 8px 50px #000c";
const content=document.createElement("div");content.style.cssText="height:calc(100% - 60px);overflow:auto;padding:10px;overscroll-behavior:contain";
const header=document.createElement("div");header.style.cssText="display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px;background:#182b42";
header.innerHTML="<b>⚡ HAPPY JUMP HELPER</b><span>READ ONLY · v"+VER+"</span><button data-act='close'>✕</button>";
ui.append(header,content);
const button=document.createElement("button");button.id="hhj-launch";button.textContent="HJ ◉";button.type="button";
button.style.cssText="position:fixed!important;top:43%!important;right:6px!important;z-index:2147483647!important;background:#067f77!important;color:#fff!important;border:2px solid #adfff0!important;border-radius:25px!important;padding:12px 15px!important;font:800 15px system-ui!important;box-shadow:0 6px 18px #000b!important;display:block!important;visibility:visible!important;opacity:1!important";
const launcherStyle=button.style.cssText;
function showLauncher(visible){button.style.cssText=launcherStyle.replace("display:block!important","display:"+(visible?"block":"none")+"!important")}
const css=document.createElement("style");css.textContent="#hhj-compact-panel button,#hhj-compact-panel select,#hhj-compact-panel input{background:#223a55;color:white;border:1px solid #52748d;border-radius:8px;padding:8px;font:inherit}#hhj-compact-panel button.on{background:#087e74;border-color:#4be6cf}#hhj-compact-panel button:disabled{opacity:.45}#hhj-compact-panel .tabs{display:flex;overflow-x:auto;gap:6px;padding:3px 0 9px;position:sticky;top:0;z-index:2;background:#0b1726;scrollbar-width:none;overscroll-behavior-x:contain}#hhj-compact-panel .tabs button{flex:0 0 auto;white-space:nowrap;min-height:39px;padding:8px 12px}#hhj-compact-panel .card{background:#172a40;border:1px solid #426078;border-radius:12px;margin:9px 0;padding:12px}#hhj-compact-panel .hero{border-color:#58decc}#hhj-compact-panel .row{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:6px 0;flex-wrap:wrap}#hhj-compact-panel .choices{justify-content:flex-start;gap:8px}#hhj-compact-panel .choices button{min-width:90px}#hhj-compact-panel .sub{opacity:.75;font-size:12px}#hhj-compact-panel h3{margin:6px 0 12px;font-size:16px}#hhj-compact-panel .good{color:#86f1d7}#hhj-compact-panel .warn{color:#ffd598}";
function mount(){if(!document.body)return;for(const el of [button,ui])if(!document.getElementById(el.id))document.body.appendChild(el);
 if(!document.getElementById("hhj-mini-css")){css.id="hhj-mini-css";(document.head||document.body).appendChild(css)}}
function controls(title,active,choices,act){return '<div class="row"><b>'+esc(title)+'</b></div><div class="row choices">'+choices.map(([k,v])=>'<button data-act="'+act+'" data-val="'+esc(k)+'"'+(k===active?' class="on"':'')+'>'+esc(v)+'</button>').join("")+"</div>"}
function card(t,b,cls=""){return '<section class="card '+cls+'"><h3>'+esc(t)+'</h3>'+b+"</section>"}
function recommendation(){
 const input=loadInput(),regular=(lastPlan||[]).filter(x=>x.method!=="happy"&&x.affordable&&x.gain>0)
   .sort((a,b)=>b.gain-a.gain),jump=(lastPlan||[]).find(x=>x.method==="happy");
 if(!input)return card("Training recommendation","Refresh live data to compare options.");
 let out=regular.length?'<p><b>Best regular 7-day plan:</b> '+esc(regular[0].method)+
  ' · +'+fmt(regular[0].gain)+' '+esc(input.stat)+' · '+cash(regular[0].cost)+
  '</p><button data-act="choose" data-val="'+esc(regular[0].method)+'">Show regular schedule</button>':
  '<p class="warn">Regular plan not fully priced or not possible within budget. Check Supplies.</p>';
 if(jump?.jumps)out+='<p><b>One prepared Happy jump:</b> +'+fmt(jump.gain)+' '+esc(input.stat)+
  ' · '+cash(jump.cost)+'</p><button data-act="choose" data-val="happy">Show Happy jump actions</button>';
 else out+='<p class="warn">Happy jump unavailable with the current energy, cooldown, priced supplies or budget. Review Supplies before planning a jump.</p>';
 out+='<p class="sub">These are different time horizons: regular = seven days, Happy jump = one preparation and train session. A Happy jump is not an automatic repeatable weekly gain.</p>';
 return card("What should I do?",out,"hero");
}
function supplies(){
 const list=lastPlan||plans(),chosen=list.find(x=>x.method===selectedMethod)||
  list.find(x=>x.method==="xanax")||list[0];
 let out=controls("Supply plan",selectedMethod==="auto"?"xanax":selectedMethod,
  [["natural","Natural"],["xanax","Xanax"],["happy","Happy jump"]],"choose-supply");
 if(!chosen)return out+card("Supplies unavailable","Refresh gym, stats and market data first.");
 const rows=needs(chosen),missing=rows.filter(x=>x.missing>0&&!Number.isFinite(x.price));
 out+=card("Forecast basket",'<p><b>'+esc(chosen.method.toUpperCase())+'</b> · '+fmt(chosen.energy)+
  ' E trained · '+(Number.isFinite(chosen.cost)?cash(chosen.cost):"Price incomplete")+
  ' against '+cash(cfg.budget)+' budget</p>'+
  (rows.length?rows.map(x=>'<div class="row"><span>'+esc(x.name)+' × '+fmt(x.num)+
   ' <small>(owned '+fmt(x.have)+', need '+fmt(x.missing)+')</small></span><b>'+
   (Number.isFinite(x.price)?cash(x.price):"Price unavailable")+'</b></div>').join(""):
   '<p>No items forecast for this scenario.</p>')+
   (missing.length?'<p class="warn">Unknown market prices: '+esc(missing.map(x=>x.name).join(", "))+
    '. No zero-cost assumptions; enter a manual price in Settings or refresh markets.</p>':
    '<p class="sub">Cost is a purchasing estimate. Prices and inventory may be cached; owned points must be entered manually.</p>'));
 out+=card("Source health",'<p>'+esc(errs.length?errs.join(" · "):"No API errors reported at last refresh.")+'</p>');
 return out;
}
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
 const refillState=refill(),marked=get("used-day",null)===day(Date.now()/1000);
 out+=card("Daily point refill",'<div class="row"><b>'+(refillState==="used"?"USED":refillState==="ready"?"AVAILABLE":"UNKNOWN")+
  '</b>'+(refillState==="used"?(marked?'<button data-act="clear-refill">Clear manual mark</button>':'<span class="sub">Next reset 00:00 UTC</span>'):
  '<button data-act="mark-used">Mark used today</button>')+
  '</div><p class="sub">'+(refillState==="used"?"No further refill is scheduled today. ":
  "Check Torn before spending points. ")+
  'API true means used; missing values never count as ready. Manual marks expire at UTC midnight.</p>');
 out+=recommendation();
 const advice=statAdvice();
 if(advice)out+=card("Choose a stat",'<p><b>Balance your stats:</b> '+esc(advice.balance.stat)+' ('+fmt(advice.balance.current)+')</p><button data-act="stat" data-val="'+esc(advice.balance.stat)+'">Focus lowest stat</button>'+
 '<p><b>Max gain in current gym:</b> '+esc(advice.value.stat)+' (+'+fmt(advice.value.gain)+' per full energy bar)</p><button data-act="stat" data-val="'+esc(advice.value.stat)+'">Focus max-gain stat</button><p class="sub">These are separate goal strategies; the current focus remains your choice.</p>');
 if(a)out+=card("Projected seven-day training","<div class='row'><b>"+esc(a.method)+"</b><b class='good'>+"+fmt(a.gain)+" "+esc(cfg.stat)+"</b></div>"+
  "<p>"+cash(a.cost)+" budgeted · "+fmt(a.energy)+" energy trained · "+a.count.xanax+" Xanax</p><p class='sub'>"+esc(a.note)+"</p>");
 out+='<div class="row"><button data-act="tab" data-val="supplies">Open shopping list and price diagnostics</button></div>';
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
 const g=gym(),all=data.gyms?.gyms||[],k=cfg.stat,b=stats(),e=energy().maximum||150,h=happy().maximum||5000;
 let html=g?card("Current gym",esc(g.name)+" · "+((g.modifiers?.[k]||0)/10).toFixed(1)+" dots "+esc(k)):
 card("Gym unavailable","Refresh first.");
 const baseline=g?sessionGain(g,k,e,h,b):0;
 const eligible=all.filter(x=>x.id!==g?.id&&["owned","buy"].includes(verified[x.id])&&gymEligible(x,b))
  .map(x=>({gym:x,change:baseline>0?100*(sessionGain(x,k,e,h,b)/baseline-1):0}))
  .filter(x=>Number.isFinite(x.change)&&x.change>0.1).sort((a,b)=>b.change-a.change);
 html+=card("Better verified gyms",eligible.length?eligible.map(x=>"<p><b>"+esc(x.gym.name)+"</b> · <b>+"+
  x.change.toFixed(1)+"% estimated gains</b> per same energy · "+(verified[x.gym.id]==="buy"?
   "Unlocked but not purchased ("+cash(x.gym.cost)+")":"Owned; switch manually")+"</p>").join(""):
  "No better eligible, confirmed-access gym for this stat. Locked and unseen gyms are excluded.");
 if(/\/gym\.php$/.test(location.pathname||"")&&all.length){
  // Only offer names actually present in the visible Torn gym page; the catalogue
  // alone cannot establish that a specialist or paid gym is unlocked.
  const visibleText=String(document.body?.innerText||"").replace(String(ui.innerText||""),"");
  const visible=all.filter(x=>String(x.name||"").length>3&&
   visibleText.toLowerCase().includes(x.name.toLowerCase())&&!verified[x.id]);
  html+=card("Confirm a gym shown on this page",visible.length?
   '<p class="sub">Confirm only gyms you can currently access in Torn. A matching name in the page does not prove it is unlocked.</p><select id="hhj-gymlist">'+
   visible.map(x=>'<option value="'+x.id+'">'+esc(x.name)+'</option>').join("")+
   '</select><button data-act="gym-owned">Owned</button><button data-act="gym-buy">Unlocked, not purchased</button>':
   "No unconfirmed gyms were detected from this page. Never confirm a locked or unavailable membership.");
 }else html+=card("Verify gym access","Open Torn’s Gym page and confirm memberships that are shown as available. This helper will not recommend unseen/locked gyms.");
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
  '<p><label>Points already owned <input id="hhj-points" type="number" min="0" value="'+(+cfg.ownedPoints||0)+'"></label></p>'+
  '<p class="sub">Optional manual unit prices, used only when live market listings cannot cover your basket:</p>'+
  ["points","xanax","ecstasy","lollipop","dvd"].map(k=>'<p><label>'+esc(k)+
   ' price <input data-price="'+k+'" type="number" min="0" value="'+(+cfg.manualPrices?.[k]||0)+'"></label></p>').join("")+
  '<button data-act="save">Save settings</button><p class="sub">Your $10m default budget is editable. Owned points and manual prices are local assumptions, not live Torn balances or guaranteed offers.</p>')}
const labels=[["today","Today"],["compare","Compare"],["plan","Schedule"],["supplies","Supplies"],["gyms","Gyms"],["perks","Perks & books"],["progress","Progress"],["settings","Settings"]];
function draw(){
 if(!opened)return;
 try{content.innerHTML='<nav class="tabs">'+labels.map(([k,v])=>
 '<button class="'+(k===tab?'on':'')+'" data-act="tab" data-val="'+k+'">'+v+'</button>').join("")+
 '</nav>'+(tab==="today"?today():tab==="compare"?compare():tab==="plan"?plan():
 tab==="supplies"?supplies():tab==="gyms"?gyms():tab==="perks"?perks():tab==="progress"?progress():settings())+
 '<p class="sub">IamEEKY · Forecast only · No automated Torn actions · v'+VER+'</p>';
 }catch(e){content.innerHTML='<section class="card"><h3>Panel recovery</h3><p>Rendering failed: '+esc(e.message)+'</p><button data-act="refresh">Retry refresh</button></section>';}
 const tabs=content.querySelector?.(".tabs"),selected=tabs?.querySelector?.("button.on");
 if(tabs&&selected)tabs.scrollLeft=Math.max(0,selected.offsetLeft-tabs.offsetLeft-tabs.clientWidth/2+selected.offsetWidth/2);
}
button.addEventListener("click",()=>{opened=!opened;ui.style.display=opened?"block":"none";showLauncher(!opened);if(opened)draw()});
ui.addEventListener("click",event=>{
 const b=event.target.closest("button");if(!b)return;
 const act=b.dataset.act,val=b.dataset.val;
 if(act==="close"){opened=false;ui.style.display="none";showLauncher(true)}
 if(act==="refresh")refresh();
 if(act==="tab"){tab=val;draw()}
 if(act==="stat"){cfg.stat=val;selectedMethod="auto";save()}
 if(act==="mode"){cfg.mode=val;selectedMethod=val==="happy"?"happy":"auto";save()}
 if(act==="choose"){selectedMethod=val;tab="plan";draw()}
 if(act==="choose-supply"){selectedMethod=val;draw()}
 if(act==="horizon"){cfg.horizon=+val;save()}
 if(act==="mark-used"){put("used-day",day(Date.now()/1000));lastPlan=plans();draw()}
 if(act==="clear-refill"){put("used-day",null);lastPlan=plans();draw()}
 if(act==="clearhistory"){history=[];put("history",[]);draw()}
 if(act==="gym-owned"||act==="gym-buy"){const id=+content.querySelector("#hhj-gymlist")?.value;
  if(id&&/\/gym\.php$/.test(location.pathname||"")){verified[id]=act==="gym-owned"?"owned":"buy";put("gyms",verified);draw()}}
 if(act==="save"){
  cfg.budget=Math.max(0,+content.querySelector("#hhj-budget")?.value||0);
  cfg.refills=!!content.querySelector("#hhj-refills")?.checked;
  cfg.gymBonus=Math.min(200,Math.max(0,+content.querySelector("#hhj-gymbonus")?.value||0));
  cfg.ownedPoints=Math.max(0,+content.querySelector("#hhj-points")?.value||0);
  cfg.manualPrices=Object.fromEntries(["points","xanax","ecstasy","lollipop","dvd"].map(k=>
    [k,Math.max(0,+content.querySelector('[data-price="'+k+'"]')?.value||0)]));save()}
});
mount();document.addEventListener?.("DOMContentLoaded",mount,{once:true});
window.setInterval(()=>{mount();},5000);
if(typeof window!=="undefined"){window.__TornHappyJumpLoaded=VER;window.__TornHappyJumpStage={version:VER,phase:"mounted"};}
})();
