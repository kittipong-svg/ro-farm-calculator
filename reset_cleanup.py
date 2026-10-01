from pathlib import Path
p=Path('index.html');s=p.read_text(encoding='utf8')
s=s.replace('<div class="actions"><button id="add" type="button">+ เพิ่มไอเท็ม</button><button id="reset" type="button">เริ่มรอบใหม่</button></div>','<div class="actions"><button id="reset" type="button">เริ่มรอบใหม่ · ล้างข้อมูลทั้งหมด</button></div>')
s=s.replace("else defaults.forEach(addRow);ids.forEach", "else ids.forEach(id=>$(id).value='');ids.forEach")
s=s.replace("$('add').onclick=()=>{addRow();update()};",'')
s=s.replace("$('reset').onclick=()=>{if(!confirm('ล้างข้อมูลรอบนี้และคืนราคาตั้งต้น?'))return;$('overcharge').checked=false;$('items').replaceChildren();defaults.forEach(addRow);ids.forEach(id=>$(id).value=id==='seconds'?'0':'');update()}","$('reset').onclick=()=>{$('overcharge').checked=false;$('items').replaceChildren();ids.forEach(id=>$(id).value='');clearPicker();update()}")
p.write_text(s,encoding='utf8')
