'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const preview=read('Torn-Happy-Jump-Helper-preview.user.js');
test('Happy Jump has a visible Find control and safe direct section routes',()=>{
 assert.match(preview,/data-act='staxx-find'/);
 assert.match(preview,/new CustomEvent\("staxx:find"\)/);
 assert.match(preview,/e\.detail\.section/);
 assert.match(preview,/\["today","alerts","compare","plan","supplies","gyms","perks","progress","lab","settings","diagnostics"\]/);
 assert.match(preview,/\/\/ @version\s+0\.31\.4/);
});
test('Happy Jump latest preview matches the immutable snapshot without modifying stable',()=>{
 assert.equal(preview,read('Torn-Happy-Jump-Helper-v0.31.4-preview.user.js'));
 assert.match(read('Torn-Happy-Jump-Helper.user.js'),/\/\/ @version\s+0\.10\.22/);
});
test('Find does not introduce game-state submissions',()=>{
 assert.doesNotMatch(preview,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(preview,/staxx:notice/);
});
