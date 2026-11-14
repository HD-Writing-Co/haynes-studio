import { readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

const sql=readFileSync(new URL("../db/schema.sql",import.meta.url),"utf8");
const url=process.env.TURSO_DATABASE_URL;
if(!url){
  const path=process.env.LOCAL_DATABASE_PATH??".local/club.sqlite";
  mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);
  db.exec(sql);
  db.close();
}else{
  const token=process.env.TURSO_AUTH_TOKEN;
  if(!token) throw new Error("Set TURSO_AUTH_TOKEN first.");
  const endpoint=new URL("/v2/pipeline",url.replace(/^libsql:/,"https:"));
  if(endpoint.protocol!=="https:") throw new Error("Use a secure Turso database URL.");
  const response=await fetch(endpoint,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:JSON.stringify({baton:null,requests:[{type:"sequence",sql},{type:"close"}]})});
  if(!response.ok) throw new Error(`Database setup failed (${response.status}).`);
  const {results}=await response.json();
  if(results.some(item=>item.type!=="ok")) throw new Error(results.find(item=>item.type!=="ok").error.message);
}
console.log("Chaos & Candy database is ready.");
