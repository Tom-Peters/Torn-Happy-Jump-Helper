// ==UserScript==
// @name         Torn HJ Injection Diagnostic
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      1.1.0
// @description  Diagnose userscript injection and Happy Jump Helper startup. No API access.
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function(){
  "use strict";
  const ID="hhj-injection-test",STATUS="hhj-diag-status";
  const recent=[];
  function show(){
    const root=document.body||document.documentElement;
    if(!root)return;
    let b=document.getElementById(ID);
    if(!b){
      b=document.createElement("button");
      b.id=ID;b.type="button";b.textContent="HJ TEST ✓";
      b.style.cssText="position:fixed!important;top:30%!important;left:6px!important;z-index:2147483647!important;padding:10px!important;border:2px solid #fff!important;border-radius:12px!important;background:#185b39!important;color:#fff!important;font:800 14px system-ui!important;display:block!important;visibility:visible!important;opacity:1!important;";
      b.addEventListener("click",()=>{const d=document.getElementById(STATUS);if(d)d.style.display=d.style.display==="none"?"block":"none";show();});
      root.appendChild(b);
    }
    let d=document.getElementById(STATUS);
    if(!d){
      d=document.createElement("div");d.id=STATUS;
      d.style.cssText="position:fixed!important;left:8px!important;top:40%!important;z-index:2147483647!important;max-width:min(85vw,390px)!important;padding:14px!important;border:2px solid #a7f3d0!important;border-radius:12px!important;background:#101f2b!important;color:#fff!important;font:14px/1.5 system-ui!important;white-space:pre-wrap!important;overflow-wrap:anywhere!important;box-shadow:0 6px 24px #000c!important;";
      root.appendChild(d);
    }
    const state=window.__TornHappyJumpStage;
    const button=document.getElementById("hhj-launch");
    const panel=document.getElementById("hhj-panel");
    const ph=state?.phase||"NOT STARTED";
    const ver=state?.version||"unknown";
    const style=button&&window.getComputedStyle?.(button);
    const hidden=!!button&&(style?.display==="none"||style?.visibility==="hidden"||style?.opacity==="0");
    d.textContent="HJ DIAGNOSTIC v1.1\n"+
      "TornPDA script injection: WORKING\n"+
      "Main script phase: "+ph+"\n"+
      "Main script version: "+ver+"\n"+
      "HJ button in page: "+(button?"YES":"NO")+"\n"+
      "HJ panel in page: "+(panel?"YES":"NO")+"\n"+
      (button?"Button visually hidden: "+(hidden?"YES":"NO")+"\n":"")+
      (recent.length?"Recent JS error: "+recent.slice(-1)[0]+"\n":"")+
      "\nIf Main says NOT STARTED, reinstall the main userscript from its raw URL and check the installed version.\n"+
      "If it shows ENGINE-LOADED or WAITING-BODY, the main script started but stopped before mounting.\n"+
      "If it says MOUNTED but button is missing, Torn's page layout may have replaced or hidden it.\n"+
      "Tap HJ TEST to hide/show this panel.";
  }
  window.addEventListener?.("error",e=>{if(recent.length>4)recent.shift();recent.push(String(e.message||"Unspecified error"));show();});
  show();
  document.addEventListener?.("DOMContentLoaded",show,{once:true});
  window.setInterval(show,3000);
})();
