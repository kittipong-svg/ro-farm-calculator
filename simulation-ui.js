(function(){
const kordt=[
  {name:'Timbers',id:21954,drops:[['Wood Block',22.5],['Resin',20],['Trunk',15],['Rough Shadowdecon',1.5],['Rough Zelunium',1.5],['Shadowdecon',.25],['Zelunium',.25],['Timbers Card',.01]]},
  {name:'Deadween',id:21949,drops:[['Congealed Poison',23.5],['Rotten Meat',17.5],['Animal Skin',15],['Rough Shadowdecon',1.5],['Rough Zelunium',1.5],['Shadowdecon',.25],['Zelunium',.25],['Deadween Card',.01]]},
  {name:'Burning Night / Knight',id:21946,drops:[['Blaze Stone',23.5],['Burning Heart',17.5],['Burning Horseshoe',20],['Rough Shadowdecon',1.5],['Rough Zelunium',1.5],['Shadowdecon',.25],['Zelunium',.25],['Burning Knight Card',.01]]}
];
const simKey='boom-ro-simulation-v2',oldKey='boom-ro-simulation-v1';
const el=id=>document.getElementById(id);
const itemByName=new Map(db.items.map(i=>[i.name,i]));
const itemById=new Map(db.items.map(i=>[i.id,i]));
const monsterById=new Map(db.monsters.map(m=>[m.id,m]));
const cachedMonsterImages=new Set([2668,1323,1391,1074,1073,1266,21954,21949,21946]);
const maps=db.maps.filter(m=>m.id==='gef_fild12'||m.spawns.some(s=>monsterById.has(s.monster)));
let saved={};
try{saved=JSON.parse(localStorage.getItem(simKey))||{}}catch{}
if(!saved.maps){try{const old=JSON.parse(localStorage.getItem(oldKey));if(old)saved={map:'gef_fild12',maps:{gef_fild12:{...old,prices:Object.fromEntries(Object.entries(old.prices||{}).filter(([,v])=>v!==''))}}}}catch{}}
let currentMonsters=[],kills=new Map(),prices=new Map(),rates=new Map(),counts=new Map(),units=new Map(),totals=new Map();
const select=el('sim-map');
const mapSearch=el('sim-map-search'),mapSuggestions=el('sim-map-suggestions');
const mapLabel=map=>map.name===map.id?map.id:map.name+' ('+map.id+')';
for(const map of maps.sort((a,b)=>a.id==='gef_fild12'?-1:b.id==='gef_fild12'?1:(a.name||a.id).localeCompare(b.name||b.id))){
  const option=document.createElement('option');option.value=map.id;option.textContent=mapLabel(map);select.append(option);
}
select.value=maps.some(m=>m.id===saved.map)?saved.map:'gef_fild12';
mapSearch.value=mapLabel(maps.find(m=>m.id===select.value));
const mapTerms=new Map(maps.map(map=>[map.id,(map.id+' '+map.name+' '+(map.id==='gef_fild12'?kordt.map(m=>m.name).join(' '):[...new Set(map.spawns.map(s=>monsterById.get(s.monster)?.name).filter(Boolean))].join(' '))).toLowerCase()]));
function hideMapSuggestions(){mapSuggestions.hidden=true;mapSearch.setAttribute('aria-expanded','false')}
function pickMap(map){select.value=map.id;mapSearch.value=mapLabel(map);hideMapSuggestions();el('sim-cost').value=saved.maps?.[map.id]?.cost??'0';render()}
function suggestMaps(){const q=mapSearch.value.trim().toLowerCase();mapSuggestions.replaceChildren();if(!q){hideMapSuggestions();return}
  const matches=maps.filter(map=>mapTerms.get(map.id).includes(q)).sort((a,b)=>{
    const score=map=>map.id.toLowerCase().startsWith(q)||map.name.toLowerCase().startsWith(q)?0:1;
    return score(a)-score(b)||mapLabel(a).localeCompare(mapLabel(b));
  }).slice(0,30);
  if(!matches.length){const empty=document.createElement('p');empty.textContent='ไม่พบแมพที่ตรงกับคำค้น';empty.className='muted';mapSuggestions.append(empty)}
  for(const map of matches){const button=document.createElement('button');button.type='button';button.textContent=mapLabel(map);button.onclick=()=>pickMap(map);button.onkeydown=e=>{if(e.key==='ArrowDown'){e.preventDefault();button.nextElementSibling?.focus()}if(e.key==='ArrowUp'){e.preventDefault();(button.previousElementSibling||mapSearch).focus()}if(e.key==='Escape'){hideMapSuggestions();mapSearch.focus()}};mapSuggestions.append(button)}
  mapSuggestions.hidden=false;mapSearch.setAttribute('aria-expanded','true');
}
mapSearch.addEventListener('focus',()=>mapSearch.select());
mapSearch.addEventListener('input',suggestMaps);
mapSearch.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();mapSuggestions.querySelector('button')?.focus()}if(e.key==='Enter'){e.preventDefault();mapSuggestions.querySelector('button')?.click()}if(e.key==='Escape')hideMapSuggestions()});
document.addEventListener('click',e=>{if(e.target!==mapSearch&&!mapSuggestions.contains(e.target))hideMapSuggestions()});
el('sim-cost').value=saved.maps?.[select.value]?.cost??'0';
el('sim-cost').addEventListener('input',calculate);
el('sim-drop-rate').value=saved.dropRate??'100';
el('sim-drop-rate').addEventListener('input',calculate);
el('sim-overcharge').checked=!!saved.overcharge;
el('sim-overcharge').addEventListener('change',calculate);
select.addEventListener('change',()=>pickMap(maps.find(map=>map.id===select.value)));
function mapMonsters(id){
  if(id==='gef_fild12')return kordt;
  const map=db.maps.find(m=>m.id===id),seen=new Set();
  return (map?.spawns||[]).filter(s=>{if(seen.has(s.monster))return false;seen.add(s.monster);return monsterById.has(s.monster)}).map(s=>{
    const m=monsterById.get(s.monster);
    return {id:m.id,name:m.name,drops:m.drops.filter(d=>!d.mvp).map(d=>[d.item,d.rate])};
  });
}
function itemFor(key){return typeof key==='number'?itemById.get(key):itemByName.get(key)}
function render(){
  const id=select.value,state=saved.maps?.[id]||{};
  currentMonsters=mapMonsters(id);kills=new Map();prices=new Map();rates=new Map();counts=new Map();units=new Map();totals=new Map();
  el('sim-mobs').replaceChildren();el('sim-items').replaceChildren();
  const map=db.maps.find(m=>m.id===id),isKordt=id==='gef_fild12';
  el('sim-map-note').textContent=isKordt?'Kordt Forest: รายชื่อและอัตราดรอปอ้างอิง Divine Pride; จำนวนฆ่าเริ่มต้น 100 ตัว/ชม. เป็นเพียงตัวอย่าง ไม่มีจำนวนเกิดของ GGT ที่ยืนยัน':'แมพ '+(map?.name||id)+': รายชื่อมอนสเตอร์และอัตราดรอปอ้างอิง rAthena ไม่ยืนยันว่าเหมือน GGT · กรอกจำนวนที่ฆ่าได้จริงต่อชั่วโมง';
  el('sim-map-link').href='https://www.divine-pride.net/database/map/'+encodeURIComponent(id);
  el('sim-ggt-link').hidden=!isKordt;
  for(const monster of currentMonsters){
    const label=document.createElement('label'),head=document.createElement('div'),image=document.createElement('img'),link=document.createElement('a'),caption=document.createElement('span'),input=document.createElement('input');
    head.className='sim-monster-head';image.className='sim-monster-image';image.width=56;image.height=56;image.alt='รูป '+monster.name;image.loading='lazy';
    image.src=cachedMonsterImages.has(monster.id)?'monsters/'+monster.id+'.png':'https://static.divine-pride.net/images/mobs/png/'+monster.id+'.png';
    image.onerror=()=>image.remove();
    link.textContent=monster.name+' ↗';link.href='https://www.divine-pride.net/database/monster/'+monster.id;link.target='_blank';link.rel='noopener';
    caption.textContent='ฆ่าได้ / ชั่วโมง';
    input.type='number';input.min='0';input.step='1';input.value=state.kills?.[monster.id]??(isKordt?'100':'0');
    input.setAttribute('aria-label',monster.name+' ฆ่าได้ต่อชั่วโมง');input.addEventListener('input',calculate);
    head.append(image,link);label.append(head,caption,input);el('sim-mobs').append(label);kills.set(monster.id,input);
  }
  const keys=[...new Set(currentMonsters.flatMap(m=>m.drops.map(d=>d[0])))];
  for(const key of keys){
    const item=itemFor(key),name=item?.name||String(key),tr=document.createElement('tr');
    const nameCell=document.createElement('td'),rateCell=document.createElement('td'),countCell=document.createElement('td'),priceCell=document.createElement('td'),unitCell=document.createElement('td'),totalCell=document.createElement('td');
    nameCell.className='sim-item-name';
    if(item){
      const icon=iconFor(item.id);nameCell.append(icon);
      const link=document.createElement('a');link.textContent=name;link.href='https://www.divine-pride.net/database/item/'+item.id;link.target='_blank';link.rel='noopener';nameCell.append(link);
    }else nameCell.textContent=name;
    const source=document.createElement('small');source.className='row-note';
    source.textContent=item?.ggt!==undefined?'ราคา NPC GGT':item?.price!=null?'ราคาอ้างอิง rAthena · ตรวจราคาขายจริง':'ยังไม่มีราคา · กรอกเอง';
    nameCell.append(source);
    const price=document.createElement('input');price.type='number';price.min='0';price.step='any';price.placeholder='กรอกราคา';
    price.value=state.prices?.[key]??(item?.ggt??item?.price??'');
    price.setAttribute('aria-label',name+' ราคาก่อน Overcharge ต่อชิ้น');price.addEventListener('input',calculate);
    priceCell.append(price);rateCell.className='sim-rate';unitCell.className='total';totalCell.className='total';
    tr.append(nameCell,rateCell,countCell,priceCell,unitCell,totalCell);el('sim-items').append(tr);
    prices.set(key,price);rates.set(key,rateCell);counts.set(key,countCell);units.set(key,unitCell);totals.set(key,totalCell);
  }
  calculate();
}
function calculate(){
  const mobValues=new Map();let invalid=false;
  for(const [id,input] of kills){const value=Number(input.value);if(input.value===''||!input.validity.valid||!Number.isFinite(value))invalid=true;mobValues.set(id,value)}
  const costInput=el('sim-cost'),cost=Number(costInput.value);if(costInput.value===''||!costInput.validity.valid||!Number.isFinite(cost))invalid=true;
  const dropInput=el('sim-drop-rate'),dropPercent=Number(dropInput.value);
  if(dropInput.value===''||!dropInput.validity.valid||!Number.isFinite(dropPercent))invalid=true;
  const multiplier=invalid&&(!Number.isFinite(dropPercent)||dropPercent<0)?1:dropPercent/100;
  let gross=0,unpriced=0;
  for(const [key,input] of prices){
    let expected=0;const parts=[];
    for(const monster of currentMonsters){const drop=monster.drops.find(d=>d[0]===key);if(!drop)continue;
      const adjusted=Math.min(100,drop[1]*multiplier);
      expected+=(mobValues.get(monster.id)||0)*adjusted/100;
      parts.push(monster.name+' '+fmt(drop[1])+'% → '+fmt(adjusted)+'%');
    }
    rates.get(key).textContent=parts.join(' · ');
    counts.get(key).textContent=Number.isFinite(expected)?fmt(expected):'—';
    const raw=input.value,price=Number(raw);if(raw!==''&&(!input.validity.valid||!Number.isFinite(price)))invalid=true;
    if(raw===''&&expected>0)unpriced++;
    const unit=raw===''?null:el('sim-overcharge').checked?Math.floor(price*1.24):price;
    const total=unit===null?null:expected*unit;
    units.get(key).textContent=unit===null?'—':fmt(unit)+' z';
    totals.get(key).textContent=total===null?'ยังไม่รวม':Number.isFinite(total)?fmt(total)+' z':'—';
    if(total!==null)gross+=total;
  }
  const net=gross-cost,rateRaw=el('rate').value,rate=Number(rateRaw),baht=net*rate/1e6;
  el('sim-gross').textContent=invalid?'—':fmt(gross)+' z';el('sim-net').textContent=invalid?'—':fmt(net)+' z';
  el('sim-baht').textContent=invalid||rateRaw===''||!Number.isFinite(rate)?'—':fmt(baht)+' ฿';
  const example=currentMonsters.flatMap(monster=>monster.drops.map(drop=>({monster,drop}))).find(({monster})=>(mobValues.get(monster.id)||0)>0);
  if(example){const item=itemFor(example.drop[0]),base=example.drop[1],adjusted=Math.min(100,base*multiplier),killCount=mobValues.get(example.monster.id)||0;
    el('sim-formula').textContent='วิธีคิดตัวอย่าง: '+example.monster.name+' '+fmt(killCount)+' ตัว/ชม. × '+(item?.name||example.drop[0])+' '+fmt(base)+'% × อัตรารวม '+fmt(dropPercent)+'% = '+fmt(killCount*adjusted/100)+' ชิ้น/ชม. โดยโอกาสหลังปรับคือ '+fmt(adjusted)+'% (สูงสุด 100% ต่อการฆ่า)';
  }else el('sim-formula').textContent='วิธีคิด: จำนวนฆ่า/ชม. × โอกาสดรอปฐาน × อัตราดรอปรวม ÷ 100; รวมผลจากมอนสเตอร์ทุกชนิดที่ดรอปไอเท็มนั้น และจำกัดโอกาสไว้ไม่เกิน 100% ต่อการฆ่า';
  el('sim-note').textContent=invalid?'ตรวจจำนวนมอนสเตอร์ ราคา และต้นทุน: ต้องไม่ติดลบ':unpriced+' รายการยังไม่มีราคา จึงไม่รวมในยอดคาดหมาย · ผลดรอปเป็นค่าเฉลี่ยคาดหมาย ไม่ใช่ของที่ได้แน่นอน';
  const actualText=el('hourly').textContent,actual=actualText==='—'?null:Number(actualText.replace(/[^\d.-]/g,''));
  el('sim-actual').textContent=actual===null?'กรอกเวลาและของที่ได้จริงก่อน':actualText+' / ชม.';
  el('sim-compare').textContent=invalid||actual===null?'กรอกผลฟาร์มจริงด้านบนเพื่อเทียบกับตัวอย่างนี้':gross===0&&unpriced>0?'ใส่ราคาขายไอเท็มก่อนเทียบ':actual>net?'รอบที่กรอกจริงสูงกว่าค่าคาดหมาย '+fmt(actual-net)+' z / ชม.':actual<net?'รอบที่กรอกจริงต่ำกว่าค่าคาดหมาย '+fmt(net-actual)+' z / ชม.':'รอบที่กรอกจริงเท่ากับค่าคาดหมาย';
  saved.map=select.value;saved.overcharge=el('sim-overcharge').checked;saved.dropRate=dropInput.value;saved.maps=saved.maps||{};
  saved.maps[select.value]={kills:Object.fromEntries([...kills].map(([id,input])=>[id,input.value])),prices:Object.fromEntries([...prices].map(([key,input])=>[key,input.value])),cost:costInput.value};
  try{localStorage.setItem(simKey,JSON.stringify(saved))}catch{}
}
document.addEventListener('farm-updated',calculate);
render();
})();
