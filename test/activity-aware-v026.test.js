"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"../Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
const snapshot=fs.readFileSync(path.join(__dirname,"../Torn-Happy-Jump-Helper-v0.31.3-preview.user.js"),"utf8");
const a=source.indexOf("async function miniRefresh(){"),b=source.indexOf("function mount(){",a);
assert.ok(a>=0&&b>a,"Foreground mini refresh remains available");
const mini=source.slice(a,b);
test("auto-activity watches observed energy, real refills, new log IDs and overdose changes",()=>{
 assert.match(mini,/previousEnergy/);
 assert.match(mini,/previousRefill=refill\(\)/);
 assert.match(mini,/previousActions=new Set\(acts/);
 assert.match(mini,/previousOD=reportedOverdose/);
 assert.match(mini,/energyDrop\|\|usedRefill\|\|newActivity\|\|newOD/);
});
test("energy loss only triggers read-only gym rechecking and never becomes an invented training gain",()=>{
 assert.match(mini,/Do not assume that an energy decrease means training/);
 assert.match(mini,/await scanGym\(\)/);
 assert.match(mini,/now-miniGymAtV210>=2\*60/);
 assert.match(mini,/lp=plans\(\)/);
 assert.doesNotMatch(mini,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});
test("activity guidance is visible in Today and Progress with the same preview and snapshot implementation",()=>{
 assert.match(source,/function autoSignalCardV0260\(\)/);
 assert.match(source,/out\+=autoSignalCardV0260\(\)/);
 assert.match(source,/return autoSignalCardV0260\(\)\+pLg\(\)/);
 const body=s=>s.slice(s.indexOf("// ==/UserScript==")+"// ==/UserScript==".length);
 assert.equal(body(source),body(snapshot));
});
