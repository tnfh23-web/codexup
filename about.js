(() => {
  const root = document.documentElement;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress = document.querySelector('.story-progress span');
  const setProgress = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${max > 0 ? (scrollY / max) * 100 : 0}%`;
  };
  addEventListener('scroll', setProgress, { passive: true });
  setProgress();

  fetch('index.html').then((r) => r.text()).then((html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const count = doc.querySelectorAll('.update').length;
    if (count) document.querySelector('[data-story-count]').textContent = count;
  }).catch(() => {});

  const characters = {
    chatgpt: { image: 'images/chatgpt-character.png', alt: '민트색 ChatGPT 안내 캐릭터', index: '01 / CONVERSATION', title: '사람과 가까운<br>대화의 신호', description: '음성, 창작, 모바일과 협업 기능처럼 일상에 가까운 변화를 부드러운 곡선과 민트색 빛으로 표현합니다.', color: 'MINT / #63F5C1', role: 'USER EXPERIENCE', accent: '#63f5c1' },
    codex: { image: 'images/codex-character.png', alt: '푸른색 Codex 안내 캐릭터', index: '02 / BUILDER', title: '만드는 사람을 위한<br>실행의 신호', description: '코드 작성, 자동화, 터미널과 에이전트 기능처럼 작업 방식을 바꾸는 소식을 선명한 푸른빛으로 구분합니다.', color: 'BLUE / #69A7FF', role: 'BUILD & AUTOMATION', accent: '#69a7ff' }
  };
  const tabs = [...document.querySelectorAll('[data-character]')];
  const stage = document.querySelector('.character-console');
  function selectCharacter(key, focus = false) {
    const item = characters[key];
    tabs.forEach((tab) => { const active = tab.dataset.character === key; tab.classList.toggle('is-active', active); tab.setAttribute('aria-selected', active); tab.tabIndex = active ? 0 : -1; });
    stage.style.setProperty('--character', item.accent);
    const image = document.querySelector('[data-character-image]');
    const nodes = [image, document.querySelector('.character-copy')];
    const update = () => {
      image.src = item.image; image.alt = item.alt;
      document.querySelector('[data-character-index]').textContent = item.index;
      document.querySelector('[data-character-title]').innerHTML = item.title;
      document.querySelector('[data-character-description]').textContent = item.description;
      document.querySelector('[data-character-color]').textContent = item.color;
      document.querySelector('[data-character-role]').textContent = item.role;
    };
    if (!reduced && window.gsap) gsap.to(nodes, { opacity: 0, y: 10, duration: .18, onComplete: () => { update(); gsap.to(nodes, { opacity: 1, y: 0, duration: .38, ease: 'power2.out' }); } }); else update();
    if (focus) tabs.find((tab) => tab.dataset.character === key).focus();
  }
  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => selectCharacter(tab.dataset.character));
    tab.addEventListener('keydown', (event) => { if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) return; event.preventDefault(); const delta = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1; selectCharacter(tabs[(index + delta + tabs.length) % tabs.length].dataset.character, true); });
  });

  const steps = [
    ['TRIGGER / 01','예약된 확인을 시작합니다.','평일 오전 9시 40분, 마지막 기록 이후의 새로운 공식 발표가 있는지 확인합니다.','RUNNING','25%'],
    ['VERIFY / 02','공식 출처를 서로 대조합니다.','ChatGPT 릴리스 노트, Codex 변경 로그, GitHub 릴리스의 날짜와 내용을 교차 확인합니다.','CHECKING','50%'],
    ['TRANSLATE / 03','변화의 의미를 쉽게 풉니다.','기술적인 발표를 실제 사용자에게 무엇이 달라지는지 중심으로 짧고 분명하게 정리합니다.','WRITING','75%'],
    ['PUBLISH / 04','검증된 기록만 공개합니다.','중복을 제거한 뒤 웹페이지를 갱신하고 GitHub Pages까지 안전하게 반영합니다.','DEPLOYED','100%']
  ];
  const stepItems = [...document.querySelectorAll('[data-step]')];
  let activeStep = 0, cycle;
  function showStep(index, manual = false) {
    activeStep = index; const data = steps[index];
    stepItems.forEach((li, i) => li.classList.toggle('is-active', i === index));
    document.querySelector('[data-monitor-code]').textContent = String(index + 1).padStart(2, '0');
    document.querySelector('[data-monitor-label]').textContent = data[0];
    document.querySelector('[data-monitor-title]').textContent = data[1];
    document.querySelector('[data-monitor-description]').textContent = data[2];
    document.querySelector('[data-monitor-status]').textContent = data[3];
    document.querySelector('[data-monitor-progress]').textContent = data[4];
    document.querySelector('.system-monitor footer b').style.width = data[4];
    if (manual) { clearInterval(cycle); cycle = setInterval(() => showStep((activeStep + 1) % steps.length), 4500); }
  }
  stepItems.forEach((li, i) => li.querySelector('button').addEventListener('click', () => showStep(i, true)));
  if (!reduced) cycle = setInterval(() => showStep((activeStep + 1) % steps.length), 4500);
  setInterval(() => { document.querySelector('[data-monitor-time]').textContent = new Intl.DateTimeFormat('ko-KR',{timeZone:'Asia/Seoul',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date()); }, 1000);

  if (!reduced && window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    gsap.to('.hero-orbit', { rotate: 180, scrollTrigger: { trigger: '.story-hero', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.from('.hero-copy > *', { opacity: 0, y: 45, duration: 1, stagger: .11, ease: 'power3.out' });
    gsap.from('.hero-metrics article', { opacity: 0, x: 30, duration: .8, stagger: .09, delay: .35 });
    gsap.utils.toArray('.section-head, .manifesto-copy, .problem-stack article, .principle-list article').forEach((el) => gsap.from(el, { opacity: 0, y: 40, duration: .85, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } }));
    gsap.fromTo('.shift-before', { xPercent: 0 }, { xPercent: -45, opacity: .15, scrollTrigger: { trigger: '.shift-scene', start: 'top top', end: 'bottom top', scrub: 1, pin: true } });
    gsap.fromTo('.shift-after', { xPercent: 45, opacity: .2 }, { xPercent: 0, opacity: 1, scrollTrigger: { trigger: '.shift-scene', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.to('.shift-core', { rotate: 360, scrollTrigger: { trigger: '.shift-scene', start: 'top top', end: 'bottom top', scrub: 1 } });
    gsap.from('.map-board path', { strokeDashoffset: 300, opacity: 0, duration: 2, stagger: .2, scrollTrigger: { trigger: '.map-board', start: 'top 70%' } });
    gsap.from('.source, .map-core', { opacity: 0, scale: .75, duration: .7, stagger: .13, scrollTrigger: { trigger: '.map-board', start: 'top 67%' } });
    gsap.to('.result-orbit', { rotate: 220, scrollTrigger: { trigger: '.result', start: 'top bottom', end: 'bottom top', scrub: 1 } });
    const image = document.querySelector('[data-character-image]');
    document.querySelector('.character-stage').addEventListener('pointermove', (event) => { const rect = event.currentTarget.getBoundingClientRect(); gsap.to(image,{x:(event.clientX-rect.left-rect.width/2)*.025,y:(event.clientY-rect.top-rect.height/2)*.025,duration:.6}); });
    document.querySelector('.character-stage').addEventListener('pointerleave', () => gsap.to(image,{x:0,y:0,duration:.6}));
  }
})();
