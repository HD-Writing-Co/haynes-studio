"use client";

import Link from "next/link";
import { useState,type FormEvent } from "react";
import { ArrowLeft,Zap } from "lucide-react";

export default function SignIn(){
  const [register,setRegister]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    setBusy(true);setError("");
    try{
      const values=Object.fromEntries(new FormData(event.currentTarget));
      const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...values,action:register?"register":"login"})});
      if(!response.ok) throw new Error((await response.json().catch(()=>null))?.error??"Sign-in is temporarily unavailable.");
      window.location.assign("/");
    }catch(e){setError(e instanceof Error?e.message:"Try again.");setBusy(false);}
  }
  return <main className="auth-shell"><section className="auth-card">
    <Link className="auth-back" href="/"><ArrowLeft size={16}/> Back to the club</Link>
    <span className="logo"><Zap size={22} fill="currentColor"/></span>
    <h1>{register?"Join Chaos & Candy":"Sign in to Chaos & Candy"}</h1>
    <form onSubmit={submit}>
      <label>Username<input name="username" required minLength={3} maxLength={24} pattern="[a-zA-Z0-9_\-]+" autoComplete="username"/></label>
      <label>Password<input name="password" type="password" required minLength={12} maxLength={128} autoComplete={register?"new-password":"current-password"}/></label>
      {register&&<label>Club invite code<input name="invite" required type="password" autoComplete="off"/></label>}
      {error&&<p className="error" role="alert">{error}</p>}
      <button className="primary" disabled={busy}>{busy?"Please wait…":register?"Create account":"Sign in"}</button>
    </form>
    <button className="auth-switch" onClick={()=>{setRegister(!register);setError("");}} disabled={busy}>{register?"Already a member? Sign in":"Have an invite code? Create an account"}</button>
  </section></main>;
}
