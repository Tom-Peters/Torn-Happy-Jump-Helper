import { readFileSync, writeFileSync } from "node:fs";
import { minify } from "terser";

const sourceFile="Torn-Happy-Jump-Helper.full.js";
const destFile="Torn-Happy-Jump-Helper-Advanced.user.js";
const source=readFileSync(sourceFile,"utf8");
const match=source.match(/^\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
if(!match)throw Error("Missing userscript header");
let header=match[0]
  .replace("@name         Torn Happy Jump Helper","@name         Torn Happy Jump Helper Advanced Preview")
  .replace(/@version\s+0\.6\.3/,"@version      0.8.0")
  .replace("@namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper",
    "@namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper#advanced")
  .replace(/@updateURL\s+[^\n]+/,
    "@updateURL    https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/"+destFile)
  .replace(/@downloadURL\s+[^\n]+/,
    "@downloadURL  https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/"+destFile);
let body=source.slice(match[0].length).replaceAll("0.6.3","0.8.0");
const result=await minify(body,{
  compress:{passes:2,defaults:true,unsafe:false},
  mangle:{toplevel:false},
  format:{comments:false,ascii_only:false},
  toplevel:false
});
if(result.error||!result.code)throw result.error||Error("Empty minifier output");
const output=header+"\n"+result.code+"\n";
if(!output.includes("###PDA-APIKEY###"))throw Error("API placeholder absent");
if(/\b(?:eval|Function)\s*\(/.test(result.code))throw Error("CSP-unsafe runtime compilation");
if(!output.includes("Torn Happy Jump Helper Advanced Preview"))throw Error("Wrong metadata");
writeFileSync(destFile,output);
console.log("Advanced full-function build",source.length,"->",output.length,"bytes");
