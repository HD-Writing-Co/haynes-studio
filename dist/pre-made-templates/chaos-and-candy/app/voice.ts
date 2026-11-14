export type Peer = {session:string;name:string;avatar:string};
export type Signal = {id:number;sender:string;payload:string};
type Payload = {type:"offer"|"answer";sdp:RTCSessionDescriptionInit}|{type:"ice";candidate:RTCIceCandidateInit};
type Connection = {pc:RTCPeerConnection; audio:HTMLAudioElement; waiting:RTCIceCandidateInit[]; offerSent:boolean};

export class Voice {
  readonly session=crypto.randomUUID();
  cursor=0;
  private closed=false;
  private pending:Promise<void>=Promise.resolve();
  private connections=new Map<string,Connection>();

  constructor(readonly room:string, private stream:MediaStream, private send:(to:string,payload:Payload)=>Promise<unknown>, private update:(status:string)=>void, private iceServers:RTCIceServer[]) {}

  mute(muted:boolean) { this.stream.getAudioTracks().forEach(track=>track.enabled=!muted); }

  private connection(id:string) {
    const existing=this.connections.get(id);
    if(existing) return existing;
    const pc=new RTCPeerConnection({iceServers:this.iceServers});
    const audio=new Audio();
    audio.autoplay=true;
    const connection={pc,audio,waiting:[],offerSent:false};
    this.connections.set(id,connection);
    this.stream.getTracks().forEach(track=>pc.addTrack(track,this.stream));
    pc.ontrack=event=>{
      audio.srcObject=event.streams[0]??new MediaStream([event.track]);
      void audio.play().catch(()=>this.update("Tap Enable audio to hear participants."));
    };
    pc.onicecandidate=event=>{
      if(event.candidate && !this.closed) void this.send(id,{type:"ice",candidate:event.candidate.toJSON()}).catch(()=>this.update("Voice signaling interrupted."));
    };
    pc.onconnectionstatechange=()=>{
      if(pc.connectionState==="failed") this.update("A peer could not connect. Rejoin to retry.");
    };
    return connection;
  }

  enableAudio(){ for(const {audio} of this.connections.values()) void audio.play().catch(()=>{}); }

  sync(peers:Peer[], signals:Signal[]) {
    const next=this.pending.then(()=>this.reconcile(peers,signals));
    this.pending=next.catch(()=>{});
    return next;
  }

  private async reconcile(peers:Peer[], signals:Signal[]) {
    if(this.closed) return;
    const active=new Set(peers.map(peer=>peer.session));
    for(const [id,connection] of this.connections){
      if(!active.has(id)) {connection.pc.close(); connection.audio.srcObject=null; this.connections.delete(id);}
    }
    for(const peer of peers){
      if(this.closed) return;
      if(this.session>=peer.session) continue;
      const connection=this.connection(peer.session);
      if(connection.offerSent) continue;
      await connection.pc.setLocalDescription(await connection.pc.createOffer());
      if(this.closed) return;
      await this.send(peer.session,{type:"offer",sdp:connection.pc.localDescription!.toJSON()});
      connection.offerSent=true;
    }
    for(const signal of signals){
      if(this.closed) return;
      if(signal.id<=this.cursor) continue;
      this.cursor=signal.id;
      if(!active.has(signal.sender)) continue;
      const payload=JSON.parse(signal.payload) as Payload;
      try {
        const {pc,waiting}=this.connection(signal.sender);
        if(payload.type==="ice"){
          if(pc.remoteDescription) await pc.addIceCandidate(payload.candidate);
          else waiting.push(payload.candidate);
          continue;
        }
        await pc.setRemoteDescription(payload.sdp);
        for(const candidate of waiting.splice(0)) await pc.addIceCandidate(candidate);
        if(payload.type==="offer"){
          await pc.setLocalDescription(await pc.createAnswer());
          if(!this.closed) await this.send(signal.sender,{type:"answer",sdp:pc.localDescription!.toJSON()});
        }
      } catch {
        if(!this.closed) this.update("A voice connection was interrupted. Rejoin to retry.");
      }
    }
  }

  close(){
    this.closed=true;
    for(const {pc,audio} of this.connections.values()){pc.close();audio.srcObject=null;}
    this.connections.clear();
    this.stream.getTracks().forEach(track=>track.stop());
  }
}
