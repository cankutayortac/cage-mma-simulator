import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>{let s=E.initial();s.seed=42;return s};
test('separate skills and training resources',()=>{let s=fresh(),b=s.skills.bjj;E.train(s,'boxing');assert(s.skills.boxing>15);assert.equal(s.skills.bjj,b);assert.equal(s.energy,72)});
test('invalid training is atomic',()=>{for(const key of ['toString','constructor','nope']){const s=fresh(),before=JSON.stringify(s);assert.throws(()=>E.train(s,key));assert.equal(JSON.stringify(s),before)}});
test('zero resource recovery remains possible',()=>{let s=fresh();s.cash=s.energy=s.food=s.sleep=s.health=0;E.recover(s,'sleep');E.recover(s,'help');E.recover(s,'job');assert.equal(s.cash,110)});
test('meals do not overdraft',()=>{let s=fresh();s.cash=0;const before=JSON.stringify(s);assert.throws(()=>E.recover(s,'meal'));assert.equal(JSON.stringify(s),before)});
test('gym and coach prices applied to relevant session',()=>{let s=fresh();s.cash=1000;E.chooseGym(s,1);E.chooseCoach(s,1);assert.equal(s.cash,350);assert.equal(E.trainingCost(s,'boxing'),40);assert.equal(E.trainingCost(s,'bjj'),20);assert.equal(E.trainingCost(s,'rope'),0)});
test('locked league cannot be entered',()=>{let s=fresh();assert.throws(()=>E.startFight(s,2));assert.equal(s.fight,null)});
test('move needs level and two sessions',()=>{let s=fresh();assert.throws(()=>E.train(s,'boxing','hook'));s.skills.boxing=25;E.train(s,'boxing','hook');assert.equal(s.moves.hook,1);E.train(s,'boxing','hook');assert.equal(s.moves.hook,2)});
test('active fight survives serialization exactly',()=>{let s=fresh();E.startFight(s);for(let i=0;i<8;i++)E.stepFight(s);const copy=JSON.parse(JSON.stringify(s));assert(E.validSave(copy));E.stepFight(s);E.stepFight(copy);assert.deepEqual(s,copy)});
test('fight ends and pays only once',()=>{let s=fresh();E.startFight(s);for(let i=0;i<65;i++)E.stepFight(s);assert(s.fight.done);assert.equal(s.history.length,1);let cash=s.cash;for(let i=0;i<10;i++)E.stepFight(s);assert.equal(s.cash,cash);assert(E.validSave(s))});
test('malformed fight saves rejected',()=>{for(const field of ['hp','st','maxHp','maxSt','score']){let s=fresh();E.startFight(s);s.fight[field]=[];assert(!E.validSave(s))}for(const field of ['phase','top','last']){let s=fresh();E.startFight(s);delete s.fight[field];assert(!E.validSave(s))}let s=fresh();E.startFight(s);s.fight.done=true;assert(!E.validSave(s))});
test('all fights remain finite across 300 seeds and tactics',()=>{for(let seed=1;seed<=300;seed++){let s=fresh();s.seed=seed;for(let k of Object.keys(s.skills))s.skills[k]=seed%100;E.startFight(s);E.tactic(s,['balanced','strike','ground','defend'][seed%4]);for(let t=0;t<61;t++)E.stepFight(s);assert(s.fight.done);assert(E.validSave(s));assert(s.cash>=0)}});
test('ground control unlock changes combat',()=>{let changed=false;for(let seed=1;seed<50;seed++){let s=fresh();s.seed=seed;s.skills.bjj=60;s.skills.wrestling=60;E.startFight(s);E.tactic(s,'ground');s.fight.phase='ground';const b=structuredClone(s);b.moves.control=2;for(let i=0;i<60;i++){E.stepFight(s);E.stepFight(b)}if(JSON.stringify(s.fight)!==JSON.stringify(b.fight))changed=true}assert(changed)});
test('triangle can actually be used',()=>{let seen=false;for(let seed=1;seed<80;seed++){let s=fresh();s.seed=seed;s.skills.bjj=75;E.startFight(s);E.tactic(s,'ground');s.fight.phase='ground';s.moves.armbar=s.moves.triangle=2;for(let i=0;i<60;i++){E.stepFight(s);if(s.fight.log.includes('Üçgen'))seen=true}}assert(seen)});
test('combat events describe actual hits, defenses, techniques and position changes',()=>{
 const seen=new Set(),techniques=new Set();
 for(let seed=1;seed<=160;seed++){
  const s=fresh();s.seed=seed;for(const key of Object.keys(s.skills))s.skills[key]=55;for(const m of E.MOVES)s.moves[m.id]=2;
  E.startFight(s);E.tactic(s,['balanced','strike','ground','defend'][seed%4]);
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
   if(learned&&!(e.technique==='escape'&&a===1)){assert.equal(a,0);assert.equal(s.moves[learned.id],2);assert.equal(learned.type,e.move);techniques.add(e.technique)}
   if(f.tick%20!==0||f.done)assert.equal(f.phase,e.phaseAfter);
   seen.add(e.move+':'+e.outcome);assert(E.validSave(s));
  }
 }
 for(const kind of ['punch:hit','punch:blocked','kick:hit','kick:blocked','takedown:success','takedown:defended','escape:success','escape:defended','submission:success','submission:defended','ground:hit','guard:rest'])assert(seen.has(kind),kind+' was not exercised');
 for(const m of E.MOVES)assert(techniques.has(m.id),m.id+' was not exercised');
});
test('round-ending actions retain ground metadata before the reset',()=>{
 const s=fresh();E.startFight(s);E.tactic(s,'ground');s.fight.tick=19;s.fight.phase='ground';s.fight.top=1;s.seed=1000;
 E.stepFight(s);const e=s.fight.events.at(-1);
 assert.equal(e.phaseBefore,'ground');assert.equal(e.phaseAfter,'ground');assert.equal(s.fight.phase,'stand');
 assert.equal(e.round,1);assert.equal(e.time,'0:00');assert.match(e.text,/Raund bitti/);
 E.stepFight(s);assert.equal(s.fight.events.at(-1).round,2);assert.equal(s.fight.events.at(-1).time,'2:51');
});
test('fight history keeps every exchange and stops at sixty',()=>{
 const s=fresh();E.startFight(s);s.fight.hp=[100000,100000];
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
  const s=fresh();s.seed=seed;s.skills.bjj=85;s.skills.wrestling=80;s.moves.armbar=s.moves.triangle=2;E.startFight(s);E.tactic(s,'ground');
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
 const modern=fresh();E.startFight(modern);for(let i=0;i<8;i++)E.stepFight(modern);
 const legacy=JSON.parse(JSON.stringify(modern));delete legacy.fight.events;legacy.fight.last={move:legacy.fight.last.move,attacker:legacy.fight.last.attacker};
 assert(E.validSave(legacy));E.stepFight(legacy);E.stepFight(modern);
 assert.equal(legacy.fight.events.length,1);assert.equal(legacy.fight.events[0].tick,9);
 assert.deepEqual(legacy.fight.events[0],modern.fight.events.at(-1));
 const modernState=structuredClone(modern),legacyState=structuredClone(legacy);delete modernState.fight.events;delete legacyState.fight.events;
 assert.deepEqual(legacyState,modernState);assert(E.validSave(legacy));
});
test('invalid action metadata and event history are rejected safely',()=>{
 const good=fresh();E.startFight(good);E.stepFight(good);
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
console.log(checks+' meaningful checks passed');
