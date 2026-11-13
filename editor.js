'use strict';
let looks=[];let selected=-1;const $=id=>document.getElementById(id);const e=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const slug=s=>String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'look';
const note=s=>$('status').textContent=s;
function refresh(){ $('pick').innerHTML=looks.map((l,i)=>`<option value="${i}">${e(l.title||'Untitled look')} (${e(l.id)})</option>`).join('');if(selected<0&&looks.length)selected=0;if(selected>=looks.length)selected=looks.length-1;$('pick').value=selected;draw()}
function draw(){if(selected<0){$('form').innerHTML='<div class="empty">Create a look or import your existing catalog.</div>';return}const l=looks[selected];$('form').innerHTML=`<div class="panel"><h2>Look details</h2><div class="row2"><div class="field"><label>Look ID (URL slug)</label><input data-look="id" value="${e(l.id)}"></div><div class="field"><label>Category</label><input data-look="category" value="${e(l.category)}"></div></div><div class="field"><label>Title</label><input data-look="title" value="${e(l.title)}"></div><div class="field"><label>Description</label><textarea data-look="description">${e(l.description)}</textarea></div><div class="field"><label>Cover photo (image URL or relative path)</label><input data-look="cover" value="${e(l.cover)}"></div><div class="field"><label>Or upload cover photo</label><input type="file" accept="image/*" data-image="cover"></div><button class="btn light danger" id="removeLook">Delete this look</button></div><div class="panel"><h2>Products (${l.products.length})</h2><div id="products">${l.products.map((p,i)=>`<div class="productrow"><div class="row2"><div class="field"><label>Product name</label><input data-p="${i}" data-key="name" value="${e(p.name)}"></div><div class="field"><label>Store</label><select data-p="${i}" data-key="store"><option ${p.store==='Amazon'?'selected':''}>Amazon</option><option ${p.store==='Meesho'?'selected':''}>Meesho</option><option ${p.store==='Other'?'selected':''}>Other</option></select></div></div><div class="field"><label>Affiliate link (full https:// URL)</label><input data-p="${i}" data-key="url" value="${e(p.url)}" placeholder="https://..."></div><div class="field"><label>Product photo URL or path</label><input data-p="${i}" data-key="image" value="${e(p.image)}"></div><div class="field"><label>Or upload product photo</label><input type="file" accept="image/*" data-image="product" data-p="${i}"></div><button class="btn light danger" data-remove="${i}">Remove product</button></div>`).join('')}</div><button class="btn light" id="addProduct">+ Add product</button></div>`;
$('form').querySelectorAll('[data-look]').forEach(el=>el.addEventListener('input',()=>{l[el.dataset.look]=el.value;refreshPickOnly()}));$('form').querySelectorAll('[data-key]').forEach(el=>el.addEventListener('input',()=>{l.products[+el.dataset.p][el.dataset.key]=el.value}));$('form').querySelectorAll('[data-image]').forEach(el=>el.addEventListener('change',async()=>{const file=el.files?.[0];if(!file)return;if(file.size>1500000){note('Large image! Try compressing it under 1.5 MB for faster pages.')}const data=await readData(file);if(el.dataset.image==='cover')l.cover=data;else l.products[+el.dataset.p].image=data;draw();note('Image embedded. Export looks.json to publish it.')}));$('form').querySelectorAll('[data-remove]').forEach(el=>el.addEventListener('click',()=>{l.products.splice(+el.dataset.remove,1);draw()}));$('addProduct').onclick=()=>{l.products.push({name:'New product',store:'Amazon',image:'assets/placeholder.svg',url:''});draw()};$('removeLook').onclick=()=>{if(confirm('Delete this look?')){looks.splice(selected,1);refresh()}}}
function refreshPickOnly(){$('pick').options[selected].textContent=`${looks[selected].title} (${looks[selected].id})`}
function readData(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)})}
$('pick').onchange=ev=>{selected=+ev.target.value;draw()};$('new').onclick=()=>{const n=looks.length+1;looks.unshift({id:`look-${String(n).padStart(3,'0')}`,title:'New outfit edit ♡',category:'Fashion finds',description:'Shop every piece from this reel.',cover:'assets/placeholder.svg',products:[]});selected=0;refresh();note('New look created. Add products below.')};$('import').onchange=async ev=>{try{const data=JSON.parse(await ev.target.files[0].text());if(!Array.isArray(data.looks))throw Error('Missing looks array');looks=data.looks;selected=0;refresh();note(`Imported ${looks.length} looks.`)}catch(err){note('Import failed: '+err.message)}};$('export').onclick=()=>{const ids=looks.map(x=>x.id);if(new Set(ids).size!==ids.length){note('Error: each look ID must be unique.');return}if(looks.some(x=>!x.id||!Array.isArray(x.products))){note('Error: look IDs and products are required.');return}const data=JSON.stringify({looks},null,2);const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='looks.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);note('Downloaded looks.json. Replace the existing file in your GitHub repository.')};fetch('looks.json').then(r=>r.json()).then(d=>{looks=d.looks||[];refresh();note('Starter catalog loaded. Import your latest looks.json when editing in the future.')}).catch(()=>{refresh();note('Open via a local web server, or import a looks.json file.')});

// Publish directly through the official GitHub Contents API. The token is only held in memory.
function validCatalog(){
 const ids=looks.map(x=>x.id);
 if(new Set(ids).size!==ids.length || looks.some(x=>!x.id||!Array.isArray(x.products))) throw Error('Each look needs a unique ID and products array.');
 for(const l of looks) for(const product of l.products) {
  if(product.url && !/^https:\/\/i.test(product.url)) throw Error('Product URLs must begin with https://');
 }
 return JSON.stringify({looks},null,2)+'\n';
}
function toBase64Utf8(value){const bytes=new TextEncoder().encode(value);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary)}
$('publish').onclick=async()=>{
 const button=$('publish');
 try{
  const repo=$('repo').value.trim(), branch=$('branch').value.trim()||'main', token=$('token').value.trim();
  if(!/^[a-zA-Z0-9_.-]+\/[a-zA-Z0-9_.-]+$/.test(repo)) throw Error('Enter username/repository.');
  if(!token) throw Error('Enter a GitHub fine-grained token.');
  const content=validCatalog();
  button.disabled=true;note('Checking current GitHub version…');
  const endpoint=`https://api.github.com/repos/${repo}/contents/looks.json`;
  const headers={'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'};
  const current=await fetch(`${endpoint}?ref=${encodeURIComponent(branch)}`,{headers,cache:'no-store'});
  if(!current.ok && current.status!==404)throw Error(`GitHub lookup failed (${current.status}): ${(await current.text()).slice(0,250)}`);
  const existing=current.ok?await current.json():null;
  note('Publishing updated catalog…');
  const payload={message:'Update outfit catalog',content:toBase64Utf8(content),branch};
  if(existing?.sha)payload.sha=existing.sha;
  const result=await fetch(endpoint,{method:'PUT',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!result.ok)throw Error(`GitHub publish failed (${result.status}): ${(await result.text()).slice(0,300)}`);
  note('Published to GitHub! Your Pages website should update after deployment (usually a few minutes).');
 }catch(err){note('Publish error: '+err.message)}finally{button.disabled=false}
};
