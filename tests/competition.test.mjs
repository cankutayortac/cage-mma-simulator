import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
import * as Competition from '../dist/competition.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>{const s=E.initial();s.seed=42;return s};
function finish(s,winner=0,tier=E.league(s),id){
 E.bookFight(s,tier,id);s.hours=s.camp.dueAt;s.energy=s.food=s.sleep=s.health=100;s.fatigue=0;E.startFight(s,tier);
 s.fight.tick=59;s.fight.hp=[100000,100000];s.fight.score=winner===0?[10000,0]:winner===1?[0,10000]:[0,0];s.fight.tactic='defend';s.seed=1;
 E.stepFight(s);assert.equal(s.fight.result.winner,winner);assert(E.validSave(s));return s.fight;
}

test('each league has a persistent named roster and a single ordered player place',()=>{
 const s=fresh(),names=new Set(),ids=new Set();
 for(let tier=0;tier<4;tier++){
  const summary=E.competitionSummary(s,tier);assert.equal(summary.rank,9);assert.equal(summary.total,9);assert.equal(summary.ladder.length,9);
  assert.deepEqual(summary.ladder.map(r=>r.rank),[1,2,3,4,5,6,7,8,9]);assert.equal(summary.ladder.filter(r=>r.player).length,1);
  for(const rival of summary.ladder.filter(r=>!r.player)){assert(!ids.has(rival.id));assert(!names.has(rival.name));ids.add(rival.id);names.add(rival.name)}
 }assert.equal(ids.size,32);
});
test('offers stay fixed across time, training and reload without scaling to player stats',()=>{
 const s=fresh(),before=JSON.stringify(s),offers=E.matchOffers(s);assert.equal(offers.length,3);assert.equal(new Set(offers.map(r=>r.id)).size,3);assert.equal(JSON.stringify(s),before);
 assert.equal(offers[0].name,'Bora “Çekiç”');assert.equal(offers[0].skills.boxing,22);assert(offers.every(r=>r.qualifies));
 E.train(s,'boxing');E.recover(s,'sleep');s.cash+=500;s.seed=98765;assert.deepEqual(E.matchOffers(s),offers);assert.deepEqual(E.matchOffers(JSON.parse(JSON.stringify(s))),offers);
 offers[0].skills.boxing=100;assert.notEqual(E.matchOffers(s)[0].skills.boxing,100);
});
test('only offered opponents can be booked and failed selections have no side effects',()=>{
 for(const id of ['missing','toString','league-1-fighter-0','league-0-fighter-7',null,5]){const s=fresh(),before=JSON.stringify(s);assert.throws(()=>E.bookFight(s,0,id));assert.equal(JSON.stringify(s),before)}
 const s=fresh(),choice=E.matchOffers(s)[1];E.bookFight(s,0,choice.id);assert.equal(s.camp.enemy.id,choice.id);
 const booked=JSON.stringify(s);assert.throws(()=>E.bookFight(s,0,choice.id));assert.equal(JSON.stringify(s),booked);
});
test('a selected rival and equipped techniques remain a fixed camp and fight snapshot',()=>{
 const s=fresh(),choice=E.matchOffers(s)[2];E.bookFight(s,0,choice.id);const snapshot=structuredClone(s.camp.enemy);
 E.trainFocus(s,'distance');E.recover(s,'sleep');assert.deepEqual(s.camp.enemy,snapshot);
 const loaded=JSON.parse(JSON.stringify(s));assert(E.validSave(loaded));loaded.hours=loaded.camp.dueAt;loaded.energy=loaded.food=loaded.sleep=loaded.health=100;
 E.startFight(loaded);assert.deepEqual(loaded.fight.enemy,snapshot);assert.equal(loaded.camp,null);
});
test('first wins improve rank and repeating the same weaker foe cannot farm promotion',()=>{
 const s=fresh(),id=E.matchOffers(s)[0].id;finish(s,0,0,id);
 assert.equal(s.competition.ranks[0],8);assert.equal(s.leagueWins[0],1);assert(s.fight.result.qualifiedWin);assert.deepEqual(s.fight.result.ranking,{before:9,after:8,advanced:true,firstWin:true});
 const cash=s.cash;
 for(let n=0;n<10;n++){
  const offer=E.matchOffers(s,0).find(r=>r.id===id);assert(offer);assert.equal(offer.qualifies,false);finish(s,0,0,id);
  assert.equal(s.competition.ranks[0],8);assert.equal(s.leagueWins[0],1);assert.equal(s.fight.result.qualifiedWin,false);assert.equal(s.fight.result.ranking.advanced,false);
 }
 assert.equal(s.wins,11);assert.equal(E.league(s),0);assert(s.cash>cash);assert.equal(s.competition.records[id].wins,11);
});
test('seeded full rematches never award a second qualifying win for the same opponent',()=>{
 for(let seed=1;seed<=30;seed++){
  const s=fresh(),id=E.matchOffers(s)[0].id;s.seed=seed;for(const skill of Object.keys(s.skills))s.skills[skill]=90;
  for(let bout=0;bout<4;bout++){
   E.bookFight(s,0,id);s.hours=s.camp.dueAt;s.energy=s.food=s.sleep=s.health=100;s.fatigue=0;E.startFight(s,0);
   while(!s.fight.done)E.stepFight(s);
   assert(s.leagueWins[0]<=1);assert(s.competition.ranks[0]>=8);assert.equal(E.league(s),0);assert(E.validSave(s));
  }
 }
});
test('the default offer continues to new opponents until all eight are reachable',()=>{
 const s=fresh(),seen=new Set();
 for(let n=0;n<8;n++){const offer=E.matchOffers(s,0)[0];assert(!seen.has(offer.id));seen.add(offer.id);finish(s,0,0);}
 assert.equal(seen.size,8);assert.equal(E.competitionSummary(s,0).rank,1);assert.equal(s.leagueWins[0],8);assert(E.matchOffers(s,0).every(r=>!r.qualifies));
 const r=E.competitionSummary(s,0);assert.deepEqual(r.ladder.map(row=>row.rank),[1,2,3,4,5,6,7,8,9]);
});
test('different wins retain the existing three-four-six promotion requirements',()=>{
 const s=fresh();
 for(let tier=0;tier<3;tier++){
  const required=E.PROMOTION_WINS[tier];
  for(let n=0;n<required;n++){assert.equal(E.league(s),tier);finish(s,0,tier);}
  assert.equal(E.league(s),tier+1);assert(s.fight.result.promotion);
 }
 assert.deepEqual(s.leagueWins,[3,4,6,0]);assert.equal(s.wins,13);
});
test('a loss to a lower ranked rival costs one place and rivalry remembers results',()=>{
 const s=fresh(),id=E.matchOffers(s)[0].id;finish(s,0,0,id);assert.equal(s.competition.ranks[0],8);
 finish(s,1,0,id);assert.equal(s.competition.ranks[0],9);assert.equal(s.leagueWins[0],1);
 const rival=E.competitionSummary(s,0).rivals.find(r=>r.id===id);assert.deepEqual(rival.record,{wins:1,losses:1,draws:0});assert.equal(rival.meetings,2);assert.equal(rival.lastResult,'loss');assert.equal(rival.lastMethod,'Hakem kararı');
 finish(s,2,0,id);assert.equal(s.competition.ranks[0],9);assert.equal(s.competition.records[id].draws,1);assert.equal(s.fight.result.qualifiedWin,false);
});
test('results apply once and rival records survive a serialized career',()=>{
 const s=fresh();finish(s);const before=JSON.stringify(s);Competition.afterFight(s);E.stepFight(s);assert.equal(JSON.stringify(s),before);
 const loaded=JSON.parse(JSON.stringify(s));assert(E.validSave(loaded));assert.deepEqual(E.competitionSummary(loaded,0),E.competitionSummary(s,0));assert.equal(s.history[0].opponentId,s.fight.enemy.id);
});
test('a world title needs seven different wins and first place',()=>{
 const s=fresh();s.wins=13;s.leagueWins=[3,4,6,0];
 for(let n=0;n<7;n++)finish(s,0,3);assert.equal(s.leagueWins[3],7);assert.equal(E.competitionSummary(s,3).rank,2);assert.equal(E.isChampion(s),false);assert.equal(s.fight.result.champion,false);
 const title=E.matchOffers(s,3)[0];assert.equal(title.rank,1);assert.equal(title.reason,'Kemer maçı');finish(s,0,3,title.id);
 assert(E.isChampion(s));assert(s.fight.result.champion);assert.equal(E.competitionSummary(s,3).championshipRank,1);
 const leader=fresh();leader.leagueWins=[3,4,6,2];leader.competition.ranks[3]=1;assert.equal(E.isChampion(leader),false);
});
test('malformed rival metadata and records are rejected without compromising legacy saves',()=>{
 const legacy=fresh();delete legacy.competition;assert(E.validSave(legacy));E.migrate(legacy);assert(E.validSave(legacy));
 for(const corrupt of [s=>s.competition.ranks=[9],s=>s.competition.ranks[0]=0,s=>s.competition.lastFight={},s=>s.competition.records={bad:{wins:1,losses:0,draws:0,lastDay:1,lastResult:'win',lastMethod:'TKO'}},s=>s.competition.records['league-0-fighter-0']={wins:-1,losses:0,draws:0,lastDay:1,lastResult:'win',lastMethod:'TKO'}]){const s=fresh();corrupt(s);assert(!E.validSave(s))}
 const booked=fresh();E.bookFight(booked);
 for(const corrupt of [s=>s.camp.enemy.id='league-1-fighter-0',s=>s.camp.enemy.rank=10,s=>s.camp.enemy.record.wins=-1,s=>s.camp.enemy.tier=2,s=>s.camp.enemy.moves={},s=>s.camp.enemy.moves=['laser']]){const s=structuredClone(booked);corrupt(s);assert(!E.validSave(s))}
 const done=fresh();finish(done);done.fight.result.ranking.advanced=false;assert(!E.validSave(done));
});
console.log(checks+' competition checks passed');
