import * as W from './world.js?v=0.5.0';
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=n=>'₺'+Math.round(n).toLocaleString('tr-TR');
const labels={boxing:'Boks',kickboxing:'Kickboks',wrestling:'Güreş',bjj:'BJJ',stamina:'Kondisyon',strength:'Kuvvet'};
const section=(title,note='')=>`<div class="section-head"><h2>${title}</h2><span>${note}</span></div>`;
const button=(label,id,disabled=false,kind='')=>`<button class="${kind}" data-action="world" data-value="${esc(id)}" ${disabled?'disabled':''}>${label}</button>`;
const day=s=>Math.floor(s.hours/24)+1;
const world=s=>s.world||{reputation:0,home:0,sponsor:null,notice:'Mahalle henüz adını bilmiyor. Bir antrenman, bir karşılaşma, bir yeni bağlantı.'};

function costs(s,choice){
 const p=W.choicePreview(s,choice),gains=[p.reward?`+${money(p.reward)}`:'',p.rep?`+${p.rep} itibar`:'',...Object.entries(p.skills).map(([key,n])=>`+${n.toFixed(2)} ${labels[key]}`)].filter(Boolean);
 return `<p class="world-choice-cost">${p.hours} sa${p.cash?' · '+money(p.cash):' · Ücretsiz'}<br>−${p.energy} enerji · −${p.food} tokluk · −${p.sleep} dinçlik${p.health?'<br><strong>−'+p.health+' sağlık</strong>':''}${p.fatigue?' · Yük +'+p.fatigue:''}</p><p class="gain-preview">${gains.map(esc).join(' · ')}</p>`;
}

function cityMap(s){
 const w=world(s),home=W.HOMES[w.home],roof=w.home===2?92:w.home===1?68:120,height=w.home===2?98:w.home===1?122:70;
 const windows=(x,y,columns,rows)=>Array.from({length:rows},(_,row)=>Array.from({length:columns},(_,col)=>`<rect x="${x+col*22}" y="${y+row*22}" width="10" height="12" rx="1" fill="${row%2?'#63765b':'#bbd88d'}"/>`).join('')).join('');
 return `<div class="city-map city-map-visual"><div class="city-map-heading"><span class="eyebrow">ŞEHİR HARİTASI</span><span>${day(s)}. gün · ${w.reputation} itibar</span></div><svg class="city-illustration" viewBox="0 0 900 360" role="img" aria-label="Evin, mahallenin salonu, meydan ve maç alanı"><defs><pattern id="city-grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#23332b" stroke-width=".8"/></pattern></defs><rect width="900" height="360" rx="20" fill="#15231d"/><rect width="900" height="360" rx="20" fill="url(#city-grid)"/><path d="M0 236H900M310 0V360M622 0V360" stroke="#34483a" stroke-width="34"/><path d="M0 236H900M310 0V360M622 0V360" stroke="#879378" stroke-width="2" stroke-dasharray="10 14"/><path d="M0 211H900M0 261H900" stroke="#688455" stroke-width="2" opacity=".5"/><g fill="#243b2b"><circle cx="45" cy="87" r="26"/><circle cx="260" cy="66" r="30"/><circle cx="552" cy="54" r="27"/><circle cx="673" cy="58" r="25"/><circle cx="854" cy="306" r="31"/><circle cx="63" cy="311" r="24"/></g><g><rect x="${w.home===2?91:103}" y="${roof}" width="${w.home===2?154:128}" height="${height}" rx="5" fill="${w.home===2?'#778777':'#536250'}"/><path d="M91 ${roof}L117 ${roof-21}H218L242 ${roof}Z" fill="${w.home===2?'#b9d4a1':'#879567'}"/>${windows(122,roof+17,w.home===2?5:4,w.home===1?4:2)}<rect x="158" y="161" width="24" height="29" fill="#213c2b"/><rect x="79" y="190" width="175" height="8" rx="4" fill="#657454"/></g><g><rect x="389" y="92" width="151" height="105" rx="5" fill="#526758"/><path d="M378 92L395 66H531L551 92Z" fill="#a4b381"/><rect x="409" y="108" width="111" height="31" rx="3" fill="#1c2f24"/><text x="465" y="130" text-anchor="middle" fill="#d8efb7" font-size="21" font-family="sans-serif" font-weight="700">GYM</text><rect x="443" y="153" width="43" height="44" fill="#233c2c"/><path d="M395 153H426M501 153H531" stroke="#97ac83" stroke-width="12"/></g><g><path d="M706 97L764 68L826 97L847 161L814 198H716L683 161Z" fill="#53694d"/><path d="M723 111L766 88L810 111L826 158L804 180H729L704 158Z" fill="#172b20" stroke="#b9dc83" stroke-width="3"/><path d="M723 111L804 180M810 111L729 180" stroke="#455b3d" stroke-width="2"/><circle cx="765" cy="140" r="20" fill="#b8d785"/><text x="765" y="146" text-anchor="middle" fill="#1d3121" font-size="16" font-family="sans-serif" font-weight="700">MMA</text></g><g><rect x="377" y="284" width="189" height="48" rx="22" fill="#516c40"/><circle cx="472" cy="307" r="21" fill="#95b06f"/><circle cx="472" cy="307" r="12" fill="#537b76"/><path d="M396 304H425M519 304H547" stroke="#bbbe81" stroke-width="7"/><circle cx="360" cy="296" r="8" fill="#b8d48a"/><circle cx="586" cy="324" r="8" fill="#b8d48a"/></g></svg><div class="city-landmarks"><button class="city-landmark" style="--x:19%;--y:48%" data-action="nav" data-value="home"><small>EVİN</small><strong>${esc(home.name)}</strong></button><button class="city-landmark" style="--x:52%;--y:48%" data-action="nav" data-value="gym"><small>SALON & EKİP</small><strong>Gym'e git</strong></button><button class="city-landmark" style="--x:85%;--y:48%" data-action="nav" data-value="fight"><small>MAÇ ALANI</small><strong>Kafese giden yol</strong></button><button class="city-landmark city-landmark-community" style="--x:52%;--y:87%" data-action="city-events"><small>MAHALLE MEYDANI</small><strong>Günün fırsatları</strong></button></div><div class="city-map-links"><button class="ghost" data-action="city-tab" data-value="sponsors">Sponsorları gör</button><button class="ghost" data-action="city-tab" data-value="homes">Evini yükselt</button></div></div>`;
}

function durationLabel(event){
 const hours=event.choices.map(choice=>choice.hours),min=Math.min(...hours),max=Math.max(...hours);
 return (min===max?min.toLocaleString('tr-TR'):min.toLocaleString('tr-TR')+'–'+max.toLocaleString('tr-TR'))+' oyun saati';
}

function board(s){
 const taken=W.opportunityTaken(s);
 return `${cityMap(s)}<section id="city-events" class="city-events" aria-label="Günün şehir fırsatları">${section('Bugün şehirde',day(s)+'. GÜN · 1 FIRSAT')}<p class="section-intro">${taken?'Bugünkü fırsatını kullandın. Yeni seçenekler yarın açılır.':'Üç fırsattan birini seç. İnceleyerek seçenekleri ve kaynak tüketimini görebilirsin.'}</p><div class="city-grid">${W.opportunities(s).map(event=>`<article class="card world-card world-event-preview"><span class="eyebrow">${esc(event.location)}</span><h3>${esc(event.name)}</h3><p>${esc(event.description)}</p><div class="row"><span class="help-text">${event.choices.length} seçenek · ${taken?'Bugün tamamlandı':durationLabel(event)}</span><button class="ghost" data-action="city-event" data-value="${esc(event.id)}" aria-label="${esc(event.name)} etkinliğini incele">İncele</button></div></article>`).join('')}</div></section><p class="world-notice" role="status">${esc(world(s).notice)}</p>`;
}

function sponsors(s){
 const w=world(s),busy=!!s.fight&&!s.fight.done;
 return `<section aria-label="Sponsor anlaşmaları">${section('Sponsorlar','1 AKTİF ANLAŞMA')}<p class="section-intro">Anlaşma ücretsiz. Destek, maç sonucundan bağımsız olarak belirtilen liglerde ve oyun gününde en fazla bir kez ödenir.</p><div class="cards sponsor-cards">${W.SPONSORS.map(sponsor=>{
  const selected=w.sponsor===sponsor.id,locked=w.reputation<sponsor.reputation;
  return `<article class="card world-card ${selected?'equipped':''}"><div class="card-top"><span class="tag">${selected?'SPONSORUN':sponsor.reputation+' İTİBAR GEREKLİ'}</span><strong class="gain-preview">+${money(sponsor.payout)}</strong></div><h3>${esc(sponsor.name)}</h3><p>${esc(sponsor.description)}</p><span class="cost">Anlaşma ücretsiz · Uygun maç başına ödeme</span>${button(selected?'Sponsorun':locked?'İtibar '+sponsor.reputation+' gerekli':'Anlaşma yap','sponsor:'+sponsor.id,busy||selected||locked,selected?'ghost':'primary')}</article>`;
 }).join('')}</div><p class="help-text">Yeni anlaşma öncekinin yerini alır. Daha düşük bir ligde oynarsan o sponsorun ödeme şartı karşılanmayabilir.</p>${w.sponsor?`<div class="inline-actions">${button('Anlaşmayı bitir','sponsor:none',busy,'ghost')}</div>`:''}</section>`;
}

function homes(s){
 const w=world(s),busy=!!s.fight&&!s.fight.done;
 return `<section aria-label="Ev yükseltmeleri">${section('Yaşam alanın','KALICI YÜKSELTME')}<p class="section-intro">Evini sırayla yükselt. Satın alma bir kez ödenir; düzenli kira veya kesinti yoktur.</p><div class="cards home-cards">${W.HOMES.map(home=>{
  const selected=w.home===home.id,owned=w.home>home.id,repLocked=w.reputation<home.reputation,previousLocked=home.id!==w.home+1;
  const label=repLocked?'İtibar '+home.reputation+' gerekli':previousLocked?'Önce kendi dairene geç':'Taşın · '+money(home.price);
  return `<article class="card world-card ${selected?'equipped':''}"><span class="tag">${selected?'EVİNDESİN':owned?'TAMAMLANDI':home.reputation+' İTİBAR GEREKLİ'}</span><h3>${esc(home.name)}</h3><p>${esc(home.description)}</p><span class="cost">${home.id?money(home.price)+' · Bir kez ödenir':'Başlangıç evin · Ücretsiz'}</span>${home.id>w.home?button(label,'home:'+home.id,busy||previousLocked||repLocked,'primary'):`<span class="help-text">${selected?'Mevcut yaşam alanın':'Tamamlanan yaşam basamağı'}</span>`}</article>`;
 }).join('')}</div><p class="help-text">Ev avantajları normal uyku ve dinlenmeye eklenir. Enerji ve sağlık 100, antrenman yükü 0 sınırını aşmaz.</p></section>`;
}

export function eventDetails(s,id){
 const event=W.opportunities(s).find(event=>event.id===id);
 if(!event)return '<div class="world-event-details"><h2>Bu fırsat bugün açık değil.</h2><p>Şehir panosunu yenileyerek günün seçeneklerini görebilirsin.</p></div>';
 const taken=W.opportunityTaken(s),busy=!!s.fight&&!s.fight.done;
 return `<div class="world-event-details"><span class="eyebrow">${esc(event.location)}</span><h2>${esc(event.name)}</h2><p>${esc(event.description)}</p><p class="help-text">${taken?'Bugünkü şehir fırsatını kullandın. Bu seçeneklere bugün tekrar katılamazsın.':'Bir seçeneğe katılmak bugünkü şehir fırsatını kullanır. Aşağıdaki kaynaklar seçtiğin anda harcanır.'}</p><div class="world-choices">${event.choices.map(choice=>{
  const due=choice.training&&s.camp&&s.hours>=s.camp.dueAt,loaded=choice.training&&s.fatigue>=85;
  const minimums={energy:Math.max(choice.energy,choice.training?20:0),food:Math.max(choice.food,choice.training?20:0),sleep:Math.max(choice.sleep,choice.training?15:0),health:choice.health?45:choice.training?35:0};
  const insufficient=Object.entries(minimums).some(([key,n])=>s[key]<n)||s.cash<choice.cash;
  const requirement=`En az ${minimums.energy} enerji · ${minimums.food} tokluk · ${minimums.sleep} dinçlik${minimums.health?' · '+minimums.health+' sağlık':''}`;
  const reason=busy?'Önce devam eden maçı tamamla.':taken?'Bugünkü fırsatını kullandın.':due?'Maç günü geldi. Antrenman içeren etkinlikler maçtan sonra açılır.':loaded?'Antrenman yükün yüksek. Önce dinlen veya uyu.':insufficient?'Kaynakların bu seçim için yeterli değil.':'';
  return `<article class="world-choice"><h3>${esc(choice.label)}</h3><p>${esc(choice.description)}</p>${costs(s,choice)}<p class="help-text">${requirement}</p>${reason?`<p class="world-choice-status">${reason}</p>`:''}${button(taken?'Bugün tamamlandı':choice.label,'event:'+event.id+':'+choice.id,!!reason,'primary')}</article>`;
 }).join('')}</div></div>`;
}

export function renderCity(s,tab='board'){
 const w=world(s),home=W.HOMES[w.home],sponsor=W.SPONSORS.find(sponsor=>sponsor.id===w.sponsor);
 const activeTab=['board','sponsors','homes'].includes(tab)?tab:'board';
 const context=`<div class="city-summary"><span class="eyebrow">ŞEHİRDEKİ HAYATIN</span><div class="row"><strong>${w.reputation} itibar</strong><span>${day(s)}. gün</span></div><p>${esc(home.name)}<br>${sponsor?esc(sponsor.name):'Henüz sponsorun yok'}</p></div>`;
 const titles={board:'Şehirde <em>bugün ne var?</em>',sponsors:'Yoluna <em>destek bul.</em>',homes:'Kendine <em>yer aç.</em>'};
 return {context,content:({board,sponsors,homes}[activeTab])(s),title:titles[activeTab]};
}
