// CampusCompass routes over the supplied campus key plan and block floor plans.
const NS='http://www.w3.org/2000/svg', $=id=>document.getElementById(id);
const places=[],edges=[];
const add=(id,name,type,x,y,block='',floor='',aliases=[])=>places.push({id,name,type,x,y,block,floor,aliases});
const chain=(...ids)=>{for(let i=1;i<ids.length;i++)edges.push([ids[i-1],ids[i]])};

// Walkable passages from the campus key plan, with block bridges and corridor spines.
add('gate','Main Entrance','Entrance',16,310,'Campus');
add('rd-hall','R & D Block Passage','Junction',150,310,'R & D');
add('b-west','B Block West Passage','Junction',228,300,'B');
add('b-mid','B Block Main Passage','Corridor',420,300,'B');
add('b-east','B Block East Passage','Junction',615,300,'B');
add('bc-bridge','Bridge to C Block','Stair connector',420,250,'B','Ground');
add('c-west','C Block West Passage','Junction',105,190,'C');
add('c-mid','C Block Main Passage','Corridor',420,190,'C');
add('c-east','C Block East Passage','Junction',815,190,'C');
add('cd-bridge','Bridge to D Block','Stair connector',780,120,'C','Ground');
add('d-west','D Block West Passage','Junction',420,72,'D');
add('d-mid','D Block Main Passage','Corridor',720,72,'D');
add('d-east','D Block East Passage','Junction',1025,72,'D');
add('ab-bridge','Bridge to A Block','Stair connector',420,328,'B','Ground');
add('a-west','A Block West Passage','Junction',220,365,'A');
add('a-mid','A Block Lobby','Corridor',320,365,'A');
add('a-east','A Block East Passage','Junction',420,365,'A');
chain('gate','rd-hall','b-west','b-mid','b-east');
chain('b-mid','bc-bridge','c-mid');
chain('c-west','c-mid','c-east');
chain('c-east','cd-bridge','d-mid');
chain('d-west','d-mid','d-east');
chain('b-mid','ab-bridge','a-mid');
chain('a-west','a-mid','a-east');

function addRoom(id,block,floor,x,hallY,hallId){
  const y=hallY+(block==='A'?19:-15),door=`${id}-door`;
  add(id,id,'Classroom',x,y,block,floor);
  add(door,`${id} doorway`,'Junction',x,hallY,block,floor);
  edges.push([hallId,door],[door,id]);
}
function addRoomRow(block,floor,codes,minX,maxX,hallY,hallPrefix){
  const count=codes.length,ids=[];
  codes.forEach((code,index)=>{
    const id=`${block}${code}`,x=count===1?(minX+maxX)/2:minX+(maxX-minX)*index/(count-1),hallId=`${hallPrefix}-hall-${index}`;
    add(hallId,`${block} ${floor} corridor`,'Junction',x,hallY,block,floor);
    if(index)edges.push([`${hallPrefix}-hall-${index-1}`,hallId]);
    ids.push([id,x,hallId]);
  });
  return ids;
}
function numRange(first,last,pad=0){return Array.from({length:last-first+1},(_,i)=>String(first+i).padStart(pad,'0'))}

const FLOOR_HALLS={
  A:{Ground:{y:365,x1:232,x2:418,codes:numRange(101,105)},First:{y:365,x1:232,x2:418,codes:numRange(201,206)},Second:{y:365,x1:232,x2:418,codes:numRange(301,305)}},
  B:{Ground:{y:300,x1:235,x2:610,codes:numRange(1,18,3)},First:{y:300,x1:235,x2:610,codes:numRange(101,116)},Second:{y:300,x1:235,x2:610,codes:numRange(201,218)}},
  C:{Ground:{y:190,x1:105,x2:815,codes:numRange(101,128)},First:{y:190,x1:105,x2:815,codes:numRange(201,225)},Second:{y:190,x1:105,x2:815,codes:numRange(301,325)}}
};
Object.entries(FLOOR_HALLS).forEach(([block,floors])=>Object.entries(floors).forEach(([floor,info])=>{
  const prefix=`${block}-${floor.toLowerCase()}`;
  const row=addRoomRow(block,floor,info.codes,info.x1,info.x2,info.y,prefix);
  row.forEach(([id,x,hallId])=>addRoom(id,block,floor,x,info.y,hallId));
  const stairX=block==='A'?420:block==='B'?420:block==='C'?780:720,stairId=`${block}-${floor.toLowerCase()}-stairs`;
  add(stairId,`${block} Block ${floor} floor staircase`,'Stair connector',stairX,info.y,block,floor);
  edges.push([`${prefix}-hall-${Math.floor(info.codes.length/2)}`,stairId]);
  if(floor==='Ground'){
    const entrance=block==='A'?'a-mid':block==='B'?'b-mid':block==='C'?'c-mid':'d-mid';
    edges.push([entrance,stairId]);
  } else {
    const previous=floor==='First'?'ground':'first';
    edges.push([`${block}-${previous}-stairs`,stairId]);
  }
}));

// Named facilities visible in the provided block plans.
add('a-hod','H.O.D. IT Department','Faculty room',365,365,'A','Ground');edges.push(['a-mid','a-hod']);
add('a-lab','Programming Lab IT','Laboratory',405,365,'A','First');edges.push(['A-first-stairs','a-lab']);
add('b-repro','Reprography Centre','Service facility',320,300,'B','Ground',['reprography','photocopy']);edges.push(['b-mid','b-repro']);
add('b-auditorium','Mini Auditorium','Facility',310,300,'B','Ground',['auditorium']);edges.push(['b-mid','b-auditorium']);
add('c-library','Central Library','Library',575,190,'C','Ground',['library']);edges.push(['c-mid','c-library']);
add('c-seminar','Seminar Hall','Facility',790,190,'C','Second');edges.push(['C-second-stairs','c-seminar']);
add('d-block','D Block','Landmark',920,72,'D');edges.push(['d-mid','d-block']);
add('rd-block','R & D Block','Landmark',90,285,'R & D');edges.push(['rd-hall','rd-block']);

const place=id=>places.find(p=>p.id===id),norm=s=>String(s||'').toLowerCase().replace(/[\s_-]+/g,'').trim();
let activePath=[],activeDestination=null,zoom=1,panX=0,panY=0,toastTimer,dragState=null;
const floorAssets={A:{Ground:'assets/a-ground-floor.jpg',First:'assets/a-first-floor.jpg',Second:'assets/a-second-floor.jpg'},B:{Ground:'assets/b-ground-floor.jpg',First:'assets/b-first-floor.jpg',Second:'assets/b-second-floor.jpg'},C:{Ground:'assets/c-ground-floor.jpg',First:'assets/c-first-floor.jpg',Second:'assets/c-second-floor.jpg'}};
function findPlace(value){const q=norm(value);return places.find(p=>p.type!=='Junction'&&norm(p.name)===q)||places.find(p=>p.type!=='Junction'&&(norm(p.id)===q||(p.aliases||[]).some(a=>norm(a)===q)))||places.find(p=>p.type!=='Junction'&&norm(p.name).includes(q)&&q.length>0)}
function getPath(start,end){const graph=Object.fromEntries(places.map(p=>[p.id,[]]));edges.forEach(([a,b])=>{graph[a]?.push(b);graph[b]?.push(a)});const queue=[start],prev={[start]:null};while(queue.length){const v=queue.shift();if(v===end)break;(graph[v]||[]).forEach(n=>{if(!(n in prev)){prev[n]=v;queue.push(n)}})}if(!(end in prev))return null;const path=[];for(let v=end;v!==null;v=prev[v])path.unshift(v);return path}
function el(tag,attrs={},txt=''){const e=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(txt)e.textContent=txt;return e}
function drawMap(){const svg=$('indoorMap');if(!svg)return;svg.innerHTML='';svg.setAttribute('viewBox','0 0 1024 512');svg.append(el('image',{href:'assets/campus-key-plan-final.jpg',x:0,y:0,width:1024,height:512,preserveAspectRatio:'none'}));const overlay=el('g',{transform:'translate(107 150) scale(.638)'});svg.append(overlay);
  places.filter(p=>!['Junction','Corridor','Stair connector'].includes(p.type)&&p.type!=='Classroom').forEach(p=>{const x=p.x+45,g=el('g',{class:'map-place','data-place-id':p.id,tabindex:0,role:'button','aria-label':`Navigate to ${p.name}`});g.append(el('circle',{cx:x,cy:p.y,r:8,class:'map-pin landmark-pin'}));if(['Entrance','Library','Service facility','Landmark'].includes(p.type))g.append(el('text',{x,y:p.y-12,class:'map-pin-label'},p.name));overlay.append(g)});
  if(activePath.length){const routePlaces=activePath.map(id=>place(id)).filter(Boolean),pts=routePlaces.map(p=>`${p.x+45},${p.y}`).join(' ');if(routePlaces.length>1){overlay.append(el('polyline',{points:pts,fill:'none',stroke:'#fff','stroke-width':16,'stroke-linecap':'round','stroke-linejoin':'round'}));overlay.append(el('polyline',{points:pts,fill:'none',stroke:'#2678f0','stroke-width':8,'stroke-linecap':'round','stroke-linejoin':'round'}))}
    routePlaces.filter(p=>p.type==='Classroom').forEach(p=>overlay.append(el('circle',{cx:p.x+45,cy:p.y,r:7,class:'room-route-pin'})));
    const current=place($('startSelect').value);if(current)addLocationMarker(svg,routePlaces[0],true);
  }
  if(activeDestination)addLocationMarker(svg,activeDestination,false);
}
function addLocationMarker(svg,p,isStart){if(!p)return;const x=107+(p.x+45)*.638,y=150+p.y*.638,label=isStart?'YOU ARE HERE':p.name,width=Math.max(88,Math.min(190,label.length*6.5+18)),lx=Math.max(8,Math.min(1016-width,x-width/2)),ly=Math.max(8,y-48),g=el('g',{class:isStart?'you-are-here-marker':'destination-marker','aria-label':label});g.append(el('path',{d:`M${x} ${y+16} C${x+6} ${y+6} ${x+13} ${y-2} ${x+13} ${y-11} A13 13 0 1 0 ${x-13} ${y-11} C${x-13} ${y-2} ${x-6} ${y+6} ${x} ${y+16} Z`,class:isStart?'pin-start':'pin-destination'}));g.append(el('circle',{cx:x,cy:y-11,r:4.5,fill:'#fff'}));g.append(el('rect',{x:lx,y:ly,width,height:22,rx:7,class:'map-location-label'}));g.append(el('text',{x:lx+width/2,y:ly+14,'text-anchor':'middle',class:'map-location-text'},label));svg.append(g)}
function icon(p){return p.type==='Classroom'?'▦':p.type==='Library'?'▤':p.type==='Service facility'?'▧':p.type==='Laboratory'?'⌘':p.type==='Entrance'?'⌂':p.type==='Stair connector'?'↕':'⌖'}
function init(){const destinations=places.filter(p=>p.type!=='Junction'&&p.type!=='Corridor'&&p.type!=='Stair connector');destinations.forEach(p=>{const o=document.createElement('option');o.value=p.name;$('destinationOptions').append(o)});const first=document.createElement('option');first.value='';first.textContent='Choose your location';first.disabled=true;first.selected=true;$('startSelect').append(first);places.filter(p=>p.type!=='Junction').forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.name;$('startSelect').append(o)});
  ['A101','A201','B-repro','C-library','d-block','rd-block'].forEach(id=>{const p=place(id),b=document.createElement('button');b.className='suggestion';b.textContent=p.name;b.onclick=()=>selectDestination(p);$('suggestionButtons').append(b)});
  $('quickList').addEventListener('click',e=>{const button=e.target.closest('[data-place-id]');const p=button&&place(button.dataset.placeId);if(p)selectDestination(p)});
  $('indoorMap').addEventListener('click',e=>{const pin=e.target.closest('.map-place');if(pin){const p=place(pin.dataset.placeId);if(p)selectDestination(p)}});$('indoorMap').addEventListener('keydown',e=>{if(e.key!=='Enter'&&e.key!==' ')return;const pin=e.target.closest('.map-place');if(pin){e.preventDefault();const p=place(pin.dataset.placeId);if(p)selectDestination(p)}});
  $('blockPlanSelect').onchange=()=>{if($('blockPlanSelect').value)openFloorPlan($('blockPlanSelect').value,'Ground');$('blockPlanSelect').value=''};
}
function selectDestination(p){$('destinationInput').value=p.name;activeDestination=p;drawMap();navigate()}
function toast(message){const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2400)}
function directions(path,destination){const steps=[];const nodes=path.map(id=>place(id)).filter(Boolean);const start=nodes.find(p=>p.type!=='Junction'&&p.type!=='Corridor'&&p.type!=='Stair connector');steps.push({title:`Start at ${start?.name||'your selected location'}`,small:'Follow the highlighted passages'});nodes.filter(p=>p.type==='Stair connector').forEach(p=>{const isBridge=p.name.toLowerCase().includes('bridge');steps.push({title:isBridge?`Cross ${p.name}`:`Use the stairs in ${p.block} Block`,small:isBridge?'Follow the connecting passage':`${p.floor} floor connection`})});const entries=nodes.filter(p=>p.type==='Entrance'&&p!==start);entries.forEach(p=>steps.push({title:`Enter ${p.block} Block`,small:'Continue along the block passage'}));steps.push({title:`Arrive at ${destination.name}`,small:`${destination.block} Block · ${destination.floor||'Campus'}`});return steps.map((s,i)=>`<li><span class="step-number">${i===steps.length-1?'✓':i+1}</span><div><strong>${s.title}</strong><small>${s.small}</small></div></li>`).join('')}
function showDetails(destination,path){$('destinationPlaceholder').hidden=true;const panel=$('routeDetails');panel.hidden=false;const planButton=floorAssets[destination.block]?`<button class="view-plan-btn" id="openFloorPlan">View ${destination.block} Block floor plans <span>↗</span></button>`:'';panel.innerHTML=`<div class="destination-icon">${icon(destination)}</div><p class="eyebrow">${destination.type.toUpperCase()}</p><h3>${destination.name}</h3><div class="destination-meta">${destination.block} Block · ${destination.floor||'Campus'} floor</div>${planButton}<ol class="route-list">${directions(path,destination)}</ol>`;if(floorAssets[destination.block])$('openFloorPlan').onclick=()=>openFloorPlan(destination.block,destination.floor||'Ground')}
function navigate(){const destination=findPlace($('destinationInput').value),start=place($('startSelect').value);if(!destination){activeDestination=null;activePath=start?[start.id]:[];drawMap();toast('Search for a room, library, reprography, or campus place.');return}activeDestination=destination;if(!start){activePath=[];drawMap();toast('Destination pinned. Choose your current location for directions.');return}const path=getPath(start.id,destination.id);if(!path){activePath=[start.id];drawMap();toast('No connected passage is mapped for this route.');return}activePath=path;drawMap();showDetails(destination,path);$('routeState').textContent=start.id===destination.id?'YOU ARE HERE':'ROUTE FOUND';$('crumb').textContent=destination.name;toast('Route found to '+destination.name)}
function updateView(){const t=$('mapTransform'),stage=$('mapStage');panX=Math.min(0,Math.max(stage.clientWidth*(1-zoom),panX));panY=Math.min(0,Math.max(stage.clientHeight*(1-zoom),panY));t.style.transform=`translate(${panX}px,${panY}px) scale(${zoom})`;stage.classList.toggle('can-pan',zoom>1)}
function reset(){const start=place($('startSelect').value);activeDestination=null;activePath=start?[start.id]:[];drawMap();$('destinationInput').value='';$('destinationPlaceholder').hidden=false;$('routeDetails').hidden=true;$('routeDetails').innerHTML='';$('routeState').textContent=start?'START SET':'READY';$('crumb').textContent=start?start.name:'Campus map'}
function openFloorPlan(block,floor){if(!floorAssets[block])return;const modal=$('planModal');$('planTitle').textContent=`${block} Block · Floor Plan`;const controls=$('floorTabs');controls.innerHTML='';[['Ground','Ground floor'],['First','First floor'],['Second','Second floor']].forEach(([key,label])=>{const b=document.createElement('button');b.className='floor-tab'+(floor===key?' active':'');b.textContent=label;b.onclick=()=>showFloor(block,key);controls.append(b)});modal.hidden=false;document.body.classList.add('modal-open');showFloor(block,floorAssets[block][floor]?floor:'Ground')}
function showFloor(block,floor){$('planImage').src=floorAssets[block][floor];$('planImage').alt=`${block} Block ${floor.toLowerCase()} floor plan`;document.querySelectorAll('.floor-tab').forEach((b,i)=>b.classList.toggle('active',['Ground','First','Second'][i]===floor));$('planFloorLabel').textContent=`${block} Block · ${floor} Floor`}
function closeFloorPlan(){$('planModal').hidden=true;document.body.classList.remove('modal-open')}
$('findRoute').onclick=navigate;$('destinationInput').onkeydown=e=>{if(e.key==='Enter')navigate()};$('clearSearch').onclick=()=>{$('destinationInput').value='';$('destinationInput').focus()};$('resetMap').onclick=()=>{zoom=1;panX=0;panY=0;updateView();reset();toast('Campus map reset')};$('zoomIn').onclick=()=>{zoom=Math.min(3,zoom+.2);updateView()};$('zoomOut').onclick=()=>{zoom=Math.max(1,zoom-.2);updateView()};$('navExam').onclick=()=>{$('destinationInput').focus();toast('Search for your exam room.')};$('startSelect').onchange=()=>{if(!$('startSelect').value){activePath=[];drawMap();return}if($('destinationInput').value.trim())navigate();else{activePath=[$('startSelect').value];drawMap();$('routeState').textContent='START SET';$('crumb').textContent=place($('startSelect').value).name;toast('Starting point set to '+place($('startSelect').value).name)}};$('destinationInput').oninput=()=>{if(!$('destinationInput').value.trim())reset()};
$('closePlan').onclick=closeFloorPlan;$('planModal').addEventListener('click',e=>{if(e.target===$('planModal'))closeFloorPlan()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeFloorPlan()});
const stage=$('mapStage');stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(1,Math.min(3,zoom*(e.deltaY<0?1.12:.9)));updateView()},{passive:false});stage.addEventListener('pointerdown',e=>{if(zoom<=1||e.target.closest('.map-place'))return;dragState={x:e.clientX,y:e.clientY,panX,panY,moved:false};stage.setPointerCapture(e.pointerId);stage.classList.add('is-panning')});stage.addEventListener('pointermove',e=>{if(!dragState)return;const dx=e.clientX-dragState.x,dy=e.clientY-dragState.y;if(Math.abs(dx)+Math.abs(dy)>4)dragState.moved=true;if(dragState.moved){panX=dragState.panX+dx;panY=dragState.panY+dy;updateView()}});const stopPan=()=>{dragState=null;stage.classList.remove('is-panning')};stage.addEventListener('pointerup',stopPan);stage.addEventListener('pointercancel',stopPan);
init();drawMap();
