import { db } from "../../../db/database";
import { getUser } from "../../auth";
import { avatars, houseRooms, type Room } from "../../club-data";

export const dynamic = "force-dynamic";
const reply = (data:unknown,status=200) => Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
const fail = (error:string,status=400) => reply({error},status);
const clean = (x:unknown,max:number) => typeof x==="string" ? x.trim().slice(0,max) : "";
const token = (x:unknown) => typeof x==="string" && /^[a-f0-9-]{36}$/.test(x) ? x : "";
export const runtime = "nodejs";
async function getRoom(id:string) {
  return houseRooms.find(r=>r.id===id) ?? await db().prepare("SELECT id,name,description,kind,owner FROM rooms WHERE id=?").bind(id).first<Room>();
}

export async function GET(req:Request) {
  const user=await getUser();
  if(!user) return fail("Sign in to enter the club.",401);
  const q=new URL(req.url).searchParams;
  const room=await getRoom(clean(q.get("room"),64));
  if(!room) return fail("This room is unavailable.",404);
  const now=Date.now();
  const session=token(q.get("session"));
  const database=db();
  const statements=[
    database.prepare("SELECT * FROM profiles WHERE id=?").bind(user.userId),
    database.prepare("SELECT id,name,description,kind,owner FROM rooms ORDER BY created DESC LIMIT 100"),
    database.prepare("SELECT m.id,m.body,m.created,p.id AS user,p.name,p.avatar FROM messages m JOIN profiles p ON m.user=p.id WHERE room=? ORDER BY m.id DESC LIMIT 80").bind(room.id),
    database.prepare("SELECT p.* FROM presence a JOIN profiles p ON a.user=p.id WHERE a.seen>? ORDER BY p.name LIMIT 80").bind(now-35000),
    database.prepare("SELECT room,COUNT(*) AS total FROM voice WHERE seen>? GROUP BY room").bind(now-20000),
  ];
  if(session && room.kind==="voice") statements.push(
    database.prepare("SELECT v.session,p.name,p.avatar FROM voice v JOIN profiles p ON v.user=p.id WHERE v.room=? AND v.seen>? AND EXISTS (SELECT 1 FROM voice WHERE room=? AND session=? AND user=? AND seen>?)").bind(room.id,now-20000,room.id,session,user.userId,now-20000),
    database.prepare("SELECT id,sender,payload FROM signals WHERE room=? AND recipient=? AND id>? AND created>? AND EXISTS (SELECT 1 FROM voice WHERE room=? AND session=? AND user=? AND seen>?) ORDER BY id LIMIT 100").bind(room.id,session,Number(q.get("after"))||0,now-60000,room.id,session,user.userId,now-20000),
  );
  const rows=await database.batch(statements);
  return reply({me:rows[0].results[0]??null,rooms:[...houseRooms,...rows[1].results],
    messages:rows[2].results.reverse(),members:rows[3].results,counts:rows[4].results,
    peers:rows[5]?.results??[],signals:rows[6]?.results??[]});
}

export async function POST(req:Request) {
  const user=await getUser();
  if(!user) return fail("Sign in to enter the club.",401);
  if(!req.headers.get("content-type")?.startsWith("application/json")) return fail("Expected JSON.",415);
  const source=await req.text();
  if(source.length>24000) return fail("Request is too large.",413);
  let a;
  try {a=JSON.parse(source);} catch {return fail("Invalid request.");}
  if(!a || typeof a!=="object") return fail("Invalid request.");
  const database=db(), id=user.userId, now=Date.now();
  if(a.action==="profile"){
    const name=clean(a.name,24), bio=clean(a.bio,180);
    if(name.length<2 || !avatars.includes(a.avatar)) return fail("Choose a nickname and avatar.");
    await database.prepare("INSERT INTO profiles VALUES (?,?,?,?) ON CONFLICT(id) DO UPDATE SET name=excluded.name,avatar=excluded.avatar,bio=excluded.bio").bind(id,name,a.avatar,bio).run();
    return reply({ok:true});
  }
  if(!await database.prepare("SELECT id FROM profiles WHERE id=?").bind(id).first()) return fail("Set up your profile first.",403);
  if(a.action==="create"){
    const name=clean(a.name,32), description=clean(a.description,100);
    if(name.length<2 || !["text","voice"].includes(a.kind)) return fail("Choose a room name and type.");
    const roomId=crypto.randomUUID();
    const result=await database.prepare("INSERT INTO rooms SELECT ?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM rooms WHERE owner=?)<20 AND (SELECT COUNT(*) FROM rooms)<100").bind(roomId,name,description,a.kind,id,now,id).run();
    return result.meta.changes ? reply({id:roomId},201) : fail("The room limit has been reached.",409);
  }
  const room=await getRoom(clean(a.room,64));
  if(!room) return fail("This room is unavailable.",404);
  const session=token(a.session);
  if(a.action==="presence"){
    const tasks=[database.prepare("INSERT INTO presence VALUES (?,?,?) ON CONFLICT(user) DO UPDATE SET room=excluded.room,seen=excluded.seen").bind(id,room.id,now)];
    if(session && room.kind==="voice") tasks.push(database.prepare("UPDATE voice SET seen=? WHERE room=? AND session=? AND user=?").bind(now,room.id,session,id));
    await database.batch(tasks);
    return reply({ok:true});
  }
  if(a.action==="message"){
    const body=clean(a.body,1000);
    if(!body) return fail("Enter a message.");
    const result=await database.prepare("INSERT INTO messages(room,user,body,created) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM messages WHERE user=? AND room=? AND created>?)").bind(room.id,id,body,now,id,room.id,now-600).run();
    return result.meta.changes ? reply({ok:true}) : fail("Wait a moment before sending another message.",429);
  }
  if(room.kind!=="voice" || !session) return fail("Choose a voice room.");
  if(a.action==="ice"){
    const urls=process.env.TURN_URLS?.split(",").map(url=>url.trim()).filter(Boolean);
    const username=process.env.TURN_USERNAME, credential=process.env.TURN_CREDENTIAL;
    const servers=[{urls:"stun:stun.l.google.com:19302"},...(urls?.length&&username&&credential?[{urls,username,credential}]:[])];
    return reply({servers});
  }
  if(a.action==="join"){
    const results=await database.batch([
      database.prepare("DELETE FROM voice WHERE seen<=?").bind(now-20000),
      database.prepare("DELETE FROM signals WHERE created<=?").bind(now-60000),
      database.prepare("INSERT INTO voice SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM voice WHERE room=?)<6 ON CONFLICT(room,session) DO NOTHING").bind(room.id,session,id,now,room.id),
    ]);
    return results[2].meta.changes ? reply({ok:true}) : fail("This voice room is full.",409);
  }
  if(a.action==="leave"){
    await database.prepare("DELETE FROM voice WHERE room=? AND session=? AND user=?").bind(room.id,session,id).run();
    return reply({ok:true});
  }
  if(a.action==="signal"){
    const to=token(a.to), payload=a.payload;
    if(!to || to===session || !payload || !["offer","answer","ice"].includes(payload.type)) return fail("Invalid voice signal.");
    await database.prepare("INSERT INTO signals(room,sender,recipient,payload,created) SELECT ?,?,?,?,? WHERE EXISTS (SELECT 1 FROM voice WHERE room=? AND session=? AND user=? AND seen>?) AND EXISTS (SELECT 1 FROM voice WHERE room=? AND session=? AND seen>?)").bind(room.id,session,to,JSON.stringify(payload),now,room.id,session,id,now-20000,room.id,to,now-20000).run();
    return reply({ok:true});
  }
  return fail("Unknown action.");
}
