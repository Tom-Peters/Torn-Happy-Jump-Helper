'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../Torn-Happy-Jump-Helper-preview.user.js'),'utf8');
const extract=(a,b)=>source.slice(source.indexOf(a),source.indexOf(b,source.indexOf(a)));
test('Progress model handles missing gym input without losing observed history',()=>{
 const model=vm.runInNewContext(extract('function mCard(','function cgCard(')+';mCard',{card:(title,body)=>title+body});
 assert.match(model(null),/Current gym inputs are unavailable/);
 assert.match(model(undefined),/observed training history remains available/);
 assert.match(source,/cgCard\(\)\+mCard\(loadInput\(\)\)/);
});
test('Per-train estimate treats missing or invalid gym cost as unknown, not zero gains',()=>{
 const estimate=vm.runInNewContext(extract('function tEs(','function aPl(')+';tEs',{Fi:Number.isFinite,gain:()=>42,Fl:Math.floor,cFactor:()=>1});
 for(const value of [null,undefined,{cost:0},{cost:NaN}])assert.ok(Number.isNaN(estimate(value)));
 assert.equal(estimate({cost:10}),42);
});
