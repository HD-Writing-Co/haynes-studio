import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

type Value = string | number | null;
type Result = {results:Record<string,unknown>[];meta:{changes:number}};
type Statement = {sql:string;args:Value[]};
type Cell = {type:string;value?:string|number};
type Pipeline = {results:Array<{type:string;error?:{message:string};response?:{result:{cols:{name:string}[];rows:Cell[][];affected_row_count:number}}}>};

let local:DatabaseSync|undefined;
async function execute(statements:Statement[]):Promise<Result[]>{
  const url=process.env.TURSO_DATABASE_URL;
  if(!url){
    if(process.env.VERCEL) throw new Error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in Vercel.");
    const path=process.env.LOCAL_DATABASE_PATH??".local/club.sqlite";
    mkdirSync(dirname(path),{recursive:true});
    local??=new DatabaseSync(path);
    return statements.map(({sql,args})=>{
      const statement=local!.prepare(sql);
      return /^\s*SELECT\b|\bRETURNING\b/i.test(sql)
        ?{results:statement.all(...args),meta:{changes:0}}
        :{results:[],meta:{changes:Number(statement.run(...args).changes)}};
    });
  }
  const token=process.env.TURSO_AUTH_TOKEN;
  if(!token) throw new Error("TURSO_AUTH_TOKEN is required.");
  const endpoint=new URL("/v2/pipeline",url.replace(/^libsql:/,"https:"));
  if(endpoint.protocol!=="https:") throw new Error("Use a secure Turso database URL.");
  const response=await fetch(endpoint,{method:"POST",cache:"no-store",signal:AbortSignal.timeout(8000),
    headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json"},
    body:JSON.stringify({baton:null,requests:[...statements.map(({sql,args})=>({type:"execute",stmt:{sql,want_rows:true,args:args.map(value=>value===null?{type:"null"}:typeof value==="number"?{type:"integer",value:String(value)}:{type:"text",value})}})),{type:"close"}]})});
  if(!response.ok) throw new Error(`Database request failed (${response.status}).`);
  const payload=await response.json() as Pipeline;
  return statements.map((_,index)=>{
    const item=payload.results[index];
    const result=item?.response?.result;
    if(item?.type!=="ok"||!result) throw new Error(item?.error?.message??"Database returned no result.");
    return {meta:{changes:result.affected_row_count},results:result.rows.map(row=>Object.fromEntries(result.cols.map(({name},i)=>{
      const cell=row[i];
      return [name,cell.type==="null"?null:cell.type==="integer"||cell.type==="float"?Number(cell.value):cell.value];
    })))};
  });
}

function bind(sql:string,args:Value[]){
  const statement={sql,args};
  return {statement,async first<T=Record<string,unknown>>(){return (await execute([statement]))[0].results[0] as T|undefined;},
    async run(){return (await execute([statement]))[0];}};
}

export function db(){
  return {prepare:(sql:string)=>({...bind(sql,[]),bind:(...args:Value[])=>bind(sql,args)}),
    batch:(statements:{statement:Statement}[])=>execute(statements.map(item=>item.statement))};
}
