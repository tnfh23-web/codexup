(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const gsapReady = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
  const loader = document.querySelector('.loader');

  if (!gsapReady || reduced) {
    if (loader) loader.remove();
    document.documentElement.classList.add('motion-off');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  const intro = gsap.timeline({defaults:{ease:'power3.inOut'}});
  intro.from('.loader span',{scaleX:0,duration:.7})
    .to('.loader p',{opacity:0,y:-8,duration:.35})
    .to('.loader',{clipPath:'inset(50% 0 50% 0)',duration:.8},'-=.05')
    .set('.loader',{display:'none'})
    .from('.hero h1 em',{yPercent:110,duration:1,stagger:.12},'-=.45')
    .from('.hero-kicker,.hero-foot',{opacity:0,y:18,duration:.65,stagger:.12},'-=.55');

  gsap.to('.ticker div',{xPercent:-50,ease:'none',duration:22,repeat:-1});
  gsap.to('.orbit-word',{yPercent:-35,rotation:2,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.from('.manifesto-copy .lead',{y:80,opacity:0,ease:'power2.out',scrollTrigger:{trigger:'.manifesto',start:'top 72%',end:'top 35%',scrub:1}});
  gsap.from('.copy-columns p',{y:45,opacity:0,stagger:.15,scrollTrigger:{trigger:'.copy-columns',start:'top 82%'}});

  gsap.fromTo('.image-layer',{yPercent:-7,scale:1.12},{yPercent:7,scale:1,ease:'none',scrollTrigger:{trigger:'.image-break',start:'top bottom',end:'bottom top',scrub:true}});
  gsap.from('.image-caption>*',{y:45,opacity:0,stagger:.12,scrollTrigger:{trigger:'.image-break',start:'top 55%'}});
  gsap.from('.image-counter b',{textContent:0,snap:{textContent:1},duration:1.2,scrollTrigger:{trigger:'.image-break',start:'top 55%'}});

  document.querySelectorAll('.method-list article').forEach((row) => {
    gsap.from(row.children,{y:35,opacity:0,stagger:.08,scrollTrigger:{trigger:row,start:'top 82%',toggleActions:'play none none reverse'}});
  });

  const mobile = matchMedia('(max-width: 760px)').matches;
  if (!mobile) {
    const lens = gsap.timeline({scrollTrigger:{trigger:'.lens',start:'top top',end:'bottom bottom',scrub:1}});
    lens.from('.lens-copy',{opacity:0,y:70,duration:.8})
      .from('.product-card.light',{xPercent:40,rotation:8,opacity:0,duration:1},'<')
      .from('.product-card.dark',{xPercent:75,rotation:8,opacity:0,duration:1},'<.2')
      .to('.product-card.light',{xPercent:-8,rotation:-5,duration:1})
      .to('.product-card.dark',{xPercent:4,yPercent:-3,rotation:0,duration:1},'<');
  }

  gsap.utils.toArray('.principles li').forEach((item,i)=>gsap.from(item,{x:i%2?25:-25,opacity:0,scrollTrigger:{trigger:item,start:'top 86%'}}));
  gsap.from('.closing h2',{scale:.85,opacity:0,scrollTrigger:{trigger:'.closing',start:'top 70%',end:'center center',scrub:1}});

  let resizeTimer;
  addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>ScrollTrigger.refresh(),180)});
  addEventListener('load',()=>ScrollTrigger.refresh());
})();
