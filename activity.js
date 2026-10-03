// The rhythm drill is presentation-only until its final score is submitted.
// A centre hit earns 100; the target edge earns 50; two half-widths away earns 0.
export function rhythmScore(position,target=.5,halfWidth=.1){
 if(!Number.isFinite(position)||position<0||position>1||!Number.isFinite(target)||target<0||target>1||!Number.isFinite(halfWidth)||halfWidth<=0||halfWidth>.5)throw Error('Geçersiz ritim hedefi.');
 return Math.round(Math.max(0,100*(1-Math.abs(position-target)/(halfWidth*2))));
}

export function summarise(scores){
 if(!Array.isArray(scores)||scores.length>3||scores.some(score=>!Number.isInteger(score)||score<0||score>100))throw Error('Geçersiz ritim puanı.');
 return scores.length?Math.round(scores.reduce((sum,score)=>sum+score,0)/scores.length):0;
}
