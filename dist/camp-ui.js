import * as E from './engine.js?v=0.5.0';
import * as C from './camp.js?v=0.5.0';

const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₺'+Math.round(n).toLocaleString('tr-TR');
const button=(text,action,value='',kind='',disabled=false)=>`<button class="${kind}" data-action="${action}" data-value="${esc(value)}" ${disabled?'disabled':''}>${text}</button>`;
const section=(title,note='')=>`<div class="section-head"><h2>${title}</h2><span>${note}</span></div>`;
export const dateTime=hours=>`${Math.floor(hours/24)+1}. gün · ${String(Math.floor(hours%24)).padStart(2,'0')}:${hours%1?'30':'00'}`;
export const fatigueLabel=s=>s.fatigue>=70?'Yüksek yük':s.fatigue>=40?'Toparlanma gerekli':s.fatigue>=20?'Orta yük':'Dinlenmiş';
export function timeLeft(s){if(s.fight&&!s.fight.done)return 'Maç sürüyor';if(!s.camp)return 'Kamp yok';const hours=Math.max(0,s.camp.dueAt-s.hours);return hours<=0?'Maç günü':`${Math.floor(hours/24)} gün ${Math.ceil(hours%24)} sa kaldı`;}
export function fightingStyle(s){const key=['boxing','kickboxing','wrestling','bjj'].sort((a,b)=>s.skills[b]-s.skills[a])[0];return E.LABELS[key];}

export function campBanner(s){
 if(s.fight&&!s.fight.done)return '';
 if(!s.camp)return `<div class="camp-strip"><div><strong>Bir sonraki maçını planla.</strong><span>7 oyun günü hazırlan. Rakibini tanı, tekniğini seç.</span></div>${button('Maç teklifleri','nav','fight','ghost')}</div>`;
 const ready=s.hours>=s.camp.dueAt;
 return `<div class="camp-strip ${ready?'camp-ready':''}"><div><span>${ready?'MAÇ GÜNÜ GELDİ':'AKTİF KAMP'} · ${esc(timeLeft(s))}</span><strong>${esc(s.camp.enemy.name)}</strong><span>${dateTime(s.camp.dueAt)} · ${E.LEAGUES[s.camp.tier].name}</span></div>${button(ready?'Maça hazırlan':'Kampı gör','camp','',ready?'primary':'ghost')}</div>`;
}

export function scouting(s,enemy){
 const advice=C.scouting(s,enemy),skills=['boxing','kickboxing','wrestling','bjj','stamina','strength'],meetings=s.history.filter(h=>h.name===enemy.name).slice(0,3);
 return `<article class="scout-panel"><div class="scout-heading"><div><span class="eyebrow">RAKİP DOSYASI</span><h2>${esc(enemy.name)}</h2></div><span class="style-badge">${E.LABELS[enemy.style]}</span></div><p class="scout-key"><span>Sen</span><span>Rakip</span></p><div class="scout-stats">${skills.map(k=>`<div class="scout-stat"><span>${E.LABELS[k]}</span><strong>${Math.floor(s.skills[k])}<i>/</i><b>${Math.round(enemy.skills[k])}</b></strong><div class="compare-bars"><i style="width:${s.skills[k]}%"></i><b style="width:${enemy.skills[k]}%"></b></div></div>`).join('')}</div><div class="scout-notes"><p><strong>Güçlü yönü</strong>${esc(advice.strength)}</p><p><strong>Fırsatın</strong>${esc(advice.weakness)}</p></div><div class="coach-note"><span class="eyebrow">${s.coach?esc(E.COACHES[s.coach].name)+' · KÖŞE NOTU':'KENDİ ANALİZİN'}</span><p>${esc(advice.recommendation)}</p></div><div class="scout-meetings"><span class="eyebrow">ÖNCEKİ KARŞILAŞMALARINIZ</span>${meetings.length?meetings.map(h=>`<p>${h.day}. gün · ${E.LEAGUES[h.tier].name}<strong class="${h.won?'win':'loss'}">${h.draw?'Berabere':h.won?'Kazandın':'Kaybettin'} · ${esc(h.method)}</strong></p>`).join(''):'<p>Bu rakiple ilk karşılaşman. Henüz bir maç kaydın yok.</p>'}</div></article>`;
}

export function campOverview(s){
 const c=s.camp,ready=s.hours>=c.dueAt,elapsed=Math.max(0,s.hours-c.bookedAt),progress=Math.min(100,elapsed/168*100);
 return `<span class="eyebrow">${ready?'MAÇ GÜNÜ':'7 GÜNLÜK HAZIRLIK KAMPI'}</span><h2>${esc(c.enemy.name)}</h2><p class="camp-countdown">${ready?'Kafes seni bekliyor.':esc(timeLeft(s))}</p><p>${dateTime(c.dueAt)} · ${E.LEAGUES[c.tier].name}</p><div class="camp-timeline" aria-label="Kampın yüzde ${Math.round(progress)} kadarı geçti">${Array.from({length:7},(_,i)=>`<span class="${elapsed>=(i+1)*24?'past':Math.floor(elapsed/24)===i?'today':''}">${i+1}<small>GÜN</small></span>`).join('')}</div><div class="camp-readiness"><div class="row"><span>Antrenman yükü</span><strong>${Math.round(s.fatigue)} / 100</strong></div><div class="bar fatigue-bar"><i style="width:${s.fatigue}%"></i></div><p>${fatigueLabel(s)} · Yüke bağlı verim %${Math.round(C.readiness(s)*100)}</p></div><p>${ready?'Maç seni bekler; yemek yiyip dinlenebilirsin. Yeni antrenman için önce bu maçı tamamla veya kampı iptal et.':'Süre yalnız oyun içindeki eylemlerle ilerler. Son günü toparlanmaya ayır; yüksek yük maçtaki performansını düşürür.'}</p><div class="camp-actions">${ready?button('Kafese gir','start',c.tier,'primary'):button('Antrenmana git','nav','train','primary')}${ready?button('Yemek & dinlenme','recovery','','ghost'):button('Kalan süreyi dinlen','camp-wait','','ghost')}</div><small class="help-text">${ready?'Giriş: enerji ≥35 · tokluk ≥25 · dinçlik ≥25 · sağlık ≥50.':'Kalan süreyi dinlen: maç saatine ilerler; tokluk azalır, beceri kazanılmaz.'}</small>${button('Kampı iptal et','camp-cancel','','text-button')}`;
}

export function prepCards(s){
 if(!s.camp)return '';
 const recommended=C.scouting(s,s.camp.enemy).focus;
 return section('Rakibe özel hazırlık','BU MAÇA ÖZEL')+`<p class="section-intro">Genel becerinin yanında, bu rakibe karşı kullanacağın savunmayı çalış. Hazırlık puanları yalnız bu maç için geçerli.</p><div class="cards prep-cards">${Object.entries(C.FOCUSES).map(([key,f])=>`<article class="card ${recommended===key?'recommended':''}"><span class="tag">${recommended===key?'KÖŞENİN ÖNERİSİ':'HEDEFLİ ÇALIŞMA'}</span><h3>${esc(f.name)}</h3><p>${esc(f.description)}</p><div class="row"><span class="muted">Hazırlık</span><strong>${Math.round(s.camp.prep[key])} / 100</strong></div><div class="bar"><i style="width:${s.camp.prep[key]}%"></i></div><span class="cost">1 sa · Ücretsiz<br>−18 enerji · −11 tokluk · −9 dinçlik</span>${button('Odaklı çalış','focus',key,'',s.hours>=s.camp.dueAt||s.camp.prep[key]>=100||s.fatigue>=85)}</article>`).join('')}</div>`;
}

export function loadout(s){
 const equipped=s.loadout||[],active=!!s.fight&&!s.fight.done;
 const available=E.MOVES.filter(m=>s.moves[m.id]>=2||s.skills[m.skill]>=m.level),locked=E.MOVES.filter(m=>!available.includes(m));
 const card=m=>{const learned=s.moves[m.id]>=2,selected=equipped.includes(m.id),unlocked=s.skills[m.skill]>=m.level;return `<article class="card ${selected?'equipped':''}"><div class="card-top"><span class="tag">${E.LABELS[m.skill]}</span><small>${selected?'SEÇİLİ':learned?'ÖĞRENİLDİ':unlocked?'ÇALIŞILABİLİR':'KİLİTLİ'}</small></div><h3>${m.name}</h3><p>${learned?'Uygun pozisyonda otomatik uygulanır.':`${E.LABELS[m.skill]} ${m.level} seviye · ${s.moves[m.id]||0}/2 çalışma`}</p>${learned?button(selected?'Setten çıkar':'Sete ekle','equip',m.id,selected?'ghost':'',active||!selected&&equipped.length>=4):button(unlocked?'Hareketi çalış':'Seviye '+m.level+' gerekli','move',m.id,'',active||!unlocked||s.fatigue>=85||!!s.camp&&s.hours>=s.camp.dueAt)}</article>`};
 return section('Maç tekniklerin',`${equipped.length} / 4 SEÇİLİ`)+`<div class="loadout-panel"><p>En fazla dört öğrendiğin tekniği seç. Temel yumruk, tekme ve pozisyon mücadelesi her zaman kullanılabilir. Seçtiklerin uygun pozisyonda devreye girer.</p><div class="loadout-slots">${Array.from({length:4},(_,i)=>{const move=E.MOVES.find(m=>m.id===equipped[i]);return `<span class="${move?'filled':''}"><small>0${i+1}</small>${move?esc(move.name):'Boş yer'}</span>`}).join('')}</div><p class="help-text">${active?'Teknik setin bu maç için kilitli.':'Boks teknikleri ayakta, güreş ve BJJ teknikleri ilgili pozisyonlarda etkilidir.'}</p></div>${available.length?`<div class="cards technique-cards">${available.map(card).join('')}</div>`:'<p class="section-intro">İlk teknikler ilgili beceri 25 seviyeye geldiğinde çalışılabilir. Şimdilik temel hareketlerinle dövüşebilirsin.</p>'}${locked.length?`<details class="technique-unlocks"><summary>Gelecek teknikler <span>${locked.length} hareket</span></summary><div class="cards">${locked.map(card).join('')}</div></details>`:''}`;
}

export function offers(s){
 const unlocked=E.league(s);
 return section('Maç teklifleri','7 GÜN HAZIRLIK')+`<div class="cards offer-cards">${E.LEAGUES.map((g,i)=>{const enemy=E.opponent(s,i),open=i<=unlocked;return `<article class="card"><span class="eyebrow">${open?g.name.toLocaleUpperCase('tr-TR'):'KİLİTLİ · '+g.name.toLocaleUpperCase('tr-TR')}</span><h3>${esc(enemy.name)}</h3><p>${E.LABELS[enemy.style]} ağırlıklı<br>${esc(g.venue.toLocaleLowerCase('tr-TR'))}</p><span class="cost">Zafer ${money(g.purse)} · Katılım ${money(g.loss)}<br>Maç: ${dateTime(s.hours+168)}</span><p>${open?i<unlocked?'Alt lig maçı gelir sağlar; üst lige ilerletmez.':'Rakip ve tarih kabul ettiğinde sabitlenir.':`${E.LEAGUES[i-1].name} içinde ${E.PROMOTION_WINS[i-1]} galibiyet gerekli.`}</p>${button('Maçı kabul et','book',i,'',!open)}</article>`}).join('')}</div><div class="notice">Her maçtan önce 7 oyun günü hazırlık yaparsın. Tarih geldiğinde maç seni bekler; gerçek dünyada gün sayılmaz. Kabul edilen maçın rakibini ve savunma önerilerini kamp ekranında inceleyebilirsin.</div>`;
}

export function fightPreparation(s){
 const f=s.fight,moves=f.playerMoves||s.loadout||[];
 return `<details class="fight-history"><summary>Maça hazırlığın <span class="help-text">${UIStyle(s)} · ${moves.length}/4 teknik</span></summary><div class="fight-prep-summary"><p>Seçili teknikler: ${moves.length?moves.map(id=>E.MOVES.find(m=>m.id===id)?.name).map(esc).join(', '):'Temel hareketler'}</p>${f.prep?`<p>Yere alınma savunması %${Math.round(f.prep.takedownDefense*100)} · Mesafe %${Math.round(f.prep.distance*100)} · Yerden kaçış %${Math.round(f.prep.groundEscape*100)}</p><p>Bu puanlar kamp hazırlığını gösterir; kesin kazanma olasılığı değildir. Maç boyunca hazırlığın ve teknik setin sabit kalır.</p>`:'<p>Bu maç önceki sürümde başlamış. Kamp sistemi sonraki maçında devreye girecek.</p>'}</div></details>`;
}
const UIStyle=s=>esc(fightingStyle(s));
