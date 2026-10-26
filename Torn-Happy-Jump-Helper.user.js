// ==UserScript==
// @name         Torn Happy Jump Helper
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      0.2.0
// @description  Live read-only TornPDA happy-jump planner. No gameplay actions.
// @author       IamEEKY
// @match        https://www.torn.com/*
// @grant        none
// ==/UserScript==
(function () {
  "use strict";
  const KEY = "###PDA-APIKEY###";
  const API = "https://api.torn.com/v2";
  const ITEMS = {
    lollipop: {id:310, label:"Lollipop", happy:25, cooldown:0.5},
    chocolate: {id:35, label:"Box of Chocolate Bars", happy:25, cooldown:0.5},
    bigChocolate: {id:36, label:"Big Box of Chocolate Bars", happy:35, cooldown:0.5},
    dvd: {id:366, label:"Erotic DVD", happy:2500, cooldown:6},
    xanax: {id:206, label:"Xanax", happy:75, cooldown:0},
    ecstasy: {id:197, label:"Ecstasy", happy:0, cooldown:0}
  };
  const STATS = ["strength", "speed", "defense", "dexterity"];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, Number.isFinite(+v) ? +v : a));
  const fmt = n => Number.isFinite(n) ? Math.round(n).toLocaleString("en-US") : "—";
  const cash = n => Number.isFinite(n) ? "$" + Math.round(n).toLocaleString("en-US") : "quote unavailable";
  const escape = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const secs = n => { n=Math.max(0,Math.ceil(n));return Math.floor(n/3600)+"h "+Math.floor(n%3600/60)+"m "+n%60+"s"; };
  const fresh = p => p && Number.isFinite(p.timestamp) && Date.now()/1000-p.timestamp < 900;
  // Torn API v2: market.itemmarket.listings is globally cached. The cheapest unit
  // can be much less representative than the cost of a whole shopping basket.
  function marketCost(book, quantity) {
    if (quantity <= 0) return {cost:0, known:true};
    if (!book || !Array.isArray(book.listings) || !book.listings.length) return {cost:NaN, known:false};
    let needed = Math.ceil(quantity), cost = 0;
    const listings = book.listings.filter(x=>x.price > 0 && x.amount > 0).sort((a,b)=>a.price-b.price);
    for (const listing of listings) {
      const bought=Math.min(needed,listing.amount);
      cost += bought*listing.price;
      needed-=bought;
      if (!needed) return {cost,known:true};
    }
    return {cost:NaN,known:false};
  }
  function quotePrice(book) {
    const p=marketCost(book,1);
    return p.known?p.cost:NaN;
  }
  // Official Torn Wiki Gym training estimate (current formula, NOT guaranteed).
  // Torn API gym.modifiers are x10 compared with displayed gym dots.
  function gainTrain(energy, happy, stat, dots, bonusFactor, gymEnergy, happyLoss=0.5) {
    if (!(energy>0 && dots>0 && gymEnergy>0)) return 0;
    let remaining=Math.max(0,Math.floor(energy/gymEnergy)*gymEnergy);
    let h=Math.max(0,happy), s=Math.max(0,stat), total=0;
    while (remaining>=gymEnergy) {
      const term=(3.480061091e-7*Math.log(h+250)+3.091619094e-6)*s
        +6.82775184551527e-5*(h+250)-0.0301431777;
      const increase=Math.max(0,term)*dots*gymEnergy*bonusFactor;
      total+=increase; s+=increase;
      h=Math.max(0,h-gymEnergy*happyLoss);
      remaining-=gymEnergy;
    }
    return total;
  }
  function gainRegular(energy, happy, stat, dots, bonus, gymCost, sessionEnergy, happyLoss=0.5) {
    let gain=0, left=Math.floor(energy/gymCost)*gymCost, s=stat;
    const chunk=Math.max(gymCost,Math.floor(sessionEnergy/gymCost)*gymCost);
    while(left>0) {
      const e=Math.min(left,chunk), g=gainTrain(e,happy,s,dots,bonus,gymCost,happyLoss);
      gain+=g;s+=g;left-=e;
    }
    return gain;
  }
  function baseline(input) {
    const hours=168, regenHour=input.regenHour;
    const normalE=hours*regenHour+(input.refill?7*input.maxE:0);
    const normal=gainRegular(normalE,input.baseHappy,input.stat,input.dots,input.mod,input.gymCost,input.maxE,input.happyLoss);
    const regularXan=14;
    const xanE=normalE+regularXan*250;
    const xanGain=gainRegular(xanE,input.baseHappy,input.stat,input.dots,input.mod,input.gymCost,input.maxE,input.happyLoss);
    const xanSpend=marketCost(input.books.xanax,regularXan);
    const pointsSpend=input.refill?marketCost(input.books.points,7*30):{cost:0,known:true};
    return [
      {id:"normal",name:"Natural training",jumps:0,gain:normal,increment:0,cost:pointsSpend.cost,known:pointsSpend.known,
       boosters:0,xanax:0,energy:normalE,desc:"No drugs or Happy stacking; regular training plus optional daily point refills."},
      {id:"xanonly",name:"Regular Xanax training",jumps:0,gain:xanGain,increment:xanGain-normal,
       cost:xanSpend.cost+pointsSpend.cost,known:xanSpend.known && pointsSpend.known,
       boosters:0,xanax:14,energy:xanE,desc:"Train promptly rather than banking energy. Models two Xanax each day, not a happy jump."}
    ];
  }
  function strategies(input) {
    const normal=baseline(input), regular=normal[0].gain, available=[], cap=clamp(input.maxJumpsDaily,1,8)*7;
    const boosts=[
      ["Candy micro 3", "lollipop",3,0],["Candy micro 6","lollipop",6,0],
      ["Candy micro 12","lollipop",12,0],["Candy micro 24","lollipop",24,0],
      ["Candy full 48","lollipop",48,0],["Chocolate micro 12","chocolate",12,0],
      ["Big chocolate 12","bigChocolate",12,0],["eDVD 1","dvd",0,1],
      ["eDVD 2","dvd",0,2],["eDVD 4","dvd",0,4],["eDVD 8","dvd",0,8]
    ];
    const candidates=boosts.flatMap(b=>[0,1,4].map(x=>({name:b[0]+(x?" + "+x+" Xanax":""),type:b[1],count:b[2],dvds:b[3],xanax:x})));
    const perks=clamp(input.candyPercent,0,800)/100;
    for (const s of candidates) {
      const dvdHappy=clamp(input.dvdHappy,2500,5000);
      const perBoosterHours=s.count*0.5*(1-clamp(input.boosterReduction,0,0.75))+s.dvds*6;
      // A single jump must fit under the actual booster cooldown ceiling.
      // Consumable cooldown reductions do not reduce eDVD cooldowns.
      if (perBoosterHours>input.boosterCap) continue;
      const prepHours=s.xanax*7; // average 6-8h Xanax cooldown, ecstasy must follow
      const lockHours=prepHours+3.85; // average Ecstasy cooldown
      const maxWeeklyByBooster=perBoosterHours>0?Math.floor(168/perBoosterHours):56;
      const jumps=Math.min(cap,maxWeeklyByBooster,Math.floor(168/lockHours));
      if(jumps<1)continue;
      const boosterHappy=s.count*ITEMS[s.type].happy*(1+perks) + s.dvds*dvdHappy;
      const jumpHappy=Math.min(99999,2*(input.baseHappy+boosterHappy));
      const lostRegen=Math.min(168*input.regenHour,prepHours*jumps*input.regenHour);
      const weekRefill=input.refill?7*input.maxE:0;
      const energy=Math.max(0,168*input.regenHour-lostRegen)+s.xanax*250*jumps+weekRefill;
      // Standard energy stacking caps at 1,000 E; a fourth Xanax may waste any
      // energy already held near the cap. This is an optimistic capacity model.
      const stackedEnergy=Math.min(1000,input.maxE+s.xanax*250);
      const jumpedE=Math.min(energy,jumps*stackedEnergy+weekRefill);
      const eachJump=jumpedE/jumps;
      let runningStat=input.stat, jumpGain=0;
      for(let n=0;n<jumps;n++){
        const g=gainTrain(eachJump,jumpHappy,runningStat,input.dots,input.mod,input.gymCost,input.happyLoss);
        jumpGain+=g;runningStat+=g;
      }
      const normalGain=gainRegular(Math.max(0,energy-jumpedE),input.baseHappy,runningStat,
        input.dots,input.mod,input.gymCost,input.maxE,input.happyLoss);
      const totalGain=jumpGain+normalGain;
      const counts={xanax:s.xanax*jumps,ecstasy:jumps,dvd:s.dvds*jumps,points:input.refill?210:0};
      counts[s.type]=(counts[s.type]||0)+s.count*jumps;
      let money=0,known=true,missing=[];
      for(const [kind, qty] of Object.entries(counts)) {
        if(qty<=0)continue;
        // Inventory is hour-cached. Compare total cash outlay with stock on hand,
        // but show the total consumable requirements separately.
        const owned=input.inventoryReady?(input.owned[kind]||0):0;
        const buy=Math.max(0,qty-owned);
        const quote=marketCost(input.books[kind],buy);
        if(!quote.known){known=false;missing.push(kind);}
        else money+=quote.cost;
      }
      available.push({...s,id:s.name,jumps,perBoosterHours,prepHours,
        happy:jumpHappy,gain:totalGain,increment:totalGain-regular,cost:known?money:NaN,
        known,missing,energy,lostRegen,counts,eachJump});
    }
    return {baseline:normal,options:available};
  }
  function score(input) {
    const p=strategies(input), combined=p.baseline.concat(p.options);
    const affordable=combined.filter(x=>x.known && x.cost <= input.budget);
    const speed=[...affordable].sort((a,b)=>b.gain-a.gain)[0]||null;
    // Compare benefit per *incremental* spend, not cost per total stats.
    const normal=p.baseline[0], value=affordable
      .filter(x=>x.increment>0 && x.cost>normal.cost)
      .map(x=>({...x,incrementalDollar:x.cost-normal.cost,
        value:x.increment/(x.cost-normal.cost)}))
      .sort((a,b)=>b.value-a.value)[0]||null;
    return {...p,speed,value};
  }
  const Engine={ITEMS,marketCost,quotePrice,gainTrain,gainRegular,baseline,strategies,score};
  if(typeof module!=="undefined" && module.exports) { module.exports=Engine; return; }
  if(!location.hostname.endsWith("torn.com") || document.getElementById("hhj-launch"))return;
  let data={}, quotes={}, lastRefresh=0, errors=[],selected="", opened=false,busy=false;
  let inventoryWarning="",activeTab="today",showAll=false;
  const completedSteps=new Set(); // Local tick-boxes only, never Torn gameplay actions.
  const defaults={budget:10000000,stat:"dexterity",statGoal:"weakest",objective:"growth",
    maxJumpsDaily:6,maxE:150,
    candyPercent:0,boosterReduction:0,dvdHappy:2500,boosterCap:24,modifierPercent:0,happyLoss:0.5,
    refill:true,gymOverride:0};
  let cfg={...defaults};
  try{
    const saved=JSON.parse(localStorage.getItem("hhj-settings-v1")||"null");
    if(saved && typeof saved==="object")
      for(const key of Object.keys(defaults))if(Object.prototype.hasOwnProperty.call(saved,key))cfg[key]=saved[key];
    if(!STATS.includes(cfg.stat))cfg.stat="dexterity";
    if(!["weakest","focus"].includes(cfg.statGoal))cfg.statGoal="weakest";
    if(!["growth","value"].includes(cfg.objective))cfg.objective="growth";
  }catch(_){}
  const style=document.createElement("style");
  style.textContent="#hhj-launch{position:fixed;bottom:85px;right:14px;z-index:2147483646;border:1px solid #4de5cf;background:linear-gradient(140deg,#0b2537,#10234b);color:white;border-radius:18px;padding:13px;font-weight:900;box-shadow:0 6px 22px #0008;cursor:pointer}"+
  "#hhj-panel{position:fixed;z-index:2147483647;inset:12px;bottom:12px;max-width:640px;margin:auto;background:#111a2a;color:#eaf0fa;border:1px solid #32435c;border-radius:17px;box-shadow:0 0 0 100vmax #0008;display:flex;flex-direction:column;font:14px/1.45 system-ui,sans-serif;overflow:hidden}"+
  "#hhj-panel *{box-sizing:border-box}#hhj-panel .head{padding:12px 15px;background:#19263a;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #34465e}"+
  "#hhj-panel .body{padding:12px 14px;overflow:auto;overscroll-behavior:contain}#hhj-panel .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}"+
  "#hhj-panel .tile{border:1px solid #354962;padding:10px;border-radius:12px;background:#162338;min-width:0}#hhj-panel .label{font-size:11px;color:#aab9d0;text-transform:uppercase;letter-spacing:.06em}"+
  "#hhj-panel h3{font-size:15px;color:#fff;margin:15px 0 8px}#hhj-panel p{margin:7px 0;color:#c6d1e2}#hhj-panel input,#hhj-panel select{width:100%;min-width:0;background:#0c1626;color:#fff;border:1px solid #415572;border-radius:8px;padding:9px;font-size:14px}"+
  "#hhj-panel input[type=checkbox]{width:auto;min-width:16px;margin-right:7px;accent-color:#48ddba}#hhj-panel label.step{display:flex;align-items:flex-start;gap:5px;cursor:pointer}#hhj-panel label{display:block;color:#c3cfe0;font-size:12px}#hhj-panel button{border:1px solid #52758b;border-radius:9px;background:#203653;color:#fff;padding:9px 11px;cursor:pointer;font-size:13px}"+
  "#hhj-panel button.primary{background:#13655f;border-color:#2bcab4;font-weight:750}#hhj-panel .row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}#hhj-panel .muted{color:#9cadc3;font-size:12px}"+
  "#hhj-panel .warn{border-left:3px solid #f9be67;background:#3d2e23;padding:9px;border-radius:5px;margin:8px 0;font-size:12px}#hhj-panel .ok{color:#64ebc9}"+
  "#hhj-panel table{width:100%;border-collapse:collapse;font-size:12px}#hhj-panel th,#hhj-panel td{padding:8px 5px;text-align:left;border-bottom:1px solid #34445a}"+
  "#hhj-panel tr.choice{cursor:pointer}#hhj-panel tr.choice:hover,#hhj-panel tr.chosen{background:#1d3546}#hhj-panel .scroll{overflow-x:auto}"+
  "#hhj-panel ol{padding-left:21px}#hhj-panel li{margin:7px 0}#hhj-panel .good{color:#67e6c5}#hhj-panel a{color:#8bd8ff}#hhj-panel .tiny{font-size:11px;color:#afbed0}";
  document.documentElement.appendChild(style);
  const launcher=document.createElement("button");launcher.id="hhj-launch";launcher.type="button";launcher.textContent="HJ ◉";launcher.setAttribute("aria-label","Open Happy Jump Helper");
  const panel=document.createElement("section");panel.id="hhj-panel";panel.style.display="none";panel.setAttribute("aria-label","Happy Jump Helper");panel.setAttribute("role","dialog");
  document.body.append(launcher,panel);
  launcher.addEventListener("click",()=>{opened=!opened;panel.style.display=opened?"flex":"none";if(opened)render();});
  function readyState() {
    const bars=data.bars?.bars||{}, e=bars.energy||{}, h=bars.happy||{};
    const rawGym=data.gym?.gym||{},list=data.gyms?.gyms||[];
    const selectedGym=list.find(x=>x.id===rawGym.id);
    const maxE=e.maximum || cfg.maxE;
    const bs=data.stats?.battlestats||{};
    const stock=Array.isArray(data.inventory?.inventory?.items)?data.inventory.inventory.items:[];
    const owned={};
    for(const [name,item] of Object.entries(ITEMS))
      owned[name]=stock.filter(i=>i.id===item.id && !i.faction_owned).reduce((a,i)=>a+i.amount,0);
    return {bars,e,h,selectedGym,maxE,bs,owned};
  }
  function buildInput(){
    const state=readyState();
    const valueStats=STATS.map(s=>({name:s,value:state.bs[s]?.value}));
    const liveStats=valueStats.filter(x=>Number.isFinite(x.value));
    const least=liveStats.length===STATS.length
      ?liveStats.sort((a,b)=>a.value-b.value)[0].name:null;
    const key=cfg.statGoal==="weakest"&&least?least:(STATS.includes(cfg.stat)?cfg.stat:"dexterity");
    const gymCost=state.selectedGym?.energy_cost||10;
    // API gym modifiers are 10x the visible dots.
    const apiDots=state.selectedGym?.modifiers?.[key];
    const dots=cfg.gymOverride>0?clamp(cfg.gymOverride,0.1,20):(Number.isFinite(apiDots)?apiDots/10:0);
    const bval=state.bs[key]?.value;
    if(!Number.isFinite(bval)||!dots||!Number.isFinite(state.h.maximum))return null;
    return {stat:bval,statName:key,baseHappy:state.h.maximum,dots,gymCost,
      mod:1+clamp(cfg.modifierPercent,-50,300)/100,
      maxE:state.maxE,regenHour:state.e.interval>0
        ? 3600*state.e.increment/state.e.interval
        : (state.maxE>=150?30:20),
      refill:!!cfg.refill, maxJumpsDaily:cfg.maxJumpsDaily,
      budget:cfg.budget,candyPercent:cfg.candyPercent,boosterReduction:cfg.boosterReduction,
      dvdHappy:cfg.dvdHappy,boosterCap:cfg.boosterCap,
      books:Object.fromEntries(Object.entries(quotes).map(([k,v])=>[k,fresh(v)?v:null])),owned:state.owned,inventoryReady:!!data.inventory,happyLoss:cfg.happyLoss};
  }
  async function request(path){
    // Exclusively the official read-only HTTPS v2 API. Do not log the key or URL.
    const url=API+path, headers={"Authorization":"ApiKey "+KEY,"Accept":"application/json"};
    let response;
    if(typeof PDA_httpGet==="function")response=await PDA_httpGet(url,headers);
    else if(window.flutter_inappwebview?.callHandler)
      response=await window.flutter_inappwebview.callHandler("PDA_httpGet",url,headers);
    else response=await fetch(url,{headers,cache:"no-store"});
    if(response.status!==200)throw new Error("Torn API returned HTTP "+response.status);
    const content=typeof response.json==="function"?await response.json():JSON.parse(response.responseText);
    if(content.error)throw new Error("Torn API error "+String(content.error.code||"unknown"));
    return content;
  }
  async function refresh(){
    if(busy||Date.now()-lastRefresh<60000)return;
    if(KEY.includes("PDA-APIKEY")){ errors=["Open this script in TornPDA with an API key configured."];render();return; }
    busy=true;lastRefresh=Date.now();errors=[];inventoryWarning="";completedSteps.clear();render();
    const endpoints={
      bars:"/user/bars",cooldowns:"/user/cooldowns",stats:"/user/battlestats",
      gym:"/user/gym",gyms:"/torn/gyms",inventory:"/user/inventory?cat=Drug&limit=250",
      refills:"/user/refills",points:"/market/pointsmarket"
    };
    for(const [name,item] of Object.entries(ITEMS))endpoints["price_"+name]="/market/"+item.id+"/itemmarket?limit=100";
    // Sequential requests to avoid burst rates or triggering service overload.
    for(const [label,path] of Object.entries(endpoints)){
      try{
        const result=await request(path);
        if(label.startsWith("price_")){
          const market=result.itemmarket;
          quotes[label.slice(6)]={listings:market?.listings||[],
            timestamp:market?.cache_timestamp||0,delay:market?.cache_delay||0};
        } else if(label==="points"){
          const offers=result.pointsmarket||[];
          quotes.points={listings:offers.map(x=>({price:x.cost,amount:x.quantity})),
            timestamp:Math.floor(Date.now()/1000)};
        }else if(label==="inventory"){
          const combined=[...(result.inventory?.items||[])];
          let partial=false;
          for(const category of ["Candy","Booster"]){
            try{
              const followup=await request("/user/inventory?cat="+category+"&limit=250");
              combined.push(...(followup.inventory?.items||[]));
              if((followup._metadata?.total||0)>250)partial=true;
            }catch(error){partial=true;inventoryWarning="Inventory partly unavailable ("+error.message+"). Purchase costs assume zero owned items.";}
          }
          if((result._metadata?.total||0)>250)partial=true;
          if(partial){
            data.inventory=null;
            inventoryWarning=inventoryWarning||"Inventory exceeds one page. Conservative full-purchase prices used.";
          }else data.inventory={inventory:{items:combined}};
        }else data[label]=result;
      }catch(err){
        if(label==="inventory"){
          data.inventory=null;
          const code=err.message.match(/(?:error|code)\s*(\d+)/i)?.[1];
          inventoryWarning=code==="21"
            ?"Inventory lookup unavailable: Torn API error 21 (incorrect category). Your travel location may coincide but is not a confirmed cause. Prices assume you need to buy all items."
            :"Inventory unavailable ("+err.message+"). Cost estimates assume buying all required items.";
        }else errors.push(label+": "+err.message);
      }
    }
    busy=false;render();
  }
  const field=(name,label,type,extra)=>'<label>'+label+'<input data-field="'+name+'" type="'+type+'" value="'+escape(cfg[name])+'" '+(extra||"")+'></label>';
  const opt=(name,label,values)=>'<label>'+label+'<select data-field="'+name+'">'+values.map(x=>
    '<option value="'+escape(x[0])+'" '+(String(cfg[name])===String(x[0])?"selected":"")+'>'+escape(x[1])+'</option>').join("")+'</select></label>';
  function countdown(){
    const h=data.bars?.bars?.happy;
    // True Torn happy reset is on UTC :00/:15/:30/:45, independent of when API refreshed.
    const now=Math.floor(Date.now()/1000), reset=900-(now%900);
    const cd=data.cooldowns?.cooldowns||{};
    const fetchedAge=Math.max(0,(Date.now()-lastRefresh)/1000);
    const btn=document.getElementById("hhj-timer");
    if(btn)btn.textContent="Happy reset in "+secs(reset)+" · Drug "+secs((cd.drug||0)-fetchedAge)+" · Booster "+secs((cd.booster||0)-fetchedAge);
  }
  function render(){
    if(!opened)return;
    const live=readyState(), input=buildInput(), plans=input?score(input):null;
    const allPlans=plans?[...plans.baseline,...plans.options]:[];
    const chosen=allPlans.find(p=>p.id===selected) || plans?.speed || null;
    if(chosen && !allPlans.some(p=>p.id===selected))selected=chosen.id;
    const title=(txt,val)=>'<div class="tile"><div class="label">'+txt+'</div><b>'+val+'</b></div>';
    const info='<div class="grid">'+
      title("Energy",fmt(live.e.current)+" / "+fmt(live.e.maximum))+
      title("Happy",fmt(live.h.current)+" / "+fmt(live.h.maximum))+
      title("Gym",escape(live.selectedGym?.name||data.gym?.gym?.name||"not loaded"))+
      title("Target stat",fmt(live.bs[cfg.stat]?.value))+title("Point refill",data.refills?.refills?.energy===true?"Available":data.refills?.refills?.energy===false?"Used / unavailable":"Unknown")+title("Inventory",data.inventory?"API cached (up to 1h)":"Not loaded")+'</div>';
    const inputs='<h3>Optimisation settings</h3><div class="grid">'+
      opt("stat","Train stat",STATS.map(s=>[s,s[0].toUpperCase()+s.slice(1)]))+
      field("budget","Weekly budget ($)","number",'min="0" step="100000"')+
      field("maxJumpsDaily","Maximum jumps you can attend per day","number",'min="1" max="8"')+
      opt("refill","Use daily 30-point refill",[[true,"Yes, 1 per day"],[false,"No"]])+
      field("modifierPercent","Total personal training bonus % (manual)","number",'min="-50" max="300" step="1"')+
      field("candyPercent","Candy happy bonus % (manual)","number",'min="0" max="800"')+
      opt("dvdHappy","Happy per eDVD",[[2500,"2,500 standard"],[5000,"5,000: eligible Adult Novelties"]])+
      opt("boosterReduction","Candy booster cooldown reduction",[[0,"0%"],[0.1,"10%"],[0.25,"25%"],[0.5,"50% (eligible book)"]])+opt("happyLoss","Happy loss per training E",[[0.5,"0.5 normal"],[0.25,"0.25: Fitness Center Goal Oriented"]])+
      field("gymOverride","Gym dots override (0 = official API)","number",'min="0" max="20" step="0.1"')+
      field("boosterCap","Booster cap hours (readiness only)","number",'min="24" max="48"')+
      '</div><p class="tiny">Modifiers require manual confirmation. The simulation excludes OD risk, addiction/rehab penalties, event effects, exact timing and market slippage. Changing settings never performs a game action.</p>';
    let rec='<div class="warn">Load your data using Refresh Torn data. Battle stats require a Limited API key. Cost rankings require valid market listings.</div>';
    if(plans){
      const best=x=>x?'<b>'+escape(x.name)+'</b> · '+fmt(x.gain)+' predicted stats/week · '+(x.known?cash(x.cost):"no price quote")+
        (x.increment>0 && x.cost>plans.baseline[0].cost?' · '+cash((x.cost-plans.baseline[0].cost)/x.increment)+'/extra stat':'')+
        ' · '+fmt(x.jumps)+' jumps/week':"No affordable option with verified prices";
      rec='<h3>Best strategies under your budget</h3><div class="tile"><div class="label">Maximum weekly stat gain</div>'+best(plans.speed)+'</div>'+
        '<div class="tile" style="margin-top:7px"><div class="label">Best extra stats per extra dollar</div>'+best(plans.value)+'</div>'+
        '<p class="muted">Baseline: '+fmt(plans.baseline[0].gain)+' stat/week on '+fmt(plans.baseline[0].energy)+' energy. All gains are model estimates.</p>';
      const order=[...plans.baseline,...plans.options].sort((a,b)=>b.gain-a.gain);
      rec+='<h3>Strategy comparison</h3><div class="scroll"><table><thead><tr><th>Strategy</th><th>Jump/wk</th><th>Stats/wk</th><th>Gain vs base</th><th>Weekly spend</th><th>$/extra stat</th></tr></thead><tbody>'+
        order.map(x=>'<tr class="choice '+(selected===x.id?"chosen":"")+'" data-plan="'+escape(x.id)+'"><td>'+escape(x.name)+'</td><td>'+fmt(x.jumps)+'</td><td>'+fmt(x.gain)+'</td><td>'+fmt(x.increment)+'</td><td>'+ (x.known?cash(x.cost):"missing quote")+'</td><td>'+(
          x.known && x.increment>0 && x.cost>plans.baseline[0].cost
          ?cash((x.cost-plans.baseline[0].cost)/x.increment):"—"
        )+'</td></tr>').join("")+
        '</tbody></table></div><p class="tiny">Tap a strategy to inspect its required items and manual sequence. Prices are market orderbook estimates less known personal inventory; not guaranteed transaction prices.</p>';
      rec+=insights(live,input,plans);
      if(chosen)rec+=chosen.jumps?steps(chosen,live,input):
        '<h3>Selected plan: '+escape(chosen.name)+'</h3><div class="tile"><p>'+
        escape(chosen.desc)+'</p><p>Estimated '+fmt(chosen.gain)+
        ' stat gains/week, with '+(chosen.known?cash(chosen.cost):'unverified cost')+
        '. This is a normal training strategy; no Happy jump is needed.</p></div>';
      const stale=Object.entries(quotes).filter(([k,v])=>!fresh(v)).map(([k])=>k);
      if(stale.length)rec+='<div class="warn">Prices not recently verified for: '+escape(stale.join(", "))+'. Refresh before purchasing.</div>';
    }
    const status='<h3>Jump status</h3><div id="hhj-timer" class="tile">Calculating countdown…</div>'+
      '<p class="muted">Snapshot: '+(lastRefresh?new Date(lastRefresh).toLocaleTimeString():"not fetched")+
      (busy?" · refreshing manually requested data…":"")+
      ' · Torn API inventory can be cached for an hour.</p>';
    const warning=errors.length?'<div class="warn">'+errors.map(escape).join("<br>")+'</div>':"";
    panel.innerHTML='<div class="head"><b>⚡ HAPPY JUMP HELPER <span class="good">READ ONLY</span></b><button id="hhj-close" type="button">✕</button></div>'+
      '<div class="body"><div class="row"><button class="primary" id="hhj-refresh" type="button" '+(busy||Date.now()-lastRefresh<60000?"disabled":"")+'>'+
      (busy?"Refreshing…":"↻ Refresh Torn data")+'</button><span class="muted">TornPDA · v0.1 · IamEEKY</span></div>'+
      warning+'<h3>Live snapshot</h3>'+info+status+inputs+rec+
      '<p class="tiny">All purchases, drugs, boosters, refills and gym trains must be manually performed inside Torn. This tool makes no gameplay requests.</p></div>';
    panel.querySelector("#hhj-close").onclick=()=>{opened=false;panel.style.display="none";};
    panel.querySelector("#hhj-refresh").onclick=refresh;
    for(const el of panel.querySelectorAll("[data-field]")){
      el.addEventListener("change",()=>{
        const name=el.dataset.field;
        if(name==="stat")cfg[name]=el.value;
        else if(name==="refill")cfg[name]=el.value==="true";
        else cfg[name]=clamp(el.value,0,1e12);
        if(name==="boosterReduction")cfg[name]=clamp(el.value,0,0.75);
        try{localStorage.setItem("hhj-settings-v1",JSON.stringify(cfg));}catch(_){}
        selected="";completedSteps.clear();render();
      });
    }
    for(const tr of panel.querySelectorAll("[data-plan]"))tr.addEventListener("click",()=>{
      selected=tr.dataset.plan;completedSteps.clear();render();
    });
    for(const check of panel.querySelectorAll("[data-step]"))check.addEventListener("change",()=>{
      const key=selected+":"+check.dataset.step;
      if(check.checked)completedSteps.add(key);else completedSteps.delete(key);
    });
    countdown();
  }
  function insights(live,input,plans){
    const tips=[];
    if (input.maxE<150)tips.push("Donator status raises the energy cap to 150 and natural regeneration to 30 E/hour. Compare its cost before buying additional boosters.");
    if (input.baseHappy<5025)tips.push("A well-staffed Private Island can raise base happiness to 5,025. Compare rental cost and the improvement in every train.");
    if (input.stat>=100000)tips.push("This stat is already fairly developed. Check the net weekly gains column: normal Xanax training can beat Happy stacking after lost regeneration.");
    if (input.stat>=1000000)tips.push("At high stats, prioritise sustainable energy per day, the strongest eligible gym and training bonuses; consider stat enhancers separately.");
    if (cfg.candyPercent===0)tips.push("Check Voracity candy perks and World Diabetes Day (13–15 November); set the actual bonus manually only while it applies.");
    if (cfg.happyLoss!==0.25)tips.push("A 3-star Fitness Center offers Goal Oriented, halving happy lost from gym training; choose 0.25 only if you receive that bonus.");
    if (cfg.dvdHappy!==5000)tips.push("A 10-star Adult Novelties job may double eDVD happiness to 5,000, but weigh job changes against other benefits.");
    if (cfg.modifierPercent===0)tips.push("Enter verified education, Steadfast faction, company, book and gym-gain bonuses to improve estimates.");
    if (data.refills?.refills?.energy===false && cfg.refill)tips.push("Today's points energy refill appears unavailable; the weekly projection assumes seven future daily refills, not an immediately available refill.");
    if (plans.options.some(p=>!p.known))tips.push("Some candidate costs are unverified because item quotes are absent, stale or too shallow. Do not treat those as free.");
    const natural=plans.baseline[0], xan=plans.baseline[1];
    if(xan.known && xan.gain>natural.gain)tips.push("Regular Xanax use is an alternative: modelled at "+fmt(xan.gain-natural.gain)+" more stats/week than natural training, before overdose and addiction costs.");
    return '<h3>Ways to improve stat growth</h3><div class="tile"><ul>'+tips.map(s=>'<li>'+escape(s)+'</li>').join("")+'</ul></div>';
  }
  function steps(p,live,input){
    const booster=p.count?fmt(p.count)+" × "+ITEMS[p.type].label:(p.dvds?fmt(p.dvds)+" × Erotic DVD":"none");
    const currentCd=data.cooldowns?.cooldowns||{};
    const requirements=[];
    for(const [k,q] of Object.entries(p.counts)){
      if(q>0&&k!=="points")requirements.push(q+" "+ITEMS[k].label+(input.inventoryReady?" (owned "+(input.owned[k]||0)+")":""));
    }
    const needNow=p.xanax?["Allow drug cooldown to expire. Bank energy with "+p.xanax+" manually taken Xanax, spaced by their actual 6–8 hour drug cooldowns. Never take another drug while on cooldown."]:["Build a full energy bar by natural regeneration first."];
    const canUseBooster=(currentCd.booster||0)<input.boosterCap*3600;
    const canDrug=(currentCd.drug||0)===0;
    const ready=p.xanax===0 && canUseBooster && canDrug &&
      (currentCd.booster||0)+p.perBoosterHours*3600<=input.boosterCap*3600 &&
      live.e.current>=live.e.maximum && live.h.current>=live.h.maximum;
    const boosterWait=Math.max(0,(currentCd.booster||0)+p.perBoosterHours*3600-input.boosterCap*3600);
    const drugWait=Math.max(0,currentCd.drug||0)+p.xanax*7*3600;
    const indicativeSeconds=Math.max(boosterWait,drugWait);
    const nextQuarter=Math.ceil((Date.now()/1000+indicativeSeconds+20)/900)*900;
    const approxWindow=new Date((nextQuarter+20)*1000).toLocaleString();
    const list=[
      "Check the in-game cooldowns, maximum booster cooldown, items and gym. "+(ready?"Current immediate readiness checks pass.":"Not currently ready for a complete immediate jump."),
      ...needNow,
      "Wait until just AFTER a Torn quarter-hour reset (UTC :00/:15/:30/:45), leaving ample time for manual taps.",
      "Manually use "+booster+". Allow for "+fmt(p.perBoosterHours*60)+" minutes of booster cooldown generated by this combination.",
      "Manually use ONE Ecstasy last (it doubles happy). Overdose risk is real: abandon and re-plan if it fails.",
      "Immediately open the gym yourself and train "+input.gymCost+" E at a time in "+input.statName+
        ". Expected happy after Ecstasy ~"+fmt(p.happy)+". Spend energy before the next quarter-hour reset.",
      cfg.refill?"Only AFTER spending enough energy to allow it, manually perform the one daily 30-point refill, then train again before the reset.":"No point refill was budgeted.",
      "Re-check cooldowns and actual gains. Refresh this panel manually to re-optimise the next cycle."
    ];
    return '<h3>Selected plan: '+escape(p.name)+'</h3><div class="tile">'+
      '<p><b>Indicative earliest jump window:</b> '+escape(approxWindow)+
      ' (mean cooldowns; check actual drug cooldowns, inventory and energy availability).</p>'+
      '<div class="grid">'+titleMini("Estimated jump happy",fmt(p.happy))+titleMini("Energy used at jump",fmt(p.eachJump))+
      titleMini("Estimated jumps/week",fmt(p.jumps))+titleMini("Natural regen lost/week",fmt(p.lostRegen)+" E")+'</div>'+
      '<p>Required across 7 days: '+escape(requirements.join(" · "))+(p.counts.points?" · "+p.counts.points+" points":"")+'</p>'+
      '<p class="muted">Tick completed steps for your own tracking. Checks affect this panel only.</p>'+
      '<ol>'+list.map((x,i)=>'<li><label class="step"><input data-step="'+i+'" type="checkbox" '+(completedSteps.has(p.id+":"+i)?"checked":"")+'><span>'+escape(x)+'</span></label></li>').join("")+'</ol>'+
      '<div class="warn">The weekly estimate is a capacity-based simulation, NOT an exact schedule or guarantee. Plan drugs around actual cooldowns and let the Torn UI confirm each step.</div></div>';
  }
  function titleMini(k,v){return '<div><div class="label">'+escape(k)+'</div><b>'+escape(v)+'</b></div>';}
  window.setInterval(()=>{if(opened)countdown();},1000); // only local countdown; NO automatic API calls
})();
