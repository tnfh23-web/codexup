(() => {
 const root=document.documentElement,header=document.querySelector('.process-header');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const nav=[...document.querySelectorAll('.chapter-nav a')],chapters=[...document.querySelectorAll('[data-chapter]')];
 const items=[...document.querySelectorAll('[data-reveal]')],playing=new Map(),shown=new Set();
 let smooth,observer,scrollFrame,cleanupCharacters=()=>{};

 function stop(el){playing.get(el)?.cancel();playing.delete(el);}
 function reveal(el){
  if(reduced.matches||el.dataset.motionState!=='pending')return;
  const type=el.dataset.reveal,peers=[...el.parentElement.children].filter(node=>node.hasAttribute('data-reveal'));
  const delay=Math.max(0,Math.min(peers.indexOf(el),4))*65;
  el.dataset.motionState='entering';shown.add(el);
  const from={opacity:0,transform:`translate3d(0,${type==='title'?32:type==='image'?30:20}px,0)`},to={opacity:1,transform:'translate3d(0,0,0)'};
  if(type==='title'){from.clipPath='inset(0 0 100% 0)';to.clipPath='inset(0 0 0% 0)';}
  if(type==='image'){from.clipPath='inset(5% 0 0 0)';to.clipPath='inset(0 0 0 0)';}
  // Interaction remains stable while a component or a button group fades in.
  if(el.querySelector('button,input,select')||el.matches('a')){from.transform=to.transform='none';delete from.clipPath;delete to.clipPath;}
  const animation=el.animate([from,to],{duration:type==='image'?950:type==='title'?850:700,delay,easing:'cubic-bezier(.22,.8,.24,1)',fill:'both'});
  playing.set(el,animation);
  animation.finished.then(()=>{if(playing.get(el)!==animation)return;el.dataset.motionState='visible';playing.delete(el);animation.cancel();}).catch(()=>{});
 }
 function updateScroll(){
  scrollFrame=null;
  const edge=header.getBoundingClientRect().bottom+140;
  let current=chapters[0].id;
  chapters.forEach(section=>{if(section.getBoundingClientRect().top<=edge)current=section.id;});
  nav.forEach(link=>{if(link.hash===`#${current}`)link.setAttribute('aria-current','step');else link.removeAttribute('aria-current');});
  const progress=document.querySelector('.read-progress'),limit=root.scrollHeight-innerHeight;
  progress.style.transform=`scaleX(${limit>0?Math.min(1,Math.max(0,scrollY/limit)):0})`;
  if(!reduced.matches)shown.forEach(el=>{const rect=el.getBoundingClientRect();if(rect.bottom<-96||rect.top>innerHeight+96){stop(el);el.dataset.motionState='pending';shown.delete(el);}});
 }
 function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScroll);}
 function setupCharacters(){
  if(!window.gsap)return()=>{};
  const figures=[...document.querySelectorAll('.character-study')],tweens=[];
  const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>{
   const tween=tweens[figures.indexOf(entry.target)];entry.target.dataset.inView=String(entry.isIntersecting);
   if(entry.isIntersecting&&!document.hidden)tween?.resume();else tween?.pause();
  }),{threshold:.05});
  const pointerCleanups=[];
  figures.forEach((figure,index)=>{
   const image=figure.querySelector('img'),track=figure.querySelector('.character-track');
   tweens.push(gsap.to(image,{y:index?-7:7,duration:index?3.8:3.1,ease:'sine.inOut',repeat:-1,yoyo:true,paused:true}));
   visibility.observe(figure);
   if(!matchMedia('(hover: hover) and (pointer: fine)').matches)return;
   const x=gsap.quickTo(track,'x',{duration:.65,ease:'power3.out'}),y=gsap.quickTo(track,'y',{duration:.65,ease:'power3.out'}),turn=gsap.quickTo(track,'rotation',{duration:.65,ease:'power3.out'});
   const move=e=>{const r=figure.getBoundingClientRect(),dx=(e.clientX-r.left)/r.width-.5,dy=(e.clientY-r.top)/r.height-.5;x(dx*14);y(dy*10);turn(dx*2);};
   const leave=()=>{x(0);y(0);turn(0);};
   figure.addEventListener('pointermove',move,{passive:true});figure.addEventListener('pointerleave',leave);
   pointerCleanups.push(()=>{figure.removeEventListener('pointermove',move);figure.removeEventListener('pointerleave',leave);gsap.killTweensOf(track);gsap.set(track,{clearProps:'transform'});});
  });
  const pageVisibility=()=>figures.forEach((figure,index)=>{if(!document.hidden&&figure.dataset.inView==='true')tweens[index].resume();else tweens[index].pause();});
  document.addEventListener('visibilitychange',pageVisibility);
  return()=>{visibility.disconnect();tweens.forEach(tween=>tween.kill());pointerCleanups.forEach(clean=>clean());document.removeEventListener('visibilitychange',pageVisibility);figures.forEach(figure=>{delete figure.dataset.inView;gsap.set(figure.querySelector('img'),{clearProps:'transform'});});};
 }
 function setupMotion(){
  smooth?.destroy();smooth=null;observer?.disconnect();playing.forEach(animation=>animation.cancel());playing.clear();shown.clear();cleanupCharacters();
  if(reduced.matches){items.forEach(el=>el.dataset.motionState='visible');return;}
  if(typeof Lenis==='function')smooth=new Lenis({lerp:.095,autoRaf:true,syncTouch:false,prevent:node=>node.matches?.('select,input,.chapter-nav')});
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)reveal(entry.target);}),{rootMargin:'0px 0px -5% 0px',threshold:0});
  items.forEach(el=>{el.dataset.motionState='pending';observer.observe(el);});
  cleanupCharacters=setupCharacters();
 }
 setupMotion();reduced.addEventListener('change',setupMotion);
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});updateScroll();
 document.addEventListener('focusin',e=>{if(!e.target.matches(':focus-visible'))return;const el=e.target.closest('[data-reveal]');if(el){stop(el);el.dataset.motionState='visible';shown.add(el);}});
 document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{
  const target=document.getElementById(link.hash.slice(1));if(!target)return;
  e.preventDefault();const top=scrollY+target.getBoundingClientRect().top-header.offsetHeight-18;
  history.replaceState(null,'',link.hash);
  if(smooth)smooth.scrollTo(top,{duration:1.05});else scrollTo({top,behavior:'instant'});
 }));

 const demo=document.querySelector('.component-example'),productButtons=[...document.querySelectorAll('[data-demo-product]')],year=demo.querySelector('select'),theme=demo.querySelector('input'),status=demo.querySelector('output');
 let product='ChatGPT';
 function updateDemo(){
  demo.dataset.demoTheme=theme.checked?'light':'dark';
  productButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.demoProduct===product)));
  demo.querySelector('.demo-record b').textContent=product==='ChatGPT'?'2026-10-02':'2026-10-05';
  demo.querySelector('.demo-record').hidden=year.value==='2025';
  demo.querySelector('.demo-empty').hidden=year.value!=='2025';
  status.textContent=`${product} · ${year.selectedOptions[0].textContent} · ${theme.checked?'밝은':'어두운'} 테마`;
 }
 productButtons.forEach(button=>button.addEventListener('click',()=>{product=button.dataset.demoProduct;updateDemo();}));year.addEventListener('change',updateDemo);theme.addEventListener('change',updateDemo);

 const screens={product:{src:'product.webp',alt:'실제 제품 선택 화면',title:'01 제품 선택',copy:'메인 화면에서 ChatGPT 또는 Codex를 선택합니다. 두 캐릭터와 색상으로 제품을 구분하고, 해당 제품의 기록으로 바로 이동합니다.'},list:{src:'list.webp',alt:'실제 Codex 업데이트 목록과 제품·기간 필터',title:'02 업데이트 목록',copy:'제품·연도·월을 조합해 필요한 기록을 좁힙니다. 발표일, 주요 변경과 사용자 영향, 공식 출처를 같은 구조로 읽습니다.'},light:{src:'light.webp',alt:'실제 업데이트 목록의 밝은 테마',title:'03 밝은 테마',copy:'눈에 편한 화면을 선택할 수 있도록 밝은 테마와 어두운 테마를 제공합니다. 제품과 기간 선택, 기록 구조는 그대로 유지합니다.'}};
 const screenTabs=[...document.querySelectorAll('[data-screen]')],panel=document.querySelector('.screen-preview'),caption=document.querySelector('.screen-caption');
 let screenAnimation;
 function selectScreen(button){
  const screen=screens[button.dataset.screen];
  screenTabs.forEach(tab=>{const selected=tab===button;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;});
  panel.setAttribute('aria-labelledby',button.id);
  const image=panel.querySelector('img');image.src=`images/process/${screen.src}`;image.alt=screen.alt;
  const [number,...title]=screen.title.split(' ');caption.querySelector('h3 span').textContent=number;caption.querySelector('h3').lastChild.textContent=` ${title.join(' ')}`;caption.querySelector('p').textContent=screen.copy;
  screenAnimation?.cancel();if(!reduced.matches)screenAnimation=image.animate([{opacity:.45},{opacity:1}],{duration:350,easing:'ease-out'});
 }
 screenTabs.forEach((button,index)=>{
  button.addEventListener('click',()=>selectScreen(button));
  button.addEventListener('keydown',e=>{let next;if(e.key==='ArrowRight')next=(index+1)%screenTabs.length;else if(e.key==='ArrowLeft')next=(index+screenTabs.length-1)%screenTabs.length;else if(e.key==='Home')next=0;else if(e.key==='End')next=screenTabs.length-1;else return;e.preventDefault();screenTabs[next].focus({preventScroll:true});selectScreen(screenTabs[next]);});
 });
 addEventListener('pagehide',()=>{smooth?.destroy();observer?.disconnect();cleanupCharacters();playing.forEach(animation=>animation.cancel());cancelAnimationFrame(scrollFrame);});
 addEventListener('pageshow',e=>{if(e.persisted){setupMotion();updateScroll();}});
})();
