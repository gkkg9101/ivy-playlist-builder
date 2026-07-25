
const DEFAULT_TRACKS = [["The Rainbow", "Talk Talk"], ["New Grass", "Talk Talk"], ["The Loom", "Bark Psychosis"], ["Absent Friend", "Bark Psychosis"], ["Washer", "Slint"], ["Cave-In", "Codeine"], ["Lullaby", "Low"], ["Katy Song", "Red House Painters"], ["Bedside Table", "Bedhead"], ["Moonbeams", "The For Carnation"], ["The Seasons Reverse", "Gastr del Sol"], ["Blues Subtitled No Sense of Wonder", "Gastr del Sol"], ["Fast Car", "Jim O'Rourke"], ["Eureka", "Jim O'Rourke"], ["Holy Fool Music", "David Grubbs"], ["Djed", "Tortoise"], ["The Biz", "The Sea and Cake"], ["Audio Boxing", "Isotope 217"], ["Mysterious Barricades", "Chicago Underground Duo"], ["Jenny Ondioline", "Stereolab"], ["Soon", "My Bloody Valentine"], ["To Here Knows When", "My Bloody Valentine"], ["Souvlaki Space Station", "Slowdive"], ["Plainsong", "Seefeel"], ["My Dreaming Hill", "Flying Saucer Attack"], ["Fear of Flying", "Bowery Electric"], ["Drawing of Sound", "Windy & Carl"], ["El Lago", "Labradford"], ["Caecilia", "Fennesz"], ["Chimeras", "Tim Hecker"], ["Angel", "Massive Attack"], ["Group Four", "Massive Attack"], ["Roads", "Portishead"], ["Floating on a Moment", "Beth Gibbons"], ["Archangel", "Burial"], ["Building Steam with a Grain of Salt", "DJ Shadow"], ["Roygbiv", "Boards of Canada"], ["Cichli", "Autechre"], ["Xtal", "Aphex Twin"], ["Do Dekor", "Jan Jelinek"], ["Atlas", "Battles"], ["Fire Back About Your New Baby's Sex", "Don Caballero"], ["Starfire", "Jaga Jazzist"], ["Actionist Respoke", "Mouse on Mars"], ["Beep Street", "Squarepusher"], ["She Moves She", "Four Tet"], ["Silhouettes (I, II & III)", "Floating Points"], ["Odessa", "Caribou"], ["Music for 18 Musicians", "Steve Reich"], ["In C", "Terry Riley"], ["How to Disappear Completely", "Radiohead"], ["Pyramid Song", "Radiohead"], ["Tinseltown in the Rain", "The Blue Nile"], ["I Believe in You", "Talk Talk"], ["A Little Lost", "Arthur Russell"], ["Orpheus", "David Sylvian"], ["The Colour of Spring", "Mark Hollis"], ["Farmer in the City", "Scott Walker"], ["Be Not So Fearful", "Bill Fay"], ["The Kiss", "Judee Sill"], ["LONG SEASON", "Fishmans"], ["Weather Report", "Fishmans"], ["Lust", "Rei Harakami"], ["Star Fruits Surf Rider", "Cornelius"], ["鉄風 鋭くなって", "NUMBER GIRL"], ["半透明少女関係", "ZAZEN BOYS"], ["ナイトフィッシングイズグッド", "サカナクション"], ["ミュージック", "サカナクション"], ["満ちてゆく", "藤井 風"], ["grace", "藤井 風"], ["I Want You to Suffer", "Cindy Lee"], ["Feel You", "Julia Holter"], ["Billions", "Caroline Polachek"], ["cellophane", "FKA twigs"], ["Retrograde", "James Blake"], ["Made to Stray", "Mount Kimbie"], ["Space Is Only Noise If You Can See", "Nicolas Jaar"], ["Desafío", "Arca"], ["Chrome Country", "Oneohtrix Point Never"], ["Lucid", "Kelly Lee Owens"], ["Journey in Satchidananda", "Alice Coltrane"], ["Love Is Everywhere", "Pharoah Sanders"], ["Black Classical Music", "Yussef Dayes"], ["Abusey Junction", "Kokoroko"], ["Time Moves Slow", "BADBADNOTGOOD"], ["Summon the Fire", "The Comet Is Coming"], ["Space 8", "Nala Sinephro"], ["Movement 6", "Floating Points, Pharoah Sanders & The London Symphony Orchestra"], ["Peace Piece", "Bill Evans"], ["The Windup", "Keith Jarrett"], ["Svefn-g-englar", "Sigur Rós"], ["Storm", "Godspeed You! Black Emperor"], ["Mogwai Fear Satan", "Mogwai"], ["Requiem for Dying Mothers, Pt. 2", "Stars of the Lid"], ["An Ending (Ascent)", "Brian Eno"], ["The Pearl", "Harold Budd & Brian Eno"], ["Andata", "Ryuichi Sakamoto"], ["Flight from the City", "Jóhann Jóhannsson"], ["Spiegel im Spiegel", "Arvo Pärt"], ["Jóga", "Björk"]];
const API = 'https://api.spotify.com/v1';
const AUTH = 'https://accounts.spotify.com/authorize';
const TOKEN = 'https://accounts.spotify.com/api/token';
const SCOPES = 'playlist-modify-private playlist-modify-public user-read-private';
const redirectUri = location.origin + location.pathname;

let accessToken = sessionStorage.getItem('ivy_access_token') || '';
let tracks = [];

const $ = (s) => document.querySelector(s);
const escapeHtml = (s='') => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sleep = ms => new Promise(r=>setTimeout(r,ms));

function normalize(s=''){
  return s.normalize('NFKD').toLowerCase()
    .replace(/[\u0300-\u036f]/g,'')
    .replace(/&/g,' and ')
    .replace(/\b(remaster(ed)?|live|radio edit|single version|mono|stereo)\b.*$/g,'')
    .replace(/[^\p{L}\p{N}]+/gu,'');
}
function dice(a,b){
  a=normalize(a); b=normalize(b);
  if(!a||!b) return 0; if(a===b) return 1;
  const grams=s=>{const m=new Map();for(let i=0;i<s.length-1;i++){const g=s.slice(i,i+2);m.set(g,(m.get(g)||0)+1)}return m};
  const A=grams(a),B=grams(b);let inter=0,total=0;
  for(const v of A.values())total+=v;for(const v of B.values())total+=v;
  for(const [g,v] of A)inter+=Math.min(v,B.get(g)||0);
  return total?2*inter/total:0;
}
function score(target,item){
  const title=dice(target.title,item.name);
  const targetArtists=target.artist.split(/,|&|\band\b/i).map(x=>x.trim()).filter(Boolean);
  const artist=Math.max(...targetArtists.flatMap(t=>item.artists.map(a=>dice(t,a.name))),0);
  let penalty=0;
  const wanted=target.title.toLowerCase(), found=item.name.toLowerCase();
  if(!wanted.includes('live')&&found.includes('live'))penalty+=.16;
  if(!wanted.includes('remaster')&&found.includes('remaster'))penalty+=.03;
  return Math.max(0,.72*title+.28*artist-penalty);
}
function randomString(n=80){
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes=crypto.getRandomValues(new Uint8Array(n));
  return [...bytes].map(x=>chars[x%chars.length]).join('');
}
async function sha256(s){return crypto.subtle.digest('SHA-256',new TextEncoder().encode(s))}
function base64url(buf){return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}

async function login(){
  const clientId=$('#clientId').value.trim();
  if(!clientId){alert('Client IDを入力してね');return}
  localStorage.setItem('ivy_client_id',clientId);
  const verifier=randomString(), challenge=base64url(await sha256(verifier)), state=randomString(24);
  sessionStorage.setItem('ivy_verifier',verifier);sessionStorage.setItem('ivy_state',state);
  const params=new URLSearchParams({
    client_id:clientId,response_type:'code',redirect_uri:redirectUri,scope:SCOPES,
    code_challenge_method:'S256',code_challenge:challenge,state
  });
  location.assign(`${AUTH}?${params}`);
}
async function callback(){
  const params=new URLSearchParams(location.search);
  const err=params.get('error'); if(err) throw new Error(`Spotify認証: ${err}`);
  const code=params.get('code'); if(!code)return;
  if(params.get('state')!==sessionStorage.getItem('ivy_state'))throw new Error('認証stateが一致しません');
  const body=new URLSearchParams({
    client_id:localStorage.getItem('ivy_client_id')||'',
    grant_type:'authorization_code',code,redirect_uri:redirectUri,
    code_verifier:sessionStorage.getItem('ivy_verifier')||''
  });
  const res=await fetch(TOKEN,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body});
  if(!res.ok)throw new Error('トークン取得失敗: '+await res.text());
  const data=await res.json();accessToken=data.access_token;sessionStorage.setItem('ivy_access_token',accessToken);
  history.replaceState({},'',redirectUri);
}
async function api(path,options={}){
  if(!accessToken)throw new Error('先にSpotifyへログインしてね');
  const res=await fetch(API+path,{...options,headers:{Authorization:`Bearer ${accessToken}`,'Content-Type':'application/json',...(options.headers||{})}});
  if(res.status===429){const wait=Number(res.headers.get('Retry-After')||2);await sleep(wait*1000);return api(path,options)}
  if(res.status===401){sessionStorage.removeItem('ivy_access_token');accessToken='';throw new Error('認証期限切れ。もう一度ログインしてね')}
  if(!res.ok)throw new Error(`${res.status}: ${await res.text()}`);
  return res.status===204?null:res.json();
}
async function showUser(){
  const me=await api('/me');
  $('#loginStatus').textContent=`接続済み：${me.display_name||me.id}`;
  $('#loginStatus').className='status ok';
  $('#matchBtn').disabled=false;
}

function resetTracks(){
  tracks=DEFAULT_TRACKS.map(([title,artist],i)=>({order:i+1,title,artist,status:'pending',selected:null,candidates:[]}));
  $('#trackEditor').value=tracks.map(t=>`${t.artist} - ${t.title}`).join('\n');
  render();
}
function applyEditor(){
  const lines=$('#trackEditor').value.split('\n').map(x=>x.trim()).filter(Boolean);
  tracks=lines.map((line,i)=>{
    const match=line.match(/^(.*?)\s+[–—-]\s+(.+)$/);
    return {order:i+1,artist:match?match[1].trim():'',title:match?match[2].trim():line,status:'pending',selected:null,candidates:[]};
  });
  render();
}
function label(s){return({pending:'未検索',searching:'検索中',matched:'確定',review:'要確認',missing:'未一致'})[s]||s}
function render(){
  $('#trackCount').textContent=`${tracks.length}曲`;
  const selected=tracks.filter(t=>t.selected).length;
  $('#summary').textContent=selected?`選択済み ${selected}/${tracks.length}`:'未検索';
  $('#createBtn').disabled=!selected;
  $('#results').innerHTML=tracks.map((t,i)=>{
    const found=t.selected?`<div class="found">${escapeHtml(t.selected.artists.map(a=>a.name).join(', '))} — ${escapeHtml(t.selected.name)} <span class="score">${Math.round(t.selected._score*100)}%</span></div>`:'';
    const choices=t.candidates.length?`<select data-index="${i}">${t.candidates.map((c,j)=>`<option value="${j}" ${t.selected?.id===c.id?'selected':''}>${escapeHtml(c.artists.map(a=>a.name).join(', '))} — ${escapeHtml(c.name)} (${Math.round(c._score*100)}%)</option>`).join('')}<option value="-1">この曲を除外</option></select>`:'';
    return `<div class="row ${t.status}"><div class="num">${t.order}</div><div><strong>${escapeHtml(t.artist)}</strong><br>${escapeHtml(t.title)}${found}${choices}</div><div class="badge">${label(t.status)}</div></div>`;
  }).join('');
  document.querySelectorAll('select[data-index]').forEach(el=>el.addEventListener('change',()=>{
    const t=tracks[Number(el.dataset.index)],idx=Number(el.value);
    t.selected=idx>=0?t.candidates[idx]:null;
    t.status=t.selected?(t.selected._score>=.86?'matched':'review'):'missing';
    render();
  }));
}
async function matchAll(){
  applyEditor();$('#matchBtn').disabled=true;
  for(let i=0;i<tracks.length;i++){
    const t=tracks[i];t.status='searching';render();
    try{
      const firstArtist=t.artist.split(/,|&/)[0].trim();
      const q=`track:"${t.title.replaceAll('"','')}" artist:"${firstArtist.replaceAll('"','')}"`;
      const data=await api(`/search?${new URLSearchParams({q,type:'track',limit:'5'})}`);
      const candidates=(data.tracks?.items||[]).map(item=>({...item,_score:score(t,item)})).sort((a,b)=>b._score-a._score);
      t.candidates=candidates;t.selected=candidates[0]||null;
      t.status=!t.selected?'missing':t.selected._score>=.86?'matched':'review';
    }catch(e){t.status='missing';console.error(e)}
    render();await sleep(80);
  }
  $('#matchBtn').disabled=false;
}
async function createPlaylist(){
  const chosen=tracks.filter(t=>t.selected);
  if(!chosen.length)return;
  $('#createBtn').disabled=true;
  try{
    const playlist=await api('/me/playlists',{method:'POST',body:JSON.stringify({
      name:$('#playlistName').value.trim()||'Ivy Playlist',
      description:$('#playlistDescription').value.trim(),
      public:$('#isPublic').checked
    })});
    const uris=chosen.map(t=>t.selected.uri);
    for(let i=0;i<uris.length;i+=100){
      await api(`/playlists/${playlist.id}/items`,{method:'POST',body:JSON.stringify({uris:uris.slice(i,i+100)})});
    }
    $('#done').innerHTML=`できた。${chosen.length}曲を追加しました。<br><a href="${playlist.external_urls.spotify}" target="_blank" rel="noopener">Spotifyで開く</a>`;
  }catch(e){alert(e.message);$('#createBtn').disabled=false}
}

document.addEventListener('DOMContentLoaded',async()=>{
  $('#redirectUri').textContent=redirectUri;
  $('#clientId').value=localStorage.getItem('ivy_client_id')||'';
  $('#copyRedirect').onclick=async()=>{await navigator.clipboard.writeText(redirectUri);$('#copyRedirect').textContent='コピー済み'};
  $('#loginBtn').onclick=login;$('#matchBtn').onclick=matchAll;$('#createBtn').onclick=createPlaylist;
  $('#applyBtn').onclick=applyEditor;$('#resetBtn').onclick=resetTracks;
  resetTracks();
  try{await callback();if(accessToken)await showUser()}catch(e){alert(e.message)}
});
