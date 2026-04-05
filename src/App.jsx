import { useState, useEffect, useMemo, useRef, useCallback } from "react";

const ME = "user-1";
const PALETTES = [
  { bg: "rgba(139,183,176,.12)", border: "#8BB7B0" },
  { bg: "rgba(216,165,116,.12)", border: "#D8A574" },
  { bg: "rgba(169,182,217,.12)", border: "#A9B6D9" },
  { bg: "rgba(199,167,201,.12)", border: "#C7A7C9" },
  { bg: "rgba(136,184,201,.12)", border: "#88B8C9" },
  { bg: "rgba(199,191,145,.12)", border: "#C7BF91" },
];
const COLORS = [
  "#FFFFFF","#F4D84A","#F59E0B","#C84532","#EC4899","#8B5CF6",
  "#7DD3FC","#1D4ED8","#86EFAC","#166534","#8B5E3C","#111827",
];
const COLOR_NAMES = ["White","Yellow","Orange","Red","Pink","Purple","Light blue","Dark blue","Light green","Dark green","Brown","Black"];

function xid(p="x"){return `${p}-${Math.random().toString(36).slice(2,10)}`}
function mkcode(){return Math.random().toString(36).slice(2,8).toUpperCase()}
function ini(n){const w=(n||"").trim().split(/\s+/);if(!w.length||!w[0])return"?";return w.length===1?w[0][0].toUpperCase():(w[0][0]+w[1][0]).toUpperCase()}
function hx(hex){const h=(hex||"").replace("#","");if(!/^[0-9a-fA-F]{6}$/.test(h))return null;return{r:parseInt(h.slice(0,2),16),g:parseInt(h.slice(2,4),16),b:parseInt(h.slice(4,6),16)}}
function ra(hex,a){const c=hx(hex);return c?`rgba(${c.r},${c.g},${c.b},${a})`:"transparent"}
function con(hex,dk){const c=hx(hex);if(!c)return dk?"#f0f4f8":"#1a1a2e";return(c.r*299+c.g*587+c.b*114)/1000>155?"#1a1a2e":"#f0f4f8"}
function tst(p,dk){
  let b=p.borderColor||p.fillColor||"",f=p.fillColor||(b?ra(b,dk?.28:.18):""),t=p.textColor||(b?con(b,dk):"");
  if(!b&&!f){b=dk?"#555":"#ccc";f="transparent"}if(!t)t=dk?"#f0f4f8":"#1a1a2e";
  return{"--tb":b,"--tf":f,"--tt":t};
}
function defTags(){return[
  {id:"s1",name:"L",borderColor:"#1D4ED8",fillColor:"#F4D84A",textColor:"#1D4ED8"},
  {id:"s2",name:"S",borderColor:"#C84532",fillColor:"#FFFFFF",textColor:"#C84532"},
  {id:"s3",name:"%",borderColor:"#166534",fillColor:"#FFFFFF",textColor:"#166534"},
  {id:"s4",name:"!",borderColor:"#111827",fillColor:"#FFFFFF",textColor:"#111827"},
  {id:"s5",name:"-25",borderColor:"#86EFAC",fillColor:"#FFFFFF",textColor:"#166534"},
]}

const DATA=[
  {id:"l1",name:"Weekly groceries",code:"V3GGHK",ownerId:ME,
    members:[{id:ME,name:"Jaka",email:"jaka@example.com"},{id:"u2",name:"Maja",email:"maja@example.com"},{id:"u3",name:"Tina",email:"tina@example.com"}],
    tags:defTags(),
    items:[
      {id:"i1",title:"Yogurt",qty:"",tags:["s1"],done:false,ts:1,by:ME},
      {id:"i2",title:"Cucumbers",qty:"",tags:["s1"],done:false,ts:2,by:"u2"},
      {id:"i3",title:"Apples",qty:"500g",tags:["s2","s3","s5"],done:false,ts:3,by:ME},
      {id:"i4",title:"Bread",qty:"",tags:["s4"],done:false,ts:4,by:"u3"},
      {id:"i5",title:"Eggs",qty:"6 pcs",tags:["s5"],done:true,ts:5,by:ME},
      {id:"i6",title:"Milk",qty:"2x",tags:["s1","s2"],done:true,ts:6,by:"u2"},
    ]},
  {id:"l2",name:"Weekend",code:"SPAR07",ownerId:ME,
    members:[{id:ME,name:"Jaka",email:"jaka@example.com"},{id:"u2",name:"Maja",email:"maja@example.com"}],
    tags:[
      {id:"s1",name:"Spar",borderColor:"#C84532",fillColor:"#FFFFFF",textColor:"#C84532"},
      {id:"s2",name:"Tus",borderColor:"#166534",fillColor:"#FFFFFF",textColor:"#166534"},
      {id:"s3",name:"!",borderColor:"#111827",fillColor:"#FFFFFF",textColor:"#111827"},
      {id:"s4",name:"Sale",borderColor:"#6B201A",fillColor:"#8E2C24",textColor:"#FFFFFF"},
      {id:"s5",name:"",borderColor:"#1D4ED8",fillColor:"#F4D84A",textColor:""},
    ],
    items:[
      {id:"i7",title:"Bread rolls",qty:"4 pcs",tags:["s1"],done:false,ts:1,by:ME},
      {id:"i8",title:"Orange juice",qty:"1L",tags:["s4"],done:false,ts:2,by:"u2"},
    ]},
  {id:"l3",name:"Shared list",code:"LIDL25",ownerId:"u4",
    members:[{id:ME,name:"Jaka",email:"jaka@example.com"},{id:"u4",name:"Lana",email:"lana@example.com"}],
    tags:defTags(),
    items:[{id:"i9",title:"Skyr",qty:"",tags:["s1","s2"],done:false,ts:1,by:"u4"}]},
];

function Chip({p,dk,sm,picked,onClick,cls=""}){
  const s=tst(p,dk),has=(p.name||"").trim();
  return <span className={`chip ${sm?"chip-s":""} ${picked?"chip-on":""} ${!has?"chip-dot":""} ${cls}`} style={s}
    onClick={onClick} role={onClick?"button":undefined} tabIndex={onClick?0:undefined}>{has||"●"}</span>;
}

function Sheet({open,onClose,title,sub,children}){
  if(!open)return null;
  return(
    <div className="sho" onClick={onClose}>
      <div className="shc" onClick={e=>e.stopPropagation()}>
        <div className="shh"><div>{sub&&<p className="shs">{sub}</p>}<h2 className="sht">{title}</h2></div>
          <button className="shx" onClick={onClose}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg></button>
        </div>
        <div className="shb">{children}</div>
      </div>
    </div>
  );
}

export default function App(){
  const[dk,setDk]=useState(false);
  const[isAuth,setIsAuth]=useState(true);
  const[authMode,setAuthMode]=useState("login");
  const[authEmail,setAuthEmail]=useState("");
  const[authPass,setAuthPass]=useState("");
  const[authName,setAuthName]=useState("");
  const[authError,setAuthError]=useState("");
  const[lists,setLists]=useState(DATA);
  const[activeId,setActiveId]=useState("l1");
  const[defaultId,setDefaultId]=useState("l1");
  const[sort,setSort]=useState({kind:"created",dir:"desc",tagId:""});
  const[sortTagId,setSortTagId]=useState("");
  const[showDone,setShowDone]=useState(false);
  const[showProfile,setShowProfile]=useState(false);
  const[showListSettings,setShowListSettings]=useState(false);
  const[showMembers,setShowMembers]=useState(false);
  const[showTagEd,setShowTagEd]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[showPicker,setShowPicker]=useState(false);
  const[showNew,setShowNew]=useState(false);
  const[showJoin,setShowJoin]=useState(false);
  const[draft,setDraft]=useState({title:"",qty:"",tags:[],editId:""});
  const[tagTab,setTagTab]=useState(0);
  const[newName,setNewName]=useState("");
  const[joinVal,setJoinVal]=useState("");
  const[userName,setUserName]=useState("Jaka");
  const[renameDraft,setRenameDraft]=useState("");
  const[compact,setCompact]=useState({});
  const inp=useRef(null);
  const now=new Date();
  const time=`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;

  useEffect(()=>{const m=window.matchMedia("(prefers-color-scheme: dark)");setDk(m.matches);const h=e=>setDk(e.matches);m.addEventListener("change",h);return()=>m.removeEventListener("change",h)},[]);

  const list=useMemo(()=>lists.find(l=>l.id===activeId)||lists[0],[lists,activeId]);
  const members=list?.members||[];
  const tags=list?.tags||[];
  const mc=useCallback(i=>PALETTES[members.findIndex(m=>m.id===i)%PALETTES.length]||PALETTES[0],[members]);

  const sorted=useMemo(()=>{
    if(!list)return[];
    return [...list.items].sort((a,b)=>{
      if(sortTagId){
        const aHas=a.tags.includes(sortTagId)?0:1;
        const bHas=b.tags.includes(sortTagId)?0:1;
        if(aHas!==bHas)return aHas-bHas;
      }
      if(sort.kind==="alpha"){const c=a.title.localeCompare(b.title,"en",{sensitivity:"base"});return sort.dir==="asc"?c:-c}
      const c=a.ts-b.ts;return sort.dir==="desc"?-c:c;
    });
  },[list,sort,sortTagId]);

  const activeItems=useMemo(()=>sorted.filter(i=>!i.done),[sorted]);
  const doneItems=useMemo(()=>sorted.filter(i=>i.done),[sorted]);
  const doneN=doneItems.length;

  function handleAuth(e){
    e?.preventDefault?.();
    if(authMode==="login"){
      if(!authEmail||!authPass){setAuthError("Enter email and password");return}
      setIsAuth(true);setAuthError("");
    }else{
      if(!authEmail||!authPass||!authName){setAuthError("Fill in all fields");return}
      setUserName(authName);setIsAuth(true);setAuthError("");
    }
  }
  function signOut(){setIsAuth(false);setShowProfile(false);setAuthEmail("");setAuthPass("");setAuthName("");setAuthMode("login")}

  function up(lid,fn){setLists(ls=>ls.map(l=>l.id===lid?fn(l):l))}
  function tap(item){if(!list)return;if(item.done){setReturnTarget(item);setDraft({title:item.title,qty:item.qty,tags:[...item.tags],editId:item.id});setShowReturn(true);return}up(list.id,l=>({...l,items:l.items.map(i=>i.id===item.id?{...i,done:true}:i)}))}
  function undo(item){if(!list)return;up(list.id,l=>({...l,items:l.items.map(i=>i.id===item.id?{...i,done:false}:i)}))}
  function submit(e){
    e?.preventDefault?.();if(!list)return;const t=draft.title.trim();if(!t)return;
    if(!draft.editId){
      const dup=list.items.find(i=>i.title.toLowerCase()===t.toLowerCase());
      if(dup){
        if(dup.done){
          up(list.id,l=>({...l,items:l.items.map(i=>i.id===dup.id?{...i,title:t,qty:draft.qty.trim()||i.qty,tags:draft.tags.length?draft.tags:i.tags,done:false}:i)}));
          setToast(`"${dup.title}" returned to the list`);
          setTimeout(()=>setToast(""),3000);
          setDraft({title:"",qty:"",tags:[],editId:""});setShowAdd(false);
        } else {
          setToast(`"${dup.title}" is already on the list`);
          setTimeout(()=>setToast(""),3000);
        }
        return;
      }
    }
    up(list.id,l=>{let n=[...l.items];
      if(draft.editId){n=n.map(i=>i.id===draft.editId?{...i,title:t,qty:draft.qty.trim(),tags:draft.tags,done:false}:i)}
      else{n.push({id:xid("i"),title:t,qty:draft.qty.trim(),tags:draft.tags,done:false,ts:Date.now(),by:ME})}
      return{...l,items:n}});
    setDraft({title:"",qty:"",tags:[],editId:""});setShowAdd(false);
  }
  function clrDone(){if(!list)return;up(list.id,l=>({...l,items:l.items.filter(i=>!i.done)}));setShowClear(false)}
  function mkList(){const n=newName.trim();if(!n)return;const nl={id:xid("l"),name:n,code:mkcode(),ownerId:ME,members:[{id:ME,name:"Jaka",email:"jaka@example.com"}],tags:defTags(),items:[]};setLists(ls=>[...ls,nl]);setActiveId(nl.id);setNewName("");setShowNew(false);setShowPicker(false)}
  function jnList(){const c=joinVal.trim().toUpperCase();if(!c)return;const ex=lists.find(l=>l.code===c);if(ex){setActiveId(ex.id)}else{const nl={id:xid("l"),name:`List ${c}`,code:c,ownerId:"u-ext",members:[{id:ME,name:"Jaka",email:"jaka@example.com"},{id:"u-ext",name:"External",email:"ext@example.com"}],tags:defTags(),items:[]};setLists(ls=>[...ls,nl]);setActiveId(nl.id)}setJoinVal("");setShowJoin(false);setShowPicker(false)}
  function delList(lid){setLists(ls=>ls.filter(l=>l.id!==lid));if(activeId===lid)setActiveId(lists.find(l=>l.id!==lid)?.id||"")}
  function upTag(i,p){if(!list)return;up(list.id,l=>({...l,tags:l.tags.map((t,j)=>j===i?{...t,...p}:t)}))}
  function openAdd(){setDraft({title:"",qty:"",tags:[],editId:""});setShowAdd(true);setTimeout(()=>inp.current?.focus(),100)}
  function editItem(item){setDraft({title:item.title,qty:item.qty,tags:[...item.tags],editId:item.id});setShowAdd(true)}
  function delItem(itemId){if(!list)return;up(list.id,l=>({...l,items:l.items.filter(i=>i.id!==itemId)}));setSwipeId("")}
  const[swipeId,setSwipeId]=useState("");
  const[showReturn,setShowReturn]=useState(false);
  const[showConfirmClear,setShowConfirmClear]=useState(false);
  const[toast,setToast]=useState("");
  const[returnTarget,setReturnTarget]=useState(null);
  const touchRef=useRef({id:"",startX:0});
  function onTS(e,itemId){touchRef.current={id:itemId,startX:e.touches[0].clientX};setSwipeId("")}
  function onTM(e){const dx=e.touches[0].clientX-touchRef.current.startX;if(dx<-60)setSwipeId(touchRef.current.id);else if(dx>20)setSwipeId("")}
  function onTE(){touchRef.current={id:"",startX:0}}
  function togSort(k,tid=""){if(k==="tag")setSort({kind:"tag",dir:"asc",tagId:tid});else setSort(s=>s.kind===k?{...s,dir:s.dir==="asc"?"desc":"asc"}:{kind:k,dir:k==="alpha"?"asc":"desc",tagId:""})}
  function copyCode(){if(list?.code)navigator.clipboard?.writeText(list.code)}
  const isOwner=list?.ownerId===ME;

  return(
    <div className={`scene ${dk?"dk":"lt"}`}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
button{font:inherit;cursor:pointer;border:none;background:none;color:inherit}
input,select{font:inherit;color:inherit}
.scene{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px 16px;font-family:"DM Sans",-apple-system,BlinkMacSystemFont,sans-serif;transition:background .3s}
.lt.scene{background:#e8e4de}.dk.scene{background:#111114}

/* PHONE */
.phone{width:375px;height:812px;border-radius:52px;position:relative;overflow:hidden;flex-shrink:0;
  box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.08),0 0 0 2.5px #1c1c1e,0 0 0 5px #3a3a3c,0 0 0 6.5px #1c1c1e,0 40px 100px rgba(0,0,0,.3),0 15px 40px rgba(0,0,0,.2)}
.dk .phone{box-shadow:inset 0 0 0 1.5px rgba(255,255,255,.04),0 0 0 2.5px #0a0a0c,0 0 0 5px #2a2a2e,0 0 0 6.5px #0a0a0c,0 40px 100px rgba(0,0,0,.5)}
.phone::before{content:"";position:absolute;right:-3px;top:180px;width:3px;height:56px;background:linear-gradient(#3a3a3c,#2c2c2e);border-radius:0 2px 2px 0;z-index:70}
.phone::after{content:"";position:absolute;left:-3px;top:160px;width:3px;height:32px;background:linear-gradient(#3a3a3c,#2c2c2e);border-radius:2px 0 0 2px;z-index:70;box-shadow:0 46px 0 0 #333,0 80px 0 0 #333}
.island{position:absolute;top:11px;left:50%;transform:translateX(-50%);width:126px;height:36px;background:#000;border-radius:20px;z-index:60}
.sysbar{position:absolute;top:0;left:0;right:0;height:54px;z-index:55;display:flex;align-items:flex-end;justify-content:space-between;padding:0 30px 6px;font-size:14px;font-weight:600;pointer-events:none}
.lt .sysbar{color:#1a1a2e}.dk .sysbar{color:#e8e8ec}
.sbl{flex:1}.sbr{flex:1;display:flex;justify-content:flex-end;gap:5px;align-items:center}
.hbar{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:3px;z-index:55}
.lt .hbar{background:rgba(0,0,0,.18)}.dk .hbar{background:rgba(255,255,255,.18)}
.scr{position:absolute;inset:0;border-radius:52px;overflow:hidden}
.lt .scr{background:#faf8f5;color:#1a1a2e}.dk .scr{background:#141418;color:#f0f0f4}
.scroll{position:absolute;inset:0;overflow-y:auto;overflow-x:hidden;padding-bottom:90px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.scroll::-webkit-scrollbar{display:none}

/* TOKENS */
.lt{--bg:#faf8f5;--warm:#f3efe9;--card:#fff;--hov:#f7f5f2;--act:#eeebe6;--txt:#1a1a2e;--t2:#6b6b7b;--t3:#9b9bab;--bd:#e5e2dc;--bs:#ede9e3;--ac:#1a7a5c;--ah:#146b4f;--as:rgba(26,122,92,.07);--dn:#c84532;--ds:rgba(200,69,50,.08);--dbg:rgba(26,122,92,.06);--dt:#9b9bab}
.dk{--bg:#141418;--warm:#1a1a20;--card:#1e1e26;--hov:#26262e;--act:#2e2e38;--txt:#f0f0f4;--t2:#a0a0b0;--t3:#6b6b7b;--bd:#2a2a34;--bs:#222230;--ac:#4ec89a;--ah:#3fb888;--as:rgba(78,200,154,.1);--dn:#ef6b5b;--ds:rgba(239,107,91,.08);--dbg:rgba(78,200,154,.06);--dt:#6b6b7b}

/* TOPBAR */
.bar{padding:58px 20px 10px;display:flex;align-items:center;gap:8px;background:var(--bg);position:sticky;top:0;z-index:40}
.bar-l{flex:1;min-width:0;display:flex;align-items:center;gap:8px}
.uava{width:30px;height:30px;border-radius:50%;border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:var(--txt);background:var(--hov);flex-shrink:0;letter-spacing:.02em;transition:border-color .15s}
.uava:hover{border-color:var(--ac)}
.ddw{position:relative}
.lbtn{font-size:17px;font-weight:600;letter-spacing:-.01em;padding:4px 8px;border-radius:6px;display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lbtn:active{background:var(--hov)}
.chev{transition:transform .2s;flex-shrink:0;opacity:.4}.chev.open{transform:rotate(180deg)}
.ddbg{position:fixed;inset:0;z-index:44}
.ddm{position:absolute;top:calc(100% + 6px);left:0;min-width:230px;max-width:290px;background:var(--card);border:1px solid var(--bd);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12),0 2px 8px rgba(0,0,0,.06);z-index:45;overflow:hidden;animation:ddIn .14s ease}
.dk .ddm{box-shadow:0 8px 32px rgba(0,0,0,.4)}
@keyframes ddIn{from{opacity:0;transform:translateY(-4px)}}
.ddi{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:10px 14px;font-size:14px;font-weight:500;text-align:left;transition:background .1s}
.ddi:hover{background:var(--hov)}
.ddi:active{background:var(--act)}
.ddi-on{background:rgba(255,255,255,.08);font-weight:600}.ddi-on::after{content:"✓";font-size:12px;font-weight:700}
.ddi-n{font-size:11px;color:var(--t3);font-weight:400}
.ddsep{height:1px;background:var(--bs);margin:2px 0}
.ddi-a{color:var(--ac);font-weight:500;font-size:13px}
.bar-r{display:flex;gap:2px}
.ib{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--t2)}
.ib:active{background:var(--hov);color:var(--txt)}

/* DEFAULT BADGE */
.ddi-def{font-size:9px;font-weight:600;padding:1px 6px;border-radius:8px;background:var(--as);color:var(--ac);margin-left:6px;vertical-align:middle}

/* ACCORDION */
.acc-row{display:flex;align-items:center;position:relative}
.acc-head{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;padding:14px 20px;font-size:13px;font-weight:600;color:var(--t2);transition:color .15s}
.acc-head:hover{color:var(--txt)}
.acc-chev{transition:transform .2s;flex-shrink:0;opacity:.5}
.acc-chev.acc-open{transform:rotate(180deg)}
.acc-count{color:var(--t3);font-weight:500}
.acc-del{position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:11px;font-weight:600;color:var(--dn);white-space:nowrap;padding:4px 10px;border-radius:12px;transition:background .15s}
.acc-del:active{background:var(--ds)}
.acc-body{animation:accIn .15s ease}
@keyframes accIn{from{opacity:0;transform:translateY(-4px)}}

/* TAG SORT ROW */
.tagrow{display:flex;gap:6px;padding:8px 20px;overflow-x:auto;scrollbar-width:none;background:var(--hov);margin:4px 0;align-items:center}
.tagrow::-webkit-scrollbar{display:none}
.tf{padding:6px 4px;border-radius:8px;font-size:12px;font-weight:600;white-space:nowrap;cursor:pointer;flex:1;min-width:0;min-height:34px;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--tb,var(--bd));background:var(--tf,transparent);color:var(--tt,var(--txt));letter-spacing:.02em;transition:all .12s;opacity:.7}
.tf:active{opacity:1;transform:scale(.96)}
.tf-on{box-shadow:0 0 0 2.5px var(--ac);opacity:1}
.tagrow-lbl{font-size:11px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;padding-right:2px;flex-shrink:0}

/* ITEMS */
.il{display:flex;flex-direction:column}
.iw{position:relative;overflow:hidden}
.iw .ir{transition:transform .2s ease}
.iw-swiped .ir{transform:translateX(-56px)}
.idel{position:absolute;top:0;right:0;bottom:1px;width:56px;display:flex;align-items:center;justify-content:center;background:var(--dn);color:#fff;transition:opacity .15s;opacity:0;pointer-events:none}
.iw-swiped .idel{opacity:1;pointer-events:auto}
.idel:active{filter:brightness(.85)}
.ir{display:flex;align-items:center;gap:10px;padding:14px 20px;border-bottom:1px solid var(--bs);cursor:pointer;user-select:none;-webkit-user-select:none;background:var(--bg)}
.ir:active{background:var(--hov)}
.ir.dn{background:var(--dbg) !important}
.ir.dn .ititle{text-decoration:line-through;color:var(--dt)}
.ick{width:20px;height:20px;border-radius:50%;border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .12s}
.ir.dn .ick{background:var(--ac);border-color:var(--ac)}
.ir.dn .ick::after{content:"✓";color:#fff;font-size:11px;font-weight:700}
.imid{flex:1;min-width:0;display:flex;align-items:center;gap:8px}
.ititle{font-size:14.5px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.iqty{font-size:12px;font-weight:600;color:var(--ac);background:var(--as);padding:2px 8px;border-radius:5px;white-space:nowrap;flex-shrink:0;letter-spacing:.02em}
.ir.dn .iqty{color:var(--dt);background:var(--hov);font-weight:500}
.iend{display:flex;align-items:center;gap:3px;flex-shrink:0}

/* COMPACT MODE */
.cpt .ir{padding:8px 20px;gap:8px}
.cpt .ick{width:17px;height:17px}
.cpt .ir.dn .ick::after{font-size:9px}
.cpt .ititle{font-size:13px}
.cpt .iqty{font-size:10.5px;padding:1px 6px}
.cpt .chip{padding:1px 6px;font-size:10px;min-height:20px}
.cpt .acc-head{padding:10px 20px;font-size:12px}
.iundo{font-size:10.5px;padding:3px 10px;border-radius:16px;background:var(--hov);color:var(--t2);font-weight:500}
.iundo:active{background:var(--act)}

/* CHIPS */
.chip{display:inline-flex;align-items:center;justify-content:center;padding:3px 9px;border-radius:14px;font-size:12px;font-weight:600;letter-spacing:.02em;border:1.5px solid var(--tb);background:var(--tf);color:var(--tt);line-height:1.4;white-space:nowrap;min-height:26px}
.chip-s{padding:0 6px;font-size:10px;border-radius:12px}.chip-dot{width:14px;padding:0;min-height:14px;font-size:7px;border-radius:50%}
.chip[role="button"]{cursor:pointer}.chip[role="button"]:active{transform:scale(.93)}
.chip-on{box-shadow:0 0 0 2px var(--ac)}

/* FAB — right aligned */
.fab{position:absolute;bottom:28px;right:20px;height:44px;padding:0 24px;border-radius:22px;font-size:14px;font-weight:600;background:var(--ac);color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.12);font-family:inherit;z-index:30}
.fab:active{transform:scale(.95)}

/* TOAST */
.toast{position:absolute;bottom:80px;left:50%;transform:translateX(-50%);background:var(--txt);color:var(--bg);font-size:13px;font-weight:500;padding:10px 20px;border-radius:10px;z-index:70;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,.2);animation:toastIn .2s ease;max-width:90%;text-align:center}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(8px)}}

/* SHEETS */
.sho{position:absolute;inset:0;z-index:50;background:rgba(0,0,0,.35);display:flex;align-items:flex-end;justify-content:center;animation:fi .12s ease;border-radius:52px;overflow:hidden}
@keyframes fi{from{opacity:0}}@keyframes su{from{transform:translateY(16px);opacity:0}}
.shc{background:var(--card);border-radius:16px 16px 0 0;width:100%;max-height:75%;overflow-y:auto;animation:su .18s ease;scrollbar-width:none}
.shc::-webkit-scrollbar{display:none}
.shh{display:flex;align-items:flex-start;justify-content:space-between;padding:16px 20px 0;position:sticky;top:0;background:var(--card);z-index:2}
.shs{font-size:10px;text-transform:uppercase;letter-spacing:.08em;font-weight:600;color:var(--ac);margin-bottom:1px}
.sht{font-size:18px;font-weight:700;letter-spacing:-.02em;color:var(--txt)}
.shx{width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;color:var(--t3)}
.shx:active{background:var(--hov)}
.shb{padding:12px 20px 28px}
.fg{display:flex;flex-direction:column;gap:12px}
.frow-fields{display:flex;gap:8px;align-items:flex-end}
.fl{font-size:11px;font-weight:600;color:var(--t2);text-transform:uppercase;letter-spacing:.05em;margin-bottom:3px;display:block}
.fi{width:100%;padding:9px 12px;border-radius:8px;border:1.5px solid var(--bd);background:var(--bg);font-size:14px;outline:none}
.fi:focus{border-color:var(--ac)}.fi::placeholder{color:var(--t3)}
.bp{width:100%;padding:11px;border-radius:8px;background:var(--ac);color:#fff;font-size:14px;font-weight:600;margin-top:2px}
.bp:active{filter:brightness(.92)}.bp.bd{background:var(--dn)}
.bg2{width:100%;padding:9px;border-radius:8px;background:var(--hov);color:var(--txt);font-size:13px;font-weight:500}
.bg2:active{background:var(--act)}
.tpick{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:3px}
.chip.tp{cursor:pointer;text-align:center;padding:8px 4px;border-radius:8px;border:1.5px solid var(--tb);background:var(--tf);transition:all .12s;min-height:36px;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--tt);opacity:.7}
.chip.tp.tpon{opacity:1;box-shadow:0 0 0 2.5px var(--ac)}
.chip.tp:active{opacity:1;transform:scale(.96)}

/* AVATARS & MEMBERS */
.ava{border-radius:50%;border:2px solid;display:flex;align-items:center;justify-content:center;font-weight:600;letter-spacing:.02em;color:var(--txt);background:var(--card);flex-shrink:0}
.scbar{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--warm);border-radius:8px;margin-bottom:12px}
.scode{font-size:16px;font-weight:700;letter-spacing:.1em;flex:1}
.cpbtn{font-size:11px;padding:4px 12px;border-radius:14px;background:var(--ac);color:#fff;font-weight:600}
.mrow{display:flex;align-items:center;gap:8px;padding:6px 0}
.mn{font-size:13px;font-weight:500}.me{font-size:11px;color:var(--t3)}
.mob{font-size:9px;font-weight:600;padding:1px 6px;border-radius:8px;background:var(--as);color:var(--ac)}
.dbtn{font-size:11px;padding:4px 8px;border-radius:14px;color:var(--dn)}.dbtn:active{background:var(--ds)}

/* TAG EDITOR */
.ttabs{display:flex;gap:5px;margin-bottom:12px;flex-wrap:wrap}
.ttab{padding:5px;border-radius:6px;border:2px solid transparent}
.ttab.on{border-color:var(--ac);background:var(--as)}
.cgrid{display:flex;flex-wrap:wrap;gap:5px;margin-top:4px}
.cdot{width:24px;height:24px;border-radius:50%;border:2px solid var(--bd);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700}
.cdot:active{transform:scale(.9)}.cdot.sel{border-color:var(--ac);box-shadow:0 0 0 2px var(--ac)}
.csec{margin-top:10px}.csl{font-size:10px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px}

/* SETTINGS */
.srow{display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--bs)}.srow:last-child{border-bottom:none}
.slbl{font-size:13px;font-weight:500}
.ssel{padding:5px 10px;border-radius:6px;border:1.5px solid var(--bd);background:var(--bg);font-size:12px}
.dtog-btn{width:44px;height:26px;border-radius:13px;background:var(--bd);position:relative;transition:background .2s;padding:0}
.dtog-btn.dtog-on{background:var(--ac)}
.dtog-track{display:block;width:100%;height:100%;position:relative}
.dtog-thumb{position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15);transition:transform .2s}
.dtog-on .dtog-thumb{transform:translateX(18px)}
.dtog-dis{opacity:.35;cursor:not-allowed}
.dng-btn{display:flex;align-items:center;gap:8px;width:100%;padding:11px;border-radius:8px;background:var(--ds);color:var(--dn);font-size:13px;font-weight:600;transition:background .15s}
.dng-btn:active{background:var(--dn);color:#fff}

/* EMPTY */
/* POPUP DIALOG */
.pop-overlay{position:absolute;inset:0;z-index:60;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;border-radius:52px;overflow:hidden;animation:fi .12s ease;padding:24px}
.pop-card{background:var(--card);border-radius:14px;padding:20px;width:100%;max-width:280px;text-align:center;animation:popIn .18s ease;box-shadow:0 12px 40px rgba(0,0,0,.2)}
@keyframes popIn{from{opacity:0;transform:scale(.92)}}
.pop-title{font-size:16px;font-weight:700;margin-bottom:6px;color:var(--txt)}
.pop-msg{font-size:13px;color:var(--t2);line-height:1.5;margin-bottom:16px}
.pop-btns{display:flex;gap:8px}
.pop-cancel{flex:1;padding:10px;border-radius:8px;background:var(--hov);color:var(--txt);font-size:14px;font-weight:500}
.pop-cancel:active{background:var(--act)}
.pop-confirm{flex:1;padding:10px;border-radius:8px;background:var(--dn);color:#fff;font-size:14px;font-weight:600}
.pop-confirm:active{filter:brightness(.85)}
.empty{text-align:center;padding:40px 20px;color:var(--t3)}
.empty-ico{font-size:36px;display:block;margin-bottom:8px}
.empty h3{font-size:15px;font-weight:600;color:var(--t2);margin-bottom:3px}
.empty p{font-size:12px;line-height:1.5}

/* AUTH SCREEN */
.auth-screen{display:flex;flex-direction:column;align-items:center;padding:80px 28px 40px;gap:16px}
.auth-logo{font-size:48px}
.auth-title{font-size:22px;font-weight:700;letter-spacing:-.02em;color:var(--txt)}
.auth-tabs{display:flex;gap:0;background:var(--hov);border-radius:10px;padding:3px;margin:4px 0 8px;width:100%}
.auth-tab{flex:1;padding:9px;border-radius:8px;font-size:14px;font-weight:500;color:var(--t2);text-align:center;transition:all .15s}
.auth-tab-on{background:var(--card);color:var(--txt);font-weight:600;box-shadow:0 1px 3px rgba(0,0,0,.06)}
.auth-err{font-size:12px;color:var(--dn);text-align:center;margin:-4px 0}
      `}</style>

      <div className="phone">
        <div className="island"/>
        <div className="sysbar">
          <div className="sbl">{time}</div>
          <div className="sbr">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor"><rect x="0" y="7" width="3" height="5" rx="1" opacity=".4"/><rect x="4.5" y="4" width="3" height="8" rx="1" opacity=".6"/><rect x="9" y="1" width="3" height="11" rx="1" opacity=".8"/><rect x="13" y="0" width="3" height="12" rx="1"/></svg>
            <svg width="16" height="12" viewBox="0 0 24 18" fill="currentColor"><path d="M2 7C5 3.5 9.2 1 13.5 1s8.5 2.5 11.5 6l-2.5 2.5C20 6.8 17 5 13.5 5S7 6.8 4.5 9.5L2 7z" opacity=".5"/><path d="M6.5 11.5C8.3 9.7 10.7 8.5 13.5 8.5s5.2 1.2 7 3l-2.5 2.5c-1.2-1.2-2.8-2-4.5-2s-3.3.8-4.5 2L6.5 11.5z" opacity=".75"/><circle cx="13.5" cy="17" r="2"/></svg>
            <svg width="22" height="11" viewBox="0 0 27 13" fill="currentColor"><rect x="0" y="1" width="22" height="11" rx="3" stroke="currentColor" strokeWidth="1" fill="none" opacity=".35"/><rect x="23.5" y="4" width="2" height="5" rx="1" opacity=".35"/><rect x="2" y="3" width="14" height="7" rx="1.5" opacity=".85"/></svg>
          </div>
        </div>
        <div className="hbar"/>

        <div className="scr">
          {!isAuth?(
            <div className="scroll">
              <div className="auth-screen">
                <div className="auth-logo">🛒</div>
                <h1 className="auth-title">Shopping List</h1>
                <div className="auth-tabs">
                  <button className={`auth-tab ${authMode==="login"?"auth-tab-on":""}`} onClick={()=>{setAuthMode("login");setAuthError("")}}>Sign in</button>
                  <button className={`auth-tab ${authMode==="register"?"auth-tab-on":""}`} onClick={()=>{setAuthMode("register");setAuthError("")}}>Sign up</button>
                </div>
                <div className="fg" style={{width:"100%"}}>
                  {authMode==="register"&&<div><label className="fl">Name</label><input className="fi" placeholder="Your name" value={authName} onChange={e=>setAuthName(e.target.value)}/></div>}
                  <div><label className="fl">Email</label><input className="fi" type="email" placeholder="email@example.com" value={authEmail} onChange={e=>setAuthEmail(e.target.value)}/></div>
                  <div><label className="fl">Password</label><input className="fi" type="password" placeholder="••••••" value={authPass} onChange={e=>setAuthPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth(e)}/></div>
                  {authError&&<p className="auth-err">{authError}</p>}
                  <button className="bp" onClick={handleAuth}>{authMode==="login"?"Sign in":"Create account"}</button>
                </div>
              </div>
            </div>
          ):(
          <div className="scroll">

            {/* TOPBAR */}
            <div className="bar">
              <div className="bar-l">
                <button type="button" className="uava" title={userName} onClick={()=>setShowProfile(true)}>{ini(userName)}</button>
                <div className="ddw">
                  <button className="lbtn" onClick={()=>setShowPicker(p=>!p)}>
                    {list?.name||"Select list"}
                    <svg className={`chev ${showPicker?"open":""}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                  </button>
                  {showPicker&&<>
                    <div className="ddbg" onClick={()=>setShowPicker(false)}/>
                    <div className="ddm">
                      {lists.map(l=><button key={l.id} className={`ddi ${l.id===activeId?"ddi-on":""}`} onClick={()=>{setActiveId(l.id);setShowPicker(false);setSortTagId("")}}>
                        <span>{l.name}{l.id===defaultId&&<span className="ddi-def">Default</span>}</span>
                      </button>)}
                      <div className="ddsep"/>
                      <button className="ddi ddi-a" onClick={()=>{setShowPicker(false);setShowNew(true)}}>+ New list</button>
                      <button className="ddi ddi-a" onClick={()=>{setShowPicker(false);setShowJoin(true)}}>Join list</button>
                    </div>
                  </>}
                </div>
              </div>
              <div className="bar-r">
                <button className="ib" onClick={()=>setShowTagEd(true)} title="Labels"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></button>
                <button className="ib" onClick={()=>{setRenameDraft(list?.name||"");setShowListSettings(true)}} title="Settings"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg></button>
              </div>
            </div>

            {/* TAG SORT ROW — tap to sort by label */}
            {list&&tags.some(t=>(t.name||"").trim())&&<div className="tagrow">
              <span className="tagrow-lbl">Sort by</span>
              {tags.map((t,i)=>{const n=(t.name||"").trim();if(!n)return null;return(
                <button key={t.id||i} className={`tf ${sortTagId===t.id?"tf-on":""}`} style={tst(t,dk)} onClick={()=>setSortTagId(f=>f===t.id?"":t.id)}>{n}</button>
              )})}
            </div>}

            {/* ITEMS */}
            {list&&activeItems.length===0&&doneN===0?(
              <div className="empty">
                <span className="empty-ico">🛒</span>
                <h3>List is empty</h3>
                <p>Tap "+" to add your first item.</p>
              </div>
            ):(
              <div className={`il ${compact[list?.id]?"cpt":""}`}>
                {activeItems.map(item=>(
                  <div key={item.id} className={`iw ${swipeId===item.id?"iw-swiped":""}`}>
                    <div className="ir" onClick={()=>tap(item)} onTouchStart={e=>onTS(e,item.id)} onTouchMove={onTM} onTouchEnd={onTE}>
                      <span className="ick"/>
                      <div className="imid">
                        <span className="ititle">{item.title}</span>
                        {item.qty&&<span className="iqty">{item.qty}</span>}
                      </div>
                      <div className="iend">
                        {item.tags.length>0&&item.tags.map(tid=>{const t=tags.find(x=>x.id===tid);return t?<Chip key={tid} p={t} dk={dk} onClick={e=>{e.stopPropagation();editItem(item)}}/>:null})}
                      </div>
                    </div>
                    <button className="idel" onClick={()=>delItem(item.id)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                    </button>
                  </div>
                ))}

                {/* CHECKED ACCORDION */}
                {doneN>0&&<>
                  <div className="acc-row">
                    <button className="acc-head" onClick={()=>setShowDone(s=>!s)}>
                      <svg className={`acc-chev ${showDone?"acc-open":""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
                      <span>Bought items <span className="acc-count">({doneN})</span></span>
                    </button>
                    {showDone&&<button className="acc-del" onClick={()=>setShowConfirmClear(true)}>Delete all</button>}
                  </div>
                  {showDone&&<div className="acc-body">
                    {doneItems.map(item=>(
                      <div key={item.id} className={`iw ${swipeId===item.id?"iw-swiped":""}`}>
                        <div className="ir dn" onClick={()=>tap(item)} onTouchStart={e=>onTS(e,item.id)} onTouchMove={onTM} onTouchEnd={onTE}>
                          <span className="ick"/>
                          <div className="imid">
                            <span className="ititle">{item.title}</span>
                            {item.qty&&<span className="iqty">{item.qty}</span>}
                          </div>
                          <div className="iend">
                            {item.tags.length>0&&item.tags.map(tid=>{const t=tags.find(x=>x.id===tid);return t?<Chip key={tid} p={t} dk={dk}/>:null})}
                          </div>
                        </div>
                        <button className="idel" onClick={()=>delItem(item.id)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>}
                </>}
              </div>
            )}
          </div>
          )}


          {/* FAB */}
          {isAuth&&list&&<button className="fab" onClick={openAdd}>+ Add</button>}

          {/* TOAST */}
          {toast&&<div className="toast">{toast}</div>}

          {/* SHEETS */}
          <Sheet open={showAdd} onClose={()=>setShowAdd(false)} title={draft.editId?"Edit item":"Add to list"}>
            <div className="fg" onKeyDown={e=>{if(e.key==="Enter")submit(e)}}>
              <div className="frow-fields">
                <div style={{flex:1}}><label className="fl">Name</label><input ref={inp} className="fi" placeholder="e.g. Yogurt" value={draft.title} onChange={e=>setDraft(d=>({...d,title:e.target.value}))}/></div>
                <div style={{width:90}}><label className="fl">Qty</label><input className="fi" placeholder="e.g. 2x" value={draft.qty} onChange={e=>setDraft(d=>({...d,qty:e.target.value}))}/></div>
              </div>
              <div><label className="fl">Labels</label>
                <div className="tpick">{tags.filter(t=>t.name||t.borderColor||t.fillColor).map(t=>(
                  <Chip key={t.id} p={t} dk={dk} cls={`tp ${draft.tags.includes(t.id)?"tpon":""}`}
                    onClick={()=>setDraft(d=>({...d,tags:d.tags.includes(t.id)?d.tags.filter(x=>x!==t.id):[...d.tags,t.id]}))}/>
                ))}</div>
              </div>
              <button className="bp" onClick={submit}>{draft.editId?"Save":"Add"}</button>
            </div>
          </Sheet>

          <Sheet open={showNew} onClose={()=>setShowNew(false)} title="New list">
            <div className="fg">
              <div><label className="fl">Name</label><input className="fi" placeholder="e.g. Weekly groceries" value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&mkList()}/></div>
              <button className="bp" onClick={mkList}>Create</button>
            </div>
          </Sheet>

          <Sheet open={showJoin} onClose={()=>setShowJoin(false)} title="Join a list">
            <div className="fg">
              <div><label className="fl">Code</label><input className="fi" placeholder="e.g. ABC123" value={joinVal} onChange={e=>setJoinVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&jnList()} style={{textTransform:"uppercase",letterSpacing:".1em",fontWeight:600}}/></div>
              <button className="bp" onClick={jnList}>Join</button>
            </div>
          </Sheet>


          <Sheet open={showTagEd} onClose={()=>setShowTagEd(false)} title="Edit labels">
            {list&&<>
              <div className="ttabs">{tags.map((t,i)=>(
                <button key={t.id||i} className={`ttab ${i===tagTab?"on":""}`} onClick={()=>setTagTab(i)}><Chip p={t} dk={dk}/></button>
              ))}</div>
              {tags[tagTab]&&(
                <div className="fg">
                  <div><label className="fl">Name</label><input className="fi" placeholder="e.g. Lidl" value={tags[tagTab].name||""} onChange={e=>upTag(tagTab,{name:e.target.value})}/></div>
                  {["borderColor","fillColor","textColor"].map((prop,pi)=>(
                    <div key={prop} className="csec">
                      <div className="csl">{["Border","Fill","Text"][pi]}</div>
                      <div className="cgrid">{COLORS.map((c,ci)=>(
                        <button key={`${prop}-${c}`} className={`cdot ${tags[tagTab][prop]===c?"sel":""}`} style={{background:c}}
                          onClick={()=>upTag(tagTab,{[prop]:tags[tagTab][prop]===c?"":c})} title={COLOR_NAMES[ci]}>{tags[tagTab][prop]===c?"✓":""}</button>
                      ))}</div>
                    </div>
                  ))}
                  <button className="bg2" onClick={()=>upTag(tagTab,{name:"",borderColor:"",fillColor:"",textColor:""})}>Clear label</button>
                </div>
              )}
            </>}
          </Sheet>


          <Sheet open={showProfile} onClose={()=>setShowProfile(false)} title="Profile & settings">
            <div className="fg">
              <div>
                <label className="fl">Display name</label>
                <input className="fi" value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Your name"/>
              </div>
              <div className="srow"><span className="slbl">{dk?"Dark mode":"Light mode"}</span>
                <div className="dtog">
                  <button type="button" className={`dtog-btn ${dk?"dtog-on":""}`} onClick={()=>setDk(d=>!d)}>
                    <span className="dtog-track"><span className="dtog-thumb"/></span>
                  </button>
                </div>
              </div>
              <div style={{height:1,background:"var(--bs)",margin:"4px 0"}}/>
              <button className="dng-btn" onClick={signOut}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                Sign out
              </button>
            </div>
          </Sheet>

          <Sheet open={showListSettings} onClose={()=>setShowListSettings(false)} title="List settings">
            {list&&<div className="fg">
              <div>
                <label className="fl">List name</label>
                <div style={{display:"flex",gap:8}}>
                  <input className="fi" value={renameDraft} onChange={e=>setRenameDraft(e.target.value)} placeholder="List name" onKeyDown={e=>{if(e.key==="Enter"){const n=renameDraft.trim();if(n){up(list.id,l=>({...l,name:n}));setShowListSettings(false)}}}}/>
                  <button className="bp" style={{width:"auto",padding:"0 16px",marginTop:0,flexShrink:0}} onClick={()=>{const n=renameDraft.trim();if(n){up(list.id,l=>({...l,name:n}));setShowListSettings(false)}}}>Save</button>
                </div>
              </div>
              <div className="srow"><span className="slbl">Compact view</span>
                <div className="dtog">
                  <button type="button" className={`dtog-btn ${compact[list.id]?"dtog-on":""}`} onClick={()=>setCompact(c=>({...c,[list.id]:!c[list.id]}))}>
                    <span className="dtog-track"><span className="dtog-thumb"/></span>
                  </button>
                </div>
              </div>
              <div className="srow" style={{borderBottom:"none"}}><span className="slbl">Default list</span>
                <div className="dtog">
                  {defaultId&&defaultId!==list.id?(
                    <button type="button" className="dtog-btn dtog-dis" disabled title="Another list is set as default">
                      <span className="dtog-track"><span className="dtog-thumb"/></span>
                    </button>
                  ):(
                    <button type="button" className={`dtog-btn ${defaultId===list.id?"dtog-on":""}`} onClick={()=>setDefaultId(defaultId===list.id?"":list.id)}>
                      <span className="dtog-track"><span className="dtog-thumb"/></span>
                    </button>
                  )}
                </div>
              </div>
              {defaultId&&defaultId!==list.id?(
                <p style={{fontSize:11,color:"var(--t3)",marginTop:-4}}>
                  "{lists.find(l=>l.id===defaultId)?.name||"Another list"}" is currently set as default. Disable it there first.
                </p>
              ):(
                <p style={{fontSize:11,color:"var(--t3)",marginTop:-4}}>The default list opens automatically when you launch the app.</p>
              )}
              <div style={{height:1,background:"var(--bs)",margin:"8px 0 4px"}}/>
              <label className="fl">Members & sharing</label>
              <div className="scbar">
                <span style={{fontSize:11,color:"var(--t2)"}}>Code:</span>
                <span className="scode">{list.code}</span>
                <button className="cpbtn" onClick={copyCode}>Copy</button>
              </div>
              {members.map(m=>(
                <div key={m.id} className="mrow">
                  <button type="button" className="ava" style={{width:28,height:28,fontSize:11,borderColor:mc(m.id).border}} title={m.name}>{ini(m.name)}</button>
                  <div style={{flex:1}}><div className="mn">{m.name}</div><div className="me">{m.email}</div></div>
                  {m.id===list.ownerId&&<span className="mob">Owner</span>}
                  {isOwner&&m.id!==ME&&<button className="dbtn" onClick={()=>up(list.id,l=>({...l,members:l.members.filter(x=>x.id!==m.id)}))}>Remove</button>}
                </div>
              ))}
            </div>}
          </Sheet>

          <Sheet open={showReturn} onClose={()=>{setShowReturn(false);setReturnTarget(null)}} title="Return item">
            {returnTarget&&<div className="fg">
              <div className="frow-fields">
                <div style={{flex:1}}><label className="fl">Name</label><input className="fi" value={draft.title} onChange={e=>setDraft(d=>({...d,title:e.target.value}))}/></div>
                <div style={{width:90}}><label className="fl">Qty</label><input className="fi" placeholder="e.g. 2x" value={draft.qty} onChange={e=>setDraft(d=>({...d,qty:e.target.value}))}/></div>
              </div>
              <div><label className="fl">Labels</label>
                <div className="tpick">{tags.filter(t=>t.name||t.borderColor||t.fillColor).map(t=>(
                  <Chip key={t.id} p={t} dk={dk} cls={`tp ${draft.tags.includes(t.id)?"tpon":""}`}
                    onClick={()=>setDraft(d=>({...d,tags:d.tags.includes(t.id)?d.tags.filter(x=>x!==t.id):[...d.tags,t.id]}))}/>
                ))}</div>
              </div>
              <button className="bp" onClick={()=>{if(!list||!returnTarget)return;const t=draft.title.trim();if(!t)return;up(list.id,l=>({...l,items:l.items.map(i=>i.id===returnTarget.id?{...i,title:t,qty:draft.qty.trim(),tags:draft.tags,done:false}:i)}));setShowReturn(false);setReturnTarget(null)}}>Return item to the list</button>
            </div>}
          </Sheet>

          {showConfirmClear&&<div className="pop-overlay" onClick={()=>setShowConfirmClear(false)}>
            <div className="pop-card" onClick={e=>e.stopPropagation()}>
              <h3 className="pop-title">Delete all bought items?</h3>
              <p className="pop-msg">Are you sure? This will permanently remove {doneN} bought {doneN===1?"item":"items"}.</p>
              <div className="pop-btns">
                <button className="pop-cancel" onClick={()=>setShowConfirmClear(false)}>Cancel</button>
                <button className="pop-confirm" onClick={()=>{clrDone();setShowConfirmClear(false)}}>Delete</button>
              </div>
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
