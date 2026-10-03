// Deterministic balance report, not a probabilistic pass/fail test.
import * as E from '../dist/engine.js';
import * as C from '../dist/camp.js';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';

export function prepareFirstCamp(mode='mixed',limit=Infinity){
 const s=E.initial(),actions=[];s.seed=1;E.bookFight(s,0);
 const act=(kind,key)=>{E[kind](s,key);actions.push([kind,key]);assert(E.validSave(s),'plan produced an invalid save');assert(actions.length<500,'plan stopped making progress')};
 const program=mode==='spam'?Array(9).fill('boxing'):['boxing','distance','stamina','boxing','strength','distance','boxing','stamina','boxing'];
 let index=0;
 while(C.remaining(s)>10&&s.sessions<limit){
  if(mode==='steady'&&s.trainingDay.day===E.day(s)&&s.trainingDay.count>=3){act('recover','sleep');continue}
  if(s.food<32){if(s.helpDay!==E.day(s))act('recover','help');else if(s.cash>=35)act('recover','meal');else act('recover','job');continue}
  if(s.energy<32||s.sleep<35||s.fatigue>=64){act('recover','sleep');continue}
  const key=program[index++%program.length];act(key==='distance'?'trainFocus':'train',key);
 }
 if(C.remaining(s)>0)act('waitForFight');
 // A player can recover after the scheduled day; never add more training.
 while(s.energy<90||s.sleep<85||s.fatigue>15)act('recover','sleep');
 while(s.food<85){if(s.helpDay!==E.day(s))act('recover','help');else if(s.cash>=35)act('recover','meal');else act('recover','job')}
 return{s,actions};
}

export function sample(state,count=2000){
 const result={wins:0,draws:0,losses:0};
 for(let seed=1;seed<=count;seed++){
  const s=structuredClone(state);s.seed=seed;E.startFight(s);
  while(!s.fight.done)E.stepFight(s);
  result[['wins','losses','draws'][s.fight.result.winner]]++;
 }
 return{...result,winPercent:Math.round(result.wins/count*1000)/10};
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
const unprepared=E.initial();E.bookFight(unprepared);E.waitForFight(unprepared);E.recover(unprepared,'help');E.recover(unprepared,'meal');
const mixed=prepareFirstCamp(),spam=prepareFirstCamp('spam'),moderate=prepareFirstCamp('steady',24);
const noPrep=structuredClone(moderate.s);noPrep.camp.prep.distance=0;
const exhausted=structuredClone(moderate.s);exhausted.fatigue=85;
console.log(JSON.stringify({
 seedsPerScenario:2000,
 unprepared:sample(unprepared),
 moderateCamp:{sessions:moderate.s.sessions,actions:moderate.actions.length,cashRemaining:moderate.s.cash,gameHours:moderate.s.hours-8,skills:moderate.s.skills,prep:moderate.s.camp.prep,result:sample(moderate.s)},
mixedCamp:{sessions:mixed.s.sessions,skills:mixed.s.skills,prep:mixed.s.camp.prep,actions:mixed.actions.length,result:sample(mixed.s)},
 moderateBuildWithoutCounterPrep:sample(noPrep),
 moderateBuildExhausted:sample(exhausted),
 singleSkillSpam:{sessions:spam.s.sessions,skills:spam.s.skills,result:sample(spam.s)}
},null,2));

}
