"""Build offline RO reference database from a pinned rAthena snapshot (GPL-3.0)."""
import io, json, re, urllib.request, zipfile
from pathlib import Path
import yaml

ROOT = Path(__file__).parent
def fetch(url):
    return urllib.request.urlopen(url, timeout=120).read()

commit = json.loads(fetch('https://api.github.com/repos/rathena/rathena/commits/master'))['sha']
archive = fetch(f'https://codeload.github.com/rathena/rathena/zip/{commit}')
(ROOT / 'data-source').mkdir(exist_ok=True)
(ROOT / 'data-source/rathena-source.zip').write_bytes(archive)
z = zipfile.ZipFile(io.BytesIO(archive))
prefix = z.namelist()[0]
def read(p): return z.read(prefix+p).decode('utf-8-sig')
items=[]
for part in ['etc','usable','equip']:
    for x in yaml.safe_load(read(f'db/re/item_db_{part}.yml'))['Body']:
        sell=x.get('Sell', x.get('Buy',0)//2 if 'Buy' in x else None)
        items.append(dict(id=x['Id'],name=x['Name'],code=x['AegisName'],type=x.get('Type','Etc'),price=sell,weight=x.get('Weight',0)/10))
by_code={x['code']:x['id'] for x in items}
monsters=[]
for x in yaml.safe_load(read('db/re/mob_db.yml'))['Body']:
    drops=[]
    for category in ['Drops','MvpDrops']:
        for d in x.get(category,[]):
            drops.append(dict(item=by_code.get(d['Item']),name=d['Item'],rate=d.get('Rate',0)/100,mvp=category=='MvpDrops'))
    monsters.append(dict(id=x['Id'],name=x['Name'],code=x['AegisName'],level=x.get('Level',1),hp=x.get('Hp',1),race=x.get('Race',''),element=x.get('Element',''),drops=drops))
maps={}
for line in read('db/map_index.txt').splitlines():
    line=line.split('//')[0].strip()
    if line: maps.setdefault(line.split()[0],dict(id=line.split()[0],name=line.split()[0],spawns=[]))
for filename in z.namelist():
    if '/npc/re/mobs/' not in filename or not filename.endswith('.txt'): continue
    for line in z.read(filename).decode('utf-8-sig').splitlines():
        if line.lstrip().startswith('//'): continue
        fields=line.split('\t')
        if len(fields)<4 or fields[1] not in ['monster','boss_monster']: continue
        mapid=fields[0].split(',')[0]
        nums=fields[3].split(',')
        if len(nums)<2 or not nums[0].isdigit() or not nums[1].isdigit(): continue
        m=maps.setdefault(mapid,dict(id=mapid,name=mapid,spawns=[]))
        m['spawns'].append(dict(monster=int(nums[0]),count=int(nums[1])))
maps.setdefault('gef_fild12',dict(id='gef_fild12',spawns=[]))['name']='Kordt Forest'
overrides={'Fresh_Pear':820,'Aromatic_Flower':800,'Congealed_Poison':540}
for x in items:
    if x['code'] in overrides: x['ggt']=overrides[x['code']]
    elif x['name']=='Wood Block': x['ggt']=440
db=dict(date='2026-09-30',commit=commit,items=items,monsters=monsters,maps=list(maps.values()))
(ROOT/'database.json').write_text(json.dumps(db,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(json.dumps(dict(commit=commit,items=len(items),monsters=len(monsters),maps=len(maps),spawns=sum(len(m['spawns']) for m in maps.values()),ggt=[x['name'] for x in items if 'ggt' in x])))
