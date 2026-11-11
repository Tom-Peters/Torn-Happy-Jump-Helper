'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../Torn-Happy-Jump-Helper-preview.user.js'),'utf8');
function fixture(){
 let now=Date.UTC(2026,10,11,12,1,0);const store=new Map();
 const node=()=>({style:{setProperty(){}},dataset:{},append(){},appendChild(){},addEventListener(){},querySelector:()=>null,querySelectorAll:()=>[],setAttribute(){},contains:()=>false});
 const document={body:node(),head:node(),hidden:false,createElement:node,querySelector:()=>null,querySelectorAll:()=>[],getElementById:()=>null,addEventListener(){},dispatchEvent(){}};
 const window={top:1,self:2,setInterval(){}};
 const ctx={document,window,location:{hostname:'www.torn.com',pathname:'/gym.php'},localStorage:{getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,v)},CustomEvent:function(type,init){this.type=type;this.detail=init.detail;},Date:class extends Date{static now(){return now}},URL,console};
 const expose='window.__test={jumpBoostSetup,jumpKit,gain,bonus,happyDrain,effectiveStat,loadInput,simulate,coachFresh,coachSnapshot,nextDecision,priorityAction,targetWeeks,cFactor,today,coachStrategyCard,sGa,stats,plans,refill,set:(v)=>{data=v;updated=Date.now();miniFresh=Date.now();rankedWarState={status:"clear",checked:Date.now()};},config:cfg,setPrices:v=>prices=v,setInventory:v=>inv=v,setPlan:v=>lp=v,setWar:v=>rankedWarState=v,setActions:v=>acts=v,setOD:v=>put("reported-overdose",v)};return;';
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
