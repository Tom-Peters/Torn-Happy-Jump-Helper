"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const E=require("../Torn-Happy-Jump-Helper.user.js");
const prices={lollipop:1000,chocolate:900,bigChocolate:2500,dvd:4300000,xanax:870000,ecstasy:40000,points:32000};
const books=Object.fromEntries(Object.entries(prices).map(([kind,price])=>[kind,{
  listings:[{price,amount:50000}],timestamp:Date.now()/1000
}]));
function input(override={}){
  return {stat:10000,baseHappy:5025,dots:2,gymCost:10,mod:1,
    maxE:150,regenHour:30,refill:true,maxJumpsDaily:2,
    budget:100000000,candyPercent:0,boosterReduction:0,
    dvdHappy:2500,boosterCap:24,happyLoss:0.5,books,owned:{},inventoryReady:false,
    ...override};
}
test("quantity-weighted market price, no invented prices",()=>{
  assert.deepEqual(E.marketCost({listings:[{price:300,amount:2},{price:100,amount:3}]},4),{cost:600,known:true});
  assert.equal(E.marketCost({listings:[{price:100,amount:2}]},3).known,false);
  assert.equal(E.marketCost(undefined,1).known,false);
  assert.equal(E.marketCost(undefined,0).cost,0);
});
test("higher Happy, better gym and training bonuses improve gains",()=>{
  const g=(happy,dots=2,mod=1)=>E.gainTrain(250,happy,10000,dots,mod,10);
  assert.ok(g(15000)>g(5000));
  assert.ok(g(5000,3)>g(5000,2));
  assert.ok(g(5000,2,1.2)>g(5000,2,1));
});
test("3-star Fitness Center happy-loss effect preserves marginal Happy",()=>{
  assert.ok(E.gainTrain(1000,5025,10000,2,1,10,0.25)>E.gainTrain(1000,5025,10000,2,1,10,0.5));
});
test("normal training and direct Xanax training are available",()=>{
  const b=E.baseline(input());
  assert.equal(b.length,2);
  assert.equal(b[0].jumps,0);
  assert.equal(b[1].xanax,14);
  assert.ok(b[1].energy>b[0].energy);
});
test("each plan is bounded by 24h booster cap and manual attendance limit",()=>{
  const scenarios=E.strategies(input()).options;
  assert.equal(scenarios.length,30);
  for(const s of scenarios){
    assert.ok(s.perBoosterHours<=24);
    assert.ok(s.jumps>=1 && s.jumps<=14);
    assert.ok(s.happy<=99999);
    assert.ok(s.lostRegen>=0);
    assert.ok(Number.isFinite(s.gain));
  }
  assert.ok(!scenarios.some(s=>s.dvds===8));
  assert.ok(E.strategies(input({boosterCap:48})).options.some(s=>s.dvds===8));
});
test("eDVD special and faction candy perk improve Happy",()=>{
  const normal=E.strategies(input()), special=E.strategies(input({dvdHappy:5000}));
  assert.ok(special.options.find(x=>x.dvds===2&&x.xanax===0).happy>
    normal.options.find(x=>x.dvds===2&&x.xanax===0).happy);
  const faction=E.strategies(input({candyPercent:50}));
  assert.ok(faction.options.find(x=>x.count===12&&x.xanax===0).happy>
    normal.options.find(x=>x.count===12&&x.xanax===0).happy);
});
test("candy-only cooldown reduction doesn't discount eDVD cooldown",()=>{
  const a=E.strategies(input({boosterReduction:0.25})).options;
  assert.equal(a.find(x=>x.dvds===2&&x.xanax===0).perBoosterHours,12);
  assert.equal(a.find(x=>x.count===12&&x.dvds===0&&x.xanax===0).perBoosterHours,4.5);
});
test("unknown market prices block paid plans but natural training remains valid",()=>{
  const scored=E.score(input({books:{},refillMode:"both"}));
  assert.ok(scored.options.every(x=>!x.known));
  assert.equal(scored.speed?.id,"no-refills:normal");
  assert.equal(scored.value,null);
});
test("zero budget still permits free natural-energy training",()=>{
  const scored=E.score(input({budget:0,refillMode:"both"}));
  assert.equal(scored.speed?.id,"no-refills:normal");
  assert.ok(scored.options.every(x=>!x.known));
});
test("available personal inventory reduces estimated cash needed, not requirements",()=>{
  const a=E.strategies(input({inventoryReady:true,owned:{lollipop:200,ecstasy:2,xanax:0}}));
  const b=E.strategies(input());
  const name="Candy micro 3";
  assert.ok(a.options.find(x=>x.name===name).cost<b.options.find(x=>x.name===name).cost);
  assert.equal(a.options.find(x=>x.name===name).counts.lollipop,b.options.find(x=>x.name===name).counts.lollipop);
});
test("high-quantity market depth exhaustion is never silently underpriced",()=>{
  const shallow={...books,lollipop:{listings:[{price:1000,amount:1}]}};
  assert.equal(E.strategies(input({books:shallow})).options.find(x=>x.count===48&&x.xanax===0).known,false);
});

test("stacked 4 Xanax jump cannot train more than 1000 energy before refill",()=>{
  const a=E.strategies(input({refill:false})).options.find(x=>x.xanax===4&&x.count===3);
  assert.ok(a.eachJump<=1000);
});

test("both refill strategies compete under one weekly budget",()=>{
  const p=E.score(input({refillMode:"both",budget:10000000}));
  assert.equal(p.options.length,60);
  assert.ok(p.baseline.some(x=>x.refill===true));
  assert.ok(p.baseline.some(x=>x.refill===false));
  assert.ok(p.speed===null || p.speed.cost<=10000000);
  assert.ok(p.options.every(x=>x.id.startsWith(x.refill?"refills:":"no-refills:")));
  assert.ok(p.baseline.some(x=>x.cost===0&&x.refill===false));
});

test("timestamped week respects Torn quarter hour execution windows",()=>{
  const i=input({refill:false,statName:"dexterity",currentEnergy:150,currentHappy:5025,
    regenInterval:120,regenIncrement:1,xanaxHours:7,maxJumpsDaily:2});
  const p=E.strategies(i).options.find(x=>x.xanax===0&&x.count===3);
  p.refill=false;
  const start=1793000000;
  const output=E.schedule(i,p,start,{energy:150,happy:5025,regenInterval:120,regenIncrement:1});
  const jumpEvents=output.events.filter(x=>x.kind==="jump");
  assert.ok(jumpEvents.length>0);
  assert.equal(jumpEvents.length,output.jumps);
  assert.ok(jumpEvents.every(x=>x.time%900===60));
  const counts={};
  for(const j of jumpEvents){
    const day=Math.floor(j.time/86400); counts[day]=(counts[day]||0)+1;
  }
  assert.ok(Object.values(counts).every(n=>n<=2));
  assert.ok(output.events.every(x=>x.time>=Math.ceil(start/60)*60 && x.time<Math.ceil(start/60)*60+604800));
  assert.ok(output.energyTrained>0);
  assert.ok(Number.isFinite(output.gain));
});
test("four Xanax stacks require actual spacing and keep energy capped at 1000",()=>{
  const i=input({refill:false,statName:"defense",maxJumpsDaily:8,budget:100000000,
    currentEnergy:150,currentHappy:5025,regenInterval:120,regenIncrement:1});
  const p=E.strategies(i).options.find(x=>x.xanax===4&&x.count===3);
  p.refill=false;
  const out=E.schedule(i,p,1793000000,{energy:150,happy:5025,xanaxHours:7,regenInterval:120,regenIncrement:1});
  assert.ok(out.jumps>0);
  const xan=out.events.filter(x=>x.kind==="xanax");
  assert.ok(xan.length>=4);
  for(let j=1;j<4;j++)assert.ok(xan[j].time-xan[j-1].time>=7*3600);
  assert.ok(out.energyLeft<=1000);
});
test("perk auditing uses only scoped gym gains, not effective battle-stat merits",()=>{
  const perks={perks:{faction:["Increases dexterity gym gains by 10%","Increases speed gym gains by 9%"],
    merit:["Increases dexterity by 30% (passive)"],job:["Increase all gym gains by 3%"]}};
  const info=E.auditPerks(perks,"dexterity");
  assert.ok(info.factor>=1);
  assert.ok(info.rows.some(x=>x.category==="merit"&&!x.applied));
  assert.ok(info.rows.some(x=>x.category==="faction"&&!x.applied));
});
test("book advice identifies strategic 200m threshold and consumed-copy uncertainty",()=>{
  const owned=[{id:747,name:"Book : A Job For Your Hands",amount:1,faction_owned:false},
    {id:757,name:"Book : Get Hard Or Go Home",amount:1,faction_owned:false},
    {id:783,name:"Book : Yes Please Diabetes",amount:1,faction_owned:false}];
  const advice=E.bookAdvice(owned,{dexterity:1007916},250000);
  assert.equal(advice.length,3);
  assert.equal(advice[0].threshold,200000000);
  assert.match(advice[0].recommendation,/200,000,000/);
  assert.match(advice[0].ownership,/NOT verifiable/);
  assert.ok(advice[2].recommendation.includes("Diabetes"));
  assert.equal(E.bookAdvice(null,{},0).length,0);
});
test("stock benefit or passive fighting merit never silently adds gym multipliers",()=>{
  const p=E.auditPerks({perks:{stock:["+10% passive Battle stats"],merit:["+30% defense"],
    faction:["+5% all gym gains"]}},"strength");
  assert.ok(p.factor>=1);
  assert.ok(!p.rows.find(x=>x.category==="merit").applied);
  assert.ok(!p.rows.find(x=>x.category==="stock").applied);
});

test("gym catalogue uses public metadata only, never proof of user access",()=>{
  const g=E.gymCatalog({gyms:[
    {id:1,name:"My gym",cost:100,energy_cost:10,modifiers:{dexterity:60}},
    {id:2,name:"Better gym",cost:1000,energy_cost:10,modifiers:{dexterity:75}},
    {id:3,name:"Locked gym",cost:2000,energy_cost:10,modifiers:{dexterity:90}},
    {id:4,name:"High gym",cost:2000,energy_cost:50,modifiers:{dexterity:80}}
  ]});
  const context={energy:150,happy:5025,stat:1000000,mod:1,happyLoss:0.5};
  const res=E.gymSuggestions(g,1,{"2":"buy","3":"locked"},"dexterity",
    {strength:1300000,speed:2000000,defense:1200000,dexterity:1000000},context);
  assert.equal(res.length,2);
  assert.ok(res.some(x=>x.name==="My gym"&&x.status==="active"));
  assert.ok(res.some(x=>x.name==="Better gym"&&x.status==="buy"&&x.improvement>0));
  assert.ok(!res.some(x=>x.name==="Locked gym"));
  assert.ok(!res.some(x=>x.name==="High gym"));
});
test("unverified specialist gyms and ineligible specialist ratios are excluded",()=>{
  const g=E.gymCatalog({gyms:[
    {id:1,name:"Cha Cha's",energy_cost:10,modifiers:{dexterity:70}},
    {id:2,name:"Balboas Gym",energy_cost:25,modifiers:{dexterity:75}},
    {id:3,name:"Elites",energy_cost:50,modifiers:{dexterity:80}}
  ]});
  const weakDex={strength:1300000,speed:2000000,defense:1200000,dexterity:1000000};
  const opts=E.gymSuggestions(g,1,{"2":"buy","3":"buy"},"dexterity",weakDex,
    {energy:150,happy:5000,stat:1000000,mod:1});
  assert.equal(opts.length,1);
  const strongDex={strength:900000,speed:900000,defense:900000,dexterity:2500000};
  assert.ok(E.gymEligibility(g[1],strongDex));
  assert.ok(E.gymEligibility(g[2],strongDex));
});
test("training-relevant perk filter removes combat-only and finance entries",()=>{
  const rows=[
    {category:"merit",description:"+25% effective combat speed"},
    {category:"stock",description:"+10% bank interest"},
    {category:"job",description:"+10% gym training gains"},
    {category:"faction",description:"Reduce booster cooldown by 20%"},
    {category:"property",description:"+2% Gym Gains (Swimming Pool)"},
    {category:"stock",description:"Free education courses"}
  ];
  const visible=E.trainingPerkRows(rows);
  assert.equal(visible.length,3);
  assert.ok(visible.some(x=>x.description.includes("booster")));
});
test("compounding long-term milestones have ordered ETAs and cost budgets",()=>{
  const i=input({stat:1007916,statName:"dexterity",dots:7,now:1793000000});
  const milestones=E.targetProjection(i,250000,9000000,[50000000,100000000,200000000,1000000000]);
  assert.equal(milestones.length,4);
  assert.ok(milestones.every(x=>x.weeks===null||Number.isInteger(x.weeks)));
  const reached=milestones.filter(x=>x.weeks!==null);
  for(let n=1;n<reached.length;n++)assert.ok(reached[n].weeks>=reached[n-1].weeks);
  assert.ok(reached.every(x=>x.cost===x.weeks*9000000));
  const done=E.targetProjection({...i,stat:200000000},250000,9000000,[50000000]);
  assert.equal(done[0].weeks,0);
});
