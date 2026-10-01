const {chromium}=require('playwright');
const {pathToFileURL}=require('url');
const path=require('path');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('index.html')).href);
 const search=page.locator('input[type=search]');await search.fill('Fresh Pear');
 await page.getByRole('button',{name:/Fresh Pear\s+#/}).click();
 await page.getByRole('button',{name:'เพิ่มไปคำนวณรอบฟาร์ม'}).click();
 if(await page.locator('#items tr').count()!==5)throw Error('Add item failed');
 await page.locator('#items tr').last().locator('input').nth(1).fill('1000');
 await page.locator('#minutes').fill('60');await page.locator('#rate').fill('10');
 if((await page.locator('#baht').innerText())!=='8.2 ฿')throw Error('Profit mismatch');
 await page.getByRole('button',{name:'มอนสเตอร์',exact:true}).click();await search.fill('Poring');
 await page.getByRole('button',{name:'Poring #1002',exact:true}).click();
 await page.getByRole('button',{name:'Jellopy · 70%',exact:true}).click();
 if(!(await page.locator('#database').innerText()).includes('ราคา NPC GGT: ยังไม่มีข้อมูลยืนยัน'))throw Error('Unknown price missing');
 await page.getByRole('button',{name:'แมพ',exact:true}).click();await search.fill('gef_fild12');
 await page.getByRole('button',{name:'Kordt Forest #gef_fild12',exact:true}).click();
 await page.setViewportSize({width:390,height:844});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow');
 await page.screenshot({path:'database-preview.png',fullPage:false});
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: offline load, search, item transfer, profit, linked drops, map details, mobile width, no runtime errors');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});

