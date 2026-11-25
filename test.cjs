const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const html=fs.readFileSync(process.argv[2]||'game/saltbend.html','utf8');
const script=html.match(/&lt;script&gt;([\s\S]*?)&lt;\/script&gt;/)[1];
function boot(store={}){
const els={},ctx=new Proxy({}, {get:(o,k)=>o[k]??(()=>{})});
const el=id=>els[id]??=({dataset:{},clientWidth:600,getContext:()=>ctx,setAttribute(){},replaceChildren(){},getBoundingClientRect(){return {left:0,top:0,width:600,height:300}}});
const env=vm.createContext({document:{getElementById:el,createElement:()=>({}),addEventListener(){}},window:{addEventListener(){}},localStorage:{setItem:(k,v)=>store[k]=v,getItem:k=>store[k]??null},performance:{now:()=>0},requestAnimationFrame(){},devicePixelRatio:1,assert});
vm.runInContext(script,env);return {run:s=>vm.runInContext(s,env),els,store};
}
let n=0;function check(name,fn){fn();console.log('PASS '+name);n++;}
const a=boot();
check('54 stable entities; 600 simulated seconds; transit progress; ownership and shelter invariants every tick',()=>a.run(`assert.equal(agents.length,54);for(let i=0;i&lt;18000;i++){if(i===1000)setRain(true);if(i===8000)setRain(false);step(1/30);const e=inspectCity(city);assert.equal(e.length,0,e.join('; '));}assert.ok(commuters.some(a=>a.trips>0));assert.ok(city.stops.reduce((s,x)=>s+x.boarded,0)>0);`));
check('deterministic replay and changed input; live state untouched',()=>a.run(`{const before=canonical(capture()),r=replayDiagnostic();assert.ok(r.passed,r.error);assert.notEqual(r.hash,r.changedHash);assert.equal(canonical(capture()),before);}`));
check('read-only rendering and inspection controls',()=>a.run(`{const before=canonical(city);draw();$('checkCity').onclick();assert.equal(canonical(city),before);assert.ok($('testResult').textContent.startsWith('PASS'));}`));
check('save/restart preserves full city, revision, timers, passenger and queue state',()=>{a.run(`assert.ok(persist());`);const b=boot(a.store);assert.equal(b.run('canonical(capture())'),a.run('canonical(capture())'));for(let i=0;i&lt;2;i++){a.run('step(1/30)');b.run('step(1/30)');}assert.equal(b.run('canonical(city)'),a.run('canonical(city)'));});
check('tampered checksum rejected without mutating live state',()=>a.run(`{const c=makeCheckpoint(),before=canonical(capture());c.payload.city.time++;assert.throws(()=>decodeCheckpoint(JSON.stringify(c)));assert.equal(canonical(capture()),before);}`));
check('duplicate queue claim and missing identity rejected even with recomputed hash',()=>a.run(`{const c=makeCheckpoint();const q=c.payload.city.stops.find(s=>s.queue.length);assert.ok(q);q.queue.push(q.queue[0]);c.hash=stateHash(c.payload);assert.throws(()=>decodeCheckpoint(JSON.stringify(c)));const d=makeCheckpoint();d.payload.city.agents.pop();d.hash=stateHash(d.payload);assert.throws(()=>decodeCheckpoint(JSON.stringify(d)));}`));
check('legacy snapshot migration and versioned save',()=>{const s=JSON.parse(a.run('JSON.stringify(capture())'));delete s.city.tick;const old={'saltbend-city-transit-v1':JSON.stringify(s)};const b=boot(old);assert.equal(b.run('city.tick'),Math.round(s.city.time*30));assert.ok(b.run('persist()'));assert.ok(old['saltbend-city-transit-v2']);assert.ok(old['saltbend-city-transit-v1']);});
check('in-game test and save buttons',()=>{a.run("$('replayCity').onclick();$('saveNow').onclick()");assert.ok(a.els.testResult.textContent.startsWith('PASS'));assert.ok(a.els.saveState.textContent.startsWith('Saved'));});
console.log(n+' checks passed (Node VM with mocked DOM, canvas and storage; not a real browser).');
