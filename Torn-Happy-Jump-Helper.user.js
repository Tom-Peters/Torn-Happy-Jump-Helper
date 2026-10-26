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
      boosterSeconds=Math.max(0,opts.boosterCooldown||0), regenBank=0,
      prep=0,jumps=0,cashEstimate=0, cashKnown=true, trainCount=0,
      lastDay=-1,refilledToday=false;
    const refills=!!plan.refill, isXan=plan.id?.includes("xanonly"),
      isNormal=plan.id?.includes("normal")&&!isXan,
      isJump=!isNormal&&!isXan;
    const requiredXan=isJump?(plan.xanax||0):0;
    const boosterHours=isJump?(plan.perBoosterHours||0):0;
    const add=(time,kind,detail,qty=0,gain=0)=>activity.push({time,kind,detail,qty,gain});
    function unit(kind){const p=quotePrice(input.books[kind]);return Number.isFinite(p)?p:NaN;}
    function canPay(items){
      let due=0;
      for(const [kind,quantity] of Object.entries(items)){
        if(!quantity)continue;
        const price=unit(kind);
        if(!Number.isFinite(price))return false;
        const qtyPurchased=Math.max(0,(counts[kind]||0)+quantity-(input.inventoryReady?(input.owned[kind]||0):0));
        const prevQty=Math.max(0,(counts[kind]||0)-(input.inventoryReady?(input.owned[kind]||0):0));
        due+=(qtyPurchased-prevQty)*price;
      }
      return cashEstimate+due<=input.budget;
    }
    function consume(time,kind,quantity){
      const price=unit(kind);
      if(!Number.isFinite(price)){cashKnown=false;return false;}
      const prev=Math.max(0,(counts[kind]||0)-(input.inventoryReady?(input.owned[kind]||0):0));
      counts[kind]=(counts[kind]||0)+quantity;
      const newBuy=Math.max(0,counts[kind]-(input.inventoryReady?(input.owned[kind]||0):0));
      cashEstimate+=(newBuy-prev)*price;
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
      if(day!==lastDay){lastDay=day;refilledToday=day===Math.floor(start/86400)&&opts.refillUsed===true;}
      if(t%900===0)h=Math.min(h,input.baseHappy);
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
          consume(t,"xanax",1);e=Math.min(limit,e+250);nextDrug=t+cdX;
          add(t,"xanax","Manually take Xanax • +250 E; assumed next drug availability "+new Date(nextDrug*1000).toISOString(),250);
          train(t,"Train Xanax energy promptly");
        }
        if(t%86400>=12*3600&&!refilledToday){if(e>=input.gymCost)train(t,"Train before daily refill");useRefill(t);}
      }else{
        // Keep a complete repeatable sequence: stack Xanax, wait for drug
        // cooldown to finish, then boost Happy and train at +1 min after :15.
        if(prep<requiredXan&&t>=nextDrug&&t>=nextXan&&
          e<limit&&canPay({xanax:1})){
          consume(t,"xanax",1);e=Math.min(limit,e+250);prep++;
          nextDrug=t+cdX;nextXan=nextDrug;
          add(t,"xanax","Manually stack Xanax "+prep+"/"+requiredXan+" • +250 E",250);
        }
        if(prep>=requiredXan&&t>=nextDrug&&t%900===60&&
          e>=Math.min(limit,normalCap+requiredXan*250)&&
          boosterSeconds+boosterHours*3600<=input.boosterCap*3600){
          const required={ecstasy:1};
          if(plan.count)required[plan.type]=plan.count;
          if(plan.dvds)required.dvd=plan.dvds;
          if(canPay(required)){
            for(const [k,v] of Object.entries(required))consume(t,k,v);
            const boosterHappy=(plan.count||0)*ITEMS[plan.type].happy*(1+clamp(input.candyPercent,0,800)/100)
              +(plan.dvds||0)*input.dvdHappy;
            boosterSeconds+=boosterHours*3600;
            h=Math.min(99999,2*(h+boosterHappy));jumps++;
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
    return {start,end,events:activity,counts,gain:totalGain,perJump:jumps?totalGain/jumps:null,
      finalStat:stat,jumps,cost:known?cost:NaN,known:known&&cashKnown&&cost<=input.budget,
      overBudget:known&&cost>input.budget,energyTrained:spentE,energyLeft:e,lostRegen,
      trainCount,assumptions:{xanaxHours:cdX/3600,ecstasyHours:cdE/3600,regenInterval,available},
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
        const m=description.match(/(?:\+|increase(?:s|d)?(?:\s+\w+){0,4}\s+(?:by\s+)?)\s*(\d+(?:\.\d+)?)\s*%/i);
        const relevant=/(gym\s*(?:training\s*)?gains?|gains?\s*(?:in|from)\s*(?:the\s*)?gym)/i.test(description);
        const scoped=/(strength|speed|defen[cs]e|dexterity)/i.exec(description);
        if(m&&relevant&&(!scoped||scoped[1].toLowerCase().replace("defence","defense")===target)){
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
  function bookAdvice(stock, stats={}, weeklyGain=0) {
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
        recommendation="SAVE unless you can train heavily every day for all 31 days. "+
          "Gym bonuses usually become more valuable as stats grow. "+
          (b.stat?"Only applies to "+b.stat+".":"Applies to every stat.");
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
  const Engine={ITEMS,marketCost,quotePrice,gainTrain,gainRegular,baseline,strategies,score,schedule,auditPerks,bookAdvice,BOOK_INFO};
  if(typeof module!=="undefined" && module.exports) { module.exports=Engine; return; }
  if(!location.hostname.endsWith("torn.com") || document.getElementById("hhj-launch"))return;
  let data={}, quotes={}, lastRefresh=0, errors=[],selected="", opened=false,busy=false;
  let inventoryWarning="",activeTab="today",showAll=false;
  const completedSteps=new Set(); // Local tick-boxes only, never Torn gameplay actions.
  const defaults={budget:10000000,stat:"dexterity",statGoal:"weakest",objective:"growth",
    maxJumpsDaily:6,maxE:150,
    candyPercent:0,boosterReduction:0,dvdHappy:2500,boosterCap:24,modifierPercent:0,happyLoss:0.5,
    autoPerks:true,xanaxHours:7,viewUnit:"week",returnHours:0,
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
  }catch(_){}
  const style=document.createElement("style");
  style.textContent = `
#hhj-launch{position:fixed!important;bottom:90px;right:12px;z-index:2147483646!important;background:#155e72!important;color:#fff!important;border:2px solid #a5f3fc!important;border-radius:999px!important;padding:12px 16px!important;font:800 15px system-ui,sans-serif!important;box-shadow:0 4px 22px #000b!important;cursor:pointer}
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
#hhj-panel .tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));background:var(--hj-card);gap:3px;padding:7px;border-bottom:1px solid var(--hj-line);flex-shrink:0}
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
    const perkAudit=auditPerks(data.perks,key);
    if(!Number.isFinite(bval)||!dots||!Number.isFinite(state.h.maximum))return null;
    return {stat:bval,statName:key,baseHappy:state.h.maximum,dots,gymCost,
      mod:(1+clamp(cfg.modifierPercent,-50,300)/100)*(cfg.autoPerks?perkAudit.factor:1),
      maxE:state.maxE,regenHour:state.e.interval>0
        ? 3600*state.e.increment/state.e.interval
        : (state.maxE>=150?30:20),
      refill:cfg.refill!=="no",refillMode:cfg.refill,maxJumpsDaily:cfg.maxJumpsDaily,
      budget:cfg.budget,candyPercent:cfg.candyPercent,boosterReduction:cfg.boosterReduction,
      dvdHappy:cfg.dvdHappy,boosterCap:cfg.boosterCap,
      books:Object.fromEntries(Object.entries(quotes).map(([k,v])=>[k,fresh(v)?v:null])),
       owned:state.owned,inventoryReady:!!data.inventory,happyLoss:cfg.happyLoss,
       now:Math.floor(Date.now()/1000),currentEnergy:state.e.current,
       currentHappy:state.h.current,drugCooldown:data.cooldowns?.cooldowns?.drug||0,
       boosterCooldown:data.cooldowns?.cooldowns?.booster||0,
       regenInterval:state.e.interval||120,regenIncrement:state.e.increment||1,
       refillUsed:data.refills?.refills?.energy===false,
       available:!(data.travel?.travel?.destination&&data.travel.travel.destination!=="Torn"),
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
      perks:"/user/perks",merits:"/user/merits",education:"/user/education",
      job:"/user/job",property:"/user/property",stocks:"/user/stocks",
      faction:"/faction/upgrades",
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

  function showSchedule(plan,mode="week"){
    const timeline=plan?.timeline,events=timeline?.events||[];
    if(!timeline)return '<div class="warn">Refresh live data to build a dated schedule.</div>';
    const jumpEvents=events.filter(x=>x.kind==="jump");
    const weekGain=fmt(timeline.gain),perJump=jumpEvents.length?fmt(timeline.gain/jumpEvents.length):"Not a jump";
    const selector='<div class="btnrow"><button type="button" data-view="week" '+(mode==="week"?'class="primary"':'')+
      '>Per week</button><button type="button" data-view="jump" '+(mode==="jump"?'class="primary"':'')+'>Per jump</button></div>';
    const hero='<div class="card hero"><h3>Estimated '+(mode==="jump"?"gain per Happy jump":"seven-day gain")+'</h3>'+
      '<div class="metric">'+(mode==="jump"?perJump:weekGain)+'</div>'+
      '<p>'+fmt(timeline.jumps)+' jumps/week · '+fmt(timeline.energyTrained)+' E trained/week · '+
      fmt(timeline.lostRegen)+' E regeneration lost</p>'+
      '<p>Planned spend: '+(timeline.known?cash(timeline.cost):"Unknown or over budget")+'</p></div>';
    const eligible=mode==="jump"?events.filter(x=>x.kind==="jump"||x.kind==="train"||x.kind==="refill"):events;
    const cutoff=showAll?eligible:eligible.slice(0,35);
    const dates=cutoff.map((event,i)=>{
      const time=new Date(event.time*1000).toISOString().slice(0,16).replace("T"," ")+" UTC";
      return '<div class="card"><div class="between"><span class="label">'+time+'</span>'+
        '<span class="tiny">'+escape(event.kind.toUpperCase())+'</span></div>'+
        '<p>'+escape(event.detail)+'</p></div>';
    }).join("");
    const note='<div class="warn"><b>Scheduled timestamps are conditional.</b>'+
      '<p>These times assume every planned click is made exactly when shown, no overdoses and a '+timeline.assumptions.xanaxHours+
      '-hour Xanax cooldown. Torn drug cooldowns vary; refresh after each actual action. Gym training is only possible when in Torn.'+
      ' The script never performs these actions.</p></div>';
    return selector+hero+
      '<h3>UTC action timetable</h3>'+
      (!events.length?'<div class="warn">No executable training events for this configuration. Check permissions, prices and cooldowns.</div>':dates)+
      (eligible.length>35?'<button id="hhj-more"> '+(showAll?"Show first 35":"Show all "+eligible.length+" actions")+'</button>':'')+
      note;
  }
  function showBonuses(input,live){
    const dataReady=!!data.perks,perks=input?.perkAudit||auditPerks(data.perks,cfg.stat);
    const groups=["faction","job","property","education","enhancer","book","stock","merit"];
    const job=data.job?.job,merits=data.merits?.merits?.upgrades||[],
      holdings=data.stocks?.stocks||[], education=data.education?.education,
      property=data.property?.property;
    const stats=Object.fromEntries(STATS.map(k=>[k,live.bs[k]?.value||0]));
    const rawBooks=data.inventory?.inventory?.items?.filter(i=>i.id>=744&&i.id<=787)||null;
    const books=bookAdvice(rawBooks,stats,input?.stat>0?input.stat*0+((input&&input.dots)?gainTrain(1000,input.baseHappy,input.stat,input.dots,input.mod,input.gymCost,input.happyLoss)*7:0):0);
    let out='<h2>Passive effects & books</h2><p class="muted">Read-only source audit. Only recognised gym-gain perks influence the model; combat-effective merits do not count as gym gains.</p>'+
      '<div class="card hero"><div class="label">Detected training perk multiplier</div><div class="metric">'+
      (dataReady?(perks.factor*100).toFixed(2)+"%":"Not loaded")+'</div>'+
      '<p>'+ (cfg.autoPerks?"Auto-recognised gym gain perks are included.":"Automatic bonuses disabled in Settings.")+
      ' Manual bonus: '+fmt(cfg.modifierPercent)+'% (check it does not duplicate API effects).</p>'+
      '<p class="tiny">Other active benefits may affect happy, energy, refill size, cooldowns or effective combat stats. These are shown but not automatically turned into unsupported training multipliers.</p></div>';
    if(!dataReady)out+='<div class="warn">Perk details are not available from this refresh. Any benefits still missing are not included in the gain multiplier.</div>';
    for(const k of groups){
      const rows=perks.rows.filter(x=>x.category===k);
      out+='<details class="card" '+(k==="faction"||k==="job"?"open":"")+'><summary>'+k[0].toUpperCase()+k.slice(1)+
        ' — '+rows.length+' active descriptions</summary>'+
        (rows.length?'<ul>'+rows.map(x=>'<li>'+escape(x.description)+(x.applied?' <span class="good">[Modelled as gym gain]</span>':' <span class="tiny">[Informational / not quantified]</span>')+'</li>').join("")+'</ul>':
          '<p class="tiny">No confirmed perks returned for this source.</p>')+'</details>';
    }
    out+='<div class="card"><h3>Account context</h3>'+
      '<p>Company: '+escape(job?.name||job?.type||"Unknown")+
      (Number.isFinite(job?.rating)?" · "+job.rating+" stars":"")+'</p>'+
      '<p>Property: '+escape(property?.name||property?.property?.name||"Current happy already reflected in bars")+'</p>'+
      '<p>Merit upgrades: '+(data.merits?merits.length+" recorded":"API unavailable")+'</p>'+
      '<p>Completed education courses: '+(education?education.complete.length:"API unavailable")+'</p>'+
      '<p>Held stock types: '+(data.stocks?holdings.length:"API unavailable")+'</p>'+
      '<p>Faction upgrade API: '+(data.faction?"Available; refer to faction perks above":"Unavailable or faction access not granted")+'</p>'+
      '<p class="tiny">Company, property, faction and stock descriptions are sourced from Torn. Stock dividends and job points are not assumed to have been claimed or redeemed.</p></div>';
    out+='<h2>Your books</h2>'+
      (rawBooks===null?'<div class="warn"><b>Book inventory unavailable.</b><p>Inventory can fail independently (including error 21). No ownership or unused status has been assumed.</p></div>':
      !books.length?'<div class="card">No books appeared in the returned book inventory. This does not prove you own none if a category response was incomplete.</div>':
      books.map(b=>'<div class="card"><h3>'+escape(b.name)+'</h3>'+
        '<p>'+escape(b.recommendation)+'</p>'+
        (b.threshold?'<p class="good">Maximum value at '+fmt(b.threshold)+' '+escape(b.stat)+'.</p>':'')+
        (b.forecast?'<p class="muted">Illustrative timing: '+escape(b.forecast)+'.</p>':'')+
        '<p class="tiny">'+escape(b.ownership)+'</p></div>').join(""))+
      '<div class="warn">Books are unique and usually provide one 31-day use. Used books remain as display copies in inventory: check the item in Torn before treating this as a usable asset. No book is automatically used.</div>';
    return out;
  }
  function render(){
    if(!opened)return;
    const live=readyState(), input=buildInput(), plans=input?score(input):null;
    const list=plans?[...plans.baseline,...plans.options]:[];
    const recommended=plans?(cfg.objective==="value"?(plans.value||plans.speed):plans.speed):null;
    const chosen=list.find(x=>x.id===selected)||recommended||null;
    if(chosen&&!list.some(x=>x.id===selected))selected=chosen.id;
    panel.dataset.theme=cfg.theme==="light"?"light":"dark";
    const tile=(label,val)=>'<div class="tile"><div class="label">'+escape(label)+'</div><div class="metric">'+escape(val)+'</div></div>';
    const cost=x=>x.known?cash(x.cost):"Price unavailable";
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
      escape(travel.destination)+'. If you are travelling or abroad, treat this as a preparation plan and confirm gym access after returning to Torn.</p></div>':"";
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
      body=refreshMarkup+warnings+travelNotice+'<h2>Your next training decision</h2><div class="status" id="hhj-timer">Calculating cooldowns…</div>'+
        (recommended?'<div class="card hero"><div class="label">'+
        (cfg.objective==='value'?'BEST VALUE RECOMMENDATION':'FASTEST GROWTH RECOMMENDATION')+'</div>'+
        '<h2>'+escape(recommended.name)+'</h2><div class="metric">'+fmt(recommended.gain)+' <span style="font-size:13px">stats/week</span></div>'+
        '<p>'+cost(recommended)+' weekly · '+fmt(recommended.jumps)+' Happy jumps/week</p>'+
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
        '<button data-goal="value" '+(cfg.objective==='value'?'class="primary"':'')+'>Best value</button></div>';
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
          ' methods inside your weekly budget.</p>'+
          (showAll?ranked:ranked.slice(0,8)).map(p=>{
            const note=!p.known?'Price missing':p.cost>cfg.budget?'Over budget':'Within budget';
            const gainDelta=(p.increment>=0?'+':'')+fmt(p.increment);
            const cp=p.known&&p.increment>0&&p.cost>base.cost?
              ' · '+cash((p.cost-base.cost)/p.increment)+'/additional stat':'';
            return '<button class="plan'+(selected===p.id?' chosen':'')+
              '" type="button" data-plan="'+escape(p.id)+'"><div class="between"><span class="heading">'+
              escape(p.name)+'</span><span class="tiny">'+note+'</span></div>'+
              '<div class="metric">'+fmt(p.gain)+' <span style="font-size:12px">stats / week</span></div>'+
              '<div class="figures"><span>'+cost(p)+'</span><span>'+fmt(p.jumps)+' jumps / week</span>'+
              '<span>'+gainDelta+' vs natural'+cp+'</span></div></button>';
          }).join('')+
          '<button id="hhj-more" type="button">'+(showAll?'Show fewer methods':'Show all '+list.length+' methods')+'</button>'+
          '<div class="warn"><b>Simulation, not a guaranteed forecast</b><p>Excludes overdoses, exact cooldown variability, addiction and rehab, market slippage and your future online schedule.</p></div>';
      }
    }else if(activeTab==='steps'){
      body='<h2>Manual training checklist</h2>'+travelNotice+
        '<div id="hhj-timer" class="status">Calculating cooldowns…</div>'+
        (chosen?.jumps?steps(chosen,live,input):
          chosen?'<div class="card hero"><h3>'+escape(chosen.name)+'</h3><p>'+escape(chosen.desc)+'</p>'+
          '<p>Predicted '+fmt(chosen.gain)+' stats/week · '+cost(chosen)+
          '</p><p>This method is normal training. No Happy-jump actions are required.</p></div>':noData)+
        '<div class="btnrow"><button data-tab="compare">Choose another method</button>'+
        '<button data-tab="settings">Adjust assumptions</button></div>';
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
        '</div><p class="tiny">Balance trains whichever stat is currently lowest; it is recalculated on refresh rather than treating this week as a fully scheduled mixed-stat plan.</p></div>'+
        '<div class="card"><h3>Perks and estimates</h3><div class="grid">'+
        field('modifierPercent','Total verified gym bonus (%)','number','min="-50" max="300"')+
        field('candyPercent','Candy happiness bonus (%)','number','min="0" max="800"')+
        opt('dvdHappy','Happy per eDVD',[[2500,'2,500'],[5000,'5,000 eligible perk']])+
        opt('boosterReduction','Candy cooldown reduction',[[0,'0%'],[0.1,'10%'],[0.25,'25%'],[0.5,'50%']])+
        opt('happyLoss','Happy lost / E',[[0.5,'0.5 normal'],[0.25,'0.25 eligible FC']])+
        field('gymOverride','Gym dots override (0 = API)','number','min="0" max="20" step="0.1"')+
        field('boosterCap','Booster cap (hours)','number','min="24" max="48"')+
        '</div><p class="tiny">Only enter bonuses that currently apply. Data and prices are model estimates.</p></div>'+
        refresh+warnings+'<details class="card"><summary>Privacy / diagnostic notes</summary>'+
        '<p>Your API key is only used for GET requests to Torn. It is not saved, sent to GitHub or placed in the URL. Settings stay local to TornPDA.</p></details>';
    }
    panel.innerHTML='<header class="head"><span class="brand">⚡ HAPPY JUMP HELPER <span class="tag">READ ONLY</span></span>'+
      '<button type="button" id="hhj-close" aria-label="Close panel">✕</button></header>'+
      '<nav class="tabs" aria-label="Pages">'+
      [['today','Overview'],['compare','Compare'],['steps','Steps'],['settings','Settings']].map(([k,n])=>
      '<button type="button" data-tab="'+k+'" aria-selected="'+(activeTab===k?'true':'false')+'">'+n+'</button>').join('')+
      '</nav><div class="body">'+body+
      '<p class="tiny">IamEEKY · v0.2 · All gameplay steps are manual</p></div>';
    panel.querySelector('#hhj-close').onclick=()=>{opened=false;panel.style.display='none';};
    for(const btn of panel.querySelectorAll('#hhj-refresh'))btn.onclick=refresh;
    for(const btn of panel.querySelectorAll('[data-tab]'))btn.onclick=()=>{
      activeTab=btn.dataset.tab;render();panel.querySelector('.body')?.scrollTo(0,0);
    };
    for(const fieldElement of panel.querySelectorAll('[data-field]'))fieldElement.onchange=()=>{
      const key=fieldElement.dataset.field;
      if(['objective','stat','statGoal','theme'].includes(key))cfg[key]=fieldElement.value;
      else if(key==='refill')cfg[key]=fieldElement.value;
      else cfg[key]=clamp(fieldElement.value,0,1e12);
      if(key==='maxJumpsDaily')cfg[key]=clamp(cfg[key],1,8);
      if(key==='boosterCap')cfg[key]=clamp(cfg[key],24,48);
      if(key==='boosterReduction')cfg[key]=clamp(cfg[key],0,0.75);
      try{localStorage.setItem('hhj-settings-v1',JSON.stringify(cfg));}catch(_){}
      selected='';completedSteps.clear();render();
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
    if (input.maxE<150)tips.push("Donator status raises the energy cap to 150 and natural regeneration to 30 E/hour. Compare its cost before buying additional boosters.");
    if (input.baseHappy<5025)tips.push("A well-staffed Private Island can raise base happiness to 5,025. Compare rental cost and the improvement in every train.");
    if (input.stat>=100000)tips.push("This stat is already fairly developed. Check the net weekly gains column: normal Xanax training can beat Happy stacking after lost regeneration.");
    if (input.stat>=1000000)tips.push("At high stats, prioritise sustainable energy per day, the strongest eligible gym and training bonuses; consider stat enhancers separately.");
    if (cfg.candyPercent===0)tips.push("Check Voracity candy perks and World Diabetes Day (13–15 November); set the actual bonus manually only while it applies.");
    if (cfg.happyLoss!==0.25)tips.push("A 3-star Fitness Center offers Goal Oriented, halving happy lost from gym training; choose 0.25 only if you receive that bonus.");
    if (cfg.dvdHappy!==5000)tips.push("A 10-star Adult Novelties job may double eDVD happiness to 5,000, but weigh job changes against other benefits.");
    if (cfg.modifierPercent===0)tips.push("Enter verified education, Steadfast faction, company, book and gym-gain bonuses to improve estimates.");
    if (data.refills?.refills?.energy===false && cfg.refill!=="no")tips.push("Today's points energy refill appears unavailable; the weekly projection assumes seven future daily refills, not an immediately available refill.");
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
      p.refill?"Only AFTER spending enough energy to allow it, manually perform the one daily 30-point refill, then train again before the reset.":"No point refill was budgeted.",
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
