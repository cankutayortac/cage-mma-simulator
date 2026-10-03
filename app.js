import {createScene} from './scene.js?v=0.5.0';
import {FightClock,eventReadingMs} from './playback.js?v=0.5.0';
import * as E from './engine.js?v=0.5.0';
import * as C from './camp.js?v=0.5.0';
import * as UI from './camp-ui.js?v=0.5.0';
import * as World from './world.js?v=0.5.0';
import * as Objectives from './objectives.js?v=0.5.0';
import {renderCity,eventDetails} from './world-ui.js?v=0.5.0';
import * as Activity from './activity.js?v=0.5.0';
import * as V from './views.js?v=0.5.0';
import {report,needsRoundBreak} from './match-report.js?v=0.5.0';
import {createAudio} from './audio.js?v=0.5.0';
const $=id=>document.getElementById(id),{esc,money,button:btn,section}=V;
let s=E.initial(),saveProblem='',view='home',speed=1,paused=false,toastTimer,clickAnchor=null,keyboardInput=false;
let trainTab='sessions',trainFilter='technique',cityTab='board',careerTab='ladder',fightTab='camp',fightTier=0;
let drill=null,drillSequence=0,sheetKind='',sheetResume=false,soundOn=false;
const scrollPositions={},audio=createAudio();
try{soundOn=localStorage.getItem('cage-sound')==='on';const raw=localStorage.getItem(E.KEY);if(raw){const loaded=JSON.parse(raw);if(E.validSave(loaded))s=E.migrate(loaded);else saveProblem='Kayıt okunamadı. Ayarlar’dan yeni kariyer başlatabilirsin.';}}catch{saveProblem='Cihaz kaydına erişilemiyor. Bu oturumda oynayabilirsin.';}
audio.set(soundOn);fightTier=E.league(s);
let scene;try{scene=createScene($('scene'));}catch{scene={set(){},rotate(){}};$('scene').innerHTML='<p class="notice">3B sahne açılamadı. Sayfayı yenilemeyi dene.</p>';}
const icons={home:'<path d="M12 3 3 10v11h6v-7h6v7h6V10Z"/>',train:'<path d="M3 8v8m4-11v14m10-14v14m4-11v8M7 12h10"/>',fight:'<path d="M8 3h8l5 5v8l-5 5H8l-5-5V8Zm1 5 6 8m0-8-6 8"/>',city:'<path d="M2 21h20M4 21V9h6v12m1 0V3h8v18M6 12v2m8-8v2m3-2v2m-3 3v2m3-2v2"/>',career:'<path d="M7 3h10v5a5 5 0 0 1-10 0ZM7 5H3v3a5 5 0 0 0 5 5M17 5h4v3a5 5 0 0 1-5 5M12 13v7m-5 1h10"/>'};
const icon=key=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[key]||icons.train}</svg>`;
function toast(message){$('toast').textContent=message;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),4200);}
function save(){if(saveProblem)return;try{localStorage.setItem(E.KEY,JSON.stringify(s));$('save-status').textContent='Kaydedildi · '+E.day(s)+'. gün';}catch{saveProblem='Kayıt yapılamadı. Ayarlar’dan ilerlemeni dışa aktar.';toast(saveProblem);}}
function captureViewport(button){const region=button?.closest('#navigation,#context,#content,#page-tools,#camp-banner');const matches=region&&button?.dataset.action?[...region.querySelectorAll('[data-action]')].filter(b=>b.dataset.action===button.dataset.action&&b.dataset.value===button.dataset.value):[];return {y:scrollY,region:region?.id,action:button?.dataset.action,value:button?.dataset.value,index:matches.indexOf(button),offset:button?.getBoundingClientRect().top,keyboard:keyboardInput&&document.activeElement===button};}
function restoreViewport(snapshot){const region=snapshot.region&&$(snapshot.region),match=region&&[...region.querySelectorAll('[data-action]')].filter(b=>b.dataset.action===snapshot.action&&b.dataset.value===snapshot.value)[snapshot.index];window.scrollTo({top:Math.max(0,match?scrollY+match.getBoundingClientRect().top-snapshot.offset:snapshot.y),behavior:'instant'});if(snapshot.keyboard&&match&&!match.disabled)match.focus({preventScroll:true});}
const playback=new FightClock({onStep(){if(!s.fight||s.fight.done)return false;E.stepFight(s);save();updateFight();if(s.fight.done){audio.play('bell');return false;}if(needsRoundBreak(s.fight)){paused=true;playback.pause();openRoundBreak();return false;}if(s.fight.last.outcome==='hit')audio.play('hit');return true;},getDelay:()=>eventReadingMs(s.fight?.log)});
function runTimer(reset=false){if(reset)playback.reset();playback.setRate(speed);const playing=!!s.fight&&!s.fight.done&&!paused&&!document.hidden;scene.set({paused:document.hidden||!!s.fight&&!s.fight.done&&!playing,playbackRate:speed,visible:!!drill||view==='home'||view==='fight'&&!!s.fight});if(playing)playback.resume();else playback.pause();}
function syncFightControls(){document.querySelectorAll('[data-action="pause"]').forEach(b=>b.textContent=paused?'Devam':'Duraklat');document.querySelectorAll('[data-action="speed"]').forEach(b=>b.textContent=speed===.5?'0,5×':speed===1?'1×':'2×');scene.set({paused:paused||document.hidden,playbackRate:speed});}
function renderVitals(){
 $('cash').textContent=money(s.cash);
 $('vitals').innerHTML=[['energy','Enerji'],['food','Tokluk'],['sleep','Dinçlik'],['health','Sağlık']].map(([key,label])=>`<button class="vital" data-action="recovery" aria-label="${label} ${Math.round(s[key])}/100. İhtiyaçları aç"><span>${label}<b>${Math.round(s[key])}</b></span><i class="bar"><i style="width:${s[key]}%"></i></i></button>`).join('')+`<div class="vital-footer"><span><i class="status-dot ${s.fatigue>=60?'warning':''}"></i>Yük ${Math.round(s.fatigue)} · ${UI.fatigueLabel(s)}</span><span>${s.camp?UI.timeLeft(s):s.fight&&!s.fight.done?'Maç sürüyor':E.LEAGUES[E.league(s)].name}</span></div>`;
}
function portraitSkills(){const names={boxing:'Boks',kickboxing:'Kickboks',wrestling:'Güreş',bjj:'BJJ',stamina:'Kondisyon',strength:'Kuvvet'};return '<span class="portrait-skills-title">YETENEKLER</span>'+Object.entries(names).map(([key,name])=>`<div class="portrait-skill"><span>${name}</span><b>${Math.floor(s.skills[key])}</b><i style="--skill:${s.skills[key]}%"></i></div>`).join('');}
function skillRows(){return `<div class="stats-grid">${Object.entries(E.LABELS).map(([key,name])=>`<div class="skill-row"><div class="row"><span>${name}</span><b>${s.skills[key].toFixed(1)} <small>/100</small></b></div><div class="bar"><i style="width:${s.skills[key]}%"></i></div></div>`).join('')}</div>`;}
function navigate(next){if(s.fight&&!s.fight.done&&next!=='fight'){toast('Önce devam eden maçı tamamla.');return;}if(next==='gym'){trainTab='gym';next='train';}if(next===view){render();return;}if(s.fight?.done){s.fight=null;playback.pause();save();}scrollPositions[view]=scrollY;view=next;render({preserve:false});window.scrollTo({top:scrollPositions[next]||0,behavior:'instant'});}
function render({preserve=true}={}){
 const snapshot=preserve?(clickAnchor||captureViewport()):null,fighting=view==='fight'&&!!s.fight,l=E.league(s);
 document.body.dataset.view=view;document.body.classList.toggle('is-fighting',fighting);document.body.classList.toggle('fight-complete',fighting&&s.fight.done);
 $('navigation').innerHTML=[['home','Merkez'],['train','Antrenman'],['fight','Dövüş'],['city','Şehir'],['career','Kariyer']].map(([key,name])=>`<button class="${view===key?'active':''}" data-action="nav" data-value="${key}" ${view===key?'aria-current="page"':''}>${icon(key)}<span>${name}</span>${key==='fight'&&s.camp?'<i class="nav-dot"></i>':''}</button>`).join('');
 $('cash').textContent=money(s.cash);$('date').innerHTML=`<b>${E.day(s)}. gün</b><span>${String(Math.floor(s.hours%24)).padStart(2,'0')}:${s.hours%1?'30':'00'}</span>`;renderVitals();
 $('chapter').textContent={home:'SOKAKTAN ZİRVEYE',train:'HER TEKRAR SAYILIR',fight:s.camp?'HAZIRLIK KAMPI':'FIGHT NIGHT',city:'KAFESİN DIŞINDA',career:'İSMİNİ YAZDIR'}[view];
 $('page-title').textContent={home:'Senin köşen.',train:'İşi burada yap.',fight:s.camp?'Maça hazırlan.':'Sıradaki sınav.',city:'Mahallende hayat var.',career:'Bir kariyer inşa et.'}[view];
 $('rank-badge').textContent=E.LEAGUES[l].name;$('page-tools').innerHTML='';$('camp-banner').innerHTML=view==='home'&&s.camp?UI.campBanner(s):'';
 $('stage-layout').hidden=!(view==='home'||fighting);$('stage-layout').classList.toggle('fight-stage',fighting);$('context').innerHTML='';$('fight-hud').innerHTML='';$('fight-overlay').innerHTML='';
 $('portrait-skills').innerHTML=portraitSkills();$('fighter-caption').innerHTML=`<div><span class="eyebrow">${UI.fightingStyle(s).toLocaleUpperCase('tr-TR')} · ${E.LEAGUES[l].name.toLocaleUpperCase('tr-TR')}</span><h2>${esc(s.name)}</h2><span>${s.wins} galibiyet · ${s.losses} mağlubiyet</span></div><strong>${(68+s.skills.strength*.17).toFixed(1)}<small>KG</small></strong>`;
 $('scene-label').textContent=E.GYMS[s.gym].name.toLocaleUpperCase('tr-TR');
 if(!drill)scene.set({visible:view==='home'||fighting,mode:fighting?'fight':'home',paused:fighting?paused:false,gym:s.gym,strength:s.skills.strength,phase:s.fight?.phase||'stand',home:s.world.home,playerStyle:E.style(s),enemyStyle:s.fight?.enemy.style||'boxing',tier:s.fight?.tier||0});
 let data;
 if(view==='home'){$('context').innerHTML=V.homeContext(s);$('content').innerHTML=V.homeContent(s);}
 if(view==='train')data=V.training(s,trainTab,trainFilter);
 if(view==='city'){data=renderCity(s,cityTab);data.tools=V.tabs([['board','Mahalle'],['sponsors','Sponsorlar'],['homes','Evler']],cityTab,'city-tab');}
 if(view==='career')data=V.career(s,careerTab);
 if(view==='fight'){if(fighting)fightPage();else data=V.fightLobby(s,Math.min(fightTier,E.league(s)),fightTab);}
 if(data){$('page-tools').innerHTML=data.tools||'';$('content').innerHTML=data.content;}
 if(saveProblem)$('save-status').textContent=saveProblem;
 if(snapshot)restoreViewport(snapshot);
}
function refreshTab(){render({preserve:false});window.scrollTo({top:0,behavior:'instant'});}
function sheetHeader(title,label=''){return `<div class="sheet-heading"><div>${label?`<span class="eyebrow">${label}</span>`:''}<h2>${title}</h2></div><button class="sheet-close" data-action="close" aria-label="Paneli kapat">×</button></div>`;}
function showSheet(html,kind='sheet'){
 if(!$('modal').open){sheetResume=!!s.fight&&!s.fight.done&&!paused;if(sheetResume){paused=true;runTimer();syncFightControls();}}
 sheetKind=kind;$('modal').className=kind==='drill'?'drill-modal':'sheet-modal';$('modal').innerHTML=html;if(!$('modal').open)$('modal').showModal();
}
function recoverySheet(){const oldScroll=sheetKind==='recovery'?$('modal').scrollTop:0;showSheet(sheetHeader('Yeniden hazır ol.','BESLENME & TOPARLANMA')+`<div class="recovery-vitals"><span>Enerji <b>${Math.round(s.energy)}</b></span><span>Tokluk <b>${Math.round(s.food)}</b></span><span>Dinçlik <b>${Math.round(s.sleep)}</b></span><span>Sağlık <b>${Math.round(s.health)}</b></span></div><p class="sheet-intro">${['Paylaşımlı oda','Kendi dairen','Sporcu evi'][s.world.home]} · Antrenman yükü ${Math.round(s.fatigue)}/100</p><div class="recovery-list">${[
 ['help','Mahalle mutfağı','+55 tokluk','Ücretsiz · Günde bir',s.helpDay===E.day(s)],
 ['meal','Sıcak öğün','+45 tokluk · +5 enerji','₺35 · 30 dk',s.cash<35],
 ['protein','Sporcu tabağı','+70 tokluk · +12 enerji · +8 sağlık','₺80 · 30 dk',s.cash<80],
 ['rest','Dinlen','+30 enerji · +14 sağlık · +8 dinçlik','2 sa · −5 tokluk · −14 yük',false],
 ['sleep','Uyu','+75 enerji · +90 dinçlik · +32 sağlık','8 sa · −14 tokluk · −40 yük',false]
 ].map(([key,title,gain,cost,disabled])=>`<article><div><h3>${title}</h3><p>${gain}</p><span>${cost}</span></div>${btn(key==='help'&&disabled?'Alındı':key==='sleep'?'Uyu':key==='rest'?'Dinlen':'Ye','recover',key,'',disabled||!!s.fight&&!s.fight.done)}</article>`).join('')}</div>${s.world.home?'<p class="help-text">Ev avantajların uyku ve dinlenme kazancına ayrıca eklenir.</p>':''}`,'recovery');$('modal').scrollTop=oldScroll;}
function profileSheet(){showSheet(sheetHeader(esc(s.name),'DÖVÜŞÇÜ DOSYASI')+`<p class="sheet-intro">${UI.fightingStyle(s)} · ${s.wins}G / ${s.losses}M / ${s.draws}B</p>${skillRows()}<div class="profile-pills"><span>${s.sessions} seans</span><span>${money(s.earned)} kazanç</span><span>${s.world.reputation} itibar</span></div><p class="help-text">Beceriler ayrı gelişir. Kuvvet darbe gücüne, kondisyon nefesine, dövüş dalları ilgili tekniklerine etki eder.</p>`,'profile');}
function openSettings(){showSheet(sheetHeader('Kariyerin, senin kontrolünde.','CAGE · V0.5')+`<label for="fighter-name">Dövüşçünün adı</label><input id="fighter-name" maxlength="24" value="${esc(s.name)}" autocomplete="off"><div class="buttons">${btn('Adı kaydet','name','','primary')}${btn(soundOn?'Ses açık':'Ses kapalı','sound','','ghost')}</div><p class="sheet-intro">İlerleme bu tarayıcıda saklanır. Safari verileri silinirse kayıt da silinir.</p><div class="buttons">${btn('Kaydı dışa aktar','export')}${btn('Yeni kariyer','reset','','ghost')}</div><label for="import-save">Kayıt dosyasından devam et</label><input id="import-save" type="file" accept=".json,application/json"><p class="help-text">iPhone: Safari → Paylaş → Ana Ekrana Ekle. Oyun internet bağlantısı gerektirir.</p>`,'settings');
 $('import-save').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>150000)throw Error('Kayıt dosyası çok büyük.');const next=JSON.parse(await file.text());if(!E.validSave(next))throw Error('Geçerli bir CAGE kaydı değil.');showSheet(sheetHeader('Bu kariyeri aç?')+`<p>${esc(next.name)} · ${next.wins} galibiyet · ${money(next.cash)}</p><p>Bu dosya mevcut kariyerin yerine açılacak.</p><div class="buttons"><button id="import-confirm" class="primary">Kaydı aç</button>${btn('Vazgeç','close')}</div>`,'import');$('import-confirm').onclick=()=>{playback.pause();s=E.migrate(next);saveProblem='';sheetResume=false;view=s.fight?'fight':'home';fightTier=E.league(s);paused=!!s.fight;save();$('modal').close();render({preserve:false});window.scrollTo({top:0,behavior:'instant'});runTimer(true);toast('Kariyer yüklendi.');};}catch(error){toast(error.message);}};
}
const tactics=[['balanced','Dengeli'],['strike','Ayakta'],['ground','Yere al'],['defend','Savun']];
function tacticButtons(){return `<div class="tactics">${tactics.map(([key,label])=>btn(label,'tactic',key,'',s.fight?.done)).join('')}</div>`;}
function fightPage(){
 const f=s.fight;$('scene-label').innerHTML=`<i class="live-dot"></i>${E.LEAGUES[f.tier].venue}`;
 $('context').innerHTML=`<div class="commentary-heading"><span>SON AKSİYON</span><span id="event-time"></span></div><div class="fight-log" id="fight-log" role="status" aria-live="polite"></div><div class="fight-controls">${btn(paused?'Devam':'Duraklat','pause','','',f.done)}${btn(speed===.5?'0,5×':speed===1?'1×':'2×','speed','','',f.done)}${btn('Maç dosyası','fight-details','','ghost')}${btn(soundOn?'Ses açık':'Ses kapalı','sound','','ghost')}</div><div class="tactics-heading"><span>MAÇ PLANI</span><button data-action="tactic-info" class="text-button" aria-label="Taktik ve talimat açıklamaları">Nasıl işler?</button></div>${tacticButtons()}<div id="corner-commands"></div><div id="fight-result"></div>`;
 $('content').innerHTML='';updateFight();
}
function fightStatsTable(data){return `<div class="match-stats"><div class="stat-heading"><span>Maç istatistikleri</span><b>Sen</b><b>Rakip</b></div>${[['hits','İsabetli vuruş'],['attempts','Vuruş denemesi'],['takedowns','Yere alma'],['escapes','Ayağa dönüş'],['submissions','Pes ettirme denemesi']].map(([key,label])=>`<div><span>${label}</span><b>${data.fighters[0][key]}</b><b>${data.fighters[1][key]}</b></div>`).join('')}</div>`;}
function fightDetails(){const f=s.fight,data=report(f);showSheet(sheetHeader('Maç dosyası',esc(s.name)+' / '+esc(f.enemy.name))+fightStatsTable(data)+`<p class="coach-note">${esc(data.advice)}</p>${UI.fightPreparation(s)}<details class="fight-history" open><summary>Maç günlüğü · ${f.events.length} aksiyon</summary><ol>${[...f.events].reverse().map(e=>`<li><span>${e.round}. raund · ${esc(e.time)}</span><p>${esc(e.text)}</p></li>`).join('')||'<li>Zil henüz çaldı.</li>'}</ol></details>${f.done?'':btn('Maçı tamamla · Sonucu gör','skip','','text-button')}`,'fight-details');}
function updateFight(){
 const f=s.fight;if(!f||view!=='fight')return;renderVitals();
 scene.set({visible:true,mode:'fight',phase:f.phase,top:f.top,event:f.last,eventId:f.tick?`${f.id}:${f.tick}`:null,entranceId:f.id,paused:document.hidden||paused&&!f.done,playbackRate:speed,done:f.done,result:f.result,playerStyle:E.style(s),enemyStyle:f.enemy.style,tier:f.tier,home:s.world.home,roundNumber:Math.min(3,Math.floor(f.tick/20)+1),roundBreak:needsRoundBreak(f)});
 const event=f.events?.at(-1),nextRound=f.tick>0&&f.tick%20===0&&f.uiRoundBreak===f.tick,remain=f.tick&&f.tick%20===0&&!nextRound?0:180-f.tick%20*9,round=nextRound?Math.min(3,Math.floor(f.tick/20)+1):f.tick?Math.min(3,Math.floor((f.tick-1)/20)+1):1;
 $('fight-hud').innerHTML=`<div class="fight-head"><div class="fight-person"><strong>${esc(s.name)}</strong><div class="bar"><i style="width:${E.clamp(f.hp[0]/f.maxHp[0]*100)}%"></i></div><span>Can ${Math.max(0,Math.ceil(f.hp[0]))} · Nefes %${Math.round(f.st[0]/f.maxSt[0]*100)}</span></div><div class="round"><small>R${round} / 3</small><strong>${f.done?'BİTTİ':Math.floor(remain/60)+':'+String(remain%60).padStart(2,'0')}</strong><span>${f.phase==='ground'?'YERDE':'AYAKTA'}</span></div><div class="fight-person"><strong>${esc(f.enemy.name)}</strong><div class="bar"><i style="width:${E.clamp(f.hp[1]/f.maxHp[1]*100)}%"></i></div><span>Can ${Math.max(0,Math.ceil(f.hp[1]))} · Nefes %${Math.round(f.st[1]/f.maxSt[1]*100)}</span></div></div>`;
 $('fight-log').textContent=f.log;$('event-time').textContent=event?`${event.round}. raund · ${event.time}`:'Gardını al';
 document.querySelectorAll('[data-action="tactic"]').forEach(b=>{b.classList.toggle('active',b.dataset.value===f.tactic);b.setAttribute('aria-pressed',String(b.dataset.value===f.tactic));});
 const status=E.cornerStatus(s);
 $('corner-commands').innerHTML=`<div class="corner-heading"><span>ANLIK TALİMAT</span><span>${status.remaining}/2 hak${status.cooldown?' · '+status.cooldown+' aksiyon bekle':''}</span></div><div class="corner-buttons">${Object.entries(E.CORNER_COMMANDS).map(([key,c])=>btn(c.name,'corner',key,'',f.done||status.remaining===0||status.cooldown>0)).join('')}</div><p class="corner-status">${f.done?'Maç tamamlandı.':status.remaining===0?'Talimatların sonraki raundda yenilenir.':esc(status.label)}</p>`;
 document.body.classList.toggle('fight-complete',f.done);
 if(f.done){playback.pause();const r=f.result,rank=r.ranking;
 $('fight-result').innerHTML=`<div class="result-card"><span class="eyebrow">${esc(r.method).toLocaleUpperCase('tr-TR')}</span><h2>${r.champion?'KEMER SENİN.':r.winner===0?'ELİN HAVADA.':r.winner===2?'BAŞA BAŞ.':'YENİDEN AYAĞA.'}</h2><div class="result-rewards"><span>Maç <b>+${money(r.reward)}</b></span>${r.sponsorReward?`<span>Sponsor <b>+${money(r.sponsorReward)}</b></span>`:''}<span>İtibar <b>+${r.reputationReward||0}</b></span></div>${rank?`<p>${rank.advanced?'Sıralamada yükseldin: #'+rank.before+' → #'+rank.after:'Sıralaman: #'+rank.after}${r.qualifiedWin?' · Lig ilerlemesi +1':''}</p>`:''}${r.promotion?`<p class="tag">Yeni lig: ${E.LEAGUES[E.league(s)].name}</p>`:''}<div class="buttons">${btn('Maç analizi','fight-details','','ghost')}${btn('Kariyerine dön','finish','','primary')}</div></div>`;
 document.querySelectorAll('[data-action="tactic"],[data-action="pause"],[data-action="speed"],[data-action="corner"]').forEach(b=>b.disabled=true);
 }
}
function openRoundBreak(){const f=s.fight;if(!needsRoundBreak(f))return;paused=true;playback.pause();syncFightControls();const round=f.tick/20,data=report(f,round);sheetResume=false;showSheet(sheetHeader('Köşene dön.','RAUND '+round+' TAMAMLANDI')+`<p class="round-break-copy">Bir nefes al. Sonraki raund sen devam ettiğinde başlayacak.</p><div class="round-condition"><span>Can <b>%${data.health}</b></span><span>Nefes <b>%${data.breath}</b></span></div>${fightStatsTable(data)}<p class="coach-note">${esc(data.advice)}</p><span class="eyebrow">SONRAKİ RAUND PLANI</span>${tacticButtons()}${btn((round+1)+'. raunda çık','round-next','','primary full-width')}`,'round-break');scene.set({roundBreak:true,roundNumber:round+1,paused:document.hidden});audio.play('bell');document.querySelectorAll('#modal [data-action="tactic"]').forEach(b=>b.classList.toggle('active',b.dataset.value===f.tactic));}
function finishFight(){playback.pause();s.fight=null;view='career';careerTab='ladder';fightTier=E.league(s);paused=false;sheetResume=false;if($('modal').open)$('modal').close();save();render({preserve:false});window.scrollTo({top:0,behavior:'instant'});}
function act(action,value){try{let message='';switch(action){
 case 'nav':navigate(value);return;
 case 'train-tab':trainTab=value;refreshTab();return;
 case 'train-filter':trainFilter=value;refreshTab();return;
 case 'city-tab':cityTab=value;refreshTab();return;
 case 'career-tab':careerTab=value;refreshTab();return;
 case 'fight-tab':fightTab=value;refreshTab();return;
 case 'fight-tier':fightTier=Number(value);refreshTab();return;
 case 'city-events':$('city-events')?.scrollIntoView({behavior:'smooth',block:'start'});return;
 case 'city-event':showSheet(sheetHeader('Mahallede bugün.','BİR GÜN · BİR SEÇİM')+eventDetails(s,value),'city-event');return;
 case 'world':message=World.act(s,value);if(sheetKind==='city-event')$('modal').close();break;
 case 'recovery':recoverySheet();return;
 case 'profile':profileSheet();return;
 case 'goals':careerTab='goals';navigate('career');return;
 case 'claim':message=Objectives.claim(s,value);audio.play('success');break;
 case 'job-sheet':showSheet(sheetHeader('Gündelik iş','BUGÜNÜN MASRAFINI ÇIKAR')+'<p class="sheet-intro">3 oyun saati çalış. +₺110 kazan; 15 enerji, 10 tokluk ve 15 dinçlik harca.</p>'+btn('İşe git · +₺110','recover','job','primary full-width'),'job');return;
 case 'recover':message=E.recover(s,value);save();render();if(sheetKind==='recovery')recoverySheet();else if(sheetKind==='job')$('modal').close();toast(message);return;
 case 'camp':navigate('fight');return;
 case 'camp-train':trainTab='sessions';trainFilter='camp';navigate('train');return;
 case 'camp-wait':message=E.waitForFight(s);break;
 case 'camp-cancel':showSheet(sheetHeader('Kampı iptal et?')+'<p>Bu rakibe özel hazırlık silinir. Becerilerin ve tekniklerin sende kalır.</p><div class="buttons">'+btn('Vazgeç','close')+btn('Kampı iptal et','camp-cancel-confirm','','primary')+'</div>','confirm');return;
 case 'camp-cancel-confirm':message=E.cancelCamp(s);$('modal').close();break;
 case 'scout-offer':{const enemy=E.matchOffers(s,Math.min(fightTier,E.league(s))).find(o=>o.id===value);if(!enemy)throw Error('Bu teklif değişti. Listeyi yeniden aç.');showSheet(sheetHeader('Rakip dosyası')+UI.scouting(s,enemy)+btn('Kampı başlat','book',enemy.tier+':'+enemy.id,'primary full-width'),'scout');return;}
 case 'book':{const [tier,...id]=value.split(':');message=E.bookFight(s,Number(tier),id.join(':')||undefined);view='fight';fightTab='camp';if($('modal').open)$('modal').close();save();render({preserve:false});window.scrollTo({top:0,behavior:'instant'});toast(message);return;}
 case 'train':case 'move':{const move=action==='move'?E.MOVES.find(m=>m.id===value):null;message=E.train(s,move?move.skill:value,move?.id);audio.play('tap');break;}
 case 'focus':message=E.trainFocus(s,value);break;
 case 'equip':message=E.toggleMove(s,value);break;
 case 'gym':message=E.chooseGym(s,Number(value));break;
 case 'coach':message=E.chooseCoach(s,Number(value));break;
 case 'active-train':openDrill(value);return;
 case 'drill-hit':hitDrill();return;
 case 'start':E.startFight(s,Number(value));paused=false;view='fight';audio.play('bell');save();render({preserve:false});window.scrollTo({top:0,behavior:'instant'});runTimer(true);return;
 case 'tactic':E.tactic(s,value);save();updateFight();if(sheetKind==='round-break')scene.set({roundBreak:true,paused:document.hidden});return;
 case 'corner':message=E.corner(s,value);save();updateFight();audio.play('tap');toast(message);return;
 case 'pause':if(needsRoundBreak(s.fight)){openRoundBreak();return;}paused=!paused;runTimer();syncFightControls();return;
 case 'speed':speed=speed===1?.5:speed===.5?2:1;runTimer();syncFightControls();return;
 case 'round-next':s.fight.uiRoundBreak=s.fight.tick;save();sheetResume=false;$('modal').close();paused=false;scene.set({roundBreak:false});updateFight();runTimer(true);syncFightControls();audio.play('bell');return;
 case 'fight-details':fightDetails();return;
 case 'tactic-info':showSheet(sheetHeader('Köşenin dili.')+'<p class="sheet-intro">Maç planı sürekli geçerlidir. Anlık talimatlar raund başına iki kez kullanılabilir; aralarında üç aksiyon beklenir.</p><div class="tactic-explanations"><p><b>Dengeli</b> Fırsata göre hücum et.</p><p><b>Ayakta</b> Boks ve kickboksunu kullan.</p><p><b>Yere al</b> Güreş ve BJJ ile pozisyon ara.</p><p><b>Savun</b> Riski azalt, nefes topla.</p>'+Object.values(E.CORNER_COMMANDS).map(c=>`<p><b>${c.name}</b> ${c.description}</p>`).join('')+'</div>','help');return;
 case 'skip':while(s.fight&&!s.fight.done)E.stepFight(s);sheetResume=false;$('modal').close();save();updateFight();return;
 case 'finish':finishFight();return;
 case 'sound':soundOn=!soundOn;audio.set(soundOn);try{localStorage.setItem('cage-sound',soundOn?'on':'off');}catch{}document.querySelectorAll('[data-action="sound"]').forEach(b=>b.textContent=soundOn?'Ses açık':'Ses kapalı');if(soundOn)audio.play('bell');return;
 case 'close':$('modal').close();return;
 case 'name':{const name=$('fighter-name').value.trim();if(!name||name.length>24)throw Error('1–24 karakter arasında bir isim yaz.');s.name=name;message='İsmin güncellendi.';$('modal').close();break;}
 case 'export':{const url=URL.createObjectURL(new Blob([JSON.stringify(s,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='cage-kariyer-'+E.day(s)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);return;}
 case 'reset':showSheet(sheetHeader('Yeni bir hikâye?')+'<p>Mevcut kariyer sıfırlanacak. Saklamak istiyorsan önce kaydını dışa aktar.</p><div class="buttons">'+btn('Vazgeç','close')+btn('Yeni kariyere başla','reset-confirm','','primary')+'</div>','confirm');return;
 case 'reset-confirm':try{localStorage.setItem('cage-backup-v1',localStorage.getItem(E.KEY)||'');}catch{}playback.pause();s=E.initial();saveProblem='';view='home';fightTier=0;sheetResume=false;paused=false;message='Yeni kariyer başladı.';$('modal').close();break;
 default:return;
 }save();render();if(message)toast(message);}catch(error){toast(error.message);}}
function openDrill(key){
 if(drill||s.fight&&!s.fight.done)throw Error('Önce devam eden çalışmayı veya maçı tamamla.');C.assertTraining(s);const preview=E.trainingPreview(s,key),skill=key==='rope'?'stamina':key;
 if(s.energy<20||s.food<20||s.sleep<15||s.health<35)throw Error('Çalışmak için önce yemek ye ve dinlen.');if(s.cash<preview.cost)throw Error('Seans ücreti için paran yetersiz.');if(s.skills[skill]>=100)throw Error('Bu beceri en üst seviyede.');
 drill={key,skill,visualMove:key==='stamina'?'run':key,scores:[],position:0,target:.5,elapsed:0,last:performance.now(),lastHit:-1000,frame:null,done:false};
 showSheet(sheetHeader((key==='rope'?'İp atlama':key==='stamina'?'Koşu':E.LABELS[skill])+' ritmi','AKTİF ANTRENMAN')+`<p class="drill-cost">1 sa · ${money(preview.cost)} · −18 enerji · −11 tokluk · −9 dinçlik</p><div id="drill-stage" class="drill-stage"></div><div id="drill-scores" class="drill-scores" aria-live="polite"><span>1. tekrar</span><span>2. tekrar</span><span>3. tekrar</span></div><div id="rhythm-track" class="rhythm-track" role="img" aria-label="Çizgi yeşil alana geldiğinde bas"><div id="rhythm-zone" class="rhythm-zone"></div><div id="rhythm-needle" class="rhythm-needle"></div></div><p id="drill-hint" class="drill-hint">Çizgi yeşil alandayken bas. Üç tekrar, en fazla %25 ek gelişim.</p>${btn('Şimdi bas','drill-hit','','primary drill-hit')}<p class="help-text">İptal edersen kaynak harcanmaz. Seans üçüncü tekrarda tamamlanır.</p>`,'drill');
 $('drill-stage').appendChild($('scene'));scene.set({visible:true,mode:'drill',move:drill.visualMove,paused:false,playbackRate:1,strength:s.skills.strength,home:s.world.home,gym:s.gym});$('modal').querySelector('[data-action="drill-hit"]').focus({preventScroll:true});
 const frame=now=>{if(!drill||drill.done||!$('modal').open)return;const delta=Math.min(50,now-drill.last);drill.last=now;if(!document.hidden){drill.elapsed+=delta;drill.position=(Math.sin(drill.elapsed/310-Math.PI/2)+1)/2;$('rhythm-needle').style.left=`${drill.position*100}%`;$('rhythm-zone').style.left=`${(drill.target-.13)*100}%`;}drill.frame=requestAnimationFrame(frame);};drill.frame=requestAnimationFrame(frame);
}
function hitDrill(){
 if(!drill||drill.done||drill.elapsed-drill.lastHit<450)return;drill.lastHit=drill.elapsed;const score=Activity.rhythmScore(drill.position,drill.target,.13);drill.scores.push(score);audio.play(score>=75?'success':'tap');scene.set({mode:'drill',move:drill.visualMove,drillPulse:{id:++drillSequence,quality:score}});
 $('drill-scores').innerHTML=[0,1,2].map(i=>`<span class="${drill.scores[i]!==undefined?'scored':''}">${drill.scores[i]!==undefined?drill.scores[i]+' puan':(i+1)+'. tekrar'}</span>`).join('');
 if(drill.scores.length<3){drill.target=drill.scores.length===1?.7:.3;$('drill-hint').textContent=score>=80?'İyi zamanlama! Yeni yeşil bölgeyi takip et.':'Bir sonraki tekrarda yeşil bölgenin ortasını hedefle.';return;}
 drill.done=true;cancelAnimationFrame(drill.frame);const total=Activity.summarise(drill.scores),before=s.skills[drill.skill];
 try{E.trainActive(s,drill.key,total);save();render();scene.set({visible:true,mode:'drill',move:drill.visualMove,drillPulse:{id:++drillSequence,quality:total}});$('drill-hint').innerHTML=`<strong>${total}/100 ritim</strong> · +${(s.skills[drill.skill]-before).toFixed(2)} ${E.LABELS[drill.skill]}`;$('rhythm-track').classList.add('drill-finished');const b=$('modal').querySelector('[data-action="drill-hit"]');b.dataset.action='close';b.textContent='Seans tamamlandı';$('modal').querySelector('.help-text').textContent='Gelişim ve kaynak kullanımı kaydedildi. Yeni seansa hazırsın.';}catch(error){$('drill-hint').textContent=error.message;const b=$('modal').querySelector('[data-action="drill-hit"]');b.dataset.action='close';b.textContent='Kapat';}
}
function closeDrill(){if(!drill)return;cancelAnimationFrame(drill.frame);drill=null;document.querySelector('.stage-card').prepend($('scene'));scene.set({visible:view==='home',mode:'home',paused:false,playbackRate:1});}
$('modal').addEventListener('close',()=>{if($('modal').open)return;closeDrill();sheetKind='';$('modal').className='';if(sheetResume&&s.fight&&!s.fight.done&&!needsRoundBreak(s.fight)){paused=false;runTimer();syncFightControls();}else if(s.fight&&!s.fight.done){runTimer();syncFightControls();}sheetResume=false;});
$('rotate').onclick=()=>scene.rotate();$('settings').onclick=openSettings;
document.addEventListener('keydown',()=>{keyboardInput=true;audio.unlock();});document.addEventListener('pointerdown',()=>{keyboardInput=false;audio.unlock();},{passive:true});
document.addEventListener('click',event=>{const b=event.target.closest('[data-action]');if(b&&!b.disabled){clickAnchor=captureViewport(b);try{act(b.dataset.action,b.dataset.value);}finally{clickAnchor=null;}}});
document.addEventListener('visibilitychange',()=>{if(drill){scene.set({paused:document.hidden,visible:!document.hidden});return;}runTimer();});
window.addEventListener('pagehide',()=>{playback.pause();scene.set({visible:false});});
window.addEventListener('pageshow',()=>{runTimer();});
if(s.fight){view='fight';paused=!s.fight.done;}render();runTimer(true);if(saveProblem)toast(saveProblem);
