(function(){
const db=JSON.parse(document.getElementById('ro-data').textContent);
const itemById=new Map(db.items.map(x=>[x.id,x])),mobById=new Map(db.monsters.map(x=>[x.id,x]));
const sourcesByItem=new Map(),mapsByMob=new Map();
db.monsters.forEach(m=>m.drops.forEach(d=>{if(!sourcesByItem.has(d.item))sourcesByItem.set(d.item,[]);sourcesByItem.get(d.item).push([m,d])}));
db.maps.forEach(m=>m.spawns.forEach(s=>{if(!mapsByMob.has(s.monster))mapsByMob.set(s.monster,new Set());mapsByMob.get(s.monster).add(m.id)}));
const names={items:'ไอเท็ม',monsters:'มอนสเตอร์',maps:'แมพ'};
let kind='items',page=0,results=[];
const e=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n};
const box=e('section',undefined,'card');box.id='database';document.querySelector('.footer').before(box);
box.append(e('div','RO REFERENCE LIBRARY','eyebrow'),e('h2','ฐานข้อมูล RO · ค้นหาได้ออฟไลน์'));
box.append(e('p',`${fmt(db.items.length)} ไอเท็ม · ${fmt(db.monsters.length)} มอนสเตอร์ · ${fmt(db.maps.length)} รหัสแมพ`));
box.append(e('p','ชุดข้อมูล rAthena Renewal อ้างอิงทั่วไป ไม่ใช่ฐานข้อมูล GGT ทั้งหมด ราคา GGT ยืนยันเฉพาะรายการที่ติดป้าย ส่วนราคาผู้เล่นและบาทไทยไม่มีในชุดข้อมูลนี้','note'));
const tabs=e('div',undefined,'actions');box.append(tabs);const tabButtons={};
for(const k of Object.keys(names)){const b=e('button',names[k]);b.type='button';b.onclick=()=>{kind=k;page=0;search()};tabs.append(b);tabButtons[k]=b}
const label=e('label','ค้นหาชื่อภาษาอังกฤษ / รหัสไอเท็ม / รหัสแมพ');const query=e('input');query.type='search';query.placeholder='เช่น Poring, Fresh Pear, 1002, gef_fild12';label.append(query);box.append(label);
const checkLabel=e('label');const verified=e('input');verified.type='checkbox';verified.style.cssText='width:auto;margin-right:8px';checkLabel.append(verified,document.createTextNode('เฉพาะไอเท็มที่มีราคา NPC GGT ยืนยันแล้ว'));box.append(checkLabel);
const count=e('p',undefined,'muted'),grid=e('div'),pager=e('div',undefined,'actions'),detail=e('div');box.append(count,grid,pager,detail);
const source=e('p',undefined,'sources');const link=e('a','ข้อมูลต้นทาง rAthena · snapshot '+db.commit.slice(0,8));link.href='https://github.com/rathena/rathena/tree/'+db.commit;link.target='_blank';link.rel='noopener';source.append(link,document.createTextNode(' · ดาวน์โหลด '+db.date+' · GPL-3.0 · ชื่อส่วนใหญ่เป็นภาษาอังกฤษ'));box.append(source);
function sourceLink(type,id){const a=e('a','เปิด Divine Pride ↗');a.href='https://www.divine-pride.net/database/'+type+'/'+encodeURIComponent(id);a.target='_blank';a.rel='noopener';return a}
function action(text,fn){const b=e('button',text);b.type='button';b.onclick=fn;return b}
function show(k,x){detail.replaceChildren();detail.className='card';detail.style.marginTop='20px';detail.append(e('h2',x.name+' · '+x.id),sourceLink({items:'item',monsters:'monster',maps:'map'}[k],x.id));
if(k==='items'){
detail.append(e('p','ประเภท '+x.type+' · น้ำหนัก '+x.weight));
detail.append(e('p',x.ggt!==undefined?'ราคา NPC GGT: '+fmt(x.ggt)+' z (ประกาศ 5 ส.ค. 2026)':'ราคา NPC GGT: ยังไม่มีข้อมูลยืนยัน'));
detail.append(e('p','ราคาอ้างอิง rAthena: '+(x.price===null?'ไม่มีข้อมูล':fmt(x.price)+' z')+' · ไม่ใช่ราคาตลาด Chaos','muted'));
const inputLabel=e('label','ราคาที่บูมขายได้จริง (เซนี / ชิ้น)');const price=e('input');price.type='number';price.min='0';price.step='any';price.placeholder='ต้องกรอกราคาก่อนเพิ่ม';if(x.ggt!==undefined)price.value=x.ggt;inputLabel.append(price);detail.append(inputLabel);
const feedback=e('p');detail.append(action('เพิ่มไปคำนวณรอบฟาร์ม',()=>{if(price.value===''||!price.validity.valid||!Number.isFinite(Number(price.value))){feedback.textContent='กรอกราคาขายที่ถูกต้องก่อนค่ะ';return}addRow([x.name,0,Number(price.value)]);update();feedback.textContent='เพิ่มแล้ว กรอกจำนวนของในตารางรอบฟาร์มด้านล่าง';}),feedback,e('h3','ดรอปจากมอนสเตอร์ (ข้อมูลอ้างอิง)'));
const origins=sourcesByItem.get(x.id)||[];if(!origins.length)detail.append(e('p','ไม่มีแหล่งดรอปบันทึกในชุดนี้'));
origins.forEach(([m,d])=>detail.append(action(m.name+' · '+d.rate+'%'+(d.mvp?' · รางวัล MVP':''),()=>show('monsters',m))));
}else if(k==='monsters'){
detail.append(e('p',`Lv. ${x.level} · HP ${fmt(x.hp)} · ${x.race} · ${x.element}`),e('h3','ไอเท็มดรอป · อัตราจาก rAthena ไม่ยืนยัน GGT'));
if(!x.drops.length)detail.append(e('p','ไม่มีข้อมูลดรอปในชุดนี้'));
x.drops.forEach(d=>{const item=itemById.get(d.item);detail.append(action((item?.name||d.name)+' · '+d.rate+'%'+(d.mvp?' · รางวัล MVP':''),()=>item&&show('items',item)))});
detail.append(e('h3','แมพที่พบในข้อมูลการเกิด rAthena'));const places=[...(mapsByMob.get(x.id)||[])];if(!places.length)detail.append(e('p','ไม่มีข้อมูลการเกิดในแมพทั่วไปของชุดนี้ อาจเป็นมอนสเตอร์กิจกรรมหรืออินสแตนซ์'));
places.forEach(id=>detail.append(action(id,()=>show('maps',db.maps.find(m=>m.id===id)))));
}else{
if(x.id==='gef_fild12')detail.append(e('p','GGT ปรับแมพนี้สำหรับ Dimensional Rift: บูมรายงาน Timbers, Deadween และ Burning Knight แต่ยังยืนยันรายการทั้งหมดไม่ได้ ข้อมูลด้านล่างเป็น rAthena เท่านั้น','note'));
detail.append(e('h3','มอนสเตอร์ในข้อมูลการเกิด rAthena'));
const spawn=new Map();x.spawns.forEach(s=>spawn.set(s.monster,(spawn.get(s.monster)||0)+s.count));
if(!spawn.size)detail.append(e('p','มีรหัสแมพ แต่ไม่มีข้อมูลการเกิดมอนสเตอร์ในชุดนี้ ไม่ได้แปลว่าในเกมไม่มีมอนสเตอร์'));
spawn.forEach((n,id)=>{const m=mobById.get(id);detail.append(action((m?.name||id)+' · '+n+' ตัว',()=>m&&show('monsters',m)))});
}detail.scrollIntoView({behavior:'smooth',block:'nearest'})}
function search(){const q=query.value.trim().toLowerCase();results=db[kind].filter(x=>(!verified.checked||kind!=='items'||x.ggt!==undefined)&&[x.name,x.id,x.code].some(v=>String(v??'').toLowerCase().includes(q)));render()}
function render(){Object.entries(tabButtons).forEach(([k,b])=>{b.setAttribute('aria-pressed',String(k===kind));b.style.background=k===kind?'#45613b':''});checkLabel.hidden=kind!=='items';count.textContent=`พบ ${fmt(results.length)} ${names[kind]} · หน้า ${page+1} / ${Math.max(1,Math.ceil(results.length/30))}`;grid.replaceChildren();grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:8px;margin:16px 0';results.slice(page*30,page*30+30).forEach(x=>{const b=action(x.name+'\n#'+x.id+(x.ggt!==undefined?' · GGT '+fmt(x.ggt)+' z':''),()=>show(kind,x));b.style.cssText='text-align:left;white-space:pre-line';grid.append(b)});if(!results.length)grid.append(e('p','ไม่พบข้อมูล ลองค้นด้วยชื่ออังกฤษหรือรหัส'));pager.replaceChildren();const prev=action('← ก่อนหน้า',()=>{page--;render()}),next=action('ถัดไป →',()=>{page++;render()});prev.disabled=page===0;next.disabled=(page+1)*30>=results.length;pager.append(prev,next)}
query.oninput=()=>{page=0;search()};verified.onchange=()=>{page=0;search()};search();
})();
