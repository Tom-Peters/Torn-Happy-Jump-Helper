'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const preview=read('Torn-Happy-Jump-Helper-preview.user.js');
const main=read('Torn-Happy-Jump-Helper.user.js');
test('Happy Jump has a visible Find control and safe direct section routes',()=>{
 assert.match(main,/data-act='staxx-find'/);
 assert.match(main,/new CustomEvent\("staxx:find"\)/);
 assert.match(main,/e\.detail\.section/);
 assert.match(main,/\["today","alerts","compare","plan","supplies","gyms","perks","progress","lab","settings","diagnostics"\]/);
 assert.match(main,/\/\/ @version\s+\d+\.\d+\.\d+/);
});
test('Frozen preview remains identical to its archived snapshot',()=>{
 assert.equal(preview,read('Torn-Happy-Jump-Helper-v0.39.4-preview.user.js'));
});
test('Find does not introduce game-state submissions',()=>{
 assert.doesNotMatch(main,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(main,/staxx:notice/);
});
