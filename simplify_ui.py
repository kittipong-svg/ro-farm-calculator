from pathlib import Path
import re
p=Path('index.html');s=p.read_text(encoding='utf8')
s=re.sub(r'<div class="card"><h2>ข้อมูลมอนสเตอร์.*?<div class="footer">', '<div class="footer">',s,flags=re.S)
s=s.replace('แก้ราคาต่อชิ้นให้ตรงกับราคาขายจริงได้ รวมราคาที่ได้จากสกิลขายของแล้ว','ค้นหาแล้วเลือกของที่เก็บได้ จากนั้นกรอกจำนวนและปรับราคาตามที่ขายจริง')
s=re.sub(r'<p class="note">Pear 820.*?</p>','<p class="note">ราคาเริ่มต้นเป็นราคาขาย NPC โดยประมาณ ไม่ใช่ราคาตลาดผู้เล่น เลือก “ราคาขายจริง / ผู้เล่น” หากกรอกราคาที่รวม Overcharge แล้ว</p>',s)
s=s.replace('<th>เซนี / ชิ้น</th>','<th>ราคาตั้งต้น / ชิ้น</th><th>วิธีขาย</th>')
s=s.replace('<h2>01 · รอบฟาร์มของบูม</h2>','<h2>01 · รอบฟาร์มของบูม</h2><label class="oc-toggle"><input id="overcharge" type="checkbox"> พ่อค้ามี Overcharge Lv.10 · ขาย NPC เพิ่ม 24%</label>')
s=s.replace('บันทึกอัตโนมัติในเบราว์เซอร์นี้เมื่อรองรับ · เปิดไฟล์ใช้งานออฟไลน์ได้ · ข้อมูลอ้างอิงตรวจเมื่อ 29 ก.ย. 2026','บันทึกรอบฟาร์มอัตโนมัติ · ค้นหาและคำนวณออฟไลน์ได้')
s=s.replace('</style>',' .oc-toggle{padding:12px;background:#263a29;border-radius:10px;margin-bottom:18px}.oc-toggle input{width:auto;margin-right:8px}.suggestions{max-height:330px;overflow:auto;border:1px solid var(--line);border-radius:12px;background:#101913;margin:6px 0 20px}.suggestions button{display:block;width:100%;text-align:left;border:0;border-radius:0;border-bottom:1px solid var(--line)}select{background:#101913;color:white;padding:10px;border:1px solid var(--line);border-radius:8px;max-width:160px}.item-search{margin:18px 0}.row-note{display:block;font-size:11px;color:var(--muted)}</style>')
start=s.index('function addRow(');end=s.index('function update()',start)
s=s[:start]+'''function addRow(data=['',0,'','actual']){const tr=document.createElement('tr');for(let i=0;i<3;i++){const td=document.createElement('td'),input=document.createElement('input');input.type=i?'number':'text';input.value=data[i]??'';input.setAttribute('aria-label',['ชื่อไอเท็ม','จำนวนไอเท็ม','ราคาต่อชิ้น'][i]);if(i){input.min='0';input.step=i===1?'1':'any'}input.addEventListener('input',update);td.append(input);tr.append(td)}const modeTd=document.createElement('td'),mode=document.createElement('select');mode.setAttribute('aria-label','วิธีขาย');for(const [v,t]of [['npc','NPC ก่อน OC'],['actual','ราคาขายจริง / ผู้เล่น']]){const o=document.createElement('option');o.value=v;o.textContent=t;mode.append(o)}mode.value=data[3]||'actual';mode.onchange=update;modeTd.append(mode);tr.append(modeTd);const total=document.createElement('td');total.className='total';tr.append(total);const td=document.createElement('td'),btn=document.createElement('button');btn.textContent='×';btn.setAttribute('aria-label','ลบรายการ');btn.onclick=()=>{tr.remove();update()};td.append(btn);tr.append(td);$('items').append(tr)}
''' +s[end:]
s=s.replace("const value=Number(a[1])*Number(a[2]);tr.children[3].textContent=Number.isFinite(value)?fmt(value)+' z':'—';gross+=value;return a", "const mode=tr.querySelector('select').value;const unit=mode==='npc'&&$('overcharge').checked?Math.floor(Number(a[2])*124/100):Number(a[2]);const value=Number(a[1])*unit;tr.children[4].textContent=a[2]===''?'ยังไม่มีราคา':Number.isFinite(value)?fmt(value)+' z':'—';gross+=value;return [...a,mode]")
s=s.replace("rows}))","rows,oc:$('overcharge').checked}))")
s=s.replace("let saved;try", "$('overcharge').addEventListener('change',update);let saved;try")
s=s.replace("if(saved&&saved.fields&&Array.isArray(saved.rows)){", "if(saved&&saved.fields&&Array.isArray(saved.rows)){$('overcharge').checked=!!saved.oc;")
s=s.replace('defaults.forEach(addRow)', "defaults.forEach(d=>addRow([...d,'npc']))")
s=s.replace("$('items').replaceChildren();", "$('overcharge').checked=false;$('items').replaceChildren();")
s=s.replace("update();\n</script>", "update();\n</script>")
s=s.replace("time<=0?'กรอกระยะเวลามากกว่า 0 เพื่อคำนวณต่อชั่วโมง':''", "time<=0?'กรอกระยะเวลามากกว่า 0 เพื่อคำนวณต่อชั่วโมง':rows.some(r=>Number(r[1])>0&&r[2]==='')?'ยังมีของที่ไม่มีราคา ผลรวมยังไม่รวมรายการนั้น':''")
p.write_text(s,encoding='utf8')
