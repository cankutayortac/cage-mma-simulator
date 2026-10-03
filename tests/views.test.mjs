import assert from 'node:assert/strict';
import * as E from '../dist/engine.js';
import * as O from '../dist/objectives.js';
import * as V from '../dist/views.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};
const fresh=()=>{const s=E.initial();s.seed=42;return s};
const buttons=html=>html.match(/<button\b[^>]*>[\s\S]*?<\/button>/g)||[];
const actionButtons=(html,action)=>buttons(html).filter(button=>button.includes('data-action="'+action+'"'));
const clean=html=>{assert.equal(typeof html,'string');assert(html.length>0);assert(!/undefined|NaN|\[object Object\]/.test(html),html.slice(0,100));};

test('all fresh-career view tabs render without changing the saved career',()=>{
 const s=fresh(),before=structuredClone(s),outputs=[V.homeContext(s),V.homeContent(s),V.nextCard(s)];
 for(const filter of ['technique','conditioning','camp']){const view=V.training(s,'sessions',filter);outputs.push(view.tools,view.content)}
 for(const tab of ['moves','gym']){const view=V.training(s,tab);outputs.push(view.tools,view.content)}
 for(const tab of ['ladder','goals','history']){const view=V.career(s,tab);outputs.push(view.tools,view.content)}
 const lobby=V.fightLobby(s);outputs.push(lobby.tools,lobby.content);
 outputs.forEach(clean);assert.deepEqual(s,before);
});
test('next step prioritizes essential recovery over both ordinary training and a due fight',()=>{
 const s=fresh();assert.equal(V.nextStep(s).value,'train');s.sessions=3;assert.equal(V.nextStep(s).value,'fight');
 E.bookFight(s);assert.equal(V.nextStep(s).value,'train');s.hours=s.camp.dueAt;assert.equal(V.nextStep(s).value,'fight');
 for(const [key,value] of [['health',49],['food',29],['energy',29],['sleep',29],['fatigue',60]]){
  const copy=structuredClone(s);copy[key]=value;assert.equal(V.nextStep(copy).action,'recovery',key);
 }
 assert.equal(V.nextStep(s).action,'nav');assert.equal(V.nextStep(s).value,'fight');
});
test('training tabs separate disciplines, conditioning, camp focus, techniques and purchases',()=>{
 const s=fresh(),technique=V.training(s,'sessions','technique').content,conditioning=V.training(s,'sessions','conditioning').content;
 assert.equal(actionButtons(technique,'train').length,4);assert.equal(actionButtons(technique,'active-train').length,4);assert(!technique.includes('data-value="rope"'));
 assert.equal(actionButtons(conditioning,'train').length,3);assert(conditioning.includes('data-value="rope"'));assert(conditioning.includes('data-value="strength"'));assert(!conditioning.includes('data-value="boxing"'));
 const moves=V.training(s,'moves').content,gym=V.training(s,'gym').content;assert(moves.includes('Maç tekniklerin'));assert(!moves.includes('gym-card'));assert(gym.includes('gym-card'));assert.equal(actionButtons(gym,'gym').length,4);assert.equal(actionButtons(gym,'coach').length,4);
 assert.equal(actionButtons(V.training(s,'sessions','camp').content,'focus').length,0);E.bookFight(s);assert.equal(actionButtons(V.training(s,'sessions','camp').content,'focus').length,3);
});
test('due-camp and excessive-fatigue training controls are visibly disabled',()=>{
 const s=fresh();s.fatigue=85;for(const action of ['train','active-train'])assert(actionButtons(V.training(s).content,action).every(button=>button.includes('disabled')));
 s.fatigue=0;E.bookFight(s);s.hours=s.camp.dueAt;for(const action of ['train','active-train'])assert(actionButtons(V.training(s).content,action).every(button=>button.includes('disabled')));
 assert(actionButtons(V.training(s,'sessions','camp').content,'focus').every(button=>button.includes('disabled')));
});
test('fight lobby uses actual competition offers and stable IDs for booking and scouting',()=>{
 const s=fresh(),before=structuredClone(s),offers=E.matchOffers(s),view=V.fightLobby(s),summary=E.competitionSummary(s);
 assert.equal(actionButtons(view.content,'book').length,offers.length);assert.equal(actionButtons(view.content,'scout-offer').length,offers.length);
 assert(view.content.includes('#'+summary.rank));
 for(const offer of offers){assert(view.content.includes(V.esc(offer.name)));assert(view.content.includes('data-value="0:'+offer.id+'"'));assert(view.content.includes('data-value="'+offer.id+'"'));assert(view.content.includes('Aranızda '+offer.record.wins+'G · '+offer.record.losses+'M'))}
 assert.deepEqual(s,before);
});
test('camp, opponent scouting and move tabs remain separate and render the accepted snapshot',()=>{
 const s=fresh(),accepted=E.matchOffers(s)[1];E.bookFight(s,0,accepted.id);const before=structuredClone(s),camp=V.fightLobby(s,0,'camp'),scout=V.fightLobby(s,0,'scout'),moves=V.fightLobby(s,0,'moves');
 assert(camp.content.includes('camp-dashboard'));assert(camp.content.includes(V.esc(accepted.name)));assert(!camp.content.includes('scout-stats'));assert(scout.content.includes('scout-stats'));assert(scout.content.includes(V.esc(accepted.name)));assert(!scout.content.includes('camp-dashboard'));assert(moves.content.includes('Maç tekniklerin'));assert(!moves.content.includes('scout-stats'));
 for(const view of [camp,scout,moves]){clean(view.tools);clean(view.content)}assert.deepEqual(s,before);
});
test('career ladder and rival cards consume competition summary records without flattening errors',()=>{
 const s=fresh(),id=E.matchOffers(s)[0].id;s.wins=1;s.losses=1;s.leagueWins[0]=1;s.competition.ranks[0]=8;s.competition.records[id]={wins:1,losses:1,draws:0,lastDay:1,lastResult:'loss',lastMethod:'Hakem kararı'};
 const summary=E.competitionSummary(s),before=structuredClone(s),html=V.career(s,'ladder').content;
 assert.equal((html.match(/class="ladder-row /g)||[]).length,summary.ladder.length);assert(html.includes('2 KARŞILAŞMA'));assert(html.includes('Aranızda 1 galibiyet, 1 mağlubiyet.'));
 for(const row of summary.ladder)assert(html.includes(V.esc(row.name)));assert(!html.includes('undefined'));assert.deepEqual(s,before);
});
test('goal cards expose claimability and career tabs do not stack unrelated content',()=>{
 const s=fresh();s.sessions=3;const goals=V.career(s,'goals').content,ladder=V.career(s,'ladder').content,history=V.career(s,'history').content;
 assert.equal(actionButtons(goals,'claim').length,O.list(s).length);const first=actionButtons(goals,'claim').find(button=>button.includes('data-value="first-sessions"'));assert(first&&!first.includes('disabled'));
 assert(!goals.includes('ladder-list'));assert(!ladder.includes('objectives-list'));assert(!history.includes('objectives-list'));assert(!history.includes('ladder-list'));
 O.claim(s,'first-sessions');const claimed=actionButtons(V.career(s,'goals').content,'claim').find(button=>button.includes('data-value="first-sessions"'));assert(claimed.includes('disabled'));assert(claimed.includes('Alındı'));
});
test('career championship messaging requires the actual championship rather than seven wins alone',()=>{
 const s=fresh();s.leagueWins=[3,4,6,7];s.competition.ranks[3]=2;assert.equal(E.isChampion(s),false);assert(!V.career(s,'ladder').content.includes('Kemer senin.'));
 s.competition.ranks[3]=1;assert(E.isChampion(s));assert(V.career(s,'ladder').content.includes('Kemer senin.'));
});
test('player, opponent and imported history strings are escaped in rendered views',()=>{
 const s=fresh();s.name='<img src=x onerror="oops">';assert(!V.career(s).content.includes('<img'));assert(V.career(s).content.includes('&lt;img'));
 s.history=[{name:'<script>bad</script>',method:'<img src=x>',won:false,draw:false,reward:75,day:1,tier:0}];const history=V.career(s,'history').content;assert(!history.includes('<script>'));assert(!history.includes('<img'));assert(history.includes('&lt;script&gt;'));
 E.bookFight(s);s.camp.enemy.name='<svg onload="bad">';const next=V.nextCard(s),camp=V.fightLobby(s,0,'camp').content;assert(!next.includes('<svg'));assert(next.includes('&lt;svg'));assert(!camp.includes('<svg'));assert(camp.includes('&lt;svg'));
 assert(V.button('Inspect','scout','x" onclick="bad').includes('x&quot; onclick=&quot;bad'));
});
console.log(checks+' view checks passed');
