(function(){
const audio=document.getElementById('payon-audio');
const play=document.getElementById('music-play');
const choose=document.getElementById('music-choose');
const file=document.getElementById('music-file');
const status=document.getElementById('music-status');
let url=null;
let waitingForGesture=false;
function show(){play.textContent=audio.paused?'▶ เล่นเพลง Payon':'❚❚ หยุดเพลง';play.disabled=!audio.src}
function useBlob(blob){if(url)URL.revokeObjectURL(url);url=URL.createObjectURL(blob);audio.src=url;show()}
function openStore(){return new Promise((resolve,reject)=>{if(!window.indexedDB){reject(Error('No IndexedDB'));return}const request=indexedDB.open('boom-ro-music',1);request.onupgradeneeded=()=>request.result.createObjectStore('tracks');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)})}
async function save(blob){const db=await openStore();return new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readwrite');tx.objectStore('tracks').put(blob,'payon');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>{db.close();reject(tx.error)}})}
async function load(){const db=await openStore();return new Promise((resolve,reject)=>{const tx=db.transaction('tracks','readonly');const request=tx.objectStore('tracks').get('payon');request.onsuccess=()=>{db.close();resolve(request.result)};request.onerror=()=>{db.close();reject(request.error)}})}
async function start(){try{await audio.play();waitingForGesture=false;status.textContent='กำลังเล่นวน · ปรับเสียงที่เครื่องได้'}catch{waitingForGesture=true;status.textContent='คลิกหน้าเว็บหรือกดเล่นเพลงเพื่อเปิดเสียง'}show()}
function unlock(event){if(!waitingForGesture||event.target.closest('.music-controls'))return;start()}
document.addEventListener('pointerdown',unlock);
document.addEventListener('keydown',unlock);
play.addEventListener('click',()=>{if(audio.paused)start();else{audio.pause();status.textContent='หยุดเพลงชั่วคราว';show()}});
choose.addEventListener('click',()=>file.click());
file.addEventListener('change',async()=>{const selected=file.files?.[0];if(!selected)return;if(!selected.type.startsWith('audio/')){status.textContent='กรุณาเลือกไฟล์เสียง';return}useBlob(selected);status.textContent='เลือก '+selected.name+' แล้ว';start();try{await save(selected)}catch{status.textContent='กำลังเล่นเพลง · ไฟล์นี้อาจต้องเลือกใหม่เมื่อเปิดเว็บครั้งหน้า'}file.value=''});
audio.addEventListener('ended',show);audio.addEventListener('error',()=>{status.textContent='เปิดไฟล์เพลงไม่ได้ กรุณาเลือกไฟล์ใหม่';show()});
audio.addEventListener('play',()=>{waitingForGesture=false;status.textContent='กำลังเล่นวน · ปรับเสียงที่เครื่องได้';show()});
show();load().then(blob=>{if(blob)useBlob(blob);start()}).catch(()=>start());
})();
