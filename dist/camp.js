// The camp runs on game time. A due appointment waits for the player.
const SKILLS=['boxing','kickboxing','wrestling','bjj','stamina','strength'];
const STYLES=['boxing','kickboxing','wrestling','bjj'];
const STYLE_NAMES={boxing:'Boks',kickboxing:'Kickboks',wrestling:'Güreş',bjj:'BJJ',stamina:'Kondisyon',strength:'Kuvvet'};
const clamp=(value,min=0,max=100)=>Math.min(max,Math.max(min,value));
const gameDay=s=>Math.floor(s.hours/24)+1;
const finiteRange=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;

export const FOCUSES={
 takedownDefense:{name:'Yere alınma savunması',description:'Dalışları karşıla, dengeni koru. Bu maçta rakibin seni yere alma ihtimalini azaltır.',against:['wrestling','bjj'],skill:'wrestling'},
 distance:{name:'Mesafe ve gard',description:'Ayak oyunu ve açı çalış. Bu maçta ayaktaki rakibinin isabetini azaltır.',against:['boxing','kickboxing'],skill:'boxing'},
 groundEscape:{name:'Yerden kaçış',description:'Kalça hareketi ve pozisyondan çıkış çalış. Bu maçta ayağa dönüşünü ve pes ettirme savunmanı destekler.',against:['bjj','wrestling'],skill:'bjj'}
};
const focusKeys=Object.keys(FOCUSES);
const emptyPrep=()=>Object.fromEntries(focusKeys.map(key=>[key,0]));
const prepOf=s=>Object.fromEntries(focusKeys.map(key=>[key,s.camp?.prep?.[key]??0]));
const activeFight=s=>s.fight&&!s.fight.done;
const dailyCount=s=>s.trainingDay?.day===gameDay(s)?s.trainingDay.count:0;
const dailyFactor=s=>[1,.8,.55,.35][Math.min(3,dailyCount(s))];

function validEnemy(enemy){
 return !!(enemy&&typeof enemy.name==='string'&&enemy.name.length>0&&enemy.name.length<=80&&STYLES.includes(enemy.style)&&SKILLS.every(key=>finiteRange(enemy.skills?.[key],0,100)));
}

export function validExtras(s){
 if(!s||!Number.isFinite(s.hours)||s.hours<0)return false;
 if(s.fatigue!==undefined&&!finiteRange(s.fatigue,0,100))return false;
 if(s.trainingDay!==undefined&&!(s.trainingDay&&Number.isInteger(s.trainingDay.day)&&s.trainingDay.day>0&&s.trainingDay.day<=gameDay(s)&&Number.isInteger(s.trainingDay.count)&&s.trainingDay.count>=0&&s.trainingDay.count<=24))return false;
 const c=s.camp;
 if(c===undefined||c===null)return true;
 return !!(!activeFight(s)&&c&&Number.isInteger(c.tier)&&c.tier>=0&&c.tier<=3&&validEnemy(c.enemy)&&Number.isFinite(c.bookedAt)&&c.bookedAt>=0&&c.bookedAt<=s.hours&&c.dueAt===c.bookedAt+168&&Number.isSafeInteger(c.sessions)&&c.sessions>=0&&c.prep&&focusKeys.every(key=>finiteRange(c.prep[key],0,100)));
}

export function migrate(s){
 if(s.fatigue===undefined)s.fatigue=0;
 if(s.camp===undefined)s.camp=null;
 if(s.trainingDay===undefined)s.trainingDay={day:gameDay(s),count:0};
 return s;
}

export function remaining(s){return s.camp?Math.max(0,s.camp.dueAt-s.hours):0}

export function readiness(s){return 1-Math.max(0,clamp(s.fatigue??0)-20)/320}

export function status(s){
 const hoursLeft=remaining(s),fatigue=s.fatigue??0;
 return {hoursLeft,daysLeft:Math.ceil(hoursLeft/24),ready:!!s.camp&&hoursLeft===0,fatigue,readinessLabel:fatigue<=20?'Dinç':fatigue<=45?'Dengeli':fatigue<=70?'Yorgun':'Aşırı yorgun',prep:prepOf(s)};
}

export function book(s,tier,enemy){
 if(activeFight(s))throw Error('Önce devam eden maçı tamamla.');
 if(s.camp)throw Error('Zaten planlanmış bir maçın var.');
 if(!Number.isInteger(tier)||tier<0||tier>3||!validEnemy(enemy))throw Error('Geçersiz maç teklifi.');
 migrate(s);
 s.camp={tier,enemy:{name:enemy.name,style:enemy.style,skills:{...enemy.skills}},bookedAt:s.hours,dueAt:s.hours+168,prep:emptyPrep(),sessions:0};
 return `${enemy.name} ile maçın 7 oyun günü sonra. Hazırlık kampı başladı.`;
}

export function cancel(s){
 if(activeFight(s))throw Error('Başlayan maç iptal edilemez.');
 if(!s.camp)throw Error('İptal edilecek maç yok.');
 s.camp=null;
 return 'Maç iptal edildi. Rakibe özel hazırlık sıfırlandı; öğrendiğin teknikler sende kaldı.';
}

export function assertTraining(s){
 if(activeFight(s))throw Error('Önce devam eden maçı tamamla.');
 if(s.camp&&remaining(s)===0)throw Error('Maç günü geldi. Dinlenebilir, yemek yiyebilir veya maça çıkabilirsin.');
 if((s.fatigue??0)>=85)throw Error('Antrenman yükün çok yüksek. Önce uyu veya dinlen.');
}

export function trainingMultiplier(s){return dailyFactor(s)*readiness(s)}

// Call after a successful one-hour training session. Count the day it began.
export function onTraining(s,key){
 const startedDay=Math.floor(Math.max(0,s.hours-1)/24)+1;
 const count=s.trainingDay?.day===startedDay?s.trainingDay.count:0;
 migrate(s);
 s.trainingDay={day:startedDay,count:count+1};
 s.fatigue=clamp(s.fatigue+12+2*Math.min(count,4));
 if(s.camp)s.camp.sessions++;
}

export function trainFocus(s,key){
 if(!Object.hasOwn(FOCUSES,key))throw Error('Geçersiz kamp çalışması.');
 if(!s.camp)throw Error('Rakibe özel çalışma için önce bir maç planla.');
 if(s.camp.prep[key]>=100)throw Error('Bu maç için hazırlığın tamamlandı. Başka bir odağa çalışabilir veya dinlenebilirsin.');
 assertTraining(s);
 if(s.energy<20||s.food<20||s.sleep<15||s.health<35)throw Error('Kamp çalışması için 20 enerji, 20 tokluk, 15 dinçlik ve 35 sağlık gerekiyor.');
 const focus=FOCUSES[key],gain=Math.min(100-s.skills[focus.skill],.22*trainingMultiplier(s)),prep=18*dailyFactor(s),oldPrep=s.camp.prep[key];
 s.skills[focus.skill]=clamp(s.skills[focus.skill]+gain);
 s.hours+=1;s.energy=clamp(s.energy-18);s.food=clamp(s.food-11);s.sleep=clamp(s.sleep-9);s.sessions++;
 s.camp.prep[key]=clamp(oldPrep+prep);
 onTraining(s,key);
 return `${focus.name}: hazırlık +${(s.camp.prep[key]-oldPrep).toFixed(1)} · ${STYLE_NAMES[focus.skill]} +${gain.toFixed(2)}.`;
}

// Resource costs and elapsed time belong to the engine's recovery action.
export function recover(s,action){
 if(action!=='sleep'&&action!=='rest')return;
 s.fatigue=clamp((s.fatigue??0)-(action==='sleep'?40:14));
}

export function wait(s){
 if(activeFight(s))throw Error('Önce devam eden maçı tamamla.');
 if(!s.camp)throw Error('Beklemek için önce bir maç planla.');
 const hours=remaining(s);
 if(hours===0)throw Error('Maç günü geldi. Hazır değilsen önce dinlen veya yemek ye.');
 migrate(s);
 s.hours=s.camp.dueAt;
 s.food=clamp(s.food-Math.min(65,hours*.55));
 s.energy=clamp(s.energy+Math.min(75,hours*.5));
 s.sleep=clamp(s.sleep+Math.min(90,hours*.6));
 s.fatigue=clamp(s.fatigue-Math.min(100,hours*2.5));
 return 'Maç gününe kadar dinlendin. Tokluğunu kontrol et; hazır olunca maça çıkabilirsin.';
}

export function combatBoost(s){return Object.fromEntries(focusKeys.map(key=>[key,(s.camp?.prep?.[key]??0)/100]))}

export function scouting(s,enemy){
 if(!validEnemy(enemy))throw Error('Rakip bilgisi bulunamadı.');
 const ranked=[...STYLES].sort((a,b)=>enemy.skills[b]-enemy.skills[a]);
 const strongest=ranked[0],weakest=ranked.at(-1);
 const focus=enemy.style==='bjj'?'groundEscape':enemy.style==='wrestling'?'takedownDefense':'distance';
 const recommendations={
  boxing:'Mesafe ve gard çalış; yumruk alışverişinde acele etme. Güreşin iyiyse maçı yere taşımayı değerlendir.',
  kickboxing:'Mesafe ve gard çalış; tekme menzilinde sabit kalma. Yakın mesafe veya güçlü yer oyununla karşılık ver.',
  wrestling:'Yere alınma savunmasına hazırlan. Ayakta kalmak istiyorsan güreş ve kondisyonunu ihmal etme.',
  bjj:'Yerden kaçış çalış. Yerde uzun süre kalmaktan kaçın; ayakta güçlü olduğun stili kullan.'
 };
 return {strength:`${STYLE_NAMES[strongest]} · ${Math.round(enemy.skills[strongest])}`,weakness:`${STYLE_NAMES[weakest]} · ${Math.round(enemy.skills[weakest])}`,recommendation:recommendations[enemy.style],focus};
}
