const percent=(n,max)=>Math.max(0,Math.min(100,Math.round(n/max*100)));
export function report(f,round=null){
 const events=(f.events||[]).filter(e=>round===null||e.round===round);
 const fighters=[0,1].map(index=>{
  const own=events.filter(e=>e.attacker===index);
  const strikes=own.filter(e=>['punch','kick','ground'].includes(e.move));
  return {attempts:strikes.length,hits:strikes.filter(e=>e.outcome==='hit').length,takedowns:own.filter(e=>e.move==='takedown'&&e.outcome==='success').length,escapes:own.filter(e=>e.move==='escape'&&e.outcome==='success').length,submissions:own.filter(e=>e.move==='submission').length};
 });
 const breath=percent(f.st[0],f.maxSt[0]),health=percent(f.hp[0],f.maxHp[0]);
 const advice=breath<40?'Nefesin azalıyor. Savunma taktiğiyle toparlan; baskıyı kontrollü kullan.':health<40?'Çok hasar aldın. Mesafeyi koru ve savunmaya ağırlık ver.':fighters[1].takedowns>fighters[0].takedowns?'Rakip yere alışlarda üstün. Mesafe aç komutunu doğru anda kullan.':fighters[0].attempts>=3&&fighters[0].hits/fighters[0].attempts<.4?'Ayakta isabetin düşük. Güçlü dalına göre mesafeyi veya taktiği değiştir.':'Temponu koru. Rakibin nefesini ve pozisyonu izleyerek talimat ver.';
 return {fighters,breath,health,advice,exchanges:events.length};
}

export function needsRoundBreak(f){return !!f&&!f.done&&[20,40].includes(f.tick)&&f.uiRoundBreak!==f.tick;}
