import * as Camp from './camp.js?v=0.5.0';
import * as World from './world.js?v=0.5.0';
import * as Competition from './competition.js?v=0.5.0';
import * as Objectives from './objectives.js?v=0.5.0';

export const KEY='cage-career-v1';
export const LABELS={boxing:'Boks',kickboxing:'Kickboks',wrestling:'Güreş',bjj:'Brazilian Jiu-Jitsu',stamina:'Kondisyon',strength:'Kuvvet'};
export const GYMS=[{name:'Ev',sub:'Dört duvar. Büyük hayaller.',price:0,fee:0,gain:1,wins:0},{name:'Arka Sokak Gym',sub:'Eski ekipman, sağlam temel.',price:400,fee:20,gain:1.4,wins:0},{name:'Iron District MMA',sub:'Minder, partner ve disiplin.',price:1600,fee:55,gain:1.9,wins:3},{name:'Apex Performance',sub:'Şampiyonların kampı.',price:5500,fee:130,gain:2.5,wins:7}];
export const LEAGUES=[{name:'Yer altı',min:0,purse:220,loss:75,base:14,venue:'TERK EDİLMİŞ DEPO'},{name:'Amatör lig',min:3,purse:650,loss:190,base:34,venue:'MAHALLE SPOR SALONU'},{name:'Profesyonel lig',min:7,purse:2000,loss:600,base:52,venue:'ŞEHİR ARENASI'},{name:'Dünya ligi',min:13,purse:7500,loss:1800,base:74,venue:'DÜNYA ŞAMPİYONASI'}];
export const PROMOTION_WINS=[3,4,6];
export const CHAMPION_WINS=7;
export const CORNER_COMMANDS={
 pressure:{name:'Baskı kur',description:'Sonraki iki saldırıda isabet ve hasar +%12; her saldırı 3 fazla nefes tüketir.'},
 escape:{name:'Mesafe aç',description:'İki aksiyon boyunca yere alınma savunmanı güçlendirir; yerdeysen ayağa kalkmayı denersin.'},
 breathe:{name:'Nefes topla',description:'Hemen 12 nefes kazanırsın; sonraki aksiyonunu saldırmadan gardda geçirirsin.'}
};
export const COACHES=[{name:'Köşe yok',skill:null,price:0,fee:0,bonus:0},{name:'Cem “Solak”',skill:'boxing',price:250,fee:20,bonus:.35},{name:'Derya Hoca',skill:'bjj',price:400,fee:25,bonus:.4},{name:'Baran Demir',skill:'wrestling',price:400,fee:25,bonus:.4},{name:'Ece Yılmaz',skill:'kickboxing',price:300,fee:20,bonus:.35}];
export const MOVES=[{id:'hook',skill:'boxing',level:25,name:'Sol kroşe',type:'punch'},{id:'uppercut',skill:'boxing',level:45,name:'Aparkat',type:'punch'},{id:'combo',skill:'boxing',level:65,name:'Üçlü kombinasyon',type:'punch'},{id:'lowkick',skill:'kickboxing',level:25,name:'Low kick',type:'kick'},{id:'highkick',skill:'kickboxing',level:45,name:'High kick',type:'kick'},{id:'double',skill:'wrestling',level:25,name:'Çift bacak dalışı',type:'takedown'},{id:'control',skill:'wrestling',level:45,name:'Üst pozisyon kontrolü',type:'ground'},{id:'escape',skill:'bjj',level:25,name:'Guard kaçışı',type:'escape'},{id:'armbar',skill:'bjj',level:45,name:'Armbar',type:'submission'},{id:'triangle',skill:'bjj',level:65,name:'Üçgen boğma',type:'submission'}];
export const clamp=(x,a=0,b=100)=>Math.min(b,Math.max(a,x));
export const day=s=>Math.floor(s.hours/24)+1;
const STYLES=['boxing','kickboxing','wrestling','bjj'];
const legacyLeague=s=>LEAGUES.reduce((best,x,i)=>s.wins>=x.min?i:best,0);
export function league(s){if(!s.leagueWins)return legacyLeague(s);let tier=0;while(tier<3&&s.leagueWins[tier]>=PROMOTION_WINS[tier])tier++;return tier;}
export function leagueProgress(s){const current=league(s),required=PROMOTION_WINS[current]||0;const earned=s.leagueWins?.[current]??Math.max(0,s.wins-LEAGUES[current].min);return{current,next:current===3?null:current+1,earned,required,remaining:Math.max(0,required-earned)};}
export function style(s){const skills=s.skills||s;return STYLES.reduce((best,key)=>skills[key]>skills[best]?key:best,'boxing');}

export function initial(){return migrate({version:1,name:'Çaylak',cash:250,earned:0,hours:8,energy:90,food:75,sleep:85,health:100,skills:{boxing:15,kickboxing:12,wrestling:12,bjj:12,stamina:18,strength:12},gym:0,ownedGyms:[0],coach:0,ownedCoaches:[0],wins:0,losses:0,draws:0,sessions:0,helpDay:0,moves:{},history:[],fight:null,seed:Math.floor(Math.random()*2147483646)+1});}
export function migrate(s){
 Camp.migrate(s);World.migrate(s);Objectives.migrate(s);
 if(s.loadout===undefined)s.loadout=MOVES.filter(m=>s.moves[m.id]>=2).slice(0,4).map(m=>m.id);
 if(s.leagueWins===undefined){
  const old=legacyLeague(s);s.leagueWins=[0,0,0,0];
  for(const h of s.history||[])if(h.won)s.leagueWins[h.tier]++;
  for(let tier=0;tier<old;tier++)s.leagueWins[tier]=Math.max(s.leagueWins[tier],PROMOTION_WINS[tier]);
  s.leagueWins[old]=Math.max(s.leagueWins[old],s.wins-LEAGUES[old].min);
 }
 Competition.migrate(s);return s;
}
const validMoves=x=>Array.isArray(x)&&x.length<=4&&new Set(x).size===x.length&&x.every(id=>MOVES.some(m=>m.id===id));
const validSkills=x=>x&&Object.keys(LABELS).every(k=>Number.isFinite(x[k])&&x[k]>=0&&x[k]<=100);
const validPrep=(x,max=1)=>x&&['takedownDefense','distance','groundEscape'].every(k=>Number.isFinite(x[k])&&x[k]>=0&&x[k]<=max);
export function validSave(s){return !!(s?.version===1&&typeof s.name==='string'&&s.name.length<=24&&['cash','earned','hours','wins','losses','draws','sessions','helpDay'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&['energy','food','sleep','health'].every(k=>Number.isFinite(s[k])&&s[k]>=0&&s[k]<=100)&&validSkills(s.skills)&&Number.isInteger(s.gym)&&GYMS[s.gym]&&Number.isInteger(s.coach)&&COACHES[s.coach]&&Array.isArray(s.ownedGyms)&&s.ownedGyms.every(i=>Number.isInteger(i)&&GYMS[i])&&Array.isArray(s.ownedCoaches)&&s.ownedCoaches.every(i=>Number.isInteger(i)&&COACHES[i])&&s.moves&&MOVES.every(m=>s.moves[m.id]===undefined||[0,1,2].includes(s.moves[m.id]))&&(s.loadout===undefined||(validMoves(s.loadout)&&s.loadout.every(id=>s.moves[id]===2)))&&(s.leagueWins===undefined||(Array.isArray(s.leagueWins)&&s.leagueWins.length===4&&s.leagueWins.every(n=>Number.isInteger(n)&&n>=0)))&&Camp.validExtras(s)&&World.valid(s)&&Objectives.valid(s)&&Competition.valid(s)&&(!s.camp||Competition.validOpponent(s.camp.enemy,s.camp.tier)&&(s.camp.enemy.moves===undefined||validMoves(s.camp.enemy.moves)))&&Array.isArray(s.history)&&s.history.length<=80&&s.history.every(h=>h&&typeof h.name==='string'&&typeof h.method==='string'&&Number.isInteger(h.day)&&h.day>0&&Number.isFinite(h.reward)&&h.reward>=0&&[0,1,2,3].includes(h.tier)&&typeof h.won==='boolean'&&typeof h.draw==='boolean'&&(h.opponentId===undefined||Competition.knownOpponent(h.opponentId,h.tier)))&&Number.isFinite(s.seed)&&(!s.fight||validFight(s.fight)));}
const EVENT_FIELDS=['outcome','technique','phaseBefore','phaseAfter','topBefore','topAfter'];
const EVENT_OUTCOMES={idle:['rest'],guard:['rest'],punch:['hit','blocked','miss'],kick:['hit','blocked','miss'],takedown:['success','defended'],escape:['success','defended'],submission:['success','defended'],ground:['hit']};
const EVENT_TECHNIQUES=['idle','guard','direct','bodykick','takedown','ground','escape','submission',...MOVES.map(m=>m.id)];
const commandKey=key=>typeof key==='string'&&Object.hasOwn(CORNER_COMMANDS,key);
const roundOf=f=>Math.min(3,Math.floor(f.tick/20)+1);
const freshCorner=round=>({round,used:0,lastTick:null,active:null,turns:0,note:null});
function validCorner(f){
 const c=f.corner;if(c===undefined)return true;
 const expectedRound=f.done&&f.tick>0?Math.floor((f.tick-1)/20)+1:roundOf(f);
 return !!(c&&c.round===expectedRound&&Number.isInteger(c.used)&&c.used>=0&&c.used<=2&&(c.used===0?c.lastTick===null:Number.isInteger(c.lastTick)&&c.lastTick>=(c.round-1)*20&&c.lastTick<=f.tick&&c.lastTick<c.round*20)&&(c.active===null?c.turns===0:commandKey(c.active)&&Number.isInteger(c.turns)&&c.turns>=1&&c.turns<=(c.active==='breathe'?1:2))&&(c.note===null||commandKey(c.note)&&c.note===c.active&&c.turns===(c.active==='breathe'?1:2))&&(c.used>0||(c.active===null&&c.note===null)));
}
function validAction(e){return !!(e&&typeof e.move==='string'&&Object.hasOwn(EVENT_OUTCOMES,e.move)&&EVENT_OUTCOMES[e.move].includes(e.outcome)&&[0,1].includes(e.attacker)&&EVENT_TECHNIQUES.includes(e.technique)&&['stand','ground'].includes(e.phaseBefore)&&['stand','ground'].includes(e.phaseAfter)&&[0,1].includes(e.topBefore)&&[0,1].includes(e.topAfter));}
function validEvents(f){return f.events===undefined||(Array.isArray(f.events)&&f.events.length<=60&&f.events.every((e,i)=>validAction(e)&&Number.isInteger(e.tick)&&e.tick>0&&e.tick<=f.tick&&(i===0||e.tick>f.events[i-1].tick)&&e.round===Math.floor((e.tick-1)/20)+1&&typeof e.time==='string'&&/^[0-3]:[0-5]\d$/.test(e.time)&&typeof e.text==='string'&&e.text.length<=1000));}
function validFight(f){const pair=(x,positive=false)=>Array.isArray(x)&&x.length===2&&x.every(v=>Number.isFinite(v)&&(!positive||v>0));return !!(f&&[0,1,2,3].includes(f.tier)&&pair(f.hp)&&pair(f.st)&&pair(f.score)&&pair(f.maxHp,true)&&pair(f.maxSt,true)&&['stand','ground'].includes(f.phase)&&[0,1].includes(f.top)&&f.enemy&&typeof f.enemy.name==='string'&&STYLES.includes(f.enemy.style)&&validSkills(f.enemy.skills)&&Competition.validOpponent(f.enemy,f.tier)&&Competition.validResult(f.result)&&(f.enemy.moves===undefined||validMoves(f.enemy.moves))&&(f.playerMoves===undefined||validMoves(f.playerMoves))&&(f.prep===undefined||validPrep(f.prep))&&(f.performance===undefined||(pair(f.performance,true)&&f.performance.every(n=>n<=1)))&&Number.isInteger(f.tick)&&f.tick>=0&&f.tick<=60&&validCorner(f)&&['balanced','strike','ground','defend'].includes(f.tactic)&&typeof f.done==='boolean'&&typeof f.log==='string'&&f.last&&typeof f.last.move==='string'&&[0,1].includes(f.last.attacker)&&(EVENT_FIELDS.every(k=>f.last[k]===undefined)||validAction(f.last))&&validEvents(f)&&(!f.done||f.result&&[0,1,2].includes(f.result.winner)&&typeof f.result.method==='string'&&Number.isFinite(f.result.reward)&&(f.result.sponsorReward===undefined||Number.isFinite(f.result.sponsorReward)&&f.result.sponsorReward>=0)&&(f.result.reputationReward===undefined||Number.isInteger(f.result.reputationReward)&&f.result.reputationReward>=0&&f.result.reputationReward<=2)&&(f.result.worldApplied===undefined||typeof f.result.worldApplied==='boolean'))&&(f.done||f.tick<60));}
export function rand(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
function spend(s,n){if(s.cash<n)throw Error(`Bunun için ₺${Math.ceil(n-s.cash)} daha gerekiyor.`);s.cash-=n;}
function elapsed(s,h,e=0,f=0,sl=0){s.hours+=h;s.energy=clamp(s.energy+e);s.food=clamp(s.food+f);s.sleep=clamp(s.sleep+sl);}
function free(s){if(s.fight&&!s.fight.done)throw Error('Önce devam eden maçı tamamla.');}
export function trainingCost(s,key){return (['stamina','rope'].includes(key)?0:GYMS[s.gym].fee)+(COACHES[s.coach].skill===key?COACHES[s.coach].fee:0);}
export function trainingPreview(s,key){
 if(!Object.hasOwn(LABELS,key)&&key!=='rope')throw Error('Geçersiz antrenman.');
 const k=key==='rope'?'stamina':key,bonus=COACHES[s.coach].skill===k?COACHES[s.coach].bonus:0;
 const nutrition=.72+(s.food+s.sleep)/650;
 const gain=(k==='strength'?1.1:.98)*(['stamina','rope'].includes(key)?1:GYMS[s.gym].gain)*(1+bonus)*(1-s.skills[k]/160)*nutrition*Camp.trainingMultiplier(s);
 const today=s.trainingDay?.day===day(s)?s.trainingDay.count:0;
 return{gain:Math.min(100-s.skills[k],gain),cost:trainingCost(s,key),fatigue:Math.min(100-(s.fatigue||0),12+2*Math.min(today,4))};
}
export function train(s,key,moveId){
 free(s);if(!Object.hasOwn(LABELS,key)&&key!=='rope')throw Error('Geçersiz antrenman.');
 if(s.energy<20||s.food<20||s.sleep<15||s.health<35)throw Error('Antrenman için 20 enerji, 20 tokluk, 15 dinçlik ve 35 sağlık gerekiyor.');
 const m=moveId?MOVES.find(m=>m.id===moveId):null;
 if(moveId&&(!m||m.skill!==key||s.skills[key]<m.level||(s.moves[m.id]||0)>=2))throw Error('Bu hareket henüz çalışılamıyor.');
 Camp.assertTraining(s);const preview=trainingPreview(s,key);spend(s,preview.cost);migrate(s);
 const k=key==='rope'?'stamina':key;s.skills[k]=clamp(s.skills[k]+preview.gain);elapsed(s,1,-18,-11,-9);s.sessions++;Camp.onTraining(s,key);
 if(m){s.moves[m.id]=(s.moves[m.id]||0)+1;if(s.moves[m.id]===2){if(s.loadout.length<4)s.loadout.push(m.id);return `${m.name} öğrenildi! ${s.loadout.includes(m.id)?'Teknik setine eklendi.':'Teknik setinden seçebilirsin.'}`}return `${m.name}: 1/2 çalışma tamamlandı.`}
 return `${LABELS[k]} +${preview.gain.toFixed(1)} · Yorgunluk +${preview.fatigue.toFixed(0)}.`;
}
export function trainActive(s,key,score){
 if(!Number.isInteger(score)||score<0||score>100)throw Error('Ritim puanı 0–100 arasında tam sayı olmalı.');
 const preview=trainingPreview(s,key),k=key==='rope'?'stamina':key;
 train(s,key);
 const bonus=Math.min(100-s.skills[k],preview.gain*score/400);s.skills[k]+=bonus;
 return `${LABELS[k]} +${(preview.gain+bonus).toFixed(2)} · Ritim ${score}/100 · Verim +%${(score/4).toFixed(0)}.`;
}
export function trainFocus(s,key){free(s);return Camp.trainFocus(s,key);}
export function toggleMove(s,id){free(s);const m=MOVES.find(m=>m.id===id);if(!m||s.moves[id]!==2)throw Error('Önce bu tekniği öğrenmelisin.');const loadout=s.loadout||MOVES.filter(m=>s.moves[m.id]>=2).slice(0,4).map(m=>m.id);if(!loadout.includes(id)&&loadout.length>=4)throw Error('Teknik setinde en fazla 4 hareket olabilir. Önce birini çıkar.');migrate(s);s.loadout=s.loadout.includes(id)?s.loadout.filter(x=>x!==id):[...s.loadout,id];return `${m.name} ${s.loadout.includes(id)?'teknik setine eklendi.':'teknik setinden çıkarıldı.'}`;}
export function recover(s,action){
 free(s);let message;
 switch(action){
 case 'meal':spend(s,35);elapsed(s,.5,5,45,-1);message='Sıcak yemek: +45 tokluk, +5 enerji.';break;
 case 'protein':spend(s,80);elapsed(s,.5,12,70,-1);s.health=clamp(s.health+8);message='Dengeli öğün: +70 tokluk, +8 sağlık.';break;
 case 'sleep':elapsed(s,8,75,-14,90);s.health=clamp(s.health+32);message='8 saat uyudun. Yorgunluk −40.';break;
 case 'rest':elapsed(s,2,30,-5,8);s.health=clamp(s.health+14);message='Toparlandın: +30 enerji, +14 sağlık, yorgunluk −14.';break;
 case 'help':if(s.helpDay===day(s))throw Error('Bugünkü ücretsiz yemeğini aldın. Yarın yeniden uğra.');s.helpDay=day(s);s.food=clamp(s.food+55);message='Mahalle mutfağı: +55 tokluk. Birlikte ayağa kalkarız.';break;
 case 'job':if(s.energy<15||s.food<10)throw Error('Çalışmak için 15 enerji ve 10 tokluk gerekiyor. Önce dinlen veya ücretsiz yemek al.');elapsed(s,3,-15,-10,-15);s.cash+=110;s.earned+=110;message='Gündelik işi bitirdin. +₺110';break;
 default:throw Error('Geçersiz eylem.');
 }
 Camp.recover(s,action);const homeBonus=World.recoverBonus(s,action);return homeBonus?`${message} ${homeBonus}`:message;
}
export function chooseGym(s,i){free(s);const g=GYMS[i];if(!g)throw Error('Geçersiz salon.');if(s.wins<g.wins)throw Error(`Bu salon için ${g.wins} galibiyet gerekiyor.`);if(!s.ownedGyms.includes(i)){spend(s,g.price);s.ownedGyms.push(i)}s.gym=i;return `${g.name} artık antrenman alanın.`;}
export function chooseCoach(s,i){free(s);const c=COACHES[i];if(!c)throw Error('Geçersiz antrenör.');if(!s.ownedCoaches.includes(i)){spend(s,c.price);s.ownedCoaches.push(i)}s.coach=i;return i?`${c.name} köşene katıldı.`:'Kendi programına döndün.';}
function opponentMoves(enemy){return MOVES.filter(m=>enemy.skills[m.skill]>=m.level).sort((a,b)=>(b.skill===enemy.style)-(a.skill===enemy.style)||b.level-a.level).slice(0,4).map(m=>m.id);}
export function matchOffers(s,tier=league(s)){
 const shapes={boxing:{boxing:8,kickboxing:-4,wrestling:-4,bjj:-6,stamina:1,strength:2},kickboxing:{boxing:-2,kickboxing:8,wrestling:-5,bjj:-4,stamina:3,strength:0},wrestling:{boxing:-4,kickboxing:-6,wrestling:8,bjj:2,stamina:2,strength:3},bjj:{boxing:-5,kickboxing:-5,wrestling:1,bjj:9,stamina:1,strength:-3}};
 return Competition.offers(s,tier,CHAMPION_WINS).map(rival=>{
  const skills=Object.fromEntries(Object.keys(LABELS).map(k=>[k,clamp(LEAGUES[tier].base+rival.offset+shapes[rival.style][k])]));
  const enemy={id:rival.id,tier,name:rival.name,style:rival.style,skills,rank:rival.rank,reason:rival.reason,record:{...rival.record},qualifies:rival.qualifies};enemy.moves=opponentMoves(enemy);return enemy;
 });
}
export function opponent(s,tier=league(s)){return matchOffers(s,tier)[0];}
export function isChampion(s){return(s.leagueWins?.[3]||0)>=CHAMPION_WINS&&Competition.summary(s,3).rank===1;}
export function competitionSummary(s,tier=league(s)){
 const earned=s.leagueWins?.[tier]||0,required=tier===3?CHAMPION_WINS:PROMOTION_WINS[tier];
 return{...Competition.summary(s,tier),promotion:{earned,required,remaining:Math.max(0,required-earned)},championWins:s.leagueWins?.[3]||0,champion:isChampion(s),championshipRank:1};
}
export function bookFight(s,tier=league(s),opponentId){
 free(s);if(!Number.isInteger(tier)||tier<0||tier>league(s))throw Error('Bu lig henüz açık değil.');
 const offers=matchOffers(s,tier),enemy=opponentId===undefined?offers[0]:offers.find(offer=>offer.id===opponentId);
 if(!enemy)throw Error('Bu rakip için şu an maç teklifi yok. Güncel üç tekliften birini seç.');
 const message=Camp.book(s,tier,enemy);Object.assign(s.camp.enemy,{id:enemy.id,tier,rank:enemy.rank,reason:enemy.reason,record:{...enemy.record},qualifies:enemy.qualifies,moves:[...enemy.moves]});
 if(s.fight?.done)s.fight=null;return message;
}
export function cancelCamp(s){free(s);return Camp.cancel(s);}
export function waitForFight(s){free(s);return Camp.wait(s);}
export function startFight(s,tier=s.camp?.tier??league(s)){
 free(s);if(!Number.isInteger(tier)||tier<0||tier>league(s))throw Error('Bu lig henüz açık değil.');
 if(!s.camp)throw Error('Önce bir maç ayarla ve hazırlık kampını tamamla.');
 if(s.camp.tier!==tier)throw Error('Hazırlık yaptığın maçın ligini seçmelisin.');
 if(Camp.remaining(s)>0)throw Error('Maç günü henüz gelmedi. Kampını tamamla veya maç gününe ilerle.');
 if(s.energy<35||s.food<25||s.sleep<25||s.health<50)throw Error('Maç için en az 35 enerji, 25 tokluk, 25 dinçlik ve 50 sağlık gerekiyor.');
 migrate(s);const enemy=structuredClone(s.camp.enemy);enemy.moves=enemy.moves||opponentMoves(enemy);
 const readiness=Camp.readiness(s),prep=Camp.combatBoost(s);
 const maxHp=[110+s.skills.strength*.5,110+enemy.skills.strength*.5];
 const maxSt=[(80+s.skills.stamina*.8)*(.72+.28*readiness),80+enemy.skills.stamina*.8];
 const condition=clamp(.62+(s.energy+s.sleep+s.food)/800,.65,1);
 s.fight={tier,enemy,playerMoves:[...s.loadout],prep,performance:[readiness*(.86+.14*condition),1],hp:[maxHp[0]*(.65+s.health*.0035),maxHp[1]],maxHp,st:[maxSt[0]*condition,maxSt[1]],maxSt,score:[0,0],tick:0,phase:'stand',top:0,tactic:'balanced',corner:freshCorner(1),done:false,result:null,log:'Zil çaldı. Gardını al!',last:{move:'idle',attacker:0,outcome:'rest',technique:'idle',phaseBefore:'stand',phaseAfter:'stand',topBefore:0,topAfter:0},events:[],id:s.hours+'-'+s.seed};
 s.camp=null;elapsed(s,1,-30,-18,-17);return s.fight;
}
export function tactic(s,t){if(!s.fight||s.fight.done)throw Error('Aktif maç yok.');if(!['balanced','strike','ground','defend'].includes(t))throw Error('Geçersiz taktik.');s.fight.tactic=t;}
export function cornerStatus(s){
 const f=s.fight;if(!f||f.done)return{remaining:0,cooldown:0,active:null,label:'Aktif maç yok.'};
 const c=f.corner?.round===roundOf(f)?f.corner:freshCorner(roundOf(f));
 const cooldown=c.lastTick===null?0:Math.max(0,3-(f.tick-c.lastTick));
 const label=c.active?`${CORNER_COMMANDS[c.active].name} · ${c.turns} ${c.active==='pressure'?'saldırı':'aksiyon'}`:cooldown?`${cooldown} aksiyon sonra yeni komut verebilirsin.`:`${2-c.used}/2 köşe komutu · ${c.round}. raund`;
 return{remaining:2-c.used,cooldown,active:c.active,label};
}
export function corner(s,key){
 if(!commandKey(key))throw Error('Geçersiz köşe komutu.');
 const f=s.fight;if(!f||f.done)throw Error('Aktif maç yok.');
 const status=cornerStatus(s);
 if(status.remaining===0)throw Error('Bu raundun iki köşe komutunu kullandın.');
 if(status.cooldown>0)throw Error(`Yeni komut için ${status.cooldown} aksiyon beklemelisin.`);
 if(!f.corner||f.corner.round!==roundOf(f))f.corner=freshCorner(roundOf(f));
 Object.assign(f.corner,{used:f.corner.used+1,lastTick:f.tick,active:key,turns:key==='breathe'?1:2,note:key});
 if(key==='breathe')f.st[0]=clamp(f.st[0]+12,0,f.maxSt[0]);
 return `Köşe: ${CORNER_COMMANDS[key].name}. ${CORNER_COMMANDS[key].description}`;
}
function battleTactic(f,index){if(index===0&&f.corner?.active==='escape')return'defend';const selected=index===0?f.tactic:'balanced';return selected==='balanced'&&f.st[index]/f.maxSt[index]<.26?'defend':selected;}
export function stepFight(s){
 const f=s.fight;if(!f||f.done)return f;
 if(!f.corner||f.corner.round!==roundOf(f))f.corner=freshCorner(roundOf(f));
 const cornerState=f.corner,command=cornerState.active,note=cornerState.note;cornerState.note=null;
 const phaseBefore=f.phase,topBefore=f.top;f.tick++;
 const a=f.tick%2,b=1-a,as=a===0?s.skills:f.enemy.skills,bs=b===0?s.skills:f.enemy.skills;
 const ast=a===0?style(s):f.enemy.style,bst=b===0?style(s):f.enemy.style;
 const at=battleTactic(f,a),bt=battleTactic(f,b),who=a===0?s.name:f.enemy.name;
 const ap=a===0?(f.prep||{}):{},bp=b===0?(f.prep||{}):{};
 const pressure=a===0&&command==='pressure',escape=a===0&&command==='escape',escapeDefense=b===0&&command==='escape';
 const tired=(.43+.57*clamp(f.st[a]/f.maxSt[a],0,1))*(f.performance?.[a]??1);
 const known=type=>MOVES.filter(m=>m.type===type&&(a===0?(f.playerMoves?f.playerMoves.includes(m.id):s.moves[m.id]>=2):(f.enemy.moves||[]).includes(m.id)));
 let move='punch',outcome='blocked',technique='direct',msg='';
 f.st[a]=clamp(f.st[a]+as.stamina*.025,0,f.maxSt[a]);f.st[b]=clamp(f.st[b]+2+bs.stamina*.025,0,f.maxSt[b]);
 const grappler=ast==='wrestling'||ast==='bjj';
 const takedownRate=at==='ground'?.7:at==='balanced'?(ast==='wrestling'?.64:ast==='bjj'?.5:.06):.035;
 if(a===0&&command==='breathe'){msg=`${who} köşesini dinleyip gardda nefes topluyor; bu aksiyonda saldırmıyor.`;move='guard';outcome='rest';technique='guard';}
 else if(at==='defend'&&rand(s)<.48&&!escape){f.st[a]=clamp(f.st[a]+13,0,f.maxSt[a]);msg=`${who} mesafeyi koruyor, nefes topluyor.`;move='guard';outcome='rest';technique='guard';}
 else if(f.phase==='stand'&&rand(s)<takedownRate){
  move='takedown';technique=known('takedown')[0]?.id||'takedown';outcome='defended';f.st[a]=Math.max(0,f.st[a]-10);
  const defense=bs.wrestling*.8+bs.bjj*.2;
  const chance=clamp((.46+(as.wrestling-defense)/120+(as.strength-bs.strength)/500+(known('takedown').length?.09:0)-(bp.takedownDefense||0)*.2-(bt==='defend'?.07:0)-(escapeDefense?.16:0))*(pressure?1.12:1),.1,pressure?.9:.86)*tired;
  if(rand(s)<chance){f.phase='ground';f.top=a;f.score[a]+=7;outcome='success';msg=`${who}, ${known('takedown').length?'çift bacak dalışıyla':'bir dalışla'} rakibini yere aldı.`}else msg=`${who} yere indirmeyi denedi, rakibi savundu.`;
 }
 else if(f.phase==='ground'){
  const escapeBonus=known('escape').length?.1:0;
  if(escape||at==='strike'||at==='defend'||(at==='balanced'&&!grappler)){
   move='escape';technique='escape';outcome='defended';
   const chance=clamp(.25+(as.bjj-bs.wrestling)/125+escapeBonus+(ap.groundEscape||0)*.22+(f.top===a?.15:0)+(escape?.18:0),.08,escape?.9:.86)*(.72+.28*tired);
   if(rand(s)<chance){f.phase='stand';outcome='success';msg=`${who} ${escapeBonus?'guard kaçışıyla':'alan açarak'} ayağa kalktı.`}else msg=`${who} yerden çıkmak için mücadele ediyor.`;
   f.st[a]=Math.max(0,f.st[a]-5);
  }else if(rand(s)<(ast==='bjj'?.42:.18)){
   const subs=known('submission'),sub=subs.length?subs[Math.floor(rand(s)*subs.length)]:null;move='submission';technique=sub?.id||'submission';outcome='defended';
   const chance=clamp((.035+(as.bjj-bs.bjj)/250+(sub?.id==='triangle'?.09:sub?.id==='armbar'?.065:0)+(f.st[b]<20?.07:0)-(bp.groundEscape||0)*.06)*(pressure?1.12:1),.012,pressure?.36:.34)*tired;
   f.st[a]=Math.max(0,f.st[a]-8);
   if(rand(s)<chance){outcome='success';msg=`${who}, ${sub?.name||'pes ettirme'} ile maçı bitirdi!`;finishFight(s,a,'Submission')}else msg=`${who} ${sub?.name||'pes ettirme'} arıyor; rakibi savunuyor.`;
  }else{
   move='ground';technique=known('ground')[0]?.id||'ground';outcome='hit';
   const damage=(4+as.bjj*.05+as.wrestling*.05+as.strength*.035)*tired*(f.top===a?1.22:.62)*(known('ground').length?1.18:1)*(pressure?1.12:1);
   f.hp[b]-=damage;f.score[a]+=damage;f.st[a]=Math.max(0,f.st[a]-5);
   msg=`${who} yerde ${f.top===a?'üst pozisyondan baskı kuruyor':'pozisyon kazanıyor'}.`;
   const controlDefense=bs.wrestling*.65+bs.bjj*.35;
   if(f.top!==a&&rand(s)<clamp(.15+((as.wrestling*.45+as.bjj*.55)-controlDefense)/170+(known('ground').length?.1:0),.03,.5)*tired){f.top=a;f.score[a]+=3;msg=`${who} yerde pozisyonu çevirdi!`}
  }
 }
 else{
  const kickRate=clamp(as.kickboxing/(as.kickboxing+as.boxing||1)*(ast==='kickboxing'?1.25:ast==='boxing'?.45:.7),.08,.86);
  const kick=rand(s)<kickRate;move=kick?'kick':'punch';const skill=kick?'kickboxing':'boxing';
  const moves=known(move),unlocked=moves.length&&rand(s)<.5?moves[Math.floor(rand(s)*moves.length)]:null;technique=unlocked?.id||(kick?'bodykick':'direct');
  const defense=kick?bs.kickboxing*.65+bs.boxing*.35:bs.boxing*.75+bs.kickboxing*.25;
  const footwork=(bst==='boxing'?.025:bst==='kickboxing'?.035:0);
  const accuracy=clamp((.63+(as[skill]-defense)/135-footwork-(bt==='defend'?.13:0)-(bp.distance||0)*.1)*(pressure?1.12:1),.16,pressure?.94:.91)*(.68+.32*tired);
  f.st[a]=Math.max(0,f.st[a]-(kick?8:6)*(at==='strike'?1.15:1));
  if(rand(s)<accuracy){
   outcome='hit';const damage=(5.8+as.strength*.09+as[skill]*.055)*tired*(at==='strike'?1.12:1)*(unlocked?1.2:1)*(bt==='defend'?.8:1)*(pressure?1.12:1);
   f.hp[b]-=damage;f.score[a]+=damage;msg=`${who}: ${unlocked?.name||(kick?'gövdeye tekme':'direkt yumruk')} isabetli!`;
  }else msg=`${who}: ${kick?'tekmesi':'yumruğu'} gardda kaldı.`;
 }
 if(a===0&&command){
  const attack=['punch','kick','ground','takedown','submission'].includes(move);
  if(command!=='pressure'||attack){
   if(pressure){f.st[0]=Math.max(0,f.st[0]-3);msg+=' Köşe baskısı: daha sert tempo, daha fazla nefes tüketimi.'}
   else if(command==='escape')msg+=' Köşe yönlendirmesi: mesafe ve kaçış.';
   cornerState.turns--;if(cornerState.turns===0)cornerState.active=null;
  }
 }
 if(note)msg=`Köşe komutu: ${CORNER_COMMANDS[note].name}. ${msg}`;
 f.last={move,attacker:a,outcome,technique,phaseBefore,phaseAfter:f.phase,topBefore,topAfter:f.top};f.log=msg;
 if(!f.done&&f.hp[b]<=0)finishFight(s,a,'TKO');
 if(!f.done&&f.tick>=60){const d=f.score[0]-f.score[1];finishFight(s,Math.abs(d)<3?2:d>0?0:1,'Hakem kararı')}
 else if(!f.done&&f.tick%20===0){f.phase='stand';f.st=f.st.map((v,i)=>clamp(v+f.maxSt[i]*.22,0,f.maxSt[i]));f.corner=freshCorner(roundOf(f));f.log+=' Raund bitti; köşede toparlanıyorsunuz.'}
 if(f.done)f.log+=` Maç bitti: ${f.result.method} · ${f.result.winner===2?'Berabere':(f.result.winner===0?s.name:f.enemy.name)+' kazandı'}.`;
 const remaining=180-(((f.tick-1)%20)+1)*9;
 f.events=[...(f.events||[]),{tick:f.tick,round:Math.floor((f.tick-1)/20)+1,time:Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0'),text:f.log,...f.last}].slice(-60);return f;
}
function finishFight(s,winner,method){
 const f=s.fight;if(f.done)return;migrate(s);const old=league(s);f.done=true;
 const won=winner===0,draw=winner===2,reward=draw?Math.round(LEAGUES[f.tier].purse*.6):won?LEAGUES[f.tier].purse:LEAGUES[f.tier].loss;
 f.result={winner,method,reward,promotion:false,champion:false};Competition.afterFight(s);
 if(won){s.wins++;if(f.result.qualifiedWin)s.leagueWins[f.tier]++}else if(draw)s.draws++;else s.losses++;
 s.cash+=reward;s.earned+=reward;s.health=clamp(35+Math.max(0,f.hp[0])/f.maxHp[0]*60,25,95);s.energy=clamp(s.energy-8);
 Object.assign(f.result,{promotion:league(s)>old,champion:isChampion(s)&&f.tier===3&&won});
 s.history.unshift({name:f.enemy.name,won,draw,method,reward,day:day(s),tier:f.tier,...(f.enemy.id?{opponentId:f.enemy.id}:{})});s.history=s.history.slice(0,80);
 World.afterFight(s);
}
