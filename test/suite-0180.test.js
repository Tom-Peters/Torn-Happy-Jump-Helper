"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
const snapshot=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.24.0-preview.user.js"),"utf8");
test("v0.24 preview and immutable snapshot use the same advisor logic and Hub",()=>{
  const body=s=>s.slice(s.indexOf("// ==/UserScript==")+"// ==/UserScript==".length);
  assert.equal(body(source),body(snapshot));
  assert.match(source,/\/\/ @version\s+0\.24\.0/);
  assert.match(source,/StaxxHub v2\.6/);
});
test("training improvements use existing observed state and planning models",()=>{
  assert.match(source,/function trainingEfficiencyV18\(/);
  assert.match(source,/function refillTimingV18\(/);
  assert.match(source,/function progressionRoadmapV18\(/);
  assert.match(source,/optimizerResults\(\)/);
  assert.match(source,/updated/);
  assert.match(source,/reportedOverdose\(\)/);
  assert.match(source,/No refill is scheduled/);
  assert.match(source,/Observed daily change/);
});
test("read-only advisor never posts gameplay writes",()=>{
  assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
  assert.match(source,/IamEEKY/);
  assert.match(source,/staxx:actions/);
  assert.match(source,/staxx:panel/);
});

test("v0.19 read-only execution queue checks freshness, overdose, cooldowns and owned supplies",()=>{
 assert.match(source,/function actionableQueueV190\(/);
 assert.match(source,/function actionableQueueCardV190\(/);
 assert.match(source,/updated>15\*60000/);
 assert.match(source,/reportedOverdose\(\)/);
 assert.match(source,/Current energy below one gym train/);
 assert.match(source,/Drug cooldown active/);
 assert.match(source,/Daily points refill/);
 assert.match(source,/Full jump inventory not confirmed/);
});
test("v0.19 renders without resetting scroll position or draft fields on refresh",()=>{
 assert.match(source,/hjScrollV190=Object\.create\(null\)/);
 assert.match(source,/hjScrollV190\[lastHjTabV190\]=ct\.scrollTop/);
 assert.match(source,/ct\.scrollTop=hjScrollV190\[tab\]\|\|0/);
 assert.match(source,/focus\(\{preventScroll:true\}\)/);
});

test('v0.22 personalised training uses actual gym sessions, local time and a data sufficiency gate',()=>{
 assert.match(source,/function observedGymPatternV200\(/);
 assert.match(source,/new Intl\.DateTimeFormat\("en-GB",\{timeZone:"Europe\/London"/);
 assert.match(source,/sessions\.length>=6&&days\.size>=3/);
 assert.match(source,/t%3600===0&&observed\.hours\.includes\(ukHourV200\(t\)\)/);
 assert.match(source,/Your verified usual gym window/);
 assert.match(source,/cfg\.adaptHistory!==false/);
});
test('v0.22 has local, redacted diagnostics and shared dynamic StaxxHub v2.5',()=>{
 assert.match(source,/function safeHjDiagnosticsV200\(/);
 assert.match(source,/function hjDiagnosticsV200\(/);
 assert.match(source,/staxx:diagnostics-request/);
 assert.match(source,/staxx:diagnostics/);
 assert.match(source,/StaxxHub v2\.6/);
 assert.doesNotMatch(source,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});

test('v0.22 automatically verifies off-plan training while Torn is visible',()=>{
 assert.match(source,/function miniRefresh\(\)/);
 assert.match(source,/if\(opened\|\|busy\|\|miniBusy\|\|Do\.hidden\)return/);
 assert.match(source,/recordStatSnapshot\(actual\)/);
 assert.match(source,/await scanGym\(\)/);
 assert.match(source,/now-miniGymAtV210>=15\*60/);
 assert.match(source,/Do\.addEventListener\?\.\("visibilitychange"/);
});

test('v0.22 requests safe foreground refresh after StaxxHub opens',()=>{
 assert.match(source,/staxx:refresh-request/);
 assert.match(source,/Tm\(\)\/1000-miniLast>=60/);
 assert.match(source,/Do\.hidden\|\|busy\|\|miniBusy/);
});


test("bounded full data sync runs independently of opening the helper",()=>{
  assert.match(source,/function autoFullRefreshV230\(\)/);
  assert.match(source,/auto-full-attempt-v230/);
  assert.match(source,/updated&&t-updated<45\*60000/);
  assert.match(source,/Do\.hidden\|\|busy\|\|miniBusy/);
  assert.match(source,/autoFullRefreshV230\(\)/);
});
