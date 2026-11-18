'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync(require('node:path').join(__dirname,'../Torn-Happy-Jump-Helper-preview.user.js'),'utf8');
function fixture(reply){
 const now=1800000000,store={},calls=[],scope={ST:['strength','speed','defense','dexterity'],Nu:Number,St:String,Fi:Number.isFinite,Fl:Math.floor,Ar:Array.isArray,Tm:()=>now*1000,BASE:'https://api.torn.com/v2',URL,al:[],lc:0,ls:'',busy:false,Do:{hidden:false,dispatchEvent(){}},CustomEvent:class{},fmt:String,put:(k,v)=>store[k]=JSON.parse(JSON.stringify(v)),loadInput:()=>null,draw(){},api:async path=>{calls.push(path);return reply(path,calls.length);}};
 const part=src.slice(src.indexOf('function readLog('),src.indexOf('function mCard('));
 const api=vm.runInNewContext(part+';({scanGym,readLog,olderGymPage})',scope);
 return {...api,scope,store,calls,now};
}
const log=(id,t)=>({id,timestamp:t,details:{id:5301},data:{strength_increased:100,trains:1,energy_used:10}});
test('Older sessions follow prev rather than newer next; repeated scans deduplicate',async()=>{
 const f=fixture((path)=>path.includes('nanostamp=123')?{log:[log('older',1798000000)],_metadata:{links:{prev:null,next:'https://api.torn.com/v2/user/log?to=1800000000'}}}:{log:[log('recent',1799999990)],_metadata:{links:{prev:'https://api.torn.com/v2/user/log?nanostamp=123',next:'https://api.torn.com/v2/user/log?from=1800000000'}}});
 await f.scanGym();assert.equal(f.scope.al.length,2);assert.equal(f.calls.length,2);assert.match(f.calls[0],/from=1792224000/);
 await f.scanGym(true);assert.equal(f.scope.al.length,2);
});
test('Nanosecond-only cursor removes to and preserves exact cursor digits',()=>{
 const f=fixture();const path=f.olderGymPage({log:[{}],_metadata:{nanostamp:'1800000000123456789'}},'/user/log?log=5301&to=1800000000');
 assert.match(path,/nanostamp=1800000000123456789/);assert.doesNotMatch(path,/[?&]to=/);
 assert.throws(()=>f.olderGymPage({_metadata:{links:{prev:'https://evil.example/log'}}},'/user/log'),/Invalid log page/);
});
test('Later-page errors preserve captured and previously saved sessions',async()=>{
 const f=fixture((p,n)=>{if(n===2)throw Error('permission or network failure');return {log:[log('new',1799999990)],_metadata:{links:{prev:'https://api.torn.com/v2/user/log?nanostamp=1'}}};});
 f.scope.al=[{id:'saved',t:1799999900,stat:'speed',amount:50}];await f.scanGym();
 assert.equal(f.store['gym-api-logs'].length,2);assert.match(f.scope.ls,/Saved sessions retained/);
});
test('Repeated cursors stop bounded scans and foreground requests cannot overlap',async()=>{
 let release;const f=fixture(()=>new Promise(r=>release=r));const request=f.scanGym();await f.scanGym(true);assert.equal(f.calls.length,1);release({log:[]});await new Promise(r=>setImmediate(r));
 // Resolve fallback category and diagnostic calls too.
 release({log:[]});await new Promise(r=>setImmediate(r));release({log:[]});await request;
 f.scope.Do.hidden=true;await f.scanGym(true);assert.equal(f.calls.length,3);
 const loop=fixture(()=>({log:[log('same',1799999990)],_metadata:{links:{prev:'https://api.torn.com/v2/user/log?nanostamp=1'}}}));await loop.scanGym();assert.equal(loop.calls.length,2);assert.match(loop.scope.ls,/Partial history/);
});
test('Nested result retains explicit root stat identity',()=>{
 const f=fixture();assert.equal(f.readLog({id:'nested',timestamp:f.now-1,data:{stat:'speed',result:{gain:123}}}).stat,'speed');
});
test('A populated single-type log cannot hide speed sessions from the Gym category',async()=>{
 const older=log('old',1799999000);
 const speed=(id,amount)=>({id,timestamp:1799999160,details:{category:'Gym'},data:{speed_increased:amount,energy_used:125,trains:5}});
 const f=fixture(path=>({log:path.includes('cat=125')?[speed('first',12170.62),speed('second',12233.25),older]:[older],_metadata:{links:{prev:null},nanostamp:'123'}}));
 f.scope.al=[{id:'old',t:older.timestamp,stat:'strength',amount:100}];
 await f.scanGym();await f.scanGym(true);
 assert.equal(f.calls.length,2);const rows=f.scope.al.filter(x=>x.stat==='speed');
 assert.equal(rows.length,2);assert.equal(Math.round(rows.reduce((sum,x)=>sum+x.amount,0)*100),2440387);
});
