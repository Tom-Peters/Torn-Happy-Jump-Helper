// ==UserScript==
// @name         Torn HJ Injection Diagnostic
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      1.0.0
// @description  Small read-only TornPDA userscript installation diagnostic. No API access.
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
  "use strict";
  const ID="hhj-injection-test";
  function show(){
    const root=document.body||document.documentElement;
    if(!root||document.getElementById(ID))return;
    const badge=document.createElement("button");
    badge.id=ID;badge.type="button";badge.textContent="HJ TEST ✓";
    badge.setAttribute("aria-label","Torn Happy Jump Helper userscript injection test");
    badge.style.cssText="position:fixed!important;top:30%!important;left:6px!important;z-index:2147483647!important;padding:10px!important;border:2px solid #ffffff!important;border-radius:12px!important;background:#185b39!important;color:#ffffff!important;font:800 14px system-ui,sans-serif!important;display:block!important;visibility:visible!important;opacity:1!important;";
    badge.addEventListener("click",()=>{badge.textContent="PDA SCRIPT RUNNING ✓";});
    root.appendChild(badge);
  }
  show();
  if(typeof document.addEventListener==="function")document.addEventListener("DOMContentLoaded",show,{once:true});
  window.setInterval(show,3000); // DOM-only recovery; never requests Torn API or performs game actions.
})();
