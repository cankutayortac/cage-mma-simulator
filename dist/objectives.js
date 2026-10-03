import * as World from './world.js?v=0.5.0';

export const CHAPTERS={1:'İlk adımlar',2:'Dövüşçü kimliğin',3:'Kalıcı bir kariyer'};
const MOVE_IDS=['hook','uppercut','combo','lowkick','highkick','double','control','escape','armbar','triangle'];
const styles=['boxing','kickboxing','wrestling','bjj'];
const number=value=>Number.isFinite(value)?Math.max(0,value):0;
const learned=s=>MOVE_IDS.filter(id=>s.moves?.[id]>=2).length;
const fights=s=>number(s.wins)+number(s.losses)+number(s.draws);

const definitions=[
 {id:'first-sessions',chapter:1,title:'İlk disiplin',description:'Üç antrenman seansı tamamla. Normal, aktif ve kamp çalışmaları bu hedefe sayılır.',target:3,rewardCash:25,rewardRep:0,progress:s=>number(s.sessions)},
 {id:'first-community',chapter:1,title:'Mahalleye karış',description:'Şehirde bir günlük fırsata katıl. Yeni bağlantılar da kariyerinin bir parçası.',target:1,rewardCash:20,rewardRep:1,progress:s=>s.world?.eventsTaken?.length?1:0},
 {id:'first-fight',chapter:1,title:'İlk sınav',description:'İlk maçını tamamla. Sonuç ne olursa olsun kafese çıkmış olacaksın.',target:1,rewardCash:50,rewardRep:0,progress:fights},
 {id:'first-win',chapter:1,title:'İlk zafer',description:'Bir maç kazan. Hazırlığının karşılığını kafeste al.',target:1,rewardCash:60,rewardRep:1,progress:s=>number(s.wins)},
 {id:'style-foundation',chapter:2,title:'Kendi tarzın',description:'Boks, kickboks, güreş veya BJJ becerilerinden birini 25 seviyeye çıkar.',target:25,rewardCash:40,rewardRep:0,progress:s=>Math.max(0,...styles.map(key=>number(s.skills?.[key])))},
 {id:'first-technique',chapter:2,title:'İlk özel teknik',description:'Bir yeni hareketin iki çalışmasını tamamlayarak o tekniği öğren.',target:1,rewardCash:45,rewardRep:0,progress:learned},
 {id:'first-gym',chapter:2,title:'Evden salona',description:'Ev dışında bir salona üyelik al. Daha sonra eve dönsen de hedef tamamlanmış kalır.',target:1,rewardCash:50,rewardRep:1,progress:s=>(s.ownedGyms||[]).some(id=>Number.isInteger(id)&&id>0&&id<=3)?1:0},
 {id:'first-sponsor',chapter:2,title:'İlk destekçi',description:'Bir markayla aktif sponsor anlaşman olsun; hedef ödülünü anlaşma sürerken al.',target:1,rewardCash:35,rewardRep:0,progress:s=>World.SPONSORS.some(sponsor=>sponsor.id===s.world?.sponsor)?1:0},
 {id:'three-wins',chapter:3,title:'İstikrarlı dövüşçü',description:'Kariyerinde üç galibiyete ulaş. Her galibiyet kalıcı ilerlemedir.',target:3,rewardCash:60,rewardRep:1,progress:s=>number(s.wins)},
 {id:'three-techniques',chapter:3,title:'Teknik repertuvar',description:'Üç farklı özel hareket öğren. Maç setini rakibine göre kurabilecek seçeneklerin olsun.',target:3,rewardCash:65,rewardRep:0,progress:learned},
 {id:'local-name',chapter:3,title:'Mahallede bir isim',description:'Maçlar ve şehir etkinlikleriyle 12 itibara ulaş.',target:12,rewardCash:65,rewardRep:0,progress:s=>number(s.world?.reputation)},
 {id:'first-home',chapter:3,title:'Kendi anahtarın',description:'Paylaşımlı odadan kendi dairene geç. Kalıcı bir yaşam alanı kur.',target:1,rewardCash:75,rewardRep:1,progress:s=>number(s.world?.home)>=1?1:0}
];
const ids=new Set(definitions.map(goal=>goal.id));

export function migrate(s){
 if(s.objectives===undefined)s.objectives={claimed:[]};
 return s;
}

export function valid(s){
 if(!s||typeof s!=='object')return false;
 if(s.objectives===undefined)return true;
 const claimed=s.objectives?.claimed;
 return !!(s.objectives&&typeof s.objectives==='object'&&!Array.isArray(s.objectives)&&Array.isArray(claimed)&&claimed.length<=definitions.length&&new Set(claimed).size===claimed.length&&claimed.every(id=>typeof id==='string'&&ids.has(id)));
}

// Progress is derived from real career state; reading goals never awards anything.
export function list(s){
 const claimed=new Set(s.objectives?.claimed||[]);
 return definitions.map(({progress,...goal})=>{
  const received=claimed.has(goal.id),current=received?goal.target:Math.min(goal.target,Math.floor(progress(s)));
  return {...goal,chapterTitle:CHAPTERS[goal.chapter],current,complete:current>=goal.target,claimed:received};
 });
}

export function claim(s,id){
 if(s.fight&&!s.fight.done)throw Error('Hedef ödülünü maçtan sonra alabilirsin.');
 if(!valid(s)||!World.valid(s)||!Number.isFinite(s.cash)||s.cash<0||!Number.isFinite(s.earned)||s.earned<0)throw Error('Kariyer hedefleri okunamadı.');
 if(typeof id!=='string'||!ids.has(id))throw Error('Geçersiz kariyer hedefi.');
 const goal=list(s).find(goal=>goal.id===id);
 if(goal.claimed)throw Error('Bu hedefin ödülünü zaten aldın.');
 if(!goal.complete)throw Error('Ödül için önce bu hedefi tamamlamalısın.');
 // All validation happens before migration or currency changes.
 migrate(s);World.migrate(s);
 const rep=Math.min(goal.rewardRep,100-s.world.reputation);
 s.objectives.claimed.push(id);s.cash+=goal.rewardCash;s.earned+=goal.rewardCash;s.world.reputation+=rep;
 return `${goal.title} tamamlandı: +₺${goal.rewardCash}${rep?' · +'+rep+' itibar':''}.${goal.rewardRep&&!rep?' İtibarın zaten 100.':''}`;
}
