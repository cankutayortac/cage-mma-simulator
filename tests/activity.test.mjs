import assert from 'node:assert/strict';
import {rhythmScore,summarise} from '../dist/activity.js';
let checks=0;const test=(name,fn)=>{fn();checks++;console.log('PASS '+name)};

test('rhythm rewards timing at the centre with symmetric falloff',()=>{
 assert.equal(rhythmScore(.5,.5,.1),100);assert.equal(rhythmScore(.4,.5,.1),50);assert.equal(rhythmScore(.6,.5,.1),50);
 assert.equal(rhythmScore(.3,.5,.1),0);assert.equal(rhythmScore(.7,.5,.1),0);assert.equal(rhythmScore(1,.5,.1),0);
 assert(rhythmScore(.47,.5,.1)>rhythmScore(.42,.5,.1));
});
test('edge targets remain bounded and narrower windows demand more accuracy',()=>{
 assert.equal(rhythmScore(0,0,.1),100);assert.equal(rhythmScore(1,1,.1),100);
 assert(rhythmScore(.55,.5,.1)>rhythmScore(.55,.5,.05));
 for(let n=0;n<=100;n++){const score=rhythmScore(n/100,.25,.07);assert(Number.isInteger(score)&&score>=0&&score<=100)}
});
test('three attempts average once without modifying their scores',()=>{
 const scores=[100,50,0],copy=[...scores];assert.equal(summarise(scores),50);assert.deepEqual(scores,copy);
 assert.equal(summarise([100,100,100]),100);assert.equal(summarise([100,100,99]),100);assert.equal(summarise([]),0);
});
test('invalid positions and forged scores are rejected',()=>{
 for(const position of [NaN,Infinity,-.1,1.1,'0.5',null])assert.throws(()=>rhythmScore(position,.5,.1));
 for(const target of [NaN,-1,2,'0.5'])assert.throws(()=>rhythmScore(.5,target,.1));
 for(const width of [0,-1,NaN,Infinity,.6,'0.1'])assert.throws(()=>rhythmScore(.5,.5,width));
 for(const scores of [null,{},[101],[-1],[1.5],[NaN],['50'],[0,0,0,0]])assert.throws(()=>summarise(scores));
});
console.log(checks+' activity checks passed');
