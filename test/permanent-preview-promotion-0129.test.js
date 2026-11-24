"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const previewName="Torn-Happy-Jump-Helper-preview.user.js";
const releaseName="Torn-Happy-Jump-Helper-v0.39.4-preview.user.js";
const base="https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/";
const header=source=>source.slice(0,source.indexOf("// ==/UserScript==")+"// ==/UserScript==".length);
const body=source=>source.slice(header(source).length);

test("permanent preview installs tested v0.39.4 with its own unchanged update identity",()=>{
 const source=read(previewName),meta=header(source);
 assert.match(meta,/\/\/ @name\s+Training-TornStaxx - Training Optimiser \(Preview\)/);
 assert.match(meta,/\/\/ @namespace\s+https:\/\/github\.com\/Tom-Peters\/Torn-Happy-Jump-Helper#preview\n/);
 assert.match(meta,/\/\/ @version\s+0\.39\.4\n/);
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

test("production installer has the permanent main identity and tested implementation",()=>{
 const stable=read("Torn-Happy-Jump-Helper.user.js"),meta=header(stable);
 assert.match(meta,/Training-TornStaxx - Training Optimiser\n/);
 const version=JSON.parse(read("package.json")).version;
 assert.equal(meta.match(/\/\/ @version\s+([^\s]+)\n/)?.[1],version);
 assert.ok(meta.includes("// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper\n"));
 assert.ok(meta.includes("// @updateURL    "+base+"Torn-Happy-Jump-Helper.user.js"));
 assert.ok(meta.includes("// @downloadURL  "+base+"Torn-Happy-Jump-Helper.user.js"));
 assert.equal(body(stable),body(read("Torn-Happy-Jump-Helper-v"+version+".user.js")));
 assert.match(header(read("Torn-Happy-Jump-Helper-v0.10.22-stable-rollback.user.js")),/\/\/ @version\s+0\.10\.22\n/);
});
