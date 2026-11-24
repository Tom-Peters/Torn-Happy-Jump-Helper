'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
const preview=read('Torn-Happy-Jump-Helper-preview.user.js');
test('Happy Jump has a visible Find control and safe direct section routes',()=>{
 assert.match(preview,/data-act='staxx-find'/);
 assert.match(preview,/new CustomEvent\("staxx:find"\)/);
 assert.match(preview,/e\.detail\.section/);
 assert.match(preview,/\["today","alerts","compare","plan","supplies","gyms","perks","progress","lab","settings","diagnostics"\]/);
 assert.match(preview,/\/\/ @version\s+0\.39\.4/);
});
test('Frozen preview and promoted main preserve the same tested implementation',()=>{
 assert.equal(preview,read('Torn-Happy-Jump-Helper-v0.39.4-preview.user.js'));
 const main=read('Torn-Happy-Jump-Helper.user.js');
 assert.match(main,/\/\/ @version\s+0\.39\.4/);
 assert.equal(main.slice(main.indexOf('// ==/UserScript==')),preview.slice(preview.indexOf('// ==/UserScript==')));
});
test('Find does not introduce game-state submissions',()=>{
 assert.doesNotMatch(preview,/PDA_http(?:Post|Put|Patch|Delete)\s*\(/);
 assert.match(preview,/staxx:notice/);
});
