from pathlib import Path
p=Path('index.html');s=p.read_text(encoding='utf8')
s=s.replace("$('gross').textContent=finite?fmt(gross)+' z':'—';", "$('gross').textContent=finite?fmt(gross)+' z':'—';$('gross-02').textContent=$('gross').textContent;")
s=s.replace("$('cost').textContent=finite?fmt(cost)+' z':'—';", "$('cost').textContent=finite?fmt(cost)+' z':'—';$('cost-01').textContent=$('cost').textContent;")
p.write_text(s,encoding='utf8')
