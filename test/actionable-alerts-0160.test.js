'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','Torn-Happy-Jump-Helper-preview.user.js'),'utf8');
test('Happy Jump has action centre and per-alert focus',()=>{
 assert.match(source,/function alertsView\(/);assert.match(source,/\["alerts","Alerts"\]/);
 assert.match(source,/id:"od-recovery"/);assert.match(source,/id:"event-"\+e\.kind\.toLowerCase\(\)/);
 assert.match(source,/hjAlertFocus=St\(e\.detail\.alertId\)/);
});
test('Happy Jump opens only allowlisted Torn activity pages with no automated action',()=>{
 assert.match(source,/\["\/gym\.php","\/item\.php","\/points\.php"\]\.includes\(val\)/);
 assert.match(source,/location\.assign\(location\.origin\+val\)/);
});
