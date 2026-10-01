import json,re
from pathlib import Path
p=Path(__file__).parent
data=json.loads((p/'database.json').read_text(encoding='utf-8'))
for x in data['items']:
    if x['name']=='Trunk': x.pop('ggt',None)
    if x['id']==1019: x['price']=22
(p/'database.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
html=(p/'index.html').read_text(encoding='utf-8')
html=re.sub(r'<!-- DATABASE START -->.*?<!-- DATABASE END -->','',html,flags=re.S)
html=re.sub(r'<!-- EXTRAS START -->.*?<!-- EXTRAS END -->','',html,flags=re.S)
payload=json.dumps(data,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
ui=(p/'database-ui.js').read_text(encoding='utf-8')
block='<!-- DATABASE START --><script id="ro-data" type="application/json">'+payload+'</script><script>'+ui+'</script><!-- DATABASE END -->'
html=html.replace('</main><script>','</main>'+block+'<script>')
extras='<!-- EXTRAS START --><script>'+(p/'library-ui.js').read_text(encoding='utf-8')+'</script><script>'+(p/'simulation-ui.js').read_text(encoding='utf-8')+'</script><script>'+(p/'music-ui.js').read_text(encoding='utf-8')+'</script><!-- EXTRAS END -->'
html=html.replace('</body>',extras+'</body>')
(p/'index.html').write_text(html,encoding='utf-8')
print('Embedded database:',len(data['items']),'items;',len(html.encode('utf-8')),'bytes')
