import test from 'node:test';
import assert from 'node:assert/strict';
import { createProximitySession, proximityReducer, ProximityState } from '../src/proximitySession';
import { createHomeFilterRuns, createHomeSnapshotCache, homeSnapshotKey, homeSnapshotSlot, sameHomeSnapshotKey, rotateHomeFilter, invalidateHomeFilters } from '../src/homeFilterSnapshots';
import { embeddedCatalog } from '../src/data/catalog';
import { recommendAll, recommendExperiencesForPlace } from '../src/recommendations';
const fix = { latitude: 39.92, longitude: 32.85 };
const deferred = <T>() => { let resolve!: (value: T) => void; let reject!: (reason: Error) => void; const promise = new Promise<T>((a,b) => {resolve=a;reject=b;}); return {promise,resolve,reject}; };
function fixture() {
  const permission = deferred<{status:string}>(), position = deferred<{coords:typeof fix}>();
  let services = true, calls = 0, disposedTimer = 0, timeout!: () => void;
  const states: ProximityState[] = [], failures: string[] = [], acquired: object[] = [];
  const session = createProximitySession({ servicesEnabled: async () => services, requestPermission: () => {calls++;return permission.promise;}, currentPosition: () => position.promise,
    changed: (state,failure) => {states.push(state);if(failure)failures.push(failure);}, acquired: value => acquired.push(value),
    schedule: ((callback:()=>void) => {timeout=callback;return 1;}) as unknown as typeof setTimeout,
    cancel: (() => {disposedTimer++;}) as typeof clearTimeout });
  return { session, permission, position, states, failures, acquired, setServices:(value:boolean)=>services=value, calls:()=>calls, expire:()=>timeout(), cancelled:()=>disposedTimer };
}
const tick = async () => { await Promise.resolve(); await Promise.resolve(); };
test('state machine legal transitions, duplicate actions and stale generations', () => {
  const off: ProximityState = {status:'off',generation:0};
  assert.equal(proximityReducer(off,{type:'cancel'}),off);
  assert.equal(proximityReducer(off,{type:'success',generation:0,coordinates:fix}),off);
  const pending = proximityReducer(off,{type:'activate'});
  assert.equal(proximityReducer(pending,{type:'activate'}),pending);
  assert.equal(proximityReducer(pending,{type:'failure',generation:0}),pending);
  const active = proximityReducer(pending,{type:'success',generation:1,coordinates:fix});
  assert.equal(active.status,'active'); assert.equal(proximityReducer(active,{type:'activate'}),active);
  assert.equal(proximityReducer(active,{type:'off'}).status,'off');
  assert.equal(proximityReducer(active,{type:'invalidate'}).status,'off');
  assert.equal(proximityReducer(pending,{type:'cancel'}).status,'off');
  assert.equal(proximityReducer(pending,{type:'failure',generation:1}).status,'off');
  assert.equal(proximityReducer(pending,{type:'success',generation:1,coordinates:{...fix,latitude:NaN}}).status,'off');
});
test('fresh activation locks rapid taps, publishes one finite fix, active reuse makes no GPS requests', async () => {
  const f=fixture(), pending=f.session.activate(); void f.session.activate(); void f.session.activate(); await tick(); assert.equal(f.calls(),1);
  f.permission.resolve({status:'granted'}); await tick(); f.position.resolve({coords:fix}); await pending;
  assert.equal(f.session.state().status,'active'); assert.equal(f.acquired.length,1); assert.equal(f.cancelled(),1);
  void f.session.activate(); assert.equal(f.calls(),1); assert.equal(f.states.length,2);
});
for (const action of ['off','cancel','invalidate','dispose'] as const) test(`${action} rejects late permission/GPS results without publication`, async () => {
  const f=fixture(), pending=f.session.activate(); await tick(); f.permission.resolve({status:'granted'}); await tick(); f.session[action]();
  f.position.resolve({coords:fix}); await pending; assert.equal(f.acquired.length,0); assert.equal(f.session.state().status,'off');
});
for (const failure of ['permission_denied','services_unavailable','acquisition_failed','invalid_fix','timeout'] as const) test(`${failure} returns off exactly once, without publishing location`, async () => {
  const f=fixture(); if(failure==='services_unavailable')f.setServices(false);
  const pending=f.session.activate(); await tick();
  if(failure==='timeout')f.expire();
  f.permission.resolve({status:failure==='permission_denied'?'denied':'granted'}); await tick();
  if(failure==='acquisition_failed')f.position.reject(new Error('GPS unavailable'));
  else f.position.resolve({coords:failure==='invalid_fix'?{...fix,longitude:Infinity}:fix});
  await pending; assert.equal(f.session.state().status,'off'); assert.equal(f.acquired.length,0); assert.equal(f.failures.length,1);
});
test('new acquisition wins an out-of-order response and repeated invalidation announces once', async () => {
  const first=deferred<{coords:typeof fix}>(), second=deferred<{coords:typeof fix}>(); let gps=0; const published:object[]=[], failures:string[]=[];
  const session=createProximitySession({servicesEnabled:async()=>true,requestPermission:async()=>({status:'granted'}),currentPosition:()=>++gps===1?first.promise:second.promise,acquired:p=>published.push(p),changed:(_,e)=>{if(e)failures.push(e);}});
  const a=session.activate(); await tick(); await tick(); session.off(); const b=session.activate(); await tick(); await tick();
  second.resolve({coords:{latitude:40,longitude:33}}); await b; first.resolve({coords:fix}); await a;
  assert.deepEqual(published,[{latitude:40,longitude:33}]); session.invalidate(); session.invalidate(); assert.deepEqual(failures,['location_invalidated']); session.dispose();
});
test('six independent filter/mode slots: seed/history isolation, provenance and preference invalidation', () => {
  let a=createHomeFilterRuns(), b=createHomeFilterRuns(); const cache=createHomeSnapshotCache<object>(); const now=new Date('2026-10-21');
  const key=(filter:'experience'|'place',mode:'default'|'nearby',coordinate?:object)=>homeSnapshotKey(filter,(mode==='default'?a:b)[filter],'catalog','prefs','dismissals',now,coordinate);
  for(const filter of ['experience','place'] as const)for(const mode of ['default','nearby'] as const)cache.write(homeSnapshotSlot(filter,mode),key(filter,mode,mode==='nearby'?fix:undefined),{filter,mode});
  const originalA=cache.read('experience',key('experience','default'));
  for(let i=0;i<20;i++)assert.equal(cache.read('experience',key('experience','default')),originalA);
  b=rotateHomeFilter(b,'experience',['nearby-only']); assert.equal(a.experience.run,0); assert.equal(b.place.run,0); assert.equal(b.experience.run,1);
  assert.equal(cache.read('experience:nearby',key('experience','nearby',fix)),undefined);
  assert.ok(cache.read('place:nearby',key('place','nearby',fix)));
  assert.equal(cache.read('place:nearby',key('place','nearby',{...fix})),undefined);
  assert.equal(cache.previous('place:nearby',{...fix}),undefined);
  assert.ok(cache.previous('place:nearby',fix));
  a=invalidateHomeFilters(a); b=invalidateHomeFilters(b);
  assert.equal(cache.read('experience',key('experience','default')),undefined); assert.equal(cache.read('place:nearby',key('place','nearby',fix)),undefined);
  assert.equal(sameHomeSnapshotKey(['catalog','prefs','dismissals',0,[],0,0],key('place','nearby',fix)),false);
  assert.equal(homeSnapshotSlot('event','nearby'),'event'); assert.equal(homeSnapshotSlot('idea','nearby'),'idea');
});
test('both modes use merged engine; dismissed records never leak and related recommendations stay A', () => {
  const catalog=embeddedCatalog('ankara');
  const common={...catalog,interests:[],dismissed:[] as string[],budget:'Fark etmez' as const,coordinates:fix,now:new Date('2026-10-21T12:00:00+03:00'),seed:0,limit:5};
  for(const filter of ['experience','place'] as const){
    const a=recommendAll({...common,filter,proximityPolicy:'default'}), b=recommendAll({...common,filter,proximityPolicy:'nearby'});
    assert.deepEqual(a,recommendAll({...common,filter})); assert.equal(a.length,5);assert.equal(b.length,5);
    const dismissed=[a[0].id,b[0].id];for(const proximityPolicy of ['default','nearby'] as const)assert.ok(recommendAll({...common,filter,proximityPolicy,dismissed}).every(i=>!dismissed.includes(i.id)));
  }
  for(const filter of ['event','idea'] as const)assert.deepEqual(recommendAll({...common,filter,proximityPolicy:'nearby'}),recommendAll({...common,filter,proximityPolicy:'default'}));
  const homeOptions = {...common,proximityPolicy:'nearby' as const};
  assert.deepEqual(recommendExperiencesForPlace(catalog.places[0],homeOptions),recommendExperiencesForPlace(catalog.places[0],common));
});
