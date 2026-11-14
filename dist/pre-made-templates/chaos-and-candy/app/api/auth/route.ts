import { createHash,randomBytes,randomUUID,scrypt as derive } from "node:crypto";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { cookieName,equal,sessionAge,sessionFor } from "../../auth";
import { db } from "../../../db/database";

const scrypt=promisify(derive);
const error=(message:string,status=400)=>NextResponse.json({error:message},{status});
const cookieOptions={httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax" as const,path:"/"};

export async function POST(req:Request){
  if(!req.headers.get("content-type")?.startsWith("application/json")) return error("Expected JSON.",415);
  const raw=await req.text();
  if(raw.length>4096) return error("Request too large.",413);
  let input;
  try{input=JSON.parse(raw);}catch{return error("Invalid request.");}
  if(input?.action==="logout"){
    const response=NextResponse.json({ok:true});
    response.cookies.set(cookieName,"",{...cookieOptions,maxAge:0});
    return response;
  }
  const username=typeof input?.username==="string"?input.username.trim().toLowerCase():"";
  const password=typeof input?.password==="string"?input.password:"";
  if(!["register","login"].includes(input?.action)||!/^[-_a-z0-9]{3,24}$/.test(username)||password.length<12||password.length>128) return error("Use a 3–24 character username and a password of 12–128 characters.");
  if((process.env.SESSION_SECRET?.length??0)<32) return error("Sign-in setup is incomplete.",503);
  const database=db(), window=Math.floor(Date.now()/600000);
  const client=(process.env.VERCEL?req.headers.get("x-vercel-forwarded-for"):"local")??"unknown";
  const bucket=createHash("sha256").update(input.action+"|"+client+"|"+(input.action==="login"?username:"")).digest("hex");
  const attempts=await database.prepare("INSERT INTO auth_attempts VALUES (?,?,1) ON CONFLICT(bucket) DO UPDATE SET attempts=CASE WHEN window=excluded.window THEN MIN(attempts+1,13) ELSE 1 END,window=excluded.window RETURNING attempts").bind(bucket,window).first<{attempts:number}>();
  if((attempts?.attempts??13)>12) return error("Too many attempts. Try again in a few minutes.",429);

  let id:string;
  if(input.action==="register"){
    const invite=process.env.CLUB_INVITE_CODE;
    if(!invite||typeof input.invite!=="string"||!equal(input.invite,invite)) return error("A valid club invite code is required.",403);
    const salt=randomBytes(16).toString("hex");
    const hash=(await scrypt(password,salt,64) as Buffer).toString("hex");
    id=randomUUID();
    const created=await database.prepare("INSERT INTO accounts VALUES (?,?,?) ON CONFLICT(username) DO NOTHING").bind(id,username,salt+":"+hash).run();
    if(!created.meta.changes) return error("That username is already taken.",409);
  }else{
    const account=await database.prepare("SELECT id,password_hash FROM accounts WHERE username=?").bind(username).first<{id:string;password_hash:string}>();
    const [salt,hash]=(account?.password_hash??"00000000000000000000000000000000:").split(":");
    const calculated=(await scrypt(password,salt,64) as Buffer).toString("hex");
    if(!account||!equal(hash,calculated)) return error("Username or password is incorrect.",401);
    id=account.id;
  }
  const response=NextResponse.json({ok:true});
  response.cookies.set(cookieName,sessionFor(id),{...cookieOptions,maxAge:sessionAge});
  return response;
}
