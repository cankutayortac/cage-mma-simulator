import assert from 'node:assert/strict';
import * as O from '../dist/objectives.js';
import * as W from '../dist/world.js';
let checks=0;
const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>({hours:8,cash:250,earned:0,sessions:0,wins:0,losses:0,draws:0,skills:{boxing:15,kickboxing:12,wrestling:12,bjj:12,stamina:18,strength:12},ownedGyms:[0],moves:{},fight:null});
const atomic=(s,fn)=>{const before=structuredClone(s);assert.throws(fn);assert.deepEqual(s,before)};
const byId=(s,id)=>O.list(s).find(goal=>goal.id===id);

test('objective migration only initializes the claim ledger and remains idempotent',()=>{
 const s=fresh();assert(O.valid(s));const before=structuredClone(s);O.migrate(s);assert.deepEqual(s,{...before,objectives:{claimed:[]}});assert.equal(s.cash,250);
 s.objectives.claimed=['first-sessions'];const migrated=structuredClone(s);O.migrate(s);assert.deepEqual(s,migrated);
});
test('listing goals is pure and reports bounded progress with meaningful chapter budgets',()=>{
 const s=fresh(),before=structuredClone(s),goals=O.list(s);assert.equal(goals.length,12);assert.deepEqual(s,before);assert(goals.every(goal=>goal.current>=0&&goal.current<=goal.target&&!goal.claimed));
 assert.equal(goals.filter(goal=>goal.chapter===1).reduce((n,goal)=>n+goal.rewardCash,0),155);
 assert.equal(goals.reduce((n,goal)=>n+goal.rewardCash,0),590);assert.equal(goals.reduce((n,goal)=>n+goal.rewardRep,0),5);
 s.sessions=999;assert.equal(byId(s,'first-sessions').current,3);s.skills.boxing=24.9;assert.equal(byId(s,'style-foundation').current,24);assert(!byId(s,'style-foundation').complete);s.skills.boxing=25;assert(byId(s,'style-foundation').complete);
});
test('partial and invalid progress cannot receive rewards or create default state',()=>{
 const s=fresh();s.sessions=2;atomic(s,()=>O.claim(s,'first-sessions'));
 for(const id of ['toString','constructor','missing','',null])atomic(s,()=>O.claim(s,id));
 s.sessions=3;s.fight={done:false};atomic(s,()=>O.claim(s,'first-sessions'));
});
test('completed objective pays cash and earned exactly once across reloads',()=>{
 const s=fresh();s.sessions=3;O.claim(s,'first-sessions');assert.equal(s.cash,275);assert.equal(s.earned,25);assert.deepEqual(s.objectives.claimed,['first-sessions']);assert(W.valid(s));assert(O.valid(s));
 atomic(s,()=>O.claim(s,'first-sessions'));const copy=JSON.parse(JSON.stringify(s));atomic(copy,()=>O.claim(copy,'first-sessions'));assert.deepEqual(copy,s);
});
test('a completed loss or draw counts for first fight but never for the first win',()=>{
 for(const kind of ['losses','draws']){const s=fresh();s[kind]=1;assert(byId(s,'first-fight').complete);assert(!byId(s,'first-win').complete);O.claim(s,'first-fight');assert.equal(s.cash,300);atomic(s,()=>O.claim(s,'first-win'))}
 const s=fresh();s.wins=1;assert(byId(s,'first-win').complete);O.claim(s,'first-win');assert.equal(s.world.reputation,1);
});
test('technique progress counts only fully learned recognized moves',()=>{
 const s=fresh();s.moves={hook:1,uppercut:2,laser:2};assert.equal(byId(s,'first-technique').current,1);assert.equal(byId(s,'three-techniques').current,1);
 s.moves.hook=2;s.moves.lowkick=2;assert(byId(s,'three-techniques').complete);O.claim(s,'three-techniques');assert.equal(s.cash,315);
});
test('gym and housing targets use permanent ownership rather than active training venue',()=>{
 const s=fresh();s.ownedGyms=[0,1];s.gym=0;assert(byId(s,'first-gym').complete);O.claim(s,'first-gym');s.world.home=2;assert(byId(s,'first-home').complete);O.claim(s,'first-home');assert.equal(s.world.reputation,2);
});
test('community participation and active sponsorship are distinct real requirements',()=>{
 const s=fresh();W.migrate(s);s.world.reputation=12;assert(!byId(s,'first-community').complete);assert(!byId(s,'first-sponsor').complete);assert(byId(s,'local-name').complete);
 s.world.eventsTaken=[{day:1,id:'openmat',choice:'technical'}];assert(byId(s,'first-community').complete);O.claim(s,'first-community');assert.equal(s.world.reputation,13);
 s.world.sponsor='corner';O.claim(s,'first-sponsor');s.world.sponsor=null;assert(byId(s,'first-sponsor').complete);assert(byId(s,'first-sponsor').claimed);atomic(s,()=>O.claim(s,'first-sponsor'));
});
test('reputation rewards respect the cap while currency rewards are still paid once',()=>{
 const s=fresh();W.migrate(s);s.world.reputation=100;s.wins=1;const message=O.claim(s,'first-win');assert.equal(s.world.reputation,100);assert.equal(s.cash,310);assert.match(message,/zaten 100/);atomic(s,()=>O.claim(s,'first-win'));
});
test('malformed objective ledgers are rejected without mutations',()=>{
 const invalid=[null,[],{}, {claimed:null},{claimed:'first-win'},{claimed:['missing']},{claimed:['first-win','first-win']},{claimed:[1]}];
 for(const value of invalid){const s=fresh();s.sessions=3;s.objectives=value;assert.equal(O.valid(s),false);atomic(s,()=>O.claim(s,'first-sessions'))}
 const s=fresh();s.sessions=3;s.world=null;atomic(s,()=>O.claim(s,'first-sessions'));
});
test('all rewards together stay modest and claiming does not spend time or alter combat',()=>{
 const s=fresh();W.migrate(s);s.sessions=20;s.wins=3;s.moves={hook:2,lowkick:2,escape:2};s.skills.boxing=30;s.ownedGyms=[0,1];s.world.reputation=25;s.world.home=1;s.world.sponsor='corner';s.world.eventsTaken=[{day:1,id:'openmat',choice:'technical'}];
 const hours=s.hours,skills=structuredClone(s.skills),moves=structuredClone(s.moves);for(const goal of O.list(s)){assert(goal.complete,goal.id);O.claim(s,goal.id)}
 assert.equal(s.cash,840);assert.equal(s.earned,590);assert.equal(s.world.reputation,30);assert.equal(s.hours,hours);assert.deepEqual(s.skills,skills);assert.deepEqual(s.moves,moves);assert.equal(s.objectives.claimed.length,12);assert(O.list(s).every(goal=>goal.complete&&goal.claimed));
});
console.log(checks+' objective checks passed');
