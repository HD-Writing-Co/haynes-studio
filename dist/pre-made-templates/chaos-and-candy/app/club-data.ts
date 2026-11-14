export const avatars = ["👾","😈","🦇","🍒","🦊","💀","🐈‍⬛","🦋","🤖","🍬","🐉","🌙"];
export const houseRooms = [
  {id:"lobby",name:"The Lobby",description:"Say hello and find your people.",kind:"text",owner:""},
  {id:"after-hours",name:"After Hours",description:"For conversations that run late.",kind:"text",owner:""},
  {id:"soundcheck",name:"Soundcheck",description:"Share the track you have on repeat.",kind:"text",owner:""},
  {id:"neon-lounge",name:"Neon Lounge",description:"Pull up a seat and join the conversation.",kind:"voice",owner:""},
  {id:"backstage",name:"Backstage",description:"A quieter corner of the club.",kind:"voice",owner:""},
];
export type Room = (typeof houseRooms)[number];
export type Profile = {id:string; name:string; avatar:string; bio:string};
