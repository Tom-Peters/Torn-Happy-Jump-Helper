'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../Torn-Happy-Jump-Helper-preview.user.js'),'utf8');
function fixture(){
 let now=Date.UTC(2026,10,11,12,1,0);const store=new Map();
 const node=()=>({style:{setProperty(){}},dataset:{},append(){},appendChild(){},addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],setAttribute(){},contains:()=>false});
 const document={body:node(),head:node(),hidden:false,createElement:node,querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},dispatchEvent(){}};
 const window={top:1,self:2,setInterval(){}};
 const ctx={document,window,location:{hostname:'www.torn.com',pathname:'/gym.php'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},CustomEvent:function(type,init){this.type=type;this.detail=init.detail;},Date:class extends Date{static now(){return now}},URL,console};
 const expose='window.__test={parseTrainingCalendar,visibleTrainingEvents,trainingEventMultiplier,eventAlerts,trainingEventSettings,trainingEventsCard,parseCandyCatalog,candyComparisons,candyComparisonCard,candyRecipeCost,candyRecipeHappy,inventoryCategory,setCandy:(items,quotes)=>{candyCatalog=items;candyQuotes=quotes;diabetesMemo=null;},setTrainingCalendar:(windows)=>{trainingCalendar={windows,checked:Date.now(),unknown:[]};diabetesCalendar={windows:windows.filter(w=>w.kind==="diabetes"),checked:Date.now()};diabetesMemo=null;},parseDiabetesCalendar,diabetesMultiplier,diabetesAssessment,diabetesCard,setCalendar:(windows)=>{diabetesCalendar={windows,checked:Date.now()};trainingCalendar={windows:windows.map(w=>({...w,kind:"diabetes",title:"World Diabetes Day"})),checked:Date.now(),unknown:[]};diabetesMemo=null},jumpBoostSetup,jumpKit,gain,bonus,happyDrain,effectiveStat,loadInput,simulate,coachFresh,coachSnapshot,nextDecision,priorityAction,targetWeeks,cFactor,today,coachStrategyCard,sGa,stats,plans,refill,set:(v)=>{data=v;updated=Date.now();miniFresh=Date.now();rankedWarState={status:"clear",checked:Date.now()};},config:cfg,setPrices:v=>prices=v,setInventory:v=>inv=v,setPlan:v=>lp=v,setWar:v=>rankedWarState=v,setActions:v=>acts=v,setOD:v=>put("reported-overdose",v)};return;';
 const needle='});mount();Do.addEventListener?.';assert.ok(source.includes(needle));
 vm.runInNewContext(source.replace(needle,'});'+expose+'mount();Do.addEventListener?.'),ctx);
 const a=window.__test;const s={coreAt:now,perksAt:now,stats:{battlestats:Object.fromEntries(['strength','speed','defense','dexterity'].map(k=>[k,{value:1000000}]))},gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:'Test gym',energy_cost:10,modifiers:{strength:73,speed:73,defense:73,dexterity:73}}]},bars:{bars:{energy:{current:150,maximum:150,interval:600,increment:5,ticktime:300},happy:{current:5025,maximum:5025}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:false}},perks:{perks:{property_perks:['2% gym gains'],education_perks:['1% strength gym gains'],faction_perks:['15% strength gym gains'],book_perks:[]}}};
 a.set(s);a.config.stat='strength';a.config.sleepEnabled=false;a.config.adaptHistory=false;a.config.refills=false;
 return {a,s,advance:n=>now+=n,now:()=>now};
}
test('current gain engine matches published V2 vectors, uses stat offsets, perks and post-cap diminishing returns',()=>{
 const {a}=fixture();
 assert.equal(a.gain(10,0,200000,1,10,1,'strength',.5),10.165);
 assert.ok(Math.abs(a.gain(10,0,200000,1,10,1,'defense',.5)-10.075)<1e-12);
 assert.ok(Math.abs(a.bonus('strength')-1.18473)<1e-12);
 assert.equal(a.bonus('speed'),1.02);
 // ln(1+5025/250) rounds to 3.0493; resulting multiplier rounds to 1.2135.
 const reference=(1000000*1.2135+8*5025**1.05+(1-(5025/99999)**2)*1600+1700)/200000*7.3*10;
 assert.ok(Math.abs(a.gain(10,5025,1000000,7.3,10,1,'strength',.5)-reference)<1e-9);
 assert.equal(a.effectiveStat(50000000),50000000);
 assert.ok(a.effectiveStat(1e9)>50e6&&a.effectiveStat(1e9)<70e6);
 assert.ok(a.gain(150,5025,1e9,7.3,10,1,'strength')<a.gain(150,5025,50e6,7.3,10,1,'strength')*1.3);
 for(const bad of [0,-1,Infinity,NaN])assert.equal(a.gain(150,5025,1e6,7.3,bad,1,'strength'),0);
 assert.equal(a.gain(Infinity,5025,1e6,7.3,10,1,'strength'),0);
 assert.equal(a.gain(9,5025,1e6,7.3,10,1,'strength'),0);
 assert.equal(a.gain(10,999999,1e6,7.3,10,1,'strength'),a.gain(10,99999,1e6,7.3,10,1,'strength'));
 assert.equal(a.cFactor(a.loadInput()),1);
 assert.equal(a.targetWeeks(1e6,1e6,50e6),49);
});
test('Fitness Center happy savings apply to each train, batch compounding and simulation',()=>{
 const {a,s}=fixture();const before=a.gain(1000,500,1e6,7.3,10,1,'strength');
 s.perks.perks.job_perks=['50% reduction of happiness loss in the gym'];assert.equal(a.happyDrain(),.25);
 const after=a.gain(1000,500,1e6,7.3,10,1,'strength');assert.ok(after>before);
 const first=a.gain(10,500,1e6,7.3,10,1,'strength');
 const second=a.gain(10,497.5,1e6+first,7.3,10,1,'strength');
 assert.ok(Math.abs(a.gain(20,500,1e6,7.3,10,1,'strength')-first-second)<1e-10);
 const p=a.loadInput(),run=a.simulate('natural',p,.01,{refills:false});
 assert.equal(run.gain,a.gain(150,p.happy,p.value,p.dots,p.cost,p.m,p.stat));
 assert.equal(run.energy,150);
});
test('live coach respects war, stale data, happy reset, energy headroom and stacking',()=>{
 const {a,s,advance,now}=fixture();assert.equal(a.nextDecision().kind,'train');
 s.bars.bars.energy.current=50;a.config.refills=true;assert.match(a.nextDecision().title,/before.*refill/);
 a.config.mode='happy';assert.ok(['stack','strategy'].includes(a.nextDecision().kind));
 s.bars.bars.happy.current=5100;assert.notEqual(a.nextDecision().kind,'train');
 s.bars.bars.happy.current=20000;assert.notEqual(a.nextDecision().kind,'train');a.setActions([{kind:'ECSTASY',t:now()/1000}]);assert.match(a.nextDecision().title,/boosted happiness/);
 const active=a.simulate('happy',a.loadInput(),1,{refills:false});assert.equal(active.count.ecstasy,0);assert.equal(active.events[0].kind,'TRAIN');a.setActions([]);
 a.setWar({status:'active',start:now()/1000-60,checked:now()});assert.equal(a.nextDecision().kind,'war');assert.doesNotMatch(a.today(),/Your next gym session/);
 a.setWar({status:'clear',checked:now()});a.setOD({drug:'xanax',t:now()/1000,source:'manual'});assert.equal(a.nextDecision().kind,'overdose');assert.doesNotMatch(a.today(),/Your next gym session/);a.setOD(null);advance(15*60000);assert.equal(a.coachFresh(),false);
 assert.ok(['stale','war'].includes(a.nextDecision().kind));
 a.set(s);s.coreAt=now();s.perksAt=now();a.setWar({status:'clear',checked:now()});s.bars.bars.happy.current=5025;
 s.gyms.gyms[0].energy_cost=0;assert.equal(a.loadInput(),null);
});
test('schedule trains before refill, spends only within budget and includes a jump refill before happy reset',()=>{
 const {a,s}=fixture();a.setPrices({xanax:[{price:800000,amount:100}],ecstasy:[{price:30000,amount:100}],dvd:[{price:3000000,amount:100}],points:[{price:50000,amount:1000}],lollipop:[{price:1000,amount:1000}]});
 a.config.refills=true;const p=a.loadInput(),run=a.simulate('natural',p,24,{refills:true});
 const refillIndex=run.events.findIndex(e=>e.kind==='REFILL');assert.ok(refillIndex>0);assert.equal(run.events[refillIndex-1].kind,'TRAIN');assert.equal(run.events[refillIndex].q,150);
 assert.equal(run.count.points,60);assert.equal(run.cost,3000000); // A rolling 24h window crosses midnight: one refill per UTC date.
 assert.equal(a.simulate('natural',p,24,{refills:true,budget:0}).count.points,0);
 const jump=a.simulate('happy',p,48,{refills:true});
 const ji=jump.events.findIndex(e=>e.kind==='JUMP');assert.ok(ji>=0);assert.deepEqual(Array.from(jump.events.slice(ji,ji+4),e=>e.kind),['JUMP','TRAIN','REFILL','TRAIN']);
 assert.equal(jump.events[ji+3].t,jump.events[ji].t);assert.equal(jump.count.points,30);assert.equal(jump.count.dvd,5);
 s.bars.bars.energy.current=1000;const stacked=a.simulate('happy',a.loadInput(),1,{refills:true});assert.equal(stacked.count.xanax,0);assert.equal(stacked.events[0].kind,'JUMP');
 assert.equal(a.jumpKit('happy').entries.find(x=>x.name==='xanax').num,0);
 s.perks.perks.job_perks=['100% bonus to Erotic DVDs'];s.perks.perks.faction_perks=['Maximum booster cooldown increased by 24 hours'];assert.equal(a.jumpBoostSetup('happy').quantity,9);assert.equal(a.jumpBoostSetup('happy').happy,5000);
 s.perks.perks.faction_perks=[];s.perks.perks.job_perks=[];s.bars.bars.energy.current=150;
 const slow=a.simulate('xanax',{...p,_xanaxHours:8},24,{refills:false}),fast=a.simulate('xanax',{...p,_xanaxHours:6},24,{refills:false});assert.ok(fast.drugs>=slow.drugs);
 a.setPlan([run]);assert.equal(a.priorityAction(run.events,run.start).kind,'TRAIN');
 s.cooldowns.cooldowns.drug=100;assert.equal(a.priorityAction([{kind:'XANAX',t:p.now}],p.now),null);
});
test('main workspace renders complete coach and routine from live state without inventing measured gains',()=>{
 const {a}=fixture();a.setPlan(a.plans());const html=a.today();
 for(const text of ['Your next gym session','Most / E','Repeatable training','Education, perks and books','Observed progress','Mean estimates'])assert.ok(html.includes(text),text);
 assert.doesNotMatch(html,/NaN|Infinity/);
});

// Focused event regression coverage; reuse the existing current-engine fixture.
test('Diabetes Day uses the personal 48-hour slot and rejects unknown timing',()=>{
 const {a}=fixture(),start=Date.UTC(2026,10,13,10)/1000,end=Date.UTC(2026,10,15,16)/1000;
 const event={title:'World Diabetes Day',start,end,earliest_start:start,latest_end:end,fixed_start_time:false};
 const w=a.parseDiabetesCalendar({calendar:{events:[event]}},{calendar:{start_time:'13:15:00'}})[0];
 assert.equal(w.start,Date.UTC(2026,10,13,13,15)/1000);assert.equal(w.end-w.start,48*3600);
 assert.throws(()=>a.parseDiabetesCalendar({calendar:{events:[event]}},{calendar:{}}));
 assert.throws(()=>a.parseDiabetesCalendar({calendar:{events:[event]}},{calendar:{start_time:'17:00'}}));
 a.setCalendar([w]);assert.equal(a.diabetesMultiplier(w.start-1),1);assert.equal(a.diabetesMultiplier(w.start),3);assert.equal(a.diabetesMultiplier(w.end-1),3);assert.equal(a.diabetesMultiplier(w.end),1);
});
test('event triples only candy at consumption time, stacks with books and is never counted twice',()=>{
 const {a,s,now}=fixture(),start=now()/1000+60,end=start+48*3600;a.setCalendar([{start,end}]);
 s.perks.perks.book_perks=['100% increase to candy effects'];s.perks.perks.event_perks=['World Diabetes Day: 200% increase to candy effects'];
 const normal=a.jumpBoostSetup('happy-candy',start-1),active=a.jumpBoostSetup('happy-candy',start);
 assert.equal(normal.happy,50);assert.equal(active.happy,150);assert.equal(a.jumpBoostSetup('happy-candy',start,'off').happy,50);
 assert.equal(a.jumpBoostSetup('happy',start).happy,a.jumpBoostSetup('happy',start-1).happy);
 a.setPrices({lollipop:[{price:1000,amount:1000}],ecstasy:[{price:30000,amount:100}],xanax:[{price:800000,amount:100}]});
 const input={...a.loadInput(),_candyQuick:true,_jumpNotBefore:start,_jumpBefore:end-60};
 const boosted=a.simulate('happy-candy',input,2,{refills:false}),plain=a.simulate('happy-candy',{...input,_diabetesMode:'off'},2,{refills:false});
 assert.ok(boosted.gain>plain.gain);assert.equal(boosted.count.xanax,0);assert.match(boosted.events.find(x=>x.kind==='JUMP').detail,/Diabetes Day/);
 const late=a.simulate('happy-candy',{...input,now:end-30},1,{refills:false});assert.equal(late.jumps,0);
});
function candyFixture(){
 const f=fixture(),{a,s,now}=f;
 const items=a.parseCandyCatalog({items:[
  {id:310,type:'Candy',name:'Lollipop',effect:'Increases happiness by 25 and booster cooldown by 30 minutes.',requirement:null,value:{market_price:1000},is_tradable:true},
  {id:1001,type:'Candy',name:'Higher happy candy',effect:'Increases happiness by 100.',requirement:null,value:{market_price:100000},is_tradable:true},
  {id:1002,type:'Candy',name:'Conditional item',effect:'Chance to increase happiness by 500.',value:{market_price:1},is_tradable:true}
 ]});
 s.candyInventoryAt=now();s.candyInventory=[{id:310,amount:20},{id:1001,amount:4},{id:1001,amount:999,faction_owned:true}];
 a.setCandy(items,Object.fromEntries(items.map(x=>[x.id,{at:now(),rows:[{price:x.reference,amount:10000}]}])));
 a.setPrices({lollipop:[{price:1000,amount:1000}],ecstasy:[{price:30000,amount:100}],xanax:[{price:800000,amount:100}],points:[{price:50000,amount:1000}]});
 return {...f,items};
}
test('event catalogue respects lead days, personal durations, per-event preferences, expiry and actual can-use times',()=>{
 const {a,now,advance}=fixture(),t=now()/1000;
 const events=[{title:'World Diabetes Day',start:t+20*86400,end:t+22*86400,fixed_start_time:true},{title:'CaffeineCon 2026',start:t,end:t+3600,fixed_start_time:true},{title:'Employee Appreciation Day',start:t+40*86400,end:t+42*86400,fixed_start_time:true},{title:'420 Day',start:t,end:t+86400,fixed_start_time:true}];
 const parsed=a.parseTrainingCalendar({calendar:{events}},{calendar:{start_time:'13:00'}});assert.equal(parsed.windows.length,3);a.setTrainingCalendar(parsed.windows);
 assert.equal(a.visibleTrainingEvents().length,2);assert.equal(a.eventAlerts().length,2);a.config.eventLead=42;assert.equal(a.visibleTrainingEvents().length,3);
 a.config.eventDisabled={diabetes:true};assert.equal(a.visibleTrainingEvents().length,2);a.config.eventNotify=false;assert.equal(a.eventAlerts().length,0);
 a.config.trainingEvents=false;assert.equal(a.visibleTrainingEvents().length,0);assert.equal(a.trainingEventMultiplier('caffeine',t),2);assert.equal(a.trainingEventMultiplier('caffeine',t+3600),1);
 const p=a.loadInput(),withEvent=a.simulate('natural',{...p,_canScenario:{baseE:25,mult:1,perDay:2}},3,{refills:false});assert.equal(withEvent.canAdded,75); // First can 50 E, second after expiry 25 E.
 const earliest=Date.UTC(2026,11,19,10)/1000,latest=Date.UTC(2026,11,31,16)/1000;
 const long=a.parseTrainingCalendar({calendar:{events:[{title:'Christmas Town',earliest_start:earliest,latest_end:latest,fixed_start_time:false}]}},{calendar:{start_time:'14:15'}}).windows[0];assert.equal(long.end-long.start,12*86400);
 a.config.trainingEvents=true;a.config.eventDisabled={};a.config.eventLead=21;advance(23*86400000);a.setTrainingCalendar(parsed.windows);assert.ok(!a.visibleTrainingEvents().some(w=>w.kind==='diabetes'));assert.doesNotMatch(a.trainingEventsCard(),/World Diabetes Day/);
});
test('general candy kits distinguish owned stock, market depth, cash and economic value; round effects and honour expiry',()=>{
 const {a,s,items,now,advance}=candyFixture();assert.equal(items.length,2);
 const rows=a.candyComparisons(),mix=rows.find(x=>x.mixed);assert.ok(mix);assert.equal(rows[0].mixed,true);assert.equal(mix.rows.reduce((n,x)=>n+x.have,0),24);
 assert.equal(mix.rows.reduce((n,x)=>n+x.quantity,0),49);assert.equal(mix.cost,mix.rows.reduce((n,x)=>n+x.cost,0)+30000);
 a.config.candyOwnedFirst=false;a.config.candyRank='gains';assert.equal(a.candyComparisons()[0].recipe[0].item.id,1001);
 a.config.candyRank='value';assert.equal(a.candyComparisons()[0].recipe[0].item.id,310);
 a.config.eventBudget=0;assert.ok(a.candyComparisons().every(x=>!x.affordable));a.config.eventBudget=10000000;
 s.perks.perks.faction_perks=['50% increase to candy effects'];assert.equal(a.jumpBoostSetup('happy-candy',now()/1000,'off',25).happy,38);
 a.setCandy(items,{310:{at:now(),rows:[{price:1000,amount:1}]}});assert.ok(a.candyComparisons().every(x=>!x.affordable));
 advance(16*60000);s.coreAt=now();s.perksAt=now();a.set(s);assert.ok(a.candyComparisons().every(x=>!x.affordable));assert.match(a.candyComparisonCard(),/inventory is unverified or stale/);
});
test('event timing compares complete general-candy scenarios against equal periods, separate budgets and holds',()=>{
 const {a,s,now}=candyFixture();a.setCalendar([{start:now()/1000+86400,end:now()/1000+3*86400}]);
 const report=a.diabetesAssessment(),row=report.rows.find(x=>x.available);assert.ok(row);assert.equal(row.extra,row.eventGain-row.baselineGain);assert.ok(row.eventBonus>0);assert.ok(row.cost<=10000000);assert.ok(row.jumpAt>=now()/1000+86400);assert.ok(row.steps.some(x=>x.kind==='TRAIN'&&x.t<row.stackStart));assert.doesNotMatch(a.diabetesCard(),/NaN|Infinity/);
 a.config.budget=0;assert.ok(a.diabetesAssessment().rows.some(x=>x.available)); // Event budget is separate from routine budget.
 a.config.eventBudget=0;assert.ok(a.diabetesAssessment().rows.every(x=>!x.available));a.config.eventBudget=10000000;
 a.setWar({status:'active',checked:now(),start:now()/1000-60});assert.equal(a.diabetesAssessment().rows.length,0);assert.match(a.diabetesAssessment().reason,/paused/);assert.match(a.today(),/Upcoming training opportunities/);assert.doesNotMatch(a.today(),/Your next gym session/);
 a.setWar({status:'clear',checked:now()});a.setCalendar([{start:now()/1000+20*86400,end:now()/1000+22*86400}]);assert.equal(a.diabetesAssessment().projected,true);assert.match(a.diabetesCard(),/Early preparation preview/);
});
