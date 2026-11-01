"use strict";
const test=require("node:test"),assert=require("node:assert/strict"),vm=require("node:vm"),fs=require("node:fs"),path=require("node:path");
const src=fs.readFileSync(path.join(__dirname,"../Torn-Happy-Jump-Helper-preview.user.js"),"utf8");
const a=src.indexOf("function verifiedPointsV025(){"),b=src.indexOf("function needs(",a);
assert.ok(a>=0&&b>a);
const fragment=src.slice(a,b);
const now=Date.UTC(2026,10,1,12);
function readOwned(points,at){
 const data={money:{money:{points}},moneyAt:at},cfg={ownedPoints:45},inv={xanax:3};
 const fn=vm.runInNewContext(fragment+";({verifiedPointsV025,owned})",{data,cfg,inv,Tm:()=>now,Mx:Math.max});
 return fn;
}
test("validated fresh API points override manual estimates, including verified zero",()=>{
 assert.equal(readOwned(210,now-60000).owned("points"),210);
 assert.equal(readOwned(0,now-60000).owned("points"),0);
});
test("stale and malformed responses use manual points, never invented zero",()=>{
 assert.equal(readOwned(200,now-31*60000).owned("points"),45);
 assert.equal(readOwned("200",now-60000).owned("points"),45);
 assert.equal(readOwned(null,now-60000).owned("points"),45);
 assert.equal(readOwned(200,now+10000).owned("points"),200);
});
test("points come from read-only user/money, without gameplay writes",()=>{
 assert.match(src,/money:"\/user\/money"/);
 assert.match(src,/const cash=await api\("\/user\/money"\)/);
 assert.match(src,/verifiedPointsV025\(\)!==null/);
 assert.doesNotMatch(src,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
});