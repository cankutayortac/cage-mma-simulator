import * as T from './vendor/three.module.js';
export function createScene(host){
 const motionPreference=window.matchMedia?.('(prefers-reduced-motion: reduce)');
 let reducedMotion=!!motionPreference?.matches;const onMotionChange=event=>{reducedMotion=event.matches;requestDraw()};motionPreference?.addEventListener?.('change',onMotionChange);
 const scene=new T.Scene();scene.background=new T.Color(0x19241e);scene.fog=new T.Fog(0x19241e,10,25);
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.08;host.appendChild(renderer.domElement);
 const camera=new T.PerspectiveCamera(37,1,.1,60);camera.position.set(4,2.8,6);camera.lookAt(0,1.25,0);
 scene.add(new T.HemisphereLight(0xdde8ff,0x3d3b35,1.55));const key=new T.DirectionalLight(0xffe5bc,4);key.position.set(2,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-6;key.shadow.camera.right=6;key.shadow.camera.top=6;key.shadow.camera.bottom=-6;key.shadow.camera.near=.5;key.shadow.camera.far=18;key.shadow.bias=-.0003;key.shadow.normalBias=.022;scene.add(key);const faceFill=new T.DirectionalLight(0xd4e1ff,1.2);faceFill.position.set(-3,2.7,5);scene.add(faceFill);const rim=new T.DirectionalLight(0xb7f064,3);rim.position.set(-4,3,-4);scene.add(rim);
 const mat=(c)=>new T.MeshStandardMaterial({color:c,roughness:.82,flatShading:true});const materials={skin:mat(0xbd8c6d),skin2:mat(0x935b42),floor:mat(0x323e33),metal:mat(0x26372c),wall:mat(0x24342b),lime:mat(0xc6ed67),black:mat(0x171d1c),red:mat(0xbb5b44)};
 materials.skin.flatShading=materials.skin2.flatShading=false;materials.skin.roughness=.66;materials.skin2.roughness=.69;
 function mesh(geo,m,parent,x=0,y=0,z=0){const a=new T.Mesh(geo,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;parent.add(a);return a}
 function box(w,h,d,m,parent,x,y,z){return mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z)}
 function capsule(r,l,m,parent,x,y,z){return mesh(new T.CapsuleGeometry(r,l,3,8),m,parent,x,y,z)}
 const floor=mesh(new T.CylinderGeometry(5.3,5.3,.18,8),materials.floor,scene,0,-.12,0);floor.rotation.y=Math.PI/8;
 const grid=new T.GridHelper(16,16,0x4b5d49,0x344439);grid.position.y=-.2;scene.add(grid);
 const gym=new T.Group();scene.add(gym);box(12,5,.16,materials.wall,gym,0,2,-3.7);for(let i=-5;i<=5;i++)box(.035,4,.05,materials.metal,gym,i,2,-3.58);for(let i=0;i<6;i++)box(12,.025,.03,materials.metal,gym,0,i*.75,-3.58);
 const windowMat=new T.MeshBasicMaterial({color:0x7c976e});box(2,1.5,.07,windowMat,gym,-2.8,2.7,-3.55);for(let i=0;i<3;i++)box(.055,1.6,.1,materials.metal,gym,-3.5+i*.7,2.7,-3.45);box(2,.055,.12,materials.metal,gym,-2.8,2.7,-3.42);
 const bag=new T.Group();gym.add(bag);bag.position.set(2.5,0,-1.4);
 const bagSwing=new T.Group();bagSwing.position.y=3.35;bag.add(bagSwing);
 capsule(.32,1.05,materials.black,bagSwing,0,-1.55,0);box(.65,.14,.66,materials.red,bagSwing,0,-1.72,0);box(.02,1.04,.02,materials.metal,bagSwing,0,-.48,0);
 box(.07,3.8,.07,materials.metal,bag,.75,1.8,0);box(.86,.065,.065,materials.metal,bag,.35,3.35,0);
 const living=new T.Group();gym.add(living);living.position.set(-2.5,0,-2.25);
 const homes=[new T.Group(),new T.Group(),new T.Group()];homes.forEach(group=>living.add(group));
 const fabric=mat(0x596350),upholstery=mat(0x9aa59a),wood=mat(0x795945);
 box(1.6,.2,.68,fabric,homes[0],0,.12,0);box(.48,.12,.56,materials.black,homes[0],-.46,.27,0);box(.44,.52,.4,wood,homes[0],1.03,.26,-.1);
 box(1.7,.36,.7,materials.black,homes[1],0,.31,0);box(1.75,.65,.18,fabric,homes[1],0,.67,-.29);box(.15,.52,.7,fabric,homes[1],-.83,.47,0);box(.15,.52,.7,fabric,homes[1],.83,.47,0);
 box(1.95,.3,.8,upholstery,homes[2],0,.34,0);box(2,.58,.16,upholstery,homes[2],0,.67,-.32);box(.15,.55,.8,upholstery,homes[2],-.96,.45,0);box(.15,.55,.8,upholstery,homes[2],.96,.45,0);
 box(.45,.78,.42,materials.black,homes[2],1.28,.39,-.08);box(.51,.04,.48,wood,homes[2],1.28,.8,-.08);
 const homeGlow=box(2.5,.035,.03,new T.MeshBasicMaterial({color:0xb5df89}),homes[2],0,1.65,-.9);

 for(let j=0;j<2;j++){const db=new T.Group();db.position.set(-1.65+j*.8,.11,1);db.rotation.y=.3;gym.add(db);const bar=mesh(new T.CylinderGeometry(.035,.035,.55,8),materials.metal,db);bar.rotation.z=Math.PI/2;for(const x of [-.25,.25]){const plate=mesh(new T.CylinderGeometry(.13,.13,.12,8),materials.black,db,x,0,0);plate.rotation.z=Math.PI/2}}
 const gymDecor=Array.from({length:4},()=>new T.Group());gymDecor.forEach(group=>gym.add(group));
 const gymAccentMaterials=[mat(0x857b63),mat(0xbd8158),mat(0x6d9dab),mat(0xc4cdca)];
 for(let i=0;i<4;i++){const zone=box(3.4,.016,2.8,gymAccentMaterials[i],gymDecor[i],0,-.022,0);zone.receiveShadow=true;zone.castShadow=false;}
 // Local boxing gym: worn bench, warm wall pads, and spare pads.
 box(1.6,.15,.45,wood,gymDecor[1],-2,.5,-1.35);for(const x of [-2.6,-1.4])box(.08,.48,.36,materials.metal,gymDecor[1],x,.24,-1.35);
 for(let i=0;i<3;i++)box(.57,.72,.12,gymAccentMaterials[1],gymDecor[1],-.65+i*.7,1.05,-3.5);
 // MMA gym: a full rack and barbell give its silhouette a different shape.
 for(const x of [-2.8,-1.3]){box(.09,2.45,.12,materials.metal,gymDecor[2],x,1.22,-1.55);box(.48,.08,.75,materials.metal,gymDecor[2],x,.03,-1.5)}box(1.6,.08,.09,materials.metal,gymDecor[2],-2.05,2.4,-1.55);
 const rackBar=mesh(new T.CylinderGeometry(.035,.035,1.85,8),gymAccentMaterials[3],gymDecor[2],-2.05,1.35,-1.28);rackBar.rotation.z=Math.PI/2;
 for(const x of [-2.87,-1.23]){const plate=mesh(new T.CylinderGeometry(.27,.27,.12,10),materials.black,gymDecor[2],x,1.35,-1.28);plate.rotation.z=Math.PI/2;}
 // Performance gym: clean cable station, weight stack and ceiling strips.
 for(const x of [-2.85,-1.5])box(.12,2.6,.16,gymAccentMaterials[3],gymDecor[3],x,1.3,-1.7);box(1.47,.14,.2,gymAccentMaterials[3],gymDecor[3],-2.175,2.6,-1.7);
 for(let i=0;i<6;i++)box(.64,.11,.34,materials.black,gymDecor[3],-2.18,.2+i*.13,-1.7);
 for(const x of [-2.63,-1.72])box(.016,1.78,.016,materials.metal,gymDecor[3],x,1.55,-1.5);
 const gymLEDMaterial=new T.MeshBasicMaterial({color:0xc8eee2});for(const x of [-2.7,0,2.7])box(1.6,.035,.045,gymLEDMaterial,gymDecor[3],x,3.2,-3.48);
 const cage=new T.Group();scene.add(cage);cage.visible=false;
 const cageMat=new T.LineBasicMaterial({color:0xa0aca5,transparent:true,opacity:.2}),fenceVertices=[];
 const fenceLine=(x,y,z,nx,ny,nz)=>fenceVertices.push(x,y,z,nx,ny,nz);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4,b=(i+1)*Math.PI/4,x=Math.cos(a)*4,z=Math.sin(a)*4,nx=Math.cos(b)*4,nz=Math.sin(b)*4;
  if(z<1.5)capsule(.065,2.35,materials.metal,cage,x,1.18,z);
  for(let k=0;k<3&&z<1.5&&nz<1.5;k++)fenceLine(x,.4+k*.85,z,nx,.4+k*.85,nz);
  if(z<1||nz<1)for(let q=0;q<=14;q++){const f=q/14,vx=x+(nx-x)*f,vz=z+(nz-z)*f;fenceLine(vx,0,vz,vx,2.35,vz)}
 }
 const fenceGeometry=new T.BufferGeometry();fenceGeometry.setAttribute('position',new T.Float32BufferAttribute(fenceVertices,3));cage.add(new T.LineSegments(fenceGeometry,cageMat));
 const arenaMarkings=new T.Group();scene.add(arenaMarkings);
 const lineMaterial=new T.MeshBasicMaterial({color:0xadb6ad,transparent:true,opacity:.38,side:T.DoubleSide,depthWrite:false});
 const ring=mesh(new T.RingGeometry(3.65,3.72,8),lineMaterial,arenaMarkings,0,-.009,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;
 const centerRing=mesh(new T.RingGeometry(1.27,1.305,8),lineMaterial,arenaMarkings,0,-.008,0);centerRing.rotation.x=-Math.PI/2;centerRing.castShadow=false;
 // Flat geometric lettering gives the mat a clear identity without downloaded textures.
 const logoVertices=[],letterStrokes=[[[.5,.35],[.12,.35],[0,.22],[0,-.22],[.12,-.35],[.5,-.35]],[[0,-.35],[.25,.35],[.5,-.35]],[[.5,.35],[.12,.35],[0,.22],[0,-.22],[.12,-.35],[.5,-.35],[.5,0],[.28,0]],[[.5,.35],[0,.35],[0,-.35],[.5,-.35]]];
 function matStroke(x1,z1,x2,z2,width=.028){const length=Math.hypot(x2-x1,z2-z1),nx=-(z2-z1)/length*width,nz=(x2-x1)/length*width;logoVertices.push(x1+nx,-.006,z1+nz,x1-nx,-.006,z1-nz,x2+nx,-.006,z2+nz,x2+nx,-.006,z2+nz,x1-nx,-.006,z1-nz,x2-nx,-.006,z2-nz)}
 letterStrokes.forEach((points,i)=>{for(let j=1;j<points.length;j++)matStroke(-1.11+i*.62+points[j-1][0],-points[j-1][1],-1.11+i*.62+points[j][0],-points[j][1])});matStroke(-.39,.10,-.09,.10);matStroke(.75,0,1.16,0);
 const logoGeometry=new T.BufferGeometry();logoGeometry.setAttribute('position',new T.Float32BufferAttribute(logoVertices,3));const matLogo=mesh(logoGeometry,new T.MeshBasicMaterial({color:0xcbd5c7,transparent:true,opacity:.42,side:T.DoubleSide,depthWrite:false}),arenaMarkings);matLogo.castShadow=false;
 const cornerColors=[new T.MeshBasicMaterial({color:0xb7e55d,transparent:true,opacity:.48}),new T.MeshBasicMaterial({color:0xe07768,transparent:true,opacity:.48})];
 for(const [i,x] of [[0,-2.7],[1,2.7]]){const stripe=box(.13,.008,1.5,cornerColors[i],arenaMarkings,x,-.015,0);stripe.castShadow=false;stripe.rotation.y=i?-.35:.35}
 const roundPips=[];for(let i=0;i<3;i++){const pip=box(.16,.008,.075,new T.MeshBasicMaterial({color:0x798078}),arenaMarkings,-.24+i*.24,-.004,.74);pip.castShadow=false;roundPips.push(pip)}
 // Back-row spectators use two shared instance buffers, keeping the mobile draw cost low.
 const crowd=new T.Group();scene.add(crowd);const audienceCount=42,audienceMatrix=new T.Object3D();
 const crowdBodies=new T.InstancedMesh(new T.CapsuleGeometry(.13,.42,2,5),mat(0x344242),audienceCount);
 const crowdHeads=new T.InstancedMesh(new T.SphereGeometry(.12,6,5),mat(0x9c806b),audienceCount);
 crowd.add(crowdBodies,crowdHeads);
 for(let i=0;i<audienceCount;i++){
  const row=i%2,angle=Math.PI*1.06+(i/(audienceCount-1))*Math.PI*.9,radius=4.65+row*.48;
  audienceMatrix.position.set(Math.cos(angle)*radius,.49+row*.2,Math.sin(angle)*radius);audienceMatrix.scale.set(1,.9+(i%4)*.08,1);audienceMatrix.updateMatrix();crowdBodies.setMatrixAt(i,audienceMatrix.matrix);
  crowdBodies.setColorAt(i,new T.Color([0x4c6670,0x66544a,0x46584f,0x656359][i%4]));
  audienceMatrix.position.y+=.46;audienceMatrix.scale.setScalar(1);audienceMatrix.updateMatrix();crowdHeads.setMatrixAt(i,audienceMatrix.matrix);
 }
 crowdBodies.instanceMatrix.needsUpdate=true;crowdHeads.instanceMatrix.needsUpdate=true;
 const arenaLamps=new T.Group();scene.add(arenaLamps);const lampMaterial=new T.MeshBasicMaterial({color:0xc6ed67});
 for(const x of [-3.3,0,3.3]){box(1.35,.055,.08,lampMaterial,arenaLamps,x,3.45,-3.8);box(.055,3.35,.06,materials.metal,arenaLamps,x,1.7,-3.88)}
 const impactGroup=new T.Group();scene.add(impactGroup);const sparks=[];
 const sparkGeometry=new T.OctahedronGeometry(.035,0);
 for(let i=0;i<12;i++){const material=new T.MeshBasicMaterial({color:0xf1e3ad,transparent:true,opacity:0,depthWrite:false});const spark=mesh(sparkGeometry,material,impactGroup);spark.castShadow=false;spark.visible=false;sparks.push({mesh:spark,velocity:new T.Vector3(),life:0,maxLife:.45})}
 const impactRing=mesh(new T.RingGeometry(.07,.095,24),new T.MeshBasicMaterial({color:0xffecc2,transparent:true,opacity:0,side:T.DoubleSide,depthWrite:false}),impactGroup);impactRing.castShadow=false;impactRing.visible=false;let ringLife=0,cameraKick=0,trainingContactCycle=-1;
 function fighter(color,skin){const root=new T.Group();scene.add(root);const pivot=new T.Group();pivot.position.y=1;root.add(pivot);const body=new T.Group();body.position.y=-1;pivot.add(body);const shorts=mat(color);const torso=mesh(new T.CylinderGeometry(.38,.25,.7,8),skin,body,0,1.34,0);torso.scale.z=.65;const chest=[];for(const s of [-1,1]){const pec=mesh(new T.SphereGeometry(.2,8,6),skin,body,s*.17,1.52,.14);pec.scale.set(1,.75,.55);chest.push(pec)}
 const waist=box(.54,.32,.35,shorts,body,0,.94,0);box(.55,.06,.36,materials.black,body,0,1.08,0);box(.045,.27,.365,materials.lime,body,.19,.95,0);
 capsule(.09,.08,skin,body,0,1.78,0);const head=new T.Group();head.position.set(0,1.99,0);body.add(head);const skull=mesh(new T.SphereGeometry(.215,16,12),skin,head);skull.scale.set(.84,1.17,.89);const hair=mesh(new T.SphereGeometry(.219,10,8,0,Math.PI*2,0,1.4),materials.black,head,0,.03,-.025);hair.scale.set(.86,1.13,.88);for(const x of [-.065,.065]){const eye=mesh(new T.SphereGeometry(.024,7,5),new T.MeshStandardMaterial({color:0xe8e5d7,roughness:.56}),head,x,.018,.181);eye.scale.set(1,.53,.6);const pupil=mesh(new T.SphereGeometry(.011,6,5),materials.black,head,x,.018,.196);pupil.scale.y=.85;box(.061,.014,.018,materials.black,head,x,.052,.181);}box(.055,.11,.08,skin,head,0,-.038,.195);box(.1,.018,.016,materials.black,head,0,-.12,.176);
 const arms=[],legs=[];for(const s of [-1,1]){const shoulder=new T.Group();shoulder.position.set(s*.39,1.62,0);body.add(shoulder);const upper=capsule(.105,.25,skin,shoulder,0,-.16,0);mesh(new T.SphereGeometry(.135,8,6),skin,shoulder,0,0,0);const elbow=new T.Group();elbow.position.set(0,-.36,0);shoulder.add(elbow);capsule(.085,.24,skin,elbow,0,-.15,0);const glove=capsule(.112,.06,materials.black,elbow,0,-.34,0);box(.2,.055,.21,shorts,elbow,0,-.27,0);arms.push({shoulder,elbow,upper,glove});const hip=new T.Group();hip.position.set(s*.175,.85,0);body.add(hip);capsule(.125,.26,skin,hip,0,-.18,0);capsule(.102,.1,shorts,hip,0,-.07,0);const knee=new T.Group();knee.position.set(0,-.39,0);hip.add(knee);capsule(.085,.25,skin,knee,0,-.17,0);const foot=box(.17,.11,.29,skin,knee,0,-.38,.06);legs.push({hip,knee,foot})}return{root,pivot,body,torso,chest,arms,legs,head}}
 const player=fighter(0xa8c649,materials.skin),enemy=fighter(0xc46546,materials.skin2);enemy.root.visible=false;
 let state={mode:'home',strength:12,phase:'stand',top:0,move:'idle',attacker:0,pulse:0,gym:0,home:0,tier:0,playerStyle:'boxing',enemyStyle:'boxing',paused:false,playbackRate:1,visible:true,roundNumber:1,roundBreak:false},view=0,clock=0;
 let action=null,lastEventId=null,legacyPulse=0,last=performance.now(),drillAction=null,lastDrillId=null,bagForce=0;
 let frameHandle=0,hasSize=false,disposed=false,entrance=null,lastEntranceId=null,cornerElapsed=0,resultElapsed=0;
 const handWeights=[];player.arms.forEach(arm=>{const weight=new T.Group();arm.glove.add(weight);const bar=mesh(new T.CylinderGeometry(.035,.035,.48,7),materials.metal,weight);bar.rotation.z=Math.PI/2;for(const x of [-.22,.22]){const plate=mesh(new T.CylinderGeometry(.13,.13,.1,8),materials.black,weight,x,0,0);plate.rotation.z=Math.PI/2}handWeights.push(weight)});
 const ropePoints=Array.from({length:41},()=>new T.Vector3()),ropeGeometry=new T.BufferGeometry().setFromPoints(ropePoints);const skippingRope=new T.Line(ropeGeometry,new T.LineBasicMaterial({color:0xc6ed67}));player.root.add(skippingRope);skippingRope.visible=false;
 const arenaPosition={angle:0,x:0,z:0},bagTarget=new T.Vector3();
 const fighters=[player,enemy],cameraTarget=new T.Vector3(),lookTarget=new T.Vector3(0,1.14,0),desiredLook=new T.Vector3(),point=new T.Vector3();
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),mix=(a,b,p)=>a+(b-a)*p;
 const ease=(v)=>{const p=clamp(v);return p*p*(3-2*p)};
 const ramp=(t,a,b)=>ease((t-a)/(b-a));
 const beat=(t,a,b,c)=>t<b?ramp(t,a,b):1-ramp(t,b,c);
 const direction=i=>i===0?1:-1;
 function canRender(){return !disposed&&state.visible!==false&&hasSize&&!document.hidden;}
 function requestDraw(){if(!frameHandle&&canRender())frameHandle=requestAnimationFrame(frame);}
 function suspend(){if(frameHandle)cancelAnimationFrame(frameHandle);frameHandle=0;last=performance.now();}
 const resize=()=>{const w=host.clientWidth,h=host.clientHeight;hasSize=w>0&&h>0;if(hasSize){renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();last=performance.now();requestDraw()}else suspend()};
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);resize();
 const onVisibility=()=>{if(document.hidden)suspend();else{last=performance.now();requestDraw()}};document.addEventListener('visibilitychange',onVisibility);


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
  }else{
   const style=index===0?state.playerStyle:state.enemyStyle,motion=reducedMotion?.25:1;
   const breath=Math.sin(clock*2.5+index*.8),step=Math.sin(clock*3.4+index*Math.PI);
   p.bounce=breath*.01+Math.abs(step)*.015*motion;p.twist=Math.sin(clock*1.15+index)*.025;
   p.z+=step*.05*motion;p.legs[0][0]+=step*.08*motion;p.legs[1][0]-=step*.08*motion;p.legs[0][3]+=Math.max(0,step)*.13*motion;p.legs[1][3]+=Math.max(0,-step)*.13*motion;
   if(style==='boxing'){p.pitch=.07;p.twist+=.11;p.arms=[[-1.1,-.1,-.1,-1.42],[-1.0,.12,.11,-1.51]];p.legs[0][0]-=.07;p.legs[1][0]+=.07;}
   else if(style==='kickboxing'){p.x-=side*.06;p.pitch=-.015;p.arms=[[-1.22,0,-.18,-1.18],[-1.18,0,.2,-1.23]];p.legs[0][0]-=.08;p.legs[0][3]+=.12;p.legs[1][0]+=.1;}
   else if(style==='wrestling'){p.y-=.095;p.pitch=.17;p.arms=[[-.83,-.16,-.3,-.83],[-.83,.16,.3,-.83]];p.legs[0][2]=.14;p.legs[1][2]=-.14;p.legs.forEach(l=>{l[0]-=.18;l[3]+=.34});}
   else if(style==='bjj'){p.y-=.055;p.pitch=.11;p.arms=[[-1.0,-.14,-.23,-1.08],[-.94,.14,.23,-1.15]];p.legs.forEach(l=>{l[0]-=.08;l[3]+=.15});}
   p.headY=-p.twist*.35;p.headX=-p.pitch*.24;
  }
  return p;
 }
 function placeInCage(poses,dt){
  const motion=reducedMotion?.12:1,ground=state.phase==='ground'||action&&action.elapsed<action.duration*.8&&action.event.phaseBefore==='ground';
  if(!ground&&!state.done&&!state.roundBreak&&!entrance){const alpha=1-Math.exp(-dt*2);arenaPosition.angle=mix(arenaPosition.angle,Math.sin(clock*.19)*.48*motion,alpha);arenaPosition.x=mix(arenaPosition.x,Math.sin(clock*.27)*.34*motion,alpha);arenaPosition.z=mix(arenaPosition.z,Math.sin(clock*.21+.4)*.3*motion,alpha);}
  const angle=arenaPosition.angle,co=Math.cos(angle),si=Math.sin(angle),centerX=arenaPosition.x,centerZ=arenaPosition.z;
  return poses.map((p,index)=>{const x=p.x,z=p.z;p.x=centerX+x*co+z*si;p.z=centerZ-x*si+z*co;p.yaw+=angle;
   if(!ground&&p.pitch>-.3&&p.pitch<.3&&!state.done){const range=Math.sin(clock*.8+index*.3)*.055*motion;p.x-=direction(index)*range*co;p.z+=direction(index)*range*si;}
   return p;});
 }
 function contactEffect(position,quality=1){
  const amount=reducedMotion?3:10;
  for(let i=0;i<sparks.length;i++){const spark=sparks[i];if(i>=amount){spark.life=0;spark.mesh.visible=false;continue}const angle=i/amount*Math.PI*2;spark.life=spark.maxLife=.28+(i%3)*.055;spark.mesh.visible=true;spark.mesh.position.copy(position);spark.mesh.scale.setScalar(.7+quality*.65);spark.velocity.set(Math.cos(angle)*(.3+quality*.45),.25+Math.sin(angle)*.45,(i%2?1:-1)*.22);spark.mesh.material.opacity=.85;}
  ringLife=.28;impactRing.visible=true;impactRing.position.copy(position);impactRing.quaternion.copy(camera.quaternion);impactRing.scale.setScalar(.8);impactRing.material.opacity=.5;
  if(!reducedMotion)cameraKick=Math.min(.11,.045+quality*.045);
 }
 function updateEffects(dt){
  for(const spark of sparks){if(spark.life<=0)continue;spark.life=Math.max(0,spark.life-dt);spark.mesh.visible=spark.life>0;spark.mesh.position.addScaledVector(spark.velocity,dt);spark.velocity.y-=dt*.8;spark.mesh.material.opacity=spark.life/spark.maxLife*.85;}
  if(ringLife>0){ringLife=Math.max(0,ringLife-dt);impactRing.visible=ringLife>0;impactRing.scale.setScalar(1+(1-ringLife/.28)*3);impactRing.material.opacity=ringLife/.28*.5;impactRing.quaternion.copy(camera.quaternion);}
  cameraKick*=Math.exp(-dt*13);
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
  }else{p.pitch-=hit*(event.move==='kick'?.22:.15);p.roll+=hit*.09;p.headX-=hit*.18;p.headY+=hit*.18;p.x-=side*hit*.15;p.legs[1][0]+=hit*.12;p.legs[1][3]+=hit*.1;}
 }
 function punch(p,t,event){
  const technique=event.technique||'direct',side=direction(event.attacker),wind=beat(t,.015,.22,.4),reach=ramp(t,.23,.42)*(1-ramp(t,.55,.9));
  p.x+=side*(reach*.51-wind*.08);p.twist+=wind*.16-reach*.23;p.pitch+=reach*.065;p.headY-=reach*.08;p.headX+=wind*.035;p.legs[1][3]+=wind*.09;towardsArm(p,1,[-1.16,.08,.09,-1.49],wind*.45);
  if(technique==='combo'){
   const left=beat(t,.10,.29,.52),right=beat(t,.41,.60,.86);towardsArm(p,0,[-1.93,-.05,.28,.06],left);towardsArm(p,1,[-1.91,.08,-.25,.04],right);p.twist+=left*.14-right*.16;p.x+=side*right*.06;
  }else if(technique==='hook'){
   towardsArm(p,1,[-1.08,-.2,.65,-1.3],wind);towardsArm(p,1,[-1.72,-.62,.22,-.88],reach);p.twist-=reach*.29;p.roll-=reach*.045;p.x+=side*reach*.08;
  }else if(technique==='uppercut'){
   towardsArm(p,1,[-.45,0,.18,-.8],wind);towardsArm(p,1,[-1.56,.02,-.24,-1.24],reach);p.y-=wind*.07;p.y+=reach*.035;p.pitch-=reach*.08;p.x+=side*reach*.20;
  }else{towardsArm(p,0,[-1.94,-.03,.32,.055],reach);p.twist+=reach*.10;}
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
  const training=state.mode==='train'||state.mode==='drill';
  if(!training)return p;
  const active=state.mode==='train'||!!drillAction&&drillAction.elapsed<drillAction.duration;
  const t=state.mode==='train'?(clock%1.25)/1.25:drillAction?clamp(drillAction.elapsed/drillAction.duration):0;
  const quality=state.mode==='train'?1:(drillAction?.quality??0)/100,effort=active?Math.sin(t*Math.PI)*(.35+.65*quality):0;
  const conditioning=['run','stamina','rope'].includes(state.move);
  if(conditioning){
   const rope=state.move==='rope'||state.move==='stamina';p.y=effort*(rope?.17:.05);p.pitch=rope?.015:.13;
   p.legs.forEach((leg,i)=>{leg[0]=rope?-.16:Math.sin(t*Math.PI*2+i*Math.PI)*.55*effort;leg[3]=rope?.27+effort*.12:Math.max(.2,-Math.sin(t*Math.PI*2+i*Math.PI)*.8)*Math.max(.3,effort)});
   p.arms.forEach((arm,i)=>{arm[0]=rope?-.32+effort*.16:Math.sin(t*Math.PI*2+i*Math.PI)*.56*effort-.5;arm[2]=(i===0?-1:1)*(rope?.28:.1);arm[3]=rope?-.65:-1.35});
  }else if(state.move==='strength'){
   p.y=-.035-effort*.18;p.pitch=.04+effort*.10;p.legs.forEach(leg=>{leg[0]=-.23-effort*.28;leg[3]=.4+effort*.48});
   p.arms=[[-.22-effort*.16,0,-.12,-.28-effort*1.75],[-.22-effort*.16,0,.12,-.28-effort*1.75]];p.headX=-effort*.06;
  }else if(state.move==='wrestling'){
   p.y=-effort*.34;p.pitch=.1+effort*.38;p.x=-effort*.2;p.legs.forEach((leg,i)=>{leg[0]=-.26-effort*.5;leg[3]=.45+effort*.8;leg[2]=i?-.19:.19});p.arms=[[-.78-effort*.5,-.08,-.23,-.82],[-.78-effort*.5,.08,.23,-.82]];
  }else if(state.move==='bjj'){
   const ground=basePose(0,'ground',1);ground.x=0;ground.z=0;ground.yaw=.35;ground.y+=effort*.14;ground.roll+=effort*.24;ground.twist+=effort*.15;ground.legs[0][0]-=effort*.25;ground.legs[1][3]+=effort*.25;return ground;
  }else{
   p.x=-.43;p.z=.02;p.yaw=Math.PI/2;p.arms=[[-1.05,0,-.12,-1.35],[-1.05,0,.12,-1.35]];
   if(active){const event={attacker:0,technique:state.move==='kickboxing'?'bodykick':'direct'};if(state.move==='kickboxing')kick(p,t,event);else punch(p,t,event);p.headY-=effort*.08;}
  }
  return p;
 }
 function updateTrainingProps(dt){
  const training=state.mode==='train'||state.mode==='drill',striking=training&&['boxing','kickboxing'].includes(state.move),conditioning=training&&['rope','stamina'].includes(state.move);
  handWeights.forEach(weight=>weight.visible=training&&state.move==='strength');skippingRope.visible=conditioning;
  bagTarget.set(striking?1.15:2.5,0,striking?.02:-1.4);bag.position.lerp(bagTarget,1-Math.exp(-dt*7));
  bagForce*=Math.exp(-dt*3.8);bagSwing.rotation.z=Math.sin(clock*11)*bagForce*.23;bagSwing.rotation.x=Math.cos(clock*9)*bagForce*.05;
  if(conditioning){const active=state.mode==='train'||!!drillAction&&drillAction.elapsed<drillAction.duration;const t=state.mode==='train'?(clock%1.25)/1.25:drillAction?clamp(drillAction.elapsed/drillAction.duration):0;const spin=active?t*Math.PI*2:Math.PI/2;
   const vertices=ropeGeometry.attributes.position;for(let i=0;i<41;i++){const angle=i/40*Math.PI*2;vertices.setXYZ(i,Math.cos(angle)*.64,.94+Math.sin(angle)*1.04*Math.cos(spin),.05+Math.sin(angle)*1.04*Math.sin(spin))}vertices.needsUpdate=true;ropeGeometry.computeBoundingSphere();
  }
 }
 function presentationPoses(poses){
  const eventPlaying=action&&action.elapsed<action.duration+.15;
  if(entrance&&!eventPlaying&&!state.done&&!state.roundBreak){
   const progress=ease(entrance.elapsed/entrance.duration),stride=Math.sin(progress*Math.PI*4)*(1-progress);
   return fighters.map((_,i)=>{const p=basePose(i),side=direction(i);p.x=mix(-side*1.3,p.x,progress);p.z=mix(i===0?.14:-.14,p.z,progress);p.legs[0][0]+=stride*.09;p.legs[1][0]-=stride*.09;p.headX=-.015;
    const ready=ramp(progress,.1,.62);p.arms[0][0]=mix(-.65,p.arms[0][0],ready);p.arms[1][0]=mix(-.65,p.arms[1][0],ready);return p;});
  }
  if(state.roundBreak&&!eventPlaying&&!state.done){
   const progress=ease(cornerElapsed/.95);
   return poses.map((pose,i)=>{const p=basePose(i),side=direction(i);p.x=-side*1.4;p.z=-.18;p.pitch=.1;p.headX=.13;p.headY=-side*.12;p.bounce=Math.sin(clock*2)*.008;p.arms=[[-.46,0,-.16,-1.07],[-.46,0,.16,-1.07]];return blendPose(pose,p,progress)});
  }
  if(!state.done||!state.result||eventPlaying)return poses;
  const winner=state.result.winner,progress=ease(resultElapsed/1.15);
  if(winner===2)return poses.map((pose,i)=>{const p=basePose(i);p.x=-direction(i)*.88;p.pitch=.08;p.arms=[[-.6,0,-.16,-1.1],[-.6,0,.16,-1.1]];return blendPose(pose,p,progress)});
  if(winner!==0&&winner!==1)return poses;
  const win=basePose(winner);win.x=-direction(winner)*.95;win.arms=[[-2.60,0,-.24,-.35],[-2.73,0,.2,-.3]];win.headX=-.055;win.y=.015;win.twist=-direction(winner)*.12;
  const loser=1-winner,lose=basePose(loser);lose.x=-direction(loser)*.94;lose.pitch=.22;lose.headX=.24;lose.arms=[[-.28,0,-.12,-.38],[-.28,0,.12,-.38]];
  let defeated=lose;
  if(/\b(?:ko|tko)\b|nakavt/i.test(state.result.method||'')){defeated=basePose(loser,'ground',winner);defeated.x=-direction(loser)*.67;defeated.roll=.10;defeated.arms=[[-.2,0,-.35,-.5],[-.2,0,.35,-.5]];}
  poses[loser]=blendPose(poses[loser],defeated,progress);poses[winner]=blendPose(poses[winner],win,progress);return poses;
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
  const move=event.move||'idle';entrance=null;cornerElapsed=0;action={event:{...event,move,attacker:event.attacker===1?1:0},elapsed:0,duration:['takedown','escape','submission'].includes(move)?2.85:event.technique==='combo'?2.65:move==='kick'?2.45:2.15};
 }
 function frame(now){
  frameHandle=0;if(!canRender()){last=now;return}
  const rawDt=Math.min((now-last)/1000,.05);last=now;const fight=state.mode==='fight';
  const dt=state.paused?0:rawDt*(fight?clamp(Number(state.playbackRate)||1,.25,3):1);
  clock+=dt;legacyPulse=Math.max(0,legacyPulse-dt*1.5);if(action&&fight)action.elapsed+=dt;if(drillAction&&state.mode==='drill')drillAction.elapsed+=dt;
  if(entrance){entrance.elapsed+=dt;if(entrance.elapsed>=entrance.duration)entrance=null;}
  const eventComplete=!action||action.elapsed>=action.duration+.15;
  if(fight&&state.roundBreak&&eventComplete)cornerElapsed+=dt;
  if(fight&&state.done&&eventComplete)resultElapsed+=dt;
  if(dt>0){
   if(fight){const poses=placeInCage(presentationPoses(fightPoses()),dt);fighters.forEach((fighter,i)=>applyPose(fighter,poses[i],dt,i))}
   else applyPose(player,homePose(),dt,0);
   updateTrainingProps(dt);updateEffects(dt);
   if(fight&&action&&!action.contacted&&action.elapsed>=action.duration*(action.event.move==='takedown'?.68:.43)){
    action.contacted=true;const event=action.event,defender=fighters[1-event.attacker];
    if(event.outcome==='hit'||event.move==='takedown'&&event.outcome==='success'){
     if(event.move==='kick'&&event.technique==='lowkick')defender.legs[0].knee.getWorldPosition(point);
     else if(event.move==='takedown'){defender.torso.getWorldPosition(point);point.y=Math.max(.15,point.y-.32)}
     else if(event.move==='kick')defender.torso.getWorldPosition(point);else defender.head.getWorldPosition(point);
     contactEffect(point,event.move==='kick'?.9:.65);
    }
   }
   const striking=['boxing','kickboxing'].includes(state.move);
   if(state.mode==='drill'&&drillAction&&!drillAction.contacted&&drillAction.elapsed>=drillAction.duration*.43){
    drillAction.contacted=true;if(striking){bagForce=drillAction.quality/100;bag.updateMatrixWorld(true);point.set(-.28,1.68,0).applyMatrix4(bag.matrixWorld);if(drillAction.quality>=40)contactEffect(point,drillAction.quality/100)}
   }else if(state.mode==='train'&&striking){const cycle=Math.floor(clock/1.25);if(clock%1.25>.53&&trainingContactCycle!==cycle){trainingContactCycle=cycle;bagForce=.65}}
   const ground=fight&&state.phase==='ground'&&!state.done||(state.mode==='drill'||state.mode==='train')&&state.move==='bjj';
   const drill=state.mode==='drill';
   cameraTarget.set(fight?0:drill?2.85:view%2?-4:3.7,fight?(ground?3.05:2.42):ground?3.2:drill?2.5:2.5,fight?(state.roundBreak?6.15:ground?5.35:5.65):ground?4.9:drill?5.8:5.5);
   cameraTarget.z-=cameraKick;cameraTarget.y+=cameraKick*.3;
   camera.position.lerp(cameraTarget,1-Math.exp(-dt*4));
   desiredLook.set(0,ground?.60:fight?1.06:drill?1.26:1.14,0);lookTarget.lerp(desiredLook,1-Math.exp(-dt*3));camera.lookAt(lookTarget);
   if(!reducedMotion&&fight){const lightPulse=1+Math.sin(clock*.7)*.035;rim.intensity=2.1+state.tier*.4;key.intensity=(3.7+state.tier*.1)*lightPulse;}
  }
  renderer.render(scene,camera);
  // Paused, hidden and settled result screens do not keep a render loop alive.
  if(!state.paused&&!(fight&&state.done&&resultElapsed>=3)&&!(fight&&state.roundBreak&&cornerElapsed>=2.5))requestDraw();
 }
 function atmosphere(){
  const fight=state.mode==='fight',tier=clamp(Number(state.tier)||0,0,3),home=clamp(Number(state.home??state.worldHome??state.world?.home)||0,0,2);
  cage.visible=fight;arenaMarkings.visible=fight;gym.visible=!fight;enemy.root.visible=fight;crowd.visible=fight;arenaLamps.visible=fight;grid.visible=!fight;
  const gymTier=clamp(Math.round(Number(state.gym)||0),0,3);gymDecor.forEach((group,i)=>group.visible=i===gymTier);living.visible=gymTier===0;
  roundPips.forEach((pip,i)=>pip.material.color.set(i<(state.roundNumber||1)?0xb7e55d:0x59625a));
  windowMat.color.set([0x8e9c77,0xc5a16f,0xa1c4d7,0xc4dedb][gymTier]);
  crowdBodies.count=crowdHeads.count=[10,18,30,42][tier];
  lampMaterial.color.set([0x9b8b60,0xc6ed67,0x84c9ec,0xf0dca6][tier]);cageMat.opacity=[.16,.2,.23,.27][tier];
  homes.forEach((group,i)=>group.visible=i===home);
  const color=fight?[0x171914,0x141c1b,0x121c27,0x1d1928][tier]:home===2?0x1c2930:state.gym>1?0x172c32:0x19241e;
  scene.background.set(color);scene.fog.color.set(color);
  materials.wall.color.set(home===2?0x38494d:[0x24342b,0x39372c,0x233943,0x35434a][state.gym||0]);
  materials.floor.color.set(fight?[0x30372f,0x303936,0x303a42,0x393541][tier]:[0x393c32,0x3a3630,0x26383e,0x394345][gymTier]);
  if(!fight){key.intensity=home===2?4.3:4;rim.intensity=home===2?2.8:3;}
 }
 atmosphere();requestDraw();
 return{set(next){
  if(disposed)return;const wasFight=state.mode==='fight',previousMode=state.mode,wasBreak=state.roundBreak,wasDone=state.done,wasVisible=state.visible!==false;if(next.home===undefined&&(next.worldHome!==undefined||next.world?.home!==undefined))state.home=next.worldHome??next.world.home;Object.assign(state,next);const fight=state.mode==='fight';
  if(next.entranceId!=null&&next.entranceId!==lastEntranceId){lastEntranceId=next.entranceId;if(fight&&!state.done&&!next.eventId)entrance={elapsed:0,duration:reducedMotion?.7:1.65};}
  if(fight&&wasBreak&&!state.roundBreak&&!state.done)entrance={elapsed:0,duration:.8};
  if(!state.roundBreak)cornerElapsed=0;if(!state.done||!wasDone&&state.done)resultElapsed=0;
  if(!fight){action=null;lastEventId=null;legacyPulse=0;entrance=null;cornerElapsed=0;resultElapsed=0;}
  else if(next.eventId!=null&&next.eventId!==lastEventId){lastEventId=next.eventId;if(next.event)beginAction(next.event);}
  else if(next.eventId==null&&next.pulse>0&&(!wasFight||next.pulse>legacyPulse))beginAction({move:next.move,attacker:next.attacker,outcome:'hit',phaseBefore:state.phase,phaseAfter:state.phase,topBefore:state.top,topAfter:state.top});
  if(next.pulse!=null)legacyPulse=next.pulse;
  if(next.drillPulse&&next.drillPulse.id!==lastDrillId){lastDrillId=next.drillPulse.id;drillAction={elapsed:0,duration:state.move==='strength'?1.08:.92,quality:clamp(Number(next.drillPulse.quality)||0,0,100),contacted:false};}
  if(state.mode!=='drill'){drillAction=null;lastDrillId=null;}
  if(previousMode!==state.mode){sparks.forEach(spark=>{spark.life=0;spark.mesh.visible=false});ringLife=0;impactRing.visible=false;cameraKick=0;bagForce=0;}
  atmosphere();
  if(state.visible===false)suspend();else{if(!wasVisible){last=performance.now();resize()}requestDraw();}
 },rotate(){view++;requestDraw()},dispose(){if(disposed)return;disposed=true;suspend();resizeObserver.disconnect();document.removeEventListener('visibilitychange',onVisibility);motionPreference?.removeEventListener?.('change',onMotionChange);const geometries=new Set(),surfaceMaterials=new Set();scene.traverse(object=>{if(object.geometry)geometries.add(object.geometry);if(object.material)(Array.isArray(object.material)?object.material:[object.material]).forEach(material=>surfaceMaterials.add(material))});geometries.forEach(geometry=>geometry.dispose());surfaceMaterials.forEach(material=>material.dispose());renderer.dispose();renderer.domElement.remove();}};
}
