import assert from 'node:assert/strict';
import {report,needsRoundBreak} from '../dist/match-report.js';
import * as E from '../dist/engine.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const event=(attacker,move,outcome,round=1)=>({attacker,move,outcome,round});
const fixture=()=>({hp:[72,80],maxHp:[120,120],st:[48,60],maxSt:[80,80],events:[]});

test('match reports separate strike attempts, landed hits and successful positional actions',()=>{
 const f=fixture();f.events=[event(0,'punch','hit'),event(0,'kick','blocked'),event(0,'ground','hit'),event(0,'takedown','defended'),event(0,'takedown','success'),event(0,'escape','success'),event(0,'submission','defended'),event(1,'punch','miss'),event(1,'takedown','success'),event(1,'escape','defended'),event(1,'guard','rest')];
 const before=JSON.stringify(f),data=report(f);assert.equal(JSON.stringify(f),before);
 assert.deepEqual(data.fighters,[{attempts:3,hits:2,takedowns:1,escapes:1,submissions:1},{attempts:1,hits:0,takedowns:1,escapes:0,submissions:0}]);
 assert.equal(data.exchanges,11);assert.equal(data.breath,60);assert.equal(data.health,60);
});
test('round views count only exchanges from their selected round',()=>{
 const f=fixture();f.events=[event(0,'punch','hit',1),event(1,'takedown','success',1),event(0,'kick','blocked',2),event(1,'ground','hit',2),event(0,'submission','success',3)];
 assert.equal(report(f).exchanges,5);assert.equal(report(f,1).exchanges,2);assert.equal(report(f,1).fighters[0].hits,1);assert.equal(report(f,2).fighters[0].hits,0);assert.equal(report(f,2).fighters[1].hits,1);assert.equal(report(f,3).fighters[0].submissions,1);
});
test('missing history is supported and displayed condition stays between zero and one hundred',()=>{
 const f=fixture();delete f.events;f.hp[0]=-4;f.st[0]=100;
 const data=report(f);assert.equal(data.health,0);assert.equal(data.breath,100);assert.equal(data.exchanges,0);assert(data.fighters.every(fighter=>Object.values(fighter).every(value=>value===0)));
});
test('corner advice prioritizes low stamina, damage, takedown risk and poor accuracy',()=>{
 const f=fixture();f.st[0]=10;f.hp[0]=10;assert.match(report(f).advice,/Nefesin azalıyor/);
 f.st[0]=80;assert.match(report(f).advice,/Çok hasar aldın/);
 f.hp[0]=120;f.events=[event(1,'takedown','success')];assert.match(report(f).advice,/yere alışlarda üstün/);
 f.events=[event(0,'punch','blocked'),event(0,'kick','miss'),event(0,'punch','hit')];assert.match(report(f).advice,/isabetin düşük/);
 f.events=[event(0,'punch','hit')];assert.match(report(f).advice,/Temponu koru/);
});
test('round breaks happen once at twenty and forty exchanges, never after a result',()=>{
 assert.equal(needsRoundBreak(null),false);
 for(const tick of [0,19,21,39,41,60])assert.equal(needsRoundBreak({tick,done:false}),false);
 for(const tick of [20,40]){assert(needsRoundBreak({tick,done:false}));assert.equal(needsRoundBreak({tick,done:false,uiRoundBreak:tick}),false);assert.equal(needsRoundBreak({tick,done:true}),false)}
 assert(needsRoundBreak({tick:40,done:false,uiRoundBreak:20}));
});
test('engine matches expose two acknowledgeable breaks and correct completed round reports',()=>{
 const s=E.initial();s.seed=42;E.bookFight(s);s.hours=s.camp.dueAt;s.energy=s.food=s.sleep=s.health=100;E.startFight(s);s.fight.hp=[100000,100000];
 const breaks=[];
 while(!s.fight.done){
  E.stepFight(s);
  if(needsRoundBreak(s.fight)){
   breaks.push(s.fight.tick);assert.equal(report(s.fight,s.fight.tick/20).exchanges,20);
   s.fight.uiRoundBreak=s.fight.tick;assert.equal(needsRoundBreak(s.fight),false);
   const reloaded=JSON.parse(JSON.stringify(s));assert(E.validSave(reloaded));assert.equal(needsRoundBreak(reloaded.fight),false);
  }
 }
 assert.deepEqual(breaks,[20,40]);assert.equal(s.fight.tick,60);assert.equal(report(s.fight,3).exchanges,20);assert.equal(needsRoundBreak(s.fight),false);
});
console.log(checks+' match report checks passed');
