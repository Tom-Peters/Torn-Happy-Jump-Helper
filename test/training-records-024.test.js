"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),vm=require("node:vm"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
const a=source.indexOf("function trainingRecordsV024("),b=source.indexOf("function progress(){",a);
assert.ok(a>0&&b>a,"Training Records must exist before Progress");
const code=source.slice(a,b);
const t=Date.UTC(2026,10,1,12)/1000;
const base={Tm:()=>t,ST:["strength","defense","speed","dexterity"],cfg:{stat:"speed"},Ar:Array.isArray,Fi:Number.isFinite,fmt:x=>Math.round(x).toLocaleString("en-GB"),esc:String,day:x=>new Date(x*1000).toISOString().slice(0,10),card:(title,body)=>title+"\n"+body};
test("training leaderboard uses confirmed gym logs and real per-train values",()=>{
 const al=[{t:t-3600,stat:"speed",amount:1000,trains:5},{t:t-7200,stat:"speed",amount:2000,trains:10},{t:t-3600,stat:"strength",amount:500,trains:0}];
 const fn=vm.runInNewContext(code+";trainingRecordsV024",{...base,al});
 const html=fn();
 assert.match(html,/7d.*3,000/s);assert.match(html,/Biggest logged session/);
 assert.match(html,/2,000/);assert.match(html,/Best logged gain \/ train/);
 assert.match(html,/data-act="stat" data-val="strength"/);
 assert.match(html,/kept separate from net battle-stat snapshots/);
});
test("absence of logs prompts a scan without inventing training gains",()=>{
 const fn=vm.runInNewContext(code+";trainingRecordsV024",{...base,al:[]});
 const html=fn();assert.match(html,/No parsed gym-gain logs available/);assert.match(html,/scan-logs/);
});
