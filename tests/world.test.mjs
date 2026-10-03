import assert from 'node:assert/strict';
import * as W from '../dist/world.js';
import * as UI from '../dist/world-ui.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>({hours:8,cash:250,earned:0,energy:90,food:75,sleep:85,health:100,fatigue:0,sessions:0,trainingDay:{day:1,count:0},skills:{boxing:15,kickboxing:12,wrestling:12,bjj:12,stamina:18,strength:12},fight:null,camp:null});
const atomic=(s,fn)=>{const before=structuredClone(s);assert.throws(fn);assert.deepEqual(s,before)};
const findChoice=(s,predicate)=>{for(const e of W.opportunities(s))for(const c of e.choices)if(predicate(c))return[e,c];throw Error('No matching choice')};
const take=(s,e,c)=>W.act(s,'event:'+e.id+':'+c.id);
const ended=(s,id='one',winner=0,tier=0)=>{s.fight={id,done:true,tier,enemy:{name:'Bora'},result:{winner,reward:220}};return s};

test('world migration is idempotent and validates optional saved data',()=>{
 const s=fresh();assert(W.valid(s));W.migrate(s);assert.equal(s.world.reputation,0);assert.equal(s.world.home,0);assert.equal(s.world.sponsor,null);assert(W.valid(s));
 s.world.reputation=12;const before=structuredClone(s);W.migrate(s);assert.deepEqual(s,before);
 for(const corrupt of [s=>s.world=null,s=>s.world.reputation=-1,s=>s.world.reputation=101,s=>s.world.home=3,s=>s.world.sponsor='missing',s=>s.world.notice=42,s=>s.world.lastFight='',s=>s.world.sponsorPaidDay=999,s=>s.world.eventsTaken=[{day:1,id:'fake',choice:'fake'}]]){const bad=structuredClone(s);corrupt(bad);assert.equal(W.valid(bad),false)}
});
test('daily board has three stable distinct choices and changes with game time',()=>{
 const s=fresh(),board=W.opportunities(s);assert.equal(board.length,3);assert.equal(new Set(board.map(e=>e.id)).size,3);assert.deepEqual(W.opportunities(s),board);board[0].name='tamper';assert.notEqual(W.opportunities(s)[0].name,'tamper');
 const ids=W.opportunities(s).map(e=>e.id);s.hours+=24;assert.notDeepEqual(W.opportunities(s).map(e=>e.id),ids);
});
test('one city opportunity per day applies only visible time and resource costs',()=>{
 const s=fresh(),[e,c]=findChoice(s,c=>!c.training),before=structuredClone(s);take(s,e,c);
 assert.equal(s.hours,before.hours+c.hours);assert.equal(s.energy,before.energy-c.energy);assert.equal(s.food,before.food-c.food);assert.equal(s.sleep,before.sleep-c.sleep);assert.equal(s.cash,before.cash+c.reward-c.cash);assert.equal(s.earned,c.reward);assert(W.opportunityTaken(s));assert.equal(s.world.eventsTaken.length,1);assert(W.valid(s));
 const another=W.opportunities(s)[1];atomic(s,()=>take(s,another,another.choices[0]));s.hours+=24;assert(!W.opportunityTaken(s));
});
test('invalid actions and insufficient resources do not migrate or spend anything',()=>{
 const s=fresh();atomic(s,()=>W.act(s,'event:fake:fake'));atomic(s,()=>W.act(s,'constructor'));atomic(s,()=>W.act(s,'home:2'));atomic(s,()=>W.act(s,'sponsor:apex'));
 const [e,c]=findChoice(s,c=>c.training);s.energy=0;atomic(s,()=>take(s,e,c));
 const poor=fresh();W.migrate(poor);poor.world.reputation=30;poor.cash=1;atomic(poor,()=>W.act(poor,'home:1'));
 const busy=fresh();busy.fight={done:false};atomic(busy,()=>W.act(busy,'sponsor:corner'));atomic(busy,()=>take(busy,e,c));
});
test('training city actions honor fatigue and due-camp restrictions but community actions remain possible',()=>{
 const s=fresh(),[e,c]=findChoice(s,c=>c.training);s.camp={dueAt:s.hours};atomic(s,()=>take(s,e,c));s.camp=null;s.fatigue=85;atomic(s,()=>take(s,e,c));
 s.camp={dueAt:s.hours};const [other,choice]=findChoice(s,c=>!c.training);take(s,other,choice);assert(W.opportunityTaken(s));
});
test('sparring grants bounded skill gains, exact fatigue and explicit health cost',()=>{
 const s=fresh(),event=W.opportunities(s).find(e=>e.id==='openmat'),choice=event.choices.find(c=>c.id==='hard'),preview=W.choicePreview(s,choice);const before=structuredClone(s);take(s,event,choice);
 assert.equal(s.health,before.health-8);assert.equal(s.fatigue,18);assert.equal(s.sessions,1);assert.equal(s.trainingDay.count,1);assert.equal(s.skills.boxing,before.skills.boxing+preview.skills.boxing);assert(s.skills.boxing-before.skills.boxing<.4);assert.equal(s.world.reputation,1);
});
test('cross-midnight activity belongs to the day it started',()=>{
 const s=fresh();s.hours=23.5;const [e,c]=findChoice(s,c=>c.training);take(s,e,c);assert.equal(s.world.eventsTaken[0].day,1);assert.equal(s.trainingDay.day,1);assert(!W.opportunityTaken(s));assert(W.valid(s));
});
test('housing upgrades charge once in order and recovery perks remain bounded',()=>{
 const s=fresh();W.migrate(s);s.world.reputation=25;s.cash=8000;W.act(s,'home:1');assert.equal(s.cash,6800);assert.equal(s.world.home,1);atomic(s,()=>W.act(s,'home:1'));W.act(s,'home:2');assert.equal(s.cash,800);assert.equal(s.world.home,2);
 s.energy=50;s.health=60;s.fatigue=40;W.recoverBonus(s,'rest');assert.equal(s.energy,58);assert.equal(s.health,64);assert.equal(s.fatigue,36);W.recoverBonus(s,'sleep');assert.equal(s.health,72);assert.equal(s.fatigue,24);
 s.energy=99;s.health=99;s.fatigue=1;W.recoverBonus(s,'rest');assert.equal(s.energy,100);assert.equal(s.health,100);assert.equal(s.fatigue,0);const before=structuredClone(s);assert.equal(W.recoverBonus(s,'meal'),'');assert.deepEqual(s,before);
});
test('sponsors require reputation and can be switched without charging money',()=>{
 const s=fresh();atomic(s,()=>W.act(s,'sponsor:corner'));W.migrate(s);s.world.reputation=30;const cash=s.cash;W.act(s,'sponsor:corner');assert.equal(s.world.sponsor,'corner');atomic(s,()=>W.act(s,'sponsor:corner'));W.act(s,'sponsor:apex');assert.equal(s.world.sponsor,'apex');assert.equal(s.cash,cash);W.act(s,'sponsor:none');assert.equal(s.world.sponsor,null);
});
test('fight rewards and reputation are idempotent across reloads',()=>{
 const s=fresh();W.migrate(s);s.world.reputation=4;W.act(s,'sponsor:corner');ended(s);const cash=s.cash,earned=s.earned;assert.equal(W.afterFight(s),40);assert.equal(s.cash,cash+40);assert.equal(s.earned,earned+40);assert.equal(s.world.reputation,6);assert.equal(s.fight.result.sponsorReward,40);assert.equal(s.fight.result.reputationReward,2);
 const before=structuredClone(s);assert.equal(W.afterFight(s),0);assert.deepEqual(s,before);const copy=JSON.parse(JSON.stringify(s));W.afterFight(copy);assert.deepEqual(copy,s);assert(W.valid(s));
});
test('sponsor payout respects minimum league and once-per-day cap',()=>{
 const s=fresh();W.migrate(s);s.world.reputation=25;W.act(s,'sponsor:apex');ended(s,'low',1,0);assert.equal(W.afterFight(s),0);assert.equal(s.world.reputation,26);ended(s,'pro',2,2);assert.equal(W.afterFight(s),300);assert.equal(s.world.reputation,27);ended(s,'same-day',0,3);assert.equal(W.afterFight(s),0);s.hours+=24;ended(s,'next-day',0,3);assert.equal(W.afterFight(s),300);
});
test('city UI exposes costs, choices and correct locked controls without mutating state',()=>{
 const s=fresh();W.migrate(s);const before=structuredClone(s),ui=UI.renderCity(s);assert(ui.context.includes('ŞEHİRDEKİ HAYATIN'));assert(ui.content.includes('data-action="world"'));assert(ui.content.includes('−8 sağlık'));assert(ui.content.includes('4 İTİBAR GEREKLİ'));assert(ui.content.includes('oyun gününde en fazla bir kez'));assert.deepEqual(s,before);
});
console.log(checks+' world checks passed');
