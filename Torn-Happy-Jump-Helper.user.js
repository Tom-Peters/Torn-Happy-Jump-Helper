// ==UserScript==
// @name         Torn Happy Jump Helper
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper
// @version      0.6.2
// @description  Small TornPDA-safe launcher for read-only Happy Jump Helper
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @grant        none
// ==/UserScript==
(function () {
  "use strict";
  const VERSION="0.6.2";
  const API_KEY="###PDA-APIKEY###";
  const CORE_URL="https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.full.js";
  const BUTTON_ID="hhj-quick-launch", STATUS_ID="hhj-loader-status";
  if(!/^(www\.)?torn\.com$/i.test(location.hostname))return;
  if(document.getElementById(BUTTON_ID))return;
  window.__HHJLoader={version:VERSION,status:"launcher-started",url:CORE_URL};
  let loading=false;
  const button=document.createElement("button");
  button.id=BUTTON_ID;
  button.type="button";
  button.textContent="HJ ◉";
  button.setAttribute("aria-label","Open Happy Jump Helper");
  button.style.cssText="position:fixed!important;top:41%!important;right:8px!important;bottom:auto!important;z-index:2147483646!important;background:#087b79!important;color:#fff!important;border:2px solid #b6fff4!important;border-radius:24px!important;padding:13px 15px!important;min-width:65px!important;min-height:48px!important;opacity:1!important;visibility:visible!important;display:block!important;pointer-events:auto!important;font:800 16px system-ui,sans-serif!important;box-shadow:0 4px 24px #000b!important;";
  const status=document.createElement("aside");
  status.id=STATUS_ID;
  status.style.cssText="display:none;position:fixed!important;z-index:2147483647!important;inset:auto 10px 100px 10px!important;max-width:460px!important;margin:auto!important;padding:17px!important;border-radius:16px!important;border:2px solid #83e4df!important;background:#122437!important;color:#fff!important;font:14px/1.5 system-ui,sans-serif!important;box-shadow:0 6px 35px #000e!important;";
  function setStatus(message,detail){
    window.__HHJLoader.status=message;
    status.style.display="block";
    status.replaceChildren();
    const title=document.createElement("strong");
    title.textContent="Happy Jump Helper "+VERSION;
    const text=document.createElement("p");
    text.textContent=message+(detail?" — "+detail:"");
    const close=document.createElement("button");
    close.type="button";close.textContent="Close";
    close.style.cssText="padding:9px 13px;border:1px solid #83e4df;border-radius:8px;background:#294459;color:#fff;";
    close.addEventListener("click",()=>{status.style.display="none";});
    status.append(title,text,close);
  }
  function mount(){
    if(!document.body)return;
    if(!document.getElementById(BUTTON_ID))document.body.appendChild(button);
    if(!document.getElementById(STATUS_ID))document.body.appendChild(status);
  }
  function openCore(){
    const real=document.getElementById("hhj-launch");
    if(real){
      if(window.__TornHappyJumpLoaded&&real.onclick!==null)real.click();
      else real.click();
      return true;
    }
    return false;
  }
  async function launch(){
    mount();
    if(openCore())return;
    if(loading)return;
    loading=true;
    setStatus("Loading the full read-only helper…");
    try{
      if(typeof PDA_httpGet!=="function")throw Error("TornPDA HTTP bridge unavailable on this page.");
      const response=await PDA_httpGet(CORE_URL,{});
      if(!(response&&response.status>=200&&response.status<300))
        throw Error("Could not download engine (HTTP "+(response?.status??"unknown")+").");
      let core=String(response.responseText||"");
      if(core.length<30000||core.length>250000||
         !core.includes("@name         Torn Happy Jump Helper")||
         !core.includes("@author       IamEEKY")||
         !core.includes("Torn-Happy-Jump-Helper"))
        throw Error("Downloaded engine was missing or did not match expected source.");
      // PDA key replacement applies to the installed small loader, so copy
      // the substitution into the fetched source in memory; never store it.
      if(!API_KEY.includes("PDA-APIKEY"))
        core=core.replace("###PDA-"+"APIKEY###",()=>API_KEY);
      setStatus("Engine downloaded. Starting interface…");
      // The fetched code is from this repository's fixed HTTPS raw URL.
      // The helper makes only read-only Torn API requests.
      new Function(core+"\n//# sourceURL=Torn-Happy-Jump-Helper.full.js")();
      if(!document.getElementById("hhj-launch"))
        throw Error("Engine executed but did not attach its HJ button. Phase: "+
          (window.__TornHappyJumpStage?.phase||"unknown"));
      window.__HHJLoader.status="ready";
      status.style.display="none";
      button.remove();
      document.getElementById("hhj-launch").click();
    }catch(error){
      setStatus("Unable to start helper",String(error?.message||error));
    }finally{loading=false;}
  }
  button.addEventListener("click",launch);
  mount();
  document.addEventListener?.("DOMContentLoaded",mount,{once:true});
  window.setInterval(()=>{
    if(window.__HHJLoader.status==="ready")return;
    mount();
  },3000);
})();
