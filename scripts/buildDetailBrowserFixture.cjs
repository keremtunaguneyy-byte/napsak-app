// Optional RN Web fixture; uses external test tooling, never production services.
// GEZEK_BROWSER_MODULES points to node_modules with react-native-web, react-dom and playwright.
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require(path.join(process.cwd(), 'node_modules/esbuild'));
const repo = process.cwd();
const modules = process.env.GEZEK_BROWSER_MODULES;
if (!modules) throw new Error('Set GEZEK_BROWSER_MODULES to the external browser test node_modules');
const out = process.env.GEZEK_BROWSER_OUTPUT || '/tmp/gezek-detail-browser';
fs.mkdirSync(out, { recursive: true });
const native = path.join(out, 'native.tsx');
const entry = path.join(out, 'harness.tsx');
fs.writeFileSync(native, `
import * as RN from '${modules}/react-native-web';
export * from '${modules}/react-native-web';
// RN Web 0.21 dropped accessibilityState; preserve native props in the browser adapter.
function nativeState(Component, {accessibilityState, ...props}, ref) {
  return React.createElement(Component, {...props, ref, ...(accessibilityState ? {accessibilitySelected:accessibilityState.selected, accessibilityBusy:accessibilityState.busy, accessibilityDisabled:accessibilityState.disabled} : {})});
}
export const Pressable=React.forwardRef((props,ref)=>nativeState(RN.Pressable,props,ref));
export const TouchableOpacity=React.forwardRef((props,ref)=>nativeState(RN.TouchableOpacity,props,ref));
export const Alert={alert:(title,message,buttons)=>{window.__alerts.push({title,message,buttons})}};
export const Linking={canOpenURL:async()=>true,openURL:async url=>{window.__maps.push(url)},openSettings:()=>{}};
window.__activeListeners=[];export const AppState={addEventListener:(kind,callback)=>{window.__activeListeners.push(callback);return {remove(){window.__activeListeners=window.__activeListeners.filter(c=>c!==callback)}}}};
export const BackHandler={addEventListener:()=>({remove(){}})};
import React from '${repo}/node_modules/react';const scale=Number(new URLSearchParams(location.search).get('scale'))||1;export function useWindowDimensions(){return {...RN.useWindowDimensions(),fontScale:scale}};export function Text({style,...props}){const s=RN.StyleSheet.flatten(style)||{};return React.createElement(RN.Text,{...props,style:[style,{fontSize:(s.fontSize||14)*scale,...(s.lineHeight?{lineHeight:s.lineHeight*scale}:{})}]})}
`);
fs.writeFileSync(entry, `import React from 'react';import {createRoot} from '${modules}/react-dom/client';import App from '${repo}/App';import {DetailHost} from '${repo}/src/components/gezek/DetailHost';import {embeddedCatalog} from '${repo}/src/data/catalog';import {UndoNoticeTransition} from '${repo}/src/components/gezek/UndoNoticeTransition';import {createDismissUndo, detailNavigationReducer} from '${repo}/src/detailFlow';
window.__parseCosts=[];window.__assetRenders=0;window.__alerts=[];window.__maps=[];window.__events=[];window.__writes=[];
window.__preferences={saved:[],dismissed:[],mood:'Sakin',interests:['Doğa','Sanat'],budget:'Ücretsiz',groupSize:'2 kişi',duration:'1–2 saat',contextConfirmedAt:new Date().toISOString(),onboardingCompleted:true};
const params=new URLSearchParams(location.search);const fixture=params.get('fixture');
function Fixtures(){const original=embeddedCatalog('ankara');let plan=original.experiences.find(p=>p.id===(params.get('plan')||'xp-kugulu-segmenler'));let place=original.places.find(p=>p.id==='kakule-kahve')||original.places[0];
 if(fixture==='long'){plan={...plan,title:'Kuğulu’dan Seğmenler’e uzanan uzun bir Ankara öğleden sonrasında yeşil ve sakin bir mola',note:Array(50).fill(plan.note).join(' ')};}
 const kind=params.get('kind')||'experience';const item=kind==='place'?place:plan;const [session,setSession]=React.useState(()=>detailNavigationReducer(undefined,{type:'open',origin:{screen:'results',filter:'experience',seed:0,scrollY:0,focusKey:item.id},route:{kind,id:item.id,reasons:['Sakin tempo ve doğa + sanat seçimine uyuyor.']}}));
 const catalog={...original,experiences:fixture==='unavailable'?[]:original.experiences.map(p=>p.id===plan.id?plan:p),places:fixture==='unavailable'?[]:original.places};if(fixture==='noexternal'){plan={...plan,sources:[],points:[]};place={...place,sourceUrl:'',latitude:NaN};catalog.experiences=catalog.experiences.map(p=>p.id===plan.id?plan:p);catalog.places=catalog.places.map(p=>p.id===place.id?place:p)}if(fixture==='empty')catalog.experiences=[];if(fixture==='cycle')catalog.experiences.push({...plan,id:'test-plan-b',title:'Test Plan B'});if(fixture==='metadata-independent')catalog.places=catalog.places.map(p=>plan.points.some(point=>point.placeId===p.id)?{...p,category:'Sanat',district:'Çankaya',priceLevel:3}:p);window.__detailRecord=item;window.__detailSession=session;return session?<DetailHost session={session} context={{...catalog,dismissed:fixture==='dismissed'?[item.id]:[],interests:['Doğa','Sanat'],mood:'Sakin',budget:'Ücretsiz',groupSize:'2 kişi',duration:'1–2 saat',seed:0}} saved={fixture==='saved'?[item.id]:[]} loading={fixture==='loading'} onNavigate={a=>setSession(s=>detailNavigationReducer(s,a))} onUndo={()=>{}} onSave={()=>{}} onDismiss={()=>{}} onRestore={()=>{}} onOpenMaps={async()=>{}} onOpenSource={async()=>{}} onOpenPlanMap={async()=>{}} onOpenPlanSource={async()=>{}}/>:null;}
function UndoFixture(){const [notice,setNotice]=React.useState();const [mounted,setMounted]=React.useState(true);const undo=React.useMemo(()=>createDismissUndo(setNotice,id=>window.__restored.push(id)),[]);React.useEffect(()=>()=>undo.clear(),[undo]);window.__notice=notice;return <><button onClick={()=>undo.dismiss('a')}>Dismiss A</button><button onClick={()=>undo.dismiss('b')}>Dismiss B</button><button onClick={()=>undo.clear()}>Navigate</button><button onClick={()=>{undo.clear();setMounted(false)}}>Unmount</button>{mounted&&notice&&<UndoNoticeTransition notice={notice}><span>Undo notice</span><button disabled={!!notice.exiting} onClick={()=>undo.undo()}>Undo</button></UndoNoticeTransition>}</>};window.__restored=[];
createRoot(document.getElementById('root')).render(fixture==='undo'?<UndoFixture/>:fixture?<Fixtures/>:<App/>);`);
let fontStyles = '';
for (const variant of ['400Regular', '500Medium', '600SemiBold', '700Bold', '800ExtraBold']) {
  const name = `PlusJakartaSans_${variant}`;
  fs.copyFileSync(path.join(repo, 'node_modules/@expo-google-fonts/plus-jakarta-sans', variant, `${name}.ttf`), path.join(out, `${name}.ttf`));
  fontStyles += `@font-face{font-family:${name};src:url(${name}.ttf)}`;
}
fs.writeFileSync(path.join(out, 'index.html'), `<!doctype html><html lang="tr"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Gezek Detail regression fixture</title><style>${fontStyles}html,body,#root{margin:0;height:100%;background:#FAF9F5}#root{display:flex}*{box-sizing:border-box}</style><div id="root"></div><script src="bundle.js"></script></html>`);
esbuild.build({entryPoints:[entry],bundle:true,outdir:out,entryNames:'bundle',platform:'browser',format:'iife',jsx:'automatic',define:{'global':'globalThis','process.env':'{}','process.env.NODE_ENV':'"development"','__DEV__':'true'},alias:{'react-native':native,'react-native-svg/css':repo+'/node_modules/react-native-svg/lib/module/css/css.js','react-native-svg':repo+'/node_modules/react-native-svg/lib/module/ReactNativeSVG.web.js','react':repo+'/node_modules/react','react-dom':modules+'/react-dom'},resolveExtensions:['.web.tsx','.web.ts','.web.js','.tsx','.ts','.js','.json'],loader:{'.png':'dataurl','.jpg':'dataurl','.ttf':'dataurl'},plugins:[{name:'native-service-stubs',setup(b){
 const stubs={
 backend:`import {embeddedCatalog} from '${repo}/src/data/catalog';const c=embeddedCatalog('ankara');window.__catalog=c;export const initialCatalog=()=>c;export const initializeDataBackbone=async()=>c;export const persistPreferences=async p=>{window.__writes.push(structuredClone(p))};export const queuePreferencesForRemoteSync=async()=>{};export const deleteCurrentUserData=async()=>({});`,
 persistence:`export const loadPreferences=async()=>structuredClone(window.__preferences);export const shouldRefreshContext=()=>false;`,
 observability:`export function captureOperationalError(e){throw e};export function setObservabilityScreen(){}`,analytics:`export function trackProductEvent(e){window.__events.push(e)}`,
 'expo-status-bar':`export const StatusBar=()=>null;`, 'expo-location':`export const getCurrentPositionAsync=async()=>{throw new Error('Location is stubbed')};export const Accuracy={Balanced:1};export const requestForegroundPermissionsAsync=async()=>({status:'denied',canAskAgain:true});`,
 'expo-font':`export const useFonts=()=>[true,undefined];`, 'expo-linear-gradient':`export {View as LinearGradient} from 'react-native';`,
 'react-native-safe-area-context':`import React from 'react';import {View} from 'react-native';export const useSafeAreaInsets=()=>({top:24,right:0,bottom:0,left:0});export const SafeAreaProvider=({children})=>children;export const SafeAreaView=({edges,...props})=><View {...props}/>;`};
 b.onResolve({filter:/^(expo-status-bar|expo-location|expo-font|expo-linear-gradient|react-native-safe-area-context)$|\/(backend|persistence|observability|analytics)$/},a=>{const name=a.path.split('/').pop();return stubs[name]?{path:name,namespace:'stub'}:undefined});
 b.onLoad({filter:/.*/,namespace:'stub'},a=>({contents:stubs[a.path],loader:'tsx',resolveDir:repo}));
 }}]}).catch(error=>{console.error(error);process.exit(1)});
