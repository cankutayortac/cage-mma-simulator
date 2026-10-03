import * as Camp from './camp.js?v=0.4.0';

const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,n));
const day=s=>Math.floor(s.hours/24)+1;
const labels={boxing:'Boks',kickboxing:'Kickboks',wrestling:'Güreş',bjj:'BJJ',stamina:'Kondisyon',strength:'Kuvvet'};
const activeFight=s=>s.fight&&!s.fight.done;
const empty=()=>({reputation:0,home:0,sponsor:null,notice:'Mahalle henüz adını bilmiyor. Bir antrenman, bir karşılaşma, bir yeni bağlantı.',lastFight:null,eventsTaken:[],sponsorPaidDay:0});
const current=s=>s.world||empty();

export const HOMES=[
 {id:0,name:'Paylaşımlı oda',price:0,reputation:0,subtitle:'Dar bir oda, büyük bir hedef.',description:'Antrenman çantan yatağın yanında. Ücretsiz dinlenme ve uyku her zaman açık.',sleep:{health:0,fatigue:0},rest:{energy:0,health:0,fatigue:0}},
 {id:1,name:'Kendi dairen',price:1200,reputation:8,subtitle:'İlk kez kendi anahtarın var.',description:'Sakin bir uyku alanı ve toparlanmak için yer. Uykuya +4 sağlık, −6 yük; dinlenmeye +4 enerji, +2 sağlık, −2 yük.',sleep:{health:4,fatigue:6},rest:{energy:4,health:2,fatigue:2}},
 {id:2,name:'Sporcu evi',price:6000,reputation:25,subtitle:'Yaşamın artık kariyerinin etrafında.',description:'Ayrı çalışma alanı, geniş oda ve düzenli bir hayat. Uykuya +8 sağlık, −12 yük; dinlenmeye +8 enerji, +4 sağlık, −4 yük.',sleep:{health:8,fatigue:12},rest:{energy:8,health:4,fatigue:4}}
];

export const SPONSORS=[
 {id:'corner',name:'Köşe Büfe',reputation:4,minTier:0,payout:40,description:'Mahallenin ilk desteği. Her ligde tamamlanan maç için ₺40.'},
 {id:'district',name:'District Spor',reputation:12,minTier:1,payout:120,description:'Yerel spor mağazası. Amatör ve üstü maçlarda ₺120.'},
 {id:'apex',name:'Apex Atletik',reputation:25,minTier:2,payout:300,description:'Büyüyen kariyerine ortak. Profesyonel ve dünya ligi maçlarında ₺300.'}
];

// Every choice is a visible, fixed trade-off. Only the board rotates each game day.
const EVENTS=[
 {id:'community',location:'Mahalle meydanı',name:'Mahalle turnuvası',description:'Küçük turnuvanın kurulumu için yardım aranıyor.',reputation:0,choices:[
  {id:'volunteer',label:'Gönüllü ol',hours:2,cash:0,reward:0,energy:12,food:8,sleep:6,health:0,rep:1,skills:{},training:false,description:'Organizasyona yardım et, mahallenin güvenini kazan.'},
  {id:'setup',label:'Kurulum ekibine katıl',hours:2,cash:0,reward:65,energy:18,food:10,sleep:8,health:0,rep:0,skills:{},training:false,description:'Sandalyeleri ve ekipmanı taşı. Bugünkü masraflarına destek olur.'}
 ]},
 {id:'openmat',location:'Eski salon',name:'Açık minder',description:'Salondakiler bugün dışarıdan gelenlerle kontrollü eşleşiyor.',reputation:0,choices:[
  {id:'technical',label:'Teknik eşleşme yap',hours:1,cash:0,reward:0,energy:18,food:11,sleep:9,health:0,rep:0,skills:{bjj:.25,wrestling:.15},training:true,extraFatigue:0,description:'Düşük tempoda pozisyon geçişi. Sağlık kaybı yok.'},
  {id:'hard',label:'Sert eşleşmeye katıl',hours:1,cash:0,reward:0,energy:24,food:13,sleep:11,health:8,rep:1,skills:{boxing:.35,stamina:.15},training:true,extraFatigue:6,description:'Daha yoğun tempo: sağlık −8, normal seansa ek yük +6. En az 45 sağlık gerekir.'}
 ]},
 {id:'audition',location:'Spor mağazası',name:'Yerel marka seçmesi',description:'Bir spor mağazası mahalleden dövüşçülerle tanışıyor.',reputation:0,choices:[
  {id:'story',label:'Hikâyeni anlat',hours:2,cash:0,reward:45,energy:15,food:8,sleep:8,health:0,rep:1,skills:{},training:false,description:'Kısa tanıtıma katıl. Ücret ve itibar kazan; sponsor anlaşması otomatik açılmaz.'},
  {id:'demo',label:'Tekniğini göster',hours:1,cash:0,reward:0,energy:18,food:11,sleep:9,health:0,rep:1,skills:{boxing:.25},training:true,extraFatigue:0,description:'Kontrollü bir gölge boksu gösterisiyle kendini tanıt.'}
 ]},
 {id:'runclub',location:'Sahil parkuru',name:'Sabah koşu grubu',description:'Mahallenin sporcuları sahilde buluşuyor.',reputation:0,choices:[
  {id:'run',label:'Koşuya katıl',hours:1,cash:0,reward:0,energy:18,food:11,sleep:9,health:0,rep:1,skills:{stamina:.3},training:true,extraFatigue:0,description:'Gruba ayak uydur; kondisyonunu ve çevreni geliştir.'},
  {id:'water',label:'Su noktasına yardım et',hours:2,cash:0,reward:50,energy:10,food:6,sleep:5,health:0,rep:0,skills:{},training:false,description:'Antrenman yapmadan organizasyona destek ver.'}
 ]},
 {id:'market',location:'Mahalle pazarı',name:'Hafta içi hareketliliği',description:'Spor standı bugün pazarda küçük bir alan açmış.',reputation:0,choices:[
  {id:'stall',label:'Standa yardım et',hours:2,cash:0,reward:70,energy:15,food:8,sleep:7,health:0,rep:0,skills:{},training:false,description:'Gelenlerle ilgilen, kurulum ve toplamada yardım et.'},
  {id:'support',label:'Gençlere ekipman desteği ver',hours:1,cash:35,reward:0,energy:5,food:3,sleep:3,health:0,rep:1,skills:{},training:false,description:'Yerel programın eldiven bütçesine katkıda bulun.'}
 ]},
 {id:'meetup',location:'Mahalle meydanı',name:'Sporcu buluşması',description:'Amatör sporcular deneyimlerini paylaşmak için bir araya geliyor.',reputation:0,choices:[
  {id:'talk',label:'Buluşmaya katıl',hours:2,cash:0,reward:0,energy:10,food:6,sleep:5,health:0,rep:1,skills:{},training:false,description:'Kendi yolculuğunu anlat, çevrendeki insanlarla tanış.'},
  {id:'drill',label:'Partnerle ayak oyunu çalış',hours:1,cash:0,reward:0,energy:18,food:11,sleep:9,health:0,rep:0,skills:{kickboxing:.3},training:true,extraFatigue:0,description:'Kontrollü mesafe çalışması. Sağlık kaybı yok.'}
 ]}
];

export function migrate(s){if(s.world===undefined)s.world=empty();return s}

export function valid(s){
 if(!s)return false;if(s.world===undefined)return true;
 const w=s.world;if(!w||!Number.isInteger(w.reputation)||w.reputation<0||w.reputation>100||!Number.isInteger(w.home)||!HOMES[w.home]||!(w.sponsor===null||SPONSORS.some(x=>x.id===w.sponsor))||typeof w.notice!=='string'||w.notice.length>500||!(w.lastFight===null||typeof w.lastFight==='string'&&w.lastFight.length>0&&w.lastFight.length<=120)||!Number.isInteger(w.sponsorPaidDay)||w.sponsorPaidDay<0||w.sponsorPaidDay>day(s)||!Array.isArray(w.eventsTaken)||w.eventsTaken.length>30)return false;
 return w.eventsTaken.every((event,i)=>event&&Number.isInteger(event.day)&&event.day>0&&event.day<=day(s)&&(i===0||event.day>w.eventsTaken[i-1].day)&&EVENTS.some(e=>e.id===event.id&&e.choices.some(c=>c.id===event.choice)));
}

export function opportunities(s){
 const offset=(day(s)+Math.floor(current(s).reputation/8))%EVENTS.length;
 return [0,1,3].map(step=>structuredClone(EVENTS[(offset+step)%EVENTS.length]));
}

export function opportunityTaken(s){return current(s).eventsTaken.some(event=>event.day===day(s))}

export function choicePreview(s,choice){
 const multiplier=choice.training?Camp.trainingMultiplier(s):1;
 const skills=Object.fromEntries(Object.entries(choice.skills).map(([key,gain])=>[key,Math.min(100-s.skills[key],gain*multiplier)]));
 const count=s.trainingDay?.day===day(s)?s.trainingDay.count:0;
 return {...choice,skills,fatigue:choice.training?Math.min(100-(s.fatigue||0),12+2*Math.min(count,4)+(choice.extraFatigue||0)):0};
}

function eventAction(s,id,choiceId){
 if(opportunityTaken(s))throw Error('Bugünkü şehir fırsatını kullandın. Yarın üç yeni seçenek olacak.');
 const event=opportunities(s).find(e=>e.id===id),choice=event?.choices.find(c=>c.id===choiceId);
 if(!event||!choice)throw Error('Bu fırsat bugün açık değil. Şehir panosundaki bir seçeneği kullan.');
 if(current(s).reputation<event.reputation)throw Error(`Bu etkinlik için ${event.reputation} itibar gerekiyor.`);
 if(choice.training)Camp.assertTraining(s);
 const minEnergy=Math.max(choice.energy,choice.training?20:0),minFood=Math.max(choice.food,choice.training?20:0),minSleep=Math.max(choice.sleep,choice.training?15:0),minHealth=choice.health?45:choice.training?35:0;
 if(s.energy<minEnergy||s.food<minFood||s.sleep<minSleep||s.health<minHealth)throw Error(`Bu seçim için en az ${minEnergy} enerji, ${minFood} tokluk, ${minSleep} dinçlik${minHealth?', '+minHealth+' sağlık':''} gerekiyor.`);
 if(s.cash<choice.cash)throw Error(`Bunun için ₺${Math.ceil(choice.cash-s.cash)} daha gerekiyor.`);
 const preview=choicePreview(s,choice),started=day(s);
 migrate(s);s.cash+=choice.reward-choice.cash;s.earned+=choice.reward;
 s.hours+=choice.hours;s.energy=clamp(s.energy-choice.energy);s.food=clamp(s.food-choice.food);s.sleep=clamp(s.sleep-choice.sleep);s.health=clamp(s.health-choice.health);
 for(const [key,gain] of Object.entries(preview.skills))s.skills[key]=clamp(s.skills[key]+gain);
 if(choice.training){s.sessions++;Camp.onTraining(s,Object.keys(choice.skills)[0]);s.fatigue=clamp(s.fatigue+(choice.extraFatigue||0))}
 s.world.reputation=clamp(s.world.reputation+choice.rep);s.world.eventsTaken.push({day:started,id,choice:choiceId});s.world.eventsTaken=s.world.eventsTaken.slice(-30);
 const rewards=[choice.reward?`+₺${choice.reward}`:'',choice.cash?`−₺${choice.cash}`:'',choice.rep?`+${choice.rep} itibar`:'',...Object.entries(preview.skills).map(([key,gain])=>`${labels[key]} +${gain.toFixed(2)}`)].filter(Boolean).join(' · ');
 s.world.notice=`${event.location}: ${choice.label}. ${rewards}.`;
 return s.world.notice;
}

export function act(s,actionId){
 if(activeFight(s))throw Error('Önce devam eden maçı tamamla.');
 if(typeof actionId!=='string')throw Error('Geçersiz şehir eylemi.');
 const parts=actionId.split(':');
 if(parts[0]==='event'&&parts.length===3)return eventAction(s,parts[1],parts[2]);
 if(parts[0]==='home'&&parts.length===2&&/^[12]$/.test(parts[1])){
  const home=HOMES[Number(parts[1])],w=current(s);
  if(home.id!==w.home+1)throw Error('Sıradaki ev yükseltmesini seçmelisin.');
  if(w.reputation<home.reputation)throw Error(`Bu eve geçmek için ${home.reputation} itibar gerekiyor.`);
  if(s.cash<home.price)throw Error(`Bunun için ₺${home.price-s.cash} daha gerekiyor.`);
  migrate(s);s.cash-=home.price;s.world.home=home.id;s.world.notice=`${home.name} artık senin. ${home.subtitle}`;return s.world.notice;
 }
 if(parts[0]==='sponsor'&&parts.length===2){
  const sponsor=SPONSORS.find(x=>x.id===parts[1]),w=current(s);
  if(parts[1]==='none'){
   if(!w.sponsor)throw Error('Şu an bir sponsorun yok.');
   migrate(s);s.world.sponsor=null;s.world.notice='Sponsor anlaşmasını sonlandırdın. Yeni bir marka seçebilirsin.';return s.world.notice;
  }
  if(!sponsor)throw Error('Geçersiz sponsor.');
  if(w.sponsor===sponsor.id)throw Error('Bu sponsor zaten yanında.');
  if(w.reputation<sponsor.reputation)throw Error(`${sponsor.name} için ${sponsor.reputation} itibar gerekiyor.`);
  migrate(s);s.world.sponsor=sponsor.id;s.world.notice=`${sponsor.name} ile anlaştın. ${sponsor.description}`;return s.world.notice;
 }
 throw Error('Geçersiz şehir eylemi.');
}

export function recoverBonus(s,action){
 if(!['sleep','rest'].includes(action))return '';
 const home=HOMES[current(s).home];if(!home||home.id===0)return '';
 const bonus=home[action];
 if(bonus.energy)s.energy=clamp(s.energy+bonus.energy);
 s.health=clamp(s.health+bonus.health);s.fatigue=clamp((s.fatigue||0)-bonus.fatigue);
 return `${home.name}: ek ${bonus.energy?'+'+bonus.energy+' enerji, ':''}+${bonus.health} sağlık, yük −${bonus.fatigue}.`;
}

export function afterFight(s){
 const f=s.fight;
 if(!f?.done||!f.result||typeof f.id!=='string'||!f.id||![0,1,2].includes(f.result.winner))return 0;
 if(f.result.worldApplied||current(s).lastFight===f.id)return 0;
 migrate(s);
 const w=s.world,rep=f.result.winner===0?2:1,sponsor=SPONSORS.find(x=>x.id===w.sponsor),bonus=sponsor&&f.tier>=sponsor.minTier&&w.sponsorPaidDay!==day(s)?sponsor.payout:0;
 const repBefore=w.reputation;w.reputation=clamp(w.reputation+rep);w.lastFight=f.id;
 if(bonus){s.cash+=bonus;s.earned+=bonus;w.sponsorPaidDay=day(s)}
 f.result.sponsorReward=bonus;f.result.reputationReward=w.reputation-repBefore;f.result.worldApplied=true;
 w.notice=`${f.enemy.name} ile maç ${f.result.winner===0?'zaferle':f.result.winner===2?'beraberlikle':'mağlubiyetle'} bitti. Şehirdeki itibarın +${f.result.reputationReward}${bonus?`. ${sponsor.name} desteği +₺${bonus}`:''}.`;
 return bonus;
}
