// ==UserScript==
// @name         Torn Happy Jump Helper (Preview)
// @namespace    https://github.com/Tom-Peters/Torn-Happy-Jump-Helper#preview
// @version      0.29.0
// @description  Torn gym planner
// @author       IamEEKY
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js
// @downloadURL  https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js
// @grant        none
// ==/UserScript==
/* StaxxHub v2.9 · shared Torn PDA launcher · IamEEKY · no external dependencies */
(function () {
  "use strict";
  if (typeof location === "undefined" || typeof document === "undefined" ||
      !document.documentElement || typeof document.createElement !== "function" ||
      !/^(www\.)?torn\.com$/i.test(location.hostname) || window.top !== window.self) return;
  function startHub() {
    if (document.getElementById("staxx-hub-root")) return;
    const root = document.createElement("div");
    root.id = "staxx-hub-root";
    root.innerHTML =
      '<button type="button" id="staxx-hub-toggle" aria-label="Open Staxx tools" aria-expanded="false"><b>S</b><span id="staxx-hub-count" hidden></span></button>' +
      '<div id="staxx-hub-veil" hidden></div>' +
      '<aside id="staxx-hub-drawer" aria-label="Staxx tools and notifications" hidden>' +
      '<header class="staxx-head"><div><strong>Staxx<span>Hub</span></strong><small>YOUR TORN COMMAND CENTRE</small></div><button type="button" data-hub-close aria-label="Close sidebar">×</button></header>' +
      '<nav class="staxx-main-tabs" aria-label="StaxxHub sections"><button type="button" data-hub-view="today" aria-pressed="true">Today</button><button type="button" data-hub-view="tools" aria-pressed="false">Tools</button><button type="button" data-hub-view="alerts" aria-pressed="false">Alerts</button><button type="button" data-hub-view="more" aria-pressed="false">More</button></nav>' +
      '<div class="staxx-scroll">' +
      '<section data-hub-section="today"><section id="staxx-hub-welcome" hidden></section><div class="staxx-label"><h3>WHAT TO DO NEXT</h3><span>Highest priority first</span></div><section id="staxx-hub-tasks" aria-label="Prioritised Torn actions"></section><div class="staxx-label"><h3>OPEN A TOOL</h3><span>One tap</span></div><div id="staxx-hub-quick-tools"></div><p class="staxx-trendnote">Recommendations update from verified information while TornPDA is open.</p></section>' +
      '<section data-hub-section="tools" hidden><div class="staxx-label"><h3>YOUR TOOLS</h3><button type="button" data-arrange aria-pressed="false">Reorder</button></div><div id="staxx-hub-tools"></div></section>' +
      '<section data-hub-section="alerts" hidden><div class="staxx-label"><h3>NOTIFICATIONS</h3><span id="staxx-hub-total"></span></div><div id="staxx-hub-alerts"></div></section>' +
      '<section data-hub-section="more" hidden><button class="staxx-overview-switch" type="button" data-overview>▦ &nbsp; Daily dashboard · all tools</button>' +
      '<section id="staxx-hub-overview" hidden></section><button class="staxx-overview-switch" type="button" data-diagnostics>⚙ &nbsp; Tool diagnostics</button><section id="staxx-hub-diagnostics" hidden></section>' +
      '<button class="staxx-context-control" type="button" data-hub-mode>Display: Simple</button><button class="staxx-context-control" type="button" data-hub-guide>Show getting-started guide</button>' +
      '<button class="staxx-context-control" type="button" data-context-toggle>On-page guidance: On</button><p class="staxx-foot">Alerts use last known data · Drag the S tab vertically to reposition · No gameplay actions are submitted automatically</p></section>' +
      '</div></aside>';
    const css = document.createElement("style");
    css.id = "staxx-hub-css";
    css.textContent = [
      '#staxx-hub-root{position:fixed!important;inset:0!important;z-index:2147483647!important;pointer-events:none!important;font:14px/1.45 system-ui,-apple-system,Segoe UI,sans-serif!important;color:#e7f2ff!important}',
      '#staxx-hub-root *{box-sizing:border-box}#staxx-hub-root [hidden]{display:none!important}#staxx-hub-root button{font:inherit;color:inherit;cursor:pointer}',
      '#staxx-hub-root button:focus-visible{outline:2px solid #73dfff;outline-offset:2px}',
      '#staxx-hub-toggle{position:fixed;left:5px;top:43%;width:43px;height:49px;pointer-events:auto;border:1px solid #69dfff99;border-radius:0 13px 13px 0;background:linear-gradient(150deg,#0b74ba,#082a4a);box-shadow:0 6px 24px #000b;align-items:center;justify-content:center;touch-action:none;user-select:none}',
      '#staxx-hub-toggle b{font-size:22px;font-weight:900;color:#baf1ff}#staxx-hub-count{position:absolute;top:-8px;right:-8px;padding:2px 5px;min-width:20px;border-radius:14px;background:#38cfa9;border:2px solid #08192d;color:#062821;font-size:11px;font-weight:900}',
      '#staxx-hub-toggle.staxx-urgent{border-color:#ff778d;background:linear-gradient(150deg,#a83b54,#4b1734)}#staxx-hub-toggle.staxx-urgent #staxx-hub-count{background:#ff6b83;color:#fff}',
      '#staxx-hub-toggle.staxx-warning{border-color:#ffd17e;background:linear-gradient(150deg,#9b5b19,#433322)}#staxx-hub-toggle.staxx-warning #staxx-hub-count{background:#ffd17e;color:#32220a}',
      '#staxx-hub-veil{position:fixed;inset:0;pointer-events:auto;background:#020a17ba}',
      '#staxx-hub-drawer{position:fixed;inset:0 auto 0 0;width:min(302px,calc(100vw - 36px));height:100vh;height:100dvh;pointer-events:auto;background:#08192d;border-right:1px solid #28506e;box-shadow:10px 0 45px #000b;display:flex;flex-direction:column;padding-top:env(safe-area-inset-top)}',
      '#staxx-hub-drawer .staxx-head{display:flex;align-items:center;justify-content:space-between;padding:15px 13px;background:linear-gradient(120deg,#0c3358,#0b203b);border-bottom:1px solid #28506e;flex-shrink:0}',
      '#staxx-hub-drawer .staxx-head strong{display:block;font-size:20px;font-weight:850;letter-spacing:-.4px}#staxx-hub-drawer .staxx-head strong span{color:#54d7fa}',
      '#staxx-hub-drawer .staxx-head small{font-size:9px;letter-spacing:1px;color:#8fabca}',
      '#staxx-hub-drawer [data-hub-close]{background:#1c3b59;border:0;border-radius:9px;width:34px;height:34px;font-size:24px}',
      '#staxx-hub-drawer .staxx-scroll{flex:1;overflow-y:auto;overscroll-behavior:contain;padding:12px 10px 26px}',
      '#staxx-hub-drawer h3{color:#8faec9;font-size:10px;letter-spacing:1.1px;margin:9px 4px 10px}',
      '#staxx-hub-drawer .staxx-overview-switch{width:100%;text-align:left;background:linear-gradient(120deg,#124a71,#0c2d4b);border:1px solid #4384ad;border-radius:10px;padding:11px;margin-bottom:10px;font-weight:750}',
      '#staxx-hub-drawer .staxx-overview-switch.selected{border-color:#71d9fd;background:#19527b}',
      '#staxx-hub-drawer .staxx-toolrow{display:flex;align-items:center;gap:4px;margin-bottom:8px}#staxx-hub-drawer .staxx-toolrow .staxx-tool{margin-bottom:0;flex:1;min-width:0}#staxx-hub-drawer .staxx-move{height:31px;width:27px;flex:0 0 27px;border-radius:7px;background:#1a4364;border:1px solid #416c8e;color:#ccecff;font-weight:900}#staxx-hub-drawer .staxx-move:disabled{opacity:.25}#staxx-hub-drawer .staxx-tool{display:flex;align-items:center;gap:8px;text-align:left;width:100%;background:#102844;border:1px solid #284b6b;border-radius:11px;padding:10px 8px;min-height:62px;margin-bottom:8px}',
      '#staxx-hub-drawer .staxx-icon{width:35px;height:35px;display:grid;place-items:center;border-radius:9px;background:linear-gradient(135deg,#0b79b9,#123c65);border:1px solid #4f9dc8;color:#cff6ff;font-weight:900;flex-shrink:0;font-size:12px}',
      '#staxx-hub-drawer .staxx-info{flex:1;min-width:0}#staxx-hub-drawer .staxx-info b{display:block;font-size:13px}#staxx-hub-drawer .staxx-info small{display:block;font-size:10px;color:#94b1c9;margin-top:3px;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-pill{border-radius:14px;background:#1b486c;padding:2px 6px;font-size:11px;font-weight:800;color:#bdeaff}#staxx-hub-drawer .staxx-pill.on{background:#145f58;color:#89edca}',
      '#staxx-hub-drawer .staxx-label{display:flex;align-items:center;justify-content:space-between;margin-top:15px}#staxx-hub-drawer .staxx-label span{color:#a4c1d8;font-size:10px}#staxx-hub-drawer .staxx-label button{background:#173958;border:1px solid #365b79;border-radius:8px;padding:5px 9px;font-size:10px}#staxx-hub-drawer .staxx-label button[aria-pressed="true"]{background:#175f91;color:#fff}',
      '#staxx-hub-drawer .staxx-alert{background:#0e2945;border:1px solid #315977;border-radius:10px;padding:10px;margin-bottom:9px}',
      '#staxx-hub-drawer .staxx-alert.urgent{border-color:#e56785}#staxx-hub-drawer .staxx-alert.warning{border-color:#ae8450}',
      '#staxx-hub-drawer .staxx-alert-title{border:0;background:none;padding:0;text-align:left;width:100%;font-size:12px;font-weight:750;color:#81dbfa!important}',
      '#staxx-hub-drawer .staxx-alert.urgent .staxx-alert-title{color:#ff9bad!important}',
      '#staxx-hub-drawer .staxx-alert span{display:block;color:#daecf9;font-size:12px;margin:5px 0;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-alert small{display:block;color:#91aec6;font-size:11px;margin:4px 0}',
      '#staxx-hub-drawer .staxx-alert-item{display:block;width:100%;margin:7px 0 3px;padding:9px 10px;background:#123c60;border:1px solid #427b9f;color:#e3f5ff;border-radius:8px;text-align:left;font-size:12px;font-weight:750;line-height:1.35;min-height:38px}#staxx-hub-drawer .staxx-alert-item:focus-visible{outline:2px solid #54d7fa}#staxx-hub-drawer .staxx-alert-description{padding:0 3px 3px}',
      '#staxx-hub-drawer .staxx-alert-actions{display:flex;gap:7px;margin-top:10px}',
      '#staxx-hub-drawer .staxx-snooze-menu{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px}#staxx-hub-drawer .staxx-snooze-menu button{background:#174463;border:1px solid #3e7593;border-radius:7px;padding:6px 8px;min-height:32px;font-size:11px}#staxx-hub-drawer .staxx-snooze-menu input{background:#071d32;border:1px solid #527b9b;border-radius:7px;color:#fff;min-width:56px;width:64px;padding:6px;font-size:12px}#staxx-hub-drawer .staxx-snooze-menu label{display:flex;align-items:center;gap:4px;color:#bfd9ec;font-size:11px}#staxx-hub-drawer .staxx-due{font-size:11px;color:#b8e4ff!important;font-weight:700}#staxx-hub-drawer .staxx-spark{display:flex;align-items:end;gap:3px;height:40px;margin:11px 0 4px}#staxx-hub-drawer .staxx-spark span{flex:1;min-width:0;max-width:30px;border-radius:3px 3px 0 0;background:linear-gradient(#50d5f8,#17649c)}#staxx-hub-drawer .staxx-spark span.missing{background:#1e3a52;height:3px!important}#staxx-hub-drawer .staxx-trendnote{font-size:10px!important;color:#9ab5cf!important}#staxx-hub-drawer .staxx-alert-actions button{background:#1c3e5b;border:1px solid #365978;border-radius:8px;padding:6px 9px;font-size:11px;flex:1;min-height:32px}',
      '#staxx-hub-drawer .staxx-empty{color:#9db7cd;background:#0c243e;border:1px dashed #305473;border-radius:10px;font-size:11px;padding:14px 10px}',
      '#staxx-hub-drawer .staxx-overview-card{background:#0d2945;border:1px solid #2d5574;border-radius:11px;padding:11px;margin-bottom:8px}',
      '#staxx-hub-drawer .staxx-overview-card b{color:#83dbfa;font-size:12px}#staxx-hub-drawer .staxx-overview-card p{margin:5px 0;color:#d4eafa;font-size:11px}',
      '#staxx-hub-drawer .staxx-overview-card dl{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:8px 0 0}',
      '#staxx-hub-drawer .staxx-overview-card dt{font-size:10px;color:#96b6cf}#staxx-hub-drawer .staxx-overview-card dd{font-size:13px;font-weight:750;margin:0;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-task{width:100%;text-align:left;display:block;border:1px solid #315b79;border-radius:10px;background:#102b46;color:#eef8ff;padding:10px;margin-bottom:8px;line-height:1.45}#staxx-hub-drawer .staxx-task.urgent{border-color:#e56785}#staxx-hub-drawer .staxx-task.soon{border-color:#ae8450}#staxx-hub-drawer .staxx-task b{display:block;font-size:12px}#staxx-hub-drawer .staxx-task small{display:block;font-size:10px;color:#8fb7d2;margin-top:4px}#staxx-hub-drawer .staxx-task .staxx-step{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.4px;color:#67dfff;margin-bottom:4px}#staxx-hub-drawer .staxx-task:focus-visible{outline:2px solid #67dfff}',
      '#staxx-hub-drawer .staxx-foot{font-size:10px;color:#6d90ab;margin-top:17px}#staxx-hub-drawer .staxx-diagnostic-actions{display:flex;gap:8px;margin-bottom:12px}#staxx-hub-drawer .staxx-diagnostic-actions button{flex:1;background:#17496d;border:1px solid #3e789f;border-radius:8px;padding:9px;font-size:11px}#staxx-hub-drawer #staxx-safe-report{width:100%;min-height:130px;white-space:pre;color:#cfeeff;background:#091f34;border:1px solid #5182a3;border-radius:8px;font-size:10px}'
    ].join("");
    css.textContent += '#staxx-hub-drawer .staxx-context-control{display:block;width:100%;background:#0b314e;color:#8bdffc;border:1px solid #315775;border-radius:9px;padding:8px;margin:7px 0 14px;text-align:left}' +
      '#staxx-page-tip{box-sizing:border-box;display:flex;flex-wrap:wrap;gap:7px;align-items:center;background:#0c2944;color:#e9f5ff;border:1px solid #345f7d;border-left:4px solid #54d7fa;border-radius:9px;padding:10px 12px;margin:10px 0;font:13px/1.4 system-ui,Arial,sans-serif;max-width:720px;min-width:0;overflow-wrap:anywhere}' +
      '@media (max-width:849px),(pointer:coarse){#staxx-page-tip{display:none!important}}' +
      '#staxx-page-tip strong{color:#84e0fb}#staxx-page-tip small{color:#a9cce5;flex-basis:100%}' +
      '#staxx-page-tip button{background:#0879bd;color:#fff;border:1px solid #69cef5;border-radius:8px;padding:7px 10px;font:inherit;font-weight:700;cursor:pointer}';
    css.textContent += [
      '#staxx-hub-drawer .staxx-main-tabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:4px;padding:9px 10px;background:#08192d;border-bottom:1px solid #284b6b;flex-shrink:0}',
      '#staxx-hub-drawer .staxx-main-tabs button{min-width:0;min-height:42px;background:#102b46;border:1px solid #315d7d;border-radius:9px;font-size:11px;font-weight:800;padding:5px 2px;color:#cce9f7}',
      '#staxx-hub-drawer .staxx-main-tabs button[aria-pressed="true"]{background:#0879bd;border-color:#54d7fa;color:#fff}',
      '#staxx-hub-drawer #staxx-hub-quick-tools{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:4px 0 13px}',
      '#staxx-hub-drawer .staxx-quick-tool{display:flex;align-items:center;justify-content:center;flex-direction:column;gap:5px;min-height:64px;min-width:0;padding:8px 3px;background:#103756;border:1px solid #366d94;border-radius:10px;text-align:center;font-weight:800;font-size:11px;line-height:1.25;overflow-wrap:anywhere}',
      '#staxx-hub-drawer .staxx-quick-tool small{color:#8ddfff;font-size:10px;font-weight:700}',
      '#staxx-hub-drawer .staxx-quick-tool:disabled{opacity:.52;cursor:not-allowed}',
      '#staxx-hub-drawer .staxx-more-tasks{width:100%;margin:2px 0 8px;padding:9px;border:1px solid #376a8c;background:#0e3452;border-radius:9px;color:#9edfff;font-size:11px;font-weight:800}',
      '#staxx-hub-drawer [data-hub-section]>.staxx-label:first-child{margin-top:2px}'
    ].join("");
    css.textContent += '#staxx-hub-welcome{border:1px solid #367194;background:#103552;border-radius:11px;padding:11px;margin:0 0 12px}#staxx-hub-welcome strong{display:block;color:#9ce7ff;font-size:13px}#staxx-hub-welcome p{font-size:11px;line-height:1.45;color:#c4dfed;margin:7px 0}#staxx-hub-welcome button{background:#0879bd;border:1px solid #64c6ea;border-radius:8px;padding:8px 10px;min-height:36px;font-size:11px;font-weight:800;width:100%}';
    document.documentElement.append(css, root);

    const entries = [
      {id:"profit",label:"ProfitStaxx",icon:"PS",desc:"Markets · Stocks · Income"},
      {id:"company",label:"Company Helper",icon:"CO",desc:"Staff · Training · Growth"},
      {id:"happy",label:"Happy Jump",icon:"HJ",desc:"Gym · Schedule · Recovery"}
    ];
    const active = Object.create(null), notices = Object.create(null), summaries = Object.create(null), controls = Object.create(null), actionSets=Object.create(null), healthReports=Object.create(null);
    const registeredAt=Object.create(null);
    let trends=Object.create(null), arrangeShown=false;
    const toggle=root.querySelector("#staxx-hub-toggle"),veil=root.querySelector("#staxx-hub-veil"),drawer=root.querySelector("#staxx-hub-drawer");
    const tools=root.querySelector("#staxx-hub-tools"),alerts=root.querySelector("#staxx-hub-alerts"),bubble=root.querySelector("#staxx-hub-count");
    const overview=root.querySelector("#staxx-hub-overview"),overviewButton=root.querySelector("[data-overview]"),taskList=root.querySelector("#staxx-hub-tasks"),diagnostics=root.querySelector("#staxx-hub-diagnostics"),diagnosticButton=root.querySelector("[data-diagnostics]");
    let expanded=false, panelOpen=false, overviewShown=false, diagnosticsShown=false, moving=null, suppressClickUntil=0;
    let hubView="today", expandedTaskList=false;
    let uiMode=safeRead('staxx-hub-mode-v1','simple')==='advanced'?'advanced':'simple';
    function publishMode(){document.dispatchEvent(new CustomEvent('staxx:mode',{detail:{mode:uiMode}}));}
    function switchHubView(view){
      if(!["today","tools","alerts","more"].includes(view))return;
      hubView=view;
      for(const btn of root.querySelectorAll?.("[data-hub-view]")||[])
        btn.setAttribute("aria-pressed",String(btn.dataset.hubView===view));
      for(const section of root.querySelectorAll?.("[data-hub-section]")||[])
        section.hidden=section.dataset.hubSection!==view;
      const scroll=root.querySelector(".staxx-scroll");
      if(scroll)scroll.scrollTop=0; // Never scroll due to an event-driven data refresh.
    }
    let lastDataRequestV26=0;
    function refreshConnectedV26(force=false){
      if(document.hidden||!entries.some(x=>active[x.id]))return false;
      const time=Date.now();
      if(!force&&time-lastDataRequestV26<120000)return false;
      lastDataRequestV26=time;
      document.dispatchEvent(new CustomEvent("staxx:refresh-request",{detail:{reason:force?"manual":"hub-open",force}}));
      return true;
    }
    const openPanels=new Set();
    const idOk = v=>typeof v==="string" && /^[a-z][a-z0-9-]{0,31}$/.test(v);
    function node(tag,cls,value) {const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=String(value);return e;}
    function safeRead(key, fallback) {try {const v=JSON.parse(localStorage.getItem(key)||"null");return v===null?fallback:v;}catch(_){return fallback;}}
    function saveLocal(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(_){}}
    function remember(){
      try{sessionStorage.setItem("staxx-hub-state-v2",JSON.stringify({at:Date.now(),notices,summaries,actionSets}));}catch(_){}
    }
    try {
      const known=safeRead("staxx-hub-registry-v2",[]);
      if(Array.isArray(known))for(const e of known.slice(0,25)){
        if(idOk(e.id)&&!entries.some(x=>x.id===e.id))entries.push({id:e.id,label:String(e.label||e.id).slice(0,40),icon:String(e.icon||"S").slice(0,3),desc:String(e.desc||"Staxx tool").slice(0,70)});
      }
    }catch(_){}
    try {
      const old=JSON.parse(sessionStorage.getItem("staxx-hub-state-v2")||"null");
      if(old&&Date.now()-old.at<4*3600000){
        for(const id of Object.keys(old.notices||{}))if(idOk(id)){const n=old.notices[id];if(n&&Number(n.count)>=0)notices[id]=Object.assign({},n,{cached:true});}
        for(const id of Object.keys(old.summaries||{}))if(idOk(id)){const d=old.summaries[id];if(d&&typeof d==="object")summaries[id]=d;}
        for(const id of Object.keys(old.actionSets||{}))if(idOk(id)){const d=old.actionSets[id];if(d&&Array.isArray(d.items))actionSets[id]={items:d.items.slice(0,8),updated:d.updated,cached:true};}
      }
    }catch(_){}
    for(const e of entries)controls[e.id]=safeRead("staxx-hub-alert-control-"+e.id,{});
    const savedOrder=safeRead("staxx-hub-order-v3",[]);
    if(Array.isArray(savedOrder)){
      entries.sort((a,b)=>{
        const ai=savedOrder.indexOf(a.id),bi=savedOrder.indexOf(b.id);
        return (ai<0?1000:ai)-(bi<0?1000:bi);
      });
    }
    const savedTrends=safeRead("staxx-hub-trends-v3",{});
    if(savedTrends&&typeof savedTrends==="object"&&!Array.isArray(savedTrends))trends=savedTrends;
    const pos=safeRead("staxx-hub-position-v2",0.43);
    function position(value) {
      const height=Math.max(160,window.innerHeight||600),buttonHeight=49;
      const top=Math.max(18,Math.min(height-buttonHeight-18,Math.round(height*Math.max(0,Math.min(1,Number(value)||0)))));
      toggle.style.top=top+"px";
      return top/height;
    }
    position(typeof pos==="number"?pos:0.43);
    function launcherVisibility(){
      const hide=expanded||panelOpen;
      toggle.hidden=hide;
      toggle.style.setProperty("display",hide?"none":"flex","important");
      toggle.style.setProperty("pointer-events",hide?"none":"auto","important");
      toggle.setAttribute("aria-expanded",String(expanded));
    }
    function setExpanded(value){
      if(value&&!expanded){expandedTaskList=false;switchHubView("today");renderTasks();}
      expanded=Boolean(value);veil.hidden=drawer.hidden=!expanded;launcherVisibility();renderContext();
    }
    function activeNotice(id){
      const n=notices[id];if(!n||!(n.count>0))return null;
      const control=controls[id]||{};
      if(control.dismissed===n.fingerprint || Number(control.snoozeUntil)>Date.now())return null;
      return n;
    }
    function openTool(id,alertId){
      if(id==="company"&&!/^\/companies\.php$/i.test(location.pathname)){
        try{sessionStorage.setItem("staxx-open-company","1");if(alertId)sessionStorage.setItem("staxx-open-company-alert",alertId);}catch(_){}
        location.assign(location.origin+"/companies.php");return;
      }
      if(!active[id]){
        alerts.replaceChildren(node("p","staxx-empty","This tool is not active on this page. Enable its script in Torn PDA and reload."));
        return;
      }
      panelOpen=true;setExpanded(false);launcherVisibility();
      document.dispatchEvent(new CustomEvent("staxx:closeall"));
      document.dispatchEvent(new CustomEvent("staxx:open",{detail:{id,alertId:alertId||null}}));
    }
    function timeUntil(ms) {
      if(!Number.isFinite(ms)||ms<=0)return "";
      const diff=ms-Date.now(),minutes=Math.max(1,Math.ceil(Math.abs(diff)/60000));
      const text=minutes<60?minutes+"m":minutes<1440?Math.ceil(minutes/60)+"h":Math.ceil(minutes/1440)+"d";
      return diff<=0?"Overdue "+text: "Due in "+text;
    }
    function trendValue(value) {
      const match=String(value??"").replace(/,/g,"").trim().match(/^[$£]?\s*(-?\d+(?:\.\d+)?)\s*([kmb])?/i);
      if(!match)return null;
      const multiplier={k:1000,m:1000000,b:1000000000}[String(match[2]||"").toLowerCase()]||1;
      const n=Number(match[1])*multiplier;
      return Number.isFinite(n)?n:null;
    }
    const trendMetric={profit:"Fresh deals",company:"Star rating",happy:"24h projected gains"};
    const trendTitle={profit:"Fresh deals",company:"Company stars",happy:"24h projected gains (forecast)"};
    function dayKey(time){const d=new Date(time);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
    function recordTrend(id,entry) {
      const own=entries.find(x=>x.id===id);const key=own?.trendMetric||trendMetric[id]||entry?.metrics?.find(x=>trendValue(x.value)!==null)?.label;
      if(!key||!entry||!Array.isArray(entry.metrics))return;
      const metric=entry.metrics.find(x=>x.label===key);
      const timestamp=Number(entry.updated)||Date.now(),value=metric?trendValue(metric.value):null;
      if(value===null||timestamp>Date.now()+60000||Date.now()-timestamp>86400000)return;
      const list=Array.isArray(trends[id])?trends[id]:[];
      const day=dayKey(timestamp);
      const next=list.filter(x=>x&&typeof x.day==="string"&&x.day!==day&&Date.now()-Number(x.timestamp)<8*86400000);
      next.push({day,value,timestamp});next.sort((a,b)=>a.timestamp-b.timestamp);
      trends[id]=next.slice(-8);saveLocal("staxx-hub-trends-v3",trends);
    }
    function trendCard(id){
      const list=Array.isArray(trends[id])?trends[id]:[];
      if(!trendMetric[id]&&!entries.find(x=>x.id===id)?.trendMetric&&!(summaries[id]?.metrics||[]).some(x=>trendValue(x.value)!==null))return null;
      const wrap=node("div","staxx-trend");
      const title=node("small","staxx-trendnote","7-day trend · "+(entries.find(x=>x.id===id)?.trendMetric||trendTitle[id]||"first numeric summary metric")+" · observed snapshots");wrap.append(title);
      const bar=node("div","staxx-spark");
      const values=[];
      for(let offset=6;offset>=0;offset--){
        const time=new Date();time.setHours(12,0,0,0);time.setDate(time.getDate()-offset);
        const date=dayKey(time.getTime()),point=list.find(x=>x.day===date);values.push(point?point.value:null);
      }
      const max=Math.max(1,...values.filter(x=>x!==null).map(x=>Math.max(0,x)));
      for(const [i,value] of values.entries()){
        const b=node("span",value===null?"missing":"");
        b.style.height=value===null?"3px":Math.max(4,Math.min(40,Math.round(Math.max(0,value)/max*40)))+"px";
        b.title=(i===6?"Today":"Day "+(i+1))+" · "+(value===null?"Not recorded":String(value));
        bar.append(b);
      }
      wrap.append(bar);
      const recorded=values.filter(v=>v!==null);
      wrap.append(node("p","staxx-trendnote",recorded.length>1?
        "Change: "+(recorded.at(-1)-recorded[0]>0?"+":"")+String(Math.round((recorded.at(-1)-recorded[0])*100)/100)+" · "+recorded.length+"/7 recorded days":
        recorded.length+"/7 recorded days · comparison appears after two days"));
      return wrap;
    }

    // V2.5: everything registered through the normal Staxx event protocol joins the dashboard.
    // Never promote old or cross-page cached observations to a verified urgent instruction.
    function freshnessMs(id){
      const entry=entries.find(x=>x.id===id);
      return Math.max(60000,Math.min(86400000,Number(entry?.freshnessMs)||({profit:600000,company:86400000,happy:900000}[id]||3600000)));
    }
    function taskRowsV25(){
      const rows=[];
      for(const e of entries){
        const set=actionSets[e.id],control=controls[e.id]||{};
        if(!set||!Array.isArray(set.items)||Number(control.snoozeUntil)>Date.now())continue;
        const old=Boolean(set.cached)||!Number.isFinite(Number(set.updated))||Date.now()-Number(set.updated)>freshnessMs(e.id);
        for(const a of set.items)rows.push({...a,owner:e.id,tool:e.label,cached:old,updated:set.updated});
      }
      const rank={urgent:4,now:3,soon:2,review:1,optional:0};
      return rows.sort((a,b)=>Number(a.cached)-Number(b.cached)||
        (rank[b.status]??0)-(rank[a.status]??0)||
        (Number(a.dueAt)||Infinity)-(Number(b.dueAt)||Infinity)||
        (Number(b.priority)||0)-(Number(a.priority)||0));
    }
    function diagnosticReportV25(){
      const time=Date.now();
      return {hub:"2.8",capturedAt:new Date(time).toISOString(),page:String(location.pathname||""),
        connectedCount:entries.filter(x=>active[x.id]).length,knownCount:entries.length,tools:entries.map(e=>{
          const sum=summaries[e.id],actions=actionSets[e.id],notice=notices[e.id],h=healthReports[e.id];
          const age=Number(sum?.updated),lastAction=Number(actions?.updated);
          return {id:e.id,label:e.label,connected:Boolean(active[e.id]),registeredSecondsAgo:
            registeredAt[e.id]?Math.max(0,Math.floor((time-registeredAt[e.id])/1000)):null,
            summaryAgeMinutes:age>0?Math.max(0,Math.floor((time-age)/60000)):null,
            actionAgeMinutes:lastAction>0?Math.max(0,Math.floor((time-lastAction)/60000)):null,
            actionCount:Array.isArray(actions?.items)?actions.items.length:0,
            alertCount:Number(notice?.count)||0,
            stale:!actions||Boolean(actions.cached)||time-lastAction>freshnessMs(e.id),
            health:h?{version:h.version,api:h.api,storage:h.storage,ui:h.ui,detail:h.detail,observedAt:h.observedAt}:null};
        })};
    }
    function showDiagnosticsV25(){
      if(!diagnostics)return;
      diagnostics.replaceChildren();
      if(!diagnosticsShown){diagnostics.hidden=true;diagnosticButton.classList.remove("selected");return;}
      diagnostics.hidden=false;diagnosticButton.classList.add("selected");
      diagnostics.append(node("p","staxx-trendnote","Local health indicators only. No API keys, financial records, employee names, battle stats or personal IDs are collected in this report."));
      const buttons=node("div","staxx-diagnostic-actions"),check=node("button","","Check installed tools"),copy=node("button","","Copy safe report");
      check.type=copy.type="button";check.dataset.checkDiagnostics="1";copy.dataset.copyDiagnostics="1";
      buttons.append(check,copy);diagnostics.append(buttons);
      for(const row of diagnosticReportV25().tools){
        const card=node("div","staxx-overview-card");
        card.append(node("b","",row.label+" · "+(row.connected?"connected":"not running on this page")),
          node("p","",row.health?.version?"Version "+row.health.version:"Version not reported"),
          node("p","",row.health?"API "+row.health.api+" · Storage "+row.health.storage+" · UI "+row.health.ui:
            "No recent health response; open this tool or check whether it is enabled in TornPDA."),
          node("p","",row.stale?"Last action data stale or unverified":"Last action data within declared freshness window"),
          node("p","",row.actionCount+" recommendations · "+row.alertCount+" alerts"));
        if(row.health?.detail)card.append(node("small","staxx-trendnote",row.health.detail));
        diagnostics.append(card);
      }
      const output=node("textarea");output.id="staxx-safe-report";output.readOnly=true;output.hidden=true;
      output.value=JSON.stringify(diagnosticReportV25(),null,2);diagnostics.append(output);
    }

    function showOverview(){
      overview.replaceChildren();
      overview.append(node("p","staxx-trendnote","All registered tools automatically appear here, including future Staxx scripts. Stale suggestions are labelled and sorted after current data."));
      const syncButton=node("button","staxx-overview-switch","↻ Check current data across connected tools");
      syncButton.type="button";syncButton.dataset.syncAll="1";overview.append(syncButton);
      for(const [i,item] of taskRowsV25().slice(0,5).entries()){
        const row=node("button","staxx-task "+(!item.cached&&item.status==="urgent"?"urgent":""));
        row.dataset.openAlertTool=item.owner;row.dataset.openAlertId=item.id;
        row.append(node("span","staxx-step",(i+1)+" · "+item.tool+(item.cached?" · CHECK FRESHNESS":"")),node("b","",item.title));
        if(item.detail)row.append(node("small","",item.detail));overview.append(row);
      }
      for(const e of entries){
        const s=summaries[e.id],card=node("article","staxx-overview-card");
        card.append(node("b","",e.label),node("p","",s?.headline || (active[e.id]?"No verified figures yet":"Open tool for the latest figures")));
        const d=node("dl");
        for(const m of (Array.isArray(s?.metrics)?s.metrics:[]).slice(0,4)){
          const group=node("div");group.append(node("dt","",m.label),node("dd","",m.value));d.append(group);
        }
        if(d.childElementCount)card.append(d);
        const trend=trendCard(e.id);if(trend)card.append(trend);
        const btn=node("button","staxx-overview-switch","Open "+e.label);btn.dataset.openStaxx=e.id;card.append(btn);
        overview.append(card);
      }
      overview.hidden=!overviewShown;
      overviewButton.classList.toggle("selected",overviewShown);
      overviewButton.setAttribute("aria-expanded",String(overviewShown));
    }

    // Contextual, non-invasive Torn page tip. It never fills fields or performs gameplay.
    function currentContext(){
      const path=String(location.pathname||"").toLowerCase();
      if(path==="/gym.php")return {id:"happy",name:"Gym"};
      if(path==="/companies.php")return {id:"company",name:"Company"};
      if(path==="/page.php"&&/\bsid=itemmarket\b/i.test(String(location.search||"")))return {id:"profit",name:"Item Market"};
      if(path==="/page.php"&&/\bsid=stocks\b/i.test(String(location.search||"")))return {id:"profit",name:"Stock Market"};
      return null;
    }
    function contextEnabled(){return safeRead("staxx-hub-context-v1",true)!==false;}
    function renderContext(){
      const old=document.getElementById("staxx-page-tip");
      const control=root.querySelector("[data-context-toggle]");
      if(control){control.textContent="On-page guidance: "+(contextEnabled()?"On":"Off");
        control.setAttribute("aria-pressed",String(contextEnabled()));}
      const ctx=currentContext();
      // TornPDA can display desktop-width pages within a narrow touch viewport.
      // Never insert guidance into a native heading on a touch device or small layout.
      const touch=typeof navigator!=="undefined"&&Number(navigator.maxTouchPoints)>0;
      const coarse=typeof window.matchMedia==="function"&&window.matchMedia("(pointer: coarse)").matches;
      const width=Math.min(Number(window.innerWidth)||9999,Number(document.documentElement.clientWidth)||9999);
      if(!ctx||!contextEnabled()||touch||coarse||width<850||!active[ctx.id]||openPanels.size||panelOpen||expanded){
        if(old)old.remove();return;
      }
      const anchor=document.querySelector?.("#gymroot h1, #mainContainer h1, .content-wrapper h1, h1");
      const safeParent=anchor?.parentElement;
      const parentWidth=typeof safeParent?.getBoundingClientRect==="function"?safeParent.getBoundingClientRect().width:0;
      if(!anchor||typeof anchor.insertAdjacentElement!=="function"||parentWidth<540||anchor.closest?.("#staxx-hub-root, [role=dialog], #hhj-compact-panel")){if(old)old.remove();return;}
      const set=actionSets[ctx.id],fresh=set&&!set.cached&&Date.now()-Number(set.updated)<(ctx.id==="company"?86400000:ctx.id==="happy"?900000:480000);
      const ranks={urgent:5,now:4,soon:3,review:2,optional:1};
      const items=fresh&&Array.isArray(set.items)?set.items.slice().sort((a,b)=>(ranks[b.status]||0)-(ranks[a.status]||0)||(b.priority||0)-(a.priority||0)):[];
      // Stale/missing data triggers automatic refresh inside each tool; never cover Torn
      // with a large "refresh" prompt or present cached recommendations as live.
      const first=items.find(x=>!/^((refresh|recheck|scan)(-|$))/i.test(String(x.id||"")));
      if(!first){if(old)old.remove();return;}
      const title=first.title;
      const detail=first.detail||"";
      // Reuse existing element to avoid mutating Torn's DOM during every heartbeat.
      const fingerprint=ctx.id+"|"+title+"|"+detail+"|"+String(first?.id||"");
      if(old&&old.dataset.fingerprint===fingerprint&&old.previousElementSibling===anchor)return;
      if(old)old.remove();
      const bar=node("div");bar.id="staxx-page-tip";bar.dataset.fingerprint=fingerprint;
      bar.setAttribute("role","region");bar.setAttribute("aria-label","Staxx contextual guidance");
      const heading=node("strong","",ctx.name+" · NEXT ACTION");
      const message=node("span","",title),sub=node("small","",detail);
      const button=node("button","","Review action ›");
      button.type="button";button.addEventListener("click",()=>openTool(ctx.id,first.id));
      bar.append(heading,message,button,sub);
      anchor.insertAdjacentElement("afterend",bar);
    }
    function renderWelcome(){
      const host=root.querySelector('#staxx-hub-welcome');if(!host)return;
      const done=safeRead('staxx-hub-onboarded-v1',false)===true;
      host.hidden=done;host.replaceChildren();if(done)return;
      host.append(node('strong','','Welcome to StaxxHub'),node('p','','1. Today shows your next verified action. 2. Tools opens each installed helper. 3. Alerts takes you to the exact issue.'));
      host.append(node('p','','Simple mode keeps the important tabs visible; Advanced restores every section. You can change this under More.'));
      const finish=node('button','','Got it · Start using Staxx');finish.type='button';finish.dataset.hubGuideDone='1';host.append(finish);
    }
    function renderTasks(){
      if(!taskList)return;
      taskList.replaceChildren();
      const rows=taskRowsV25();
      for(const item of rows.slice(0,(expandedTaskList||uiMode==='advanced')?6:2)){
        const btn=node("button","staxx-task "+(!item.cached&&item.status==="urgent"?"urgent":!item.cached&&item.status==="soon"?"soon":""));
        btn.type="button";btn.dataset.openAlertTool=item.owner;btn.dataset.openAlertId=item.id;
        btn.append(node("span","staxx-step",(item.cached?"LAST OBSERVED · ":"")+(item.status==="urgent"?"ACT NOW":item.status==="now"?"DO NEXT":item.status==="soon"?"UPCOMING":item.status==="review"?"REVIEW":"OPTIONAL")+" · "+item.tool),
          node("b","",item.title));
        if(item.detail)btn.append(node("small","",item.detail));
        if(item.dueAt)btn.append(node("small","",timeUntil(item.dueAt)));
        if(item.cached)btn.append(node("small","","Verify current Torn data before acting"));
        taskList.append(btn);
      }
      if(!rows.length)taskList.append(node("p","staxx-empty","No verified next steps yet. Open a tool to refresh its data."));
      if(rows.length>2&&uiMode!=='advanced'){
        const more=node("button","staxx-more-tasks",expandedTaskList?"Show fewer actions":"Show "+Math.min(rows.length-2,4)+" more actions");
        more.type="button";more.dataset.toggleTasks="1";taskList.append(more);
      }
      if(rows.length>6&&(expandedTaskList||uiMode==='advanced'))taskList.append(node("p","staxx-foot",String(rows.length-6)+" further recommendations inside your tools"));
    }
    function render(){
      renderWelcome();
      const modeButton=root.querySelector('[data-hub-mode]');if(modeButton)modeButton.textContent='Display: '+(uiMode==='simple'?'Simple':'Advanced')+' · change';
      tools.replaceChildren();alerts.replaceChildren();
      const quick=root.querySelector("#staxx-hub-quick-tools");
      if(quick)quick.replaceChildren();
      let total=0,maxLevel=0,visible=0,muted=0;
      for(const [index,e] of entries.entries()){
        const n=activeNotice(e.id),count=n?Math.min(99,Number(n.count)||0):0;
        total+=count;visible+=Number(count>0);
        if(n)maxLevel=Math.max(maxLevel,n.level==="urgent"?2:n.level==="warning"?1:0);
        if(!n && notices[e.id]?.count>0)muted++;
        const btn=node("button","staxx-tool");btn.type="button";btn.dataset.openStaxx=e.id;
        const info=node("span","staxx-info");info.append(node("b","",e.label),node("small","",active[e.id]?e.desc:"Enable script to open"));
        btn.append(node("span","staxx-icon",e.icon),info,node("span","staxx-pill"+(count?" on":""),count||"›"));
        if(arrangeShown){
          const row=node("div","staxx-toolrow"),up=node("button","staxx-move","↑"),down=node("button","staxx-move","↓");
          up.type=down.type="button";up.dataset.moveId=down.dataset.moveId=e.id;up.dataset.moveDir="-1";down.dataset.moveDir="1";
          up.disabled=index===0;down.disabled=index===entries.length-1;
          up.title="Move "+e.label+" up";down.title="Move "+e.label+" down";
          row.append(btn,up,down);tools.append(row);
        }else tools.append(btn);
        if(quick&&index<3){
          const shortcut=node("button","staxx-quick-tool");
          shortcut.type="button";shortcut.dataset.openStaxx=e.id;
          shortcut.disabled=!active[e.id];
          shortcut.append(node("span","",e.label),node("small","",!active[e.id]?"Not active":count?count+" alerts":"Open"));
          quick.append(shortcut);
        }
      }
      toggle.classList.toggle("staxx-urgent",maxLevel===2);
      toggle.classList.toggle("staxx-warning",maxLevel===1);
      bubble.hidden=total===0;bubble.textContent=total>=100?"99+":String(total);
      toggle.setAttribute("aria-label",total?total+" Staxx notifications; open tools":"Open Staxx tools");
      root.querySelector("#staxx-hub-total").textContent=visible?visible+" tools":muted?muted+" muted":"All clear";
      const alertsTab=root.querySelector('[data-hub-view="alerts"]');
      if(alertsTab)alertsTab.textContent=total?"Alerts · "+(total>99?"99+":total):"Alerts";
      for(const e of entries){
        const n=activeNotice(e.id);if(!n)continue;
        const card=node("div","staxx-alert "+n.level);
        const title=node("button","staxx-alert-title",e.label+" · "+n.count+" alert"+(n.count===1?"":"s"));
        title.type="button";title.dataset.openStaxx=e.id;card.append(title);
        card.append(node("span","",n.summary||"Needs attention"));
        if(Array.isArray(n.alerts)&&n.alerts.length){
          for(const item of n.alerts.slice(0,8)){
            const go=node("button","staxx-alert-item",item.title);
            go.type="button";go.dataset.openAlertTool=e.id;go.dataset.openAlertId=item.id;
            go.title=item.detail||item.title;
            card.append(go);
            if(item.detail)card.append(node("small","staxx-alert-description",item.detail));
          }
          if(n.alerts.length>8)card.append(node("small","",String(n.alerts.length-8)+" more — open the tool's Alerts tab"));
        }else for(const item of n.items.slice(0,2))card.append(node("small","",item));
        if(n.cached)card.append(node("small","","Last observed on a previous page"));
        if(n.dueAt){const countdown=node("small","staxx-due",timeUntil(n.dueAt));card.append(countdown);}
        const buttons=node("div","staxx-alert-actions");
        const dismiss=node("button","","Dismiss"),snooze=node("button","","Snooze ▾");
        dismiss.type=snooze.type="button";dismiss.dataset.dismissStaxx=e.id;snooze.dataset.snoozeStaxx=e.id;
        buttons.append(dismiss,snooze);card.append(buttons);
        const menu=node("div","staxx-snooze-menu");menu.hidden=true;
        for(const [minutes,label] of [[15,"15m"],[60,"1h"],[240,"4h"],[1440,"24h"]]){
          const option=node("button","",label);option.type="button";option.dataset.snoozeId=e.id;option.dataset.snoozeMinutes=String(minutes);menu.append(option);
        }
        const custom=node("label","","Custom");const input=node("input");input.type="number";input.min="1";input.max="10080";input.value="120";input.title="Snooze duration in minutes";
        const units=node("span","","min");custom.append(input,units);
        const set=node("button","","Set");set.type="button";set.dataset.snoozeCustom=e.id;menu.append(custom,set);
        card.append(menu);alerts.append(card);
      }
      if(!visible)alerts.append(node("p","staxx-empty",muted?"Alerts dismissed or snoozed. New alerts will still appear.":"Nothing needs your attention right now."));
      renderTasks();
      showOverview();
      showDiagnosticsV25();
      launcherVisibility();
      renderContext();
    }
    root.addEventListener("click",e=>{
      const b=e.target.closest("button");if(!b)return;
      if(b.dataset.hubView){switchHubView(b.dataset.hubView);return;}
      if(b.dataset.hubGuideDone){saveLocal('staxx-hub-onboarded-v1',true);renderWelcome();return;}
      if(b.dataset.hubGuide){saveLocal('staxx-hub-onboarded-v1',false);switchHubView('today');renderWelcome();return;}
      if(b.dataset.hubMode){uiMode=uiMode==='simple'?'advanced':'simple';saveLocal('staxx-hub-mode-v1',uiMode);expandedTaskList=false;publishMode();render();return;}
      if(b.dataset.toggleTasks){expandedTaskList=!expandedTaskList;renderTasks();return;}
      if(b.dataset.contextToggle!==undefined){saveLocal("staxx-hub-context-v1",!contextEnabled());renderContext();return;}
      if(b.dataset.dismissStaxx){const id=b.dataset.dismissStaxx,n=notices[id];if(n){controls[id]={...controls[id],dismissed:n.fingerprint,snoozeUntil:0};saveLocal("staxx-hub-alert-control-"+id,controls[id]);render();}return;}
      if(b.dataset.snoozeStaxx){const menu=b.parentNode?.nextSibling;if(menu)menu.hidden=!menu.hidden;return;}
      if(b.dataset.snoozeId || b.dataset.snoozeCustom){
        const id=b.dataset.snoozeId||b.dataset.snoozeCustom;
        const minutes=b.dataset.snoozeCustom?Number(b.parentNode?.querySelector("input")?.value):Number(b.dataset.snoozeMinutes);
        if(!Number.isInteger(minutes)||minutes<1||minutes>10080)return;
        controls[id]={...controls[id],snoozeUntil:Date.now()+minutes*60000};
        saveLocal("staxx-hub-alert-control-"+id,controls[id]);render();return;
      }
      if(b.dataset.moveId){
        const from=entries.findIndex(x=>x.id===b.dataset.moveId),to=from+Number(b.dataset.moveDir);
        if(from>=0&&to>=0&&to<entries.length){
          const [entry]=entries.splice(from,1);entries.splice(to,0,entry);
          saveLocal("staxx-hub-order-v3",entries.map(x=>x.id));render();
        }return;
      }
      if(b.hasAttribute("data-arrange")){
        arrangeShown=!arrangeShown;b.setAttribute("aria-pressed",String(arrangeShown));b.textContent=arrangeShown?"Done":"Reorder";render();return;
      }
      if(b.dataset.openAlertTool){openTool(b.dataset.openAlertTool,b.dataset.openAlertId);return;}
      if(b.dataset.openStaxx){openTool(b.dataset.openStaxx);return;}
      if(b.hasAttribute("data-overview")){overviewShown=!overviewShown;if(overviewShown){diagnosticsShown=false;refreshConnectedV26();}render();return;}
       if(b.dataset.syncAll){refreshConnectedV26(true);return;}
       if(b.hasAttribute("data-diagnostics")){diagnosticsShown=!diagnosticsShown;if(diagnosticsShown){overviewShown=false;
         document.dispatchEvent(new CustomEvent("staxx:diagnostics-request"));}render();return;}
       if(b.dataset.checkDiagnostics){document.dispatchEvent(new CustomEvent("staxx:ping"));
         document.dispatchEvent(new CustomEvent("staxx:diagnostics-request"));showDiagnosticsV25();return;}
       if(b.dataset.copyDiagnostics){const report=JSON.stringify(diagnosticReportV25(),null,2);
         const clipboard=window.navigator?.clipboard;
         if(clipboard?.writeText){clipboard.writeText(report).catch(()=>{const box=diagnostics.querySelector("#staxx-safe-report");if(box){box.hidden=false;box.value=report;}});}
         else{const box=diagnostics.querySelector("#staxx-safe-report");if(box){box.hidden=false;box.value=report;box.select?.();}}
         return;}
      if(b===toggle){if(Date.now()<suppressClickUntil)return;setExpanded(true);refreshConnectedV26();return;}
      if(b.hasAttribute("data-hub-close"))setExpanded(false);
    });
    veil.addEventListener("click",()=>setExpanded(false));
    document.addEventListener("keydown",e=>{if(e.key==="Escape"&&expanded)setExpanded(false);});
    toggle.addEventListener("pointerdown",e=>{
      if(e.button!==undefined&&e.button!==0)return;
      moving={id:e.pointerId,startY:e.clientY,top:toggle.getBoundingClientRect().top,dragged:false};
      try{toggle.setPointerCapture?.(e.pointerId);}catch(_){}
    });
    toggle.addEventListener("pointermove",e=>{
      if(!moving||e.pointerId!==moving.id)return;
      if(Math.abs(e.clientY-moving.startY)>7)moving.dragged=true;
      if(moving.dragged){const height=Math.max(160,window.innerHeight||600);
        const y=Math.max(18,Math.min(height-67,moving.top+e.clientY-moving.startY));
        toggle.style.top=Math.round(y)+"px";}
    });
    function endMove(e){if(!moving||e.pointerId!==moving.id)return;
      if(moving.dragged){suppressClickUntil=Date.now()+350;saveLocal("staxx-hub-position-v2",position((parseFloat(toggle.style.top)||0)/Math.max(1,window.innerHeight)));
        // Prevent a post-drag synthetic click from reopening the drawer.
        e.preventDefault?.();}
      moving=null;
    }
    toggle.addEventListener("pointerup",endMove);toggle.addEventListener("pointercancel",endMove);
    window.addEventListener("resize",()=>position(safeRead("staxx-hub-position-v2",0.43)));
    document.addEventListener("staxx:panel",e=>{
      if(!e.detail||!idOk(e.detail.id))return;
      if(e.detail.open){openPanels.add(e.detail.id);panelOpen=true;setExpanded(false);}
      else{openPanels.delete(e.detail.id);panelOpen=openPanels.size>0;launcherVisibility();}
      renderContext();
    });
    document.addEventListener('staxx:mode',e=>{const m=e.detail?.mode;if((m==='simple'||m==='advanced')&&m!==uiMode){uiMode=m;saveLocal('staxx-hub-mode-v1',m);expandedTaskList=false;render();}});
    document.addEventListener("staxx:register",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id))return;
      let entry=entries.find(x=>x.id===id);
      if(!entry && entries.length<25){
        entry={id,label:String(d.label||id).slice(0,40),icon:String(d.icon||"S").slice(0,3),desc:String(d.desc||"Staxx tool").slice(0,70)};
        entries.push(entry);controls[id]=safeRead("staxx-hub-alert-control-"+id,{});
        saveLocal("staxx-hub-registry-v2",entries.slice(3));
      }
      if(entry){
        if(d.label)entry.label=String(d.label).slice(0,40);
        if(d.icon)entry.icon=String(d.icon).slice(0,3);
        if(d.desc)entry.desc=String(d.desc).slice(0,70);
        if(typeof d.trendMetric==='string')entry.trendMetric=d.trendMetric.slice(0,36);
        if(Number(d.freshnessMs)>=60000&&Number(d.freshnessMs)<=86400000)entry.freshnessMs=Number(d.freshnessMs);
        if(!registeredAt[id])registeredAt[id]=Date.now();
        active[id]=true;render();}
    });

    document.addEventListener("staxx:diagnostics",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const allow=(value,valid)=>valid.includes(value)?value:"unknown";
      healthReports[id]={version:String(d.version||"not-reported").slice(0,20),
        api:allow(d.api,["ready","stale","missing","error","unknown"]),
        storage:allow(d.storage,["ready","missing","error","unknown"]),
        ui:allow(d.ui,["ready","missing","error","unknown"]),
        detail:String(d.detail||"").replace(/[A-Za-z0-9]{20,}/g,"[redacted]").slice(0,110),
        observedAt:Date.now()};
      if(diagnosticsShown)showDiagnosticsV25();
    });
    document.addEventListener("staxx:notice",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const count=Math.min(99,Math.max(0,Math.floor(Number(d.count)||0)));
      const n={count,summary:String(d.summary||"").slice(0,180),
        items:Array.isArray(d.items)?d.items.slice(0,5).map(x=>String(x).slice(0,160)):[],
        level:["urgent","warning","info"].includes(d.level)?d.level:"info",cached:false};
      n.alerts=Array.isArray(d.alerts)?d.alerts.slice(0,30).filter(x=>x&&/^[a-z][a-z0-9-]{0,63}$/.test(String(x.id||""))).map(x=>({id:String(x.id),title:String(x.title||x.id).slice(0,100),detail:String(x.detail||"").slice(0,190)})):[];
      n.dueAt=Number.isFinite(Number(d.dueAt))&&Number(d.dueAt)>0?Number(d.dueAt):null;
      n.fingerprint=JSON.stringify([n.count,n.summary,n.items,n.alerts,n.level,n.dueAt]);
      if(JSON.stringify(notices[id])!==JSON.stringify(n)){notices[id]=n;remember();render();}
    });
    document.addEventListener("staxx:actions",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const items=Array.isArray(d.items)?d.items.slice(0,12).filter(a=>a&&/^[a-z][a-z0-9-]{0,63}$/.test(String(a.id||""))).map(a=>({
        id:String(a.id),title:String(a.title||"Review action").slice(0,100),detail:String(a.detail||"").slice(0,160),
        status:["urgent","now","soon","review","optional"].includes(a.status)?a.status:"review",
        priority:Math.max(0,Math.min(100,Number(a.priority)||0)),
        dueAt:Number.isFinite(Number(a.dueAt))&&Number(a.dueAt)>0?Number(a.dueAt):null
      })):[];
      const next={items,updated:Number(d.updated)||Date.now(),cached:false};
      if(JSON.stringify(actionSets[id])!==JSON.stringify(next)){actionSets[id]=next;remember();render();}
    });
    document.addEventListener("staxx:summary",e=>{
      const d=e.detail||{},id=d.id;if(!idOk(id)||!entries.some(x=>x.id===id))return;
      const entry={headline:String(d.headline||"").slice(0,90),
        metrics:Array.isArray(d.metrics)?d.metrics.slice(0,4).map(x=>({label:String(x.label||"").slice(0,36),value:String(x.value??"—").slice(0,45)})):[],
        updated:Number(d.updated)||Date.now()};
      if(JSON.stringify(summaries[id])!==JSON.stringify(entry)){summaries[id]=entry;recordTrend(id,entry);remember();if(expanded&&overviewShown)showOverview();}
    });
    window.setInterval(()=>{if(!document.hidden&&entries.some(e=>Number(controls[e.id]?.snoozeUntil)>0&&Number(controls[e.id]?.snoozeUntil)<=Date.now())){for(const e of entries){if(Number(controls[e.id]?.snoozeUntil)>0&&Number(controls[e.id]?.snoozeUntil)<=Date.now()){controls[e.id]={...controls[e.id],snoozeUntil:0};saveLocal("staxx-hub-alert-control-"+e.id,controls[e.id]);}}render();}else if(!document.hidden&&expanded&&entries.some(e=>activeNotice(e.id)?.dueAt)){render();}},60000);
    window.addEventListener?.("hashchange",renderContext);
    window.addEventListener?.("popstate",renderContext);
    window.addEventListener?.("resize",renderContext);
    window.setInterval?.(()=>{if(!document.hidden)renderContext();},15000);
    // Older v1 notifications cannot be trusted for dismiss-state comparisons.
    render();
    document.dispatchEvent(new CustomEvent("staxx:ping"));
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",startHub,{once:true});else startHub();
})();






(function(){"use strict";const Fi=Number.isFinite,En=Object.entries,Fr=Object.fromEntries,Fl=Math.floor,Ce=Math.ceil,Ro=Math.round,Mx=Math.max,Mn=Math.min,Tm=Date.now,Ar=Array.isArray,Ab=Math.abs,Nu=Number,St=String,Pa=Date.parse,Ut=Date.UTC,Do=document,Wi=window;const KEY="###PDA-APIKEY###", BASE="https://api.torn.com/v2", VER="0.27.0";if(!/^(www\.)?torn\.com$/.test(location.hostname))return;if(Wi.__TornHappyJumpBooting===VER)return;Wi.__TornHappyJumpBooting=VER;const N="hhj-compact-v1",ST=["strength","defense","speed","dexterity"], ITEMS={xanax:206,ecstasy:197,lollipop:310,dvd:366
};const fmt=n=>Fi(n)?Ro(n).toLocaleString("en-US"):"—";const cash=n=>Fi(n)?"$"+fmt(n):"Price unknown";const esc=x=>St(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));const utc=t=>new Date(t*1000).toISOString().slice(0,16).replace("T"," ")+" UTC";const cu=t=>new Date(t*1000).toLocaleString("en-GB",{timeZone:"UTC",day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit",hour12:false})+" UTC";const eta=t=>{const m=Ce((t-Tm()/1000)/60);return m<=1?"Now":m<60?"In "+m+" min":"In "+Fl(m/60)+"h "+m%60+"m"};const day=t=>new Date(t*1000).toISOString().slice(0,10);const get=(k,alt)=>{try{const x=localStorage.getItem(N+":"+k);return x===null?alt:JSON.parse(x)}catch(_){return alt}};const put=(k,v)=>{try{localStorage.setItem(N+":"+k,JSON.stringify(v))}catch(_){}};const CFG={budget:50000000,stat:"speed",mode:"training",refills:true,horizon:24,theme:"dark",gymBonus:0,ownedPoints:0,jumpSuccessPct:null,xanaxOdPct:null,ecstasyOdPct:null,odEstimateMode:"community",odFactionReduction:0,odNightclub:false,manualPrices:{},sleepEnabled:true,sleepStart:"23:00",sleepEnd:"08:00",adaptHistory:true};let cfg={...CFG,...get("settings",{})},data={},prices={},inv={},errs=[],busy=false,updated=0,tab="today",opened=false,lp=null,sm="auto",hs=get("history",[]),vr=get("gyms",{}),ledger=get("verification",[]),rg=get("rolling-plan",null),sp=get("show-partial",true),an=get("action-notes",[]),watch=get("watch",null),rc=get("recovery",null),start=Tm()/1000,awakeUntil=+get("awake-until",0)||0,al=get("gym-api-logs",[]),lc=+get("gym-log-checked-13",0)||0,ls="Not checked",acts=get("verified-actions",[]),actChecked=0,statSamples=get("stat-samples",[]),activityCoverage="Not checked";const rSt=(raw,t=Tm()/1000)=>acts.some(x=>x.kind==="REFILL"&&day(x.t)===day(t))?"used":raw===true?"used":raw===false?"ready":"unknown";const refill=()=>rSt(data.refills?.refills?.energy);const gym=()=>{const all=data.gyms?.gyms||[];return all.find(x=>+x.id===+data.gym?.gym?.id)||null};const stats=()=>Fr(ST.map(k=>[k,+data.stats?.battlestats?.[k]?.value||0]));const energy=()=>data.bars?.bars?.energy||{}, happy=()=>data.bars?.bars?.happy||{};const cd=()=>data.cooldowns?.cooldowns||{};function validClock(v){return typeof v==="string"&&/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/.test(v)}function mins(v,back){return validClock(v)?Nu(v.slice(0,2))*60+Nu(v.slice(3)):back}let ukYear=0,ukStart=0,ukEnd=0;function slp(t){if(!cfg.sleepEnabled||t>=awakeUntil-3600&&t<awakeUntil)return false;const a=mins(cfg.sleepStart,1320),b=mins(cfg.sleepEnd,480);if(a===b)return false;const d=new Date(t*1000),y=d.getUTCFullYear();if(y!==ukYear){ ukYear=y; const sunday=month=>{const last=new Date(Ut(y,month+1,0));return last.getUTCDate()-last.getUTCDay()}; ukStart=Ut(y,2,sunday(2),1)/1000;ukEnd=Ut(y,9,sunday(9),1)/1000;}const m=(d.getUTCHours()*60+d.getUTCMinutes()+(t>=ukStart&&t<ukEnd?60:0))%1440;return a<b?m>=a&&m<b:m>=a||m<b;}function sleepLabel(){return cfg.sleepEnabled?(cfg.sleepStart||"22:00")+"–"+(cfg.sleepEnd||"08:00")+" UK time":"Disabled"}
function gymDots(raw){const dots=Nu(raw);if(!Fi(dots)||dots<=0)return 0;return dots>10?dots/10:dots;}const perkRows=()=>En(data.perks?.perks||{}).flatMap(([type,entries])=>
(Ar(entries)?entries:[]).filter(x=>typeof x==="string"&&/gym|training|energy|happy|happiness|drug|cooldown|booster|candy|refill|xanax|ecstasy|DVD/i.test(x)).map(description=>({type,description})));const bonus=stat=>perkRows().reduce((n,r)=>{const d=r.description, p=+(d.match(/(\d+(?:\.\d+)?)\s*%/)||[])[1];const scoped=d.match(/\b(strength|speed|defen[cs]e|dexterity)\b/i)?.[1]?.toLowerCase().replace("defence","defense");return n+(p>0&&p<=200&&/gym.{0,12}gains?|gains?.{0,12}gym/i.test(d)&&!/decreas|reduc|lower|penalty/i.test(d)&&(!scoped||scoped===stat)?p/100:0);},1+Mx(0,+cfg.gymBonus||0)/100);function gain(e,h,s,dots,cost=10,m=1){let steps=Fl(e/cost),sum=0,ss=s,hh=h;while(steps-->0){const g=Mx(0,((3.480061091e-7*Math.log(hh+250)+3.091619094e-6)*ss+6.82775184551527e-5*(hh+250)-0.0301431777)*dots*cost*m);sum+=g;ss+=g;hh=Mx(0,hh-cost*0.5)}return sum;}function basket(item,n,stock=0){const buy=Mx(0,n-stock);if(!buy)return 0;const rows=[...(prices[item]||[])].filter(x=>Fi(+x.price)&&+x.price>0&&+x.amount>0).sort((a,b)=>a.price-b.price);let remaining=buy,total=0;for(const r of rows){const take=Mn(remaining,r.amount);remaining-=take;total+=take*r.price;if(!remaining)return total}const manual=+cfg.manualPrices?.[item];return manual>0&&Fi(manual)?total+remaining*manual:Infinity;}
function jumpKit(method="happy"){const required=method==="happy-candy"?{xanax:4,lollipop:48,ecstasy:1}:{xanax:4,dvd:4,ecstasy:1};const entries=En(required).map(([name,num])=>({name,num,have:owned(name),missing:Mx(0,num-owned(name)),price:basket(name,num,owned(name))
}));const total=entries.reduce((sum,x)=>sum+x.price,0);return {entries,total,available:Fi(total)&&total<=cfg.budget};}function kitAffordable(){return jumpKit().available}function verifiedPointsV025(){
 const balance=data.money?.money?.points;
 return Number.isSafeInteger(balance)&&balance>=0&&data.moneyAt>0&&Tm()-data.moneyAt<30*60000?balance:null;
}
function owned(name){return name==="points"?(verifiedPointsV025()??Mx(0,+cfg.ownedPoints||0)):Mx(0,+inv[name]||0)}function needs(plan){return En(plan?.count||{}).filter(([,num])=>num>0).map(([name,num])=>({name,num,have:owned(name),missing:Mx(0,num-owned(name)),price:basket(name,num,owned(name))}));}function gEl(g,b){const n=St(g?.name||"").toLowerCase(),a=b.strength||0,v=b.speed||0,c=b.defense||0,d=b.dexterity||0;if(n.includes("balboas"))return c+d>=1.25*(a+v);if(n.includes("frontline"))return a+v>=1.25*(c+d);if(n.includes("gym 3000"))return a>=1.25*Mx(v,c,d);if(n.includes("isoyamas"))return c>=1.25*Mx(a,v,d);if(n.includes("total rebound"))return v>=1.25*Mx(a,c,d);if(n==="elites")return d>=1.25*Mx(a,v,c);if(n.includes("sports science"))return false;return true;}function sGa(g,k,e,h,b){return gain(e,h,b[k],gymDots(g.modifiers?.[k]),g.energy_cost||10,bonus(k));}function statAdvice(){const b=stats(),g=gym(),e=energy().maximum||150,h=happy().maximum||5000;if(!g||!ST.every(k=>b[k]>0))return null;const baseline=ST.map(k=>({stat:k,current:b[k],gain:sGa(g,k,e,h,b)}));return {balance:[...baseline].sort((x,y)=>x.current-y.current)[0],value:[...baseline].sort((x,y)=>y.gain-x.gain)[0]};}function loadInput(){const g=gym(),b=stats(),k=cfg.stat,bar=energy(),h=happy();if(!g||!(b[k]>0)||!(gymDots(g.modifiers?.[k])>0)||!(h.maximum>0))return null;return {gym:g,stat:k,value:b[k],dots:gymDots(g.modifiers[k]),cost:g.energy_cost||10,energy:bar.current||0,maxE:bar.maximum||150,regen:bar.interval||120,inc:bar.increment||1,happy:h.current??h.maximum,maxH:h.maximum,drug:cd().drug||0,booster:cd().booster||0,m:bonus(k),refill:refill(),now:Tm()/1000};}function cMet(p){const e=p?.cost||0,now=Tm()/1000;if(!e)return null;const gymName=St(p.gym?.name||"").toLowerCase(),v=al.filter(x=>x.stat===p.stat&&x.trains>0&&x.energy>0&&x.t>=now-604800&&Ab(x.energy/x.trains-e)<.5&&(!x.gym||!gymName||St(x.gym).toLowerCase()===gymName||St(x.gym)===St(p.gym?.id))).map(x=>x.amount/x.trains).filter(x=>Fi(x)&&x>0).sort((a,b)=>a-b);if(v.length<3)return {n:v.length,factor:1};const median=v[Fl(v.length/2)],good=v.filter(x=>x>=median*.7&&x<=median*1.3),typical=good[Fl(good.length/2)],raw=gain(e,p.happy,p.value,p.dots,e,p.m),ratio=typical/raw,ready=good.length>=6&&good.length>=v.length*.75&&Fi(ratio)&&ratio>=.65&&ratio<=1.35;return {n:v.length,kept:good.length,typical,raw,factor:ready?ratio:1,ready}}function cFactor(p){return cMet(p)?.factor||1}
function simulate(method,input,hours=168,options=null){const spendLimit=options?.budget??cfg.budget,allowRefills=options?.refills??cfg.refills,minHappy=Mx(0,Nu(options?.minHappy??0));const p=input,now=Ce(p.now/60)*60,until=now+3600*hours,cap=p.maxE;let e=p.energy,h=p.happy,stat=p.value,nextDrug=now+p.drug,spent=0,gainTotal=0,trainedE=0,regenLost=0,sleepLost=0,drugCount=0,jumps=0;const factor=method==="natural"||method==="xanax"?(Fi(p._factor)?p._factor:cFactor(p)):1,events=[],losses=[],count={xanax:0,ecstasy:0,lollipop:0,dvd:0,points:0},day0=day(now);const observed=cfg.adaptHistory!==false&&(method==="natural"||method==="xanax")?observedGymPatternV200(now):null;
const kitOk=!method.startsWith("happy")||jumpKit(method).available;let firstRefill=p.refill!=="ready",yday="",refilled=false,bank=0,stack=0,boosterCD=p.booster,cost=0,available=true,canCount=0,canAdded=0;const canCfg=p._canScenario,canPer=canCfg?Mn(12,Mx(0,Fl(canCfg.perDay||0))):0,canEnergy=canCfg?Mx(0,Nu(canCfg.baseE||0)*Nu(canCfg.mult||1)):0;let canDay="",canUsed=0,nextCan=now+p.booster;const add=(t,kind,detail,q=0,g=0,spent=0)=>events.push({t,kind,detail,q,g,spent});const bookCost=(name,n)=>basket(name,n,owned(name));const afford=(name,num=1)=>{const newTotal=bookCost(name,count[name]+num),old=bookCost(name,count[name]);return Fi(newTotal)&&cost+newTotal-old<=spendLimit};const use=(name,n)=>{const old=bookCost(name,count[name]);count[name]+=n;const next=bookCost(name,count[name]);const paid=next-old;cost+=paid;return paid;};const train=(t,label)=>{if((method==="natural"||method==="xanax")&&h<minHappy)return;const used=Fl(e/p.cost)*p.cost;if(!used)return;const g=gain(used,h,stat,p.dots,p.cost,p.m)*factor;e-=used;h=Mx(0,h-used*.5);stat+=g;gainTotal+=g;trainedE+=used;add(t,"TRAIN",label+" · "+used+" E · +"+fmt(g)+" "+p.stat,used,g)};for(let t=now;t<until;t+=60){const asleep=slp(t),preBed=!asleep&&slp(t+60),wake=t>now&&!asleep&&slp(t-60);const d=day(t);if(d!==yday){yday=d;refilled=d===day0?firstRefill:false}if(d!==canDay){canDay=d;canUsed=0}if(t>now){bank+=60;boosterCD=Mx(0,boosterCD-60);while(bank>=p.regen){bank-=p.regen;if(e<cap)e=Mn(cap,e+p.inc);else {regenLost+=p.inc;if(asleep)sleepLost+=p.inc;losses.push({t,q:p.inc,asleep})}}}if(t%900===0){h=h>p.maxH?p.maxH:Mn(p.maxH,h+5)}if(asleep)continue;if(canCfg&&(method==="natural"||method==="xanax")&&h>=minHappy&&canUsed<canPer&&canCount<canPer*7&&t>=nextCan&&boosterCD<=24*3600-7200&&canEnergy>0&&e<1000){const actual=Mn(canEnergy,1000-e);if(actual>0){e+=actual;canAdded+=actual;boosterCD+=7200;canUsed++;canCount++;add(t,"CAN","Energy can; "+fmt(actual)+" E with 2h booster cooldown",actual);train(t,"Train after energy can")}nextCan=t+7200}if(method==="natural"||method==="xanax"){if(observed?.strong&&t%3600===0&&observed.hours.includes(ukHourV200(t))&&e>=p.cost)train(t,"Your verified usual gym window");if(preBed&&e>=p.cost)train(t,"Train before bed to reduce overnight regeneration waste");if(wake&&e>=p.cost)train(t,"Train after waking to free energy capacity");if(method==="xanax"&&h>=minHappy&&t>=nextDrug&&e<=750&&afford("xanax")){const oldE=e,oldH=h,paid=use("xanax",1);drugCount++;e=Mn(1000,e+250);h+=75;nextDrug=t+7*3600;add(t,"XANAX","Take Xanax manually; estimated +250 E",250,0,paid);events[events.length-1].odEnergy=oldE;events[events.length-1].odHappy=oldH;train(t,"Train after Xanax")}else if(e>=cap)train(t,"Train naturally regenerated energy");if(allowRefills&&h>=minHappy&&!refilled&&e<cap&&afford("points",30) ){if(e>=p.cost)train(t,"Train before available daily point refill");const restored=cap-e,paid=use("points",30);refilled=true;e=cap;add(t,"REFILL","Spend 30 points manually; restore "+restored+" E up to "+cap,restored,0,paid);train(t,"Train refilled energy");}}else if(method==="happy"||method==="happy-candy"){if(jumps>0||!kitOk)continue;if(stack===0&&(preBed||wake)&&e>=p.cost)train(t,preBed?"Train before bed":"Train after waking");if(stack===0&&t>=nextDrug&&e>=p.cost)train(t,"Train current energy immediately before starting Xanax stack");if(stack<4&&t>=nextDrug&&e<=760){const oldE=e,oldH=h,paid=use("xanax",1);stack++;e=Mn(1000,e+250);h+=75;nextDrug=t+7*3600;add(t,"XANAX","Stack Xanax "+stack+"/4; wait for drug cooldown",250,0,paid);events[events.length-1].odEnergy=oldE;events[events.length-1].odHappy=oldH;}if(stack===4&&t>=nextDrug&&boosterCD===0&&t%900===60){const candy=method==="happy-candy";const paidBoost=candy?use("lollipop",48):use("dvd",4);const paidEcstasy=use("ecstasy",1),oldE=e,oldH=h+(candy?48*25:4*2500);h=Mn(99999,2*oldH);boosterCD=24*3600;jumps++;add(t,"JUMP","Use "+(candy?"48 lollipops":"four Erotic DVDs")+" consecutively, then Ecstasy; train before the next 15-minute happiness reset · estimated Happy "+fmt(h),0,0,paidBoost+paidEcstasy);events[events.length-1].odEnergy=oldE;events[events.length-1].odHappy=oldH;train(t,"Happy-jump gym training");}}}return {method,events,losses,gain:gainTotal,cost,canCount,canAdded,energy:trainedE,lost:regenLost,sleepLost,drugs:drugCount,jumps,count,start:now,end:until,affordable:cost<=spendLimit&&Fi(cost),note:method.startsWith("happy")?"One prepared Happy jump, not weekly repeatable":
"Assumes on-time actions and 7-hour Xanax cooldowns"};}function plans(){const p=loadInput();if(!p)return [];return ["natural","xanax","happy-candy","happy"].map(k=>(k==="natural"||k==="xanax")?simulateRecovery(k,p):simulate(k,p));}function summary(p,hours=168,now=null){if(!p)return null;const start=now??p.start,end=start+hours*3600;const events=p.events.filter(x=>x.t>=start&&x.t<end),losses=(p.losses||[]).filter(x=>x.t>=start&&x.t<end);return {hours,events,lost:losses.reduce((n,x)=>n+x.q,0),sleepLost:losses.filter(x=>x.asleep).reduce((n,x)=>n+x.q,0),gain:events.reduce((v,x)=>v+(x.g||0),0),energy:events.filter(x=>x.kind==="TRAIN").reduce((v,x)=>v+(x.q||0),0),cost:events.reduce((v,x)=>v+(x.spent||0),0),trains:events.filter(x=>x.kind==="TRAIN").length,refills:events.filter(x=>x.kind==="REFILL").length,xanax:events.filter(x=>x.kind==="XANAX").length,jumps:events.filter(x=>x.kind==="JUMP").length};}function tEs(p,e=p.cost){return gain(Fl(e/p.cost)*p.cost,p.happy,p.value,p.dots,p.cost,p.m)*cFactor(p)}
function aPl(){const list=lp||[];if(!list.length)return null;if(sm!=="auto"){const choice=list.find(x=>x.method===sm);if(choice)return choice;}const feasible=list.filter(x=>x.affordable&&(!x.method.startsWith("happy")||x.jumps>0));const choices=feasible.filter(x=>cfg.mode==="happy"?x.method.startsWith("happy"):!x.method.startsWith("happy"));return choices.sort((a,b)=>b.gain-a.gain)[0]||feasible.find(x=>x.method==="natural")||list[0];}function projection(s,g){return [50000000,100000000,200000000,1000000000].map(goal=>{let value=s,weeks=0;while(value<goal&&weeks<5200){value+=Mx(0,g*(1+Mx(0,value-s)*0.00000002));weeks++}return {goal,weeks:value>=goal?weeks:null,spend:value>=goal?weeks*(aPl()?.cost||0):null};})}async function api(path){if(KEY.includes("PDA-APIKEY"))throw Error("TornPDA did not substitute its API key");const url=BASE+path,headers={Authorization:"ApiKey "+KEY,Accept:"application/json"};const r=typeof PDA_httpGet==="function"?await PDA_httpGet(url,headers):
await Wi.flutter_inappwebview.callHandler("PDA_httpGet",url,headers);if(r.status!==200)throw Error("HTTP "+r.status);const body=JSON.parse(r.responseText);if(body.error)throw Error("Torn error "+body.error.code);return body;}async function refresh(){if(busy)return;busy=true;errs=[];draw();const paths={bars:"/user/bars",cooldowns:"/user/cooldowns",stats:"/user/battlestats",gym:"/user/gym",gyms:"/torn/gyms",refills:"/user/refills",perks:"/user/perks",property:"/user/property",propertyCatalog:"/torn/properties",money:"/user/money",education:"/user/education",educationCatalog:"/torn/education",odFactionUpgrades:"/faction/upgrades",odJob:"/user/job"};for(const [k,id] of En(ITEMS))paths["m_"+k]="/market/"+id+"/itemmarket?limit=100";paths.m_points="/market/pointsmarket";for(const [stat,id] of En({strength:331,defense:330,speed:329,dexterity:106}))paths["enh_"+stat]="/market/"+id+"/itemmarket?limit=15";let next={enhancerOffers:{}};inv={};prices={};const jobs=En(paths);let index=0;const worker=async()=>{while(index<jobs.length){const [name,path]=jobs[index++];try{const v=await api(/^(bars|cooldowns|stats|refills)$/.test(name)?path+"?timestamp="+Fl(Tm()/1000):path);if(name.startsWith("enh_")){const rows=v.itemmarket?.listings||v.itemmarket||[];next.enhancerOffers[name.slice(4)]=Ar(rows)?rows.map(x=>({price:Nu(x.price??x.cost??x.listing_price),amount:Nu(x.amount??x.quantity)})).filter(x=>x.price>0&&x.amount>0):[];}else if(name==="money"){
 if(!Number.isSafeInteger(v.money?.points)||v.money.points<0)throw Error("Torn points balance missing");
 next.money=v;next.moneyAt=Tm();
 }else if(name.startsWith("m_"))prices[name.slice(2)]=name==="m_points"?
(v.pointsmarket||[]).map(x=>({price:x.cost,amount:x.quantity})):
v.itemmarket?.listings||[];else next[name]=v;}catch(err){errs.push(name+": "+St(err.message).slice(0,70))}}};await Promise.all([worker(),worker(),worker()]);data=next;data.priceUpdated=Tm();let allInventory=null;for(const cat of ["Drug","Candy","Book","Booster"]){try{let items;try{items=(await api("/user/inventory?cat="+cat+"&limit=250")).inventory?.items}catch(e){if(!/\b21\b/.test(St(e.message)))throw e;try{items=(await api("/user/inventory?cat="+cat.toLowerCase()+"&limit=250")).inventory?.items}catch(e2){if(!/\b21\b/.test(St(e2.message)))throw e2;if(!allInventory){allInventory=[];for(let offset=0;offset<2000;offset+=250){const page=(await api("/user/inventory?limit=250&offset="+offset)).inventory?.items;if(!Ar(page))throw Error("Unfiltered inventory unavailable");allInventory.push(...page);if(page.length<250)break;if(offset===1750)throw Error("Inventory exceeds safe page limit");}}const ids=cat==="Drug"?[206,197]:cat==="Candy"?[310]:cat==="Booster"?[366]:[];items=allInventory.filter(x=>cat==="Book"?(x.id>=744&&x.id<=787):ids.includes(x.id));errs.push("Inventory "+cat+": category 21; unfiltered fallback used");}}if(!Ar(items))throw Error("Missing inventory items");if(cat==="Book")data.books=items;else for(const row of items)for(const [name,id] of En(ITEMS))
if(row.id===id&&!row.faction_owned)inv[name]=(inv[name]||0)+(+row.amount||0);}catch(e){if(cat==="Book")data.books=null;errs.push("Inventory "+cat+": "+St(e.message).slice(0,70))}}updated=next.bars?.bars?.energy&&next.bars?.bars?.happy&&next.cooldowns?.cooldowns&&next.stats?.battlestats&&next.gym?.gym&&Ar(next.gyms?.gyms)&&next.refills?.refills?Tm():0;if(!updated)errs.push("Essential Torn data incomplete: recommendations require a successful full refresh");const st=stats();recordStatSnapshot(st);if(Object.values(st).some(x=>x>0)){const today=day(Tm()/1000),last=hs[hs.length-1];if(!last||last.d!==today){hs.push({d:today,s:st});hs=hs.slice(-90);put("history",hs)}}let checkpointed=false;try{checkpointed=checkpoint(st)}catch(e){errs.push("Verification: "+St(e.message).slice(0,70))}try{lp=plans()}catch(e){lp=null;errs.push("Planner: "+St(e.message).slice(0,90))}if(checkpointed&&rg){const p=aPl();rg.events=(p?.events||[]).filter(x=>x.kind==="TRAIN").map(x=>({t:x.t,g:x.g}));rg.method=p?.method||"none";const g=gym(),h=happy();rg.gymId=g?.id??null;rg.single=g?Fr(ST.map(k=>[k,sGa(g,k,g.energy_cost||10,h.current??h.maximum??0,st)])):null;put("rolling-plan",rg);}if(rc?.pending&&checkpointed&&lp?.length&&data.bars?.bars?.energy&&data.cooldowns?.cooldowns){const p=aPl(),t=Tm()/1000;rc={...rc,pending:false,replanned:t,methodNow:p.method,g24:summary(p,24,t).gain};put("recovery",rc)}await Promise.all([scanGym(),scanActions()]);await scanLastOD(true);busy=false;draw();}function save(){put("settings",cfg);try{lp=plans()}catch(e){lp=null;errs.push("Planner: "+St(e.message).slice(0,90))}draw()}const ui=Do.createElement("div");ui.id="hhj-compact-panel";ui.style.cssText="display:none;position:fixed!important;z-index:2147483646!important;inset:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;margin:0!important;background:#091622;color:#f4f8fb;font:14px/1.5 system-ui;overflow:hidden;box-sizing:border-box;border:0!important;box-shadow:none!important";const ct=Do.createElement("div");ct.style.cssText="height:calc(100% - 62px);overflow-y:auto;overflow-x:hidden;padding:12px 14px 30px;box-sizing:border-box;overscroll-behavior:contain;-webkit-overflow-scrolling:touch";const CQ=s=>ct.querySelector(s);const header=Do.createElement("div");header.style.cssText="height:62px;box-sizing:border-box;display:flex;justify-content:space-between;align-items:center;gap:8px;padding:9px 14px;background:#12283b;border-bottom:1px solid #355568";header.innerHTML="<b>⚡ HAPPY JUMP</b><span class='sub'>READ ONLY · v"+VER+"</span><button type='button' data-act='close' aria-label='Close Happy Jump Helper'>✕</button>";ui.append(header,ct);const button=Do.createElement("button");button.id="hhj-launch";button.textContent="HJ ◉";button.type="button";button.style.cssText="position:fixed!important;top:43%!important;right:6px!important;z-index:2147483645!important;background:#067f77!important;color:#fff!important;border:2px solid #adfff0!important;border-radius:25px!important;padding:12px 15px!important;font:800 15px system-ui!important;box-shadow:0 6px 18px #000b!important;display:block!important;visibility:visible!important;opacity:1!important";button.style.setProperty("display","none","important");const launcherStyle=button.style.cssText;function sLa(visible){const desired=launcherStyle.replace("display:block!important","display:none!important");button.style.cssText=desired;const mounted=Do.getElementById("hhj-launch");if(mounted&&mounted!==button)mounted.style.cssText=desired;const duplicates=Do.querySelectorAll?.('[id="hhj-launch"]')||[];for(const el of duplicates)if(el!==button&&el!==mounted){if(el.style?.setProperty)el.style.setProperty("display","none","important");else if(el.style)el.style.cssText+=";display:none!important";}if(!visible){const otherLaunchers=Do.querySelectorAll?.("button")||[];for(const el of otherLaunchers){if(el===button||ui.contains?.(el))continue;if(el.id==="hhj-launch"||/^HJ\s*[◉⦿]/i.test(St(el.textContent||"").trim())){if(el.style?.setProperty)el.style.setProperty("display","none","important");else if(el.style)el.style.cssText+=";display:none!important";}}}}const css=Do.createElement("style");css.textContent="~ button,~ select,~ input{background:#223a55;color:white;border:1px solid #52748d;border-radius:8px;padding:8px;font:inherit}~ button.on{background:#087e74;border-color:#4be6cf}~ button:disabled{opacity:.45}~ .tabs{display:flex;overflow-x:auto;gap:6px;padding:3px 0 9px;position:sticky;top:0;z-index:2;background:#0b1726;scrollbar-width:none;overscroll-behavior-x:contain}~ .tabs button{flex:0 0 auto;white-space:nowrap;min-height:39px;padding:8px 12px}~ .card{border:1px solid #426078;border-radius:12px}~ .row{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:6px 0;flex-wrap:wrap}~ .choices{justify-content:flex-start;gap:8px}~ .choices button{min-width:90px}~ .sub{opacity:.75;font-size:12px}~ h3{margin:6px 0 12px;font-size:16px}~ .good{color:#86f1d7}~ .warn{color:#ffd598}";css.textContent+=""+"~{box-sizing:border-box!important}"+"~ .card{margin:10px 0;padding:13px 14px;background:#142a3c;border-color:#304e65}"+"~ .hero{border-color:#1dd6cb;background:#133546}"+"~ .tabs{margin:0 -14px 14px;padding:10px 14px 12px;top:0;border-bottom:1px solid #24465b;scrollbar-width:none;isolation:isolate;transform:translateZ(0)}"+"~ .tabs button{min-height:42px}"+"~ .toolbar{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:8px}"+"~ .metric-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:9px;margin:10px 0}"+"~ .metric-grid>div{background:#0e2332;border:1px solid #304a5c;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:4px;min-width:0}"+"~ .metric-grid span{font-size:12px;color:#acc3d0}"+"~ .metric-grid strong{font-size:clamp(17px,4vw,25px);line-height:1.2;color:#8cf1df;overflow-wrap:anywhere}"+"~ .metric-grid small{color:#b8c8d4;font-size:11px}"+"~ .timeline-row{display:grid;grid-template-columns:95px 70px minmax(0,1fr);gap:7px;align-items:start;padding:10px 8px;border-bottom:1px solid #324a5a}"+"~ .timeline-row span{overflow-wrap:anywhere}"+"~ .timeline-row small{grid-column:3;font-size:11px;color:#8cf1df}"+"~ .day-header{position:sticky;top:62px;background:#0d2333;padding:12px;margin:14px -14px 0;z-index:1}"+"~ button{min-height:41px;touch-action:manipulation}"+"~ .choices{gap:6px}"+"~ .choices button{min-width:0}"+"~ .row>*{min-width:0;overflow-wrap:anywhere}"+"~ .alert{padding:10px;border-left:3px solid #59e7d7;background:#173444;border-radius:7px}"+"@media(max-width:380px){~ .timeline-row{grid-template-columns:83px 58px minmax(0,1fr)}~ .metric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}";css.textContent=css.textContent.replace(/~/g,"#hhj-compact-panel");css.textContent += "#hhj-compact-panel{background:#08192d!important;color:#e7f2ff!important}#hhj-compact-panel > div:first-child{background:linear-gradient(120deg,#0c3358,#0b203b)!important;border-color:#28506e!important}#hhj-compact-panel > div:first-child b{color:#77ddff!important;font-size:16px}#hhj-compact-panel .tabs{background:#0b223b!important;border-color:#294b69!important}#hhj-compact-panel .tabs button{background:#153655!important;border-color:#2c5575!important;border-radius:9px!important;color:#b2cee5!important}#hhj-compact-panel .tabs button.on{background:#1c5080!important;border-color:#68d8fc!important;color:#fff!important}#hhj-compact-panel .card{background:#0d2945!important;border-color:#284b6b!important;border-radius:12px!important;box-shadow:none!important}#hhj-compact-panel .card.hero{background:linear-gradient(130deg,#103c60,#0c2945)!important;border-color:#3e84a9!important}#hhj-compact-panel .metric-grid>div{background:#102844!important;border-color:#294661!important}#hhj-compact-panel .metric-grid strong{color:#75ddff!important}#hhj-compact-panel button{border-radius:9px!important;background:#1e4465;color:#edf7ff;border:1px solid #36678c}#hhj-compact-panel button.on,#hhj-compact-panel button[data-act=refresh]{background:#0879bd!important;border-color:#56bde9!important;color:#fff!important}#hhj-compact-panel input,#hhj-compact-panel select{background:#061b31;color:#fff;border-color:#325c79;border-radius:8px}#hhj-compact-panel .good{color:#49e2ad!important}#hhj-compact-panel .warn{color:#ffc687!important}#hhj-compact-panel .timeline-row{border-color:#2b506d!important}#hhj-compact-panel .day-header{background:#0c2945!important}#hhj-compact-panel .alert{background:#163752!important;border-color:#54d7fa!important}";let miniBusy=false,miniLast=0,miniFresh=0,miniStatsAtV210=0,miniGymAtV210=0;
let autoSignalV0260=get("auto-signal-v0260",null);
function autoSignalCardV0260(){
 const last=autoSignalV0260&&Number(autoSignalV0260.t)>0?autoSignalV0260:null;
 return card("Activity-aware autopilot",'<p><b>Automatic:</b> refresh bars and cooldowns; verify Xanax/refill log events; recalculate the training plan after observed changes; check gym logs after energy decreases.</p>'+
   '<p class="sub">'+(last?'Last detected change '+esc(last.kind)+' · '+cu(last.t):'No verified event transition detected this session')+'. Background API reads run only while Torn is visible.</p>'+
   '<p class="sub">Energy loss alone does not prove a gym session. Any detected change triggers a read-only check; only actual Torn logs count as completed training.</p>');
}function priorityAction(events,now){const due=(events||[]).filter(x=>x&&x.t>=now-180&&x.t<=now+1800&&!slp(x.t)&&!actDone(x)),ranks={JUMP:5,XANAX:4,REFILL:3,TRAIN:2};due.sort((a,b)=>{const activeA=a.t<=now?1:0,activeB=b.t<=now?1:0;if(activeA!==activeB)return activeB-activeA;const near=Ab(a.t-b.t)<=300;if(near&&ranks[a.kind]!==ranks[b.kind])return (ranks[b.kind]||0)-(ranks[a.kind]||0);return a.t-b.t});return due[0]||null}function publishHubAlerts(){try{const od=reportedOverdose(),t=Tm()/1000,freshAt=Mx(updated||0,miniFresh||0),planCurrent=!!freshAt&&Tm()-freshAt<=15*60000,p=planCurrent?aPl():null,e=!od&&p?priorityAction(p.events,t):null,mins=e?Mx(0,Ce((e.t-t)/60)):0;Do.dispatchEvent(new CustomEvent("staxx:notice",{detail:{id:"happy",count:od||e?1:0,dueAt:e?e.t*1000:null,level:od||e&&e.t<=t?"urgent":e?"warning":"info",summary:od?"Overdose recovery: training plan needs review":e?e.kind+(mins?" in "+mins+" minutes":" due now"):"No training actions due",items:od?["Recovery plan is active"]:e?[e.kind==="XANAX"?"Xanax":e.kind==="TRAIN"?"Train":e.kind==="REFILL"?"Points refill":"Happy jump"]:[],alerts:od?[{id:"od-recovery",title:"Overdose recovery: review training hold",detail:"Refresh and follow the recovery plan before using another training schedule"}]:e?[{id:"event-"+e.kind.toLowerCase(),title:e.kind+" · "+eta(e.t),detail:"Open the matching planned action, then confirm it in Torn"}]:[]}}));
    const steps=[];
    if(od)steps.push({id:"od-recovery",title:"Check overdose recovery before training",detail:"Old forecasts are suspended; verify your actual Torn bars and drug cooldown.",status:"urgent",priority:100});
    else if(!planCurrent)steps.push({id:"refresh-happy",title:"Refresh gym and cooldowns",detail:"Training forecasts are stale or unavailable. No in-game action is inferred.",status:"now",priority:90});
    else{
      if(e)steps.push({id:"event-"+e.kind.toLowerCase(),title:(e.t<=t?"Due: ":"Next: ")+e.kind,
        detail:e.detail+" · "+eta(e.t),status:e.t<=t?"urgent":e.t<=t+30*60?"soon":"review",priority:e.t<=t?95:75,dueAt:e.t*1000});
      const current=loadInput(),tr=current?Fl(current.energy/current.cost):0;
      if(tr>0)steps.push({id:"train-ready",title:fmt(tr)+" gym trains possible with current energy",
        detail:fmt(tr*current.cost)+" E available to train · choose your stat and verify current happiness.",
        status:"review",priority:55});
      if(!e){const n=nextDecision();if(n.kind==="book")steps.push({id:"owned-book",title:n.title,detail:n.detail,status:"review",priority:65});}
    }
    Do.dispatchEvent(new CustomEvent("staxx:actions",{detail:{id:"happy",items:steps,updated:freshAt||Tm()}}));
    const r=p?summary(p,24,t):null;
    Do.dispatchEvent(new CustomEvent("staxx:summary",{detail:{id:"happy",headline:od?"Overdose recovery":"Training forecast · "+(cfg.stat||"Gym"),
      metrics:[{label:"Next action",value:e?e.kind+" · "+eta(e.t):"None due"},
        {label:"24h projected gains",value:r?fmt(r.gain):"Unavailable"},
        {label:"24h planned trains",value:r?String(r.trains):"Unavailable"}],
      updated:freshAt||Tm()}}));}catch(_){}}
function badge(){publishHubAlerts();if(opened){button.textContent="HJ";return}if(reportedOverdose()){button.textContent="HJ ⚠";button.title="Overdose recovery hold — open helper";return}const now=Tm()/1000;if(!Mx(updated||0,miniFresh||0)||Tm()-Mx(updated,miniFresh)>15*60000){button.textContent="HJ";button.title="Open to refresh training data";return}const p=aPl(),e=priorityAction(p?.events,now);if(!e){button.textContent="HJ";button.title="No training action due in the next 30 minutes";return}const icon=e.kind==="XANAX"?"💊":e.kind==="TRAIN"?"🏋️":e.kind==="REFILL"?"⚡":e.kind==="JUMP"?"✨":"⏰",mins=Mx(0,Ce((e.t-now)/60));button.textContent="HJ "+icon+(mins?" "+mins+"m":" !");button.title=e.kind+" "+(mins?"in "+mins+" minutes":"due now")+" · read-only forecast";}async function miniRefresh(){
 if(opened||busy||miniBusy||Do.hidden)return;
 miniBusy=true;const now=Tm()/1000;
 const previousEnergy=Number(data.bars?.bars?.energy?.current);
 const hadPreviousEnergy=Number.isFinite(previousEnergy)&&!!data.bars?.bars?.energy;
 const previousRefill=refill();
 const previousActions=new Set(acts.map(x=>St(x.id)));
 const previousOD=reportedOverdose()?.t||0;
 try{
  const needsStatsV210=!data.gym?.gym||!data.stats||now-miniStatsAtV210>=12*60;
  const names=!data.gym?.gym||!data.stats?["bars","cooldowns","stats","gym","gyms","refills"]:needsStatsV210?["bars","cooldowns","refills","stats"]:["bars","cooldowns","refills"];
  // Torn points are refreshed separately, so a permission error never blocks vital bar updates.
  const checkPoints=needsStatsV210||!data.moneyAt||Tm()-data.moneyAt>20*60000;
  const paths={bars:"/user/bars",cooldowns:"/user/cooldowns",stats:"/user/battlestats",gym:"/user/gym",gyms:"/torn/gyms",refills:"/user/refills"},pending={};
  const shape={bars:v=>!!v.bars?.energy&&!!v.bars?.happy,cooldowns:v=>!!v.cooldowns,stats:v=>!!v.battlestats,gym:v=>!!v.gym,gyms:v=>Ar(v.gyms),refills:v=>!!v.refills};
  for(const k of names){const v=await api(paths[k]+"?timestamp="+Fl(now));if(!shape[k](v))throw Error("Partial data: "+k);pending[k]=v;}
  Object.assign(data,pending);
  if(checkPoints){
    try{
      const cash=await api("/user/money");
      if(Number.isSafeInteger(cash.money?.points)&&cash.money.points>=0){data.money=cash;data.moneyAt=Tm();}
    }catch(_){ /* Retain the manual fallback on missing permissions. */ }
  }
  if(data.gym?.gym&&data.stats?.battlestats&&data.bars?.bars?.energy&&data.cooldowns?.cooldowns){
   if(pending.stats){
    miniStatsAtV210=now;
    const actual=stats();
    const changed=recordStatSnapshot(actual); // Capture off-schedule gains without opening the helper.
    const verified=changed&&checkpoint(actual); // Avoid zero-change verification entries every 12 minutes.
    lp=plans(); // Recalculate from the observed stats before recording the next forecast.
    if(verified&&rg){const p=aPl();rg.events=(p?.events||[]).filter(x=>x.kind==="TRAIN").map(x=>({t:x.t,g:x.g}));rg.method=p?.method||"none";put("rolling-plan",rg);}
   }else lp=plans();
   miniFresh=Tm();
   await scanActions();await scanLastOD();
   const currentEnergy=Number(data.bars?.bars?.energy?.current);
   const energyDrop=hadPreviousEnergy&&Number.isFinite(currentEnergy)&&currentEnergy<previousEnergy;
   const usedRefill=previousRefill==="ready"&&refill()==="used";
   const newActivity=acts.some(x=>!previousActions.has(St(x.id)));
   const newOD=(reportedOverdose()?.t||0)>previousOD;
   // Do not assume that an energy decrease means training: it only justifies checking the real log.
   // Explicit log changes, OD, and refill transitions cause an immediate fresh forecast.
   if(energyDrop||usedRefill||newActivity||newOD){
    lp=plans();
    const kind=newOD?"Overdose":newActivity?"Verified activity":usedRefill?"Points refill":"Energy decrease · checking gym log";
    autoSignalV0260={t:now,kind};put("auto-signal-v0260",autoSignalV0260);
   }
   if((energyDrop&&now-miniGymAtV210>=2*60)||now-miniGymAtV210>=15*60){
    miniGymAtV210=now;
    await scanGym(); // Verified gym logs, including training outside a planned schedule.
   }
   badge();
  }
 }catch(_){miniFresh=0;badge()}
 finally{miniBusy=false;miniLast=now;autoFullRefreshV230()}
}
function mount(){if(!Do.body)return;for(const el of [button,ui]){const previous=Do.getElementById(el.id);if(previous&&previous!==el&&typeof previous.replaceWith==="function")previous.replaceWith(el);else if(!previous)Do.body.appendChild(el);}const priorStyle=Do.getElementById("hhj-mini-css");if(!priorStyle){css.id="hhj-mini-css";(Do.head||Do.body).appendChild(css)}else if(priorStyle!==css&&priorStyle.textContent!==css.textContent)priorStyle.textContent=css.textContent;if(opened)sLa(false);else badge();}function controls(title,active,choices,act){return '<div class="row"><b>'+esc(title)+'</b></div><div class="row choices">'+choices.map(([k,v])=>'<button data-act="'+act+'" data-val="'+esc(k)+'"'+(k===active?' class="on"':'')+'>'+esc(v)+'</button>').join("")+"</div>"}function card(t,b,cls=""){return '<section class="card '+cls+'"><h3>'+esc(t)+'</h3>'+b+"</section>"}function rGr(){if(!/\/gym\.php$/.test(location.pathname||""))return null;const visible=St((Do.querySelector?.("#gymroot")||Do.body)?.innerText||"");const re=/\bYou gained\s+([\d,.]+)\s+(strength|defense|speed|dexterity)\b/gi;let match,last;while((match=re.exec(visible)))last=match;if(!last)return null;const amount=Nu(last[1].replace(/,/g,""));if(!(amount>0))return null;const before=visible.slice(Mx(0,last.index-170),last.index).trimEnd();const explicit=before.match(/You completed\s+(\d+)\b[^\n]{0,140}$/i);const trains=explicit?Nu(explicit[1]):null;return {stat:last[2].toLowerCase(),amount,trains:trains>0&&trains<=150?trains:null};}function aCo(observed){if(!observed)return "";const g=gym(),st=stats(),h=happy(),k=observed.stat;if(!g||!(st[k]>0)||!(gymDots(g.modifiers?.[k])>0))return "";const per=gain(g.energy_cost||10,h.current??h.maximum??0,st[k],gymDots(g.modifiers[k]),g.energy_cost||10,bonus(k));const ratio=observed.amount/per,guess=Ro(ratio);const inferred=!observed.trains&&guess>=2&&guess<=150&&Ab(ratio/guess-1)<=.12?guess:null;const n=observed.trains||inferred||1,comparable=!!(inferred||observed.trains&&Ab(ratio/observed.trains-1)<=.2||ratio<=1.8);const expected=per*n,diff=comparable?100*(observed.amount/expected-1):null;const dec=x=>Nu(x).toLocaleString("en-GB",{maximumFractionDigits:2});const desc=observed.trains?"Explicit result: "+observed.trains+" trains":
inferred?"About "+inferred+" normal trains' worth (inferred, not vr)":
"Session size/boosts unknown — not safely comparable as one train";return card("Latest visible gym session",'<p><b>'+esc(desc)+'</b></p>'+'<div class="metric-grid"><div><span>Torn awarded</span><strong>+'+dec(observed.amount)+'</strong><small>'+esc(k)+'</small></div>'+'<div><span>Model '+(n>1?"equivalent total":"per train")+'</span><strong>+'+dec(expected)+'</strong><small>'+n+' × '+(g.energy_cost||10)+' E assumed</small></div>'+'<div><span>Difference</span><strong>'+(diff===null?"Not comparable":(diff>=0?"+":"")+diff.toFixed(1)+"%")+'</strong><small>At current stats and happiness</small></div></div>'+'<p class="sub">Boosted sessions can mimic multiple trains.</p>');}function sMa(){ const base=loadInput();if(!base)return []; const values=stats(),g=base.gym; return ST.map(stat=>{  if(!(values[stat]>0)||!(gymDots(g.modifiers?.[stat])>0))return null;  const p={...base,stat,value:values[stat],dots:gymDots(g.modifiers[stat]),m:bonus(stat)};  const options=["natural","xanax"].map(method=>simulate(method,p));  const best=options.filter(x=>x.affordable).sort((x,y)=>y.gain-x.gain)[0]||options[0];  return {stat,perTrain:tEs(p),daily:summary(best,24),weekly:summary(best,168),method:best.method}; }).filter(Boolean);}
/* v0.12.9: compare four seven-day regular-training what-ifs without changing Torn state. */
let optimizerMemo=null;

/* Simulate multiple wake/wait choices when Happy is wiped out; always allow training now as one option. */
function recoveryFloors(p){
 if(!p||p.happy>=p.maxH*.25)return [0];
 return [...new Set([0,Ce(p.maxH*.05),Ce(p.maxH*.1),Ce(p.maxH*.25),Ce(p.maxH*.5)].filter(n=>n>=0&&n<=p.maxH))];
}
function simulateRecovery(method,p,hours=168,options=null){
 const scenarios=recoveryFloors(p).map(minHappy=>({...simulate(method,p,hours,{...options,minHappy}),minHappy}));
 return scenarios.sort((a,b)=>b.gain-a.gain||a.cost-b.cost||a.minHappy-b.minHappy)[0];
}
function happyRecoveryMath(p,ratio=.25){
 if(!p||!Fi(p.maxH)||p.maxH<=0||!Fi(p.happy))return null;
 const target=Ce(p.maxH*ratio),missing=Mx(0,target-p.happy);
 return {target,missing,minutes:Ce(missing/5)*15,ratio};
}
function happyRecoveryCard(){
 const p=loadInput(),last=lastOD();
 if(!p)return card("Happiness recovery","Refresh bars and gym data to calculate the post-overdose options.");
 if(p.happy>=p.maxH*.25&&(!last||Tm()/1000-last.t>86400))return "";
 const threshold=happyRecoveryMath(p,.25),natural=simulateRecovery("natural",p,168,{refills:cfg.refills,budget:cfg.budget}),immediate=simulate("natural",p,168,{refills:cfg.refills,budget:cfg.budget,minHappy:0});
 const chosen=natural.minHappy>0?"Modelled option: defer some gym sessions until Happy improves.":"Modelled option: spend energy as it returns; waiting produces no seven-day gain improvement in this simulation.";
 const lastLabel=last?'Last recorded OD: '+cu(last.t)+' ('+esc(last.source==="api"?"Torn log":last.source||"manual")+'). ':'';
 let html='<p><b>Live Happy: '+fmt(p.happy)+' / '+fmt(p.maxH)+'</b>. '+lastLabel+'Training at this level is explicitly modelled without substituting your base maximum.</p>';
 html+='<p>At 5 Happy per 15 minutes, reaching 25% ('+fmt(threshold.target)+') takes approximately '+fmt(threshold.minutes)+' minutes without boosters or further losses.</p>';
 html+='<p><b>'+esc(chosen)+'</b></p><p class="sub">7-day natural training: immediate +'+fmt(immediate.gain)+' stats; best tested wait strategy +'+fmt(natural.gain)+' stats. '+(natural.minHappy>0?'Wait threshold: '+fmt(natural.minHappy)+' Happy.':'Train-now threshold selected.')+' Both scenarios include energy cap overflow and continued natural Happy regeneration; real gains may differ.</p>';
 const count=Ce(threshold.missing/25),buy=count>0&&count<=48?basket("lollipop",count,owned("lollipop")):null;
 if(buy!==null&&Fi(buy))html+='<p class="sub">Optional lollipop example: '+count+' pieces to add approximately '+fmt(count*25)+' Happy, with about '+cash(buy)+' new spending. Booster cooldown, inventory and any reset must be checked manually; this is not in the training forecast.</p>';
 if(reportedOverdose())html+='<p class="warn">Your overdose recovery hold is active. Forecasts above are only comparisons, not due-now actions. Check Torn hospital status and cooldown before resuming.</p>';
 return card("After overdose: Happy-aware training",html);
}

function optimizerResults(){
 const p=loadInput();if(!p)return {scenarios:[],max:null,value:null};
 const key=JSON.stringify([Fl(p.now/60),updated,cfg.stat,cfg.budget,cfg.sleepEnabled,cfg.sleepStart,cfg.sleepEnd,awakeUntil,p.value,p.energy,p.maxE,p.regen,p.inc,p.happy,p.maxH,p.drug,p.booster,p.refill,p.dots,p.cost,p.m,prices,inv,cfg.manualPrices,cfg.ownedPoints,cfg.jumpSuccessPct,cfg.xanaxOdPct,cfg.ecstasyOdPct,cfg.odEstimateMode,cfg.odFactionReduction,cfg.odNightclub,al.length]);
 if(optimizerMemo?.key===key)return optimizerMemo.result;
 const variants=[
  {method:"natural",refills:false,label:"Natural · no points refill"},
  {method:"natural",refills:true,label:"Natural · with points refill"},
  {method:"xanax",refills:false,label:"Xanax · no points refill"},
  {method:"xanax",refills:true,label:"Xanax · with points refill"}
 ];
 const scenarios=variants.map(v=>{
  const forecast=simulateRecovery(v.method,p,168,{refills:v.refills,budget:cfg.budget});
  const refillsUsed=forecast.events.filter(x=>x.kind==="REFILL").length;
  const reason=forecast.affordable===false?"Exceeds budget or price unavailable":v.refills&&!refillsUsed?"No affordable refill was scheduled":v.method==="xanax"&&!forecast.drugs?"No affordable Xanax was scheduled":null;
  const feasible=!reason&&Fi(forecast.cost)&&forecast.gain>0;
  return {...v,...forecast,refillsUsed,feasible,reason,pricePerThousand:forecast.gain>0&&Fi(forecast.cost)?1000*forecast.cost/forecast.gain:null};
 });
 const ranked=scenarios.filter(x=>x.feasible).sort((a,b)=>b.gain-a.gain||a.cost-b.cost);
 const max=ranked[0]||null;
 const value=max?[...ranked].filter(x=>x.gain>=max.gain*.95).sort((a,b)=>a.cost-b.cost||b.gain-a.gain)[0]:null;
 const frontier=scenarios.filter(x=>x.feasible&&!scenarios.some(y=>y.feasible&&y!==x&&y.gain>=x.gain&&y.cost<=x.cost&&(y.gain>x.gain||y.cost<x.cost)));
 const result={scenarios,max,value,frontier,input:p};
 optimizerMemo={key,result};
 return result;
}
function optimizerCard(){
 const r=optimizerResults();if(!r.max)return card("Seven-day training optimiser","<p>No budget-feasible regular-training scenario can be verified. Refresh market prices or adjust the budget in Settings.</p>");
 const best=r.max,economy=r.value,deltaGain=best.gain-economy.gain,deltaSpend=best.cost-economy.cost;
 let body='<p><b>Maximum stat gains:</b> '+esc(best.label)+' · +'+fmt(best.gain)+' '+esc(cfg.stat)+' for '+cash(best.cost)+'</p>';
 body+='<p><b>Lower-cost option (within 95% of maximum gains):</b> '+esc(economy.label)+' · +'+fmt(economy.gain)+' for '+cash(economy.cost)+'</p>';
 if(best!==economy&&deltaGain>0)body+='<p><b>Upgrade trade-off:</b> Spend '+cash(deltaSpend)+' more for approximately +'+fmt(deltaGain)+' extra '+esc(cfg.stat)+' ('+cash(1000*deltaSpend/deltaGain)+' per extra 1,000 stat).</p>';
 body+='<p class="sub">Same starting stats and seven-day time window. All results are forecasts and assume completing the proposed actions. A 95% gain threshold is used only to find a cost-saving alternative; it is not an official Torn mechanic.</p>';
 body+=r.scenarios.map(x=>'<div class="stat-row"><div class="row"><b>'+esc(x.label)+'</b><span>'+(x.feasible?'+'+fmt(x.gain)+' · '+cash(x.cost):'Not feasible')+'</span></div>'+
 (x.feasible?'<small>'+fmt(x.energy)+' E trained · '+x.drugs+' Xanax · '+x.refillsUsed+' refills · '+cash(x.pricePerThousand)+' per 1,000 gain'+(r.frontier.includes(x)?' · Efficient trade-off':'')+'</small>'+
 '<div class="row"><button data-act="optimizer-choose" data-val="'+x.method+':'+(x.refills?'1':'0')+'">Use this schedule</button></div>':'<p class="sub">'+esc(x.reason||"Not enough live data")+'</p>')+'</div>').join("");
 body+='<p class="sub">Owned consumables count as zero additional purchase cost; opportunity cost of inventory is not priced. Xanax overdose risk, rehab and unexpected gym changes are not forecast. No purchases or gameplay actions are automated.</p>';
 return card("Seven-day training optimiser",body,"hero");
}


/* v0.12.9: equal-time jump versus regular training; estimates, never gameplay commands. */
let jumpValueMemo=null;
/* v0.12.9: deterministic scenario stress tests, NOT statistical confidence intervals. */
function jumpStress(jumpGain,regularGain,jumpCost,regularCost,regularPerThousand){
 const down=jumpGain*.9-regularGain*1.1,up=jumpGain*1.1-regularGain*.9;
 const stressedExtraCash=jumpCost*1.2-regularCost,stressedPercent=regularGain>0?100*down/(regularGain*1.1):null;
 const worstCostPerThousand=down>0&&stressedExtraCash>0?1000*stressedExtraCash/down:null;
 const gainHolds=Fi(down)&&down>0&&stressedPercent>=5;
 const valueHolds=stressedExtraCash<=0||(worstCostPerThousand!==null&&regularPerThousand!==null&&worstCostPerThousand<=regularPerThousand);
 return {downsideGain:down,upsideGain:up,stressedExtraCash,stressedPercent,worstCostPerThousand,gainHolds,valueHolds,robust:gainHolds&&valueHolds};
}


/* Optional completion likelihood: user-entered hypothetical, never Torn-calibrated. */
function jumpSuccessAssumption(){
 const raw=cfg.jumpSuccessPct;
 if(raw===null||raw===undefined||St(raw).trim()==="")return null;
 const n=+raw;return Fi(n)&&n>=0&&n<=100?n:null;
}
function replacementCost(count){
 let total=0;
 for(const [name,quantity] of En(count||{})){
  if(!(quantity>0))continue;
  const itemCost=basket(name,quantity,0);
  if(!Fi(itemCost))return null;
  total+=itemCost;
 }
 return Fi(total)?total:null;
}

/* Player-supplied per-dose OD what-ifs. Stop at first OD; no post-recovery training forecast. */
/* The game's exact Xanax/Ecstasy base odds are not published; these are community estimates. */
function odSource(name){
 const raw=name==="xanax"?cfg.xanaxOdPct:cfg.ecstasyOdPct;
 if(raw!==null&&raw!==undefined&&St(raw).trim()!==""&&Fi(+raw)&&+raw>=0&&+raw<=100)return "Manual effective OD rate";
 return cfg.odEstimateMode==="community"?"Community estimate (not Torn official)":"Unavailable";
}

function verifiedODModifiers(){
 const upgrades=data.odFactionUpgrades?.upgrades;
 let faction=null;
 for(const branch of [...(Ar(upgrades?.peace)?upgrades.peace:[]),...(Ar(upgrades?.war)?upgrades.war:[])]){
  if(!/toleration/i.test(St(branch?.name||"")))continue;
  for(const row of (Ar(branch?.upgrades)?branch.upgrades:[])){
   if(/overdosing/i.test(St(row?.name||"")+" "+St(row?.ability||""))&&Fi(+row?.level))
    faction=Mn(30,Mx(0,+row.level*3));
  }
 }
 const job=data.odJob?.job,type=St(job?.type?.name||job?.type||""),stars=+job?.rating;
 const nightclub=job&&Fi(stars)?/nightclub/i.test(type)&&stars>=7:null;
 return {faction,nightclub};
}
function odRateSource(drug){
 const override=drug==="xanax"?cfg.xanaxOdPct:cfg.ecstasyOdPct;
 if(override!==null&&override!==undefined&&St(override).trim()!==""&&Fi(+override)&&+override>=0&&+override<=100)
  return {pct:+override,label:"Manual what-if assumption",verified:false};
 if(cfg.odEstimateMode!=="community")return {pct:null,label:"Estimate disabled",verified:false};
 if(drug!=="xanax")return {pct:null,label:"No verified Ecstasy OD baseline published by Torn; enter an optional scenario rate",verified:false};
 const modifiers=verifiedODModifiers(),faction=modifiers.faction,nightclub=modifiers.nightclub;
 const pct=100/33*(faction===null?1:1-faction/100)*(nightclub===null?1:nightclub?.5:1);
 return {pct,label:"Community Xanax baseline 1/33; "+(faction===null?"faction reduction unknown":"faction reduction "+faction+"%")+"; "+(nightclub===null?"Nightclub status unknown":nightclub?"7-star Nightclub reduction 50%":"no 7-star Nightclub reduction"),verified:false};
}
function drugOdOdds(name){return name==="xanax"||name==="ecstasy"?odRateSource(name).pct:null;}

function overdoseStageCost(plan,drug,ordinal){
 if(!plan||!["xanax","ecstasy"].includes(drug))return null;
 const count={xanax:drug==="xanax"?ordinal:plan.method==="happy"||plan.method==="happy-candy"?4:0};
 if(drug==="ecstasy"){count.ecstasy=1;if(plan.method==="happy")count.dvd=4;else if(plan.method==="happy-candy")count.lollipop=48}
 return replacementCost(count);
}
function overdoseStageCard(od){
 if(!od?.available||!od.branches.length)return "";
 let html='<details><summary>Show risk at each dose ('+od.branches.length+' stages)</summary><p class="sub">This is the chance that the FIRST overdose happens at each stage, not an independent overall jump rate. Rates are community statistical estimates or your manual inputs, never official personal odds.</p>';
 for(const b of od.branches){
  html+='<div class="timeline-row"><b>'+esc(b.drug==="xanax"?"Xanax dose "+b.ordinal:"Ecstasy dose")+'</b>'+
   '<span>First OD here: '+(100*b.probability).toFixed(2)+'%</span>'+
   '<span>Cash bought by this point: '+cash(b.spendThrough)+'</span>'+
   '<span>Consumed item replacement value: '+(b.replacementCost===null?'Price unknown':cash(b.replacementCost))+'</span>'+
   '<small>Training completed before OD: +'+fmt(b.gainBefore)+' · Energy emptied: '+(b.energyLost===null?'Unknown':fmt(b.energyLost)+' E')+' · Happiness emptied: '+(b.happyLost===null?'Unknown':fmt(b.happyLost))+'</small></div>';
 }
 return html+'<p class="sub">An OD ends the attempted stack in this forecast. Xanax OD also empties Nerve and has a typical 5,000-minute hospital effect. Ecstasy OD does not inherit the Xanax hospital effect. An OD consumes the dose that triggered it.</p></details>';
}
function overdoseForecast(plan){
 if(!plan||!Ar(plan.events))return {available:false,reason:"No forecast"};
 const doses=plan.events.map((event,index)=>({event,index,drug:event.kind==="XANAX"?"xanax":event.kind==="JUMP"&&plan.method.startsWith("happy")?"ecstasy":null})).filter(x=>x.drug);
 if(doses.some(x=>drugOdOdds(x.drug)===null))return {available:false,reason:"Missing an assumed OD chance for at least one drug in this plan.",attempts:doses.length};
 let survival=1,expectedGain=0,expectedSpend=0,energyLost=0,happyLost=0,xanaxOD=0,ecstasyOD=0,hospitalMinutes=0,expectedFailurePurchase=0,expectedFailureReplacement=0,replacementKnown=true;
 const branches=[];
 for(const dose of doses){
  const risk=drugOdOdds(dose.drug)/100,probability=survival*risk;
  const gainBefore=plan.events.slice(0,dose.index).reduce((n,x)=>n+(x.g||0),0);
  const spendThrough=plan.events.slice(0,dose.index+1).reduce((n,x)=>n+(x.spent||0),0);
  const e=Fi(dose.event.odEnergy)?Math.max(0,dose.event.odEnergy):null;
  const h=Fi(dose.event.odHappy)?Math.max(0,dose.event.odHappy):null;
  expectedGain+=probability*gainBefore;expectedSpend+=probability*spendThrough;expectedFailurePurchase+=probability*spendThrough;
  const stageOrdinal=branches.filter(x=>x.drug===dose.drug).length+1,stageReplacement=overdoseStageCost(plan,dose.drug,stageOrdinal);
  if(stageReplacement===null&&probability>0)replacementKnown=false;else if(stageReplacement!==null)expectedFailureReplacement+=probability*stageReplacement;
  if(e!==null)energyLost+=probability*e;if(h!==null)happyLost+=probability*h;
  if(dose.drug==="xanax"){xanaxOD+=probability;hospitalMinutes+=probability*5000;}else ecstasyOD+=probability;
  branches.push({drug:dose.drug,ordinal:stageOrdinal,probability,at:dose.event.t,gainBefore,spendThrough,replacementCost:stageReplacement,energyLost:e,happyLost:h,hospitalMinutes:dose.drug==="xanax"?5000:0});
  survival*=1-risk;
 }
 expectedGain+=survival*plan.gain;expectedSpend+=survival*plan.cost;
 return {available:true,attempts:doses.length,successPct:100*survival,anyOdPct:100*(1-survival),xanaxOdPct:100*xanaxOD,ecstasyOdPct:100*ecstasyOD,expectedGain,expectedSpend,expectedFailurePurchase,expectedFailureReplacement:replacementKnown?expectedFailureReplacement:null,expectedEnergyLost:energyLost,expectedHappyLost:happyLost,expectedHospitalMin:hospitalMinutes,branches};
}

function jumpRiskAssessment(jump,regular,jumpEvent){
 const successPct=jumpSuccessAssumption();
 const failedGain=jump.events.filter(x=>x.kind==="TRAIN"&&x.t<jumpEvent.t).reduce((sum,x)=>sum+(x.g||0),0);
 const denom=jump.gain-failedGain;
 const parityPct=denom>0?100*(regular.gain-failedGain)/denom:null;
 const targetPct=denom>0?100*(regular.gain*1.05-failedGain)/denom:null;
 const expectedGain=successPct!==null?failedGain+denom*successPct/100:null;
 const expectedExtra=expectedGain!==null?expectedGain-regular.gain:null;
 const expectedExtraPct=expectedExtra!==null&&regular.gain>0?100*expectedExtra/regular.gain:null;
 const jumpReplacement=replacementCost(jump.count),regularReplacement=replacementCost(regular.count);
 const replacementExtra=jumpReplacement!==null&&regularReplacement!==null?jumpReplacement-regularReplacement:null;
 const jumpEnergy=jump.events.filter(x=>x.kind==="TRAIN").reduce((sum,x)=>sum+(x.q||0),0);
 const regularEnergy=regular.events.filter(x=>x.kind==="TRAIN").reduce((sum,x)=>sum+(x.q||0),0);
 return {successPct,failedGain,parityPct,targetPct,expectedGain,expectedExtra,expectedExtraPct,jumpReplacement,regularReplacement,replacementExtra,
 ownedJumpReplacement:jumpReplacement===null?null:Math.max(0,jumpReplacement-jump.cost),
 ownedRegularReplacement:regularReplacement===null?null:Math.max(0,regularReplacement-regular.cost),jumpEnergy,regularEnergy,energyGap:regularEnergy-jumpEnergy};
}
function jumpBreakEven(){
 const p=loadInput(),now=Tm();
 if(!p)return {rows:[],best:null,reason:"A current gym and battle-stat reading are required."};
 if(!updated||now-updated>15*60000)return {rows:[],best:null,reason:"A full refresh is needed before comparing jumps with regular training."};
 const key=JSON.stringify([Fl(p.now/60),updated,cfg.stat,cfg.budget,cfg.refills,cfg.sleepEnabled,cfg.sleepStart,cfg.sleepEnd,awakeUntil,p.value,p.energy,p.maxE,p.regen,p.inc,p.happy,p.maxH,p.drug,p.booster,p.refill,p.dots,p.cost,p.m,prices,inv,cfg.manualPrices,cfg.ownedPoints,cfg.jumpSuccessPct,cfg.xanaxOdPct,cfg.ecstasyOdPct,cfg.odEstimateMode,cfg.odFactionReduction,cfg.odNightclub,al.length]);
 if(jumpValueMemo?.key===key)return jumpValueMemo.result;
 const threshold=0.05,rows=[];
 for(const method of ["happy-candy","happy"]){
  const label=method==="happy-candy"?"Candy Happy Jump":"eDVD Happy Jump",kit=jumpKit(method);
  if(!kit.available){rows.push({method,label,verdict:"unavailable",reason:Fi(kit.total)?"Required kit exceeds your budget.":"Required item prices or inventory could not be confirmed.",cost:kit.total});continue}
  const jump=simulate(method,p,168);
  const event=jump.events.find(x=>x.kind==="JUMP");
  const lastTrain=event&&jump.events.find(x=>x.kind==="TRAIN"&&x.t>=event.t);
  if(!jump.affordable||!event||!lastTrain||!(lastTrain.q>0)){rows.push({method,label,verdict:"unavailable",reason:"No complete jump and gym training could be scheduled within seven days."});continue}
  const hours=(lastTrain.t-jump.start+60)/3600;
  const variants=[["natural",false],["natural",true],["xanax",false],["xanax",true]];
  const options=variants.map(([kind,refills])=>{
   const model=simulateRecovery(kind,p,hours,{budget:cfg.budget,refills});
   const hasMethod=kind!=="xanax"||model.drugs>0;
   return {...model,kind,refills,usable:model.affordable&&hasMethod&&Fi(model.cost)&&model.gain>=0};
  }).filter(x=>x.usable);
  if(!options.length){rows.push({method,label,verdict:"unknown",reason:"No valid regular-training baseline could be calculated."});continue}
  const doseReady=drugOdOdds("xanax")!==null&&drugOdOdds("ecstasy")!==null;
  const best=[...options].sort((a,b)=>doseReady?(overdoseForecast(b).expectedGain-overdoseForecast(a).expectedGain||a.cost-b.cost):(b.gain-a.gain||a.cost-b.cost))[0];
  const economical=[...options].sort((a,b)=>a.cost-b.cost||b.gain-a.gain)[0];
  const regularIncremental=best.gain-economical.gain,regularExtraCash=best.cost-economical.cost;
  const regularPerThousand=regularIncremental>0&&regularExtraCash>0?1000*regularExtraCash/regularIncremental:null;
  const extra=jump.gain-best.gain,extraCash=jump.cost-best.cost;
  const extraPct=best.gain>0?100*extra/best.gain:null;
  const perThousand=extra>0&&extraCash>0?1000*extraCash/extra:null;
  let verdict,reason;
  if(!(Fi(extra)&&Fi(extraPct))) {verdict="unknown";reason="An incremental gain estimate is not available."}
  else if(extra<=0){verdict="skip";reason="Regular training predicts at least as many gains by the same time, without stacking for the jump."}
  else if(extraPct<100*threshold){verdict="skip";reason="The estimated improvement is under 5%; it is too small to justify a confident jump recommendation with overdose and model uncertainty."}
  else if(extraCash<=0){verdict="consider";reason="The jump adds a material estimated gain without extra new cash compared with the strongest regular alternative. Drug overdose and item opportunity costs still matter."}
  else if(regularPerThousand===null){verdict="tradeoff";reason="The jump has a projected gain advantage, but no defensible regular-training marginal cash benchmark is available. Review whether the extra spend is worthwhile."}
  else if(perThousand<=regularPerThousand){verdict="consider";reason="The extra gain per dollar compares favourably with upgrading from the lowest-cost to the strongest regular-training option. Still an estimate, not a guarantee."}
  else {verdict="tradeoff";reason="The jump adds predicted gains, but its extra cash per stat is worse than the available regular-training upgrade."}
  const stress=jumpStress(jump.gain,best.gain,jump.cost,best.cost,regularPerThousand);
  const odJump=overdoseForecast(jump),odRegular=overdoseForecast(best),odReady=odJump.available&&odRegular.available;
  const risk=jumpRiskAssessment(jump,best,event);
  if(odReady){
   risk.successPct=odJump.successPct;
   risk.expectedGain=odJump.expectedGain;
   risk.expectedExtra=odJump.expectedGain-odRegular.expectedGain;
   risk.expectedExtraPct=odRegular.expectedGain>0?100*risk.expectedExtra/odRegular.expectedGain:null;
   risk.targetPct=null;
  }
  const baseVerdict=verdict;
  if(verdict==="consider"&&!stress.robust){
   verdict="tradeoff";
   reason="The baseline forecast favours the jump, but a hypothetical 10% lower jump gain, 10% higher regular gain and 20% higher jump purchase prices remove a clear advantage. Review the margin before stacking.";
  }
  if(risk.successPct===null&&verdict==="consider"){
   verdict="tradeoff";reason="An unverified full-jump completion rate makes a positive jump recommendation premature. Enter an optional hypothetical likelihood under Settings.";
  }else if(risk.successPct!==null&&risk.expectedExtraPct!==null&&risk.expectedExtraPct<5){
   verdict="skip";reason="Under your assumed jump completion likelihood, risk-weighted gains do not beat regular training by the cautious 5% threshold.";
  }
  if(verdict==="consider"&&risk.replacementExtra===null){
   verdict="tradeoff";reason="Unpriced consumables make inventory replacement value unknown. Zero additional cash is not zero economic cost.";
  }else if(verdict==="consider"&&risk.replacementExtra>0&&risk.expectedExtra>0&&regularPerThousand!==null&&1000*risk.replacementExtra/risk.expectedExtra>regularPerThousand){
   verdict="tradeoff";reason="With consumed items valued at replacement buying prices, the risk-weighted jump costs more per extra 1,000 stats than the regular-training upgrade.";
  }
  if(odReady&&risk.expectedExtraPct!==null&&risk.expectedExtraPct<5){
   verdict="skip";reason="Across the first-Xanax-OD, later-Xanax-OD and Ecstasy-OD cases, the risk-weighted jump gains less than 5% over the same-period overdose-aware regular alternative.";
  }
  if(odReady&&verdict==="consider"&&risk.expectedExtra>0&&odJump.expectedSpend>odRegular.expectedSpend&&regularPerThousand!==null&&1000*(odJump.expectedSpend-odRegular.expectedSpend)/risk.expectedExtra>regularPerThousand){
   verdict="tradeoff";reason="With drug-specific overdose losses, the extra spending per 1,000 expected stats is worse than the regular-training upgrade.";
  }
  const jumpOverflow=summary(jump,hours).lost,regularOverflow=summary(best,hours).lost;
  rows.push({method,label,verdict,baseVerdict,reason,...stress,...risk,odJump,odRegular,odReady,completion:event.t,hours,energy:lastTrain.q,jumpGain:jump.gain,regularGain:best.gain,extraGain:extra,extraPct,extraCash,jumpCost:jump.cost,regularCost:best.cost,costPerThousand:perThousand,regularPerThousand,regularMethod:best.kind,regularRefills:best.refills,jumpOverflow,regularOverflow});
 }
 const order={consider:0,tradeoff:1,skip:2,unknown:3,unavailable:4};
 const best=[...rows].sort((a,b)=>(order[a.verdict]??9)-(order[b.verdict]??9)||((b.extraGain||0)-(a.extraGain||0))||((a.jumpCost||0)-(b.jumpCost||0)))[0]||null;
 const result={rows,best,reason:null};jumpValueMemo={key,result};return result;
}
function jumpVerdictLabel(row){return row.verdict==="consider"?"Potentially worthwhile":row.verdict==="tradeoff"?"Gain, but poor/unknown value":row.verdict==="skip"?"Regular training preferred":"Unable to assess";}
function jumpValueBrief(){
 const report=jumpBreakEven(),r=report.best;
 if(!r)return card("Happy Jump versus regular","<p>"+esc(report.reason)+"</p>");
 const detail=r.verdict==="unavailable"||r.verdict==="unknown"?r.reason:
 r.odReady?"Overdose-adjusted expected difference: "+(r.expectedExtra>=0?"+":"")+fmt(r.expectedExtra)+" "+esc(cfg.stat)+" ("+(r.expectedExtraPct>=0?"+":"")+r.expectedExtraPct.toFixed(1)+"%)":
 "Best-case projected change: "+(r.extraGain>=0?"+":"")+fmt(r.extraGain)+" "+esc(cfg.stat)+" ("+(r.extraPct>=0?"+":"")+r.extraPct.toFixed(1)+"%)";
 return card("Is a Happy Jump worth it?",'<p><b>'+esc(jumpVerdictLabel(r))+'</b> · '+esc(r.label)+'</p><p>'+esc(detail)+'</p>'+(r.verdict==="tradeoff"&&r.baseVerdict==="consider"?'<p class="warn">Model-sensitive: the advantage disappears in a cautious stress scenario.</p>':"")+'<button data-act="tab" data-val="compare">See equal-time comparison</button><p class="sub">Forecast only · risk comparisons require your optional estimate under Settings.</p>');
}
function jumpValueCard(){
 const report=jumpBreakEven();if(!report.rows.length)return card("Happy Jump break-even",esc(report.reason));
 let html='<p class="sub">Each Happy Jump is compared against the strongest feasible regular-training forecast starting now and ending at that jump\'s projected completion. Not a one-jump-vs-seven-day comparison. The 5% minimum edge is a cautious decision threshold, not a Torn mechanic. A hypothetical gain/price stress case tests how fragile any positive verdict is; it is not a confidence interval.</p>';
 for(const r of report.rows){
  html+='<div class="stat-row"><p><b>'+esc(r.label)+'</b> · '+esc(jumpVerdictLabel(r))+'</p>';
  if(r.verdict==="unavailable"||r.verdict==="unknown"){html+='<p class="sub">'+esc(r.reason)+'</p></div>';continue}
  html+='<div class="metric-grid"><div><span>Jump total</span><strong>+'+fmt(r.jumpGain)+'</strong><small>'+cash(r.jumpCost)+' purchased</small></div>'+
   '<div><span>Regular alternative</span><strong>+'+fmt(r.regularGain)+'</strong><small>'+cash(r.regularCost)+' purchased</small></div>'+
   '<div><span>Net stat advantage</span><strong>'+(r.extraGain>=0?"+":"")+fmt(r.extraGain)+'</strong><small>'+(r.extraPct>=0?"+":"")+r.extraPct.toFixed(1)+'%</small></div>'+
   '<div><span>Extra purchase cost</span><strong>'+cash(r.extraCash)+'</strong><small>'+r.hours.toFixed(1)+' hours to jump</small></div></div>';
  html+='<p><b>Overdose-aware comparison:</b> '+(r.odReady?'Chance of completing all drugs: '+r.odJump.successPct.toFixed(2)+'%; at least one OD: '+r.odJump.anyOdPct.toFixed(2)+'%.':'Enable community OD estimates or enter per-drug percentages in Settings to analyse each failed dose.')+'</p>';
  if(r.odReady)html+='<p class="sub">First OD on Xanax: '+r.odJump.xanaxOdPct.toFixed(2)+'%; first OD on Ecstasy: '+r.odJump.ecstasyOdPct.toFixed(2)+'%. Modelled stats after OD risk: jump +'+fmt(r.odJump.expectedGain)+' vs regular +'+fmt(r.odRegular.expectedGain)+'. Modelled purchase cash consumed: '+cash(r.odJump.expectedSpend)+' vs '+cash(r.odRegular.expectedSpend)+'.</p>'+
   '<p class="sub">On overdose, current Energy and Happy are emptied (Xanax also empties Nerve). Probability-weighted energy lost to OD: '+fmt(r.odJump.expectedEnergyLost)+' E; Happy: '+fmt(r.odJump.expectedHappyLost)+'. Xanax overdose can mean approximately 5,000 minutes of hospital time and extended drug cooldown; modelled hospital exposure '+(r.odJump.expectedHospitalMin/60).toFixed(1)+' hours, weighted by overdose likelihood. Ecstasy OD empties Energy and Happy without that Xanax hospital penalty.</p>';
  if(r.odReady)html+=overdoseStageCard(r.odJump);
  if(!r.odReady)html+='<p><b>Success chance needed for +5% gains:</b> '+(r.targetPct===null?'Unknown':r.targetPct>100?'Over 100% — impossible in this simplified model':Math.max(0,r.targetPct).toFixed(1)+'%')+'. '+(r.successPct===null?'No chance supplied, so expected gains are not claimed.':'With your assumed '+r.successPct.toFixed(1)+'% chance, expected difference is '+(r.expectedExtra>=0?'+':'')+fmt(r.expectedExtra)+' '+esc(cfg.stat)+' ('+(r.expectedExtraPct>=0?'+':'')+r.expectedExtraPct.toFixed(1)+'%).')+'</p>'+
   '<p class="sub">Rates are hypothetical rather than official. With drug-specific rates set, the forecast stops at the first overdose; addiction, rehab and post-OD recovery training are not simulated.</p>'+
   '<p><b>Consumed item replacement value:</b> jump '+(r.jumpReplacement===null?'Price unknown':cash(r.jumpReplacement))+'; regular '+(r.regularReplacement===null?'Price unknown':cash(r.regularReplacement))+' (buy-price proxy, not resale proceeds). New cash spend is shown above.</p>'+
   '<p class="sub">Energy trained by jump time: jump '+fmt(r.jumpEnergy)+' E, regular '+fmt(r.regularEnergy)+' E. Lost opportunities are already incorporated in the forecast gains.</p>';
  html+='<p><b>Scenario stress check:</b> Worst tested advantage '+(r.downsideGain>=0?"+":"")+fmt(r.downsideGain)+'; best tested advantage '+(r.upsideGain>=0?"+":"")+fmt(r.upsideGain)+' '+esc(cfg.stat)+'.</p>'+
   '<p class="sub">Hypothetical, not a probability range: jump gains −10% / regular gains +10% (and the reverse); jump purchase cost +20% in the downside check. Stressed extra cash: '+cash(r.stressedExtraCash)+'. '+(r.robust?'Advantage withstands both stress tests.':'Material gain or comparative cost advantage does not withstand both stress tests.')+'</p>'+
   '<p class="sub">Forecast energy regeneration lost by jump completion: jump '+fmt(r.jumpOverflow)+' E · regular '+fmt(r.regularOverflow)+' E. These are scenario totals, not extra energy to be added to predicted gains.</p>';
  if(r.costPerThousand!==null)html+='<p><b>Jump marginal cost:</b> '+cash(r.costPerThousand)+' per extra 1,000 stats'+(r.regularPerThousand!==null?' · comparable regular upgrade '+cash(r.regularPerThousand)+' per extra 1,000':'')+'.</p>';
  html+='<details><summary>Why this verdict?</summary><p>'+esc(r.reason)+'</p><p class="sub">Regular comparison: '+esc(r.regularMethod)+(r.regularRefills?" with refills":" without refills")+'; same time window and budget.</p></details>'+
   '<button data-act="choose" data-val="'+esc(r.method)+'">Inspect jump schedule</button></div>';
 }
 return card("Happy Jump break-even",html+'<p class="sub">An optional user-chosen success rate models risk only as a simplified what-if; no official overdose probability is known. Failure is pessimistic, addiction and rehab are excluded, and inventory replacement prices are not resale quotes. Scenario stress checks are assumptions rather than calibrated prediction intervals. Always verify boosters, energy, cooldowns, and the next happiness reset in Torn before any manual action.</p>');
}

function rCm(){const input=loadInput(),regular=(lp||[]).filter(x=>(x.method==="natural"||x.method==="xanax")&&x.affordable&&x.gain>0)
.sort((a,b)=>b.gain-a.gain),jumps=(lp||[]).filter(x=>x.method.startsWith("happy")&&x.jumps===1);const natural=(lp||[]).find(x=>x.method==="natural"&&x.affordable);if(!input)return card("Training rCm","Refresh live data to compare options.");let out='<p class="sub"><b>Weekly spending limit: '+cash(cfg.budget)+'</b> · Based on your saved setting. Change under Settings.</p>';out+=regular.length?'<p><b>Best regular 7-day plan:</b> '+esc(regular[0].method)+' · +'+fmt(regular[0].gain)+' '+esc(input.stat)+' · '+cash(regular[0].cost)+'</p><button data-act="choose" data-val="'+esc(regular[0].method)+'">Show regular schedule</button>':
'<p class="warn">Regular plan unavailable or over budget. Check Supplies.</p>';if(regular.length){const best=regular[0],spendShare=cfg.budget>0?Ro(best.cost/cfg.budget*100):0;out+='<p class="sub">Spend: '+spendShare+'% of budget. '+fmt(best.energy)+' energy trained. Assumes actions happen on schedule.</p>';}if(natural&&regular[0]?.method!=="natural"){out+='<p><b>Lower-cost option — Natural:</b> +'+fmt(natural.gain)+' '+esc(input.stat)+' · '+cash(natural.cost)+'</p><button data-act="choose" data-val="natural">Show natural schedule</button>';}for(const method of ["happy-candy","happy"]){const jump=jumps.find(x=>x.method===method),kit=jumpKit(method);const name=method==="happy-candy"?"Budget candy jump":"eDVD Happy jump";if(jump)out+='<p><b>'+name+':</b> +'+fmt(jump.gain)+' '+esc(input.stat)+' · '+cash(jump.cost)+'</p><button data-act="choose" data-val="'+method+'">Show '+name+' schedule</button>';else out+='<p class="sub">'+name+': not affordable or fully priced (kit '+(Fi(kit.total)?cash(kit.total):"cost unknown")+'; budget '+cash(cfg.budget)+'). <button data-act="tab" data-val="supplies">Check supplies</button></p>';}out+='<p class="sub">Regular: 7 days; Happy jump: one session.</p>';return card("What should I do?",out,"hero");}function supplies(){const list=lp||plans(),chosen=list.find(x=>x.method===sm)||
list.find(x=>x.method==="xanax")||list[0];let out=controls("Supply plan",sm==="auto"?"xanax":sm,[["natural","Natural"],["xanax","Xanax"],["happy-candy","Candy jump"],["happy","eDVD jump"]],"choose-supply");if(!chosen)return out+card("Supplies unavailable","Refresh gym, stats and market data first.");const rows=needs(chosen),missing=rows.filter(x=>x.missing>0&&!Fi(x.price));out+=card("Forecast basket",'<p><b>'+esc(chosen.method.toUpperCase())+'</b> · '+fmt(chosen.energy)+' E trained · '+(Fi(chosen.cost)?cash(chosen.cost):"Price incomplete")+' against '+cash(cfg.budget)+' budget</p>'+(rows.length?rows.map(x=>'<div class="row"><span>'+esc(x.name)+' × '+fmt(x.num)+' <small>(owned '+fmt(x.have)+', need '+fmt(x.missing)+')</small></span><b>'+(Fi(x.price)?cash(x.price):"Price unavailable")+'</b></div>').join(""):
'<p>No items needed.</p>')+(missing.length?'<p class="warn">Unknown market prices: '+esc(missing.map(x=>x.name).join(", "))+'. Enter a manual price in Settings or refresh prices.</p>':
'<p class="sub">Prices are estimates; enter owned points manually.</p>'));for(const method of ["happy-candy","happy"]){const kit=jumpKit(method),candy=method==="happy-candy";out+=card(candy?"Budget candy-jump kit":"eDVD Happy-jump kit",'<p><b>'+(candy?"4 Xanax + 48 lollipops + 1 Ecstasy":"4 Xanax + 4 Erotic DVDs + 1 Ecstasy")+'</b> (base 24-hour booster capacity).</p>'+kit.entries.map(x=>'<div class="row"><span>'+esc(x.name)+' × '+fmt(x.num)+' (owned '+fmt(x.have)+', need '+fmt(x.missing)+')</span><b>'+(Fi(x.price)?cash(x.price):"Market price missing")+'</b></div>').join("")+'<div class="row"><b>Kit purchases</b><b>'+(Fi(kit.total)?cash(kit.total):"Incomplete prices")+'</b></div>'+'<p class="'+(kit.available?"good":"warn")+'">'+(kit.available?
"Within budget; cooldowns, reset and overdose risk remain.":
"Budget or price insufficient; no jump scheduled.")+'</p><p class="sub">Assumes available boosters.</p>');}out+=card("Source health",'<p>'+esc(errs.length?errs.join(" · "):"No API errors.")+'</p>');return out;}
/* v0.12 decision engine: all recommendations are read-only, local and explicitly sourced. */

/* v0.12.9: stat snapshots measure observed changes independently of scheduled actions and gym logs. */
function recordStatSnapshot(st,t=Tm()/1000){
 if(!ST.every(k=>Fi(st[k])&&st[k]>0)||!Fi(t))return false;
 const history=Ar(statSamples)?statSamples:[],last=history[history.length-1];
 if(last&&last.t>t)return false;
 if(last&&ST.every(k=>last.s?.[k]===st[k]))return false;
 if(last&&t-last.t<10)return false;
 statSamples=[...history.filter(x=>x&&Fi(x.t)&&x.t>=t-14*86400),{t,s:Fr(ST.map(k=>[k,st[k]]))}].slice(-240);
 put("stat-samples",statSamples);
 return true;
}
function statEvidence(stat=cfg.stat,now=Tm()/1000){
 const list=(Ar(statSamples)?statSamples:[]).filter(x=>x&&Fi(x.t)&&Fi(x.s?.[stat])&&x.s[stat]>0&&x.t<=now+60).sort((a,b)=>a.t-b.t);
 const last=list.at(-1),previous=list.at(-2),first=list.find(x=>x.t>=now-604800);
 return {samples:list.length,
  latest:last&&previous?{from:previous.t,to:last.t,delta:last.s[stat]-previous.s[stat]}:null,
  week:last&&first&&last.t>first.t?{from:first.t,to:last.t,delta:last.s[stat]-first.s[stat],hours:(last.t-first.t)/3600}:null};
}
function statSampleCard(){
 const x=statEvidence(),k=esc(cfg.stat),delta=d=>(d>=0?"+":"")+fmt(d);
 let html=x.latest?'<p><b>Since previous API snapshot:</b> '+delta(x.latest.delta)+' '+k+' · '+cu(x.latest.from)+' to '+cu(x.latest.to)+'</p>':'<p>Only one stat reading so far; refresh after training to measure progress.</p>';
 html+=x.week?'<p><b>Recorded 7-day window:</b> '+delta(x.week.delta)+' '+k+' over '+x.week.hours.toFixed(1)+'h of observed coverage.</p>':'<p class="sub">7-day snapshot comparison needs two readings inside the window.</p>';
 return card("Actual stat changes",html+'<p class="sub">Read from Torn battle-stat snapshots, even when training was off-plan. These are net stat changes, not guaranteed gym-only gains. Gym-log totals are separate, never added to this number. No manual completion buttons.</p>');
}



/* Torn API log 2291 is the overdose event. No guessed OD from empty bars. */
let lastOdChecked=0,lastOdStatus="Not checked";
function lastOD(){const row=get("last-overdose",null);return row&&Fi(row.t)&&row.t>0&&["xanax","ecstasy","unknown"].includes(row.drug)?row:null;}
function parseODLog(x){
 const id=+x?.details?.id,t=+x?.timestamp;
 if(id!==2291||!Fi(t)||t<=0||t>Tm()/1000+120)return null;
 const v=x.data||{},detail=x.details||{},title=[detail.title,v.drug,v.drug_name,v.item,v.item_name,v.name,v.result,v.message].map(y=>St(y||"")).join(" ");
 const drug=/xanax/i.test(title)||(+v.item_id===206)?"xanax":/ecstasy/i.test(title)||(+v.item_id===197)?"ecstasy":"unknown";
 return {drug,t,source:"api",id:St(x.id||"").slice(0,90)};
}

function labelLastOD(drug){
 if(!["xanax","ecstasy"].includes(drug))return false;
 const last=lastOD();if(!last||last.drug!=="unknown")return false;
 const changed={...last,drug,drugSource:"manual"};
 put("last-overdose",changed);
 const held=reportedOverdose();if(held&&held.t===last.t)put("reported-overdose",{...held,drug,drugSource:"manual"});
 return true;
}
function rememberOD(item){
 if(!item)return false;
 const prior=lastOD(),confirmed=+(get("od-acknowledged-through",0)||0);
 const correctingManual=!!prior&&prior.source==="manual"&&item.source==="api"&&item.t<=prior.t&&prior.t-item.t<=1800;
 if(prior&&prior.t>item.t&&!correctingManual)return false;
 if(prior&&(prior.t===item.t||correctingManual)&&item.drug==="unknown"&&prior.drug!=="unknown")item={...item,drug:prior.drug,drugSource:"manual"};
 if(correctingManual){
  const oldHold=reportedOverdose();
  if(oldHold&&oldHold.source==="manual"&&oldHold.t===prior.t)put("reported-overdose",{...item});
 }
 const changed=!prior||prior.t!==item.t||prior.drug!==item.drug||prior.source!==item.source;
 if(changed)put("last-overdose",item);
 const held=reportedOverdose();
 const recentHours=item.drug==="xanax"?96:item.drug==="ecstasy"?8:24;
 if(item.t>confirmed&&item.t>Tm()/1000-recentHours*3600&&(!held||held.t<item.t)){
  put("reported-overdose",{...item});odClearPending=false;sm="auto";
 }
 return changed;
}
async function scanLastOD(force=false){
 const now=Fl(Tm()/1000);
 if(!force&&now-lastOdChecked<300)return;
 lastOdChecked=now;
 try{
  const result=await api("/user/log?log=2291&limit=100");
  if(!Ar(result.log))throw Error("OD log unavailable or the API key lacks log type 2291");
  const parsed=result.log.map(parseODLog).filter(Boolean).sort((a,b)=>b.t-a.t);
  if(parsed.length){
   const latest={...parsed[0]},candidates=acts.filter(x=>x.t>=latest.t-90&&x.t<=latest.t+30&&(x.kind==="XANAX"||x.kind==="ECSTASY"));
   if(latest.drug==="unknown"&&candidates.length)latest.drug=candidates.sort((a,b)=>Ab(a.t-latest.t)-Ab(b.t-latest.t))[0].kind==="XANAX"?"xanax":"ecstasy";
   rememberOD(latest);
  }
  lastOdStatus=parsed.length?"Verified from Torn OD log 2291":"No overdose in the returned log history";
 }catch(e){lastOdStatus="OD log unavailable: "+St(e.message).slice(0,85);}
}

let odClearPending=false;
function reportedOverdose(){
 const v=get("reported-overdose",null);
 return v&&["xanax","ecstasy","unknown"].includes(v.drug)&&Fi(v.t)&&v.t>0?v:null;
}
function noteOverdose(drug){
 if(!["xanax","ecstasy"].includes(drug))return false;
 const t=Tm()/1000;put("reported-overdose",{drug,t,source:"manual"});rememberOD({drug,t,source:"manual"});odClearPending=false;sm="auto";return true;
}
function clearOverdose(){const held=reportedOverdose();if(held)put("od-acknowledged-through",Mx(+get("od-acknowledged-through",0)||0,held.t));odClearPending=false;put("reported-overdose",null);}

function odRecoverySnapshot(held,now=Tm()/1000){
 if(!held)return null;
 const referenceEnd=held.drug==="xanax"?held.t+5000*60:null;
 const freshness=Mx(updated,miniFresh),fresh=!!freshness&&Tm()-freshness<=5*60000;
 const e=data.bars?.bars?.energy,h=data.bars?.bars?.happy,d=data.cooldowns?.cooldowns;
 return {referenceEnd,remainingMinutes:referenceEnd===null?null:Mx(0,Ce((referenceEnd-now)/60)),fresh,
  energy:fresh&&Fi(e?.current)?e.current:null,happy:fresh&&Fi(h?.current)?h.current:null,
  drugCooldown:fresh&&Fi(d?.drug)?d.drug:null};
}

function odSourceCard(){const x=odRateSource("xanax"),e=odRateSource("ecstasy"),last=lastOD();return card("Overdose risk sources",'<p><b>Xanax:</b> '+(x.pct===null?"Unknown":x.pct.toFixed(2)+"% per dose")+' · '+esc(x.label)+'</p><p><b>Ecstasy:</b> '+(e.pct===null?"Unknown":e.pct.toFixed(2)+"% per dose")+' · '+esc(e.label)+'</p><p class="sub">Torn documents the Overdosing faction reduction (up to 30%) and 7-star Nightclub reduction (50%), but does not publish personal per-drug OD rates. Unknown modifiers are not treated as verified zero. A previous OD does not make the next one more or less likely.</p>'+(last?'<p>Last OD: '+esc(cu(last.t))+' · '+esc(last.drug)+'</p>':''));}
function overdoseRecoveryCard(){
 const held=reportedOverdose();
 if(held){
  const r=odRecoverySnapshot(held),drug=held.drug.toUpperCase();
  let html='<p class="warn"><b>'+esc(drug)+' overdose '+esc(held.source==="api"?"verified from Torn log":"reported manually")+' '+esc(cu(held.t))+'.</b> Normal drug and jump recommendations are suspended until you explicitly clear this hold.</p>';
  if(r.referenceEnd!==null)html+='<p><b>Xanax hospital reference:</b> approximately 5,000 minutes from the report, or '+esc(cu(r.referenceEnd))+'. '+(r.remainingMinutes>0?'About '+fmt(r.remainingMinutes)+' minutes until that reference time.':'That reference time has passed.')+'</p><p class="sub">Not an actual hospital countdown: revives, treatments and the true overdose timestamp can change the result. Check Torn itself.</p>';
  else if(held.drug==="unknown")html+='<p><b>Drug type not identified in the OD log.</b> Check the Torn event and select the drug without altering its recorded time.</p><button data-act="od-label" data-val="xanax">It was Xanax</button> <button data-act="od-label" data-val="ecstasy">It was Ecstasy</button>';
  else html+='<p><b>Ecstasy OD:</b> Energy and Happiness empty; no Xanax-style 5,000-minute hospital effect is assumed. Check current Energy, Happy, cooldown and actual hospital status.</p>';
  html+='<p class="sub">'+(r.fresh?'Recently refreshed bars: Energy '+(r.energy===null?'Unknown':fmt(r.energy))+'; Happy '+(r.happy===null?'Unknown':fmt(r.happy))+'; drug cooldown '+(r.drugCooldown===null?'Unknown':fmt(Ce(r.drugCooldown/60))+' min')+'.':'Bars and cooldowns have not been freshly checked. Refresh before making decisions.')+'</p>';
  html+='<button data-act="refresh">Refresh current bars</button> ';
  if(odClearPending)html+='<p class="warn">Confirm that Torn shows you are out of hospital and you have checked your Energy, Happiness and drug cooldown. Clearing is manual; it does not indicate automatic recovery.</p><button data-act="od-confirm-clear">Confirm recovered — clear hold</button> <button data-act="od-cancel-clear">Cancel</button>';
  else html+='<button data-act="od-clear">I have recovered — review hold</button>';
  return card("Overdose recovery hold",html);
 }
 const last=lastOD(),age=last?Tm()/1000-last.t:null;
 let html=last?'<p><b>Last overdose:</b> '+esc(cu(last.t))+' · '+esc(last.drug.toUpperCase())+' · '+esc(last.source==="api"?"Torn API log":"Manual record")+' · '+fmt(age/3600)+' hours ago.</p>':'<p>No previous overdose timestamp verified.</p>';
 if(last&&last.drug==="unknown")html+='<p><b>Drug not identified:</b> <button data-act="od-label" data-val="xanax">Mark Xanax</button> <button data-act="od-label" data-val="ecstasy">Mark Ecstasy</button> (keeps Torn log time)</p>';
 html+='<p class="sub">'+esc(lastOdStatus)+'. The helper reads only Torn log type 2291; a custom API key must permit this log type. Empty Happy alone does not prove an OD.</p>';
 html+='<p class="sub">If an OD is missing, record it manually to pause all old schedules. The action is stored locally; nothing is submitted to Torn.</p><button data-act="od-report" data-val="xanax">Report Xanax OD</button> <button data-act="od-report" data-val="ecstasy">Report Ecstasy OD</button>';
 return card("Overdose history",html);
}

function nextDecision(){
 const p=loadInput(),now=Tm()/1000,chosen=aPl();
 const od=reportedOverdose();
 if(od)return {kind:"overdose",title:"Overdose detected — pause drug planning",detail:od.drug.toUpperCase()+" OD "+(od.source==="api"?"confirmed in Torn log":"reported manually")+". Check actual bars, hospital status and drug cooldown.",why:"Do not use the old Xanax/jump forecast. The hold remains until you have recovered and clear it manually.",tab:"today"};
 if(!p)return {kind:"unknown",title:"Refresh live Torn data",detail:"Gym, energy, happiness or battle-stat data is missing.",why:"A safe recommendation requires a known current gym and stat. No action has been inferred.",tab:"today"};
 if(!updated||Tm()-updated>15*60000)return {kind:"stale",title:"Refresh before taking an action",detail:"The latest full Torn state is older than 15 minutes or has not been verified.",why:"Cooldowns, energy, inventory and booster availability may have changed. The helper does not treat stale data as current.",tab:"today"};
 if(cfg.mode==="happy"){const report=jumpBreakEven(),selected=report.rows.find(x=>x.method===chosen?.method)||report.best;if(selected&&selected.verdict!=="consider")return {kind:"strategy",title:"Review jump value before stacking",detail:selected.label+": "+jumpVerdictLabel(selected),why:selected.reason||"A current, complete comparison is not available. No in-game action is automatic.",tab:"compare"};}
 const due=priorityAction(chosen?.events,now);
 if(due){const imminent=due.t<=now,label=due.kind==="XANAX"?"Take Xanax":due.kind==="REFILL"?"Use points refill":due.kind==="TRAIN"?"Train in the gym":due.kind==="JUMP"?"Perform Happy Jump":"Review action";
 return {kind:"due",title:(imminent?"Due now: ":"Coming up: ")+label,detail:due.detail+" · "+(imminent?"Scheduled time reached":eta(due.t))+" · "+cu(due.t),why:"Based on the selected, budget-feasible training forecast. The game action remains entirely manual; confirm Torn cooldowns and resources before acting. Verified recent activity is excluded.",tab:"plan"};}
 const readyBook=Ar(data.perks?.perks?.book_perks)?bookAssessment(cfg.stat).find(x=>x.ready):null;
 if(readyBook)return {kind:"book",title:"Review owned book: "+readyBook.name,detail:readyBook.reason,why:"Inventory confirms ownership and usability, no active book was returned, and the focused stat has reached the specific 200m cap condition. Confirm the 31-day effect and upcoming training before choosing to use it in Torn.",tab:"perks"};
 const upcoming=(chosen?.events||[]).find(x=>x.t>=now&&!slp(x.t)&&!actDone(x));
 if(upcoming&&upcoming.t<=now+2*3600)return {kind:"waiting",title:"Prepare for "+upcoming.kind.toLowerCase(),detail:upcoming.detail+" · "+eta(upcoming.t)+" · "+cu(upcoming.t),why:"This is the next uncompleted planned action, not a confirmed action. The schedule is recalculated from live player state on refresh.",tab:"plan"};
 const edu=educationOpportunities(cfg.stat)?.find(x=>x.ready);
 if(edu)return {kind:"education",title:"Consider "+edu.course.name,detail:edu.description+" · prerequisites confirmed complete.",why:"The course is available according to returned education progress and catalogue. It is a lasting training improvement, not an urgent drug or booster reminder.",tab:"perks"};
 if(upcoming)return {kind:"waiting",title:"Next planned: "+upcoming.kind.toLowerCase(),detail:upcoming.detail+" · "+eta(upcoming.t)+" · "+cu(upcoming.t),why:"No immediate action is due. This is an estimate based on your selected training plan, not proof that items or cooldowns are ready.",tab:"plan"};
 return {kind:"none",title:"No immediate training action confirmed",detail:"Review your strategy or check the training audit for longer-term opportunities.",why:"The tool does not invent an action when data is incomplete or the plan has no upcoming events.",tab:"compare"};
}
function energyDecisionCard(){
 const p=loadInput();if(!p||reportedOverdose())return "";
 const available=Fl(p.energy/p.cost),spend=available*p.cost;
 const toCap=Mx(0,p.maxE-p.energy);
 const minutes=p.regen>0&&p.inc>0?Ce(toCap*p.regen/p.inc/60):null;
 const lowRoom=toCap<=p.cost*2;
 let html='<div class="metric-grid"><div><span>Can train now</span><strong>'+available+' trains</strong><small>'+spend+' E in '+esc(p.gym.name)+'</small></div>'+
   '<div><span>Until natural cap</span><strong>'+(p.energy>=p.maxE?'At cap':minutes!==null?minutes+' min*':'Unknown')+'</strong><small>'+fmt(p.energy)+'/'+fmt(p.maxE)+' E</small></div></div>'+
   '<p class="sub">*Approximation assuming normal regeneration; time and energy are read-only. Happiness changes after each train.</p>';
 if(lowRoom)html+='<p class="warn">Low room for regenerated energy. Check your chosen schedule before using available energy.</p>';
 html+='<button data-act="open-torn" data-val="/gym.php">Open Torn Gym ›</button> <button data-act="tab" data-val="plan">Check planned training</button>';
 return card("Gym readiness · manual next step",html,"hero");
}


/* 0.18.1: make the true cash opportunity cost of training choices visible. */
function cashOpportunityV181(){
 if(reportedOverdose()||!loadInput())return "";
 const compare=optimizerResults(),max=compare.max,value=compare.value,cap=Mx(0,+cfg.budget||0);
 if(!max||!value)return card("Training budget decisions","Refresh pricing and training data to compare feasible seven-day plans.");
 const remaining=Mx(0,cap-max.cost),cheaper=Mx(0,max.cost-value.cost),lost=Mx(0,max.gain-value.gain);
 const tradeoff=cheaper>0&&lost>0?cash(1000*cheaper/lost)+" preserved per 1,000 stats forgone":cheaper>0?"No forecast stat loss in tested schedules":"No verified cheaper near-maximum plan";
 let html='<div class="metric-grid"><div><span>Weekly allowance</span><strong>'+cash(cap)+'</strong><small>Player-defined training budget</small></div>'+
  '<div><span>After max-gain plan</span><strong>'+cash(remaining)+'</strong><small>Unspent allowance, not profit</small></div></div>';
 html+='<div class="row"><b>Max-gain plan expense</b><span>'+cash(max.cost)+'</span></div>'+
  '<div class="row"><b>Preserved by near-max plan</b><span>'+cash(cheaper)+'</span></div>'+
  '<div class="row"><b>Training gains forgone</b><span>'+fmt(lost)+' '+esc(cfg.stat)+'</span></div>'+
  '<p class="sub">'+esc(tradeoff)+'. Comparison uses the same seven-day starting position. Unspent budget could remain as trading or stock-market capital, but is not itself revenue. Consumed items already owned are priced at zero new spending, so opportunity cost is understated.</p>'+
  '<button data-act="tab" data-val="compare">Compare all training schedules</button>';
 return card("Protect trading capital · training budget",html);
}

function trainingEfficiencyV18(){
 const p=loadInput();if(!p||reportedOverdose())return "";
 const scenarios=sMa(),best=scenarios.slice().sort((a,b)=>b.perTrain-a.perTrain)[0];
 const perEnergy=tEs(p)/Mx(1,p.cost),weekly=optimizerResults(),efficient=weekly.frontier||[];
 let content='<div class="metric-grid"><div><span>Current gym</span><strong>+'+fmt(perEnergy)+' / E</strong><small>'+esc(cfg.stat)+' · estimated</small></div>'+
 '<div><span>Strongest in this gym</span><strong>'+esc(best?.stat||"Unknown")+'</strong><small>'+fmt(best?.perTrain??NaN)+' gain per train</small></div></div>';
 content+='<p class="sub">Different starting stat totals affect gains. Best per train is not automatically best for your stat priorities. Only your available gym is compared.</p>';
 if(weekly.max)content+='<div class="row"><b>Highest seven-day gains</b><span>'+esc(weekly.max.label)+' · '+cash(weekly.max.pricePerThousand)+'/1k gain</span></div>';
 if(weekly.value)content+='<div class="row"><b>Lower-cost plan</b><span>'+esc(weekly.value.label)+' · '+cash(weekly.value.pricePerThousand)+'/1k gain</span></div>';
 content+='<p class="sub">Extra purchase cash only; owned items have unpriced opportunity cost. Figures assume the simulated schedule is followed.</p>'+
 '<button data-act="tab" data-val="compare">Compare cost and gym efficiency ›</button>';
 return card("Training efficiency · gain per energy and dollar",content);
}
function refillTimingV18(){
 const p=loadInput();if(!p||reportedOverdose())return "";
 const plan=aPl(),now=Tm()/1000;
 const future=(plan?.events||[]).filter(x=>x.kind==="REFILL"&&x.t>=now-60).sort((a,b)=>a.t-b.t)[0];
 const available=Fl(p.energy/Mx(1,p.cost));
 let message="",route="";
 if(p.refill!=="ready")message="Torn reports the daily point refill is not ready. Verify availability before planning another.";
 else if(future){
   message="Planned refill at "+cu(future.t)+" ("+eta(future.t)+"). "+(available>0?
     "You currently have enough energy for "+available+" gym train(s); review the plan before refilling so those points are not wasted.":"No full gym train fits current energy; check the schedule and Torn energy bar.");
   route='<button data-act="open-torn" data-val="/points.php">Open Torn Points Building ›</button>';
 }else{
   message="No refill is scheduled in the selected forecast. It may be better to wait for a planned energy-spending window than to use it immediately.";
   route='<button data-act="tab" data-val="plan">Review timing in schedule ›</button>';
 }
 const opts=optimizerResults().scenarios||[];
 const comparison=[];
 for(const method of ["natural","xanax"]){
   const withRefill=opts.find(x=>x.method===method&&x.refills),without=opts.find(x=>x.method===method&&!x.refills);
   if(withRefill?.feasible&&without?.feasible&&withRefill.refillsUsed){
     const extraGain=withRefill.gain-without.gain,extraCost=withRefill.cost-without.cost;
     comparison.push('<p>'+esc(method)+' · '+fmt(extraGain)+' additional forecast stats for '+cash(extraCost)+' extra cash'+
       (extraGain>0?' · '+cash(1000*extraCost/extraGain)+'/1k incremental stats':' · no modeled extra gain')+'</p>');
   }
 }
 return card("Points refill · timing and marginal value",'<p><b>'+esc(message)+'</b></p>'+
 '<p class="sub">A point refill fills the energy bar; assess current energy, planned training and your daily refill availability before confirming.</p>'+
 (comparison.length?comparison.join(""):'<p class="sub">Not enough comparable priced scenarios to value this refill yet.</p>')+
 route+' <button data-act="open-torn" data-val="/gym.php">Open gym</button>');
}
function progressionRoadmapV18(){
 const current=stats(),observed=(hs||[]).filter(x=>x&&x.d&&x.s&&Number.isFinite(Number(x.s[cfg.stat])));
 observed.sort((a,b)=>String(a.d).localeCompare(String(b.d)));
 const first=observed[0],last=observed[observed.length-1];
 const daySpan=first&&last?(Date.parse(last.d+'T00:00:00Z')-Date.parse(first.d+'T00:00:00Z'))/86400000:0;
 const recorded=daySpan>=2&&Number(last.s[cfg.stat])>=Number(first.s[cfg.stat])?
   (Number(last.s[cfg.stat])-Number(first.s[cfg.stat]))/daySpan:null;
 const regular=(lp||[]).filter(x=>x.affordable&&!x.method.startsWith("happy")).sort((a,b)=>b.gain-a.gain)[0];
 const weekly=regular?summary(regular,168,Tm()/1000)?.gain:0;
 let text='<div class="metric-grid"><div><span>Observed daily change</span><strong>'+
   (recorded===null?'Insufficient data':'+'+fmt(recorded))+'</strong><small>'+observed.length+' dated checks</small></div>'+
   '<div><span>Modelled 7-day gain</span><strong>'+(weekly>0?'+'+fmt(weekly):'Unavailable')+
   '</strong><small>Regular training only</small></div></div>';
 if(weekly>0)text+='<div class="row"><b>30-day straight-line scenario</b><span>+'+fmt(weekly*30/7)+'</span></div>'+
 '<div class="row"><b>90-day straight-line scenario</b><span>+'+fmt(weekly*90/7)+'</span></div>';
 const goals=[50000000,100000000,200000000,1000000000].filter(v=>v>Number(current[cfg.stat]));
 if(weekly>0&&goals.length)text+='<p class="sub">Selected long-term targets · repeated current weekly plan:</p>'+
 goals.slice(0,4).map(goal=>{const weeks=targetWeeks(Number(current[cfg.stat]),weekly,goal);
   return '<div class="row"><b>'+fmt(goal)+' '+esc(cfg.stat)+'</b><span>'+
     (weeks===null?'Beyond model':weeks.toFixed(1)+' weeks')+'</span></div>';}).join("");
 text+='<p class="sub">Projections are scenarios, not promises. Observed change is based on daily stat snapshots and can include any training, boosts and manual activity.</p>';
 return card("Stat progression roadmap",text);
}

/* v0.19: execution queue and data-quality gates based on the current real bars and latest checked action log. */

/* v0.20: learn a modest schedule preference from verified gym timestamps, not from planned events. */
function ukHourV200(ts){
 try{return Nu(new Intl.DateTimeFormat("en-GB",{timeZone:"Europe/London",hour:"2-digit",hourCycle:"h23"}).format(new Date(ts*1000)))%24;}
 catch(_){return new Date(ts*1000).getUTCHours();}
}
function observedGymPatternV200(t=Tm()/1000){
 const unique=new Map();
 for(const x of al){
   if(!Fi(+x?.t)||x.t>t+60||x.t<t-14*86400||!(Nu(x.amount)>0))continue;
   // A logged gym session may contain many trains. It is one observation, not trains repetitions.
   const time=Fl(Number(x.t)/600)*600;
   if(!unique.has(time))unique.set(time,x);
 }
 const sessions=[...unique.values()],days=new Set(sessions.map(x=>day(x.t))),counts=Array(24).fill(0);
 for(const x of sessions)counts[ukHourV200(x.t)]++;
 const choices=counts.map((n,h)=>({hour:h,count:n})).filter(x=>x.count>=2)
   .sort((a,b)=>b.count-a.count||a.hour-b.hour).slice(0,3);
 const strong=sessions.length>=6&&days.size>=3&&choices.length>0,
   coverage=strong?choices.reduce((a,b)=>a+b.count,0)/sessions.length:0;
 return {samples:sessions.length,days:days.size,hours:strong?choices.map(x=>x.hour).sort((a,b)=>a-b):[],
   coverage,strong:strong&&coverage>=.3,notes:strong?'Selected from observed completed gym sessions':'Need at least 6 gym sessions across 3 UTC dates and repeated hours'};
}
function observedScheduleCardV200(){
 const pattern=observedGymPatternV200();
 let out='<p class="sub">Actual completed gym-log timestamps over the last 14 days, grouped by UK local hour. Each session counts once; no scheduled actions are used as evidence.</p>'+
   '<div class="metric-grid"><div><span>Verified sessions</span><strong>'+pattern.samples+'</strong><small>'+pattern.days+' separate UTC dates</small></div>'+
   '<div><span>Schedule confidence</span><strong>'+(pattern.strong?'Observed':'Not enough')+'</strong><small>'+fmt(pattern.coverage*100)+'% in repeated time windows</small></div></div>';
 if(pattern.strong)out+='<p><b>Usual gym windows:</b> '+pattern.hours.map(h=>St(h).padStart(2,"0")+":00").join(" · ")+' UK</p>'+
   '<p class="sub">When enabled, the simulator checks these hours for affordable natural or Xanax-method gym trains, without overriding sleep, resource checks or overdose recovery. It does not assume you will train just because a past session occurred then.</p>';
 else out+='<p class="warn">'+esc(pattern.notes)+'. Until then, the existing schedule is used unchanged.</p>';
 out+='<p class="sub">Pattern-based adjustment: '+(cfg.adaptHistory!==false?'On':'Off')+
   '. You can switch it off under Settings. Gym logs may be incomplete if the API has not returned full history.</p>'+
   '<button data-act="scan-logs">Scan verified gym history</button> <button data-act="tab" data-val="plan">Review personalised plan</button>';
 return card("Your training habits · observed windows",out);
}

function actionableQueueV190(){
 const p=loadInput(),now=Tm()/1000,od=reportedOverdose(),rows=[];
 if(od)return {blocked:true,reason:"Reported overdose recovery hold. Refresh after recovery before resuming any drug or training schedule.",rows:[]};
 if(!p)return {blocked:true,reason:"Live gym, energy, happiness or training stat data missing.",rows:[]};
 if(!updated||Tm()-updated>15*60000)return {blocked:true,reason:"Full Torn API snapshot is older than 15 minutes.",rows:[]};
 const plan=aPl();if(!plan||!plan.affordable)return {blocked:true,reason:"No budget-feasible schedule is verified with current pricing.",rows:[]};
 const candidates=(plan.events||[]).filter(e=>e.t>=now-1800&&!actDone(e)&&["TRAIN","XANAX","REFILL","JUMP"].includes(e.kind));
 for(const ev of candidates){
   if(rows.length>=4)break;
   if(slp(ev.t))continue;
   const isNow=ev.t<=now+180,flags=[];
   if(ev.kind==="TRAIN"){
     if(isNow&&p.energy<p.cost)flags.push("Current energy below one gym train");
     if(isNow&&p.happy<1)flags.push("Happiness unavailable");
   }else if(ev.kind==="XANAX"){
     if(isNow&&p.drug>0)flags.push("Drug cooldown active: "+Ce(p.drug/60)+" min");
     if(isNow&&owned("xanax")<1)flags.push("Xanax not confirmed in inventory");
   }else if(ev.kind==="REFILL"){
     if(refill()!=="ready")flags.push("Daily points refill "+refill());
     if(owned("points")<30)flags.push("30 points not confirmed owned");
   }else if(ev.kind==="JUMP"){
     if(isNow&&p.booster>0)flags.push("Booster cooldown active");
     const req=jumpKit(plan.method);
     if(req.entries.some(x=>x.missing>0))flags.push("Full jump inventory not confirmed");
   }
   rows.push({kind:ev.kind,at:ev.t,detail:ev.detail,due:isNow,blocked:flags.length>0,flags});
 }
 return {blocked:false,reason:"",rows,plan:plan.method};
}
function actionableQueueCardV190(){
 const queue=actionableQueueV190(),p=loadInput(),now=Tm()/1000;
 let html='<p class="sub">Four upcoming unverified planned actions. Uses latest full Torn snapshot and recent confirmed activity. It does not mark forecast actions as complete.</p>';
 if(queue.blocked)return card("Next moves · refresh or recover",'<p class="warn">'+esc(queue.reason)+'</p><button data-act="refresh">Refresh live Torn state</button>');
 if(!queue.rows.length)html+='<p>No near-term action established for this schedule.</p>';
 for(const x of queue.rows){
   const open=x.kind==="TRAIN"?"/gym.php":x.kind==="REFILL"?"/points.php":"/item.php";
   html+='<div class="timeline-row"><div class="row"><strong>'+esc(x.kind)+' · '+(x.due?'Scheduled now':esc(eta(x.at)))+'</strong>'+
     '<small>'+esc(cu(x.at))+'</small></div>'+
     '<p>'+esc(x.detail)+'</p>'+
     (x.flags.length?'<p class="warn">Check before acting: '+esc(x.flags.join(" · "))+'</p>':
       '<p class="sub">No detected resource blocker; still confirm on Torn.</p>')+
     '<button data-act="open-torn" data-val="'+open+'">'+(x.kind==="TRAIN"?"Open Gym":x.kind==="REFILL"?"Open Points":"Open Items")+' ›</button></div>';
 }
 if(p){
   const available=Fl(p.energy/p.cost),cap=p.maxE-p.energy,regenRate=p.regen>0&&p.inc>0?p.inc/p.regen:0;
   if(available>0&&cap<=p.cost&&regenRate>0){
     html+='<p class="warn">Energy near full: natural regeneration may soon be wasted if you are not deliberately stacking energy. Review the selected schedule first.</p>';
   }
 }
 return card("Next four moves · what I need to do",html);
}

function nextDecisionCard(){
 const a=nextDecision(),buttonText=a.tab==="perks"?"Open training audit":a.tab==="compare"?"Compare methods":a.tab==="plan"?"View schedule":"Refresh state";
 return card("Best next action",'<p><b>'+esc(a.title)+'</b></p><p>'+esc(a.detail)+'</p><details><summary>Why this recommendation?</summary><p class="sub">'+esc(a.why)+'</p></details>'+(a.tab==="today"?'<button data-act="refresh">Refresh live data</button>':'<button data-act="tab" data-val="'+esc(a.tab)+'">'+buttonText+'</button>')+'<p class="sub">Source: '+(a.kind==="due"||a.kind==="waiting"?"estimated plan + recent verified activity":a.kind==="book"?"owned inventory, stat and perks":a.kind==="education"?"education API + catalogue":"live-data availability")+' · No automated Torn actions.</p>','hero');
}

function today(){const p=loadInput(),a=aPl();let out='<div class="toolbar"><b>'+esc(cfg.stat.toUpperCase())+' COMMAND CENTRE</b><button data-act="tab" data-val="alerts">Alerts !</button><button data-act="refresh"'+(busy?' disabled':'')+'>'+(busy?'Refreshing':'Refresh')+'</button></div>'+controls("Training",cfg.mode,[["training","Regular"],["happy","Happy jump"]],"mode")+controls("Stat",cfg.stat,ST.map(k=>[k,k[0].toUpperCase()+k.slice(1)]),"stat");if(!p)return out+overdoseRecoveryCard()+card("Live data unavailable","Refresh the helper to load current gym, stats and cooldowns.");const d=summary(a,24),w=summary(a,168),now=Tm()/1000;out+=autoSignalCardV0260();out+=nextDecisionCard();out+=observedScheduleCardV200();out+=actionableQueueCardV190();out+=energyDecisionCard();out+=refillTimingV18();out+=trainingEfficiencyV18();out+=cashOpportunityV181();out+=overdoseRecoveryCard();out+=odSourceCard();out+=happyRecoveryCard();if(!reportedOverdose())out+=jumpValueBrief();else out+=card("Forecast suspended","Live training and Happy Jump suggestions are paused while an overdose recovery hold is active. Refresh Torn and clear the hold after recovery.");if(!reportedOverdose())out+=aFl(a);out+=trainingRecordsV024();out+=statSampleCard();out+=card("At a glance",'<div class="metric-grid"><div><span>Energy now</span><strong>'+fmt(p.energy)+'/'+fmt(p.maxE)+'</strong></div><div><span>Per train</span><strong>+'+fmt(tEs(p))+'</strong></div><div><span>Next 24h</span><strong>+'+(reportedOverdose()?'Paused':'+'+fmt(d?.gain??NaN))+'</strong></div><div><span>Happy</span><strong>'+fmt(p.happy)+'/'+fmt(p.maxH)+'</strong></div></div><p class="sub">Forecast uses current data. Last check: '+(updated?new Date(updated).toLocaleTimeString("en-GB"):"not yet")+'</p>','hero');if(!reportedOverdose())out+=gymTip();if(!reportedOverdose())out+='<details><summary>Forecast, calibration and model assumptions</summary>'+mCard(p)+aCo(rGr())+card("Training forecast",'<p>Next 7 days: +'+fmt(w?.gain??NaN)+' '+esc(cfg.stat)+' · '+fmt(w?.energy??NaN)+' E · estimated spend '+cash(w?.cost)+'</p><p class="sub">Estimated outcomes, not confirmed activity. Includes sleep and cooldown assumptions.</p>')+'</details>';if(!reportedOverdose())out+='<details><summary>Energy, point refill and overnight waste</summary>'+card("Energy efficiency",'<p>Estimated unused regeneration: '+fmt(d?.lost??0)+' E over 24h; overnight '+fmt(d?.sleepLost??0)+' E.</p><p>Refill: '+esc(refill())+' · Drug cooldown: '+fmt(Ce(p.drug/60))+' min · Booster: '+fmt(Ce(p.booster/60))+' min</p><p class="sub">Train before sleeping if energy would otherwise stay full.</p>')+'</details>';if(!reportedOverdose())out+='<details><summary>Training strategy and data diagnostics</summary>'+rCm()+card("Other battle stats",ST.map(k=>'<p>'+esc(k)+': '+fmt(stats()[k])+'</p>').join(""))+(errs.length?card("Data issues",errs.map(esc).join("; ")):"")+'</details>';out+=card("Upgrade lab",'<p>Compare Private Island upgrades, base happiness, energy cans and estimated progress toward 50m without buying anything.</p><button data-act="tab" data-val="lab">Open upgrade lab</button>');return out;}function compare(){if(reportedOverdose())return overdoseRecoveryCard()+happyRecoveryCard()+card("Comparison paused","A recent overdose has invalidated the old jump and training timetable. Refresh the current bars, finish recovery, then clear the hold before reviewing new strategies.");const p=loadInput(),all=lp||[];if(!p)return card("Missing training data","Refresh Torn data to calculate gains.");let html=controls("Focus stat",cfg.stat,ST.map(k=>[k,k[0].toUpperCase()+k.slice(1)]),"stat");html+=jumpValueCard();html+=optimizerCard();html+=trainingEfficiencyV18();html+=card("Same-period comparison",'<p>Regular plans compare 24h and 7d; Happy jumps are one session.</p>'+'<p class="sub">Budget '+cash(cfg.budget)+' · '+esc(p.gym.name)+' · '+p.dots.toFixed(1)+' gym dots · Estimates, not observed gains.</p>');html+=card("All four stats — regular training potential",'<p class="sub">Each stat is an independent scenario, not additive.</p>'+sMa().map(x=>'<div class="stat-row"><div class="row"><b>'+esc(x.stat)+'</b><button data-act="stat" data-val="'+esc(x.stat)+'">Focus</button></div>'+'<div class="metric-grid"><div><span>Per train</span><strong>+'+fmt(x.perTrain)+'</strong></div>'+'<div><span>24 hours</span><strong>+'+fmt(x.daily.gain)+'</strong></div>'+'<div><span>7 days</span><strong>+'+fmt(x.weekly.gain)+'</strong><small>'+esc(x.method)+'</small></div></div></div>').join(""));for(const x of all){const d=summary(x,24),w=summary(x,168),blocked=x.method.startsWith("happy")&&x.jumps===0;const name={natural:"Natural energy + refill",xanax:"Xanax + regeneration","happy-candy":"Candy Happy jump",happy:"eDVD Happy jump"}[x.method];html+=card(name,blocked?
'<p class="warn">Jump not forecast: required supplies are unpriced or above budget.</p><button data-act="tab" data-val="supplies">View kit</button>':
'<div class="metric-grid">'+'<div><span>Single train now</span><strong>+'+fmt(tEs(p))+'</strong><small>'+p.cost+' E at current happiness</small></div>'+'<div><span>Next 24 h</span><strong>+'+fmt(d.gain)+'</strong><small>'+fmt(d.energy)+' E · '+cash(d.cost)+'</small></div>'+'<div><span>Next 7 days</span><strong>+'+fmt(w.gain)+'</strong><small>'+fmt(w.energy)+' E · '+cash(w.cost)+'</small></div></div>'+'<p class="sub">'+esc(x.note)+'</p><button data-act="choose" data-val="'+esc(x.method)+'">View schedule</button>');}return html;}function scheduleDays(events){const days={};for(const e of events){const d=day(e.t),x=days[d]||(days[d]={n:0,q:0,g:0,c:0});if(e.kind==="TRAIN"){x.n++;x.q+=e.q||0;x.g+=e.g||0}x.c+=e.spent||0}return card("7-day action overview",'<p class="sub">Planned only. Boundary dates may be partial.</p>'+En(days).map(([d,x])=>'<div class="row"><b>'+d+'</b><small>'+x.n+' trains · '+fmt(x.q)+' E · +'+fmt(x.g)+' '+esc(cfg.stat)+' · '+cash(x.c)+' extra</small></div>').join(''));}function plan(){if(reportedOverdose())return overdoseRecoveryCard()+card("Schedule paused","The old drug, refill and gym schedule is not safe to follow after a reported overdose. Refresh and clear the recovery hold to rebuild it.");const p=aPl(),hours=+cfg.horizon===168?168:24;let html=controls("Time window",St(hours),[["24","24 hours"],["168","7 days"]],"horizon");if(!p)return html+(rc?.pending?aFl(null):"")+card("No forecast","Refresh your current Torn data first.");if(p.method.startsWith("happy")&&p.jumps===0){const kit=jumpKit(p.method);return html+card("Jump cannot be scheduled",'<p>Item prices missing or the complete kit exceeds your budget.</p><p>Kit: '+(Fi(kit.total)?cash(kit.total):"Price unavailable")+' · Weekly budget: '+cash(cfg.budget)+'</p><button data-act="tab" data-val="supplies">See supplies</button>');}html+=aFl(p);const summaryNow=summary(p,hours,Tm()/1000);html+=card("Totals in this "+(hours===24?"24-hour":"7-day")+" window",'<div class="metric-grid"><div><span>Stat gain</span><strong>+'+fmt(summaryNow.gain)+'</strong><small>'+esc(cfg.stat)+'</small></div><div><span>Energy trained</span><strong>'+fmt(summaryNow.energy)+' E</strong><small>'+summaryNow.trains+' train actions</small></div>'+'<div><span>Estimated spend</span><strong>'+cash(summaryNow.cost)+'</strong><small>'+summaryNow.xanax+' Xanax · '+summaryNow.refills+' refills</small></div></div>'+'<p class="sub">'+esc(p.note)+' · Manual actions; totals match period.</p>');html+=card("Predicted energy lost at cap",'<div class="metric-grid"><div><span>Total overflow</span><strong>'+fmt(summaryNow.lost)+' E</strong></div>'+'<div><span>While asleep</span><strong>'+fmt(summaryNow.sleepLost)+' E</strong></div></div><p class="sub">Quiet: '+esc(sleepLabel())+'. Totals match the selected period.</p>');if(hours===168)html+=scheduleDays(summaryNow.events);if(!summaryNow.events.length)return html+card("No planned actions","Jump may exceed 24h; try 7 days.");let dayKey="",count=0;for(const ev of summaryNow.events){if(count++>=120)break;const date=day(ev.t);if(date!==dayKey){dayKey=date;html+='<h3 class="day-header">'+date+' UTC</h3>'}html+='<div class="timeline-row"><span>'+cu(ev.t)+'</span><b>'+esc(ev.kind)+'</b><span>'+esc(ev.detail)+'</span>'+(ev.spent?'<small>'+cash(ev.spent)+' estimated cost</small>':'')+'</div>';}if(summaryNow.events.length>120)html+='<p class="sub">Showing 120 of '+summaryNow.events.length+' planned actions. The totals above include every action.</p>';return html;}function gymTip(){const g=gym(),all=data.gyms?.gyms||[],k=cfg.stat,b=stats(),e=energy().maximum||150,h=happy().maximum||5000;if(!g)return "";const current=sGa(g,k,e,h,b),best=all.filter(x=>x.id!==g.id&&["owned","buy"].includes(vr[x.id])&&gEl(x,b)).map(x=>({x,p:current>0?100*(sGa(x,k,e,h,b)/current-1):0})).filter(x=>Fi(x.p)&&x.p>1).sort((a,b)=>b.p-a.p)[0];return best?card("Better gym available",'<p><b>'+esc(best.x.name)+'</b> · +'+best.p.toFixed(1)+'% predicted gains per same energy.</p><p class="sub">'+(vr[best.x.id]==="owned"?'Membership previously confirmed.':'Membership purchase may be needed.')+' Verify access in Torn.</p><button data-act="tab" data-val="gyms">Compare gyms</button>'):""}
function gyms(){const g=gym(),all=data.gyms?.gyms||[],k=cfg.stat,b=stats(),e=energy().maximum||150,h=happy().maximum||5000,known=all.filter(x=>["owned","buy"].includes(vr[x.id]));let html=g?card("Current gym",esc(g.name)+" · "+gymDots(g.modifiers?.[k]).toFixed(1)+" dots "+esc(k)):card("Gym unavailable","Refresh first.");const baseline=g?sGa(g,k,e,h,b):0,better=known.filter(x=>x.id!==g?.id&&gEl(x,b)).map(x=>({gym:x,p:baseline>0?100*(sGa(x,k,e,h,b)/baseline-1):0})).filter(x=>Fi(x.p)&&x.p>0.1).sort((x,y)=>y.p-x.p);html+=card("Accessible gym comparison",better.length?better.map(x=>'<p><b>'+esc(x.gym.name)+'</b> · +'+x.p.toFixed(1)+'% estimated gains per same energy · '+(vr[x.gym.id]==="buy"?'Unlocked; membership not purchased':'Membership confirmed')+'</p>').join(""):'<p class="sub">'+(known.length?'No better gym among '+known.length+' verified accessible option(s).':'No alternative gyms verified yet; this does not mean the current gym is optimal.')+'</p>');if(!all.length)return html;const onGym=/\/gym\.php$/.test(location.pathname||"");if(!onGym)return html+card("Gym access","Open Torn Gym to verify access; locked gyms are never recommended.");const select=all.filter(x=>x.id!==g?.id).sort((x,y)=>St(x.name).localeCompare(St(y.name)));html+=card("One-time gym access verification",'<p class="sub">Torn does not expose your full membership list through the current gym API. Select only a gym you can actually access; locked gyms stay excluded.</p><select id="hhj-gymlist">'+select.map(x=>'<option value="'+x.id+'">'+esc(x.name)+(vr[x.id]?' ['+(vr[x.id]==="owned"?'owned':'unbought')+']':'')+'</option>').join("")+'</select><button data-act="gym-owned">Membership owned</button><button data-act="gym-buy">Unlocked, not bought</button><button data-act="gym-clear">Remove verification</button>');return html;}function bookAssessment(stat=cfg.stat){const values=stats(),active=Ar(data.perks?.perks?.book_perks)?data.perks.perks.book_perks:[],rows=Ar(data.books)?data.books:[],defs=[[744,"strength","Brawn Over Brains"],[745,"speed","Time Is In The Mind"],[746,"defense","Keeping Your Face Handsome"],[747,"dexterity","A Job For Your Hands"],[757,null,"Get Hard Or Go Home"],[758,"strength","Gym Grunting - Shouting To Success"],[759,"defense","Self Defense In The Workplace"],[760,"speed","Speed 3 - The Rejected Script"],[761,"dexterity","Limbo Lovers 101"],[784,null,"Ugly Energy"]],p=loadInput(),weekly=p?simulate("xanax",p,168).gain:0;
return defs.filter(b=>b[1]===null||b[1]===stat).flatMap(b=>rows.filter(x=>Nu(x.id)===b[0]&&Nu(x.amount)>0&&!x.faction_owned).map(x=>{const explicitYes=x.usable===true||x.is_usable===true,explicitNo=x.usable===false||x.is_usable===false||x.used===true||x.is_used===true||St(x.status).toLowerCase()==="used",usable=explicitNo?"used":explicitYes?"verified":"unverified",focus=b[1],current=values[focus]||0,ending=current+weekly*31/7,flat=b[0]>=744&&b[0]<=747,ready=flat&&current>=200000000&&usable==="verified"&&Ar(data.perks?.perks?.book_perks)&&!active.length,reason=flat?(ready?"At 200m or above; full +10m reward applies at the end of 31 days.":ending>=200000000?"Potential full +10m reward at the end of 31 days if training stays on track.":"Save for the 200m completion threshold; projected final stat "+fmt(ending)+"."):(b[0]>=757&&b[0]<=761?"Reserve for a well-prepared 31-day high-output training period.":"Reserve for an intensive 31-day Energy/refill period.");return {id:b[0],stat:focus,name:b[2],usable,ready,reason,ending,current};}));}
function educationOpportunities(stat=cfg.stat){const user=data.education,raw=data.educationCatalog?.education;if(!Ar(user?.education_completed)||!raw||typeof raw!=="object")return null;const completed=new Set(user.education_completed.map(Nu)),courses=En(raw).map(([id,v])=>({...v,id:Nu(id)})),byId=new Map(courses.map(x=>[x.id,x])),codes={strength:"SPT2440",speed:"SPT2450",defense:"SPT2460",dexterity:"SPT2470"},current=Nu(user.education_current);
return [codes[stat],"SPT3510"].map((code,i)=>{const course=courses.find(x=>St(x.code).toUpperCase()===code);if(!course||completed.has(course.id))return null;const missing=(Ar(course.prerequisites)?course.prerequisites:[]).map(Nu).filter(x=>!completed.has(x)),next=missing.length?byId.get(missing[0]):course;return {code,course,next,blocked:missing.length>0,ready:missing.length===0&&current===0,ongoing:current>0,description:code==="SPT3510"?"Permanent +1% gym gains for every stat":"Permanent +1% "+stat+" gym gains",priority:i===0?100:80};}).filter(Boolean);}
function enhancerRows(){const offers=data.enhancerOffers,names={strength:"Dumbbells",defense:"Boxing Gloves",speed:"Skateboard",dexterity:"Parachute"},ids={strength:331,defense:330,speed:329,dexterity:106},v=stats();return ST.map(stat=>{const rows=offers?.[stat]||[],price=rows.reduce((n,x)=>x.price>0?Mn(n,x.price):n,Infinity),gain=Mn(5e12,v[stat]*.01),valid=Fi(price)&&data.priceUpdated>0&&Tm()-data.priceUpdated<=15*60000?price:null;return {stat,name:names[stat],id:ids[stat],price:valid,gain,costPerStat:valid&&gain>0?valid/gain:null};});}
function opportunityList(){const k=cfg.stat,edu=educationOpportunities(k),books=bookAssessment(k),row=enhancerRows().find(x=>x.stat===k),perks=perkRows(),o=[];if(edu?.length){const x=edu[0];o.push({kind:"education",priority:x.ready?100:x.blocked?65:50,title:x.ready?"Start "+x.course.name:x.blocked?"Unlock "+x.course.name:"Education in progress",detail:x.description+(x.blocked?" · next prerequisite "+St(x.next?.name||"unknown"):"")+(x.ongoing?" · wait for current course to finish":"")});}for(const x of books)if(x.ready)o.push({kind:"book",priority:115,title:"Owned book ready: "+x.name,detail:x.reason});if(data.perks?.perks){if(!perks.some(x=>/faction/i.test(x.type)&&/gym gains/i.test(x.description)&&new RegExp(k,"i").test(x.description)))o.push({kind:"faction",priority:24,title:"Potential Steadfast faction bonus",detail:"Ask faction leadership whether a "+k+" gym-gain bonus could be unlocked. Not counted until active."});if(!perks.some(x=>/job|company/i.test(x.type)&&/gym gains/i.test(x.description)))o.push({kind:"company",priority:15,title:"Potential Fitness Center 10-star perk",detail:"+3% gym gains at 10 stars, if your employment qualifies. An unlock possibility, not an active bonus."});}if(row?.price&&row.gain>0)o.push({kind:"enhancer",priority:stats()[k]>=100000000?26:5,title:"Optional "+row.name+" at "+cash(row.price),detail:"+"+fmt(row.gain)+" "+k+" (1%); "+cash(row.costPerStat)+" per stat point. Six hours booster cooldown; market offer can change."});return o.sort((a,b)=>b.priority-a.priority);}
function trainingAudit(){const k=cfg.stat,edu=educationOpportunities(k),books=bookAssessment(k),items=enhancerRows(),opps=opportunityList(),best=opps[0],relevant=perkRows().filter(x=>/education|faction|job|company/i.test(x.type)&&/gym|training|energy/i.test(x.description));let out=card("Most worthwhile next improvement",best?'<p><b>'+esc(best.title)+'</b></p><p>'+esc(best.detail)+'</p>':"No verified immediate training improvement identified.");out+=card("Education for "+esc(k),edu===null?"Education progress or course catalogue unavailable.":edu.length?edu.map(x=>'<p><b>'+esc(x.course.name)+'</b> · '+esc(x.description)+'<br><span class="sub">'+(x.ready?"All prerequisites complete; course can be started.":x.blocked?"Next prerequisite: "+esc(x.next?.name||"Unknown"):"Another education is already running.")+'</span></p>').join(""):"Relevant Sports Science gym-gain courses complete.");out+=card("Owned books and ideal timing",!Ar(data.books)?"Book inventory unavailable: no use recommendation.":books.length?books.map(x=>'<p><b>'+esc(x.name)+'</b> · '+(x.usable==="verified"?"Usability confirmed":x.usable==="used"?"Already used / unusable":"Usability unverified")+'<br><span class="sub">'+esc(x.reason)+'</span></p>').join(""):"No matching owned books detected. Non-owned books are not recommended.")+'<p class="sub">The permanent 5% stat books have a maximum +10m gain after 31 days, reached at 200m stat on completion. Used book copies can remain in inventory.</p>';out+=card("Live stat enhancer prices",items.map(x=>'<p><b>'+esc(x.name)+'</b> · '+esc(x.stat)+' · '+(x.price?cash(x.price):"No recent listing verified")+'<br>+ '+fmt(x.gain)+' stat · '+(x.costPerStat?cash(x.costPerStat)+" per stat point":"Live comparison unavailable")+'</p>').join("")+'<p class="sub">Lowest returned item-market listing at last full refresh '+(data.priceUpdated?new Date(data.priceUpdated).toLocaleTimeString("en-GB"):"unknown")+'. Prices may change or sell out. Six hours booster cooldown per enhancer.</p>');out+='<details><summary>Potential company and faction unlocks · active perks</summary>'+card("Possible unlocks",opps.filter(x=>x.kind==="faction"||x.kind==="company").map(x=>'<p><b>'+esc(x.title)+'</b> · '+esc(x.detail)+'</p>').join("")||"No possible unlock inferred.")+card("Currently active",relevant.length?relevant.map(x=>'<p>'+esc(x.type)+': '+esc(x.description)+'</p>').join(""):"No relevant active training perks returned.")+'</details>';return out;}
function perks(){return trainingAudit()}
function checkpoint(st){const now=Tm()/1000;if(!ST.every(k=>Fi(st[k])&&st[k]>0))return false;if(rg&&rg.t<=now&&now-rg.t<=7*86400&&rg.s){const delta=Fr(ST.map(k=>[k,st[k]-(Nu(rg.s[k])||0)]));if(now-rg.t<30&&!ST.some(k=>Ab(delta[k])>.000001))return false;const expected=(rg.events||[]).filter(x=>x.t>=rg.t&&x.t<=now).reduce((n,x)=>n+(x.g||0),0);const changed=ST.filter(k=>delta[k]>0),stat=changed.length===1?changed[0]:rg.stat;const single=Nu(rg.single?.[stat]),n=single>0?Ro(delta[stat]/single):0;const consistent=changed.length===1&&rg.gymId===gym()?.id&&n>=1&&n<=20&&
Ab(delta[stat]/n-single)/single<=0.12;ledger.push({t:now,from:rg.t,stat,forecastStat:rg.stat,observed:delta,expected,method:rg.method,single:single>0?single:null,inferred:consistent?n:null});ledger=ledger.filter(x=>now-x.t<30*86400).slice(-120);put("verification",ledger);}rg={t:now,s:st,stat:cfg.stat,method:"none",events:[]};return true;}let lastActionTap=0;function actDone(e){const t=e.t;if(e.kind==="TRAIN")return al.some(x=>x.stat===cfg.stat&&Ab(x.t-t)<=600);if(e.kind==="REFILL")return acts.some(x=>x.kind==="REFILL"&&day(x.t)===day(t))||day(t)===day(Tm()/1000)&&refill()==="used";if(e.kind==="XANAX")return acts.some(x=>x.kind==="XANAX"&&Ab(x.t-t)<=1800);if(e.kind==="JUMP")return acts.some(x=>x.kind==="ECSTASY"&&Ab(x.t-t)<=900)&&al.some(x=>x.t>=t-900&&x.t<=t+1800);return false}async function scanActions(){
 const now=Fl(Tm()/1000);if(now-actChecked<90)return;
 const origin="/user/log?log=2290,4900&from="+(now-172800)+"&limit=100",seen=new Set();
 let path=origin,pages=0,truncated=false;
 try{
  while(path&&pages<4){
   if(seen.has(path))throw Error("Repeated activity cursor");seen.add(path);
   const r=await api(path),rows=r.log;if(!Ar(rows))throw Error("Activity log unavailable");
   pages++;
   for(const x of rows){
    const id=Nu(x.details?.id),title=St(x.details?.title||"").toLowerCase();
    const kind=id===4900&&title.includes("energy refill")?"REFILL":id===2290&&title.includes("xanax")?"XANAX":id===2290&&title.includes("ecstasy")?"ECSTASY":null;
    if(kind&&Nu(x.timestamp)>0&&!acts.some(y=>y.id===St(x.id)))acts.push({id:St(x.id),t:Nu(x.timestamp),kind});
   }
   const link=r._metadata?.links?.next;
   if(!link||!rows.length){path=null;break}
   const u=new URL(link,BASE);
   if(u.origin!=="https://api.torn.com"||u.pathname!=="/v2/user/log")throw Error("Invalid activity cursor");
   path=u.pathname.slice(3)+u.search;
  }
  truncated=!!path;acts=acts.filter(x=>x.t>now-604800).sort((a,b)=>a.t-b.t).slice(-150);put("verified-actions",acts);
  actChecked=now;
  activityCoverage=truncated?"Partial ("+pages+" pages; older actions not verified)":"Read "+pages+" page(s) at "+cu(now);
 }catch(e){activityCoverage="Unavailable: "+St(e.message).slice(0,65);errs.push("Activity: "+St(e.message).slice(0,45))}
}
function aFl(p){const now=Tm()/1000,last=[...al].sort((a,b)=>b.t-a.t)[0],latest=[...acts].sort((a,b)=>b.t-a.t)[0],queue=(p?.events||[]).filter(x=>x.t>=now&&!slp(x.t)&&!actDone(x)),next=queue[0],after=queue[1];let h=last?'<p><b>Latest gym training:</b> +'+fmt(last.amount)+' '+esc(last.stat)+' · '+cu(last.t)+'</p>':'<p>No confirmed gym training yet.</p>';if(latest)h+='<p><b>Confirmed '+esc(latest.kind)+':</b> '+cu(latest.t)+'</p>';h+='<p><b>Daily refill:</b> '+(refill()==="used"?'Used':refill()==="ready"?'Available':'Unknown')+'</p><p class="sub">Activity sync: '+esc(activityCoverage)+'</p>';h+=next?'<p><b>Next:</b> '+esc(next.kind)+' · '+cu(next.t)+' ('+eta(next.t)+')</p><p>'+esc(next.detail)+'</p>'+(after?'<p><b>Then:</b> '+esc(after.kind)+' · '+cu(after.t)+'</p>':''):'<p>No upcoming forecast actions.</p>';return card("Verified activity → Next action",h+'<p class="sub">Automatic read-only detection. Unverified actions are not marked complete.</p>')}
function gCh(){const k=cfg.stat,now=Fl(Tm()/1000),days=Array.from({length:7},(_,i)=>day(now-(6-i)*86400)),rows=days.map(d=>{const a=al.filter(x=>x.stat===k&&day(x.t)===d);return {d,n:a.length,g:a.reduce((n,x)=>n+x.amount,0),tr:a.reduce((n,x)=>n+(x.trains||0),0),e:a.reduce((n,x)=>n+(x.energy||0),0)}}),view=sp?rows:rows.filter(x=>x.n),max=Mx(1,...view.map(x=>x.g));let h='<div class="row"><b>Show days without recorded gains</b><button data-act="partial">'+(sp?"ON":"OFF")+'</button></div><p class="sub">Torn gym logs by UTC date; no record does not prove zero gains.</p>';h+=view.length?view.map(x=>'<div style="margin:12px 0"><div class="row"><b>'+esc(x.d.slice(5))+'</b><strong>'+(x.n?'+'+fmt(x.g):'—')+'</strong></div><div style="height:11px;background:#0c2232;border-radius:7px;overflow:hidden"><div style="height:100%;width:'+(100*x.g/max).toFixed(1)+'%;background:#4bdecb"></div></div><small>'+(x.n?x.n+' sessions · '+x.tr+' trains · '+x.e+' E':'No gym record')+'</small></div>').join(""):'No saved gym gains for the selected days.';return card("7-day "+esc(k)+" · verified gym gains",h)}
function readLog(r){const d=r?.data||{},v=d.result&&typeof d.result==="object"?d.result:d,t=Nu(r?.timestamp),matched=ST.filter(k=>Nu(St(v[k+"_increased"]??"").replace(/,/g,""))>0),k=matched.length>1?null:matched[0]||ST.find(x=>x===St(v.stat||v.stat_name||v.attribute||v.stat_type||d.stat||"").toLowerCase().replace("defence","defense")),raw=matched.length===1?v[k+"_increased"]:(v.stat_gain??v.gain??v.gained??v.stats_gained??v.increased_by??d.stat_gain),n=Nu(St(raw??"").replace(/,/g,""));return k&&Fi(n)&&n>0&&Fi(t)&&t>0?{id:St(r.id||r.uuid||t+":"+k+":"+n),t,stat:k,amount:n,trains:Nu(v.trains)||0,energy:Nu(v.energy_used)||0,gym:St(v.gym||'')}:null}
async function scanGym(force=false){const now=Fl(Tm()/1000);if(!force&&now-lc<60)return;const ids=new Set(al.map(x=>St(x.id))),summary=[];let added=0,parsed=0,unknown=0,fields="";try{for(const [label,filter] of [["5301","log=5301"],["Gym category","cat=125"],["sample",""]]){let path="/user/log?limit=100&from="+(now-1209600)+(filter?"&"+filter:"")+"&timestamp="+now,count=0;for(let page=0;path&&page<(label==="sample"?1:4);page++){const res=await api(path),rows=res.log;if(!Ar(rows))throw Error("Unexpected log format");count+=rows.length;for(const x of rows){if(label==="sample"&&Nu(x.details?.id)!==5301)continue;const y=readLog(x);if(y){parsed++;if(!ids.has(y.id)){al.push(y);ids.add(y.id);added++}else{const old=al.find(z=>z.id===y.id);if(old&&!old.gym&&y.gym)old.gym=y.gym}}else {unknown++;if(!fields)fields=Object.keys(x.data||{}).slice(0,8).join(",")}}const link=res._metadata?.links?.next;if(!link)break;const u=new URL(link,BASE);if(u.origin!=="https://api.torn.com"||u.pathname!=="/v2/user/log")throw Error("Invalid log page");path=u.pathname.slice(3)+u.search;if(!rows.length)break}summary.push(label+":"+count);if(parsed||label==="sample")break}al=al.filter(x=>x.t>=now-7776000).sort((a,b)=>b.t-a.t).slice(0,900);put("gym-api-logs",al);if(!busy&&loadInput())lp=plans();lc=now;put("gym-log-checked-13",now);ls=summary.join(" · ")+" · "+added+" new"+(unknown?" · "+unknown+" without stat data"+(fields?" ("+fields+")":""):"")}catch(e){ls="Log scan failed: "+St(e.message).slice(0,85)}draw()}
function mCard(p){const x=cMet(p);if(!x)return "";return card("Measured training & calibration",x.n>=3?'<div class="metric-grid"><div><span>Typical logged train</span><strong>+'+fmt(x.typical)+'</strong></div><div><span>Model unadjusted</span><strong>+'+fmt(x.raw)+'</strong></div></div><p class="sub">'+(x.ready?'Automatic ×'+x.factor.toFixed(2)+' adjustment to regular forecasts.':'Not yet calibrated: need 6 consistent comparable sessions.')+' · '+(x.kept||0)+'/'+x.n+' samples at '+p.cost+' E/train. Boosted entries excluded.</p>':'<p class="sub">Need 3 sessions at '+p.cost+' E/train.</p>')}
function cgCard(){const now=Fl(Tm()/1000),rows=al.filter(x=>x.stat===cfg.stat),sum=a=>fmt(a.reduce((n,x)=>n+x.amount,0));return card("Gym logs",(rows.length?'<p><b>Today:</b> +'+sum(rows.filter(x=>day(x.t)===day(now)))+' · <b>7 days:</b> +'+sum(rows.filter(x=>x.t>=now-604800))+'</p>':'<p>No verified gym entries yet.</p>')+'<details><summary>Scan diagnostics</summary><p class="sub">'+esc(ls)+'</p></details><button data-act="scan-logs">↻ Scan logs</button>'+rows.slice(0,6).map(x=>'<p>+'+fmt(x.amount)+' '+esc(x.stat)+(x.trains?' · '+x.trains+' trains':'')+' · '+cu(x.t)+'</p>').join("")+'<p class="sub">Log totals kept separate from API gains.</p>')}function fCard(){const k=cfg.stat,t=Tm()/1000,rows=ledger.filter(x=>x.t>=t-604800&&x.forecastStat===k&&x.expected>0&&x.observed?.[k]>0&&x.from&&x.t-x.from<=7200&&!x.method?.startsWith("happy")),a=rows.reduce((n,x)=>n+x.observed[k],0),e=rows.reduce((n,x)=>n+x.expected,0);return card("7-day schedule vs observed · partial",rows.length>=3?'<p><b>'+Mx(0,100-100*Ab(a-e)/Mx(a,e)).toFixed(1)+'% alignment</b> across '+rows.length+' selected API intervals.</p><p>Planned +'+fmt(e)+' · Observed +'+fmt(a)+'</p><p class="sub">Not model accuracy. Training outside the plan and incomplete observations affect this score; missing and zero-gain intervals are not included.</p>':'<p class="sub">Fewer than 3 matching intervals. There is not enough evidence for a schedule comparison.</p>')}
function pLg(){const k=cfg.stat,now=Tm()/1000,first=hs.find(x=>x.d===day(now))?.s?.[k],latest=[...ledger].reverse().find(x=>x.observed?.[k]>0);return aFl(aPl())+card("Current "+esc(k)+" stat",'<p><b>'+fmt(stats()[k])+'</b></p>'+(first?'<p class="sub">Since first API check: +'+fmt(stats()[k]-first)+'</p>':''))+cgCard()+mCard(loadInput())+gCh()+fCard()+'<details><summary>Advanced · partial API snapshots</summary>'+card("Snapshot diagnostics",'<p class="sub">'+ledger.length+' locally saved checks. These overlap with gym logs and are not added to actual gains.</p>'+(latest?'<p>Last snapshot gain: +'+fmt(latest.observed[k])+' · '+cu(latest.t)+'</p>':'')+'<button data-act="clearverification">Clear snapshot history</button>')+'</details>'}
function boostCard(){const p=loadInput(),x=cMet(p),now=Tm()/1000;if(!x?.typical)return "";const n=al.filter(y=>y.stat===cfg.stat&&y.trains>0&&y.t>=now-604800&&Ab(y.energy/y.trains-p.cost)<.5&&y.amount/y.trains>x.typical*1.8).length;return card("Potential boosted / Happy Jump gains",'<p>'+n+' unusually high-gain sessions in 7 days.</p><p class="sub">Boosts may be Happy Jumps; only Ecstasy + nearby gym training provides supporting evidence. Excluded from normal calibration.</p>')}

function trainingRecordsV024(){
 const t=Tm()/1000,all=(Ar(al)?al:[]).filter(x=>ST.includes(x.stat)&&Fi(x.amount)&&x.amount>0&&Fi(x.t)&&x.t<=t+60&&x.t>=t-30*86400);
 const own=all.filter(x=>x.stat===cfg.stat).sort((a,b)=>b.amount-a.amount),weekly=own.filter(x=>x.t>=t-604800);
 const bestPerTrain=own.filter(x=>x.trains>0).sort((a,b)=>b.amount/b.trains-a.amount/a.trains)[0];
 const sum=weekly.reduce((n,x)=>n+x.amount,0),days=new Set(all.filter(x=>x.t>=t-14*86400).map(x=>day(x.t)));
 let streak=0,cursor=day(t);if(!days.has(cursor))cursor=day(t-86400);
 for(let i=0;i<14&&days.has(cursor);i++){streak++;cursor=day(Date.parse(cursor+'T00:00:00Z')/1000-86400)}
 if(!all.length)return card("Training Records · your personal bests",'<p>No parsed gym-gain logs available yet. Scan Torn gym logs to unlock a verified leaderboard; old records may not be available from the API.</p><button data-act="scan-logs">Scan gym logs</button>');
 let h='<div class="metric-grid"><div><span>Logged '+esc(cfg.stat)+' gains · 7d</span><strong>+'+fmt(sum)+'</strong></div>'+
 '<div><span>Biggest logged session</span><strong>'+(own.length?'+'+fmt(own[0].amount):'—')+'</strong></div>'+
 '<div><span>Best logged gain / train</span><strong>'+(bestPerTrain?'+'+fmt(bestPerTrain.amount/bestPerTrain.trains):'Unknown')+'</strong></div>'+
 '<div><span>Observed active-day chain</span><strong>'+streak+' days</strong></div></div>'+
 '<p class="sub">Personal bests use parsed Torn gym log entries available locally (up to 30 days). A session may include multiple trains or a Happy Jump. Missing logs mean the chain may be understated.</p>'+
 '<h3>Four-stat leaderboard</h3>';
 for(const k of ST){
  const rows=all.filter(x=>x.stat===k).sort((a,b)=>b.amount-a.amount);
  const seven=rows.filter(x=>x.t>=t-604800).reduce((n,x)=>n+x.amount,0);
  h+='<div class="row"><span><b>'+esc(k)+'</b> · 7d +'+fmt(seven)+' · record '+(rows.length?'+'+fmt(rows[0].amount):'not recorded')+'</span>'+
     '<button data-act="stat" data-val="'+esc(k)+'">'+(k===cfg.stat?'Focused':'Focus')+'</button></div>';
 }
 h+='<p class="sub">Logged gym gains are kept separate from net battle-stat snapshots; they are never double counted. Best per train is shown only when Torn reports a train count.</p>'+
 '<div class="row"><button data-act="scan-logs">Refresh records</button><button data-act="tab" data-val="compare">Compare next training</button></div>';
 return card("Training Records · your personal bests",h);
}

function progress(){const st=stats(),regular=(lp||[]).filter(x=>!x.method.startsWith("happy")&&x.affordable)
.sort((a,b)=>b.gain-a.gain)[0];return autoSignalCardV0260()+pLg()+trainingRecordsV024()+statSampleCard()+progressionRoadmapV18()+boostCard()+card("Base battle stats",ST.map(k=>"<div class='row'><span>"+esc(k)+"</span><b>"+fmt(st[k])+"</b></div>").join(""))+card("Long-term targets · regular training only",regular?projection(st[cfg.stat],regular.gain).map(x=>
"<div class='row'><b>"+fmt(x.goal)+"</b><span>"+(x.weeks===null?"Outside model":x.weeks+" weeks")+"</span></div>").join("")+"<p class='sub'>Repeatable regular plan only; Happy jumps are not repeated.</p>":
"No budget-feasible repeating plan available.")+'<button data-act="clearhistory">Clear local history</button>';}function targetWeeks(s,g,goal=50000000){if(!(g>0)||!(s>0))return null;let v=s;for(let i=0;i<5200;i++){if(v>=goal)return i;const step=g*(1+Mx(0,v-s)*.00000002);if(!(step>0))return null;if(v+step>=goal)return i+(goal-v)/step;v+=step}return null}
function propertyContext(){const r=data.property?.property,c=data.propertyCatalog?.properties;if(!r||!Ar(c))return null;const type=r.property||{},base=c.find(x=>x.id===type.id||St(x.name).toLowerCase()===St(type.name||"").toLowerCase());return {name:St(type.name||base?.name||"Property"),happy:Nu(r.happy),mods:Ar(r.modifications)?r.modifications:[],staff:Ar(r.staff)?r.staff:[],base,known:!!base}}
function propertyOptions(p,context,method,factor){if(!context?.known)return [];const existing=new Set(context.mods),available=new Set(context.base.modifications||[]),regular=simulate(method,{...p,happy:p.maxH,_factor:factor},168),baseWeeks=targetWeeks(p.value,regular.gain),grades=[["Small Pool",100,35000],["Medium Pool",125,100000],["Large Pool",150,500000]],vaults=[["Small Vault",50,20000000],["Medium Vault",75,42000000],["Large Vault",100,98000000],["Extra Large Vault",125,215000000]],list=[["Open Bar",50,9000],["Hot Tub",25,17000],["Sauna",25,12000],["Advanced Shooting Range",50,250000],["Medical Facility",50,17000000],["Airstrip",250,75000000],["Private Yacht",500,895000000]],best=rows=>rows.reduce((m,x)=>existing.has(x[0])?Mx(m,x[1]):m,0),add=(name,gain,cost)=>{if(gain<=0||!available.has(name)||existing.has(name)||!(cost>0))return;const run=simulate(method,{...p,happy:p.maxH+gain,maxH:p.maxH+gain,_factor:factor},168),change=run.gain-regular.gain;if(!(change>0))return;const weeks=targetWeeks(p.value,run.gain);listResults.push({name,gain,cost,change,days:weeks!==null&&baseWeeks!==null?(baseWeeks-weeks)*7:null,roi:change/cost*1000000})},listResults=[];for(const [name,gain,cost] of list)add(name,gain,cost);const homeCost=Nu(context.base.cost)||(/private island/i.test(context.name)?500000000:0),homeHappy=Nu(context.base.happy)||(/private island/i.test(context.name)?2000:0),interiors=[["Sufficient Interior Modification",.25,.25],["Superior Interior Modification",.5,.5]],installedInterior=interiors.reduce((n,x)=>existing.has(x[0])?Mx(n,x[1]*homeHappy):n,0);if(homeCost>0&&homeHappy>0)for(const [name,ratio,priceRatio] of interiors)add(name,homeHappy*ratio-installedInterior,homeCost*priceRatio);for(const [name,value,cost] of grades)add(name,value-best(grades),cost);for(const [name,value,cost] of vaults)add(name,value-best(vaults),cost);return listResults.sort((a,b)=>b.roi-a.roi)}
function minimumPath(p,ctx,method,factor,target){if(!ctx?.known)return null;const delta=Ce(target-p.maxH);if(delta<=0)return {cost:0,names:[],gain:0};const choices=propertyOptions(p,ctx,method,factor),groups={};for(const x of choices){const group=/ Interior Modification$/.test(x.name)?"interior":/ Pool$/.test(x.name)?"pool":/ Vault$/.test(x.name)?"vault":x.name;(groups[group]??=[]).push(x)}let dp=new Map([[0,{cost:0,names:[],gain:0}]]);for(const opts of Object.values(groups)){const next=new Map(dp);for(const [have,state] of dp)for(const x of opts){const g=Mn(delta,have+Ce(x.gain)),cost=state.cost+x.cost;if(cost<(next.get(g)?.cost??Infinity))next.set(g,{cost,names:state.names.concat(x.name),gain:state.gain+x.gain})}dp=next}return dp.get(delta)||null}
function propertyCard(p,method,factor){const ctx=propertyContext();if(!ctx)return card("Live property status",'<p>Property details not available yet. Refresh to read the current home and Torn upgrade catalogue.</p><p class="sub">No upgrades ranked without confirmed property details.</p>');const rows=propertyOptions(p,ctx,method,factor),staff=ctx.staff.map(x=>St(x.type)+' ×'+fmt(x.amount)).join(", "),detail='<p><b>'+esc(ctx.name)+'</b> · property Happy '+fmt(ctx.happy)+' · live maximum '+fmt(p.maxH)+'</p><p class="sub">Installed: '+(ctx.mods.length?ctx.mods.map(esc).join(", "):"None recorded")+'. Staff: '+esc(staff||"None recorded")+'.</p>';const ranked=rows.length?rows.slice(0,8).map((x,i)=>'<p><b>'+(i+1)+'. '+esc(x.name)+'</b> · +'+fmt(x.gain)+' Happy · '+cash(x.cost)+'<br><strong>+'+fmt(x.change)+' '+esc(p.stat)+'/week</strong> · +'+x.roi.toFixed(1)+' per $1m · '+(x.days===null?'timeline unknown':x.days.toFixed(1)+' days saved to 50m')+'</p>').join(""):'<p>No eligible uninstalled upgrade with a verified cost and positive training benefit found.</p>';return card("Current property and upgrade ranking",detail+'<details><summary>Rank upgrades by extra '+esc(p.stat)+' per $1m</summary>'+ranked+'<p class="sub">Catalogue-restricted upgrades only. Fixed estate-agency upgrade prices are indicative and may change. Prices are paid in full when replacing a lower tier. These comparisons exclude staff pay, upkeep, renting, and changing property; check purchase availability in Torn.</p></details>')}
function lab(){const p=loadInput();if(!p)return card("Upgrade lab","Refresh live data first.");const t=Tm()/1000,focus=p.stat,goal=50000000,method=cfg.mode==="happy"?"natural":cfg.mode==="training"?"xanax":"natural",targets=[3475,4500,5000,5025],factor=cFactor(p),baseline=simulate(method,{...p,happy:p.maxH,_factor:factor},168),baseProj=targetWeeks(p.value,baseline.gain),chosen=+get("lab-happy",5025)||5025,adjust=Mn(99999,Mx(100,chosen)),candidate=simulate(method,{...p,maxH:adjust,happy:adjust,_factor:factor},168),weeks=targetWeeks(p.value,candidate.gain),delta=candidate.gain-baseline.gain,price=+get("lab-property-cost",0)||0,path=minimumPath(p,propertyContext(),method,factor,adjust),canE=+get("lab-can-energy",25)||25,cans=Mn(12,Mx(0,+get("lab-cans-per-day",0)||0)),canMult=Mn(6,Mx(1,+get("lab-can-mult",1)||1)),canPrice=+get("lab-can-price",0)||0,canScenario=simulate(method,{...p,_factor:factor,_canScenario:{perDay:cans,baseE:canE,mult:canMult}},168),used=canScenario.canCount||0,extra=canScenario.canAdded||0,extraGain=canScenario.gain-simulate(method,{...p,_factor:factor},168).gain,canCost=canPrice*used,extraTrained=canScenario.energy-simulate(method,{...p,_factor:factor},168).energy,canWeeks=targetWeeks(p.value,canScenario.gain);let h=card("Target: 50m "+esc(focus),'<div class="metric-grid"><div><span>Current stat</span><strong>'+fmt(p.value)+'</strong></div><div><span>Regular baseline</span><strong>'+(baseProj===null?'Unknown':baseProj.toFixed(1)+' weeks')+'</strong></div></div><p class="sub">Baseline uses '+fmt(p.maxH)+' base Happy and the current '+esc(method)+' plan. Calibration is held constant between scenarios.</p>');h+=propertyCard(p,method,factor);h+=card("Property / Private Island what-if",'<div class="row"><label>Target base Happy <input id="lab-happy" type="number" min="100" max="99999" value="'+adjust+'"></label><label>Manual budget $ <input id="lab-property-cost" type="number" min="0" value="'+price+'"></label></div><p class="sub">Reference: Castle 3,475; PI 4,500 / 5,000 / fully upgraded 5,025. These are alternative total Happy values, not additive upgrades.</p><div class="row">'+targets.map(v=>'<button data-act="lab-happy" data-val="'+v+'">'+fmt(v)+'</button>').join("")+'</div><button data-act="lab-save">Compare scenario</button><div class="metric-grid"><div><span>Extra 7-day gain</span><strong>'+(delta>=0?"+":"")+fmt(delta)+'</strong></div><div><span>Estimated 50m</span><strong>'+(weeks===null?'Unknown':weeks.toFixed(1)+' weeks')+'</strong></div></div><p>'+(baseProj!==null&&weeks!==null?'Time difference: '+((baseProj-weeks)*7).toFixed(1)+' days sooner.':'More data needed for a timeline.')+'</p><p class="sub">'+(price?'Manual budget: '+cash(price)+'; not a confirmed purchase price.':'No budget entered.')+' Assumes full base Happy every training period.</p>'+(path?'<p><b>Catalogue minimum: '+cash(path.cost)+'</b> · '+(path.names.length?path.names.map(esc).join(' + '):'No further upgrades')+'</p>'+(price>0&&price<path.cost?'<p class="sub">Your manual budget is below this minimum; the target is not affordable within that amount.</p>':''):'<p class="sub">This target cannot be reached with the remaining catalogue-listed upgrades. The Happy figure is only hypothetical.</p>'));h+=card("Energy-can what-if",'<div class="row"><label>Base E / can <select id="lab-can-energy">'+[5,10,15,20,25,30].map(v=>'<option value="'+v+'"'+(v===canE?' selected':'')+'>'+v+' E</option>').join("")+'</select></label><label>Cans / day <input id="lab-cans-per-day" type="number" min="0" max="12" value="'+cans+'"></label></div><div class="row"><label>Energy multiplier <input id="lab-can-mult" type="number" min="1" max="6" step="0.5" value="'+canMult+'"></label><label>Price / can $ <input id="lab-can-price" type="number" min="0" value="'+canPrice+'"></label></div><button data-act="lab-save">Compare energy cans</button><div class="metric-grid"><div><span>Cans used</span><strong>'+used+' / '+(cans*7)+'</strong></div><div><span>Added Energy</span><strong>+'+fmt(extra)+' E</strong></div><div><span>7-day stat change</span><strong>'+(extraGain>=0?'+':'')+fmt(extraGain)+'</strong></div><div><span>50m estimate</span><strong>'+(canWeeks===null?'Unknown':canWeeks.toFixed(1)+' weeks')+'</strong></div></div><p>Can costs: <b>'+(canPrice?cash(canCost):'Enter can price')+'</b> per week · Trained energy change '+fmt(extraTrained)+' E.</p><p class="sub">Timed simulation: 2-hour booster cooldown, 24-hour booster cap, current booster cooldown and sleep schedule. Future unrelated booster use and actual can stock are not included.</p>');h+='<details><summary>How these estimates are calculated</summary>'+card("Assumptions",'<p>The property scenario applies the same historical calibration factor as the baseline so gains remain comparable. Energy cans are scheduled while awake no closer than two hours apart; actual training and shared booster cooldown are simulated. Other booster items are not scheduled. No items or properties are purchased.</p><p>Actual dates depend on future stat growth, price, perks, cooldowns and gym unlocks. Estimates are not guaranteed.</p>')+'</details>';return h;}
function settings(){return card("Planner settings",'<p><label><input id="hhj-adapt-history" type="checkbox"'+(cfg.adaptHistory!==false?' checked':'')+'> Adapt regular training windows to verified gym sessions (when enough history exists)</label></p><p class="sub">Your sleep hours and real cooldowns still take priority.</p><label>Weekly budget <input id="hhj-budget" type="number" min="0" value="'+cfg.budget+'"></label>'+'<p><label><input id="hhj-refills" type="checkbox"'+(cfg.refills?" checked":"")+'> Compare daily points refills</label></p>'+'<h3>Sleep schedule</h3>'+'<p><label><input id="hhj-sleepenabled" type="checkbox"'+(cfg.sleepEnabled?' checked':'')+'> Avoid manual actions during sleep</label></p>'+'<div class="row"><label>Bedtime <input id="hhj-sleepstart" type="time" value="'+esc(cfg.sleepStart||"22:00")+'"></label><label>Wake <input id="hhj-sleepend" type="time" value="'+esc(cfg.sleepEnd||"08:00")+'"></label></div>'+'<p class="sub">UK time · Default 22:00–08:00 · Train before bed and on waking.</p>'+'<p><label>Manual extra gym bonus % <input id="hhj-gymbonus" type="number" min="0" max="200" value="'+cfg.gymBonus+'"></label></p>'+'<p><label>Fallback points (only when Torn balance is unavailable) <input id="hhj-points" type="number" min="0" value="'+(+cfg.ownedPoints||0)+'"></label></p>'+
'<p class="sub">'+(verifiedPointsV025()!==null?'Auto-detected '+fmt(verifiedPointsV025())+' points · no manual updating needed.':'Points balance not verified; manual fallback is used.')+'</p>'+'<h3>Jump risk scenario (optional)</h3><p><label>Assumed full-jump completion chance (%) <input id="hhj-jump-success" type="number" min="0" max="100" step="0.1" placeholder="Unknown" value="'+(jumpSuccessAssumption()===null?'':jumpSuccessAssumption())+'"></label></p><p class="sub">Leave blank when unknown. This is YOUR hypothetical chance of completing the full Xanax and Ecstasy stack, not an official game or API value.</p>'+'<p><label>Assumed Xanax OD per dose (%) <input id="hhj-xanax-od" type="number" min="0" max="100" step="0.01" placeholder="Unknown" value="'+(cfg.xanaxOdPct===null?'':cfg.xanaxOdPct)+'"></label></p>'+'<p><label>Assumed Ecstasy OD per dose (%) <input id="hhj-ecstasy-od" type="number" min="0" max="100" step="0.01" placeholder="Unknown" value="'+(cfg.ecstasyOdPct===null?'':cfg.ecstasyOdPct)+'"></label></p><p class="sub">Blank manual percentages use the labelled community Xanax estimate only when enabled. Ecstasy remains unknown without an entered assumption. Manual values are effective rates and are not reduced again.</p>'+'<p><label><input id="hhj-od-community" type="checkbox"'+(cfg.odEstimateMode==="community"?' checked':'')+'> Use community OD estimates when no manual odds are set</label></p>'+
'<p class="sub">Community Xanax assumption: about 1 in 33 per dose (3.03%), NOT official. Ecstasy baseline is unknown. Time since last overdose does not affect the next dose.</p>'+
'<p><label>Legacy manual faction reduction (%) — not used by automatic estimate <input id="hhj-od-faction" type="number" min="0" max="30" step="3" value="'+(+cfg.odFactionReduction||0)+'"></label></p>'+
'<p><label><input id="hhj-od-nightclub" type="checkbox"'+(cfg.odNightclub?' checked':'')+'> Legacy manual Nightclub flag — not used by automatic estimate</label></p>'+
'<p class="sub">Automatic estimates use the faction Overdosing level and Nightclub rating returned by Torn when accessible. Missing values are explicitly unverified; manual per-drug odds override the estimate. The two legacy controls above are retained for settings compatibility but are not applied.</p>'+'<p class="sub">Fallback prices:</p>'+["points","xanax","ecstasy","lollipop","dvd"].map(k=>'<p><label>'+esc(k)+' price <input data-price="'+k+'" type="number" min="0" value="'+(+cfg.manualPrices?.[k]||0)+'"></label></p>').join("")+'<button data-act="save">Save settings</button><p class="sub">Budget and prices are estimates.</p>')}let hjAlertFocus="";
function alertsView(){
  const od=reportedOverdose(),p=updated?aPl():null,e=!od&&p?priorityAction(p.events,Tm()/1000):null;
  let html='<section class="card hero"><h3>Action centre</h3><p><b>WHAT TO DO:</b> Review the next due action, open Torn directly, and confirm it yourself. Timing is based on the latest verified activity and a forecast.</p><button data-act="refresh">Refresh live data</button></section>';
  if(!updated||Tm()-updated>15*60000)html+='<section class="card" id="hhj-alert-refresh-happy"><h3>Refresh required</h3><p>Current gym, cooldown and energy data is stale. Refresh before taking an action.</p><button data-act="refresh">Refresh Torn API</button></section>';
  if(!od&&updated&&Tm()-updated<=15*60000&&loadInput()&&Fl(loadInput().energy/loadInput().cost)>0)html+='<section class="card" id="hhj-alert-train-ready"><h3>Energy available for training</h3><p>'+Fl(loadInput().energy/loadInput().cost)+' trains may fit current energy, before accounting for changing happiness. Follow your schedule rather than assuming immediate training is best.</p><button data-act="open-torn" data-val="/gym.php">Open Torn Gym</button></section>';
  if(od)html+='<section class="card hero" id="hhj-alert-od-recovery"><h3>URGENT · Overdose recovery</h3><p>The normal training schedule is on hold. Review current energy, happiness and drug cooldown before training again.</p><button data-act="tab" data-val="today">View recovery plan</button></section>';
  else if(e){
    const route=e.kind==="TRAIN"?"/gym.php":e.kind==="REFILL"?"/points.php":"/item.php";
    const label=e.kind==="TRAIN"?"Open Torn Gym":e.kind==="REFILL"?"Open Torn Points Building":"Open Torn Items";
    html+='<section class="card hero" id="hhj-alert-event-'+esc(e.kind.toLowerCase())+'"><h3>'+esc(e.kind)+' · '+esc(eta(e.t))+'</h3><p><b>DO THIS:</b> '+(e.kind==="TRAIN"?"Train your selected stat when the planned time is due.":e.kind==="REFILL"?"Check that your daily refill is unused, then refill energy when appropriate.":"Check required items and cooldowns before taking the next planned step.")+'</p><p class="sub">Planned '+esc(cu(e.t))+' · Verify current Torn state first.</p>'+
      '<button data-act="open-torn" data-val="'+route+'">'+label+' ›</button> <button data-act="tab" data-val="plan">View schedule</button></section>';
  }else html+='<section class="card"><h3>No immediate alerts</h3><p>No active action in the next 30 minutes. Use the schedule to see what is coming up.</p><button data-act="tab" data-val="plan">View upcoming actions</button></section>';
  if(!od&&updated&&Tm()-updated<=15*60000){const n=nextDecision();if(n.kind==="book")html+='<section class="card" id="hhj-alert-owned-book"><h3>'+esc(n.title)+'</h3><p>'+esc(n.detail)+'</p><button data-act="tab" data-val="perks">Review owned book and timing</button></section>';}
  return html;
}

function safeHjDiagnosticsV200(){
 const now=Tm(),pattern=observedGymPatternV200();
 return {tool:"Happy Jump Preview",version:VER,capturedAt:new Date(now).toISOString(),
  apiKeyPresent:!KEY.includes("PDA-APIKEY"),lastFullRefreshMinutes:updated?Fl((now-updated)/60000):null,
  fullDataFresh:updated>0&&now-updated<=900000,
  barsPresent:!!data.bars?.bars?.energy,gymPresent:!!data.gym?.gym,statsPresent:!!data.stats?.battlestats,
  inventoryEntries:Object.keys(inv).length,
  verifiedGymSessions14d:pattern.samples,observedTrainingPatternReady:pattern.strong,
  lastGymLogScanMinutes:lc?Fl((now/1000-lc)/60):null,overdoseRecoveryHold:!!reportedOverdose(),
  plannedEvents:(aPl()?.events||[]).length,uiMounted:!!ct&&!!ui,refreshBusy:busy};
}
function hjDiagnosticsV200(){
 const d=safeHjDiagnosticsV200();
 let html='<p class="sub">Local, read-only checks; no API key, stats, items, game identifiers or gameplay history is included in this report.</p>'+
 '<div class="row"><button data-act="diag-check">Check Staxx integrations</button>'+
 '<button data-act="diag-copy">Copy safe report</button><button data-act="refresh">Refresh Torn</button></div>';
 for(const [k,v] of En(d))html+='<div class="row"><small>'+esc(k.replace(/([A-Z])/g," $1"))+'</small><b>'+esc(v===null?'Unknown':St(v))+'</b></div>';
 html+='<p class="sub">If logs are missing, the API may not return your full history. Check relevant permissions; no logs are fabricated. An active OD hold disables the normal schedule until recovery has been confirmed.</p>';
 return card("Happy Jump diagnostics",html);
}

const hjScrollV190=Object.create(null);let lastHjTabV190=null;
let hjTabsExpanded=false;const simpleHjTabs=new Set(['today','alerts','plan','progress']);
const labels=[["today","Today"],["alerts","Alerts"],["compare","Compare"],["plan","Schedule"],["supplies","Supplies"],["gyms","Gyms"],["perks","Perks & books"],["progress","Progress"],["lab","Upgrades"],["settings","Settings"],["diagnostics","Diagnostics"]];function draw(){if(!opened)return;
let simpleHjMode=true;try{simpleHjMode=JSON.parse(localStorage.getItem('staxx-hub-mode-v1')||'"simple"')!=='advanced';}catch(_){}
const shownHjLabels=!simpleHjMode||hjTabsExpanded?labels:labels.filter(([k])=>simpleHjTabs.has(k)||k===tab);
const before=ct.querySelector('.tabs'),navPosition=before?.scrollLeft||0;
if(lastHjTabV190)hjScrollV190[lastHjTabV190]=ct.scrollTop||0;
const active=Do.activeElement,activeField=active&&ct.contains(active)&&/^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)?active:null;
const edited=activeField?{id:activeField.id,fields:[...ct.querySelectorAll('input,textarea,select')].filter(x=>x.id||x.name).map(x=>({id:x.id,name:x.name,value:x.value,checked:x.type==='checkbox'?x.checked:null})),tab:lastHjTabV190}:null;
const openedDetails=[...ct.querySelectorAll('details')].map((x,i)=>x.open?i:-1).filter(i=>i>=0);
try{ct.innerHTML='<nav class="tabs" aria-label="Happy Jump sections">'+shownHjLabels.map(([k,v])=>
'<button class="'+(k===tab?'on':'')+'" data-act="tab" data-val="'+k+'">'+v+'</button>').join("")+(simpleHjMode?'<button data-act="staxx-more-tabs" aria-expanded="'+hjTabsExpanded+'">'+(hjTabsExpanded?'Less':'More ▾')+'</button>':'')+'</nav>'+(tab==="today"?today():tab==="alerts"?alertsView():tab==="compare"?compare():tab==="plan"?plan():
tab==="supplies"?supplies():tab==="gyms"?gyms():tab==="perks"?perks():tab==="progress"?progress():tab==="lab"?lab():tab==="diagnostics"?hjDiagnosticsV200():settings())+'<p class="sub">IamEEKY · Forecast only · No automated Torn actions · v'+VER+'</p>';}catch(e){ct.innerHTML='<section class="card"><h3>Panel recovery</h3><p>Rendering failed: '+esc(e.message)+'</p><button data-act="refresh">Retry refresh</button></section>';}const sameTab=lastHjTabV190===tab;lastHjTabV190=tab;
ct.scrollTop=hjScrollV190[tab]||0;
if(sameTab){for(const [i,x] of [...ct.querySelectorAll('details')].entries())if(openedDetails.includes(i))x.open=true;}
if(edited&&sameTab){for(const row of edited.fields){const el=[...ct.querySelectorAll('input,textarea,select')].find(x=>row.id?x.id===row.id:x.name===row.name);if(el){el.value=row.value;if(row.checked!==null)el.checked=row.checked;}}
const focus=edited.id?ct.querySelector('#'+edited.id):null;if(focus)focus.focus({preventScroll:true});}
if(hjAlertFocus){const node=ct.querySelector?.("#hhj-alert-"+hjAlertFocus);if(node){node.style.outline="2px solid #54d7fa";node.scrollIntoView?.({block:"nearest"});}hjAlertFocus="";}const tabs=ct.querySelector?.(".tabs"),selected=tabs?.querySelector?.("button.on");if(tabs&&selected)tabs.scrollLeft=sameTab?navPosition:Mx(0,selected.offsetLeft-tabs.offsetLeft-tabs.clientWidth/2+selected.offsetWidth/2);}Do.addEventListener("staxx:open",e=>{if(e.detail?.id==="happy"){if(e.detail.alertId){tab="alerts";hjAlertFocus=St(e.detail.alertId);}opened=true;ui.style.display="block";sLa(false);Do.dispatchEvent(new CustomEvent("staxx:panel",{detail:{id:"happy",open:true}}));draw();refresh();}else if(opened){opened=false;ui.style.display="none";sLa(true);Do.dispatchEvent(new CustomEvent("staxx:panel",{detail:{id:"happy",open:false}}));badge();}});
Do.addEventListener("staxx:closeall",()=>{if(opened){opened=false;ui.style.display="none";sLa(true);Do.dispatchEvent(new CustomEvent("staxx:panel",{detail:{id:"happy",open:false}}));badge();}});
Do.addEventListener("staxx:diagnostics-request",()=>{
 Do.dispatchEvent(new CustomEvent("staxx:diagnostics",{detail:{id:"happy",version:VER,
 api:KEY.includes("PDA-APIKEY")?"missing":!updated||Tm()-updated>900000?"stale":"ready",
 storage:typeof localStorage!=="undefined"?"ready":"missing",ui:ct&&ui?"ready":"missing",
 detail:busy?"Refresh in progress":reportedOverdose()?"Overdose recovery planning hold":"Verified gym sessions "+observedGymPatternV200().samples}}));
});Do.addEventListener("staxx:refresh-request",event=>{
 if(Do.hidden||busy||miniBusy)return;
 const recent=Mx(updated||0,miniFresh||0);
 if(!event?.detail?.force&&recent&&Tm()-recent<120000)return;
 if(opened){if(!updated||Tm()-updated>120000)void refresh();}
 else if(Tm()/1000-miniLast>=60)void miniRefresh();
});
Do.addEventListener("staxx:mode",()=>{hjTabsExpanded=false;if(opened)draw();});
Do.addEventListener("staxx:ping",()=>Do.dispatchEvent(new CustomEvent("staxx:register",{detail:{id:"happy",label:"Happy Jump",icon:"HJ",desc:"Observed training · Schedule · Recovery",trendMetric:"24h projected gains",freshnessMs:900000}})));
Do.dispatchEvent(new CustomEvent("staxx:register",{detail:{id:"happy",label:"Happy Jump",icon:"HJ",desc:"Observed training · Schedule · Recovery",trendMetric:"24h projected gains",freshnessMs:900000}}));
button.addEventListener("click",()=>{opened=!opened;ui.style.display=opened?"block":"none";sLa(!opened);Do.dispatchEvent(new CustomEvent("staxx:panel",{detail:{id:"happy",open:opened}}));if(opened){draw();return refresh()}badge()});ui.addEventListener("click",event=>{const b=event.target.closest("button");if(!b)return;const act=b.dataset.act,val=b.dataset.val;if(act==="staxx-more-tabs"){hjTabsExpanded=!hjTabsExpanded;draw();return;}if(act==="close"){opened=false;ui.style.display="none";sLa(true);Do.dispatchEvent(new CustomEvent("staxx:panel",{detail:{id:"happy",open:false}}));badge()}if(act==="refresh")refresh();if(act==="diag-check"){Do.dispatchEvent(new CustomEvent("staxx:ping"));Do.dispatchEvent(new CustomEvent("staxx:diagnostics-request"));draw()}if(act==="diag-copy"){const text=JSON.stringify(safeHjDiagnosticsV200(),null,2);if(Wi.navigator?.clipboard?.writeText)Wi.navigator.clipboard.writeText(text).catch(()=>{});else draw()}if(act==="open-torn"){if(["/gym.php","/item.php","/points.php"].includes(val))location.assign(location.origin+val);return;}if(act==="od-report"){if(noteOverdose(val)){draw();refresh()}}if(act==="od-label"){if(labelLastOD(val))draw()}if(act==="od-clear"){odClearPending=true;draw()}if(act==="od-cancel-clear"){odClearPending=false;draw()}if(act==="od-confirm-clear"){if(odClearPending&&reportedOverdose()){clearOverdose();draw();refresh()}}if(act==="tab"){tab=val;draw()}if(act==="stat"){cfg.stat=val;sm="auto";save()}if(act==="mode"){cfg.mode=val;sm="auto";save()}if(act==="choose"){sm=val;tab="plan";draw()}if(act==="optimizer-choose"){const [method,flag]=St(val||"").split(":");const r=optimizerResults();if(r.scenarios.some(x=>x.feasible&&x.method===method&&x.refills===(flag==="1"))){cfg.refills=flag==="1";cfg.mode="training";sm=method;tab="plan";save()}}if(act==="choose-supply"){sm=val;draw()}if(act==="horizon"){cfg.horizon=+val;save()}if(act==="lab-happy"){put("lab-happy",+val);draw()}if(act==="lab-save"){for(const [key,id] of [["lab-happy","lab-happy"],["lab-property-cost","lab-property-cost"],["lab-can-energy","lab-can-energy"],["lab-cans-per-day","lab-cans-per-day"],["lab-can-mult","lab-can-mult"],["lab-can-price","lab-can-price"]]){const input=CQ("#"+id);if(input)put(key,Mx(0,+input.value||0))}draw()}if(act==="awake-hour"||act==="awake-off"){awakeUntil=act==="awake-hour"?Tm()/1000+3600:0;put("awake-until",awakeUntil);lp=plans();draw()}if(act==="scan-logs")scanGym(true);if(act==="clearhistory"){hs=[];put("history",[]);draw()}if(act==="clearverification"){ledger=[];rg=null;put("verification",[]);put("rolling-plan",null);draw()}if(act==="partial"){sp=!sp;put("show-partial",sp);draw()}if(["gym-owned","gym-buy","gym-clear"].includes(act)){const id=+CQ("#hhj-gymlist")?.value;if(id&&/\/gym\.php$/.test(location.pathname||"")){if(act==="gym-clear")delete vr[id];else vr[id]=act==="gym-owned"?"owned":"buy";put("gyms",vr);draw()}}if(act==="save"){cfg.adaptHistory=!!CQ("#hhj-adapt-history")?.checked;cfg.budget=Mx(0,+CQ("#hhj-budget")?.value||0);cfg.refills=!!CQ("#hhj-refills")?.checked;cfg.sleepEnabled=!!CQ("#hhj-sleepenabled")?.checked;const bed=CQ("#hhj-sleepstart")?.value,wake=CQ("#hhj-sleepend")?.value;cfg.sleepStart=validClock(bed)?bed:"22:00";cfg.sleepEnd=validClock(wake)?wake:"08:00";if(cfg.sleepStart===cfg.sleepEnd)cfg.sleepEnabled=false;cfg.gymBonus=Mn(200,Mx(0,+CQ("#hhj-gymbonus")?.value||0));cfg.ownedPoints=Mx(0,+CQ("#hhj-points")?.value||0);const guessed=CQ("#hhj-jump-success")?.value;cfg.jumpSuccessPct=guessed!==undefined&&St(guessed).trim()!==""&&Fi(+guessed)&&+guessed>=0&&+guessed<=100?+guessed:null;for(const [name,id] of [["xanaxOdPct","#hhj-xanax-od"],["ecstasyOdPct","#hhj-ecstasy-od"]]){const v=CQ(id)?.value;cfg[name]=v!==undefined&&St(v).trim()!==""&&Fi(+v)&&+v>=0&&+v<=100?+v:null;}cfg.odEstimateMode=CQ("#hhj-od-community")?.checked?"community":"manual";cfg.odFactionReduction=Mn(30,Mx(0,+CQ("#hhj-od-faction")?.value||0));cfg.odNightclub=!!CQ("#hhj-od-nightclub")?.checked;cfg.manualPrices=Fr(["points","xanax","ecstasy","lollipop","dvd"].map(k=>
[k,Mx(0,+CQ('[data-price="'+k+'"]')?.value||0)]));save()}});mount();Do.addEventListener?.("DOMContentLoaded",mount,{once:true});// Read-only full-data check while Torn is foregrounded. Mini refresh covers bars;
// this bounded check also updates inventory, owned books and live planning inputs.
// Persistent attempt backoff prevents API bursts when TornPDA reloads the page.
function autoFullRefreshV230(){
 if(Do.hidden||busy||miniBusy||KEY.includes("PDA-APIKEY"))return;
 const t=Tm(),last=Nu(get("auto-full-attempt-v230",0));
 if(updated&&t-updated<45*60000)return;
 if(last&&t-last<45*60000)return;
 put("auto-full-attempt-v230",t);
 void refresh();
}
Wi.setInterval(()=>{if(Do.hidden)return;if(Tm()/1000-miniLast>180)miniRefresh();else badge();autoFullRefreshV230()},60000);
Do.addEventListener?.("visibilitychange",()=>{if(Do.hidden)return;
 if(opened&&(!updated||Tm()-updated>15*60000))refresh();
 else if(!opened){void miniRefresh();autoFullRefreshV230();}
});
miniRefresh();Wi.setInterval(()=>{mount();},5000);if(typeof window!=="undefined"){Wi.__TornHappyJumpLoaded=VER;Wi.__TornHappyJumpStage={version:VER,phase:"mounted"};}})();