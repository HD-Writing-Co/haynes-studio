"use client";

import { useCallback,useEffect,useRef,useState,type FormEvent } from "react";
import { ArrowRight,AudioLines,ChevronDown,ChevronRight,DoorOpen,Hash,Headphones,Menu,Mic,MicOff,Plus,Radio,Send,Settings2,Sparkles,Users,X,Zap } from "lucide-react";
import { avatars,houseRooms,type Profile,type Room } from "./club-data";
import { Voice,type Peer,type Signal } from "./voice";

type Message={id:number;user:string;name:string;avatar:string;body:string;created:number};
type ClubData={me:Profile|null;rooms:Room[];messages:Message[];members:Profile[];counts:{room:string;total:number}[];peers:Peer[];signals:Signal[]};
const empty:ClubData={me:null,rooms:houseRooms,messages:[],members:[],counts:[],peers:[],signals:[]};
async function api<T>(values?:Record<string,unknown>,query?:URLSearchParams):Promise<T>{
  const response=await fetch("/api/club"+(query?"?"+query:""),values?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(values)}:{cache:"no-store"});
  if(!response.ok){
    const failure=await response.json().catch(()=>null) as {error?:string}|null;
    throw new Error(failure?.error||"The club is temporarily unavailable.");
  }
  return response.json() as Promise<T>;
}
async function apiLogout(){
  const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logout"})});
  if(!response.ok) throw new Error("Sign-out failed. Try again.");
}
const errorText=(e:unknown)=>e instanceof Error?e.message:"Something went wrong.";

export default function Club({signedIn,signIn}:{signedIn:boolean;signIn:string}){
  const [data,setData]=useState<ClubData>(empty),[roomId,setRoomId]=useState("lobby"),[dialog,setDialog]=useState<"profile"|"room"|null>(null);
  const [loaded,setLoaded]=useState(false),[nav,setNav]=useState(false),[people,setPeople]=useState(false),[member,setMember]=useState<Profile|null>(null);
  const [draft,setDraft]=useState(""),[error,setError]=useState(""),[sending,setSending]=useState(false);
  const [name,setName]=useState(""),[bio,setBio]=useState(""),[avatar,setAvatar]=useState(avatars[0]),[kind,setKind]=useState("voice"),[saving,setSaving]=useState(false);
  const [joined,setJoined]=useState(false),[muted,setMuted]=useState(false),[joining,setJoining]=useState(false),[voiceStatus,setVoiceStatus]=useState("");
  const voice=useRef<Voice|null>(null), end=useRef<HTMLDivElement>(null), lastBeat=useRef(0), modal=useRef<HTMLDialogElement>(null), revision=useRef(0);
  const me=data.me, room=data.rooms.find(r=>r.id===roomId)??houseRooms[0], hasProfile=!!me;

  const refresh=useCallback(async (id:string,beat=false)=>{
    const current=voice.current?.room===id?voice.current:null;
    const started=++revision.current;
    if(beat && Date.now()-lastBeat.current>6500){
      lastBeat.current=Date.now();
      await api({action:"presence",room:id,session:current?.session});
    }
    const params=new URLSearchParams({room:id});
    if(current){params.set("session",current.session);params.set("after",String(current.cursor));}
    const next=await api<ClubData>(undefined,params);
    if(started!==revision.current) return;
    setData(next);setLoaded(true);
    if(current===voice.current && current){
      if(!next.peers.some(p=>p.session===current.session)){
        current.close();voice.current=null;setJoined(false);setMuted(false);setVoiceStatus("Voice session expired. Join again to reconnect.");
      } else await current.sync(next.peers,next.signals);
    }
  },[]);

  useEffect(()=>{
    if(!signedIn) return;
    let stopped=false, timer:ReturnType<typeof setTimeout>;
    lastBeat.current=0;
    const loop=async()=>{
      try {await refresh(roomId,hasProfile);}
      catch(e){if(!stopped) setError(errorText(e));}
      if(!stopped) timer=setTimeout(loop,voice.current?1100:2400);
    };
    void loop();
    return ()=>{stopped=true;clearTimeout(timer);revision.current++;};
  },[signedIn,hasProfile,roomId,refresh]);

  useEffect(()=>{if(dialog||member) modal.current?.showModal();else modal.current?.close();},[dialog,member]);
  useEffect(()=>{const list=end.current?.parentElement;if(list) list.scrollTop=list.scrollHeight;},[data.messages.at(-1)?.id,roomId]);
  useEffect(()=>{
    const release=()=>{
      const current=voice.current;
      if(!current) return;
      current.close();voice.current=null;
      void fetch("/api/club",{method:"POST",keepalive:true,headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"leave",room:current.room,session:current.session})}).catch(()=>{});
    };
    window.addEventListener("pagehide",release);
    return ()=>window.removeEventListener("pagehide",release);
  },[]);

  function openProfile(){setError("");setName(me?.name??"");setAvatar(me?.avatar??avatars[0]);setBio(me?.bio??"");setDialog("profile");}
  function openRoom(){
    if(joining) return;
    if(!signedIn){window.top!.location.href=signIn;return;}
    if(!me){openProfile();return;}
    setError("");setName("");setBio("");setKind("voice");setDialog("room");
  }
  function leave(){
    const current=voice.current;
    if(!current) return;
    voice.current=null; current.close();setJoined(false);setMuted(false);setVoiceStatus("");
    void api({action:"leave",room:current.room,session:current.session}).catch(()=>{});
  }
  function select(id:string){
    if(joining) return;
    if(id!==roomId){
      leave();revision.current++;setRoomId(id);setData(old=>({...old,messages:[],peers:[]}));setDraft("");setError("");setVoiceStatus("");
    }
    setNav(false);
  }
  async function save(event:FormEvent){
    event.preventDefault();setSaving(true);setError("");
    try {
      if(dialog==="profile"){
        await api({action:"profile",name,bio,avatar});await refresh(roomId);
      }else{
        const result=await api<{id:string}>({action:"create",name,description:bio,kind});
        await refresh(result.id);
        leave();setRoomId(result.id);setDraft("");
      }
      setDialog(null);
    }catch(e){setError(errorText(e));}finally{setSaving(false);}
  }
  async function message(event:FormEvent){
    event.preventDefault();
    if(!draft.trim()||sending) return;
    setSending(true);setError("");
    try {await api({action:"message",room:roomId,body:draft});setDraft("");await refresh(roomId);}
    catch(e){setError(errorText(e));}finally{setSending(false);}
  }
  async function join(){
    if(joining||voice.current) return;
    if(!signedIn){window.top!.location.href=signIn;return;}
    if(!me){openProfile();return;}
    setJoining(true);setError("");setVoiceStatus("");
    let stream:MediaStream|undefined;
    let current:Voice|undefined;
    const requestedRoom=roomId;
    try {
      if(!navigator.mediaDevices?.getUserMedia) throw new Error("Open the club in its own browser tab to use your microphone.");
      stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}});
      const {servers}=await api<{servers:RTCIceServer[]}>({action:"ice",room:requestedRoom,session:crypto.randomUUID()});
      current=new Voice(requestedRoom,stream,(to,payload)=>api({action:"signal",room:requestedRoom,session:current!.session,to,payload}),setVoiceStatus,servers);
      await api({action:"join",room:requestedRoom,session:current.session});
      voice.current=current;setJoined(true);
      await refresh(requestedRoom);
    }catch(e){
      if(current){current.close();void api({action:"leave",room:requestedRoom,session:current.session}).catch(()=>{});}
      else stream?.getTracks().forEach(track=>track.stop());
      voice.current=null;setJoined(false);
      setError(e instanceof DOMException?"Microphone access failed. Check your browser permissions and try again.":errorText(e));
    }finally{setJoining(false);}
  }
  const count=(id:string)=>data.counts.find(x=>x.room===id)?.total??0;
  const canChat=signedIn&&!!me;
  const action=()=>signedIn?openProfile():window.top!.location.assign(signIn);

  return <div className="shell">
    <button className="mobile-shade" hidden={!nav} onClick={()=>setNav(false)} aria-label="Close room menu"/>
    <aside className={"sidebar"+(nav?" open":"")}>
      <button className="brand" onClick={()=>select("lobby")} disabled={joining}><span className="logo"><Zap size={22} fill="currentColor"/></span><span><strong>CHAOS <b>&amp;</b> CANDY</strong><small>THE SOCIAL CLUB</small></span></button>
      <div className="side-scroll">
        <button className={"side-link home"+(roomId==="lobby"?" chosen":"")} disabled={joining} onClick={()=>select("lobby")}><Sparkles size={17}/> Club Lobby</button>
        {["text","voice"].map(type=><section className="channels" key={type}><div className="section-title"><span><ChevronDown size={13}/>{type==="text"?"TEXT ROOMS":"VOICE ROOMS"}</span><button title={"Create "+type+" room"} aria-label={"Create "+type+" room"} onClick={()=>{openRoom();setKind(type);}}><Plus size={17}/></button></div>{data.rooms.filter(r=>r.kind===type&&(r.id!=="lobby"||roomId!=="lobby")).map(r=><button key={r.id} disabled={joining} className={"side-link"+(r.id===roomId?" chosen":"")} onClick={()=>select(r.id)}>{type==="text"?<Hash size={17}/>:<AudioLines size={17}/>}<span>{r.name}</span>{type==="voice"&&count(r.id)>0&&<em>{count(r.id)}</em>}</button>)}</section>)}
        <button className="create" onClick={openRoom}><Plus size={18}/> Create room</button>
      </div>
      <div className="side-profile"><button className="identity" onClick={action}><span className="avatar">{me?.avatar??"👾"}</span><span><strong>{me?.name??"Your profile"}</strong><small>{me?"Edit profile":"Choose an avatar"}</small></span><Settings2 size={17}/></button>{signedIn&&<button className="sign-out" onClick={async()=>{try{await apiLogout();leave();window.location.assign("/");}catch(e){setError(errorText(e));}}}>Sign out</button>}</div>
    </aside>

    <main className="main">
      <header className="top"><button className="icon mobile-menu" aria-label="Open room menu" onClick={()=>setNav(true)}><Menu size={22}/></button><div className="crumb"><span>Club</span><ChevronRight size={14}/><strong>{room.name}</strong></div><button className="online" aria-expanded={people} onClick={()=>setPeople(!people)}><i/>{data.members.length} online<Users size={16}/></button></header>
      <div className="content">
        {room.id==="lobby"?<>
          <section className="hero"><div className="hero-copy"><div className="eyebrow"><Zap size={14} fill="currentColor"/> THE SOCIAL CLUB</div><h1>Chaos <span>&amp; Candy</span></h1><p>Drop into a room, meet new people, and make the night your own.</p><button className="primary" onClick={()=>canChat?select("neon-lounge"):action()}>{canChat?"Explore voice rooms":signedIn?"Set up your profile":"Enter the club"}<ArrowRight size={17}/></button></div></section>
          <section className="quick"><div className="quick-head"><h2>Find your room</h2><button onClick={openRoom}><Plus size={16}/> Create a room</button></div><div className="cards">
            {[houseRooms[3],houseRooms[1],houseRooms[4]].map((r,i)=><button key={r.id} className={"room-card tone"+i} onClick={()=>select(r.id)}><span className="room-icon">{i===0?<Headphones size={22}/>:i===1?<Hash size={22}/>:<Mic size={22}/>}</span><span className="room-copy"><strong>{r.name}</strong><small>{r.kind==="voice"?`Voice · ${count(r.id)}/6 in room`:"Text chat"}</small></span><ChevronRight size={17}/></button>)}
          </div></section>
        </>:<section className={"room-hero "+(room.kind==="voice"?"voice-hero":"")}><div className="eyebrow">{room.kind==="voice"?<Radio size={15}/>:<Hash size={15}/>} {room.kind==="voice"?"VOICE ROOM":"TEXT ROOM"}</div><h1>{room.name}</h1><p>{room.description||"Make yourself at home."}</p>{room.kind==="voice"&&<div className="voice-controls">
          {joined?<><button className="primary" onClick={()=>{voice.current?.mute(!muted);setMuted(!muted);}}>{muted?<MicOff size={17}/>:<Mic size={17}/>} {muted?"Unmute":"Mute"}</button><button className="subtle" onClick={leave}><DoorOpen size={17}/> Leave voice</button><button className="subtle" onClick={()=>voice.current?.enableAudio()}><Headphones size={16}/> Enable audio</button></>:<button className="primary" disabled={joining||count(room.id)>=6} onClick={join}><Mic size={17}/>{joining?"Connecting…":count(room.id)>=6?"Room is full":"Join voice"}</button>}
          <span>{count(room.id)}/6 in voice</span>
        </div>}{joined&&data.peers.length>0&&<div className="peer-list">{data.peers.map(p=><span key={p.session}>{p.avatar} {p.name}</span>)}</div>}{voiceStatus&&<p role="status">{voiceStatus}</p>}</section>}

        <section className="chat"><header><span className="chat-icon"><Hash size={20}/></span><div><h2>{room.id==="lobby"?"Lobby chat":room.kind==="voice"?"Room chat":room.name}</h2><p>{room.id==="lobby"?"The place to say hello.":room.kind==="voice"?"Text chat for everyone in this room.":room.description||"Talk with other club members."}</p></div></header>
          <div className="messages" aria-label="Room messages">
            {!data.messages.length&&<div className="empty">{signedIn&&!loaded?"Connecting to the club…":"No messages yet. Start the conversation."}</div>}
            {data.messages.map(m=><article className="message" key={m.id}><button className="avatar" aria-label={"View "+m.name+"'s profile"} onClick={()=>setMember(data.members.find(p=>p.id===m.user)??{id:m.user,name:m.name,avatar:m.avatar,bio:""})}>{m.avatar}</button><div><strong>{m.name}</strong><time dateTime={new Date(m.created).toISOString()}>{new Date(m.created).toLocaleTimeString([],{hour:"numeric",minute:"2-digit"})}</time><p>{m.body}</p></div></article>)}
            <div ref={end}/>
          </div>
          {error&&!dialog&&<p className="error" role="alert">{error}</p>}
          {canChat?<form className="composer" onSubmit={message}><input aria-label="Message" placeholder={`Message #${room.name.toLowerCase().replaceAll(" ","-")}`} value={draft} maxLength={1000} onChange={e=>setDraft(e.target.value)}/><button className="primary" aria-label="Send message" disabled={sending||!draft.trim()}><Send size={17}/></button></form>:<div className="composer"><span>{signedIn?"Set up your profile to post.":"Sign in to join the conversation."}</span><button className="subtle" onClick={action}>{signedIn?"Set up profile":"Sign in"}<ArrowRight size={15}/></button></div>}
        </section>
      </div>
    </main>

    <aside className={"people"+(people?" open":"")}><header><span><Users size={17}/> Club members</span><button className="icon people-close" aria-label="Close members" onClick={()=>setPeople(false)}><X size={18}/></button></header><div className="people-inner"><div className="section-title"><span><i/> ONLINE · {data.members.length}</span></div>{data.members.length===0&&<p className="people-empty">Members appear here when they’re in the club.</p>}{data.members.map(p=><button className="person" key={p.id} onClick={()=>p.id===me?.id?openProfile():setMember(p)}><span className="avatar">{p.avatar}</span><span><strong>{p.name}</strong><small>{p.id===me?.id?"You":"Online"}</small></span></button>)}</div></aside>

    <dialog ref={modal} onCancel={()=>{setDialog(null);setMember(null);}} className="modal">
      <button className="icon close" aria-label="Close dialog" onClick={()=>{setDialog(null);setMember(null);}}><X size={22}/></button>
      {member?<><span className="avatar profile-avatar">{member.avatar}</span><h2>{member.name}</h2>{member.bio&&<p>{member.bio}</p>}</>:<><h2>{dialog==="room"?"Create room":"Your club profile"}</h2><form onSubmit={save}>
        <label>{dialog==="room"?"Room name":"Nickname"}<input autoFocus required minLength={2} maxLength={dialog==="room"?32:24} value={name} onChange={e=>setName(e.target.value)}/></label>
        <label>{dialog==="room"?"Description":"Bio"}<textarea maxLength={dialog==="room"?100:180} rows={2} value={bio} onChange={e=>setBio(e.target.value)}/></label>
        {dialog==="room"?<label>Room type<select value={kind} onChange={e=>setKind(e.target.value)}><option value="voice">Voice + text</option><option value="text">Text only</option></select></label>:<fieldset><legend>Avatar</legend><div className="avatar-picker">{avatars.map(a=><button type="button" key={a} onClick={()=>setAvatar(a)} aria-label={a} aria-pressed={a===avatar}>{a}</button>)}</div></fieldset>}
        {error&&<p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={saving}>{saving?"Saving…":dialog==="room"?"Create room":"Save profile"}</button>
      </form></>}
    </dialog>
  </div>;
}
