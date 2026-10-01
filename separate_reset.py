from pathlib import Path
p=Path('index.html');s=p.read_text(encoding='utf8');a=s.index('<!-- DATABASE START -->');b=s.index('<!-- DATABASE END -->',a)+len('<!-- DATABASE END -->');s=s[:a]+s[b:]
s=s.replace('ใช้มูลค่าที่บูมจ่ายจริง</p></div>','ใช้มูลค่าที่บูมจ่ายจริง</p><div class="actions"><button id="clear-session" type="button">ล้างข้อมูล 01</button></div></div>')
s=s.replace('<button id="reset" type="button">เริ่มรอบใหม่ · ล้างข้อมูลทั้งหมด</button>','<button id="clear-items" type="button">ล้างข้อมูล 02</button>')
s=s.replace("$('reset').onclick=()=>{$('overcharge').checked=false;$('items').replaceChildren();ids.forEach(id=>$(id).value='');clearPicker();update()}","$('clear-session').onclick=()=>{$('overcharge').checked=false;ids.forEach(id=>$(id).value='');update()};$('clear-items').onclick=()=>{$('items').replaceChildren();clearPicker();update()}")
p.write_text(s,encoding='utf8')
