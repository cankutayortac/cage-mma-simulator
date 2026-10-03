// All audio is synthesized locally and starts only after a player's gesture.
export function createAudio(){
 let context,enabled=false;
 function unlock(){try{context??=new (window.AudioContext||window.webkitAudioContext)();if(context.state==='suspended')context.resume().catch(()=>{});}catch{}}
 function tone(frequency,duration,type='sine',volume=.05,drop=1){
  if(!enabled||!context||context.state!=='running'||document.hidden)return;
  const oscillator=context.createOscillator(),gain=context.createGain(),now=context.currentTime;
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);oscillator.frequency.exponentialRampToValueAtTime(Math.max(20,frequency*drop),now+duration);
  gain.gain.setValueAtTime(volume,now);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(now+duration);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
 }
 return {
  set(value){enabled=!!value;if(enabled)unlock();return enabled;},
  unlock,
  play(kind){if(kind==='bell'){tone(880,.65,'sine',.04);tone(1320,.5,'sine',.015);}else if(kind==='hit')tone(130,.1,'triangle',.055,.35);else if(kind==='success'){tone(660,.15,'sine',.035);tone(990,.3,'sine',.02);}else if(kind==='tap')tone(360,.055,'sine',.025,.7);}
 };
}
