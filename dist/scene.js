import * as T from './vendor/three.module.js';
export function createScene(host){
 const scene=new T.Scene();scene.background=new T.Color(0x19241e);scene.fog=new T.Fog(0x19241e,10,25);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;host.appendChild(renderer.domElement);
 const camera=new T.PerspectiveCamera(37,1,.1,60);camera.position.set(4,2.8,6);camera.lookAt(0,1.25,0);
 scene.add(new T.HemisphereLight(0xd9edca,0x324c3b,2));const key=new T.DirectionalLight(0xffe5bc,4);key.position.set(2,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;scene.add(key);const rim=new T.DirectionalLight(0xb7f064,3);rim.position.set(-4,3,-4);scene.add(rim);
 const mat=(c)=>new T.MeshStandardMaterial({color:c,roughness:.82,flatShading:true});const materials={skin:mat(0xbd8c6d),skin2:mat(0x935b42),floor:mat(0x323e33),metal:mat(0x26372c),wall:mat(0x24342b),lime:mat(0xc6ed67),black:mat(0x171d1c),red:mat(0xbb5b44)};
 function mesh(geo,m,parent,x=0,y=0,z=0){const a=new T.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a}
 function box(w,h,d,m,parent,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z)}
 function capsule(r,l,m,parent,x,y,z){return mesh(new T.CapsuleGeometry(r,l,3,8),m,parent,x,y,z)}
 const floor=mesh(new T.CylinderGeometry(5.3,5.3,.18,8),materials.floor,scene,0,-.12,0);floor.rotation.y=Math.PI/8;
 const grid=new T.GridHelper(16,16,0x4b5d49,0x344439);grid.position.y=-.2;scene.add(grid);
 const gym=new T.Group();scene.add(gym);box(12,5,.16,materials.wall,gym,0,2,-3.7);for(let i=-5;i<=5;i++)box(.035,4,.05,materials.metal,gym,i,2,-3.58);for(let i=0;i<6;i++)box(12,.025,.03,materials.metal,gym,0,i*.75,-3.58);
 const windowMat=new T.MeshBasicMaterial({color:0x7c976e});box(2,1.5,.07,windowMat,gym,-2.8,2.7,-3.55);for(let i=0;i<3;i++)box(.055,1.6,.1,materials.metal,gym,-3.5+i*.7,2.7,-3.45);box(2,.055,.12,materials.metal,gym,-2.8,2.7,-3.42);
 const bag=new T.Group();gym.add(bag);bag.position.set(2.5,0,-1.4);capsule(.35,1.1,materials.black,bag,0,1.8,0);box(.72,.14,.73,materials.red,bag,0,1.55,0);box(.025,1.2,.025,materials.metal,bag,0,3,0);box(.05,3.8,.05,materials.metal,bag,.75,1.8,0);box(.8,.05,.05,materials.metal,bag,.4,3.5,0);
 for(let j=0;j<2;j++){const db=new T.Group();db.position.set(-1.65+j*.8,.11,1);db.rotation.y=.3;gym.add(db);const bar=mesh(new T.CylinderGeometry(.035,.035,.55,8),materials.metal,db);bar.rotation.z=Math.PI/2;for(const x of [-.25,.25]){const plate=mesh(new T.CylinderGeometry(.13,.13,.12,8),materials.black,db,x,0,0);plate.rotation.z=Math.PI/2}}
 const cage=new T.Group();scene.add(cage);cage.visible=false;const cageMat=new T.LineBasicMaterial({color:0x81977b,transparent:true,opacity:.22});for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;const x=Math.cos(a)*4,z=Math.sin(a)*4,nx=Math.cos(b)*4,nz=Math.sin(b)*4;if(z<1.5)capsule(.055,2.35,materials.metal,cage,x,1.18,z);for(let k=0;k<3&&z<1.5&&nz<1.5;k++){const pts=[new T.Vector3(x,.4+k*.85,z),new T.Vector3(nx,.4+k*.85,nz)];cage.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),cageMat))}if(z<1||nz<1){for(let q=0;q<=14;q++){let f=q/14;let vx=x+(nx-x)*f,vz=z+(nz-z)*f;const pts=[new T.Vector3(vx,0,vz),new T.Vector3(vx,2.35,vz)];cage.add(new T.Line(new T.BufferGeometry().setFromPoints(pts),cageMat))}}}
 const ring=mesh(new T.RingGeometry(2.7,2.74,8),new T.MeshBasicMaterial({color:0x667653,side:T.DoubleSide}),scene,0,-.018,0);ring.rotation.x=-Math.PI/2;
 function fighter(color,skin){const root=new T.Group();scene.add(root);const pivot=new T.Group();pivot.position.y=1;root.add(pivot);const body=new T.Group();body.position.y=-1;pivot.add(body);const shorts=mat(color);const torso=mesh(new T.CylinderGeometry(.38,.25,.7,8),skin,body,0,1.34,0);torso.scale.z=.65;const chest=[];for(const s of [-1,1]){const pec=mesh(new T.SphereGeometry(.2,8,6),skin,body,s*.17,1.52,.14);pec.scale.set(1,.75,.55);chest.push(pec)}
 const waist=box(.54,.32,.35,shorts,body,0,.94,0);box(.55,.06,.36,materials.black,body,0,1.08,0);box(.045,.27,.365,materials.lime,body,.19,.95,0);
 capsule(.09,.08,skin,body,0,1.78,0);const head=new T.Group();head.position.set(0,1.99,0);body.add(head);const skull=mesh(new T.SphereGeometry(.215,10,8),skin,head);skull.scale.set(.84,1.17,.89);const hair=mesh(new T.SphereGeometry(.219,10,8,0,Math.PI*2,0,1.4),materials.black,head,0,.03,-.025);hair.scale.set(.86,1.13,.88);box(.2,.024,.02,materials.black,head,0,.015,.184);box(.055,.11,.08,skin,head,0,-.038,.195);box(.1,.018,.016,materials.black,head,0,-.12,.176);
 const arms=[],legs=[];for(const s of [-1,1]){const shoulder=new T.Group();shoulder.position.set(s*.39,1.62,0);body.add(shoulder);const upper=capsule(.105,.25,skin,shoulder,0,-.16,0);mesh(new T.SphereGeometry(.135,8,6),skin,shoulder,0,0,0);const elbow=new T.Group();elbow.position.set(0,-.36,0);shoulder.add(elbow);capsule(.085,.24,skin,elbow,0,-.15,0);const glove=capsule(.112,.06,materials.black,elbow,0,-.34,0);box(.2,.055,.21,shorts,elbow,0,-.27,0);arms.push({shoulder,elbow,upper,glove});const hip=new T.Group();hip.position.set(s*.175,.85,0);body.add(hip);capsule(.125,.26,skin,hip,0,-.18,0);capsule(.102,.1,shorts,hip,0,-.07,0);const knee=new T.Group();knee.position.set(0,-.39,0);hip.add(knee);capsule(.085,.25,skin,knee,0,-.17,0);const foot=box(.17,.11,.29,skin,knee,0,-.38,.06);legs.push({hip,knee,foot})}return{root,pivot,body,torso,chest,arms,legs,head}}
 const player=fighter(0xa8c649,materials.skin),enemy=fighter(0xc46546,materials.skin2);enemy.root.visible=false;
 let state={mode:'home',strength:12,phase:'stand',top:0,move:'idle',attacker:0,pulse:0,gym:0,paused:false,playbackRate:1},view=0,clock=0;
 let action=null,lastEventId=null,legacyPulse=0,last=performance.now();
 const fighters=[player,enemy],cameraTarget=new T.Vector3(),lookTarget=new T.Vector3(0,1.14,0),desiredLook=new T.Vector3(),point=new T.Vector3();
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,p)=>a+(b-a)*p;
 const ease=(v)=>{const p=clamp(v);return p*p*(3-2*p)};
 const ramp=(t,a,b)=>ease((t-a)/(b-a));
 const beat=(t,a,b,c)=>t<b?ramp(t,a,b):1-ramp(t,b,c);
 const direction=i=>i===0?1:-1;
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}};new ResizeObserver(resize).observe(host);resize();

 // A pose describes the whole skeleton. The hip-height pivot lets a fighter
 // fall, kneel, bridge and stand up without rotating through the arena floor.
 function basePose(index,phase='stand',top=0){
  const side=direction(index),p={x:-side*.69,y:0,z:index===0?-.055:.055,yaw:side*Math.PI/2,pitch:.025,twist:0,roll:0,bounce:0,headX:0,headY:0,
   arms:[[-1.02,0,-.12,-1.38],[-.91,0,.13,-1.49]],legs:[[-.22,0,.07,.29],[.16,0,-.07,.24]]};
  if(phase==='ground'){
   if(index===top){p.x=-side*.22;p.y=-.40;p.z=0;p.pitch=.75;p.headX=.32;
    p.arms=[[-1.18,-.08,-.18,-.18],[-1.1,.08,.18,-.26]];p.legs=[[-1.3,0,.48,2],[-1.3,0,-.48,2]];
   }else{p.x=-side*.14;p.y=-.71;p.z=0;p.pitch=-Math.PI/2;p.headX=.08;
    p.arms=[[-.95,.1,-.15,-1.08],[-.95,-.1,.15,-1.08]];p.legs=[[-.65,0,.16,1.05],[-.65,0,-.16,1.05]];}
  }else{const breath=Math.sin(clock*2.5+index*.8);p.bounce=breath*.011;p.twist=Math.sin(clock*1.15+index)*.018;
   const step=Math.sin(clock*1.3+index*Math.PI);p.z+=step*.025;p.legs[0][0]+=step*.018;p.legs[1][0]-=step*.018;}
  return p;
 }
 function blendPose(a,b,p){const out={};for(const key of Object.keys(a)){out[key]=Array.isArray(a[key])?a[key].map((limb,i)=>limb.map((value,j)=>mix(value,b[key][i][j],p))):mix(a[key],b[key],p)}return out}
 function towardsArm(p,arm,rotation,amount){for(let j=0;j<4;j++)p.arms[arm][j]=mix(p.arms[arm][j],rotation[j],amount)}
 function towardsLeg(p,leg,rotation,amount){for(let j=0;j<4;j++)p.legs[leg][j]=mix(p.legs[leg][j],rotation[j],amount)}
 function defend(p,t,event){
  const hit=beat(t,.35,.49,.84),side=direction(1-event.attacker);
  if(event.outcome==='blocked'||event.outcome==='defended'){
   const guard=beat(t,.15,.38,.9);towardsArm(p,0,[-1.37,-.12,-.15,-1.12],guard);towardsArm(p,1,[-1.37,.12,.15,-1.12],guard);p.pitch-=hit*.07;p.x-=side*hit*.065;
   if(event.move==='kick'&&event.technique==='lowkick')towardsLeg(p,0,[-.8,0,.17,1.25],guard);
  }else if(event.outcome==='miss'){p.z+=hit*.24;p.pitch-=hit*.19;p.headY+=hit*.2;p.x-=side*hit*.08;
  }else{p.pitch-=hit*(event.move==='kick'?.17:.11);p.roll+=hit*.06;p.headX-=hit*.15;p.headY+=hit*.12;p.x-=side*hit*.09;}
 }
 function punch(p,t,event){
  const technique=event.technique||'direct',side=direction(event.attacker),wind=beat(t,.015,.19,.4),reach=ramp(t,.2,.4)*(1-ramp(t,.55,.9));
  p.x+=side*(reach*.30-wind*.055);p.twist+=wind*.11-reach*.2;p.pitch+=reach*.04;
  if(technique==='combo'){
   const left=beat(t,.10,.29,.52),right=beat(t,.41,.60,.86);towardsArm(p,0,[-1.93,-.05,-.04,.06],left);towardsArm(p,1,[-1.91,.08,.06,.04],right);p.twist+=left*.14-right*.16;p.x+=side*right*.06;
  }else if(technique==='hook'){
   towardsArm(p,1,[-1.08,-.2,.65,-1.3],wind);towardsArm(p,1,[-1.72,-.62,.22,-.88],reach);p.twist-=reach*.29;p.roll-=reach*.045;p.x+=side*reach*.08;
  }else if(technique==='uppercut'){
   towardsArm(p,1,[-.45,0,.18,-.8],wind);towardsArm(p,1,[-1.56,.05,.08,-1.36],reach);p.y-=wind*.07;p.y+=reach*.035;p.pitch-=reach*.08;p.x+=side*reach*.08;
  }else{towardsArm(p,0,[-1.94,-.03,-.04,.055],reach);p.twist+=reach*.10;}
  towardsLeg(p,0,[-.34,0,.07,.36],reach);towardsLeg(p,1,[.25,0,-.07,.28],reach);
 }
 function kick(p,t,event){
  const side=direction(event.attacker),wind=beat(t,.015,.2,.42),extend=ramp(t,.23,.43)*(1-ramp(t,.55,.92)),lift=beat(t,.12,.35,.85),high=event.technique==='highkick',low=event.technique==='lowkick';
  p.x+=side*(extend*.30-wind*.07);p.twist-=extend*.38;p.roll-=extend*.12;p.pitch-=extend*(high?.12:.09);p.y+=extend*(high?.10:.01);
  towardsLeg(p,1,[-1.18,0,-.08,1.38],lift);towardsLeg(p,1,[high?-2.67:low?-1.07:-1.66,.16,-.16,.12],extend);
  towardsLeg(p,0,[-.09,.2,.07,.16],extend);towardsArm(p,1,[-.3,.12,.55,-.75],extend);towardsArm(p,0,[-1.23,0,-.13,-1.27],extend);
 }
 function fightPoses(){
  let poses=fighters.map((_,i)=>basePose(i,state.phase,state.top));
  if(!action||action.elapsed>=action.duration)return poses;
  const event=action.event,t=clamp(action.elapsed/action.duration),attacker=event.attacker,defender=1-attacker;
  const before=event.phaseBefore||'stand',after=event.phaseAfter||before,oldTop=event.topBefore??0,newTop=event.topAfter??oldTop;
  poses=fighters.map((_,i)=>basePose(i,before,oldTop));
  if(event.move==='takedown'){
   const attempt=beat(t,.02,.37,.83),success=event.outcome==='success',fall=success?ramp(t,.37,.9):0;
   const a=poses[attacker],d=poses[defender];a.y-=attempt*.2;a.pitch+=attempt*.48;a.x+=direction(attacker)*attempt*.26;
   towardsArm(a,0,[-1.3,0,-.3,-.5],attempt);towardsArm(a,1,[-1.3,0,.3,-.5],attempt);a.legs.forEach((_,i)=>towardsLeg(a,i,[-.55,0,i===0?.12:-.12,.85],attempt));
   if(!success){d.x-=direction(defender)*attempt*.1;d.pitch+=attempt*.2;towardsLeg(d,1,[.52,0,-.12,.25],attempt);d.arms.forEach((_,i)=>towardsArm(d,i,[-.7,0,i===0?-.18:.18,-.55],attempt));}
   if(success){d.roll+=attempt*.12;poses=poses.map((p,i)=>blendPose(p,basePose(i,after,newTop),fall));}
  }else if(event.move==='escape'){
   const effort=beat(t,.02,.33,.83),a=poses[attacker];a.y+=effort*.12;a.roll+=effort*.23;a.twist+=effort*.12;
   towardsLeg(a,0,[-1.06,0,.25,1.4],effort);towardsArm(a,1,[-1.45,0,.26,-.55],effort);
   if(event.outcome==='success')poses=poses.map((p,i)=>blendPose(p,basePose(i,after,newTop),ramp(t,.39,.94)));
   else poses[defender].pitch+=effort*.13;
  }else if(event.move==='submission'){
   const hold=ramp(t,.12,.39)*(1-ramp(t,.65,.96)),a=poses[attacker],d=poses[defender];
   a.twist+=hold*.17;d.headX+=hold*.18;d.roll-=hold*.09;
   a.arms.forEach((_,i)=>towardsArm(a,i,[-1.6,i===0?.27:-.27,i===0?-.13:.13,-.7],hold));
   if(attacker!==oldTop){a.roll+=hold*.12;const triangle=event.technique==='triangle';towardsLeg(a,0,[triangle?-1.28:-1.05,.25,.3,.64],hold);towardsLeg(a,1,[-1.02,-.28,-.22,triangle?.72:1.18],hold);d.pitch+=hold*.2;}
   else{a.pitch+=hold*.18;a.x+=direction(attacker)*hold*.1;d.arms[1][3]=mix(d.arms[1][3],-.35,hold);}
   if(event.outcome==='success'){const tap=beat(t,.64,.72,.80)+beat(t,.81,.87,.95);d.arms[0][0]+=tap*.3;d.arms[0][3]+=tap*.38;}
  }else if(event.move==='ground'){
   const hit=ramp(t,.2,.41)*(1-ramp(t,.55,.9)),wind=beat(t,.01,.2,.4),a=poses[attacker],d=poses[defender];
   if(attacker===oldTop){towardsArm(a,1,[-2.45,.1,.28,-1.05],wind);towardsArm(a,1,[-1.88,0,.08,.08],hit);a.pitch+=hit*.1;a.x+=direction(attacker)*hit*.12;}
   else{towardsArm(a,0,[-.3,0,-.12,-1.5],hit);a.twist+=hit*.16;}
   d.headY+=beat(t,.37,.49,.8)*.17;d.roll+=beat(t,.37,.49,.8)*.065;
   if(newTop!==oldTop||after!==before)poses=poses.map((p,i)=>blendPose(p,basePose(i,after,newTop),ramp(t,.62,.98)));
  }else if(event.move==='punch'||event.move==='kick'){
   if(event.move==='punch')punch(poses[attacker],t,event);else kick(poses[attacker],t,event);
   if(event.technique==='combo'){defend(poses[defender],clamp((t-.03)/.65),event);defend(poses[defender],clamp((t-.32)/.68),event);}else defend(poses[defender],t,event);
  }else{
   const guard=beat(t,.1,.4,.95);poses[attacker].x-=direction(attacker)*guard*.08;poses[attacker].arms.forEach((_,i)=>towardsArm(poses[attacker],i,[-1.27,0,i===0?-.12:.12,-1.2],guard));
  }
  return poses;
 }
 function homePose(){
  const p=basePose(0);p.x=0;p.z=0;p.yaw=-.25;p.twist=Math.sin(clock)*.02;p.headY=Math.sin(clock*.4)*.06;p.arms=[[-.5,0,-.12,-1.55],[-.5,0,.12,-1.55]];
  if(state.mode==='train'){
   if(state.move==='run'||state.move==='rope'){
    const rope=state.move==='rope';p.y=Math.abs(Math.sin(clock*7))*(rope?.13:.045);p.pitch=.06;
    p.legs.forEach((l,i)=>{l[0]=rope?-.16:Math.sin(clock*7+i*Math.PI)*.55;l[3]=rope?.27:Math.max(.2,-Math.sin(clock*7+i*Math.PI)*.8)});
    p.arms.forEach((a,i)=>{a[0]=rope?-.38+Math.sin(clock*7)*.14:Math.sin(clock*7+i*Math.PI)*.56-.5;a[2]=(i===0?-1:1)*(rope?.25:.1);a[3]=rope?-1.05:-1.35});
   }else if(state.move==='strength'){
    const squat=(Math.sin(clock*2.3)+1)/2;p.y=-.08-squat*.2;p.pitch=.12;p.legs.forEach(l=>{l[0]=-.35-squat*.32;l[3]=.65+squat*.53});p.arms=[[-1.2,0,-.08,-.6],[-1.2,0,.08,-.6]];
   }else{const reach=(Math.sin(clock*4.2)+1)/2;towardsArm(p,1,[-1.85,0,.06,.02],reach);p.twist-=reach*.15;}
  }
  return p;
 }
 function resultPoses(poses){
  if(!state.done||!state.result||action&&action.elapsed<action.duration+.25)return poses;
  const winner=state.result.winner;if(winner!==0&&winner!==1)return poses;
  const win=basePose(winner);win.x=-direction(winner)*.95;win.arms=[[-2.75,0,-.2,-.3],[-2.75,0,.2,-.3]];win.headX=-.06;win.y=.015;
  const loser=1-winner,lose=basePose(loser);lose.x=-direction(loser)*.94;lose.pitch=.22;lose.headX=.24;lose.arms=[[-.28,0,-.12,-.38],[-.28,0,.12,-.38]];
  if(/\b(?:ko|tko)\b|nakavt/i.test(state.result.method||'')){const down=basePose(loser,'ground',winner);down.x=-direction(loser)*.67;down.roll=.10;down.arms=[[-.2,0,-.35,-.5],[-.2,0,.35,-.5]];poses[loser]=down;}else poses[loser]=lose;
  poses[winner]=win;return poses;
 }
 function applyPose(f,p,dt,index){
  const alpha=1-Math.exp(-dt*17),lerp=(a,b)=>mix(a,b,alpha);
  f.root.position.set(lerp(f.root.position.x,p.x),lerp(f.root.position.y,p.y),lerp(f.root.position.z,p.z));
  f.root.rotation.y=lerp(f.root.rotation.y,p.yaw);f.pivot.position.y=lerp(f.pivot.position.y,1+p.bounce);
  f.pivot.rotation.set(lerp(f.pivot.rotation.x,p.pitch),lerp(f.pivot.rotation.y,p.twist),lerp(f.pivot.rotation.z,p.roll));f.head.rotation.set(lerp(f.head.rotation.x,p.headX),lerp(f.head.rotation.y,p.headY),0);
  f.arms.forEach((arm,i)=>{const r=p.arms[i];arm.shoulder.rotation.set(lerp(arm.shoulder.rotation.x,r[0]),lerp(arm.shoulder.rotation.y,r[1]),lerp(arm.shoulder.rotation.z,r[2]));arm.elbow.rotation.x=lerp(arm.elbow.rotation.x,r[3])});
  f.legs.forEach((leg,i)=>{const r=p.legs[i];leg.hip.rotation.set(lerp(leg.hip.rotation.x,r[0]),lerp(leg.hip.rotation.y,r[1]),lerp(leg.hip.rotation.z,r[2]));leg.knee.rotation.x=lerp(leg.knee.rotation.x,r[3])});
  if(index===0){const size=1+Math.max(0,state.strength-12)/180;f.torso.scale.x=size;f.chest.forEach(pec=>pec.scale.x=size);f.arms.forEach(arm=>arm.upper.scale.set(size,size*.95,size));}
  // Keep soles, torso and head above the mat during intermediate fall/get-up poses.
  f.root.updateMatrixWorld(true);let low=Infinity;
  f.legs.forEach(leg=>{for(const x of [-.085,.085])for(const y of [-.055,.055])for(const z of [-.145,.145]){point.set(x,y,z).applyMatrix4(leg.foot.matrixWorld);low=Math.min(low,point.y)}point.setFromMatrixPosition(leg.knee.matrixWorld);low=Math.min(low,point.y-.10)});
  for(const x of [-.38,.38])for(const y of [-.35,.35])for(const z of [-.38,.38]){point.set(x,y,z).applyMatrix4(f.torso.matrixWorld);low=Math.min(low,point.y)}
  point.setFromMatrixPosition(f.head.matrixWorld);low=Math.min(low,point.y-.20);if(low<.012)f.root.position.y+=.012-low;
 }
 function beginAction(event){
  const move=event.move||'idle';action={event:{...event,move,attacker:event.attacker===1?1:0},elapsed:0,duration:['takedown','escape','submission'].includes(move)?2.85:event.technique==='combo'?2.65:move==='kick'?2.45:2.15};
 }
 function frame(now){
  requestAnimationFrame(frame);if(document.hidden){last=now;return}
  const rawDt=Math.min((now-last)/1000,.05);last=now;const fight=state.mode==='fight',dt=fight&&state.paused?0:rawDt*(fight?clamp(Number(state.playbackRate)||1,.25,3):1);
  clock+=dt;legacyPulse=Math.max(0,legacyPulse-dt*1.5);if(action&&fight)action.elapsed+=dt;
  if(dt>0){if(fight){const poses=resultPoses(fightPoses());fighters.forEach((f,i)=>applyPose(f,poses[i],dt,i))}else applyPose(player,homePose(),dt,0);
   bag.rotation.z=state.mode==='train'?Math.sin(clock*3)*.025:0;
   const ground=fight&&state.phase==='ground'&&!state.done;
   cameraTarget.set(fight?0:view%2?-4:3.7,fight?(ground?3.15:2.35):2.5,fight?(ground?4.8:4.75):5.5);camera.position.lerp(cameraTarget,1-Math.exp(-dt*3));
   desiredLook.set(0,fight?(ground?.61:1.02):1.14,0);lookTarget.lerp(desiredLook,1-Math.exp(-dt*3));camera.lookAt(lookTarget);
  }
  renderer.render(scene,camera);
 }
 requestAnimationFrame(frame);
 return{set(next){
  const wasFight=state.mode==='fight';Object.assign(state,next);const fight=state.mode==='fight';
  if(!fight){action=null;lastEventId=null;legacyPulse=0;}
  else if(next.eventId!=null&&next.eventId!==lastEventId){lastEventId=next.eventId;if(next.event)beginAction(next.event);}
  else if(next.eventId==null&&next.pulse>0&&(!wasFight||next.pulse>legacyPulse))beginAction({move:next.move,attacker:next.attacker,outcome:'hit',phaseBefore:state.phase,phaseAfter:state.phase,topBefore:state.top,topAfter:state.top});
  if(next.pulse!=null)legacyPulse=next.pulse;
  cage.visible=fight;gym.visible=!fight;enemy.root.visible=fight;scene.background.set(fight?0x141c1b:state.gym>1?0x172c32:0x19241e);materials.wall.color.set([0x24342b,0x39372c,0x233943,0x35434a][state.gym||0]);
 },rotate(){view++}};
}
