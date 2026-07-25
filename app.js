const DEFAULT_TRACKS = [["The Rainbow", "Talk Talk"], ["New Grass", "Talk Talk"], ["The Loom", "Bark Psychosis"], ["Absent Friend", "Bark Psychosis"], ["Washer", "Slint"], ["Cave-In", "Codeine"], ["Lullaby", "Low"], ["Katy Song", "Red House Painters"], ["Bedside Table", "Bedhead"], ["Moonbeams", "The For Carnation"], ["The Seasons Reverse", "Gastr del Sol"], ["Blues Subtitled No Sense of Wonder", "Gastr del Sol"], ["Fast Car", "Jim O'Rourke"], ["Eureka", "Jim O'Rourke"], ["Holy Fool Music", "David Grubbs"], ["Djed", "Tortoise"], ["The Biz", "The Sea and Cake"], ["Audio Boxing", "Isotope 217"], ["Mysterious Barricades", "Chicago Underground Duo"], ["Jenny Ondioline", "Stereolab"], ["Soon", "My Bloody Valentine"], ["To Here Knows When", "My Bloody Valentine"], ["Souvlaki Space Station", "Slowdive"], ["Plainsong", "Seefeel"], ["My Dreaming Hill", "Flying Saucer Attack"], ["Fear of Flying", "Bowery Electric"], ["Drawing of Sound", "Windy & Carl"], ["El Lago", "Labradford"], ["Caecilia", "Fennesz"], ["Chimeras", "Tim Hecker"], ["Angel", "Massive Attack"], ["Group Four", "Massive Attack"], ["Roads", "Portishead"], ["Floating on a Moment", "Beth Gibbons"], ["Archangel", "Burial"], ["Building Steam with a Grain of Salt", "DJ Shadow"], ["Roygbiv", "Boards of Canada"], ["Cichli", "Autechre"], ["Xtal", "Aphex Twin"], ["Do Dekor", "Jan Jelinek"], ["Atlas", "Battles"], ["Fire Back About Your New Baby's Sex", "Don Caballero"], ["Starfire", "Jaga Jazzist"], ["Actionist Respoke", "Mouse on Mars"], ["Beep Street", "Squarepusher"], ["She Moves She", "Four Tet"], ["Silhouettes (I, II & III)", "Floating Points"], ["Odessa", "Caribou"], ["Music for 18 Musicians", "Steve Reich"], ["In C", "Terry Riley"], ["How to Disappear Completely", "Radiohead"], ["Pyramid Song", "Radiohead"], ["Tinseltown in the Rain", "The Blue Nile"], ["I Believe in You", "Talk Talk"], ["A Little Lost", "Arthur Russell"], ["Orpheus", "David Sylvian"], ["The Colour of Spring", "Mark Hollis"], ["Farmer in the City", "Scott Walker"], ["Be Not So Fearful", "Bill Fay"], ["The Kiss", "Judee Sill"], ["LONG SEASON", "Fishmans"], ["Weather Report", "Fishmans"], ["Lust", "Rei Harakami"], ["Star Fruits Surf Rider", "Cornelius"], ["Since I Left You", "The Avalanches"], ["Come On Let’s Go", "Broadcast"], ["Dsco", "Sweet Trip"], ["100", "Dean Blunt"], ["Devotion", "Tirzah"], ["Kerosene!", "Yves Tumor"], ["I Want You to Suffer", "Cindy Lee"], ["Feel You", "Julia Holter"], ["Billions", "Caroline Polachek"], ["cellophane", "FKA twigs"], ["Retrograde", "James Blake"], ["Made to Stray", "Mount Kimbie"], ["Space Is Only Noise If You Can See", "Nicolas Jaar"], ["Desafío", "Arca"], ["Chrome Country", "Oneohtrix Point Never"], ["Lucid", "Kelly Lee Owens"], ["Journey in Satchidananda", "Alice Coltrane"], ["Love Is Everywhere", "Pharoah Sanders"], ["Black Classical Music", "Yussef Dayes"], ["Abusey Junction", "Kokoroko"], ["Time Moves Slow", "BADBADNOTGOOD"], ["Summon the Fire", "The Comet Is Coming"], ["Space 8", "Nala Sinephro"], ["Movement 6", "Floating Points, Pharoah Sanders & The London Symphony Orchestra"], ["Peace Piece", "Bill Evans"], ["The Windup", "Keith Jarrett"], ["Svefn-g-englar", "Sigur Rós"], ["Storm", "Godspeed You! Black Emperor"], ["Mogwai Fear Satan", "Mogwai"], ["Requiem for Dying Mothers, Pt. 2", "Stars of the Lid"], ["An Ending (Ascent)", "Brian Eno"], ["The Pearl", "Harold Budd & Brian Eno"], ["Andata", "Ryuichi Sakamoto"], ["Flight from the City", "Jóhann Jóhannsson"], ["Spiegel im Spiegel", "Arvo Pärt"], ["Jóga", "Björk"]];

const API = 'https://api.spotify.com/v1';
const AUTH = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const SCOPES = 'playlist-modify-private playlist-modify-public user-read-private';
const redirectUri = location.origin + location.pathname;
const CACHE_KEY = 'ivy_track_cache_v3';

const ARTIST_ALIASES = {
  'my bloody valentine':['マイブラッディヴァレンタイン'], 'battles':['バトルス'],
  'squarepusher':['スクエアプッシャー'], 'radiohead':['レディオヘッド'],
  'david sylvian':['デヴィッドシルヴィアン'], 'fishmans':['フィッシュマンズ'],
  'fka twigs':['fkaツイッグス'], 'james blake':['ジェイムスブレイク'],
  'oneohtrix point never':['ワンオートリックスポイントネヴァー'],
  'bill evans':['ビルエヴァンス','ビルエヴァンストリオ'],
  'keith jarrett':['キースジャレット'], 'sigur ros':['シガーロス'],
  'mogwai':['モグワイ'], 'brian eno':['ブライアンイーノ'],
  'arvo part':['アルヴォペルト'], 'bjork':['ビョーク'],
  'number girl':['ナンバーガール'], 'arca':['アルカ'],
  'ryuichi sakamoto':['坂本龍一']
};

let accessToken = sessionStorage.getItem('ivy_access_token') || '';
let tracks = [];
let cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r=>setTimeout(r,ms));
const escapeHtml = (s='') => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function normalize(s=''){
  return String(s).normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ')
    .replace(/\b(remaster(ed)?|live|radio edit|single version|mono|stereo|demo)\b.*$/g,'')
    .replace(/[^\p{L}\p{N}]+/gu,'');
}
function dice(a,b){
  a=normalize(a); b=normalize(b); if(!a||!b)return 0; if(a===b)return 1;
  const grams=s=>{const m=new Map();for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);m.set(g,(m.get(g)||0)+1)}return m};
  const A=grams(a),B=grams(b);let inter=0,total=0;
  for(const v of A.values())total+=v;for(const v of B.values())total+=v;
  for(const [g,v] of A)inter+=Math.min(v,B.get(g)||0);
  return total?2*inter/total:0;
}
function artistParts(s=''){
  return s.split(/,|&|\band\b|feat\.?|with/i).map(x=>x.trim()).filter(Boolean);
}
function aliasForms(name){
  const n=normalize(name), list=[name,...(ARTIST_ALIASES[n]||[])];
  return [...new Set(list.map(normalize).filter(Boolean))];
}
function artistScore(targetArtist,itemArtists){
  const targets=artistParts(targetArtist).flatMap(aliasForms);
  const candidates=itemArtists.flatMap(a=>aliasForms(a.name));
  let best=0;
  for(const t of targets)for(const c of candidates){
    let s=dice(t,c);
    if(t===c)s=1;
    else if(t.length>=4 && (c.startsWith(t)||t.startsWith(c)))s=Math.max(s,.9);
    best=Math.max(best,s);
  }
  return best;
}
function score(target,item){
  const title=dice(target.title,item.name);
  const artist=artistScore(target.artist,item.artists||[]);
  const found=String(item.name).toLowerCase(), wanted=String(target.title).toLowerCase();
  let penalty=0;
  if(!wanted.includes('live')&&found.includes('live'))penalty+=.18;
  if(!wanted.includes('demo')&&found.includes('demo'))penalty+=.14;
  if(!wanted.includes('remaster')&&found.includes('remaster'))penalty+=.03;
  if(title>.96 && artist<.42)penalty+=.22; // Arca → Mary Arcane のような誤爆を抑止
  if(title<.55)penalty+=.15;
  return Math.max(0,.68*title+.32*artist-penalty);
}
function cacheKey(t){return `${normalize(t.artist)}|${normalize(t.title)}`}
function compact(item){return {id:item.id,uri:item.uri,name:item.name,artists:item.artists,external_urls:item.external_urls||{},_score:item._score||1}}
function saveCache(t,item){cache[cacheKey(t)]=compact(item);localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}

function randomString(n=80){const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';const bytes=crypto.getRandomValues(new Uint8Array(n));return [...bytes].map(x=>chars[x%chars.length]).join('')}
async function sha256(s){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))}
function base64url(buf){return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}

async function login(){
  const clientId=$('#clientId').value.trim(); if(!clientId){alert('Client IDを入力してね');return}
  localStorage.setItem('ivy_client_id',clientId);
  const verifier=randomString(),challenge=base64url(await sha256(verifier)),state=randomString(24);
  sessionStorage.setItem('ivy_verifier',verifier);sessionStorage.setItem('ivy_state',state);
  const params=new URLSearchParams({client_id:clientId,response_type:'code',redirect_uri:redirectUri,scope:SCOPES,code_challenge_method:'S256',code_challenge:challenge,state});
  location.assign(`${AUTH}?${params}`);
}
async function callback(){
  const params=new URLSearchParams(location.search); const err=params.get('error'); if(err)throw new Error(`Spotify認証: ${err}`);
  const code=params.get('code'); if(!code)return;
  if(params.get('state')!==sessionStorage.getItem('ivy_state'))throw new Error('認証stateが一致しません');
  const body=new URLSearchParams({client_id:localStorage.getItem('ivy_client_id')||'',grant_type:'authorization_code',code,redirect_uri:redirectUri,code_verifier:sessionStorage.getItem('ivy_verifier')||''});
  const res=await fetch(TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!res.ok)throw new Error('トークン取得失敗: '+await res.text());
  const data=await res.json();accessToken=data.access_token;sessionStorage.setItem('ivy_access_token',accessToken);history.replaceState({},'',redirectUri);
}
async function api(path,options={}){
  if(!accessToken)throw new Error('先にSpotifyへログインしてね');
  const res=await fetch(API+path,{...options,headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json',...(options.headers||{})}});
  if(res.status===429){await sleep(Number(res.headers.get('Retry-After')||2)*1000);return api(path,options)}
  if(res.status===401){sessionStorage.removeItem('ivy_access_token');accessToken='';throw new Error('認証期限切れ。もう一度ログインしてね')}
  if(!res.ok)throw new Error(`${res.status}: ${await res.text()}`);
  return res.status===204?null:res.json();
}
async function showUser(){const me=await api('/me');$('#loginStatus').textContent=`接続済み：${me.display_name||me.id}`;$('#loginStatus').className='status ok';$('#matchBtn').disabled=false;$('#retryBtn').disabled=false}

function makeTrack(title,artist,i){return {order:i+1,title,artist,status:'pending',selected:null,candidates:[],query:`${artist} ${title}`}}
function resetTracks(){tracks=DEFAULT_TRACKS.map(([title,artist],i)=>makeTrack(title,artist,i));$('#trackEditor').value=tracks.map(t=>`${t.artist} - ${t.title}`).join('\n');render()}
function applyEditor(){
  const previous=new Map(tracks.map(t=>[cacheKey(t),t]));
  const lines=$('#trackEditor').value.split('\n').map(x=>x.trim()).filter(Boolean);
  tracks=lines.map((line,i)=>{const m=line.match(/^(.*?)\s+[–—-]\s+(.+)$/);const t=makeTrack(m?m[2].trim():line,m?m[1].trim():'',i);const old=previous.get(cacheKey(t));return old?{...old,order:i+1}:t});render();
}
function label(s){return({pending:'未検索',searching:'検索中',matched:'確定',review:'要確認',missing:'未一致'})[s]||s}
function render(){
  $('#trackCount').textContent=`${tracks.length}曲`;
  const selected=tracks.filter(t=>t.selected).length; const missing=tracks.filter(t=>!t.selected).length;
  $('#summary').textContent=selected?`選択済み ${selected}/${tracks.length}${missing?`・未選択 ${missing}`:''}`:'未検索';
  $('#createBtn').disabled=!selected;
  $('#results').innerHTML=tracks.map((t,i)=>{
    const found=t.selected?`<div class="found">${escapeHtml(t.selected.artists.map(a=>a.name).join(', '))} — ${escapeHtml(t.selected.name)} <span class="score">${Math.round((t.selected._score||1)*100)}%</span></div>`:'';
    const choices=t.candidates.length?`<select data-index="${i}">${t.candidates.map((c,j)=>`<option value="${j}" ${t.selected?.id===c.id?'selected':''}>${escapeHtml(c.artists.map(a=>a.name).join(', '))} — ${escapeHtml(c.name)} (${Math.round(c._score*100)}%)</option>`).join('')}<option value="-1">この曲を除外</option></select>`:'';
    const tools=`<details class="manual"><summary>手動で直す</summary><div class="manualgrid"><input data-query="${i}" value="${escapeHtml(t.query||`${t.artist} ${t.title}`)}" aria-label="検索語"><button class="smallbtn secondary" data-retry="${i}">この曲だけ再検索</button><input data-uri="${i}" placeholder="Spotifyの曲URLまたはspotify:track:..."><button class="smallbtn ghost" data-seturi="${i}">URLで固定</button></div></details>`;
    return `<div class="row ${t.status}"><div class="num">${t.order}</div><div><strong>${escapeHtml(t.artist)}</strong><br>${escapeHtml(t.title)}${found}${choices}${tools}</div><div class="badge">${label(t.status)}</div></div>`;
  }).join('');
  document.querySelectorAll('select[data-index]').forEach(el=>el.addEventListener('change',()=>{const t=tracks[Number(el.dataset.index)],idx=Number(el.value);t.selected=idx>=0?t.candidates[idx]:null;t.status=t.selected?(t.selected._score>=.86?'matched':'review'):'missing';if(t.selected)saveCache(t,t.selected);render()}));
  document.querySelectorAll('[data-retry]').forEach(b=>b.onclick=async()=>{const i=Number(b.dataset.retry);tracks[i].query=document.querySelector(`[data-query="${i}"]`).value.trim();await matchOne(i,true)});
  document.querySelectorAll('[data-seturi]').forEach(b=>b.onclick=async()=>{const i=Number(b.dataset.seturi);const value=document.querySelector(`[data-uri="${i}"]`).value.trim();await setFromUri(i,value)});
}

function searchQueries(t,custom=''){
  if(custom)return [custom];
  const first=artistParts(t.artist)[0]||t.artist;
  return [
    `track:"${t.title.replaceAll('"','')}" artist:"${first.replaceAll('"','')}"`,
    `"${t.title.replaceAll('"','')}" "${first.replaceAll('"','')}"`,
    `track:"${t.title.replaceAll('"','')}"`,
    `${t.title} ${first}`
  ];
}
async function findCandidates(t,custom=''){
  const all=[]; const seen=new Set();
  for(const q of searchQueries(t,custom)){
    const data=await api(`/search?${new URLSearchParams({q,type:'track',limit:'10'})}`);
    for(const item of data.tracks?.items||[]){if(seen.has(item.id))continue;seen.add(item.id);all.push({...item,_score:score(t,item)})}
    if(all.some(x=>x._score>=.97))break;
    await sleep(70);
  }
  return all.sort((a,b)=>b._score-a._score).slice(0,8);
}
async function matchOne(i,force=false){
  const t=tracks[i];t.status='searching';render();
  try{
    if(!force&&cache[cacheKey(t)]){
      const cached={...cache[cacheKey(t)],_score:1};t.candidates=[cached];t.selected=cached;t.status='matched';render();return;
    }
    const candidates=await findCandidates(t,force?t.query:'');
    t.candidates=candidates;t.selected=candidates[0]||null;
    t.status=!t.selected?'missing':t.selected._score>=.86?'matched':'review';
    if(t.selected&&t.status==='matched')saveCache(t,t.selected);
  }catch(e){t.status='missing';console.error(e);alert(e.message)}
  render();
}
async function matchAll(onlyMissing=false){
  applyEditor();$('#matchBtn').disabled=true;$('#retryBtn').disabled=true;
  for(let i=0;i<tracks.length;i++){
    if(onlyMissing&&tracks[i].selected)continue;
    await matchOne(i,false);await sleep(80);
  }
  $('#matchBtn').disabled=false;$('#retryBtn').disabled=false;
}
function parseTrackId(value=''){
  const uri=value.match(/spotify:track:([A-Za-z0-9]+)/); if(uri)return uri[1];
  const url=value.match(/open\.spotify\.com\/track\/([A-Za-z0-9]+)/); return url?url[1]:'';
}
async function setFromUri(i,value){
  const id=parseTrackId(value); if(!id){alert('Spotifyの「曲」URLか spotify:track:... を貼ってね');return}
  try{const item=await api(`/tracks/${id}`);item._score=1;tracks[i].candidates=[item];tracks[i].selected=item;tracks[i].status='matched';saveCache(tracks[i],item);render()}catch(e){alert(e.message)}
}
async function createPlaylist(){
  const chosen=tracks.filter(t=>t.selected);if(!chosen.length)return;$('#createBtn').disabled=true;
  try{
    const playlist=await api('/me/playlists',{method:'POST',body:JSON.stringify({name:$('#playlistName').value.trim()||'Ivy Playlist',description:$('#playlistDescription').value.trim(),public:$('#isPublic').checked})});
    const uris=chosen.map(t=>t.selected.uri);
    for(let i=0;i<uris.length;i+=100)await api(`/playlists/${playlist.id}/items`,{method:'POST',body:JSON.stringify({uris:uris.slice(i,i+100)})});
    $('#done').innerHTML=`できた。${chosen.length}曲を追加しました。<br><a href="${playlist.external_urls.spotify}" target="_blank" rel="noopener">Spotifyで開く</a>`;
  }catch(e){alert(e.message);$('#createBtn').disabled=false}
}

document.addEventListener('DOMContentLoaded',async()=>{
  $('#redirectUri').textContent=redirectUri;$('#clientId').value=localStorage.getItem('ivy_client_id')||'';
  $('#copyRedirect').onclick=async()=>{await navigator.clipboard.writeText(redirectUri);$('#copyRedirect').textContent='コピー済み'};
  $('#loginBtn').onclick=login;$('#matchBtn').onclick=()=>matchAll(false);$('#retryBtn').onclick=()=>matchAll(true);$('#createBtn').onclick=createPlaylist;
  $('#applyBtn').onclick=applyEditor;$('#resetBtn').onclick=resetTracks;$('#clearCacheBtn').onclick=()=>{localStorage.removeItem(CACHE_KEY);cache={};alert('照合キャッシュを消しました')};
  resetTracks();try{await callback();if(accessToken)await showUser()}catch(e){alert(e.message)}
});
