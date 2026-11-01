"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const source=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
const snapshot=fs.readFileSync(path.join(__dirname,"..","Torn-Happy-Jump-Helper-v0.18.0-preview.user.js"),"utf8");
test("v0.18 preview and immutable snapshot use the same advisor logic and Hub",()=>{
  const body=s=>s.slice(s.indexOf("// ==/UserScript==")+"// ==/UserScript==".length);
  assert.equal(body(source),body(snapshot));
  assert.match(source,/\/\/ @version\s+0\.18\.0/);
  assert.match(source,/StaxxHub v2\.4/);
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
