// ==UserScript==
// @name         HJ Startup Test
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper#diagnostic
// @version      1.0.0
// @description  Tiny read-only TornPDA injection diagnostic. No keys, API calls, game actions, or data storage.
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function(){"use strict";
if(!/^(www\.)?torn\.com$/.test(location.hostname))return;
const ID="hhj-startup-test",PANEL="hhj-startup-test-panel";
function show(){
 let d=document.getElementById(PANEL);
 if(d){d.remove();return}
 d=document.createElement("div");d.id=PANEL;
 d.style.cssText="position:fixed!important;top:14%!important;left:4%!important;right:4%!important;z-index:2147483647!important;padding:15px!important;border:2px solid #8cf1df!important;border-radius:12px!important;background:#102838!important;color:white!important;font:14px/1.6 sans-serif!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;max-height:70vh!important;overflow:auto!important";
 const mounted=!!document.getElementById("hhj-launch");
 const phase=window.__TornHappyJumpStage;
 const line=[
 "HJ Startup Test: EXECUTED",
 "Torn host: "+location.hostname,
 "Document: "+document.readyState,
 "Main HJ launcher in DOM: "+(mounted?"YES":"NO"),
 "Main HJ loaded marker: "+String(window.__TornHappyJumpLoaded??"none"),
 "Main HJ startup marker: "+String(window.__TornHappyJumpBooting??"none"),
 "Main HJ stage: "+(phase?JSON.stringify(phase):"none"),
 "TornPDA HTTP bridge present: "+(typeof window.PDA_httpGet==="function"||!!window.flutter_inappwebview?"YES":"NO"),
 "No API requests made. No Torn actions taken."
 ];
 d.textContent=line.join("\n");d.onclick=()=>d.remove();
 document.body.appendChild(d);
}
function mount(){
 if(!document.body||document.getElementById(ID))return;
 const b=document.createElement("button");b.id=ID;b.type="button";b.textContent="HJ TEST";
 b.style.cssText="position:fixed!important;right:6px!important;top:54%!important;z-index:2147483646!important;background:#147a50!important;color:white!important;border:2px solid white!important;border-radius:22px!important;padding:13px!important;font:800 14px sans-serif!important;display:block!important;visibility:visible!important;opacity:1!important";
 b.onclick=show;document.body.appendChild(b);
}
mount();document.addEventListener("DOMContentLoaded",mount,{once:true});
window.setInterval(mount,4000);
})();
