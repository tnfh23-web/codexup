(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let smoother = null;
  if (!reduced && window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
    smoother = ScrollSmoother.create({ wrapper: '#smooth-wrapper', content: '#smooth-content', smooth: .85, effects: false, normalizeScroll: false });
  }
  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('visible'));
  else {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    }), { threshold: .12, rootMargin: '0px 0px -35px' });
    reveals.forEach(el => observer.observe(el));
  }

  fetch('index.html').then(r => r.text()).then(html => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const count = doc.querySelectorAll('.update').length;
    if (count) document.querySelector('[data-count]').textContent = count;
  }).catch(() => {});

  const steps = [
    { label:'평일 오전 9시 40분', title:'확인 작업을 시작합니다.', copy:'컴퓨터가 켜져 있으면 예약된 작업이 실행됩니다. 주말 동안 나온 소식은 월요일에 함께 확인합니다.', note:'예약 실행 · KST' },
    { label:'공식 출처 3곳', title:'날짜와 내용을 서로 대조합니다.', copy:'ChatGPT 릴리스 노트, Codex 변경 기록, GitHub 릴리스를 살펴보고 같은 발표인지, 정말 새 소식인지 확인합니다.', note:'공식 문서 · 교차 확인' },
    { label:'사용자의 관점으로', title:'무엇이 달라지는지 풀어씁니다.', copy:'기능 이름을 옮기는 데 그치지 않고 실제 사용과 작업 방식에 어떤 영향이 있는지 쉬운 한국어로 정리합니다.', note:'핵심 변화 · 사용자 영향' },
    { label:'검증이 끝난 뒤', title:'새 소식만 아카이브에 남깁니다.', copy:'중복을 제거하고 최신순으로 페이지에 추가한 뒤 GitHub Pages에 반영합니다. 소식이 없다면 파일도 바꾸지 않습니다.', note:'HTML 갱신 · 공개' }
  ];
  const buttons = [...document.querySelectorAll('[data-step]')];
  const line = document.querySelector('.process-line span');
  function selectStep(index) {
    const step = steps[index];
    buttons.forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-pressed', i === index); });
    const detail = document.querySelector('.process-detail');
    const paint = () => {
      document.querySelector('[data-step-label]').textContent = step.label;
      document.querySelector('[data-step-number]').textContent = String(index + 1).padStart(2, '0');
      document.querySelector('[data-step-title]').textContent = step.title;
      document.querySelector('[data-step-copy]').textContent = step.copy;
      document.querySelector('[data-step-note]').textContent = step.note;
      line.style.width = `${(index + 1) * 25}%`;
    };
    if (reduced) return paint();
    detail.animate([{opacity:1,transform:'translateY(0)'},{opacity:.25,transform:'translateY(5px)'}],{duration:130}).finished.then(() => { paint(); detail.animate([{opacity:.25,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240,fill:'both'}); });
  }
  buttons.forEach((button, index) => button.addEventListener('click', () => selectStep(index)));

  const sections = [...document.querySelectorAll('[data-section]')];
  const links = [...document.querySelectorAll('.topbar nav a')];
  const updateNav = () => {
    let current = sections[0];
    sections.forEach(section => { if (section.getBoundingClientRect().top < innerHeight * .38) current = section; });
    links.forEach(link => link.classList.toggle('active', link.hash === `#${current.id}`));
  };
  addEventListener('scroll', updateNav, {passive:true}); updateNav();

  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
    detail.querySelector('summary i').textContent = detail.open ? '닫기' : '열기';
    if (window.ScrollTrigger) requestAnimationFrame(() => ScrollTrigger.refresh());
  }));

  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    const target = document.querySelector(link.hash);
    if (!target || !smoother) return;
    event.preventDefault();
    smoother.scrollTo(target, true, 'top 72px');
  }));
})();
