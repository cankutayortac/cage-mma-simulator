import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>{let s=E.initial();s.seed=42;return s};
const ready=(s,tier=E.league(s))=>{E.bookFight(s,tier);s.hours=s.camp.dueAt;s.energy=s.food=s.sleep=s.health=100;return E.startFight(s,tier)};
test('separate skills and training resources',()=>{let s=fresh(),b=s.skills.bjj;E.train(s,'boxing');assert(s.skills.boxing>15);assert.equal(s.skills.bjj,b);assert.equal(s.energy,72)});
test('invalid training is atomic',()=>{for(const key of ['toString','constructor','nope']){const s=fresh(),before=JSON.stringify(s);assert.throws(()=>E.train(s,key));assert.equal(JSON.stringify(s),before)}});
test('zero resource recovery remains possible',()=>{let s=fresh();s.cash=s.energy=s.food=s.sleep=s.health=0;E.recover(s,'sleep');E.recover(s,'help');E.recover(s,'job');assert.equal(s.cash,110)});
test('meals do not overdraft',()=>{let s=fresh();s.cash=0;const before=JSON.stringify(s);assert.throws(()=>E.recover(s,'meal'));assert.equal(JSON.stringify(s),before)});
test('gym and coach prices applied to relevant session',()=>{let s=fresh();s.cash=1000;E.chooseGym(s,1);E.chooseCoach(s,1);assert.equal(s.cash,350);assert.equal(E.trainingCost(s,'boxing'),40);assert.equal(E.trainingCost(s,'bjj'),20);assert.equal(E.trainingCost(s,'rope'),0)});
test('locked league cannot be entered',()=>{let s=fresh();assert.throws(()=>E.startFight(s,2));assert.equal(s.fight,null)});
test('move needs level and two sessions',()=>{let s=fresh();assert.throws(()=>E.train(s,'boxing','hook'));s.skills.boxing=25;E.train(s,'boxing','hook');assert.equal(s.moves.hook,1);E.train(s,'boxing','hook');assert.equal(s.moves.hook,2)});
test('active fight survives serialization exactly',()=>{let s=fresh();ready(s);for(let i=0;i<8;i++)E.stepFight(s);const copy=JSON.parse(JSON.stringify(s));assert(E.validSave(copy));E.stepFight(s);E.stepFight(copy);assert.deepEqual(s,copy)});
test('fight ends and pays only once',()=>{let s=fresh();ready(s);for(let i=0;i<65;i++)E.stepFight(s);assert(s.fight.done);assert.equal(s.history.length,1);let cash=s.cash;for(let i=0;i<10;i++)E.stepFight(s);assert.equal(s.cash,cash);assert(E.validSave(s))});
test('malformed fight saves rejected',()=>{for(const field of ['hp','st','maxHp','maxSt','score']){let s=fresh();ready(s);s.fight[field]=[];assert(!E.validSave(s))}for(const field of ['phase','top','last']){let s=fresh();ready(s);delete s.fight[field];assert(!E.validSave(s))}let s=fresh();ready(s);s.fight.done=true;assert(!E.validSave(s))});
test('all fights remain finite across 300 seeds and tactics',()=>{for(let seed=1;seed<=300;seed++){let s=fresh();s.seed=seed;for(let k of Object.keys(s.skills))s.skills[k]=seed%100;ready(s);E.tactic(s,['balanced','strike','ground','defend'][seed%4]);for(let t=0;t<61;t++)E.stepFight(s);assert(s.fight.done);assert(E.validSave(s));assert(s.cash>=0)}});
test('ground control unlock changes combat',()=>{let changed=false;for(let seed=1;seed<50;seed++){let s=fresh();s.seed=seed;s.skills.bjj=60;s.skills.wrestling=60;ready(s);E.tactic(s,'ground');s.fight.phase='ground';const b=structuredClone(s);b.moves.control=2;b.fight.playerMoves.push('control');for(let i=0;i<60;i++){E.stepFight(s);E.stepFight(b)}if(JSON.stringify(s.fight)!==JSON.stringify(b.fight))changed=true}assert(changed)});
test('triangle can actually be used',()=>{let seen=false;for(let seed=1;seed<80;seed++){let s=fresh();s.seed=seed;s.skills.bjj=75;ready(s);E.tactic(s,'ground');s.fight.phase='ground';s.moves.armbar=s.moves.triangle=2;s.fight.playerMoves=['armbar','triangle'];for(let i=0;i<60;i++){E.stepFight(s);if(s.fight.log.includes('Üçgen'))seen=true}}assert(seen)});
test('combat events describe actual hits, defenses, techniques and position changes',()=>{
 const seen=new Set(),techniques=new Set();
 for(let seed=1;seed<=160;seed++){
  const s=fresh();s.seed=seed;for(const key of Object.keys(s.skills))s.skills[key]=55;for(const m of E.MOVES)s.moves[m.id]=2;s.loadout=E.MOVES.slice(seed%7,seed%7+4).map(m=>m.id);
  ready(s);E.tactic(s,['balanced','strike','ground','defend'][seed%4]);
  while(!s.fight.done){
   const f=s.fight,hp=[...f.hp],phase=f.phase,top=f.top;
   E.stepFight(s);const e=f.events.at(-1),a=e.attacker,b=1-a;
   assert.deepEqual(f.last,Object.fromEntries(['move','attacker','outcome','technique','phaseBefore','phaseAfter','topBefore','topAfter'].map(k=>[k,e[k]])));
   assert.equal(e.tick,f.tick);assert.equal(e.round,Math.floor((f.tick-1)/20)+1);assert.equal(e.text,f.log);
   assert.equal(e.phaseBefore,phase);assert.equal(e.topBefore,top);assert.equal(f.hp[a],hp[a]);
   assert.equal(hp[b]>f.hp[b],e.outcome==='hit');
   if(e.move==='takedown'){assert.equal(phase,'stand');assert.equal(e.phaseAfter,e.outcome==='success'?'ground':'stand');if(e.outcome==='success')assert.equal(e.topAfter,a)}
   if(e.move==='escape'){assert.equal(phase,'ground');assert.equal(e.phaseAfter,e.outcome==='success'?'stand':'ground')}
   if(e.move==='submission'){assert.equal(e.phaseAfter,'ground');assert.equal(e.outcome==='success',f.done&&f.result.method==='Submission')}
   if(e.move==='guard'){assert.equal(e.outcome,'rest');assert.equal(e.phaseAfter,phase)}
   if(e.move==='punch'||e.move==='kick')assert.equal(e.phaseAfter,'stand');
   if(e.move==='ground')assert.equal(e.phaseAfter,'ground');
   const learned=E.MOVES.find(m=>m.id===e.technique);
   if(learned&&e.technique!=='escape'){const equipped=a===0?f.playerMoves:f.enemy.moves;assert(equipped.includes(learned.id));if(a===0)assert.equal(s.moves[learned.id],2);assert.equal(learned.type,e.move);techniques.add(e.technique)}if(e.technique==='escape'&&a===0&&f.playerMoves.includes('escape'))techniques.add('escape');
   if(f.tick%20!==0||f.done)assert.equal(f.phase,e.phaseAfter);
   seen.add(e.move+':'+e.outcome);assert(E.validSave(s));
  }
 }
 for(const kind of ['punch:hit','punch:blocked','kick:hit','kick:blocked','takedown:success','takedown:defended','escape:success','escape:defended','submission:success','submission:defended','ground:hit','guard:rest'])assert(seen.has(kind),kind+' was not exercised');
 for(const m of E.MOVES)assert(techniques.has(m.id),m.id+' was not exercised');
});
test('round-ending actions retain ground metadata before the reset',()=>{
 const s=fresh();ready(s);E.tactic(s,'ground');s.fight.tick=19;s.fight.phase='ground';s.fight.top=1;s.seed=1000;
 E.stepFight(s);const e=s.fight.events.at(-1);
 assert.equal(e.phaseBefore,'ground');assert.equal(e.phaseAfter,'ground');assert.equal(s.fight.phase,'stand');
 assert.equal(e.round,1);assert.equal(e.time,'0:00');assert.match(e.text,/Raund bitti/);
 E.stepFight(s);assert.equal(s.fight.events.at(-1).round,2);assert.equal(s.fight.events.at(-1).time,'2:51');
});
test('fight history keeps every exchange and stops at sixty',()=>{
 const s=fresh();ready(s);s.fight.hp=[100000,100000];
 while(!s.fight.done)E.stepFight(s);
 assert.equal(s.fight.tick,60);assert.equal(s.fight.events.length,60);
 assert.deepEqual(s.fight.events.map(e=>e.tick),Array.from({length:60},(_,i)=>i+1));
 assert.match(s.fight.events.at(-1).text,/Hakem kararı/);assert.equal(s.fight.events.at(-1).time,'0:00');
 const history=JSON.stringify(s.fight.events);E.stepFight(s);assert.equal(JSON.stringify(s.fight.events),history);
 assert(E.validSave(JSON.parse(JSON.stringify(s))));
});
test('terminal exchanges record TKO and submission results without losing the action',()=>{
 const methods=new Set();
 for(let seed=1;seed<=160;seed++){
  const s=fresh();s.seed=seed;s.skills.bjj=85;s.skills.wrestling=80;s.moves.armbar=s.moves.triangle=2;s.loadout=['armbar','triangle'];ready(s);E.tactic(s,'ground');
  if(seed%2)s.fight.hp=[1,1];else s.fight.phase='ground';
  while(!s.fight.done)E.stepFight(s);
  const f=s.fight,e=f.events.at(-1);methods.add(f.result.method);
  assert.equal(e.text,f.log);assert(f.log.includes('Maç bitti: '+f.result.method));assert.equal(e.tick,f.tick);
  if(f.result.method==='TKO')assert.equal(e.outcome,'hit');
  if(f.result.method==='Submission'){assert.equal(e.move,'submission');assert.equal(e.outcome,'success')}
 }
 assert(methods.has('TKO'));assert(methods.has('Submission'));
});
test('legacy active matches reload and continue without invented past events',()=>{
 const modern=fresh();ready(modern);for(let i=0;i<8;i++)E.stepFight(modern);
 const legacy=JSON.parse(JSON.stringify(modern));delete legacy.fight.events;legacy.fight.last={move:legacy.fight.last.move,attacker:legacy.fight.last.attacker};
 assert(E.validSave(legacy));E.stepFight(legacy);E.stepFight(modern);
 assert.equal(legacy.fight.events.length,1);assert.equal(legacy.fight.events[0].tick,9);
 assert.deepEqual(legacy.fight.events[0],modern.fight.events.at(-1));
 const modernState=structuredClone(modern),legacyState=structuredClone(legacy);delete modernState.fight.events;delete legacyState.fight.events;
 assert.deepEqual(legacyState,modernState);assert(E.validSave(legacy));
});
test('invalid action metadata and event history are rejected safely',()=>{
 const good=fresh();ready(good);E.stepFight(good);
 const corruptions=[
  f=>f.events={},f=>f.events=[null],f=>f.events=Array(61).fill(f.events[0]),
  f=>f.events.push({...f.events[0]}),f=>f.events[0].tick=2,f=>f.events[0].tick=0,
  f=>f.events[0].round=2,f=>f.events[0].text=42,f=>f.events[0].text='x'.repeat(1001),f=>f.events[0].time='late',
  f=>f.events[0].attacker=2,f=>f.events[0].outcome='exploded',f=>f.events[0].technique='laser',
  f=>f.events[0].phaseAfter='air',f=>f.events[0].topBefore=-1,f=>f.events[0].move='toString',
  f=>delete f.events[0].phaseBefore,f=>delete f.last.outcome,f=>f.last.technique={},
  f=>f.last={move:'punch',attacker:0,outcome:'success',technique:'direct',phaseBefore:'stand',phaseAfter:'stand',topBefore:0,topAfter:0}
 ];
 for(const corrupt of corruptions){const s=structuredClone(good);corrupt(s.fight);assert.equal(E.validSave(s),false)}
 assert(E.validSave(good));
});
test('a scheduled opponent stays fixed and the appointment is required',()=>{
 const s=fresh();assert.throws(()=>E.startFight(s),/kamp/);E.bookFight(s);const enemy=structuredClone(s.camp.enemy),before=JSON.stringify(s);
 assert.throws(()=>E.startFight(s),/henüz/);assert.equal(JSON.stringify(s),before);
 s.hours=s.camp.dueAt;s.losses=3;E.startFight(s);assert.deepEqual(s.fight.enemy.skills,enemy.skills);assert.equal(s.fight.enemy.name,enemy.name);assert.equal(s.camp,null);
});
test('successful booking clears an old result but failure preserves it',()=>{
 const s=fresh();ready(s);while(!s.fight.done)E.stepFight(s);const before=JSON.stringify(s);
 assert.throws(()=>E.bookFight(s,3));assert.equal(JSON.stringify(s),before);E.bookFight(s);assert.equal(s.fight,null);assert(s.camp);assert(E.validSave(s));
});
test('new training is slower, preview is exact and repeated sessions diminish',()=>{
 const s=fresh(),before=JSON.stringify(s),p=E.trainingPreview(s,'boxing');assert.equal(JSON.stringify(s),before);assert(p.gain>=.8&&p.gain<=1.2);
 const skill=s.skills.boxing,cash=s.cash;E.train(s,'boxing');assert.equal(s.skills.boxing,skill+p.gain);assert.equal(s.cash,cash-p.cost);assert.equal(s.fatigue,p.fatigue);
 const next=E.trainingPreview(s,'boxing');assert(next.gain<p.gain*.85);E.recover(s,'sleep');assert.equal(s.fatigue,0);
 const improved=fresh();improved.gym=3;improved.coach=1;const enhanced=E.trainingPreview(improved,'boxing');assert(enhanced.gain>p.gain*2&&enhanced.gain<p.gain*4);
});
test('old saves keep stats, techniques, cash and unlocked leagues on migration',()=>{
 for(const wins of [0,2,3,6,7,12,13,20]){
  const s=fresh();s.wins=wins;s.cash=1800;s.skills.boxing=75;for(const m of E.MOVES)s.moves[m.id]=2;
  for(const k of ['loadout','leagueWins','fatigue','camp','trainingDay','world','competition','objectives'])delete s[k];
  const old=E.league(s),skills=structuredClone(s.skills),moves=structuredClone(s.moves);assert(E.validSave(s));E.migrate(s);
  assert.equal(s.version,1);assert.equal(s.cash,1800);assert.equal(s.wins,wins);assert.deepEqual(s.skills,skills);assert.deepEqual(s.moves,moves);assert.equal(E.league(s),old);assert.equal(s.loadout.length,4);assert(E.validSave(s));
  const once=JSON.stringify(s);E.migrate(s);assert.equal(JSON.stringify(s),once);
 }
});
test('lower-league wins cannot farm promotion to the next league',()=>{
 const s=fresh();s.wins=3;s.leagueWins=[3,0,0,0];assert.equal(E.league(s),1);
 const forceWin=tier=>{s.fight=null;ready(s,tier);s.fight.tick=59;s.fight.score=[10000,0];s.fight.hp=[100000,100000];E.stepFight(s);assert.equal(s.fight.result.winner,0)};
 for(let i=0;i<5;i++)forceWin(0);assert.equal(E.league(s),1);assert.equal(E.leagueProgress(s).remaining,4);
 for(let i=0;i<4;i++)forceWin(1);assert.equal(E.league(s),2);assert.equal(E.leagueProgress(s).remaining,6);assert.equal(s.wins,12);
});
test('only four learned moves can be equipped and a fight freezes the set',()=>{
 const s=fresh();assert.throws(()=>E.toggleMove(s,'hook'));for(const m of E.MOVES)s.moves[m.id]=2;
 for(const id of ['hook','uppercut','combo','lowkick'])E.toggleMove(s,id);const before=JSON.stringify(s);
 assert.throws(()=>E.toggleMove(s,'double'),/4/);assert.equal(JSON.stringify(s),before);E.toggleMove(s,'uppercut');E.toggleMove(s,'double');ready(s);
 assert.deepEqual(s.fight.playerMoves,s.loadout);assert.throws(()=>E.toggleMove(s,'hook'));s.loadout=[];assert.equal(s.fight.playerMoves.length,4);
});
test('a newly learned move is equipped automatically only if there is room',()=>{
 const s=fresh();s.skills.boxing=30;E.train(s,'boxing','hook');E.train(s,'boxing','hook');assert.deepEqual(s.loadout,['hook']);
 const full=fresh();full.skills.bjj=50;full.moves={hook:2,uppercut:2,lowkick:2,double:2};full.loadout=Object.keys(full.moves);E.train(full,'bjj','armbar');E.train(full,'bjj','armbar');assert.equal(full.moves.armbar,2);assert(!full.loadout.includes('armbar'));
});
test('unequipped techniques do not leak into combat and rivals use eligible techniques',()=>{
 const s=fresh();ready(s);const copy=structuredClone(s);for(const m of E.MOVES)copy.moves[m.id]=2;
 while(!s.fight.done){E.stepFight(s);E.stepFight(copy)}assert.deepEqual(s.fight,copy.fight);
 let used=false;
 for(let seed=1;seed<=30;seed++){
  const p=fresh();p.seed=seed;p.wins=3;p.leagueWins=[3,0,0,0];ready(p,1);
  for(const id of p.fight.enemy.moves){const m=E.MOVES.find(x=>x.id===id);assert(p.fight.enemy.skills[m.skill]>=m.level)}
  while(!p.fight.done){E.stepFight(p);if(p.fight.last.attacker===1&&p.fight.enemy.moves.includes(p.fight.last.technique))used=true}
 }assert(used);
});
test('fatigue lowers fight endurance and preparation is snapshotted',()=>{
 const freshState=fresh();E.bookFight(freshState);freshState.hours=freshState.camp.dueAt;freshState.energy=freshState.food=freshState.sleep=100;freshState.camp.prep.distance=80;
 const tired=structuredClone(freshState);tired.fatigue=85;E.startFight(freshState);E.startFight(tired);
 assert.equal(freshState.fight.prep.distance,.8);assert.equal(freshState.camp,null);assert(tired.fight.performance[0]<freshState.fight.performance[0]);assert(tired.fight.maxSt[0]<freshState.fight.maxSt[0]);
});
test('targeted preparation affects its matching combat outcome',()=>{
 const counts={takedownDefense:[0,0],distance:[0,0],groundEscape:[0,0]};
 for(let seed=1;seed<=500;seed++)for(const key of Object.keys(counts)){
  const base=fresh();base.seed=seed;ready(base);base.fight.enemy.style=key==='takedownDefense'?'wrestling':'boxing';base.fight.enemy.skills={boxing:30,kickboxing:15,wrestling:30,bjj:20,stamina:25,strength:25};
  if(key==='groundEscape'){base.fight.tick=1;base.fight.phase='ground';base.fight.top=1;base.fight.tactic='strike'}
  const prepped=structuredClone(base);prepped.fight.prep[key]=1;
  for(const [i,s] of [base,prepped].entries()){E.stepFight(s);const e=s.fight.last;counts[key][i]+=key==='distance'?e.outcome==='hit':e.outcome==='success'}
 }
 assert(counts.takedownDefense[1]<counts.takedownDefense[0]);assert(counts.distance[1]<counts.distance[0]);assert(counts.groundEscape[1]>counts.groundEscape[0]);
});
test('balanced fighters express boxing, kicking, wrestling and BJJ identities',()=>{
 const counts={};
 for(const martial of ['boxing','kickboxing','wrestling','bjj']){
  const n={punch:0,kick:0,takedown:0,ground:0,submission:0};counts[martial]=n;
  for(let seed=1;seed<=100;seed++){
   const s=fresh();s.seed=seed;for(const key of Object.keys(s.skills))s.skills[key]=25;s.skills[martial]=75;ready(s);s.fight.hp=[100000,100000];
   while(!s.fight.done){E.stepFight(s);const e=s.fight.last;if(e.attacker===0&&e.move in n)n[e.move]++}
  }
 }
 assert(counts.boxing.punch>counts.boxing.kick*3);assert(counts.kickboxing.kick>counts.kickboxing.punch*3);
 assert(counts.wrestling.takedown>counts.boxing.takedown*2);assert(counts.bjj.submission/(counts.bjj.submission+counts.bjj.ground)>counts.wrestling.submission/(counts.wrestling.submission+counts.wrestling.ground)*1.5);assert(counts.wrestling.ground>counts.boxing.ground*2);
});
test('malformed optional progression, equipment and preparation fields are rejected',()=>{
 const variants=[s=>s.loadout=['hook'],s=>s.loadout=['laser'],s=>{s.moves.hook=2;s.loadout=['hook','hook']},s=>s.leagueWins=[1],s=>s.leagueWins=[-1,0,0,0],s=>s.fatigue=101,s=>s.objectives={claimed:['fake-goal']},s=>s.competition.ranks=[9]];
 for(const change of variants){const s=fresh();change(s);assert(!E.validSave(s))}
 const good=fresh();ready(good);
 for(const change of [f=>f.playerMoves=['laser'],f=>f.performance=[1,2],f=>f.prep.distance=2,f=>f.enemy.moves=['laser']]){const s=structuredClone(good);change(s.fight);assert(!E.validSave(s))}
});
test('active drills consume one ordinary session and add at most twenty-five percent gain',()=>{
 for(const score of [0,50,100])for(const key of ['boxing','rope','strength']){
  const normal=fresh(),active=structuredClone(normal),skill=key==='rope'?'stamina':key,before=normal.skills[skill];
  E.train(normal,key);E.trainActive(active,key,score);
  assert(Math.abs(active.skills[skill]-before-(normal.skills[skill]-before)*(1+score/400))<1e-10);
  for(const field of ['cash','hours','energy','food','sleep','health','sessions','fatigue','trainingDay','moves'])assert.deepEqual(active[field],normal[field],field);
 }
 const capped=fresh();capped.skills.strength=99.9;E.trainActive(capped,'strength',100);assert.equal(capped.skills.strength,100);
});
test('invalid active drill submissions and unaffordable sessions are atomic',()=>{
 for(const score of [-1,101,.5,NaN,Infinity,'100',null,undefined]){const s=fresh(),before=JSON.stringify(s);assert.throws(()=>E.trainActive(s,'boxing',score));assert.equal(JSON.stringify(s),before)}
 for(const setup of [s=>{s.cash=0;s.gym=1;s.ownedGyms=[0,1]},s=>{E.bookFight(s);s.hours=s.camp.dueAt},s=>ready(s)]){
  const s=fresh();setup(s);const before=JSON.stringify(s);assert.throws(()=>E.trainActive(s,'boxing',100));assert.equal(JSON.stringify(s),before);
 }
});
test('corner commands share two charges, wait three exchanges and never create extra events',()=>{
 const s=fresh();ready(s);const before=JSON.stringify(s),id=s.fight.id,log=s.fight.log;
 assert.deepEqual(E.cornerStatus(s),{remaining:2,cooldown:0,active:null,label:'2/2 köşe komutu · 1. raund'});assert.equal(JSON.stringify(s),before);
 E.corner(s,'pressure');assert.equal(s.fight.tick,0);assert.equal(s.fight.id,id);assert.equal(s.fight.events.length,0);assert.equal(s.fight.log,log);
 assert.equal(E.cornerStatus(s).remaining,1);assert.equal(E.cornerStatus(s).cooldown,3);
 const issued=JSON.stringify(s);assert.throws(()=>E.corner(s,'escape'),/beklemelisin/);assert.equal(JSON.stringify(s),issued);
 for(let i=0;i<3;i++){E.stepFight(s);assert.equal(E.cornerStatus(s).cooldown,2-i)}
 assert.match(s.fight.events[0].text,/Köşe komutu: Baskı kur/);assert.equal(s.fight.events.length,3);E.corner(s,'breathe');assert.equal(E.cornerStatus(s).remaining,0);
 for(let i=0;i<4;i++)E.stepFight(s);assert.throws(()=>E.corner(s,'escape'),/iki köşe komutunu/);assert(E.validSave(s));
});
test('breathing gives twelve stamina now and trades the next player attack for guard',()=>{
 const s=fresh();ready(s);s.fight.tick=1;s.fight.st[0]=20;const enemyHp=s.fight.hp[1];
 E.corner(s,'breathe');assert.equal(s.fight.st[0],32);E.stepFight(s);
 assert.equal(s.fight.last.attacker,0);assert.equal(s.fight.last.move,'guard');assert.equal(s.fight.last.outcome,'rest');assert.equal(s.fight.hp[1],enemyHp);
 assert(s.fight.st[0]<34,'breathing guard must not grant another free recovery');assert.equal(s.fight.corner.active,null);assert.match(s.fight.log,/bu aksiyonda saldırmıyor/);
});
test('pressure improves a hit but charges extra stamina and expires after two attacks',()=>{
 let compared=0;
 for(let seed=1;seed<=100;seed++){
  const base=fresh();base.seed=seed;ready(base);base.fight.tick=1;base.fight.tactic='strike';base.fight.hp=[100000,100000];const boosted=structuredClone(base);
  E.corner(boosted,'pressure');E.stepFight(base);E.stepFight(boosted);
  if(base.fight.last.outcome==='hit'&&boosted.fight.last.outcome==='hit'){
   const damage=100000-base.fight.hp[1],boostDamage=100000-boosted.fight.hp[1];assert(Math.abs(boostDamage-damage*1.12)<1e-8);assert(Math.abs(base.fight.st[0]-boosted.fight.st[0]-3)<1e-8);compared++;
  }
  assert.equal(boosted.fight.corner.turns,1);E.stepFight(boosted);boosted.fight.phase='stand';E.stepFight(boosted);assert.equal(boosted.fight.corner.turns,0);assert.equal(boosted.fight.corner.active,null);
 }
 assert(compared>20);
 const defensive=fresh();defensive.seed=1;ready(defensive);defensive.fight.tick=1;defensive.fight.tactic='defend';E.corner(defensive,'pressure');E.stepFight(defensive);
 assert.equal(defensive.fight.last.move,'guard');assert.equal(defensive.fight.corner.turns,2,'guard must not spend an attacking charge');
});
test('escape command overrides a grappling tactic and improves takedown defense',()=>{
 const s=fresh();s.skills.bjj=75;ready(s);s.fight.tick=1;s.fight.phase='ground';s.fight.top=1;s.fight.tactic='ground';E.corner(s,'escape');E.stepFight(s);
 assert.equal(s.fight.last.move,'escape');assert.equal(s.fight.corner.turns,1);assert.match(s.fight.log,/Köşe yönlendirmesi/);
 const results=[0,0];
 for(let seed=1;seed<=300;seed++){
  const base=fresh();base.seed=seed;ready(base);base.fight.enemy.style='wrestling';base.fight.enemy.skills.wrestling=35;const escaped=structuredClone(base);E.corner(escaped,'escape');
  for(const [i,state] of [base,escaped].entries()){E.stepFight(state);results[i]+=state.fight.last.move==='takedown'&&state.fight.last.outcome==='success'}
 }
 assert(results[1]<results[0]);
});
test('round breaks replenish command charges and discard unused effects',()=>{
 const s=fresh();ready(s);s.fight.tick=19;s.fight.hp=[100000,100000];E.corner(s,'pressure');E.stepFight(s);
 assert.equal(s.fight.tick,20);assert.deepEqual(E.cornerStatus(s),{remaining:2,cooldown:0,active:null,label:'2/2 köşe komutu · 2. raund'});
 E.corner(s,'escape');s.fight.tick=39;E.stepFight(s);assert.equal(E.cornerStatus(s).remaining,2);assert.equal(s.fight.corner.round,3);assert.equal(s.fight.corner.active,null);
});
test('queued commands survive a saved game and malformed command saves are rejected',()=>{
 const good=fresh();ready(good);E.corner(good,'breathe');const copy=JSON.parse(JSON.stringify(good));assert(E.validSave(copy));E.stepFight(good);E.stepFight(copy);assert.deepEqual(copy,good);
 const bad=[c=>c.used=3,c=>c.lastTick=-1,c=>c.round=4,c=>c.turns=3,c=>c.active='toString',c=>c.note='laser',c=>delete c.lastTick];
 for(const corrupt of bad){const s=structuredClone(good);corrupt(s.fight.corner);assert(!E.validSave(s))}
 const noFight=fresh(),before=JSON.stringify(noFight);assert.throws(()=>E.corner(noFight,'pressure'));assert.equal(JSON.stringify(noFight),before);
 assert.throws(()=>E.corner(good,'toString'));while(!good.fight.done)E.stepFight(good);const done=JSON.stringify(good);assert.throws(()=>E.corner(good,'breathe'));assert.equal(JSON.stringify(good),done);
});
test('world rewards are applied through fight completion once and validated on reload',()=>{
 const s=fresh();s.world.reputation=4;s.world.sponsor='corner';ready(s);s.fight.tick=59;s.fight.hp=[100000,100000];s.fight.score=[10000,0];const before=s.cash;
 E.stepFight(s);assert.equal(s.fight.result.winner,0);assert.equal(s.fight.result.sponsorReward,40);assert.equal(s.cash,before+E.LEAGUES[0].purse+40);assert.equal(s.world.reputation,6);assert.equal(s.world.lastFight,s.fight.id);assert(s.fight.result.worldApplied);assert(E.validSave(s));
 const paid=JSON.stringify(s);E.stepFight(s);assert.equal(JSON.stringify(s),paid);
 const malformed=structuredClone(s);malformed.fight.result.sponsorReward=NaN;assert(!E.validSave(malformed));
 const badWorld=structuredClone(s);badWorld.world.reputation=101;assert(!E.validSave(badWorld));
});
test('owned homes add only their bounded recovery bonus after base recovery',()=>{
 const s=fresh();s.world.home=1;s.world.reputation=8;s.health=30;s.energy=10;s.fatigue=70;E.recover(s,'rest');
 assert.equal(s.health,46);assert.equal(s.energy,44);assert.equal(s.fatigue,54);
 s.health=20;s.energy=5;s.fatigue=70;E.recover(s,'sleep');assert.equal(s.health,56);assert.equal(s.energy,80);assert.equal(s.fatigue,24);
});
console.log(checks+' meaningful checks passed');
