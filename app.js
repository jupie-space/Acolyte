const places = [
  { id:'cafe', name:'Café du Capitole', kind:'Café', detail:'A cosy stop for coffee or studying with a friend.', x:62,y:26 },
  { id:'library', name:'BU Arsenal', kind:'Study', detail:'A quiet library near Université Toulouse Capitole.', x:45,y:16 },
  { id:'park', name:'Jardin des Plantes', kind:'Outdoors', detail:'A leafy spot for a walk or a picnic.', x:78,y:76 },
];
const buddies = [
  {id:'maya',name:'Maya',campus:'ICAM',languages:'French · English · Tagalog', tags:['Art','Volleyball','Cafés'], bio:'Looking for someone to explore the city and play volleyball with.'},
  {id:'lucas',name:'Lucas',campus:'INSA',languages:'French · English',tags:['Hiking','Cooking','Games'],bio:'Up for hikes, food spots and game nights.'},
  {id:'elena',name:'Elena',campus:'Toulouse III',languages:'English · Spanish',tags:['Books','Art','Languages'],bio:'I love museums and language exchanges.'},
];
const events = [
  {id:'exchange',name:'Language Exchange',kind:'Social',day:'19',month:'NOV',when:'Thu, 19 Nov · 6–8 PM',where:'Café des Étudiants'},
  {id:'climbing',name:'Bouldering Session',kind:'Sports',day:'21',month:'NOV',when:'Sat, 21 Nov · 2–5 PM',where:'The Roof Toulouse'},
  {id:'walk',name:'City Discovery Walk',kind:'Outdoors',day:'22',month:'NOV',when:'Sun, 22 Nov · 3–6 PM',where:'Capitole to the Garonne'},
  {id:'sketch',image:'park',name:'Campus Sketch Walk',kind:'Culture',day:'08',month:'NOV',when:'Sun, 8 Nov · 2–4 PM',where:'Jardin des Plantes',past:true},
];
const initial = {saved:[],joined:[],requests:[],name:'Alex',campus:'ICAM Toulouse',bio:'New in Toulouse and looking for people to explore the city with.', interests:'Art, Volleyball, Hiking, Cafés, Travel, Languages'};
let state = {...initial};
try { state = {...initial,...JSON.parse(localStorage.getItem('acolyte-v1') || '{}')}; } catch {}
const app = document.querySelector('#app');
const views = ['home','explore','buddies','activities','space'];
const filters = {place:'All',buddy:'For you',event:'All',time:'Upcoming',space:'Overview'};
let selected = '';
let query = '';
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const intro = (title,desc) => `<div class="intro"><h1>${title} <span class="spark" aria-hidden="true">✧</span></h1><p>${desc}</p></div>`;
const img = (name,cls='') => `<img src="img/${name}.webp" alt="" class="${cls}">`;
const tags = values => `<div class="tags">${values.map(v=>`<span class="tag">${escapeHTML(v)}</span>`).join('')}</div>`;
const pills = (key,options) => `<div class="filters" role="group" aria-label="${{place:'Place category',buddy:'Buddy matching',event:'Event category',time:'Event schedule',space:'Profile section'}[key]}">${options.map(v=>`<button class="pill" data-filter="${key}" data-value="${v}" aria-pressed="${filters[key]===v}">${v}</button>`).join('')}</div>`;
const empty = text => `<p class="empty">${text}</p>`;
const button = (type,id,label,active=false) => `<button class="button${active?' soft':''}" data-action="${type}" data-id="${id}" aria-pressed="${active}">${label}</button>`;
const savePlace = p => `<button class="icon" data-action="saved" data-id="${p.id}" aria-label="Save ${p.name}" aria-pressed="${state.saved.includes(p.id)}">${state.saved.includes(p.id)?'♥':'♡'}</button>`;
function home(){
  return `<section class="hero"><div class="hero-copy"><h1>Find your people in Toulouse<span class="spark"> ✦</span></h1><p>Get to know your new city, meet other students, and make plans together.</p><a class="button" href="#explore">Explore Toulouse →</a></div><div class="hero-image" role="img" aria-label="Toulouse skyline beside the Garonne"></div></section><div class="grid">${[['explore','⌖','Find places','Discover study spots, cafés and parks.'],['buddies','♡','Meet buddies','Find students who share your interests.'],['activities','▦','Join activities','Make plans for your next free afternoon.']].map(([link,icon,title,copy])=>`<a class="card" href="#${link}"><div class="symbol" aria-hidden="true">${icon}</div><h2>${title} →</h2><p>${copy}</p></a>`).join('')}</div>`;
}
function placeRow(p){
 return `<article class="row ${selected===p.id?'selected':''}">${img(p.id)}<div class="body"><button class="place-title" data-action="pin" data-id="${p.id}">${p.name}</button><p>${p.kind} · Toulouse</p><p>${p.detail}</p></div>${savePlace(p)}</article>`;
}
function placeResults(){
 const results=places.filter(p=>(filters.place==='All'||p.kind===filters.place)&&`${p.name} ${p.kind}`.toLowerCase().includes(query.trim().toLowerCase()));
 return `<div class="stack">${results.map(placeRow).join('')||empty('No places match your search.')}</div><div class="map" aria-label="Illustrated Toulouse map"><canvas aria-hidden="true" width="700" height="500"></canvas>${results.map((p)=>`<button class="pin" style="left:${p.x}%;top:${p.y}%" title="${p.name}" aria-label="${p.name}" aria-pressed="${selected===p.id}" data-action="pin" data-id="${p.id}">${{cafe:'☕',library:'▤',park:'♣'}[p.id]}</button>`).join('')}<span class="map-note">${results.find(p=>p.id===selected)?.name||'Toulouse · Illustrated map'}</span></div>`;
}
function paintMap(){
 const ctx=app.querySelector('canvas')?.getContext('2d');
 if(!ctx) return;
 ctx.fillStyle='#f5e7df';ctx.fillRect(0,0,700,500);
 for(const [x,y,w,h] of [[55,62,110,49],[300,318,87,105],[483,340,132,89],[521,46,84,74],[172,209,78,51],[17,350,72,83]]){ctx.fillStyle='#d9e6be';ctx.fillRect(x,y,w,h);}
 ctx.strokeStyle='#a9d4e3';ctx.lineWidth=44;ctx.beginPath();ctx.moveTo(35,-15);ctx.bezierCurveTo(270,42,78,185,213,282);ctx.bezierCurveTo(333,363,240,441,383,520);ctx.stroke();
 ctx.strokeStyle='#fffaf5';
 for(let i=0;i<15;i++){ctx.lineWidth=i%3===0?8:3;ctx.beginPath();ctx.moveTo(i*59-130,0);ctx.lineTo(i*53+15,250);ctx.lineTo(i*55+155,500);ctx.stroke();}
 for(let i=0;i<12;i++){ctx.lineWidth=i%3===0?7:3;ctx.beginPath();ctx.moveTo(0,i*49);ctx.lineTo(315,i*41+22);ctx.lineTo(700,i*44-77);ctx.stroke();}
}
function explore(){
 return intro('Explore the city','Find student-friendly places to study, eat and unwind.')+`<div class="actions"><input class="search" type="search" aria-label="Search for a place" placeholder="Search for a place…" value="${escapeHTML(query)}"><span class="tag">⌖ Toulouse</span></div>`+pills('place',['All','Café','Study','Outdoors'])+`<div class="split" id="place-results">${placeResults()}</div>`;
}
function buddyRow(b){
 const sent=state.requests.includes(b.id);
 return `<article class="row buddy">${img(b.id,'avatar')}<div class="body"><h3>${b.name} <span class="tag">${b.campus}</span></h3><p>${b.languages}</p>${tags(b.tags)}<p>${b.bio}</p></div><div class="actions">${button('requests',b.id,sent?'Requested':'Connect',sent)}</div></article>`;
}
function meet(){
 const f=filters.buddy;
 const list=buddies.filter(b=>f==='For you'||(f==='Same campus'&&b.campus==='ICAM')||(f==='Same interests'&&b.tags.some(t=>state.interests.toLowerCase().split(',').map(v=>v.trim()).includes(t.toLowerCase())))||(f==='Same language'&&b.languages.includes('French')));
 return intro('Meet your people','Connect with other students in Toulouse.')+pills('buddy',['For you','Same campus','Same interests','Same language'])+`<div class="stack">${list.map(buddyRow).join('')||empty('No buddies match this filter.')}</div>`;
}
function eventRow(e){
 const joined=state.joined.includes(e.id);
 return `<article class="row event">${img(e.image||e.id)}<div class="date" aria-hidden="true"><b>${e.day}</b>${e.month}</div><div class="body"><h3>${e.name}</h3><p>${e.where} · ${e.when}</p>${tags([e.kind])}</div><div class="actions">${e.past?'':button('joined',e.id,joined?'Joined':'Join',joined)}</div></article>`;
}
function activities(){
 const list=events.filter(e=>(filters.event==='All'||e.kind===filters.event)&&(filters.time==='Past'?e.past:filters.time==='My events'?state.joined.includes(e.id):!e.past));
 return intro('Activities &amp; events','Find student meetups, workshops and things to do around Toulouse.')+pills('time',['Upcoming','My events','Past'])+pills('event',['All','Social','Sports','Culture','Outdoors'])+`<div class="stack">${list.map(eventRow).join('')||empty('There are no events in this view.')}</div>`;
}
function space(){
 const tab=filters.space;
 const saved=places.filter(p=>state.saved.includes(p.id));
 const joined=events.filter(e=>state.joined.includes(e.id));
 const requested=buddies.filter(b=>state.requests.includes(b.id));
 const sections={'My activities':joined.map(eventRow).join('')||empty('You haven’t joined any activities yet.'),'Saved places':saved.map(placeRow).join('')||empty('Save a place from Explore to see it here.'),'My buddies':requested.map(buddyRow).join('')||empty('Your demo buddy requests will appear here.')};
 return intro('My space','Your plans, saved places and profile.')+pills('space',['Overview','My activities','Saved places','My buddies'])+(tab!=='Overview'?`<div class="stack">${sections[tab]}</div>`:`<section class="profile-panel"><div class="cover"></div><div class="profile-content"><div class="profile-head"><div><h2>${escapeHTML(state.name)}</h2><p>${escapeHTML(state.campus)} · Toulouse</p></div><button class="button soft" data-action="edit">Edit profile</button></div><div class="stats">${[[saved.length,'Saved places'],[joined.length,'My activities'],[requested.length,'My buddies']].map(([n,label])=>`<button class="pill" data-filter="space" data-value="${label}"><b>${n}</b>${label}</button>`).join('')}</div><h3>About me</h3><p>${escapeHTML(state.bio)}</p><h3>My interests</h3>${tags(state.interests.split(',').map(v=>v.trim()).filter(Boolean))}</div></section><dialog><form><h2>Edit profile</h2><label>Name<input name="name" required maxlength="45" value="${escapeHTML(state.name)}"></label><label>Campus<input name="campus" required maxlength="75" value="${escapeHTML(state.campus)}"></label><label>About me<textarea name="bio" maxlength="250">${escapeHTML(state.bio)}</textarea></label><label>Interests (separated by commas)<input name="interests" maxlength="120" value="${escapeHTML(state.interests)}"></label><div class="actions"><button class="button">Save changes</button><button class="button soft" type="button" data-action="cancel">Cancel</button></div></form></dialog>`);
}
const page = () => views.includes(location.hash.slice(1))?location.hash.slice(1):'home';
function render(){
 const current=page();
 app.innerHTML=({home,explore,buddies:meet,activities,space})[current]();
 document.querySelectorAll('.bar a').forEach(a=>{
   if(a.getAttribute('href')==='#'+current&&!a.classList.contains('brand')) a.setAttribute('aria-current','page');
   else a.removeAttribute('aria-current');
 });
 if(current==='explore') paintMap();
}
function persist(){try{localStorage.setItem('acolyte-v1',JSON.stringify(state));}catch{}}
app.addEventListener('click',e=>{
 const control=e.target.closest('button');
 if(!control) return;
 const {action,id,filter,value}=control.dataset;
 if(filter){filters[filter]=value;if(filter==='time')filters.event='All';}
 else if(action==='edit'){app.querySelector('dialog').showModal();return;}
 else if(action==='cancel'){app.querySelector('dialog').close();return;}
 else if(action==='pin'){selected=id;}
 else if(['saved','joined','requests'].includes(action)){
   state[action]=state[action].includes(id)?state[action].filter(item=>item!==id):[...state[action],id];
   persist();
 }else return;
 render();
 const next=[...app.querySelectorAll('button')].find(b=>b.dataset.filter===filter&&b.dataset.value===value&&b.dataset.action===action&&b.dataset.id===id&&b.className===control.className);
 if(next) next.focus({preventScroll:true});
});
app.addEventListener('input',e=>{
 if(!e.target.matches('.search')) return;
 query=e.target.value;
 document.querySelector('#place-results').innerHTML=placeResults();
 paintMap();
});
app.addEventListener('submit',e=>{
 e.preventDefault();
 for(const [key,value] of new FormData(e.target)) state[key]=value.trim();
 persist();render();app.querySelector('[data-action="edit"]').focus();
});
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);app.tabIndex=-1;app.focus({preventScroll:true});});
render();
