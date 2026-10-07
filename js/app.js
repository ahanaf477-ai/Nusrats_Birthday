const $=s=>document.querySelector(s);const $$=s=>document.querySelectorAll(s);
const birthday=new Date('2026-10-12T00:00:00+06:00');
const loader=$('#loader');window.addEventListener('load',()=>setTimeout(()=>loader.classList.add('done'),550));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lightweight reveal system: only opacity/transform are animated.
const revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');revealObserver.unobserve(e.target)}}),{threshold:.1,rootMargin:'0px 0px -8%'});$$('.reveal').forEach(el=>revealObserver.observe(el));

function tick(){let diff=birthday-Date.now();if(diff<=0){['days','hours','minutes','seconds'].forEach(x=>$('#'+x).textContent='00');$('#countdownMessage').textContent='Today is your day, Nusrat. Happy Birthday, my beautiful pori ♡';return}let d=Math.floor(diff/864e5);diff%=864e5;let h=Math.floor(diff/36e5);diff%=36e5;let m=Math.floor(diff/6e4);let s=Math.floor(diff/1e3);$('#days').textContent=String(d).padStart(2,'0');$('#hours').textContent=String(h).padStart(2,'0');$('#minutes').textContent=String(m).padStart(2,'0');$('#seconds').textContent=String(s).padStart(2,'0')}tick();setInterval(tick,1000);

// Ambient stars: capped particle count and one RAF loop for mobile-friendly performance.
const canvas=$('#stars'),ctx=canvas.getContext('2d',{alpha:true});let stars=[],dpr=1;function resize(){dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=innerWidth*dpr;canvas.height=innerHeight*dpr;canvas.style.width=innerWidth+'px';canvas.style.height=innerHeight+'px';ctx.setTransform(dpr,0,0,dpr,0,0);let n=innerWidth<700?42:82;stars=Array.from({length:n},()=>({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*1.1+.2,a:Math.random()*.55+.12,s:Math.random()*.012+.002}))}function draw(){ctx.clearRect(0,0,innerWidth,innerHeight);for(const p of stars){p.a+=p.s;if(p.a>.72||p.a<.1)p.s*=-1;ctx.globalAlpha=p.a;ctx.fillStyle='#d96b98';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}if(!reduced)requestAnimationFrame(draw)}addEventListener('resize',resize,{passive:true});resize();draw();

// Unique smooth-scroll atmosphere: scroll velocity drives tiny depth shifts via one RAF.
let smoothScrollY=window.scrollY,targetY=window.scrollY,raf=0;const parallaxEls=[...$$('[data-depth]')];addEventListener('scroll',()=>{targetY=window.scrollY;if(!raf){raf=requestAnimationFrame(updateScroll)}} ,{passive:true});function updateScroll(){const dy=targetY-smoothScrollY;smoothScrollY+=dy*.18;for(const el of parallaxEls){const depth=Number(el.dataset.depth||0);const rect=el.getBoundingClientRect();if(rect.bottom>-100&&rect.top<innerHeight+100)el.style.transform=`translate3d(0,${(smoothScrollY-targetY)*depth}px,0)`}raf=0;if(Math.abs(dy)>.1)raf=requestAnimationFrame(updateScroll)}

// Background music: try autoplay immediately; browsers may require the first user gesture.
const music=$('#music'), musicBtn=$('#musicBtn');
let musicReady=false, musicStarted=false;
const musicSrc=window.BIRTHDAY_MEDIA?.music||'assets/music/birthday-song.mp3';
music.src=musicSrc; music.volume=0.30; music.loop=true; music.preload='auto'; music.autoplay=true;
function updateMusicButton(){const playing=!music.paused && !music.muted;musicBtn.classList.toggle('playing',playing);musicBtn.setAttribute('aria-label',playing?'Mute birthday music':'Play birthday music');musicBtn.innerHTML=playing?'<span>❚❚</span><i></i>':'<span>♪</span><i></i>';}
async function startMusic(){if(!musicReady)return false;music.muted=false;try{await music.play();musicStarted=true;updateMusicButton();return true}catch{return false}}
music.addEventListener('loadeddata',()=>{musicReady=true;startMusic()});music.addEventListener('canplay',()=>{musicReady=true;startMusic()});music.addEventListener('error',()=>{musicReady=false;updateMusicButton()});
['pointerdown','touchstart','keydown'].forEach(ev=>window.addEventListener(ev,()=>{if(musicReady&&!musicStarted)startMusic()},{passive:true,once:false}));
musicBtn.addEventListener('click',async()=>{if(!musicReady)return;if(music.paused){await startMusic()}else{music.pause();updateMusicButton()}});try{music.load();}catch{}updateMusicButton();

// Photo system: bundled files are configured in js/media-config.js; uploaded photos use IndexedDB.
const photoInput=$('#photoInput'),photoCards=[...$$('.photo-card')],photoStatus=$('#photoStatus');
const DB_NAME='nusrat-birthday-media',DB_VERSION=1,STORE='photos';
function openPhotoDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB_NAME,DB_VERSION);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE,{keyPath:'id'})};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error)});}
async function idbGetAll(){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readonly'),q=tx.objectStore(STORE).getAll();q.onsuccess=()=>resolve(q.result.sort((a,b)=>a.id-b.id));q.onerror=()=>reject(q.error)})}
async function idbPut(record){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
async function idbClear(){const db=await openPhotoDB();return new Promise((resolve,reject)=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error)})}
const bundledPhotos=window.BIRTHDAY_MEDIA?.photos||[];
const storyPhotos=window.BIRTHDAY_MEDIA?.story||bundledPhotos.slice(0,6);
let photoMap={};
function setStoryImages(){
  $$('[data-story-index]').forEach((card)=>{
    const i=Number(card.dataset.storyIndex),src=storyPhotos[i];
    if(!src)return;
    card.innerHTML=`<img src="${src}" alt="Our memory ${i+1}" loading="lazy" decoding="async"
      onerror="this.closest('.memory-image').classList.add('image-error');this.remove()">`;
    card.classList.remove('placeholder');card.classList.add('has-image');
  });
}
setStoryImages();
Promise.resolve().then(()=>{
  [...new Set([...bundledPhotos,...storyPhotos])].forEach(src=>{
    const im=new Image();
    im.onerror=()=>console.warn('Birthday photo not found:',src);
    im.src=src;
  });
});
function setCardImage(card,src,index){card.innerHTML=`<img src="${src}" alt="Our memory ${index+1}" loading="lazy" decoding="async">`;card.classList.remove('placeholder');card.classList.add('has-image');}
function resetCard(card,index){card.innerHTML=`<span>Photo ${String(index+1).padStart(2,'0')}</span>`;card.classList.add('placeholder');card.classList.remove('has-image');}
async function renderPhotos(){
  photoCards.forEach((c,i)=>resetCard(c,i));
  let count=0;
  for(let i=0;i<photoCards.length;i++){
    const uploaded=photoMap[i];
    const src=uploaded?URL.createObjectURL(uploaded):bundledPhotos[i];
    if(src){
      setCardImage(photoCards[i],src,i);
      count++;
    }
  }
  if(photoStatus) photoStatus.textContent = count === photoCards.length
    ? `All ${count} memories are ready. ♡`
    : `${count} of ${photoCards.length} memories loaded.`;
}
async function loadStoredPhotos(){try{const rows=await idbGetAll();photoMap={};rows.forEach(r=>photoMap[r.id]=r.blob);await renderPhotos();}catch{if(photoStatus) photoStatus.textContent='Private photo storage is unavailable in this browser.';await renderPhotos();}}
photoInput?.addEventListener('change',async e=>{const files=[...e.target.files].filter(f=>f.type.startsWith('image/')).slice(0,photoCards.length);try{await Promise.all(files.map((file,i)=>idbPut({id:i,blob:file,name:file.name})));await loadStoredPhotos();}catch{if(photoStatus) photoStatus.textContent='Could not save photos. Try Chrome/Edge or use bundled files.'}e.target.value='';});
$('#clearPhotos')?.addEventListener('click',async()=>{await idbClear();photoMap={};await renderPhotos();});
loadStoredPhotos();

function openLightbox(card){const img=card.querySelector('img');if(!img)return;$('#lightboxImg').src=img.src;$('#lightboxCaption').textContent=card.dataset.caption||'A little piece of us ♡';$('#lightbox').classList.add('open');$('#lightbox').setAttribute('aria-hidden','false')}
photoCards.forEach(c=>c.addEventListener('click',()=>openLightbox(c)));$('#closeLightbox').addEventListener('click',()=>{$('#lightbox').classList.remove('open');$('#lightbox').setAttribute('aria-hidden','true')});$('#lightbox').addEventListener('click',e=>{if(e.target.id==='lightbox')$('#closeLightbox').click()});

// Surprise photo buttons. Configured files can be replaced by uploaded gallery images as fallback.
const surpriseModal=$('#surpriseModal'),surpriseImg=$('#surpriseImg'),surpriseTitle=$('#surpriseTitle'),surpriseText=$('#surpriseText');
const configuredSurprises=window.BIRTHDAY_MEDIA?.surprises||{};
const surprises={first:{title:'The beginning ♡',text:'The day I first met you became a memory I never wanted to lose.',image:configuredSurprises.first},rain:{title:'Our first brishti 🌧️',text:'Some memories feel softer because they happened in the rain.',image:configuredSurprises.rain},future:{title:'A promise for later ✈️',text:'More places. More sunsets. More ridiculous photos. More us.',image:configuredSurprises.future}};
function fallbackFor(key){return key==='first'?photoMap[0]:key==='rain'?photoMap[3]:photoMap[5]}
function openSurprise(key){const s=surprises[key];surpriseTitle.textContent=s.title;surpriseText.textContent=s.text;surpriseImg.onerror=()=>{const fallback=fallbackFor(key);if(fallback)surpriseImg.src=URL.createObjectURL(fallback)};surpriseImg.src=s.image||'';surpriseModal.classList.add('open');surpriseModal.setAttribute('aria-hidden','false')}
$$('[data-surprise]').forEach(b=>b.addEventListener('click',()=>openSurprise(b.dataset.surprise)));$('#closeSurprise').addEventListener('click',()=>{surpriseModal.classList.remove('open');surpriseModal.setAttribute('aria-hidden','true')});surpriseModal.addEventListener('click',e=>{if(e.target===surpriseModal)$('#closeSurprise').click()});

$('#surpriseBtn').addEventListener('click',()=>{const f=$('#finale');f.classList.add('open');f.setAttribute('aria-hidden','false');setTimeout(()=>f.scrollIntoView({behavior:reduced?'auto':'smooth'}),30);tryStartMusic()});
const labels=[['home','A little universe'],['countdown','Until your day'],['story','Our story'],['gallery','Little pieces of us'],['reasons','Why I love you'],['letter','A letter'],['surprise','One last thing'],['finale','Forever']];const label=$('#sectionLabel');const labelObs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const x=labels.find(v=>v[0]===e.target.id);if(x)label.textContent=x[1]}}),{threshold:.45});labels.forEach(x=>{const el=$('#'+x[0]);if(el)labelObs.observe(el)});

// Opening sequence: candle -> touch-to-cut cake -> gift -> memories.
const gate=$('#birthdayGate'), gatePhases=[...$$('.gate-phase')], progress=[...$$('.gate-progress span')];
const setGatePhase=(name)=>{gatePhases.forEach(p=>p.classList.toggle('active',p.dataset.phase===name));progress.forEach((p,i)=>p.classList.toggle('active',i===({candle:0,cake:1,gift:2}[name])))};
const blowGate=$('#blowGateCandle'), gateCake=$('#gateCake'), gateKnife=$('#gateKnife'), cakeCutHint=$('#cakeCutHint'), gateGift=$('#gateGift');
blowGate?.addEventListener('click',async()=>{await startMusic();blowGate.classList.add('blown');setTimeout(()=>setGatePhase('cake'),750)});
let cakeHasBeenCut=false;
gateCake?.addEventListener('pointerdown',(e)=>{
  if(cakeHasBeenCut)return;
  const r=gateCake.getBoundingClientRect();
  const x=Math.max(12,Math.min(88,((e.clientX-r.left)/r.width)*100));
  gateCake.style.setProperty('--cut-x',x+'%');
  gateCake.style.setProperty('--knife-x',((x-50)*1.45)+'px');
  gateCake.classList.add('cut');cakeHasBeenCut=true;
  cakeCutHint.textContent='Perfect. A slice just for you ♡';
  if(navigator.vibrate)navigator.vibrate([20,30,20]);
  setTimeout(()=>setGatePhase('gift'),1250);
});
gateGift?.addEventListener('click',async()=>{await startMusic();gateGift.classList.add('open');if(navigator.vibrate)navigator.vibrate([15,25,15]);setTimeout(()=>{document.body.classList.remove('gate-active');gate.classList.add('finished');setTimeout(()=>gate.remove(),650);document.querySelector('#story')?.scrollIntoView({behavior:reduced?'auto':'smooth'});},1350)});

// Birthday magic interactions: cake, gift and celebration inside the main page too.
const cakeWrap=$('#cakeWrap'), blowCandle=$('#blowCandle'), cutCake=$('#cutCake');
blowCandle?.addEventListener('click',()=>{cakeWrap?.classList.add('no-flame');blowCandle.textContent='Wish made ♡';if(navigator.vibrate)navigator.vibrate(30)});
cutCake?.addEventListener('click',()=>{cakeWrap?.classList.add('cut');cutCake.textContent='A slice for us ♡';if(navigator.vibrate)navigator.vibrate([20,30,20])});
const giftWrap=$('#giftWrap'),openGift=$('#openGift'),giftMessage=$('#giftMessage');openGift?.addEventListener('click',()=>{const open=giftWrap.classList.toggle('open');giftMessage.classList.toggle('show',open);openGift.textContent=open?'Gift opened ♡':'Open the gift 🎁'});
const partyStage=$('#partyStage'),celebrateBtn=$('#celebrateBtn');celebrateBtn?.addEventListener('click',()=>{partyStage.classList.remove('celebrating');void partyStage.offsetWidth;partyStage.classList.add('celebrating');celebrateBtn.textContent='Happy Birthday! ♡';if(navigator.vibrate)navigator.vibrate([20,40,20,40,50]);setTimeout(()=>partyStage.classList.remove('celebrating'),2200)});
