from pathlib import Path
import json,re
p=Path('index.html');s=p.read_text(encoding='utf8')
# Keep the generated data block managed by embed_database.py.
s=re.sub(r'<!-- DATABASE START -->.*?<!-- DATABASE END -->','',s,flags=re.S)
s=s.replace('พ่อค้ามี Overcharge Lv.10 · ขาย NPC เพิ่ม 24%','ใช้ Overcharge Lv.10 · ราคาของทุกชิ้นเพิ่ม 24%')
s=s.replace('<th>วิธีขาย</th>','<th>หลัง Overcharge / ชิ้น</th>')
s=s.replace('ราคาเริ่มต้นเป็นราคาขาย NPC โดยประมาณ ไม่ใช่ราคาตลาดผู้เล่น เลือก “ราคาขายจริง / ผู้เล่น” หากกรอกราคาที่รวม Overcharge แล้ว','ราคาตั้งต้นควรเป็นราคาก่อน Overcharge ถ้ากรอกราคาที่รวม 24% แล้ว ให้เอาติ๊ก Overcharge ออก')
s=s.replace("const defaults=[['Fresh Pear',0,820],['Aromatic Flower',0,800],['Wood Block',0,440],['Congealed Poison',0,540]]", "const defaults=[['Fresh Pear',0,820],['Aromatic Flower',0,800],['Wood Block',0,440],['Congealed Poison',0,540]]")
start=s.index('function addRow(');end=s.index('function update()',start)
s=s[:start]+'''function itemId(name){return itemIds.get(name)||null}
function iconFor(id){const img=document.createElement('img');img.width=32;img.height=32;img.alt='';img.loading='lazy';img.className='item-icon';if(!id){img.style.display='none';return img}img.src=localIcons.has(id)?'icons/'+id+'.png':'https://www.divine-pride.net/img/items/item/iRO/'+id;img.onerror=()=>img.style.display='none';return img}
function addRow(data=['',0,'']){const tr=document.createElement('tr'),icon=iconFor(itemId(data[0]));for(let i=0;i<3;i++){const td=document.createElement('td'),input=document.createElement('input');input.type=i?'number':'text';input.value=data[i]??'';input.setAttribute('aria-label',['ชื่อไอเท็ม','จำนวนไอเท็ม','ราคาต่อชิ้น'][i]);if(i){input.min='0';input.step=i===1?'1':'any'}input.addEventListener('input',()=>{if(i===0){icon.src=localIcons.has(itemId(input.value))?'icons/'+itemId(input.value)+'.png':'https://www.divine-pride.net/img/items/item/iRO/'+itemId(input.value);icon.style.display=itemId(input.value)?'':'none'}update()});if(i===0){td.className='item-name';td.append(icon)}td.append(input);tr.append(td)}const unit=document.createElement('td');unit.className='total';tr.append(unit);const total=document.createElement('td');total.className='total';tr.append(total);const td=document.createElement('td'),btn=document.createElement('button');btn.textContent='×';btn.setAttribute('aria-label','ลบรายการ');btn.onclick=()=>{tr.remove();update()};td.append(btn);tr.append(td);$('items').append(tr)}
''' +s[end:]
s=s.replace("const mode=tr.querySelector('select').value;const unit=mode==='npc'&&$('overcharge').checked?Math.floor(Number(a[2])*124/100):Number(a[2]);const value=Number(a[1])*unit;tr.children[4].textContent=a[2]===''?'ยังไม่มีราคา':Number.isFinite(value)?fmt(value)+' z':'—';gross+=value;return [...a,mode]", "const unit=$('overcharge').checked?Math.floor(Number(a[2])*1.24):Number(a[2]);const value=Number(a[1])*unit;tr.children[3].textContent=a[2]===''?'—':fmt(unit)+' z';tr.children[4].textContent=a[2]===''?'ยังไม่มีราคา':Number.isFinite(value)?fmt(value)+' z':'—';gross+=value;return a")
s=s.replace("defaults.forEach(d=>addRow([...d,'npc']))","defaults.forEach(addRow)")
s=s.replace("saved.rows.filter(r=>Array.isArray(r)&&(r.length===3||r.length===4)).forEach(addRow)","saved.rows.filter(r=>Array.isArray(r)&&r.length>=3).forEach(r=>addRow(r.slice(0,3)))")
s=s.replace(' .oc-toggle{',' .item-name{display:flex;align-items:center;gap:7px}.item-name input{min-width:130px}.item-icon{flex:none;object-fit:contain;image-rendering:pixelated}.suggestions button{display:flex!important;align-items:center;gap:9px}.suggestions .item-icon{width:28px;height:28px} .oc-toggle{')
s=s.replace('<th>ราคาตั้งต้น / ชิ้น</th>','<th>ราคาตั้งต้น / ชิ้น</th>')
s=s.replace('</script></body>','</script></body>')
p.write_text(s,encoding='utf8')
d=json.loads(Path('database.json').read_text(encoding='utf8'))
for x in d['items']:
    if x['id']==1019: x['price']=22
Path('database.json').write_text(json.dumps(d,ensure_ascii=False,separators=(',',':')),encoding='utf8')
