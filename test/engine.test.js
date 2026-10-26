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
test("market failure never ranks unknown weekly spending as affordable",()=>{
  const scored=E.score(input({books:{}}));
  assert.ok(scored.options.every(x=>!x.known));
  assert.equal(scored.speed,null);
  assert.equal(scored.value,null);
});
test("low budget can't rank unaffordable jumps",()=>{
  const scored=E.score(input({budget:0}));
  assert.equal(scored.speed,null);
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
