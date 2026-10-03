import assert from 'node:assert/strict';
import * as C from '../dist/camp.js';
let checks=0;
const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>({hours:8,energy:90,food:75,sleep:85,health:100,cash:250,sessions:0,skills:{boxing:15,kickboxing:12,wrestling:12,bjj:12,stamina:18,strength:12},moves:{hook:2,armbar:1},fight:null});
const enemy=()=>({name:'Kamp rakibi',style:'wrestling',skills:{boxing:17,kickboxing:16,wrestling:28,bjj:19,stamina:22,strength:21}});
const booked=()=>{const s=fresh();C.book(s,0,enemy());return s};
const noChange=(s,fn)=>{const before=structuredClone(s);assert.throws(fn);assert.deepEqual(s,before)};

test('legacy migration preserves learned moves and only fills absent camp fields',()=>{
 const s=fresh(),moves=structuredClone(s.moves),skills=structuredClone(s.skills);assert(C.validExtras(s));C.migrate(s);
 assert.equal(s.fatigue,0);assert.equal(s.camp,null);assert.deepEqual(s.trainingDay,{day:1,count:0});assert.deepEqual(s.moves,moves);assert.deepEqual(s.skills,skills);
 s.fatigue=37;s.trainingDay.count=2;const before=structuredClone(s);C.migrate(s);assert.deepEqual(s,before);
});
test('accepted fight is a stable seven-day snapshot that survives reload',()=>{
 const s=fresh(),e=enemy();C.book(s,0,e);e.skills.wrestling=99;e.name='Changed';
 assert.equal(s.camp.dueAt-s.camp.bookedAt,168);assert.equal(s.camp.enemy.skills.wrestling,28);assert.equal(s.camp.enemy.name,'Kamp rakibi');assert(C.validExtras(s));
 const copy=JSON.parse(JSON.stringify(s));assert.deepEqual(C.status(copy),C.status(s));assert.equal(C.remaining(s),168);
 s.hours+=167.5;assert.equal(C.status(s).ready,false);assert.equal(C.status(s).daysLeft,1);
 s.hours+=.5;assert.equal(C.status(s).ready,true);assert.equal(C.remaining(s),0);s.hours+=48;assert.equal(C.remaining(s),0);assert(C.validExtras(s));
});
test('targeted work consumes one hour and resources but changes only its own preparation',()=>{
 const s=booked(),before=structuredClone(s);C.trainFocus(s,'takedownDefense');
 assert.equal(s.hours,before.hours+1);assert.equal(s.energy,before.energy-18);assert.equal(s.food,before.food-11);assert.equal(s.sleep,before.sleep-9);assert.equal(s.cash,before.cash);
 assert.equal(s.sessions,1);assert.equal(s.camp.sessions,1);assert.equal(s.fatigue,12);assert.equal(s.camp.prep.takedownDefense,18);assert.equal(s.camp.prep.distance,0);assert.equal(s.camp.prep.groundEscape,0);
 assert(s.skills.wrestling>before.skills.wrestling&&s.skills.wrestling-before.skills.wrestling<.25);assert.equal(s.skills.boxing,before.skills.boxing);
 assert.deepEqual(C.combatBoost(s),{takedownDefense:.18,distance:0,groundEscape:0});
 const view=C.status(s);view.prep.takedownDefense=100;assert.equal(s.camp.prep.takedownDefense,18);
});
test('repeated daily sessions get less productive and accumulate fatigue',()=>{
 const s=booked(),factors=[];
 for(let i=0;i<4;i++){s.energy=s.food=s.sleep=100;factors.push(C.trainingMultiplier(s));C.trainFocus(s,'distance')}
 assert.equal(factors[0],1);assert(factors[1]<factors[0]);assert(factors[2]<factors[1]);assert(factors[3]<factors[2]);assert.equal(s.trainingDay.count,4);assert.equal(s.fatigue,60);
 const tired=C.readiness(s);assert(tired<1&&tired>.75);s.hours=32;assert.equal(C.trainingMultiplier(s),C.readiness(s));
});
test('session started before midnight counts on the old day and next day resets',()=>{
 const s=booked();s.hours=23.5;s.trainingDay={day:1,count:3};s.fatigue=0;C.trainFocus(s,'groundEscape');
 assert.equal(s.hours,24.5);assert.deepEqual(s.trainingDay,{day:1,count:4});assert.equal(s.fatigue,18);assert.equal(C.trainingMultiplier(s),1);assert(C.validExtras(s));
});
test('due-day training is blocked while recovery remains possible indefinitely',()=>{
 const s=booked();s.hours=s.camp.dueAt;noChange(s,()=>C.trainFocus(s,'distance'));noChange(s,()=>C.assertTraining(s));
 s.fatigue=95;const hours=s.hours;C.recover(s,'sleep');assert.equal(s.fatigue,55);assert.equal(s.hours,hours);C.recover(s,'rest');assert.equal(s.fatigue,41);C.recover(s,'meal');assert.equal(s.fatigue,41);
 s.hours+=24*30;assert(C.status(s).ready);assert(C.validExtras(s));
});
test('invalid camp operations are atomic, including unmigrated saves',()=>{
 const legacy=fresh();noChange(legacy,()=>C.trainFocus(legacy,'distance'));noChange(legacy,()=>C.book(legacy,-1,enemy()));noChange(legacy,()=>C.book(legacy,0,{...enemy(),skills:{}}));noChange(legacy,()=>C.cancel(legacy));noChange(legacy,()=>C.wait(legacy));
 for(const key of ['toString','constructor','missing']){const s=booked();noChange(s,()=>C.trainFocus(s,key))}
 for(const field of ['energy','food','sleep','health']){const s=booked();s[field]=0;noChange(s,()=>C.trainFocus(s,'distance'))}
 const busy=booked();noChange(busy,()=>C.book(busy,0,enemy()));busy.fatigue=85;noChange(busy,()=>C.trainFocus(busy,'distance'));
 const fighting=fresh();fighting.fight={done:false};noChange(fighting,()=>C.book(fighting,0,enemy()));noChange(fighting,()=>C.assertTraining(fighting));
});
test('fast-forward restores condition with a food cost and never grants skills or preparation',()=>{
 const s=booked();s.fatigue=70;s.energy=20;s.sleep=20;const skills=structuredClone(s.skills),prep=structuredClone(s.camp.prep);C.wait(s);
 assert.equal(s.hours,s.camp.dueAt);assert.equal(s.food,10);assert.equal(s.energy,95);assert.equal(s.sleep,100);assert.equal(s.fatigue,0);assert.deepEqual(s.skills,skills);assert.deepEqual(s.camp.prep,prep);assert.equal(s.sessions,0);noChange(s,()=>C.wait(s));
 const short=booked();short.hours=short.camp.dueAt-.5;short.energy=20;short.sleep=20;short.fatigue=50;C.wait(short);assert.equal(short.energy,20.25);assert.equal(short.fatigue,48.75);
});
test('cancelling removes opponent-specific preparation and preserves permanent progress',()=>{
 const s=booked();C.trainFocus(s,'distance');const skills=structuredClone(s.skills),cash=s.cash;C.cancel(s);assert.equal(s.camp,null);assert.deepEqual(s.skills,skills);assert.equal(s.cash,cash);
 C.book(s,0,enemy());assert.deepEqual(s.camp.prep,{takedownDefense:0,distance:0,groundEscape:0});assert.equal(s.camp.sessions,0);assert.equal(s.camp.bookedAt,s.hours);
});
test('preparation caps at100 and readiness stays in its documented range',()=>{
 const s=booked();s.camp.prep.distance=95;C.trainFocus(s,'distance');assert.equal(s.camp.prep.distance,100);
 for(let fatigue=0;fatigue<=100;fatigue++){s.fatigue=fatigue;assert(C.readiness(s)>=.75&&C.readiness(s)<=1)}
 s.fatigue=100;assert.equal(C.readiness(s),.75);
});
test('a fully prepared focus refuses another session without spending time or resources',()=>{
 for(const key of Object.keys(C.FOCUSES)){
  const s=booked();s.camp.prep[key]=100;
  noChange(s,()=>C.trainFocus(s,key));
  s.camp.prep[key]=99.5;C.trainFocus(s,key);assert.equal(s.camp.prep[key],100);
  noChange(s,()=>C.trainFocus(s,key));
 }
});
test('malformed new save fields are rejected while missing legacy fields are accepted',()=>{
 const good=booked();assert(C.validExtras(good));
 const corruptions=[s=>s.fatigue=-1,s=>s.fatigue=101,s=>s.fatigue='0',s=>s.trainingDay=null,s=>s.trainingDay.count=25,s=>s.trainingDay.count=.5,s=>s.trainingDay.day=999,s=>s.camp={},s=>s.camp.dueAt+=1,s=>s.camp.bookedAt=99,s=>s.camp.sessions=-1,s=>s.camp.sessions=.5,s=>s.camp.enemy.skills.bjj=NaN,s=>s.camp.enemy.style='laser',s=>s.camp.enemy.name='',s=>s.camp.prep.distance=101,s=>s.camp.prep.distance='2',s=>delete s.camp.prep.distance,s=>s.camp.tier=4,s=>s.fight={done:false}];
 for(const corrupt of corruptions){const s=structuredClone(good);corrupt(s);assert.equal(C.validExtras(s),false)}
 const legacy=fresh();legacy.fight={done:false};assert(C.validExtras(legacy));
});
test('scouting derives advice from the actual opponent and does not invent history',()=>{
 const s=fresh(),e=enemy(),before=structuredClone(e);const report=C.scouting(s,e);assert.equal(report.focus,'takedownDefense');assert.match(report.strength,/Güreş.*28/);assert.match(report.weakness,/Kickboks.*16/);assert.deepEqual(e,before);
 for(const [style,focus] of [['boxing','distance'],['kickboxing','distance'],['bjj','groundEscape']])assert.equal(C.scouting(s,{...e,style}).focus,focus);
});
console.log(checks+' camp checks passed');
