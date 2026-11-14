import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const cookieName="chaos_session";
export const sessionAge=60*60*24*14;

function sign(payload:string){
  const secret=process.env.SESSION_SECRET;
  if(!secret||secret.length<32) throw new Error("Set a SESSION_SECRET of at least 32 characters.");
  return createHmac("sha256",secret).update(payload).digest("base64url");
}

export function equal(a:string,b:string){
  const left=Buffer.from(a),right=Buffer.from(b);
  return left.length===right.length&&timingSafeEqual(left,right);
}

export function sessionFor(userId:string){
  const payload=userId+"."+Math.floor(Date.now()/1000+sessionAge);
  return payload+"."+sign(payload);
}

export async function getUser(){
  const value=(await cookies()).get(cookieName)?.value;
  if(!value) return null;
  const [userId,expires,signature,...extra]=value.split(".");
  if(extra.length||!userId||!signature||!/^\d+$/.test(expires)||Number(expires)<=Date.now()/1000) return null;
  return equal(signature,sign(userId+"."+expires))?{userId}:null;
}
