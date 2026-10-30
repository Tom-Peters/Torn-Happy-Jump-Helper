"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const FILE=path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.12.9-preview.user.js");
function boot(reply=()=>({log:[]})){
 const source=fs.readFileSync(FILE,"utf8").replace("###PDA-APIKEY###","test-key");
 const store=new Map(),requests=[];
 function node(tag){return {tag,children:[],style:{},dataset:{},innerHTML:"",textContent:"",
 append(...a){this.children.push(...a)},appendChild(x){this.children.push(x)},
 addEventListener(k,fn){this["on"+k]=fn},setAttribute(){},get id(){return this._id},set id(x){this._id=x}}}
 const body=node("body"),head=node("head"),document={body,head,createElement:node,addEventListener(){},
 getElementById(id){return [...body.children,...head.children].find(x=>x.id===id)||null}};
 const window={setInterval(){}},localStorage={getItem:k=>store.get(k)||null,setItem:(k,v)=>store.set(k,String(v))};
 const source2=source.replace(/\}\)\(\);\s*$/,"window.__test={lastOD,parseODLog,rememberOD,scanLastOD,labelLastOD,odSource,drugOdOdds,odRateSource,verifiedODModifiers,odSourceCard,happyRecoveryMath,recoveryFloors,simulateRecovery,happyRecoveryCard,overdoseRecoveryCard,reportedOverdose,noteOverdose,clearOverdose,jumpBreakEven,overdoseForecast,settings,loadInput,simulate,plans,plan,compare,today,nextDecision,setData:v=>{data=v},setUpdated:v=>{updated=v},setInventory:v=>{inv=v},setPrices:v=>{prices=v},getConfig:()=>cfg,odScanStatus:()=>lastOdStatus};})();");
 assert.notEqual(source2,source,"test hooks must inject before userscript closure");
 new Function("document","location","window","localStorage","PDA_httpGet",source2)(document,
 {hostname:"www.torn.com",pathname:"/gym.php"},window,localStorage,
 async (url,headers)=>{requests.push({url,headers});const data=reply(url);return {status:200,responseText:JSON.stringify(data)}});
 return {core:window.__test,window,document,store,requests};
}
function setup(a,{happy=0,maxH=3500,energy=0}={}){
 const v=value=>({value});
 a.core.setData({
 stats:{battlestats:{strength:v(125000),speed:v(190000),defense:v(180000),dexterity:v(170000)}},
 gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Gym",energy_cost:25,modifiers:{strength:70,speed:50,defense:50,dexterity:50}}]},
 bars:{bars:{energy:{current:energy,maximum:150,interval:600,increment:5},happy:{current:happy,maximum:maxH}}},
 cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:false}},
 perks:{perks:{faction_perks:[],job_perks:[]}}
 });
 a.core.setPrices({xanax:[{price:70000,amount:200}],ecstasy:[{price:100000,amount:100}],
 dvd:[{price:50000,amount:100}],lollipop:[{price:500,amount:400}],points:[{price:1000,amount:20000}]});
 a.core.setInventory({});
 const cfg=a.core.getConfig();cfg.stat="strength";cfg.refills=true;cfg.budget=100000000;cfg.sleepEnabled=false;
 a.core.setUpdated(Date.now());
}

test("v0.12.9 uses a labelled community Xanax baseline without claiming official odds",()=>{
 const a=boot();const c=a.core.getConfig();c.odEstimateMode="community";
 assert.ok(Math.abs(a.core.drugOdOdds("xanax")-100/33)<1e-8);
 assert.equal(a.core.drugOdOdds("ecstasy"),null);
 assert.match(a.core.odRateSource("xanax").label,/Community Xanax baseline/);
 assert.match(a.core.odRateSource("xanax").label,/unknown/);
 assert.match(a.core.odRateSource("ecstasy").label,/No verified Ecstasy/);
 assert.match(a.core.odSourceCard(),/does not publish personal per-drug OD rates/);
 assert.match(a.core.settings(),/Ecstasy baseline is unknown/);
});
test("API faction Overdosing and Nightclub perks change community Xanax rate",()=>{
 const a=boot();setup(a);
 const c=a.core.getConfig();c.odEstimateMode="community";
 const state={stats:{battlestats:{strength:{value:125000},speed:{value:190000},defense:{value:180000},dexterity:{value:170000}}},gym:{gym:{id:1}},gyms:{gyms:[{id:1,name:"Gym",energy_cost:25,modifiers:{strength:70,speed:50,defense:50,dexterity:50}}]},bars:{bars:{energy:{current:60,maximum:150,interval:600,increment:5},happy:{current:0,maximum:3500}}},cooldowns:{cooldowns:{drug:0,booster:0}},refills:{refills:{energy:false}},
 odFactionUpgrades:{upgrades:{peace:[{name:"Toleration",upgrades:[{name:"Overdosing",level:10}]}],war:[]}},
 odJob:{job:{type:{name:"Nightclub"},rating:7}}};
 a.core.setData(state);
 assert.deepEqual(a.core.verifiedODModifiers(),{faction:30,nightclub:true});
 assert.ok(Math.abs(a.core.drugOdOdds("xanax")-(100/33*.7*.5))<1e-8);
 assert.match(a.core.odRateSource("xanax").label,/faction reduction 30%/);
 c.xanaxOdPct=8;
 assert.equal(a.core.drugOdOdds("xanax"),8,"manual effective rate must not be reduced twice");
});
test("partial perks are not silently treated as verified zero",()=>{
 const a=boot();setup(a);
 assert.deepEqual(a.core.verifiedODModifiers(),{faction:null,nightclub:null});
 assert.match(a.core.odRateSource("xanax").label,/unknown/);
 const c=a.core.getConfig();c.odEstimateMode="off";
 assert.equal(a.core.drugOdOdds("xanax"),null);
 c.odEstimateMode="community";c.ecstasyOdPct=7.5;
 assert.equal(a.core.drugOdOdds("ecstasy"),7.5);
});
test("last overdose remains recorded while a recovery hold is cleared",()=>{
 const a=boot();setup(a,{happy:0,energy:60});a.core.noteOverdose("xanax");
 assert.equal(a.core.loadInput().happy,0);
 const recorded=a.core.lastOD();
 assert.ok(recorded&&recorded.t>0);
 assert.match(a.core.happyRecoveryCard(),/Live Happy: 0/);
 a.core.clearOverdose();
 assert.equal(a.core.reportedOverdose(),null);
 assert.equal(a.core.lastOD().t,recorded.t);
});
