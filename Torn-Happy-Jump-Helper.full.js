// ==UserScript==
// @name         Torn Happy Jump Helper
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      0.5.0
// @description  Full read-only Happy Jump Helper engine, loaded on demand by the small TornPDA launcher.
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js
// @downloadURL  https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js
// @grant        none
// ==/UserScript==
(function () {
  "use strict";
  // Minimal first-instruction status marker: a separate tiny diagnostic can
  // distinguish "never executed" from "failed during initialization".
  if(typeof window!=="undefined"){
    window.__TornHappyJumpStage={version:"0.5.0",phase:"starting"};
    if(typeof window.setTimeout==="function")window.setTimeout(()=>{
      if(window.__TornHappyJumpStage?.phase==="mounted")return;
      const parent=document.body;
      if(!parent||document.getElementById("hhj-launch")||document.getElementById("hhj-startup-error"))return;
      const warning=document.createElement("button");
      warning.id="hhj-startup-error";warning.textContent="HJ STARTUP ERROR";
      warning.style.cssText="position:fixed!important;top:40%!important;right:6px!important;z-index:2147483647!important;background:#8b1919!important;color:white!important;border:2px solid white!important;border-radius:12px!important;padding:14px!important;font:800 13px system-ui!important;";
      warning.onclick=()=>{warning.textContent="HJ initialization stopped — check HJ TEST status";};
      parent.appendChild(warning);
    },1800);
  }
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
      const perBoosterHours=(s.count*0.5*(1-clamp(input.boosterReduction,0,0.75))+s.dvds*6)*
        (1-clamp(input.consumableReduction||0,0,0.75));
      // A single jump must fit under the actual booster cooldown ceiling.
      // Consumable cooldown reductions do not reduce eDVD cooldowns.
      if (perBoosterHours>input.boosterCap) continue;
      const prepHours=s.xanax*7; // average 6-8h Xanax cooldown, ecstasy must follow
      const lockHours=prepHours+3.85; // average Ecstasy cooldown
      const maxWeeklyByBooster=perBoosterHours>0?Math.floor(168/perBoosterHours):56;
      const jumps=Math.min(cap,maxWeeklyByBooster,Math.floor(168/lockHours));
      if(jumps<1)continue;
      const boosterHappy=s.count*ITEMS[s.type].happy*(1+perks)*(input.candyBookMultiplier||1) + s.dvds*dvdHappy;
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
    const modes=input.refillMode==="both"?[false,true]:[!!input.refill];
    const start=Math.ceil(((input.now||Date.now()/1000)+(input.returnHours||0)*3600)/60)*60;
    const natural=baseline({...input,refill:false})[0];
    const all={baseline:[],options:[],naturalBenchmark:natural};
    const contexts={energy:input.currentEnergy,happy:input.currentHappy,
      drugCooldown:input.drugCooldown,boosterCooldown:input.boosterCooldown,
      refillUsed:input.refillUsed,regenInterval:input.regenInterval,
      regenIncrement:input.regenIncrement,available:input.available,
      xanaxHours:input.xanaxHours};
    for(const refill of modes){
      const plans=strategies({...input,refill});
      for(const [kind,entries] of [["baseline",plans.baseline],["options",plans.options]]){
        for(const old of entries){
          const p={...old,refill,id:(refill?"refills:":"no-refills:")+old.id,
            name:old.name+(modes.length>1?(refill?" · with refill":" · no refill"):"")};
          const timeline=schedule(input,p,start,contexts);
          const valid=timeline.known && !timeline.overBudget &&
            (!refill || (timeline.counts.points||0)>0) &&
            (kind==="baseline"||timeline.jumps>0);
          all[kind].push({...p,weeklyGain:timeline.gain,
            gain:timeline.gain,increment:0,cost:timeline.cost,
            known:valid,realJumps:timeline.jumps,jumps:timeline.jumps,
            perJump:timeline.perJump,timeline});
        }
      }
    }
    // Compare the actual simulated energy schedule, not the earlier
    // capacity approximation which could over-count energy while stacked.
    const reference=all.baseline.find(x=>x.id==="no-refills:normal") ||
      all.baseline.find(x=>x.name.includes("Natural training"));
    const naturalGain=reference?.gain||0,naturalCost=reference?.cost||0;
    all.naturalBenchmark={...reference,gain:naturalGain,cost:naturalCost};
    for(const p of [...all.baseline,...all.options])p.increment=p.gain-naturalGain;
    const eligible=[...all.baseline,...all.options].filter(x=>x.known&&x.cost<=input.budget);
    const speed=[...eligible].sort((a,b)=>b.gain-a.gain)[0]||null;
    const value=eligible.filter(x=>x.increment>0&&x.cost>naturalCost)
      .map(x=>({...x,value:x.increment/(x.cost-naturalCost)}))
      .sort((a,b)=>b.value-a.value)[0]||null;
    return {...all,speed,value};
  }
  // Pure minute-by-minute projection. Every timestamp is exact for the chosen
  // assumptions, not a guarantee of random drug cooldowns or human attendance.
  function schedule(input, plan, from, opts={}) {
    const start=Math.ceil(from/60)*60, end=start+7*86400, cdX=clamp(opts.xanaxHours||7,6,8)*3600,
      cdE=clamp(opts.ecstasyHours||4,3,5)*3600, normalCap=Math.max(1,input.maxE),
      limit=1000, regenInterval=Math.max(30,opts.regenInterval||120),
      energyInc=Math.max(1,opts.regenIncrement||1), available=opts.available!==false;
    const activity=[], counts={}, initialEnergy=clamp(opts.energy??normalCap,0,limit);
    let e=initialEnergy, h=Math.max(0,opts.happy??input.baseHappy),
      stat=input.stat, totalGain=0, spentE=0,lostRegen=0, nextDrug=start+Math.max(0,opts.drugCooldown||0),
      boosterSeconds=Math.max(0,opts.boosterCooldown||0), regenBank=Math.max(0,regenInterval-clamp(opts.regenFirstSeconds??regenInterval,0,regenInterval)),
      prep=0,jumps=0,cashEstimate=0, cashKnown=true, trainCount=0,
      lastDay=-1,refilledToday=false,jumpsToday=0;
    const refills=!!plan.refill, isXan=plan.id?.includes("xanonly"),
      isNormal=plan.id?.includes("normal")&&!isXan,
      isJump=!isNormal&&!isXan;
    const requiredXan=isJump?(plan.xanax||0):0;
    const boosterHours=isJump?(plan.perBoosterHours||0):0;
    const add=(time,kind,detail,qty=0,gain=0)=>activity.push({time,kind,detail,qty,gain});
    // Use the cost of the COMPLETE market basket. The original single-unit
    // estimate under-priced large consumable runs and rejected owned supplies
    // when the market was temporarily unavailable.
    function payable(kind,after){
      const owned=input.inventoryReady?Math.max(0,+input.owned?.[kind]||0):0;
      return marketCost(input.books?.[kind],Math.max(0,after-owned));
    }
    function canPay(items){
      let extra=0;
      for(const [kind,q] of Object.entries(items)){
        if(!(q>0))continue;
        const prior=payable(kind,counts[kind]||0);
        const next=payable(kind,(counts[kind]||0)+q);
        if(!prior.known||!next.known)return false;
        extra+=next.cost-prior.cost;
      }
      return cashEstimate+extra<=input.budget;
    }
    function consume(time,kind,quantity){
      const prior=payable(kind,counts[kind]||0);
      const next=payable(kind,(counts[kind]||0)+quantity);
      if(!prior.known||!next.known){cashKnown=false;return false;}
      counts[kind]=(counts[kind]||0)+quantity;
      cashEstimate+=next.cost-prior.cost;
      return true;
    }
    function train(t,label){
      if(e<input.gymCost || !available)return;
      const used=Math.floor(e/input.gymCost)*input.gymCost;
      const gain=gainTrain(used,h,stat,input.dots,input.mod,input.gymCost,input.happyLoss);
      if(!(used>0))return;
      stat+=gain;totalGain+=gain;spentE+=used;e-=used;trainCount++;
      h=Math.max(0,h-used*input.happyLoss);
      add(t,"train",label+" • "+used+" E • +"+Math.round(gain).toLocaleString()+" "+input.statName,used,gain);
    }
    function useRefill(t){
      if(!refills||refilledToday||!available||e>limit-normalCap)return;
      if(!canPay({points:30}))return;
      consume(t,"points",30);e=Math.min(limit,e+normalCap);refilledToday=true;
      add(t,"refill","Manual 30-point energy refill • +"+normalCap+" E",normalCap);
      train(t,"Train after daily refill");
    }
    if(boosterHours>input.boosterCap)return {events:[],gain:0,cost:NaN,known:false,jumps:0,error:"Booster duration exceeds cap"};
    let nextXan=start;
    for(let t=start;t<end;t+=60){
      const day=Math.floor(t/86400);
      if(day!==lastDay){lastDay=day;jumpsToday=0;refilledToday=day===Math.floor(start/86400)&&opts.refillUsed===true;}
      if(t%900===0){
        // Torn gives 5 Happy every 15 minutes when below its base maximum.
        // Above-maximum Happy resets unless Ignorance Is Bliss is active.
        if(h>input.baseHappy&&!input.ignoreHappyReset)h=input.baseHappy;
        else if(h<input.baseHappy)h=Math.min(input.baseHappy,h+5);
      }
      if(t>start){
        boosterSeconds=Math.max(0,boosterSeconds-60);
        regenBank+=60;
        while(regenBank>=regenInterval){
          regenBank-=regenInterval;
          if(e<normalCap)e=Math.min(normalCap,e+energyInc);
          else lostRegen+=energyInc;
        }
      }
      if(!available)continue;
      if(!isJump){
        if(e>=normalCap)train(t,"Natural-energy gym training");
        if(isXan&&t>=nextDrug&&canPay({xanax:1})){
          consume(t,"xanax",1);e=Math.min(limit,e+250);h=Math.min(99999,h+75);nextDrug=t+cdX;
          add(t,"xanax","Manually take Xanax • +250 E; assumed next drug availability "+new Date(nextDrug*1000).toISOString(),250);
          train(t,"Train Xanax energy promptly");
        }
        if(t%86400>=12*3600&&!refilledToday){if(e>=input.gymCost)train(t,"Train before daily refill");useRefill(t);}
      }else{
        // A jump strategy still trains naturally available overflow energy.
        // If the next jump is >one whole regen cycle away and no Xanax has
        // been stacked for it yet, using capped energy avoids idle regen loss.
        // Reserve a complete energy-bar regen window before the planned jump.
        const regenCycle=normalCap*regenInterval/energyInc;
        const untilReady=Math.max(0,nextDrug-t,boosterSeconds);
        if(prep===0&&e>=normalCap&&untilReady>regenCycle+600){
          train(t,"Train surplus natural energy while awaiting next Happy jump");
        }
        // Keep a complete repeatable sequence: stack Xanax, wait for drug
        // cooldown to finish, then boost Happy and train at +1 min after :15.
        if(prep<requiredXan&&t>=nextDrug&&t>=nextXan&&
          e<limit&&canPay({xanax:1})){
          consume(t,"xanax",1);e=Math.min(limit,e+250);h=Math.min(99999,h+75);prep++;
          nextDrug=t+cdX;nextXan=nextDrug;
          add(t,"xanax","Manually stack Xanax "+prep+"/"+requiredXan+" • +250 E",250);
        }
        if(prep>=requiredXan&&jumpsToday<clamp(input.maxJumpsDaily,1,8)&&t>=nextDrug&&t%900===60&&
          e>=Math.min(limit,normalCap+requiredXan*250)&&
          boosterSeconds+boosterHours*3600<=input.boosterCap*3600){
          const required={ecstasy:1};
          if(plan.count)required[plan.type]=plan.count;
          if(plan.dvds)required.dvd=plan.dvds;
          if(canPay(required)){
            for(const [k,v] of Object.entries(required))consume(t,k,v);
            const boosterHappy=(plan.count||0)*ITEMS[plan.type].happy*(1+clamp(input.candyPercent,0,800)/100)*(input.candyBookMultiplier||1)
              +(plan.dvds||0)*input.dvdHappy;
            boosterSeconds+=boosterHours*3600;
            h=Math.min(99999,2*(h+boosterHappy));jumps++;jumpsToday++;
            add(t,"jump","Manual boosters → Ecstasy → gym. Predicted Happy "+Math.round(h).toLocaleString());
            train(t,"Happy-jump gym training");
            useRefill(t);
            nextDrug=t+cdE;prep=0;nextXan=nextDrug;
          }
        }
      }
    }
    // Include any remaining E at the period boundary. This is a forecast
    // closing balance, not an unearned stat gain.
    let cost=0,known=true;
    for(const [kind,q] of Object.entries(counts)){
      const need=Math.max(0,q-(input.inventoryReady?(input.owned[kind]||0):0));
      const quote=marketCost(input.books[kind],need);
      if(!quote.known){known=false;break;}
      cost+=quote.cost;
    }
    return {start,end,events:activity,counts,gain:totalGain,perJump:jumps?activity.filter(x=>x.kind==="train"&&/Happy-jump gym training/.test(x.detail)).reduce((n,x)=>n+x.gain,0)/jumps:null,
      finalStat:stat,jumps,cost:known?cost:NaN,known:known&&cashKnown&&cost<=input.budget,
      overBudget:known&&cost>input.budget,energyTrained:spentE,energyLeft:e,lostRegen,
      trainCount,priceBreakdown:Object.fromEntries(Object.entries(counts).map(([kind,q])=>[kind,{required:q,owned:input.inventoryReady?(input.owned?.[kind]||0):null,buy:Math.max(0,q-(input.inventoryReady?(input.owned?.[kind]||0):0)),cost:payable(kind,q).cost}])),assumptions:{xanaxHours:cdX/3600,ecstasyHours:cdE/3600,regenInterval,available},
      error:available?"": "Gym access unavailable during travel. Resume on return."};
  }
  // API v2 user/perks provides descriptive strings grouped by source. Do NOT
  // confuse combat-effective passive stats with gym-training multipliers.
  function auditPerks(source, target) {
    const categories=["faction","job","property","education","enhancer","book","stock","merit"];
    const groups=source?.perks||{},rows=[],bonuses=[];
    for(const category of categories){
      for(const description of Array.isArray(groups[category])?groups[category]:[]){
        if(typeof description!=="string")continue;
        let pct=NaN;
        const m=description.match(/(\d+(?:\.\d+)?)\s*%/);
        const positive=!/decreas|reduc|penalty|less|lower|negative/i.test(description);
        const relevant=/(gym\s*(?:training\s*)?gains?|gains?\s*(?:in|from)\s*(?:the\s*)?gym)/i.test(description);
        const scoped=/(strength|speed|defen[cs]e|dexterity)/i.exec(description);
        if(m&&positive&&relevant&&(!scoped||scoped[1].toLowerCase().replace("defence","defense")===target)){
          pct=clamp(Number(m[1]),0,200);
          if(pct>0)bonuses.push({category,description,pct});
        }
        rows.push({category,description,applied:Number.isFinite(pct),percent:pct});
      }
    }
    const factor=bonuses.reduce((p,x)=>p*(1+x.pct/100),1);
    return {rows,bonuses,factor};
  }
  const BOOK_INFO={
    744:{name:"Brawn Over Brains",stat:"strength",kind:"stat"},
    745:{name:"Time Is In The Mind",stat:"speed",kind:"stat"},
    746:{name:"Keeping Your Face Handsome",stat:"defense",kind:"stat"},
    747:{name:"A Job For Your Hands",stat:"dexterity",kind:"stat"},
    757:{name:"Get Hard Or Go Home",kind:"gym",pct:20},
    758:{name:"Gym Grunting - Shouting To Success",kind:"gym",stat:"strength",pct:30},
    759:{name:"Self Defense In The Workplace",kind:"gym",stat:"defense",pct:30},
    760:{name:"Speed 3 - The Rejected Script",kind:"gym",stat:"speed",pct:30},
    761:{name:"Limbo Lovers 101",kind:"gym",stat:"dexterity",pct:30},
    770:{name:"Ignorance Is Bliss",kind:"happy"},
    773:{name:"Hot Turkey",kind:"addiction"},
    774:{name:"Higher Daddy, Higher!",kind:"regen",pct:20},
    783:{name:"Yes Please Diabetes",kind:"candy"},
    779:{name:"Self Control Is For Losers",kind:"cooldown"},
    782:{name:"Fuelling Your Way To Failure",kind:"energyDrink"},
    784:{name:"Ugly Energy",kind:"maxEnergy"},
    785:{name:"Memories And Mammaries",kind:"bookRepeat"}
  };
  function bookAdvice(stock, stats={}, weeklyGain=0, trainingStat=null) {
    if(!Array.isArray(stock))return [];
    return stock.filter(x=>x.amount>0&&!x.faction_owned).map(x=>{
      const b=BOOK_INFO[x.id]||{name:String(x.name||"Book #"+x.id).replace(/^Book\s*:\s*/i,""),kind:"other"};
      let recommendation="Save until you can dedicate the whole 31-day period to this effect.";
      let forecast=null,threshold=null,extra=0;
      if(b.kind==="stat"){
        const s=stats[b.stat]||0;threshold=200000000;
        extra=Math.min(s*0.05,10000000);
        recommendation=s<threshold?
          "SAVE. Best percentage-book value is at 200,000,000 "+b.stat+
          " (5% then reaches the +10,000,000 cap). Current theoretical bonus "+Math.round(extra).toLocaleString()+
          "; at that target it is +10,000,000.":
          "Potentially ready for maximum +10,000,000 bonus: use when a 31-day book slot is free.";
        if(s<threshold&&weeklyGain>0)forecast=Math.ceil((threshold-s)/weeklyGain)+" weeks at this week's estimated single-stat growth";
      }else if(b.kind==="gym"){
        const relevant=!b.stat||trainingStat===b.stat;
        const uplift=relevant?Math.round(weeklyGain*31/7*(b.pct||0)/100):null;
        extra=uplift||0;
        recommendation="SAVE unless you can train heavily every day for the whole 31-day period. "+
          (relevant&&Number.isFinite(uplift)?
            "If used now, an approximate additional "+uplift.toLocaleString()+" gym stats over 31 days at your current weekly pace. ":""+
            "The active target differs, so the predicted additional stats cannot be inferred from this schedule. ")+
          (b.stat?"Only increases "+b.stat+" gym gains.":"Increases all gym gains.");
      }else if(b.kind==="happy"){
        recommendation="SAVE for an intentionally prepared high-Happy training month, not an ordinary single jump.";
      }else if(b.kind==="regen"){
        recommendation="Best paired with a 31-day period of consistent gym training and minimal energy waste.";
      }else if(b.kind==="candy"){
        recommendation="Consider saving for World Diabetes Day (13–15 Nov), aligned with faction candy perks; verify the event rules.";
      }else if(b.kind==="addiction"){
        recommendation="Save until a planned month of drug-intensive training when addiction avoidance is valuable.";
      }else if(b.kind==="cooldown"){
        recommendation="Save for a planned month of booster-heavy training; halve consumable cooldowns while active.";
      }else if(b.kind==="maxEnergy"){
        recommendation="Save for a 31-day training block with daily refills: maximum energy rises to 250.";
      }else if(b.kind==="bookRepeat"){
        recommendation="Save until you know which unique 31-day book is most valuable to repeat.";
      }else if(b.kind==="other"){
        recommendation="No confirmed direct gym-gain benefit; evaluate against other uses and book-slot opportunity cost.";
      }
      return {id:x.id,name:b.name,kind:b.kind,stat:b.stat,threshold,forecast,extra,recommendation,
        // Inventory API does not distinguish consumed trophy copies from unread books.
        ownership:"Found in inventory; unread/usable status NOT verifiable from this API."};
    });
  }

  // Exact Torn API v2 gym records are global metadata, NOT proof of membership.
  // Status must be affirmed from an explicitly user-observed gym page.
  function gymCatalog(data) {
    const arr=Array.isArray(data?.gyms)?data.gyms:Array.isArray(data)?data:[];
    return arr.filter(x=>x&&Number.isFinite(+x.id)&&typeof x.name==="string")
      .map(x=>({id:+x.id,name:x.name,cost:+x.cost||0,
        energyCost:+x.energy_cost||10,
        class:String(x.class||""),
        modifiers:x.modifiers||{}, note:x.note||""}));
  }
  function gymEligibility(gym,stats={}){
    const name=gym?.name?.toLowerCase()||"";
    const val=k=>Math.max(0,+stats[k]||0);
    const arr=["strength","speed","defense","dexterity"].map(val);
    const [str,spd,def,dex]=arr;
    if(name.includes("balboas"))return def+dex >=1.25*(str+spd);
    if(name.includes("frontline"))return str+spd >=1.25*(def+dex);
    if(name.includes("gym 3000"))return str >=1.25*Math.max(spd,def,dex);
    if(name.includes("isoyamas"))return def>=1.25*Math.max(str,spd,dex);
    if(name.includes("total rebound"))return spd>=1.25*Math.max(str,def,dex);
    if(name==="elites")return dex>=1.25*Math.max(str,spd,def);
    // The Sports Science Lab has a lifetime drug-use threshold that this
    // planner cannot prove; positive manual availability confirmation is needed.
    return true;
  }
  function gymSuggestions(catalog, activeId, verified={}, stat="dexterity", stats={}, context={}) {
    const current=catalog.find(x=>x.id===+activeId)||null;
    const dots=g=>(Number(g?.modifiers?.[stat])||0)/10;
    const activeDots=dots(current);
    const baseline=(+context.energy||150)>0&&activeDots>0&&+context.stat>=0
      ?gainTrain(context.energy,context.happy||5025,context.stat,activeDots,
        context.mod||1,current.energyCost,context.happyLoss||0.5):null;
    const results=[];
    for(const gym of catalog){
      const status=gym.id===+activeId?"active":verified[String(gym.id)];
      if(!["active","owned","buy"].includes(status))continue;
      if(!gymEligibility(gym,stats))continue;
      if(gym.name.toLowerCase().includes("sports science")&&!verified[String(gym.id)])continue;
      if(dots(gym)<=0)continue;
      const gain=baseline!==null
        ?gainTrain(context.energy,context.happy||5025,context.stat,dots(gym),
          context.mod||1,gym.energyCost,context.happyLoss||0.5):null;
      const improvement=(gain!==null&&baseline>0)?(gain/baseline-1)*100:
        (activeDots?100*(dots(gym)/activeDots-1):null);
      results.push({...gym,status,dots:dots(gym),gain,improvement,
        action:status==="buy"?"Buy membership manually":
          status==="owned"?"Switch gym manually":"Current gym"});
    }
    return results.sort((a,b)=>b.dots-a.dots);
  }
  function trainingPerkRows(rows=[]){
    const material=/(gym|train(?:ing)?|energy|happ(?:y|iness)|booster|cooldown|candy|candies|xanax|ecstasy|drug|refill|erotic\s*dvd)/i;
    return rows.filter(x=>typeof x.description==="string"&&material.test(x.description));
  }
  // Project ONE targeted base stat by recomputing marginal gain as the stat
  // grows, instead of linearly multiplying the current week's gain forever.
  // Model excludes future gym unlocks/events and therefore is a scenario, not ETA certainty.
  function targetProjection(input, weeklyGain, weeklyCost, thresholds=[5e7,1e8,2e8,1e9]){
    const initial=+input?.stat||0;
    if(!(initial>0)||!Number.isFinite(initial))return [];
    if(!(weeklyGain>0)||!Number.isFinite(weeklyGain))
      return thresholds.map(target=>({target,weeks:null,eta:null,cost:null}));
    const delta=Math.max(100000,initial*0.05);
    const trainSample=1000, base=gainTrain(trainSample,input.baseHappy,initial,input.dots,
      input.mod,input.gymCost,input.happyLoss);
    const better=gainTrain(trainSample,input.baseHappy,initial+delta,input.dots,
      input.mod,input.gymCost,input.happyLoss);
    // Use finite-difference sensitivity adjusted to the actual weekly plan.
    const slope=base>0?Math.max(0,weeklyGain*(better-base)/(delta*base)):0;
    let v=initial;
    const checkpoints=thresholds.map(target=>({target:Math.max(0,Number(target))}));
    const maxWeeks=5200;
    for(let week=0;week<=maxWeeks;week++){
      for(const point of checkpoints){
        if(point.weeks!==undefined||v<point.target)continue;
        point.weeks=week;
        point.eta=new Date((input.now||Date.now()/1000)*1000+week*604800).toISOString().slice(0,10);
        point.cost=Math.max(0,weeklyCost||0)*week;
      }
      if(checkpoints.every(p=>p.weeks!==undefined))break;
      v+=Math.max(0,weeklyGain+slope*(v-initial));
      if(!Number.isFinite(v))break;
    }
    return checkpoints.map(p=>p.weeks!==undefined?p:
      {...p,weeks:null,eta:null,cost:null});
  }

  function actionOverview(plan,now=Date.now()/1000,hours=24){
    const t=plan?.timeline;
    if(!t)return {next:null,today:[],tomorrow:[],gain24:0,gain7:0,byDay:[]};
    const events=t.events||[],window=hours*3600;
    const upcoming=events.filter(e=>e.time>=now).sort((x,y)=>x.time-y.time);
    const today=upcoming.filter(e=>e.time<now+window);
    const tomorrow=upcoming.filter(e=>e.time>=now+window&&e.time<now+2*window);
    const gain24=today.filter(x=>x.kind==="train").reduce((n,x)=>n+(x.gain||0),0);
    const buckets=new Map();
    for(const event of events){
      const day=new Date(event.time*1000).toISOString().slice(0,10);
      const current=buckets.get(day)||{date:day,energy:0,gain:0,cost:0,jumps:0,actions:0};
      current.actions++;
      if(event.kind==="train"){current.energy+=event.qty||0;current.gain+=event.gain||0;}
      if(event.kind==="jump")current.jumps++;
      buckets.set(day,current);
    }
    return {next:upcoming[0]||null,today,tomorrow,gain24,gain7:t.gain||0,
      byDay:[...buckets.values()].sort((a,b)=>a.date.localeCompare(b.date))};
  }
  function shoppingList(plan){
    const source=plan?.timeline?.priceBreakdown||{};
    return Object.entries(source).filter(([,v])=>(v?.required||0)>0)
      .map(([key,v])=>({key,label:key==="points"?"Points":ITEMS[key]?.label||key,
        required:v.required,owned:v.owned,buy:v.buy,
        cost:Number.isFinite(v.cost)?v.cost:null,known:Number.isFinite(v.cost)}))
      .sort((a,b)=>b.buy-a.buy);
  }
  function snapshotDelta(history,current){
    if(!Array.isArray(history)||!history.length||!current)return [];
    const prior=history[history.length-1];
    if(!(current.timestamp>prior.timestamp))return [];
    const days=(current.timestamp-prior.timestamp)/86400;
    return STATS.map(k=>({
      stat:k,delta:(+current.stats?.[k]||0)-(+prior.stats?.[k]||0),
      perDay:days>0?((+current.stats?.[k]||0)-(+prior.stats?.[k]||0))/days:0,
      days,confirmed:days>0&&days<45
    }));
  }
  function learningIndicator(actualGain,predictedGain){
    if(!(predictedGain>0)||!Number.isFinite(actualGain))return {ratio:null,message:"Not enough verified training history"};
    const ratio=actualGain/predictedGain;
    return {ratio,message:ratio<0.8?"Actual change below the forecast":ratio>1.2?
      "Actual change above the forecast":"Recent gain is broadly in line with the forecast"};
  }
  const Engine={ITEMS,marketCost,quotePrice,gainTrain,gainRegular,baseline,strategies,score,schedule,auditPerks,bookAdvice,BOOK_INFO,gymCatalog,gymEligibility,gymSuggestions,trainingPerkRows,targetProjection,actionOverview,shoppingList,snapshotDelta,learningIndicator};
  if(typeof window!=="undefined"&&window.__TornHappyJumpStage)
    window.__TornHappyJumpStage.phase="engine-loaded";
  // Only export during a Node test, never on a real Torn page where another
  // library might happen to expose a global named "module".
  if(typeof module!=="undefined" && module.exports &&
      (typeof window==="undefined" || typeof document==="undefined")){
    module.exports=Engine;return;
  }
  if(!location.hostname.endsWith("torn.com") || document.getElementById("hhj-launch"))return;
  let data={}, quotes={}, lastRefresh=0, errors=[],selected="", opened=false,busy=false;
  let inventoryWarning="",activeTab="today",showAll=false;
  let dataRevision=0,planMemo={key:"",result:null};
  const HISTORY_KEY="hhj-local-history-v1";
  let localHistory=[];
  try{
    const history=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");
    if(Array.isArray(history))localHistory=history.filter(x=>
      x&&Number.isFinite(x.timestamp)&&x.stats&&typeof x.stats==="object").slice(-90);
  }catch(_){}
  function recordObservedStats(){
    const stats=data.stats?.battlestats;
    if(!stats||!STATS.every(k=>Number.isFinite(+stats[k]?.value)))return;
    const sample={timestamp:Math.floor(Date.now()/1000),
      stats:Object.fromEntries(STATS.map(k=>[k,+stats[k].value]))};
    const prior=localHistory[localHistory.length-1];
    if(prior&&sample.timestamp-prior.timestamp<3600)return;
    localHistory.push(sample);localHistory=localHistory.slice(-90);
    try{localStorage.setItem(HISTORY_KEY,JSON.stringify(localHistory));}catch(_){}
  }
  let gymEvidence=[],gymNotice="",verifiedGyms={},gymVerifiedAt=0;
  const completedSteps=new Set(); // Local tick-boxes only, never Torn gameplay actions.
  const defaults={budget:10000000,stat:"dexterity",statGoal:"weakest",objective:"growth",
    maxJumpsDaily:6,maxE:150,
    candyPercent:0,boosterReduction:0,dvdHappy:2500,boosterCap:24,modifierPercent:0,happyLoss:0.5,
    autoPerks:true,xanaxHours:7,viewUnit:"week",scheduleMode:"training",scheduleHours:24,returnHours:0,bookGymMilestone:50000000,
    refill:"both",gymOverride:0,theme:"dark"};
  let cfg={...defaults};
  try{
    const saved=JSON.parse(localStorage.getItem("hhj-settings-v1")||"null");
    if(saved && typeof saved==="object")
      for(const key of Object.keys(defaults))if(Object.prototype.hasOwnProperty.call(saved,key))cfg[key]=saved[key];
    if(!STATS.includes(cfg.stat))cfg.stat="dexterity";
    if(!["weakest","focus"].includes(cfg.statGoal))cfg.statGoal="weakest";
    if(!["growth","value"].includes(cfg.objective))cfg.objective="growth";
    if(typeof cfg.refill==="boolean")cfg.refill=cfg.refill?"yes":"no";
    if(!["yes","no","both"].includes(cfg.refill))cfg.refill="both";
    if(!["training","happyjump"].includes(cfg.scheduleMode))cfg.scheduleMode="training";
    if(![24,168].includes(Number(cfg.scheduleHours)))cfg.scheduleHours=24;
    const gymSaved=JSON.parse(localStorage.getItem("hhj-verified-gyms-v1")||"null");
    if(gymSaved&&typeof gymSaved==="object"&&Date.now()-Number(gymSaved.at||0)<86400000){
      verifiedGyms=gymSaved.statuses&&typeof gymSaved.statuses==="object"?gymSaved.statuses:{};
      gymVerifiedAt=Number(gymSaved.at||0);
    }
  }catch(_){}
  const style=document.createElement("style");
  style.textContent = `
#hhj-launch{position:fixed!important;top:44%!important;bottom:auto!important;right:7px;z-index:2147483646!important;background:#155e72!important;color:#fff!important;border:2px solid #a5f3fc!important;border-radius:999px!important;padding:12px 16px!important;font:800 15px system-ui,sans-serif!important;box-shadow:0 4px 22px #000b!important;cursor:pointer}
#hhj-panel{--hj-bg:#0a111c;--hj-card:#182639;--hj-raised:#20344b;--hj-text:#f5f8ff;--hj-muted:#c3d0e2;--hj-line:#50677f;--hj-link:#a3e4ff;--hj-accent:#62f0d0;--hj-alert:#3b3024;position:fixed!important;inset:8px 8px 12px!important;max-width:610px!important;margin:auto!important;z-index:2147483647!important;display:flex;flex-direction:column;overflow:hidden!important;border:2px solid var(--hj-line)!important;border-radius:17px!important;color:var(--hj-text)!important;background:var(--hj-bg)!important;box-shadow:0 0 0 200vmax #0009,0 18px 50px #000a!important;font:15px/1.48 system-ui,-apple-system,sans-serif!important;color-scheme:dark!important}
#hhj-panel[data-theme=light]{--hj-bg:#f5f8ff;--hj-card:#fff;--hj-raised:#e9f0f8;--hj-text:#142238;--hj-muted:#334960;--hj-line:#a7b5c9;--hj-link:#07537d;--hj-accent:#077f72;--hj-alert:#fff1d5;color-scheme:light!important}
#hhj-panel *,#hhj-panel *:before,#hhj-panel *:after{box-sizing:border-box!important}
#hhj-panel button,#hhj-panel input,#hhj-panel select{font-family:inherit!important}
#hhj-panel b,#hhj-panel strong,#hhj-panel h2,#hhj-panel h3{color:var(--hj-text)!important}
#hhj-panel button{background:var(--hj-raised)!important;color:var(--hj-text)!important;border:1px solid var(--hj-line)!important;border-radius:11px!important;padding:10px 12px!important;min-height:42px!important;font-size:14px!important;line-height:1.3!important;font-weight:680!important;cursor:pointer}
#hhj-panel button:disabled{opacity:.56!important;cursor:default!important}
#hhj-panel button.primary{background:#126c62!important;color:#fff!important;border-color:#68dccc!important}
#hhj-panel button:focus-visible,#hhj-panel input:focus-visible,#hhj-panel select:focus-visible{outline:3px solid #40c8ff!important;outline-offset:2px!important}
#hhj-panel .head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:var(--hj-card);border-bottom:1px solid var(--hj-line);flex-shrink:0}
#hhj-panel .head .brand{font-size:16px;font-weight:850;letter-spacing:.02em}
#hhj-panel .tag{display:inline-block;font:800 10px/1 system-ui,sans-serif;letter-spacing:.04em;color:#051e1d;background:var(--hj-accent);padding:5px 7px;border-radius:6px;margin-left:5px}
#hhj-panel .tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));background:var(--hj-card);gap:3px;padding:7px;border-bottom:1px solid var(--hj-line);flex-shrink:0}
#hhj-panel .tabs button{font-size:12px!important;min-height:43px!important;padding:7px 3px!important;border-radius:9px!important}
#hhj-panel .tabs button[aria-selected=true]{background:#127469!important;color:#fff!important;border:1px solid #7cfbe2!important}
#hhj-panel .body{flex:1;overflow:auto;overscroll-behavior:contain;padding:12px 14px 35px;min-height:0}
#hhj-panel .card{background:var(--hj-card);border:1px solid var(--hj-line);border-radius:13px;padding:14px;min-width:0;margin:0 0 10px}
#hhj-panel .card.hero{border-color:var(--hj-accent);border-width:2px}
#hhj-panel .grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#hhj-panel .tile{border:1px solid var(--hj-line);background:var(--hj-card);border-radius:11px;padding:12px;min-width:0}
#hhj-panel .tile b,#hhj-panel .tile .num{font-size:20px;font-variant-numeric:tabular-nums}
#hhj-panel h2{font-size:18px!important;line-height:1.2!important;margin:10px 0 12px!important;font-weight:800!important}
#hhj-panel h3{font-size:16px!important;margin:15px 0 8px!important;font-weight:790!important}
#hhj-panel p{color:var(--hj-text)!important;font-size:14px!important;line-height:1.48!important;margin:7px 0!important}
#hhj-panel .muted,#hhj-panel .tiny{color:var(--hj-muted)!important}
#hhj-panel .tiny{font-size:12px!important}
#hhj-panel .label{color:var(--hj-muted)!important;font-size:12px!important;font-weight:690;letter-spacing:.01em}
#hhj-panel .metric{font-size:23px;font-weight:850;line-height:1.25;font-variant-numeric:tabular-nums;margin:4px 0 5px}
#hhj-panel .row{display:flex;align-items:center;gap:9px;flex-wrap:wrap}
#hhj-panel .between{display:flex;justify-content:space-between;align-items:center;gap:9px}
#hhj-panel .status{background:var(--hj-card);border-radius:10px;border:1px solid var(--hj-line);padding:10px 12px;margin:8px 0}
#hhj-panel .warn{border:1px solid #b78a49;border-left:4px solid #f0b85f;background:var(--hj-alert);color:var(--hj-text)!important;padding:12px;border-radius:9px;margin:9px 0;word-break:break-word}
#hhj-panel .warn p{color:inherit!important}
#hhj-panel .ok{color:var(--hj-accent)!important}
#hhj-panel .good{color:var(--hj-accent)!important}
#hhj-panel label{display:block;color:var(--hj-text)!important;font-size:13px!important;font-weight:650;margin:5px 0}
#hhj-panel label input:not([type=checkbox]),#hhj-panel label select{display:block;width:100%!important;background:var(--hj-card)!important;color:var(--hj-text)!important;min-width:0!important;min-height:45px!important;border:1px solid var(--hj-line)!important;border-radius:10px!important;padding:9px 10px!important;margin:5px 0 7px!important;font-size:16px!important;font-weight:550}
#hhj-panel input[type=checkbox]{width:19px!important;height:19px!important;min-width:19px!important;accent-color:#12a98f!important;flex:none;margin:2px 7px 0 0!important}
#hhj-panel label.step{display:flex;align-items:flex-start;gap:7px;cursor:pointer;font-size:14px!important;line-height:1.5}
#hhj-panel .plan{display:block;width:100%;text-align:left!important;margin:8px 0!important;padding:13px!important;background:var(--hj-card)!important;border:1px solid var(--hj-line)!important}
#hhj-panel .plan.chosen{border:2px solid var(--hj-accent)!important;background:var(--hj-raised)!important}
#hhj-panel .plan .heading{font-weight:800;font-size:15px}
#hhj-panel .plan .figures{display:flex;gap:10px;flex-wrap:wrap;font-size:13px;margin-top:6px;color:var(--hj-muted)}
#hhj-panel .bars{height:10px;background:var(--hj-raised);border-radius:20px;overflow:hidden;margin:5px 0 12px}
#hhj-panel .bars span{height:100%;display:block;background:#22bfa7}
#hhj-panel ol{padding-left:22px!important}
#hhj-panel li{margin:9px 0!important;color:var(--hj-text)!important}
#hhj-panel details summary{cursor:pointer;color:var(--hj-text)!important;padding:8px 0;font-weight:700}
#hhj-panel .btnrow{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}
#hhj-panel .scroll{overflow-x:auto}
#hhj-panel a{color:var(--hj-link)!important}
@media(max-width:410px){#hhj-panel{inset:2px 3px 4px!important;border-radius:11px!important}#hhj-panel .body{padding:10px 11px 30px}#hhj-panel .head{padding:10px 12px}#hhj-panel .tabs{padding:5px}#hhj-panel .tabs button{font-size:11px!important}#hhj-panel .metric{font-size:20px}#hhj-panel .card{padding:11px}}
`;
  style.id="hhj-style";
  const launcher=document.createElement("button");launcher.id="hhj-launch";launcher.type="button";launcher.textContent="HJ ◉";launcher.setAttribute("aria-label","Open Happy Jump Helper");
  // Inline presentation survives stylesheet loading failures or Torn CSS.
  launcher.style.cssText="position:fixed!important;top:43%!important;right:8px!important;bottom:auto!important;z-index:2147483647!important;background:#084b55!important;color:#ffffff!important;border:2px solid #9cf6e9!important;border-radius:24px!important;padding:12px 14px!important;min-height:46px!important;font:800 15px system-ui,sans-serif!important;display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;box-shadow:0 4px 18px #000c!important;";
  const panel=document.createElement("section");panel.id="hhj-panel";panel.style.display="none";panel.setAttribute("aria-label","Happy Jump Helper");panel.setAttribute("role","dialog");
  // TornPDA can inject before <body> exists, and Torn can replace body during
  // navigation. Never let either situation permanently remove the launcher.
  function mountHelper(){
    const root=document.body; // wait until body exists; never attach UI directly under <html>
    if(!root)return false;
    if(!document.getElementById("hhj-style")){
      (document.head||document.documentElement||root).appendChild(style);
    }
    if(!document.getElementById("hhj-launch"))root.appendChild(launcher);
    if(!document.getElementById("hhj-panel"))root.appendChild(panel);
    if(typeof window!=="undefined"&&window.__TornHappyJumpStage)
      window.__TornHappyJumpStage.phase="mounted";
    return true;
  }
  if(!mountHelper()&&typeof document.addEventListener==="function"){
    document.addEventListener("DOMContentLoaded",mountHelper,{once:true});
  }
  // This flag can be checked in TornPDA Developer Tools without API access.
  window.__TornHappyJumpLoaded="0.5.0";
  if(window.__TornHappyJumpStage)window.__TornHappyJumpStage.phase=mountHelper()?"mounted":"waiting-body";
  launcher.addEventListener("click",()=>{
    mountHelper();
    opened=!opened;panel.style.display=opened?"flex":"none";
    if(opened){
      try{render();}
      catch(error){
        panel.innerHTML='<div style="background:#111a2a;color:#fff;padding:20px;line-height:1.5">'+
          '<h3>Happy Jump Helper could not open</h3><p>'+
          escape(error?.message||"Unexpected UI error")+'</p>'+
          '<p>Reload Torn inside TornPDA, then try again. No gameplay action was attempted.</p>'+
          '<button id="hhj-emergency-close" type="button">Close</button></div>';
        panel.querySelector("#hhj-emergency-close")?.addEventListener("click",()=>{
          opened=false;panel.style.display="none";
        });
      }
    }
  });
  function captureVisibleGyms(){
    gymNotice="";
    if(!/\/gym\.php$/i.test(location.pathname||"")){
      gymNotice="Open Torn's Gym page inside TornPDA, then tap Capture visible gyms again. Nothing is clicked or changed in Torn.";
      gymEvidence=[];return;
    }
    const catalog=gymCatalog(data.gyms),found=new Map(),root=document.body;
    // Only inspect nodes already rendered on the user-opened Gym page after
    // a deliberate press of Capture. Never click, fetch or request a Torn page.
    const nodes=Array.from(root.querySelectorAll("h2,h3,h4,span,button,a,li,[class*='gym']"))
      .slice(0,6000);
    for(const node of nodes){
      if(node.closest?.("#hhj-panel"))continue;
      const t=(node.innerText||node.textContent||"").replace(/\s+/g," ").trim();
      if(!t||t.length>90)continue;
      const gym=catalog.find(g=>t===g.name||t===g.name+" Gym");
      if(!gym)continue;
      // The gym's name must be visibly rendered; class-based hidden children
      // are not evidence of unlock/availability.
      if(node.getClientRects&&node.getClientRects().length===0)continue;
      let el=node,context="";
      for(let j=0;j<3&&el;j++,el=el.parentElement){
        const str=(el.innerText||"").replace(/\s+/g," ").slice(0,450);
        if(str.length>gym.name.length&&str.length<450){context=str;break;}
      }
      const status=/locked|not yet unlocked|in progress|earn.*exp/i.test(context)?"locked":
        /buy membership|purchase membership|membership cost/i.test(context)?"buy":
        /\bactivate\b|\bselect gym\b|\bselected\b|\bactive\b/i.test(context)?"owned":"seen";
      if(!found.has(gym.id))found.set(gym.id,{id:gym.id,name:gym.name,status,
        snippet:context.slice(0,220)});
    }
    gymEvidence=[...found.values()];
    // Re-capture invalidates any previously confirmed gym no longer visible.
    const confirmed=new Set(gymEvidence.map(x=>String(x.id)));
    for(const id of Object.keys(verifiedGyms))if(!confirmed.has(id))delete verifiedGyms[id];
    gymVerifiedAt=Date.now();
    try{localStorage.setItem("hhj-verified-gyms-v1",
      JSON.stringify({at:gymVerifiedAt,statuses:verifiedGyms}));}catch(_){}
    // Always keep current active gym known, regardless of page presentation.
    const current=data.gym?.gym?.id;
    if(current!=null&&!found.has(+current)){
      const x=catalog.find(g=>g.id===+current);
      if(x)gymEvidence.push({id:x.id,name:x.name,status:"owned",snippet:"Current gym verified by Torn API"});
    }
    // Auto-detected memberships are display evidence only, NOT authorisation
    // to recommend: user explicitly confirms each relevant gym below.
    gymNotice=gymEvidence.length
      ?"Found "+gymEvidence.length+" visible gym entries. Confirm Owned or Unlocked to buy for the gyms you can actually access."
      :"No individual gym tiles could be confirmed from the current screen. Only your active gym will be recommended.";
  }
  function saveGymVerification(id,status){
    const candidate=gymEvidence.find(x=>x.id===+id);
    if(!candidate)return;
    if(["owned","buy"].includes(status))verifiedGyms[String(id)]=status;
    else delete verifiedGyms[String(id)];
    gymVerifiedAt=Date.now();
    try{localStorage.setItem("hhj-verified-gyms-v1",
      JSON.stringify({at:gymVerifiedAt,statuses:verifiedGyms}));}catch(_){}
  }
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
    const perkAudit=auditPerks(data.perks,key);
    const perksAll=perkAudit.rows.map(x=>x.description).join(" | ");
    const activeGoalOriented=/goal oriented|halve(?:s|d)?.{0,30}happ|reduce(?:s|d)?\s+(?:happy|happiness)\s+loss.*50\s*%/i.test(perksAll);
    const activeDvd=/erotic.{0,8}dvd.{0,50}(?:double|twice|100\s*%)/i.test(perksAll);
    const activeCooldown=/self control is for losers|all consumable cooldowns.*50\s*%/i.test(perksAll);
    const activeCandyBook=/yes please diabetes|double(?:s|d)? candy/i.test(perksAll);
    const activeBliss=/ignorance is bliss|happiness.{0,30}regenerat.{0,30}above max/i.test(perksAll);
    const factionCandy=perkAudit.rows.filter(x=>x.category==="faction"&&/candy|candies/i.test(x.description)&&/happ/i.test(x.description)&&!/reduc|decreas/i.test(x.description));
    const detectedCandy=factionCandy.reduce((mx,x)=>Math.max(mx,Number(x.description.match(/(\d+(?:\.\d+)?)\s*%/)?.[1]||0)),0);
    if(!Number.isFinite(bval)||!dots||!Number.isFinite(state.h.maximum))return null;
    return {stat:bval,statName:key,baseHappy:state.h.maximum,dots,gymCost,
      mod:(1+clamp(cfg.modifierPercent,-50,300)/100)*(cfg.autoPerks?perkAudit.factor:1),
      maxE:state.maxE,regenHour:state.e.interval>0
        ? 3600*state.e.increment/state.e.interval
        : (state.maxE>=150?30:20),
      refill:cfg.refill!=="no",refillMode:cfg.refill,maxJumpsDaily:cfg.maxJumpsDaily,
      budget:cfg.budget,candyPercent:cfg.candyPercent>0?cfg.candyPercent:detectedCandy,boosterReduction:cfg.boosterReduction,
       consumableReduction:activeCooldown?0.5:0,ignoreHappyReset:activeBliss,
       candyBookMultiplier:activeCandyBook?2:1,
      dvdHappy:activeDvd?Math.max(5000,cfg.dvdHappy):cfg.dvdHappy,boosterCap:cfg.boosterCap,
      books:Object.fromEntries(Object.entries(quotes).map(([k,v])=>[k,fresh(v)?v:null])),
       owned:state.owned,inventoryReady:!!data.inventory,happyLoss:activeGoalOriented?0.25:cfg.happyLoss,
       now:Math.floor(Date.now()/1000),currentEnergy:state.e.current,
       currentHappy:state.h.current,drugCooldown:data.cooldowns?.cooldowns?.drug||0,
       boosterCooldown:data.cooldowns?.cooldowns?.booster||0,
       regenInterval:state.e.interval||120,regenIncrement:state.e.increment||1,
       regenFirstSeconds:state.e.tick_time||state.e.interval||120,
       refillUsed:data.refills?.refills?.energy===false,
       available:true, // Plans while abroad are conditional until return.
       xanaxHours:cfg.xanaxHours,returnHours:cfg.returnHours,perkAudit};
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
      // user/perks already returns the currently active job, faction,
      // property, education, merit, stock and book descriptions grouped by source.
      // Avoid unrelated, permission-heavy calls for no training benefit.
      perks:"/user/perks",
      refills:"/user/refills",travel:"/user/travel",points:"/market/pointsmarket"
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
          for(const category of ["Candy","Booster","Book"]){
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
    recordObservedStats();
    dataRevision++;planMemo.key="";
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
    if(btn)btn.textContent="Happy reset "+secs(reset)+" · Drug "+secs((cd.drug||0)-fetchedAge)+" · Booster "+secs((cd.booster||0)-fetchedAge);
    const refreshButton=panel.querySelector("#hhj-refresh");
    if(refreshButton&&!busy)refreshButton.disabled=Date.now()-lastRefresh<60000;
  }

  function showSchedule(plan,hours=24){
    const timeline=plan?.timeline,events=timeline?.events||[];
    if(!timeline)return '<div class="warn">Refresh Torn data to build a dated timetable.</div>';
    const duration=+hours===168?168:24;
    const filtered=events.filter(e=>e.time>=timeline.start&&e.time<timeline.start+duration*3600);
    const subset=showAll?filtered:filtered.slice(0,45);
    const dates=subset.map(e=>'<div class="card"><div class="between"><span class="label">'+
      new Date(e.time*1000).toISOString().slice(0,16).replace("T"," ")+' UTC</span>'+
      '<span class="tiny">'+escape(e.kind.toUpperCase())+'</span></div><p>'+escape(e.detail)+'</p></div>').join("");
    return '<div class="card hero"><h3>Seven-day projected gains</h3>'+
      '<div class="metric">'+fmt(timeline.gain)+' stats/week</div>'+
      '<p>'+fmt(timeline.jumps)+' Happy jumps · '+fmt(timeline.energyTrained)+' E trained · '+
      fmt(timeline.lostRegen)+' E regeneration lost</p>'+
      '<p>Spending: '+(timeline.known?cash(timeline.cost):"Unverified or over budget")+
      ' · '+fmt(timeline.counts.xanax||0)+' Xanax · '+fmt((timeline.counts.points||0)/30)+' refills</p></div>'+
      '<div class="btnrow"><button data-hours="24" '+(duration===24?'class="primary"':'')+
      '>Next 24 hours</button><button data-hours="168" '+(duration===168?'class="primary"':'')+
      '>Full 7 days</button></div>'+
      '<h3>Manual actions · '+duration+' hours (UTC)</h3>'+
      (dates||'<div class="card">No scheduled actions in this window. Try the full seven days.</div>')+
      (filtered.length>45?'<button id="hhj-more">'+(showAll?'Show first 45':'Show all '+filtered.length+' actions')+'</button>':'')+
      '<div class="warn">Future times assume a '+timeline.assumptions.xanaxHours+
      '-hour Xanax cooldown, no overdoses, unchanged prices and manual actions exactly as listed. Refresh after real actions to replan.</div>';
  }
  function showGyms(input,live){
    const catalog=gymCatalog(data.gyms);
    const activeId=data.gym?.gym?.id;
    const stats=Object.fromEntries(STATS.map(k=>[k,live.bs[k]?.value||0]));
    const suggestions=gymSuggestions(catalog,activeId,verifiedGyms,
      input?.statName||cfg.stat,stats,{
        energy:Math.max(10,live.e.maximum||150),stat:input?.stat||0,
        happy:input?.baseHappy||5025,mod:input?.mod||1,happyLoss:input?.happyLoss||0.5
      });
    const active=suggestions.find(g=>g.status==="active")||null;
    const better=suggestions.filter(g=>g.status!=="active"&&g.improvement>0.2);
    const age=gymVerifiedAt?new Date(gymVerifiedAt).toLocaleDateString():"Never";
    let out='<h2>Gyms for '+escape(input?.statName||cfg.stat)+'</h2>'+
      '<p class="muted">Only the active gym and gyms you have explicitly confirmed as owned or visible to purchase can be recommended. Torn API does not disclose your full gym membership/unlock list.</p>'+
      '<div class="card hero"><div class="label">Currently active</div><h3>'+
      escape(active?.name||data.gym?.gym?.name||"Not loaded")+'</h3>'+
      '<p>'+(active?active.dots.toFixed(1)+' dots · '+active.energyCost+' E per train':'Refresh current gym data')+'</p>'+
      '<p class="tiny">Page verification last confirmed: '+escape(age)+'. Gym verification expires after 24 hours.</p></div>'+
      (better.length?'<h3>Better eligible gyms</h3>'+
        better.map(g=>'<div class="card"><h3>'+escape(g.name)+'</h3>'+
          '<p>'+g.dots.toFixed(1)+' dots for '+escape(input?.statName||cfg.stat)+
          ' · '+g.energyCost+' E/train · <b>+'+g.improvement.toFixed(1)+'% projected gain</b> for the same energy session</p>'+
          '<p>'+(g.status==="buy"?'Visible and unlocked, but not purchased. Membership '+cash(g.cost)+'. Buy manually in Torn.':
          'Owned and available; switch manually in Torn.')+'</p></div>').join(""):
        '<div class="card"><p>No superior *verified, eligible* gym was found for your selected stat. An unverified gym is never assumed accessible.</p></div>')+
      '<h3>Confirm gyms visible in Torn</h3>'+
      '<div class="card"><p>Open <b>Torn → Gym</b> and, while you are looking at its gym list, tap Capture below. The helper reads the already visible page only after this tap. It does not open or press anything in Torn.</p>'+
      '<button id="hhj-capture-gyms" class="primary" type="button">Capture visible gyms</button>'+
      '<details><summary>Can see a gym but the capture missed it?</summary>'+
      '<p class="tiny">On Torn’s Gym page only: select the gym you can physically see unlocked, then confirm its purchase state. This is local evidence, not a Torn action.</p>'+
      '<label>Gym visible on the page<select id="hhj-manual-gym">'+
      '<option value="">Select a gym you see</option>'+catalog.map(g=>'<option value="'+g.id+'">'+escape(g.name)+'</option>').join("")+
      '</select></label><label>Verified status<select id="hhj-manual-status">'+
      '<option value="owned">Already purchased</option><option value="buy">Unlocked, buy membership</option>'+
      '</select></label><button id="hhj-manual-confirm" type="button">Confirm visible gym</button></details>'+
      (gymNotice?'<p class="muted">'+escape(gymNotice)+'</p>':'')+'</div>';
    if(gymEvidence.length){
      out+='<div class="card"><h3>Visible gym verification</h3>'+
        '<p class="tiny">Please confirm these gym tiles against Torn. Unverified and locked gyms will never be recommended.</p>'+
        gymEvidence.map(item=>{
          const status=verifiedGyms[String(item.id)]||"unknown";
          const choices=[["unknown","Unverified / exclude"],["owned","Already purchased"],["buy","Unlocked, buy membership"],["locked","Locked / not available"]];
          return '<label>'+escape(item.name)+' <span class="tiny">(page suggested: '+escape(item.status)+')</span>'+
            '<select data-gym-check="'+item.id+'">'+choices.map(([v,t])=>
            '<option value="'+v+'" '+(status===v?'selected':'')+'>'+t+'</option>').join("")+'</select></label>';
        }).join("")+'</div>';
    }
    return out;
  }
  function showBonuses(input,live,plans){
    const perkAudit=input?.perkAudit||auditPerks(data.perks,cfg.stat);
    const categories=["faction","job","property","education","enhancer","book","stock","merit"];
    const stat=input?.statName||cfg.stat, current=input?.stat||0;
    const stats=Object.fromEntries(STATS.map(k=>[k,live.bs[k]?.value||0]));
    const stock=data.inventory?.inventory?.items||null;
    const books=bookAdvice(stock?stock.filter(i=>i.id>=744&&i.id<=787):null,
      stats,plans?.speed?.gain||0,stat);
    const relevant=trainingPerkRows(perkAudit.rows);
    const selected=plans?[...plans.baseline,...plans.options].filter(x=>
      x.known&&x.cost<=cfg.budget).sort((x,y)=>y.gain-x.gain)[0]:null;
    const milestones=input&&selected?targetProjection(input,selected.gain,selected.cost,
      [5e7,1e8,2e8,1e9,+cfg.bookGymMilestone]):[];
    const pointFor=target=>milestones.find(x=>x.target===target);
    const dateString=p=>p?.eta?new Date(p.eta+"T12:00:00Z").toLocaleDateString("en-GB",
      {month:"long",year:"numeric",timeZone:"UTC"}):"Not reached in 100-year model";
    let out='<h2>Training-related perks</h2>'+
      '<p class="muted">Only perks affecting gym gains, energy, happiness, boosters, drugs or cooldowns are shown. Passive combat-stat bonuses, ordinary bank returns and unrelated merits are excluded.</p>'+
      '<div class="card hero"><div class="label">Confirmed gym-gain modifier</div>'+
      '<div class="metric">'+(data.perks?(perkAudit.factor*100).toFixed(2)+"%":"API unavailable")+'</div>'+
      '<p>'+escape(stat)+' · '+(cfg.autoPerks?"Recognised gym multipliers enabled.":"Automatic gym modifiers disabled.")+
      ' Manual adjustment '+fmt(cfg.modifierPercent)+'%.</p>'+
      '<p class="tiny">Happy and maximum energy already reflected in Torn bars are not added again. Unrecognised perks are not silently converted into numbers.</p></div>';
    if(!data.perks)out+='<div class="warn">Live perk descriptions unavailable. Estimated gains may omit bonuses.</div>';
    let shown=0;
    for(const category of categories){
      const rows=relevant.filter(x=>x.category===category);
      if(!rows.length)continue;
      shown+=rows.length;
      out+='<details class="card" '+(category==="faction"||category==="job"?"open":"")+
        '><summary>'+category[0].toUpperCase()+category.slice(1)+' · '+rows.length+'</summary>'+
        '<ul>'+rows.map(x=>'<li>'+escape(x.description)+
          (x.applied?' <span class="good">[Applied to gym gains]</span>':
            ' <span class="tiny">[Related, not yet quantified]</span>')+'</li>').join("")+
        '</ul></details>';
    }
    if(data.perks&&!shown)out+='<div class="card">No explicitly training-related perk descriptions were returned.</div>';
    out+='<h2>Long-term battle-stat milestones</h2>'+
      '<p class="muted">For '+escape(stat)+', projected using '+escape(selected?.name||"no verified training plan")+
      ', the current gym and current weekly budget. This assumes you continue training this stat, so balance-mode changes, future gym unlocks, books, market movement and events will change the dates.</p>';
    if(milestones.length){
      out+=milestones.filter(p=>[5e7,1e8,1e9].includes(p.target))
        .map(p=>'<div class="card"><div class="between"><b>'+fmt(p.target)+' '+escape(stat)+'</b>'+
          '<span class="label">'+(p.weeks===0?"Already reached":p.eta||"Beyond projection")+'</span></div>'+
          '<p>'+ (p.weeks===null?"Not projected at this pace":
            fmt(p.weeks)+" weeks · estimated spend "+cash(p.cost))+'</p></div>').join("");
    }else out+='<div class="warn">Refresh data and verify prices to calculate projected milestone dates.</div>';
    out+='<h2>When to activate your books</h2>';
    if(stock===null)out+='<div class="warn">Book inventory unavailable, so no owned books are assumed.</div>';
    else if(!books.length)out+='<div class="card">No books were returned by the Book-category inventory.</div>';
    else out+=books.map(book=>{
      const isFocused=book.stat===stat;
      let when="No calculated activation window for this book";
      if(book.kind==="stat"){
        const target=pointFor(2e8);
        when=isFocused?(current>=2e8?
          "Now eligible for its full theoretical +10m value, once confirmed unread":
          "Save until "+fmt(2e8)+" "+stat+" · projected "+dateString(target)):
          "Save. Focus "+book.stat+" in Settings to calculate a date at 200m for this book.";
      }else if(book.kind==="gym"){
        const target=Math.max(1e6,+cfg.bookGymMilestone||5e7),point=pointFor(target);
        when=!book.stat||isFocused?
          (current>=target?"Consider your next high-output 31-day training block":
          "Suggested review milestone: "+fmt(target)+" "+stat+" · "+
          dateString(point)):"Wait until you are actively training "+book.stat;
      }else if(book.kind==="candy"){
        when="Review before a confirmed candy-boost event or planned jump period";
      }else if(book.kind==="regen"||book.kind==="energyDrink"||book.kind==="maxEnergy"){
        when="Plan a 31-day block with consistent daily energy use and minimal capped regeneration";
      }else if(book.kind==="happy"){
        when="Reserve for a purpose-built Happy training month, after comparing weekly gains";
      }else when="Review the benefit and spare book-slot opportunity before consuming";
      return '<div class="card"><h3>'+escape(book.name)+'</h3>'+
        '<p><b>'+escape(when)+'</b></p>'+
        '<p>'+escape(book.recommendation)+'</p>'+
        (book.extra>0?'<p class="muted">Illustrative current benefit: +'+fmt(book.extra)+' '+escape(book.stat||stat)+' stats</p>':'')+
        '<p class="tiny">Inventory may show a used display copy: still-usable status is unverified.</p></div>';
    }).join("");
    out+='<div class="warn">Book dates are a strategy heuristic, not an objectively optimal moment. A percentage stat book reaches its 10m cap at 200m in that stat; gym-gain books have no universal best stat threshold. Books are never used by this helper.</div>';
    return out;
  }
  function render(){
    if(!opened)return;
    const live=readyState(), input=buildInput();
    // A 7-day event simulation is expensive: recompute for actual changes in
    // inputs, never for tab navigation, dark mode or opening a detail card.
    const memoKey=dataRevision+"|"+JSON.stringify({
      budget:cfg.budget,stat:cfg.stat,statGoal:cfg.statGoal,objective:cfg.objective,
      maxJumpsDaily:cfg.maxJumpsDaily,refill:cfg.refill,
      gymOverride:cfg.gymOverride,modifierPercent:cfg.modifierPercent,
      candyPercent:cfg.candyPercent,dvdHappy:cfg.dvdHappy,boosterReduction:cfg.boosterReduction,
      happyLoss:cfg.happyLoss,boosterCap:cfg.boosterCap,
      autoPerks:cfg.autoPerks,xanaxHours:cfg.xanaxHours,returnHours:cfg.returnHours
    });
    if(planMemo.key!==memoKey){planMemo={key:memoKey,result:input?score(input):null};}
    const plans=planMemo.result;
    const list=plans?(cfg.scheduleMode==="happyjump"?plans.options:plans.baseline):[];
    const affordable=list.filter(x=>x.known&&x.cost<=cfg.budget&&(cfg.scheduleMode!=="happyjump"||x.jumps>0));
    const recommended=[...affordable].sort((a,b)=>{
      if(cfg.objective==="value"&&plans){
        const base=plans.naturalBenchmark;
        const v=x=>x.increment>0&&x.cost>base.cost?x.increment/(x.cost-base.cost):-1;
        if(v(a)!==v(b))return v(b)-v(a);
      }
      return b.gain-a.gain;
    })[0]||null;
    const chosen=list.find(x=>x.id===selected)||recommended||null;
    if(chosen&&!list.some(x=>x.id===selected))selected=chosen.id;
    panel.dataset.theme=cfg.theme==="light"?"light":"dark";
    const tile=(label,val)=>'<div class="tile"><div class="label">'+escape(label)+'</div><div class="metric">'+escape(val)+'</div></div>';
    const cost=x=>x.known?cash(x.cost):"Price unavailable";
    const displayGain=x=>fmt(x.gain)+" / week";
    const modeButtons='<div class="btnrow"><button data-mode="training" '+
      (cfg.scheduleMode==="training"?'class="primary"':'')+'>Training schedule</button>'+
      '<button data-mode="happyjump" '+(cfg.scheduleMode==="happyjump"?'class="primary"':'')+
      '>Happy-jump schedule</button></div>';
    const noData='<div class="warn"><b>No verified plan yet.</b><p>Tap Refresh Torn data. A Limited API key is needed for battle stats. If your current gym was not identified, you can enter its dots in Settings.</p></div>';
    const refreshMarkup='<div class="row" style="margin-bottom:12px"><button class="primary" id="hhj-refresh" type="button" '+
      (busy||Date.now()-lastRefresh<60000?"disabled":"")+'>'+(busy?"Refreshing…":"↻ Refresh Torn data")+
      '</button><span class="tiny">'+(lastRefresh?"Updated "+new Date(lastRefresh).toLocaleTimeString():"Not loaded")+'</span></div>';
    const warnings=(inventoryWarning?'<div class="warn"><b>Inventory optional</b><p>'+escape(inventoryWarning)+'</p></div>':'')+
      (errors.length?'<details class="card"><summary>'+errors.length+' other API issue(s)</summary>'+
      '<p>'+errors.map(escape).join('<br>')+'</p></details>':'');
    const travel=data.travel?.travel;
    const away=travel&&(travel.destination!=="Torn"||(travel.time_left||0)>0);
    const travelNotice=away?'<div class="warn"><b>Travel detected</b><p>Destination: '+
      escape(travel.destination)+'. '+(cfg.returnHours>0?
      'Gym actions projected '+cfg.returnHours+' hours after snapshot; confirm arrival.':
      'No known return time: this timetable is hypothetical. Set hours until return in Settings.')+'</p></div>':"";
    const statsExist=STATS.every(k=>Number.isFinite(live.bs[k]?.value));
    const total=STATS.reduce((sum,k)=>sum+(live.bs[k]?.value||0),0);
    const high=statsExist?Math.max(...STATS.map(k=>live.bs[k].value)):1;
    const statPanel=statsExist?'<div class="card"><h3>Battle stats</h3>'+
      STATS.map(k=>'<div class="between"><b>'+escape(k[0].toUpperCase()+k.slice(1))+
      (input?.statName===k?' <span class="good">• Target</span>':'')+'</b><span>'+fmt(live.bs[k].value)+'</span></div>'+
      '<div class="bars"><span style="width:'+Math.max(1,Math.round(100*live.bs[k].value/high))+'%"></span></div>').join("")+
      '<div class="between"><b>Base total</b><b>'+fmt(total)+'</b></div></div>':
      '<div class="card">Battle stats will appear here after a successful API refresh. No personal stats are stored in the GitHub repository.</div>';
    let body='';
    if(activeTab==='today'){
      body=refreshMarkup+warnings+travelNotice+'<h2>Your next training decision</h2>'+modeButtons+'<div class="status" id="hhj-timer">Calculating cooldowns…</div>'+
        (recommended?'<div class="card hero"><div class="label">'+
        (cfg.objective==='value'?'BEST VALUE RECOMMENDATION':'FASTEST GROWTH RECOMMENDATION')+'</div>'+
        '<h2>'+escape(recommended.name)+'</h2><div class="metric">'+displayGain(recommended)+'</div>'+
        '<p>'+cost(recommended)+' weekly · '+fmt(recommended.jumps)+' Happy jumps/week</p>'+
        '<p class="tiny">'+fmt(recommended.timeline?.energyTrained||0)+' E trained · '+
        fmt(recommended.timeline?.lostRegen||0)+' E regen lost · '+
        fmt(recommended.timeline?.counts.xanax||0)+' Xanax</p>'+
        '<p class="muted">Target '+escape(input.statName)+' · Budget '+cash(cfg.budget)+'</p>'+
        '<div class="btnrow"><button data-tab="steps" class="primary">View the steps</button>'+
        '<button data-tab="compare">Compare all methods</button></div></div>':noData)+
        '<h3>Current account</h3><div class="grid">'+
        tile('Energy',fmt(live.e.current)+' / '+fmt(live.e.maximum))+
        tile('Happiness',fmt(live.h.current)+' / '+fmt(live.h.maximum))+
        tile('Gym',live.selectedGym?.name||data.gym?.gym?.name||'Unknown')+
        tile('Points refill',data.refills?.refills?.energy===true?'Ready':data.refills?.refills?.energy===false?'Used':'Unknown')+
        '</div>'+statPanel+
        (input&&input.stat>=400000?'<div class="warn"><b>High-stat strategy matters</b>'+
        '<p>At this stat level, you should compare ordinary energy training with Happy stacking. The higher Happy is not automatically worth losing natural energy regeneration.</p></div>':'')+
        (plans?insights(live,input,plans):'')+
        '<p class="tiny">Actual API values only update on manual refresh. Timers between refreshes are local estimates.</p>';
    }else if(activeTab==='compare'){
      body='<h2>Compare training methods</h2><p class="muted">Target: '+escape(input?.statName||cfg.stat)+
        ' · Budget '+cash(cfg.budget)+'</p><div class="btnrow">'+
        '<button data-goal="growth" '+(cfg.objective==='growth'?'class="primary"':'')+'>Maximum stats</button>'+
        '<button data-goal="value" '+(cfg.objective==='value'?'class="primary"':'')+'>Best value</button></div>'+modeButtons;
      if(!plans)body+=refreshMarkup+warnings+noData;
      else{
        const base=plans.naturalBenchmark;
        const ranked=[...list].sort((a,b)=>{
          const ae=+(a.known&&a.cost<=cfg.budget),be=+(b.known&&b.cost<=cfg.budget);
          if(ae!==be)return be-ae;
          if(cfg.objective==='value'){
            const av=a.increment>0&&a.cost>base.cost?a.increment/(a.cost-base.cost):-1;
            const bv=b.increment>0&&b.cost>base.cost?b.increment/(b.cost-base.cost):-1;
            if(av!==bv)return bv-av;
          }
          return b.gain-a.gain;
        });
        body+='<p class="tiny">'+ranked.filter(p=>p.known&&p.cost<=cfg.budget).length+
          ' methods inside your weekly budget, ranked from a seven-day event simulation.</p>'+
          '<p class="tiny">Weekly gains are retained for a fair comparison. Choose a method to open its timetable.</p>'+
          (showAll?ranked:ranked.slice(0,8)).map(p=>{
            const note=!p.known?'Price missing':p.cost>cfg.budget?'Over budget':'Within budget';
            const gainDelta=(p.increment>=0?'+':'')+fmt(p.increment);
            const cp=p.known&&p.increment>0&&p.cost>base.cost?
              ' · '+cash((p.cost-base.cost)/p.increment)+'/additional stat':'';
            return '<button class="plan'+(selected===p.id?' chosen':'')+
              '" type="button" data-plan="'+escape(p.id)+'"><div class="between"><span class="heading">'+
              escape(p.name)+'</span><span class="tiny">'+note+'</span></div>'+
              '<div class="metric">'+displayGain(p)+'</div>'+
              '<div class="figures"><span>'+cost(p)+'</span><span>'+fmt(p.jumps)+' jumps / week</span>'+
              '<span>'+gainDelta+' vs natural'+cp+'</span></div></button>';
          }).join('')+
          '<button id="hhj-more" type="button">'+(showAll?'Show fewer methods':'Show all '+list.length+' methods')+'</button>'+
          '<div class="warn"><b>Simulation, not a guaranteed forecast</b><p>Excludes overdoses, exact cooldown variability, addiction and rehab, market slippage and your future online schedule.</p></div>';
      }
    }else if(activeTab==='steps'){
      body='<h2>Your training timetable</h2>'+modeButtons+travelNotice+
        '<div id="hhj-timer" class="status">Calculating cooldowns…</div>'+
        (chosen?showSchedule(chosen,cfg.scheduleHours):noData)+
        (chosen?.jumps?'<details class="card"><summary>Manual preparation checklist</summary>'+
          steps(chosen,live,input)+'</details>':'')+
        '<div class="btnrow"><button data-tab="compare">Compare another plan</button>'+
        '<button data-tab="settings">Adjust assumptions</button></div>';
    }else if(activeTab==='gyms'){
      body=refreshMarkup+warnings+showGyms(input,live);
    }else if(activeTab==='bonuses'){
      body=refreshMarkup+warnings+showBonuses(input,live,plans);
    }else{
      body='<h2>Settings</h2><p class="muted">Only your local helper settings change here. No Torn actions are performed.</p>'+
        '<div class="card"><h3>Training goals</h3><div class="grid">'+
        opt('objective','Optimise for',[['growth','Maximum stats'],['value','Best value for money']])+
        opt('statGoal','Stat targeting',[['weakest','Balance lowest stat'],['focus','Selected stat only']])+
        opt('stat','Selected stat',STATS.map(k=>[k,k[0].toUpperCase()+k.slice(1)]))+
        field('budget','Weekly budget ($)','number','min="0" step="100000"')+
        field('maxJumpsDaily','Maximum sessions each day','number','min="1" max="8"')+
        opt('refill','30-point daily energy refill',[['both','Compare both choices'],['yes','Always include'],['no','Never include']])+
        opt('theme','Appearance',[['dark','High contrast dark'],['light','Bright light']])+
        opt('scheduleMode','Training type',[['training','Regular training (no jumps)'],['happyjump','Happy-jump preparation']])+
        field('bookGymMilestone','Gym-book review milestone (stat)','number','min="1000000" max="1000000000" step="1000000"')+
        field('returnHours','Hours until return to Torn (0 = hypothetical now)','number','min="0" max="168" step="1"')+
        '</div><p class="tiny">Balance trains whichever stat is currently lowest; it is recalculated on refresh rather than treating this week as a fully scheduled mixed-stat plan.</p></div>'+
        '<div class="card"><h3>Perks and estimates</h3><div class="grid">'+
        field('modifierPercent','Total verified gym bonus (%)','number','min="-50" max="300"')+
        field('candyPercent','Candy happiness bonus (%)','number','min="0" max="800"')+
        opt('dvdHappy','Happy per eDVD',[[2500,'2,500'],[5000,'5,000 eligible perk']])+
        opt('boosterReduction','Candy cooldown reduction',[[0,'0%'],[0.1,'10%'],[0.25,'25%'],[0.5,'50%']])+
        opt('happyLoss','Happy lost / E',[[0.5,'0.5 normal'],[0.25,'0.25 eligible FC']])+
        field('gymOverride','Gym dots override (0 = API)','number','min="0" max="20" step="0.1"')+
        field('boosterCap','Booster cap (hours)','number','min="24" max="48"')+
        field('xanaxHours','Assumed Xanax cooldown (6–8h)','number','min="6" max="8" step="0.25"')+
        opt('autoPerks','Include detected gym bonuses',[[true,'Yes'],[false,'No']])+
        '</div><p class="tiny">Only enter bonuses that currently apply. Data and prices are model estimates.</p></div>'+
        refreshMarkup+warnings+'<details class="card"><summary>Privacy / diagnostic notes</summary>'+
        '<p>Your API key is only used for GET requests to Torn. It is not saved, sent to GitHub or placed in the URL. Settings stay local to TornPDA.</p></details>';
    }
    panel.innerHTML='<header class="head"><span class="brand">⚡ HAPPY JUMP HELPER <span class="tag">READ ONLY</span></span>'+
      '<button type="button" id="hhj-close" aria-label="Close panel">✕</button></header>'+
      '<nav class="tabs" aria-label="Pages">'+
      [['today','Today'],['compare','Compare'],['steps','Plan'],['gyms','Gyms'],['bonuses','Perks'],['settings','Settings']].map(([k,n])=>
      '<button type="button" data-tab="'+k+'" aria-selected="'+(activeTab===k?'true':'false')+'">'+n+'</button>').join('')+
      '</nav><div class="body">'+body+
      '<p class="tiny">IamEEKY · v0.4 beta · All gameplay steps are manual</p></div>';
    panel.querySelector('#hhj-close').onclick=()=>{opened=false;panel.style.display='none';};
    for(const btn of panel.querySelectorAll('#hhj-refresh'))btn.onclick=refresh;
    const capture=panel.querySelector('#hhj-capture-gyms');
    if(capture)capture.onclick=()=>{captureVisibleGyms();render();};
    const manual=panel.querySelector('#hhj-manual-confirm');
    if(manual)manual.onclick=()=>{
      if(!/\/gym\.php$/i.test(location.pathname||"")){
        gymNotice="Manual gym verification requires Torn’s Gym page to be open. No gym was added.";
        render();return;
      }
      const id=+panel.querySelector('#hhj-manual-gym')?.value;
      const status=panel.querySelector('#hhj-manual-status')?.value;
      const gym=gymCatalog(data.gyms).find(g=>g.id===id);
      if(!gym||!["owned","buy"].includes(status))return;
      if(!gymEvidence.some(x=>x.id===id))gymEvidence.push({id,name:gym.name,status:"seen",snippet:"Manually confirmed visible on gym page"});
      saveGymVerification(id,status);render();
    };
    for(const select of panel.querySelectorAll('[data-gym-check]'))select.onchange=()=>{
      saveGymVerification(select.dataset.gymCheck,select.value);render();
    };
    for(const btn of panel.querySelectorAll('[data-tab]'))btn.onclick=()=>{
      activeTab=btn.dataset.tab;render();panel.querySelector('.body')?.scrollTo(0,0);
    };
    for(const fieldElement of panel.querySelectorAll('[data-field]'))fieldElement.onchange=()=>{
      const key=fieldElement.dataset.field;
      if(['objective','stat','statGoal','theme','scheduleMode'].includes(key))cfg[key]=fieldElement.value;
      else if(key==='autoPerks')cfg[key]=fieldElement.value==='true';
      else if(key==='refill')cfg[key]=fieldElement.value;
      else cfg[key]=clamp(fieldElement.value,0,1e12);
      if(key==='maxJumpsDaily')cfg[key]=clamp(cfg[key],1,8);
      if(key==='boosterCap')cfg[key]=clamp(cfg[key],24,48);
      if(key==='boosterReduction')cfg[key]=clamp(cfg[key],0,0.75);
      if(key==='xanaxHours')cfg[key]=clamp(cfg[key],6,8);
      if(key==='returnHours')cfg[key]=clamp(cfg[key],0,168);
      if(key==='bookGymMilestone')cfg[key]=clamp(cfg[key],1000000,1000000000);
      try{localStorage.setItem('hhj-settings-v1',JSON.stringify(cfg));}catch(_){}
      selected='';completedSteps.clear();render();
    };
    for(const btn of panel.querySelectorAll('[data-mode]'))btn.onclick=()=>{
      cfg.scheduleMode=btn.dataset.mode;selected='';showAll=false;
      try{localStorage.setItem('hhj-settings-v1',JSON.stringify(cfg));}catch(_){}
      render();
    };
    for(const btn of panel.querySelectorAll('[data-hours]'))btn.onclick=()=>{
      cfg.scheduleHours=+btn.dataset.hours;showAll=false;
      try{localStorage.setItem('hhj-settings-v1',JSON.stringify(cfg));}catch(_){}
      render();
    };
    for(const btn of panel.querySelectorAll('[data-goal]'))btn.onclick=()=>{
      cfg.objective=btn.dataset.goal;selected='';
      try{localStorage.setItem('hhj-settings-v1',JSON.stringify(cfg));}catch(_){}
      render();
    };
    for(const btn of panel.querySelectorAll('[data-plan]'))btn.onclick=()=>{
      selected=btn.dataset.plan;completedSteps.clear();activeTab='steps';render();
      panel.querySelector('.body')?.scrollTo(0,0);
    };
    const more=panel.querySelector('#hhj-more');
    if(more)more.onclick=()=>{showAll=!showAll;render();};
    for(const box of panel.querySelectorAll('[data-step]'))box.onchange=()=>{
      const key=selected+':'+box.dataset.step;
      if(box.checked)completedSteps.add(key);else completedSteps.delete(key);
    };
    countdown();
  }
  function insights(live,input,plans){
    const tips=[];
    const best=plans.speed;
    const bestJump=plans.options.filter(x=>x.known&&x.jumps>0&&x.cost<=cfg.budget)
      .sort((a,b)=>b.gain-a.gain)[0];
    if(best?.id.includes("xanonly")&&bestJump){
      tips.push("Why regular Xanax currently wins: "+fmt(best.gain)+" projected stats versus "+
        fmt(bestJump.gain)+" from the highest-gain affordable Happy jump plan. "+
        "Regular training puts "+fmt(best.timeline.energyTrained)+" E into the gym; "+
        "the jump strategy puts "+fmt(bestJump.timeline.energyTrained)+" E in and forfeits "+
        fmt(bestJump.timeline.lostRegen)+" E natural regeneration. The difference is "+
        fmt(best.gain-bestJump.gain)+" stats/week under the model's assumptions.");
    }else if(bestJump){
      tips.push("Highest-gain affordable Happy-jump plan: "+bestJump.name+
        " • "+fmt(bestJump.jumps)+" planned jumps/week • "+fmt(bestJump.timeline.energyTrained)+" E trained.");
    }
    if(input.maxE<150)tips.push("Donator status can increase the energy cap and regeneration speed; model it against subscription or donator-pack costs.");
    if(input.baseHappy<5025)tips.push("A staffed Private Island can raise base happiness; compare rental costs. This helper uses current maximum Happy from your bars.");
    if(input.stat>=400000)tips.push("Above roughly 400k per stat, energy volume commonly dominates Happy stacking. At your current stat level the app must justify every jump against regular training.");
    if(cfg.candyPercent===0)tips.push("Check faction Voracity candy effects and World Diabetes Day, 13–15 November, before assuming a candy-based jump is optimal.");
    if(cfg.happyLoss!==0.25)tips.push("If you receive the Fitness Center Goal Oriented job bonus, select 0.25 Happy loss per E in Settings; otherwise the default remains 0.5.");
    if(cfg.dvdHappy!==5000)tips.push("An eligible Adult Novelties perk increases eDVD Happy; compare its job opportunity cost first.");
    if(data.perks && !input.perkAudit?.bonuses.length)tips.push("API perks were retrieved, but no gym multiplier was positively identified. Open Perks for an itemised audit and configure any missing bonuses manually.");
    if(data.refills?.refills?.energy===false && cfg.refill!=="no")tips.push("The points refill has already been used today. The timetable excludes today's additional refill, but may schedule future daily refills.");
    if(plans.options.some(p=>!p.known))tips.push("Some plans are excluded because they exceed your cash limit, lack verified item quotes, or cannot complete a Happy jump.");
    const natural=plans.naturalBenchmark;
    const bestXan=plans.baseline.filter(p=>p.id.includes("xanonly")&&p.known).sort((a,b)=>b.gain-a.gain)[0];
    if(bestXan && bestXan.gain>natural.gain)tips.push("Prompt Xanax training beats free energy-only training by "+
      fmt(bestXan.gain-natural.gain)+" projected stats/week, costing "+cash(bestXan.cost)+
      ". Xanax usage is "+fmt(bestXan.timeline.counts.xanax||0)+" doses in this model.");
    return '<h3>Why these results?</h3><div class="card"><ul>'+tips.map(s=>'<li>'+escape(s)+'</li>').join("")+'</ul></div>';
  }
  function steps(p,live,input){
    const events=p.timeline?.events||[];
    const firstIndex=events.findIndex(x=>x.kind==="jump");
    const first=firstIndex>=0?events[firstIndex]:null;
    const nextJumpIndex=events.findIndex((x,i)=>i>firstIndex&&x.kind==="jump");
    const until=nextJumpIndex<0?events.length:nextJumpIndex;
    const firstTrained=first?events.slice(firstIndex,until)
      .filter(x=>x.kind==="train").reduce((v,x)=>v+x.qty,0):0;
    const firstHappy=first?.detail.match(/Predicted Happy ([\d,]+)/)?.[1]||"Unverified";
    const firstTime=first?new Date(first.time*1000).toISOString().slice(0,16).replace("T"," ")+" UTC":"Unavailable";
    const booster=p.count?fmt(p.count)+" × "+ITEMS[p.type].label:
      (p.dvds?fmt(p.dvds)+" × Erotic DVD":"none");
    const required=p.timeline?.counts||{};
    const resources=Object.entries(required).filter(([k,q])=>q>0)
      .map(([k,q])=>k==="points"?q+" points":q+" × "+(ITEMS[k]?.label||k));
    const currentCd=data.cooldowns?.cooldowns||{};
    const canDrug=(currentCd.drug||0)===0;
    const canBooster=(currentCd.booster||0)+(p.perBoosterHours||0)*3600<=input.boosterCap*3600;
    const ready=p.xanax===0&&canDrug&&canBooster&&live.e.current>=live.e.maximum;
    const checklist=[
      "Check you're back in Torn and have gym access. Confirm current drug and booster cooldowns, energy, inventory, book effects and faction/company perks. "+
        (ready?"Cooldown and energy readiness checks pass at the last snapshot.":"The last snapshot does not show immediate readiness."),
      p.xanax?"Manually take "+p.xanax+" Xanax, one at a time with their actual drug cooldowns. The planner assumes "+
        cfg.xanaxHours+" hours each; update it after the real timer changes.":"Allow natural energy to fill before jump preparation.",
      "Only start boosters immediately after a Torn :00, :15, :30 or :45 reset when the schedule shows the drug cooldown is clear.",
      "Use "+booster+" manually and verify Happy and booster cooldown in Torn.",
      "Manually use one Ecstasy only when drug cooldown permits. An overdose invalidates this timetable; refresh before proceeding.",
      "Immediately train "+input.statName+" in your current gym before the next 15-minute Happy reset.",
      p.refill&&required.points?"Where scheduled, manually use the daily 30-point refill after training down enough energy, then train again.":"No successful point refill was included in the computed schedule.",
      "After the actual train, manually refresh the helper. It will update the next timestamp based on your new bars and cooldowns."
    ];
    return '<h3>Jump preparation: '+escape(p.name)+'</h3><div class="card">'+
      '<div class="grid">'+titleMini("First planned jump",firstTime)+
      titleMini("Predicted first-jump Happy",firstHappy)+
      titleMini("First jump training",fmt(firstTrained)+" E")+
      titleMini("Planned weekly jumps",fmt(p.timeline?.jumps||0))+'</div>'+
      '<p><b>Expected weekly consumables:</b> '+escape(resources.join(" · ")||"None")+'</p>'+
      '<p class="tiny">Manual checkmarks stay on this screen only. The UTC timetable above is authoritative for this simulation; actual cooldowns override it.</p>'+
      '<ol>'+checklist.map((x,i)=>'<li><label class="step"><input data-step="'+i+
        '" type="checkbox" '+(completedSteps.has(p.id+":"+i)?"checked":"")+
        '><span>'+escape(x)+'</span></label></li>').join("")+'</ol>'+
      '<div class="warn">The future schedule is conditional on assumed cooldowns, exact check-ins, no overdoses and uninterrupted access. No Torn actions are automated.</div></div>';
  }
  function titleMini(k,v){return '<div><div class="label">'+escape(k)+'</div><b>'+escape(v)+'</b></div>';}
  let lastMountCheck=0;
  window.setInterval(()=>{
    if(opened)countdown();
    if(Date.now()-lastMountCheck>=5000){
      lastMountCheck=Date.now();
      mountHelper(); // DOM-only recovery after Torn re-renders; never calls the API
    }
  },1000); // only local countdown and DOM attachment; NO automatic API calls
})();
