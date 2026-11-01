"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const previewName="Torn-Happy-Jump-Helper-preview.user.js";
const releaseName="Torn-Happy-Jump-Helper-v0.23.0-preview.user.js";
const base="https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/";
const header=source=>source.slice(0,source.indexOf("// ==/UserScript==")+"// ==/UserScript==".length);
const body=source=>source.slice(header(source).length);

test("permanent preview installs tested v0.23.0 with its own unchanged update identity",()=>{
 const source=read(previewName),meta=header(source);
 assert.match(meta,/\/\/ @name\s+Torn Happy Jump Helper \(Preview\)/);
 assert.match(meta,/\/\/ @namespace\s+https:\/\/github\.com\/Tom-Peters\/Torn-Happy-Jump-Helper#preview\n/);
 assert.match(meta,/\/\/ @version\s+0\.22\.0\n/);
 assert.ok(meta.includes("// @updateURL    "+base+previewName));
 assert.ok(meta.includes("// @downloadURL  "+base+previewName));
 assert.ok(!meta.includes(releaseName),"permanent preview should not switch to versioned updater");
 assert.ok(meta.includes("// @author       IamEEKY"));
 assert.ok(source.includes('const KEY="###PDA-APIKEY###"'));
});

test("permanent preview implementation matches the tested versioned release byte-for-byte",()=>{
 const preview=read(previewName),versioned=read(releaseName);
 assert.equal(body(preview),body(versioned),"only installer metadata may differ");
});

test("stable installer remains independent of the preview promotion",()=>{
 const stable=read("Torn-Happy-Jump-Helper.user.js");
 assert.match(header(stable),/\/\/ @version\s+0\.10\.22\n/);
 assert.ok(header(stable).includes("Torn-Happy-Jump-Helper.user.js"));
 assert.doesNotMatch(header(stable),/Torn-Happy-Jump-Helper-preview\.user\.js/);
});
