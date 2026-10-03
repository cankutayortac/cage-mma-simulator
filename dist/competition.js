// Opponents retain their identity and skill profile across camps and rematches.
const STYLES=['boxing','wrestling','kickboxing','bjj'];
const NAMES=[
 ['Bora “Çekiç”','Mert Kaya','Aras “Bozkurt”','Deniz Akın','Kaan “Fırtına”','Eren Keskin','Leo Silva','Alex Volkov'],
 ['Atakan Kılıç','Yunus Öz','Ozan Karaca','Demir Şahin','Emir Kuzey','Taha Öztürk','Marco Rossi','Rafael Lima'],
 ['Adrian Costa','Musa Yıldırım','Niko Petrov','Gabriel Santos','Kerem “Kilit”','Dario Moretti','Ibrahim Aksoy','Victor Salazar'],
 ['Andre “Atlas”','Kenji Mori','Tomas Vega','Lucas “Anaconda”','Malik Stone','Ivan Sokolov','Diego Cruz','Elias Novak']
];
const ROSTER=NAMES.flatMap((names,tier)=>names.map((name,index)=>({id:`league-${tier}-fighter-${index}`,tier,name,style:STYLES[index%4],baseRank:8-index,offset:index*1.3})));
const find=id=>ROSTER.find(rival=>rival.id===id);
export const knownOpponent=(id,tier)=>typeof id==='string'&&find(id)?.tier===tier;
const day=s=>Math.floor(s.hours/24)+1;
const zeroRecord=()=>({wins:0,losses:0,draws:0});
const rankOf=(s,tier)=>s.competition?.ranks[tier]??Math.max(1,9-Math.min(8,s.leagueWins?.[tier]||0));
const recordOf=(s,id)=>s.competition?.records[id]||zeroRecord();
const cleanRecord=record=>({wins:record.wins,losses:record.losses,draws:record.draws});
const meetings=record=>record.wins+record.losses+record.draws;
function checkTier(tier){if(!Number.isInteger(tier)||tier<0||tier>3)throw Error('Geçersiz lig.');}
function row(s,rival){const rank=rankOf(s,rival.tier),record=recordOf(s,rival.id);return{...rival,rank:rival.baseRank>=rank?rival.baseRank+1:rival.baseRank,player:false,record:cleanRecord(record)}}

export function migrate(s){
 if(s.competition===undefined)s.competition={ranks:[0,1,2,3].map(tier=>Math.max(1,9-Math.min(8,s.leagueWins?.[tier]||0))),records:{},lastFight:null};
 return s;
}

export function valid(s){
 const c=s?.competition;if(c===undefined)return true;
 if(!c||!Array.isArray(c.ranks)||c.ranks.length!==4||!c.ranks.every(rank=>Number.isInteger(rank)&&rank>=1&&rank<=9)||!c.records||typeof c.records!=='object'||Array.isArray(c.records)||Object.keys(c.records).length>32||!(c.lastFight===null||typeof c.lastFight==='string'&&c.lastFight.length>0&&c.lastFight.length<=120))return false;
 return Object.entries(c.records).every(([id,record])=>find(id)&&record&&['wins','losses','draws'].every(key=>Number.isSafeInteger(record[key])&&record[key]>=0)&&meetings(record)>0&&Number.isInteger(record.lastDay)&&record.lastDay>=1&&record.lastDay<=day(s)&&['win','loss','draw'].includes(record.lastResult)&&typeof record.lastMethod==='string'&&record.lastMethod.length<=80);
}

export function validOpponent(enemy,tier){
 if(enemy?.id===undefined)return true;
 const rival=find(enemy.id);
 return !!(rival&&rival.tier===tier&&(enemy.tier===undefined||enemy.tier===tier)&&Number.isInteger(enemy.rank)&&enemy.rank>=1&&enemy.rank<=9&&(enemy.reason===undefined||typeof enemy.reason==='string'&&enemy.reason.length<=100)&&(enemy.qualifies===undefined||typeof enemy.qualifies==='boolean')&&(enemy.record===undefined||enemy.record&&['wins','losses','draws'].every(key=>Number.isSafeInteger(enemy.record[key])&&enemy.record[key]>=0)));
}

export function validResult(result){
 if(!result)return true;
 if(result.competitionApplied!==undefined&&typeof result.competitionApplied!=='boolean')return false;
 if(result.qualifiedWin!==undefined&&typeof result.qualifiedWin!=='boolean')return false;
 const r=result.ranking;
 return r===undefined||r===null||!!(r&&Number.isInteger(r.before)&&r.before>=1&&r.before<=9&&Number.isInteger(r.after)&&r.after>=1&&r.after<=9&&typeof r.advanced==='boolean'&&r.advanced===(r.after<r.before)&&typeof r.firstWin==='boolean');
}

export function offers(s,tier,titleWins=7){
 checkTier(tier);const playerRank=rankOf(s,tier),roster=ROSTER.filter(rival=>rival.tier===tier).map(rival=>row(s,rival));
 const unbeaten=roster.filter(rival=>rival.record.wins===0),ahead=unbeaten.filter(rival=>rival.rank<playerRank).sort((a,b)=>b.rank-a.rank);
 const pool=unbeaten.length?unbeaten:roster,selected=[];
 const add=(rival,reason)=>{if(rival&&!selected.some(item=>item.id===rival.id))selected.push({...rival,reason,qualifies:rival.record.wins===0});};
 const titleShot=tier===3&&(s.leagueWins?.[3]||0)>=titleWins&&playerRank>1;
 const main=titleShot?roster.find(rival=>rival.rank===1):ahead[0]||[...pool].sort((a,b)=>a.rank-b.rank)[0];
 add(main,titleShot?'Kemer maçı':main.record.losses?'Rövanş fırsatı':main.rank<playerRank?'Sıralama maçı':main.record.wins?'Unvanını savun':'Yeni rakip');
 add(ahead.find(rival=>rival.id!==main.id)||pool.find(rival=>rival.id!==main.id),'Yükseliş fırsatı');
 const rivals=roster.filter(rival=>meetings(rival.record)>0).sort((a,b)=>(recordOf(s,b.id).lastDay||0)-(recordOf(s,a.id).lastDay||0)||meetings(b.record)-meetings(a.record));
 add(rivals.find(rival=>!selected.some(item=>item.id===rival.id)),'Yeniden karşılaş');
 for(const rival of [...pool].sort((a,b)=>b.rank-a.rank)){if(selected.length===3)break;add(rival,'Farklı bir stil');}
 for(const rival of roster){if(selected.length===3)break;add(rival,'Lig karşılaşması');}
 return selected;
}

export function summary(s,tier){
 checkTier(tier);const rank=rankOf(s,tier),roster=ROSTER.filter(rival=>rival.tier===tier).map(rival=>row(s,rival));
 const record=roster.reduce((total,rival)=>({wins:total.wins+rival.record.wins,losses:total.losses+rival.record.losses,draws:total.draws+rival.record.draws}),zeroRecord());
 const martial=['boxing','kickboxing','wrestling','bjj'].reduce((best,key)=>s.skills[key]>s.skills[best]?key:best,'boxing');
 const ladder=[...roster,{id:'player',name:s.name,rank,style:martial,player:true,record}].sort((a,b)=>a.rank-b.rank);
 const rivals=roster.filter(rival=>meetings(rival.record)>0).map(rival=>({...rival,...recordOf(s,rival.id),record:rival.record,meetings:meetings(rival.record)})).sort((a,b)=>b.lastDay-a.lastDay||b.meetings-a.meetings).slice(0,6);
 return{tier,rank,total:9,ladder,rivals};
}

export function afterFight(s){
 const f=s.fight;if(!f?.done||!f.result)return null;
 if(f.result.competitionApplied)return f.result.ranking||null;
 migrate(s);
 const fightId=typeof f.id==='string'&&f.id?f.id:null;
 if(fightId&&s.competition.lastFight===fightId){f.result.competitionApplied=true;return f.result.ranking||null;}
 const rival=find(f.enemy.id);
 // An already running match from an earlier version can still finish normally.
 if(!rival||rival.tier!==f.tier){f.result.qualifiedWin=f.result.winner===0;f.result.ranking=null;f.result.competitionApplied=true;s.competition.lastFight=fightId;return null;}
 const c=s.competition,previous=recordOf(s,rival.id),before=c.ranks[f.tier],won=f.result.winner===0,draw=f.result.winner===2;
 const firstWin=won&&previous.wins===0,opponentRank=row(s,rival).rank;
 const after=won?Math.min(before,opponentRank):!draw&&opponentRank>before?Math.min(9,before+1):before;
 c.ranks[f.tier]=after;c.records[rival.id]={wins:previous.wins+(won?1:0),losses:previous.losses+(!won&&!draw?1:0),draws:previous.draws+(draw?1:0),lastDay:day(s),lastResult:won?'win':draw?'draw':'loss',lastMethod:f.result.method};
 c.lastFight=fightId;f.result.qualifiedWin=firstWin;f.result.ranking={before,after,advanced:after<before,firstWin};f.result.competitionApplied=true;
 return f.result.ranking;
}
