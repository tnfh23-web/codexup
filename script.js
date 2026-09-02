// 페이지에서 반복적으로 사용하는 요소를 한 번만 찾아 재사용합니다.
const updateList = document.querySelector(".update-list");
const updates = [...document.querySelectorAll(".update")];
const filterButtons = [...document.querySelectorAll(".filter-button")];
const filterIndicator = document.querySelector(".filter-indicator");
const customSelects = [...document.querySelectorAll(".custom-select")];
const updateCount = document.querySelector("#update-count");
const latestUpdate = document.querySelector("#latest-update");
const backToTop = document.querySelector(".back-to-top");
const themeToggle = document.querySelector(".theme-toggle");
const themeToggleText = document.querySelector(".theme-toggle-text");
const filterReset = document.querySelector(".filter-reset");
const scrollProgress = document.querySelector(".scroll-progress span");
const updateFeed = document.querySelector("#update-feed");
const productLanding = document.querySelector(".product-landing");
const detailPage = document.querySelector(".detail-page");
const landingProductButtons = [...document.querySelectorAll("[data-open-product]")];
const landingProductCards = [...document.querySelectorAll(".landing-product")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const landingBack = document.querySelector(".landing-back");
const detailTitle = document.querySelector("#detail-title");
const detailIntro = document.querySelector("#detail-intro");
const scrollCompanions = [...document.querySelectorAll(".scroll-companion")];
const chatgptCompanion = document.querySelector('[data-scroll-companion="chatgpt"]');
const codexCompanion = document.querySelector('[data-scroll-companion="codex"]');
let scrollSmoother = null;

// 현재 화면에 표시되는 카드만 기준으로 연·월 구분 제목을 다시 생성합니다.
function renderMonthHeadings() {
  // 필터가 바뀔 때 이전 제목이 남지 않도록 먼저 모두 제거합니다.
  document.querySelectorAll(".month-heading").forEach((heading) => heading.remove());
  let previousMonth = "";

  updates.forEach((card) => {
    if (card.hidden) return;

    const date = card.querySelector("time")?.dateTime;
    if (!date) return;

    const month = date.slice(0, 7);
    if (month === previousMonth) return;

    const [year, monthNumber] = month.split("-");
    const heading = document.createElement("h2");
    heading.className = "month-heading";
    heading.textContent = `${year}년 ${Number(monthNumber)}월`;
    card.before(heading);
    previousMonth = month;
  });
}

let activeProduct = "all";
let activeYear = "all";
let activeMonth = "all";

// 제품, 연도, 월 조건을 모두 만족하는 카드만 표시합니다.
function applyFilters() {
  let visibleCount = 0;

  updates.forEach((card) => {
    const date = card.querySelector("time")?.dateTime ?? "";
    const matchesProduct = activeProduct === "all" || card.dataset.product === activeProduct;
    const matchesYear = activeYear === "all" || date.startsWith(`${activeYear}-`);
    const matchesMonth = activeMonth === "all" || date.slice(5, 7) === activeMonth;
    const visible = matchesProduct && matchesYear && matchesMonth;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  updateCount.textContent = visibleCount;
  // 하나라도 조건이 적용된 경우에만 초기화 버튼을 보여줍니다.
  filterReset.hidden = activeProduct === "all" && activeYear === "all" && activeMonth === "all";
  renderMonthHeadings();
}

// CodePen 예제처럼 글자가 순서대로 위로 교체되는 호버 구조를 만듭니다.
function buildStaggerLabel(button) {
  const label = button.textContent.trim();
  button.setAttribute("aria-label", label);
  button.textContent = "";

  const clip = document.createElement("span");
  clip.className = "filter-label-clip";

  [...label].forEach((character, index) => {
    const column = document.createElement("span");
    column.className = "filter-character";
    column.style.setProperty("--character-index", index);

    const stack = document.createElement("span");
    stack.className = "filter-character-stack";

    // 같은 글자를 위아래로 두 번 배치하고 CSS에서 스택 전체를 이동시킵니다.
    [character, character].forEach((value) => {
      const glyph = document.createElement("span");
      glyph.textContent = value === " " ? "\u00a0" : value;
      stack.append(glyph);
    });

    column.append(stack);
    clip.append(column);
  });

  button.append(clip);
}

function moveProductIndicator(button, animate = true) {
  // 활성 버튼과 같은 너비·위치로 선택 배경을 이동합니다.
  if (!animate) filterIndicator.style.transition = "none";
  filterIndicator.style.width = `${button.offsetWidth}px`;
  filterIndicator.style.transform = `translateX(${button.offsetLeft}px)`;

  if (!animate) {
    requestAnimationFrame(() => {
      filterIndicator.style.transition = "";
    });
  }
}

// 상세 페이지 상단의 제품 필터와 실제 카드 목록을 같은 상태로 유지합니다.
function setProductFilter(product, moveToFeed = false) {
  activeProduct = product;

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === product;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  const activeButton = filterButtons.find((button) => button.dataset.filter === product);
  if (activeButton) moveProductIndicator(activeButton);
  applyFilters();

  if (moveToFeed && updateFeed) {
    // 화면 이동과 함께 키보드 초점도 옮겨 현재 위치를 보조기기에 알립니다.
    updateFeed.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    updateFeed.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
  }
}

filterButtons.forEach(buildStaggerLabel);

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showDetailPage(button.dataset.filter);
  });
});

// 반응형으로 버튼 너비가 달라지면 활성 배경의 위치도 다시 계산합니다.
window.addEventListener("resize", () => {
  const activeButton = document.querySelector(".filter-button.is-active");
  if (activeButton) moveProductIndicator(activeButton, false);
});

const dates = updates.map((card) => card.querySelector("time")?.dateTime).filter(Boolean).sort().reverse();
const years = [...new Set(dates.map((date) => date.slice(0, 4)))];
const months = [...new Set(dates.map((date) => date.slice(5, 7)))].sort((a, b) => Number(a) - Number(b));

// 첫 화면의 제품별 소식 수와 최근 날짜는 실제 카드에서 계산해 자동으로 갱신합니다.
["chatgpt", "codex"].forEach((product) => {
  const productUpdates = updates.filter((card) => card.dataset.product === product);
  const productDates = productUpdates.map((card) => card.querySelector("time")?.dateTime).filter(Boolean).sort().reverse();
  const count = document.querySelector(`[data-landing-count="${product}"]`);
  const latest = document.querySelector(`[data-landing-latest="${product}"]`);
  if (count) count.textContent = productUpdates.length;
  if (latest && productDates[0]) {
    latest.dateTime = productDates[0];
    latest.textContent = productDates[0];
  }
});
const totalUpdates = document.querySelector("[data-total-updates]");
if (totalUpdates) totalUpdates.textContent = updates.length;

// 화면 너비보다 넓은 한 묶음을 먼저 만든 뒤 동일한 묶음을 연결해 빈 구간 없는 마퀴를 만듭니다.
const tickerTrack = document.querySelector(".ticker-track");
const tickerGroup = tickerTrack?.querySelector(".ticker-group");
let tickerTween = null;
let tickerResizeTimer = null;

function buildTicker() {
  if (!tickerTrack || !tickerGroup) return;
  const originalItems = tickerGroup.dataset.originalItems || tickerGroup.innerHTML;
  tickerGroup.dataset.originalItems = originalItems;
  tickerTween?.kill();
  tickerTrack.querySelectorAll(".ticker-group").forEach((group, index) => {
    if (index > 0) group.remove();
  });
  tickerGroup.innerHTML = originalItems;

  // 한 그룹만으로도 뷰포트를 넉넉히 덮도록 같은 항목을 계속 추가합니다.
  while (tickerGroup.scrollWidth < window.innerWidth + 160) {
    tickerGroup.insertAdjacentHTML("beforeend", originalItems);
  }

  tickerTrack.append(tickerGroup.cloneNode(true));
  if (!reduceMotion && window.gsap) {
    window.gsap.set(tickerTrack, { x: 0 });
    tickerTween = window.gsap.to(tickerTrack, {
      x: -tickerGroup.scrollWidth,
      duration: tickerGroup.scrollWidth / 115,
      ease: "none",
      repeat: -1,
    });
  }
}

if (tickerTrack && tickerGroup) {
  buildTicker();
  window.addEventListener("resize", () => {
    window.clearTimeout(tickerResizeTimer);
    tickerResizeTimer = window.setTimeout(buildTicker, 160);
  });
}

const productPageCopy = {
  all: {
    title: "Codex · ChatGPT 업데이트 소식",
    intro: "두 제품의 새로운 기능과 중요한 변경 사항을 날짜별로 정리합니다.",
  },
  chatgpt: {
    title: "ChatGPT 업데이트 소식",
    intro: "대화, 창작, 모바일 앱과 협업 기능의 변화를 날짜별로 확인합니다.",
  },
  codex: {
    title: "Codex 업데이트 소식",
    intro: "CLI, 데스크톱 앱, 모델과 개발 도구의 핵심 변경을 날짜별로 확인합니다.",
  },
};

// 제품 선택 화면과 상세 화면을 한 문서 안에서 전환해 카드 콘텐츠를 중복하지 않습니다.
function showDetailPage(product, addHistory = true) {
  const selectedProduct = productPageCopy[product] ? product : "all";
  productLanding.hidden = true;
  detailPage.hidden = false;
  document.body.classList.add("is-detail-open");
  detailTitle.textContent = productPageCopy[selectedProduct].title;
  detailIntro.textContent = productPageCopy[selectedProduct].intro;
  document.title = `${productPageCopy[selectedProduct].title} | Release Archive`;
  setProductFilter(selectedProduct);

  if (addHistory) history.pushState({ product: selectedProduct }, "", `#${selectedProduct}`);
  if (scrollSmoother) scrollSmoother.scrollTop(0);
  else window.scrollTo({ top: 0, behavior: "auto" });
  requestAnimationFrame(() => {
    detailTitle.focus({ preventScroll: true });
    setupGsapScrollEffects();
  });
}

let landingEntrance = null;

// 첫 화면으로 돌아올 때마다 같은 시작 동작을 깨끗하게 다시 재생합니다.
function ensureLandingCardsVisible() {
  if (!productLanding || productLanding.hidden || !window.gsap) return;
  window.gsap.set('.portal-nav > *, .portal-intro > *, .portal-deck, .portal-card, .portal-card .landing-character, .portal-ticker', { clearProps: 'opacity,visibility,transform,rotate,rotateX,rotateY,x,y,scale' });
  landingProductCards.forEach(card => { card.style.opacity=''; card.style.visibility=''; card.style.transform=''; });
}

function playLandingEntrance() {
  if (!window.gsap || reduceMotion || !productLanding || productLanding.hidden) return;
  landingEntrance?.kill();
  window.gsap.set(".portal-nav > *, .portal-intro > *, .portal-card, .portal-ticker", { clearProps: "all" });
  ensureLandingCardsVisible();
  landingEntrance = window.gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: ensureLandingCardsVisible, onInterrupt: ensureLandingCardsVisible })
    .from(".portal-nav > *", { y: -18, autoAlpha: 0, duration: 0.7, stagger: 0.08 })
    .from(".portal-kicker", { x: -22, autoAlpha: 0, duration: 0.55 }, "-=0.35")
    .from(".portal-intro h1 > *", { yPercent: 115, rotate: 3, duration: 0.9, stagger: 0.1 }, "-=0.35")
    .from(".portal-description, .portal-summary", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, "-=0.52")
    .from(".portal-deck", { y: 70, rotateX: -6, autoAlpha: 0, duration: 1 }, "-=0.8")
    .from(".portal-card .landing-character", { y: 45, scale: 0.86, autoAlpha: 0, duration: 0.9, stagger: 0.12 }, "-=0.72")
    .from(".portal-ticker", { y: 25, autoAlpha: 0, duration: 0.5 }, "-=0.35");
}

function showLandingPage(addHistory = true) {
  detailPage.hidden = true;
  productLanding.hidden = false;
  document.body.classList.remove("is-detail-open");
  destroyGsapScrollEffects();
  document.title = "Codex · ChatGPT 업데이트 소식";
  landingProductCards.forEach((card) => card.classList.remove("is-opening"));
  if (window.gsap) {
    window.gsap.set(landingProductCards, { clearProps: "opacity,visibility,transform,clipPath" });
  }
  if (addHistory) history.pushState({}, "", `${location.pathname}${location.search}`);
  if (scrollSmoother) scrollSmoother.scrollTop(0);
  else window.scrollTo({ top: 0, behavior: "auto" });
  if (addHistory) {
    requestAnimationFrame(() => document.querySelector('[data-open-product="chatgpt"]')?.focus({ preventScroll: true }));
  }
  requestAnimationFrame(playLandingEntrance);
  window.setTimeout(ensureLandingCardsVisible, 2400);
}

landingProductButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    if (!button.classList.contains("portal-card") || reduceMotion || !window.gsap) {
      showDetailPage(button.dataset.openProduct);
      return;
    }

    if (button.classList.contains("is-opening")) return;
    button.classList.add("is-opening");
    window.gsap.timeline({
      onComplete: () => {
        showDetailPage(button.dataset.openProduct);
        button.classList.remove("is-opening");
        window.gsap.set(button, { clearProps: "opacity,visibility,transform" });
        window.gsap.set(button, { clearProps: "opacity,visibility,transform,clipPath" });
      },
    })
      .to(landingProductCards.filter((card) => card !== button), { autoAlpha: 0, y: 30, duration: 0.32, ease: "power2.in" })
      .to(button, { scale: 1.04, z: 80, duration: 0.38, ease: "power2.inOut" }, "<")
      .to(button, { clipPath: "inset(0 0 100% 0 round 26px)", y: -24, autoAlpha: 0, duration: 0.48, ease: "power3.in" });
  });
});

// 카드가 커서를 향해 기울고 내부 그래픽은 반대 방향으로 움직여 깊이감을 만듭니다.
if (!reduceMotion && window.gsap && window.matchMedia("(hover: hover)").matches) {
  landingProductCards.forEach((card) => {
    if (!card.classList.contains("portal-card")) return;
    const character = card.querySelector(".landing-character");
    const disc = card.querySelector(".visual-disc");
    const xTo = window.gsap.quickTo(card, "rotationY", { duration: 0.65, ease: "power3.out" });
    const yTo = window.gsap.quickTo(card, "rotationX", { duration: 0.65, ease: "power3.out" });
    const charX = window.gsap.quickTo(character, "x", { duration: 0.8, ease: "power3.out" });
    const charY = window.gsap.quickTo(character, "y", { duration: 0.8, ease: "power3.out" });

    card.addEventListener("pointermove", (event) => {
      if (card.classList.contains("is-opening")) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      xTo((x - 0.5) * 12);
      yTo((0.5 - y) * 10);
      charX((x - 0.5) * 22);
      charY((y - 0.5) * 16);
      if (disc) window.gsap.to(disc, { x: (x - 0.5) * -14, y: (y - 0.5) * -10, duration: 0.7, overwrite: "auto" });
    });

    const resetCard = () => {
      if (card.classList.contains("is-opening")) return;
      window.gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.9, ease: "elastic.out(1, 0.55)", overwrite: true });
      window.gsap.to([character, disc].filter(Boolean), { x: 0, y: 0, duration: 0.85, ease: "elastic.out(1, 0.6)", overwrite: true });
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    };
    card.addEventListener("pointerleave", resetCard);
    card.addEventListener("pointercancel", resetCard);
  });

  productLanding?.addEventListener("pointermove", (event) => {
    productLanding.style.setProperty("--cursor-x", `${event.clientX}px`);
    productLanding.style.setProperty("--cursor-y", `${event.clientY}px`);
  });
}

landingBack.addEventListener("click", () => showLandingPage());

window.addEventListener("popstate", () => {
  const product = location.hash.slice(1);
  if (productPageCopy[product]) showDetailPage(product, false);
  else showLandingPage(false);
});

// GSAP ScrollTrigger로 카드, 월 제목, 사이드 캐릭터의 스크롤 타임라인을 관리합니다.
let detailScrollAnimations = [];

function destroyGsapScrollEffects() {
  detailScrollAnimations.forEach((animation) => {
    animation.scrollTrigger?.kill();
    animation.kill?.();
  });
  detailScrollAnimations = [];
  document.body.classList.remove("gsap-scroll-enabled");

  if (window.gsap) {
    window.gsap.set(scrollCompanions, { clearProps: "display,opacity,transform" });
    window.gsap.set(updates, { clearProps: "opacity,transform,clipPath" });
    window.gsap.set([...document.querySelectorAll(".month-heading")], { clearProps: "opacity,transform" });
  }
}

function setupGsapScrollEffects() {
  destroyGsapScrollEffects();
  if (reduceMotion || !window.gsap || !window.ScrollTrigger) return;

  window.gsap.registerPlugin(window.ScrollTrigger);
  document.body.classList.add("gsap-scroll-enabled");
  const visibleCards = updates.filter((card) => !card.hidden);

  // 캐릭터는 지정된 카드 구간에서만 화면 밖에서 등장하고, 잠시 자리 잡은 뒤 다시 빠집니다.
  const companionScenes = [
    { companion: chatgptCompanion, index: Math.min(1, visibleCards.length - 1), side: -1 },
    { companion: codexCompanion, index: Math.min(Math.max(4, Math.floor(visibleCards.length * 0.62)), visibleCards.length - 1), side: 1 },
  ];

  companionScenes.forEach(({ companion, index, side }) => {
    const triggerCard = visibleCards[index];
    if (!companion || !triggerCard) return;
    const endCard = visibleCards[Math.min(index + 2, visibleCards.length - 1)];
    const timeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: triggerCard,
        endTrigger: endCard,
        start: "top 92%",
        end: "bottom 8%",
        scrub: 1.35,
      },
    });

    timeline
      .set(companion, { display: "block" })
      .fromTo(
        companion,
        { autoAlpha: 0, xPercent: side * 112, yPercent: 58, rotation: side * -10 },
        { autoAlpha: 0.96, xPercent: side * 12, yPercent: 0, rotation: side * -2, duration: 0.26, ease: "power3.out" },
      )
      .to(companion, { rotation: side * 5, yPercent: -3, duration: 0.08, ease: "power2.inOut" })
      .to(companion, { rotation: side * -2, yPercent: 0, duration: 0.12, ease: "power2.out" })
      .to(companion, { autoAlpha: 0.96, duration: 0.28 })
      .to(companion, { autoAlpha: 0, xPercent: side * 108, yPercent: 42, rotation: side * -8, duration: 0.26, ease: "power2.in" });

    detailScrollAnimations.push(timeline);
  });

  document.querySelectorAll(".month-heading").forEach((heading, index) => {
    const animation = window.gsap.fromTo(
      heading,
      { autoAlpha: 0, x: index % 2 === 0 ? -32 : 32 },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.58,
        ease: "power2.out",
        scrollTrigger: { trigger: heading, start: "top 91%", once: true },
      },
    );
    detailScrollAnimations.push(animation);
  });

  visibleCards.forEach((card, index) => {
    // 카드가 뷰포트에 들어오면 펼쳐지고, 중앙에서는 살짝 앞으로 나온 뒤 안정적으로 정착합니다.
    const timeline = window.gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 94%",
        end: "bottom 18%",
        scrub: 1.15,
      },
    });

    timeline
      .fromTo(
        card,
        {
          autoAlpha: 0,
          y: 74,
          x: index % 2 === 0 ? -18 : 18,
          scale: 0.965,
          rotateX: 3,
          clipPath: "inset(8% 0 12% 0 round 24px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotateX: 0,
          clipPath: "inset(0% 0 0% 0 round 18px)",
          duration: 0.48,
          ease: "power3.out",
        },
      )
      .to(card, { y: -10, scale: 1.012, duration: 0.22, ease: "sine.inOut" })
      .to(card, { y: 0, scale: 1, duration: 0.3, ease: "sine.out" });

    detailScrollAnimations.push(timeline);
  });

  requestAnimationFrame(() => window.ScrollTrigger.refresh());
}

// 닫힘 애니메이션이 끝난 뒤 hidden을 적용해 퇴장 모션이 보이도록 합니다.
function closeSelect(select, immediate = false) {
  const trigger = select.querySelector(".custom-select-trigger");
  const menu = select.querySelector(".custom-select-menu");
  clearTimeout(select.closeTimer);
  select.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");

  if (immediate || menu.hidden) {
    select.classList.remove("is-closing");
    menu.hidden = true;
    return;
  }

  select.classList.add("is-closing");
  select.closeTimer = setTimeout(() => {
    select.classList.remove("is-closing");
    menu.hidden = true;
  }, 170);
}

function closeSelects(except = null, immediate = false) {
  customSelects.forEach((select) => {
    if (select === except) return;
    closeSelect(select, immediate);
  });
}

function setupCustomSelect(select, options) {
  if (!select) return;
  const type = select.dataset.dateFilter;
  const trigger = select.querySelector(".custom-select-trigger");
  const valueLabel = select.querySelector(".custom-select-value");
  const menu = select.querySelector(".custom-select-menu");

  // 실제 카드 날짜에서 추출한 값을 접근성 역할이 있는 목록 항목으로 구성합니다.
  options.forEach(({ value, label }, index) => {
    const item = document.createElement("li");
    item.className = "custom-select-option";
    item.setAttribute("role", "option");
    item.setAttribute("aria-selected", String(index === 0));
    item.dataset.value = value;
    item.textContent = label;
    item.tabIndex = -1;
    menu.append(item);
  });

  trigger.addEventListener("click", () => {
    const willOpen = !select.classList.contains("is-open");
    closeSelects(select, true);
    if (willOpen) {
      clearTimeout(select.closeTimer);
      select.classList.remove("is-closing");
      menu.hidden = false;
      select.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.querySelector('[aria-selected="true"]')?.focus();
    } else {
      closeSelect(select);
    }
  });

  menu.addEventListener("click", (event) => {
    const option = event.target.closest(".custom-select-option");
    if (!option) return;
    menu.querySelectorAll(".custom-select-option").forEach((item) => item.setAttribute("aria-selected", String(item === option)));
    valueLabel.textContent = option.textContent;
    if (type === "year") activeYear = option.dataset.value;
    if (type === "month") activeMonth = option.dataset.value;
    closeSelect(select);
    trigger.focus();
    applyFilters();
    requestAnimationFrame(() => setupGsapScrollEffects());
  });

  // 기본 select처럼 방향키, Enter, Space, Escape로 조작할 수 있게 합니다.
  menu.addEventListener("keydown", (event) => {
    const options = [...menu.querySelectorAll(".custom-select-option")];
    const index = options.indexOf(document.activeElement);
    if (event.key === "ArrowDown") {
      event.preventDefault();
      options[(index + 1) % options.length].focus();
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      options[(index - 1 + options.length) % options.length].focus();
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      document.activeElement.click();
    } else if (event.key === "Escape") {
      closeSelects();
      trigger.focus();
    }
  });
}

function resetCustomSelect(select) {
  const menu = select.querySelector(".custom-select-menu");
  const options = [...menu.querySelectorAll(".custom-select-option")];
  options.forEach((option, index) => option.setAttribute("aria-selected", String(index === 0)));
  select.querySelector(".custom-select-value").textContent = options[0]?.textContent ?? "전체";
  closeSelect(select, true);
}

setupCustomSelect(document.querySelector('[data-date-filter="year"]'), [
  { value: "all", label: "전체 연도" },
  ...years.map((year) => ({ value: year, label: `${year}년` })),
]);

setupCustomSelect(document.querySelector('[data-date-filter="month"]'), [
  { value: "all", label: "전체 월" },
  ...months.map((month) => ({ value: month, label: `${Number(month)}월` })),
]);

moveProductIndicator(document.querySelector(".filter-button.is-active"), false);

// 모든 조건과 UI 표시를 최초 상태로 한 번에 되돌립니다.
filterReset.addEventListener("click", () => {
  activeYear = "all";
  activeMonth = "all";
  customSelects.forEach(resetCustomSelect);
  showDetailPage("all");
});

// 드롭다운 바깥을 클릭하면 열려 있는 메뉴를 닫습니다.
document.addEventListener("click", (event) => {
  if (!event.target.closest(".custom-select")) closeSelects();
});

function syncThemeToggle() {
  const isLight = document.documentElement.dataset.theme === "light";
  themeToggle.setAttribute("aria-pressed", String(isLight));
  themeToggle.setAttribute("aria-label", isLight ? "어두운 테마로 변경" : "밝은 테마로 변경");
  themeToggleText.textContent = isLight ? "DARK" : "LIGHT";
}

themeToggle.addEventListener("click", () => {
  const nextTheme = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.classList.add("is-theme-changing");
  // 다음 방문에도 사용자가 선택한 테마가 유지되도록 브라우저에 저장합니다.
  localStorage.setItem("updates-theme", nextTheme);
  syncThemeToggle();
  window.setTimeout(() => document.documentElement.classList.remove("is-theme-changing"), 320);
});

syncThemeToggle();

if (dates[0]) {
  // 가장 최근 카드 날짜를 페이지 상태 영역에 자동으로 반영합니다.
  latestUpdate.dateTime = dates[0];
  latestUpdate.textContent = dates[0];
}

function updateScrollUI() {
  backToTop.classList.toggle("is-visible", window.scrollY > 600);
  // 전체 스크롤 가능 거리 대비 현재 위치를 0~1 값으로 변환합니다.
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  scrollProgress.style.transform = `scaleX(${progress})`;
}

window.addEventListener("scroll", updateScrollUI, { passive: true });
window.addEventListener("resize", updateScrollUI);
updateScrollUI();

backToTop.addEventListener("click", () => {
  if (scrollSmoother) scrollSmoother.scrollTo(0, true);
  else window.scrollTo({ top: 0, behavior: "smooth" });
});

// 고정 요소는 wrapper 밖에 두고, 실제 문서 콘텐츠에만 부드러운 네이티브 스크롤 보간을 적용합니다.
if (!reduceMotion && window.gsap && window.ScrollTrigger && window.ScrollSmoother) {
  window.gsap.registerPlugin(window.ScrollTrigger, window.ScrollSmoother);
  scrollSmoother = window.ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.25,
    effects: true,
    smoothTouch: 0.12,
  });
}

// 주소에 제품명이 있으면 해당 상세 페이지를, 없으면 제품 선택 화면을 먼저 보여줍니다.
const initialProduct = location.hash.slice(1);
if (productPageCopy[initialProduct]) showDetailPage(initialProduct, false);
else showLandingPage(false);


// Restore both landing cards after back/forward cache or background-tab animation throttling.
window.addEventListener('pageshow', () => requestAnimationFrame(ensureLandingCardsVisible));
document.addEventListener('visibilitychange', () => { if (!document.hidden) requestAnimationFrame(ensureLandingCardsVisible); });

window.addEventListener('load', () => window.setTimeout(ensureLandingCardsVisible, 2500));
