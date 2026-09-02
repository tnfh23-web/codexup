const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const progressBar = document.querySelector(".story-progress span");

function updateProgress() {
  const distance = document.documentElement.scrollHeight - innerHeight;
  const progress = distance > 0 ? scrollY / distance : 0;
  progressBar.style.transform = `scaleX(${Math.min(progress, 1)})`;
}

addEventListener("scroll", updateProgress, { passive: true });
addEventListener("resize", updateProgress);
updateProgress();

if (!reducedMotion && window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger, window.ScrollSmoother);

  // GSAP의 가상 스크롤과 모든 ScrollTrigger를 같은 좌표계에서 움직입니다.
  const smoother = window.ScrollSmoother?.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.15,
    effects: true,
    smoothTouch: 0.08,
  });

  // 커서 주변에 은은한 빛을 붙이고 빠른 보간으로 뒤따르게 합니다.
  if (window.matchMedia("(hover: hover)").matches) {
    const cursor = document.createElement("span");
    cursor.className = "story-cursor";
    cursor.setAttribute("aria-hidden", "true");
    document.body.append(cursor);
    const cursorX = gsap.quickTo(cursor, "x", { duration: 0.55, ease: "power3.out" });
    const cursorY = gsap.quickTo(cursor, "y", { duration: 0.55, ease: "power3.out" });
    addEventListener("pointermove", (event) => {
      cursorX(event.clientX);
      cursorY(event.clientY);
      gsap.to(cursor, { autoAlpha: 1, duration: 0.25, overwrite: "auto" });
    });
    document.documentElement.addEventListener("mouseleave", () => gsap.to(cursor, { autoAlpha: 0, duration: 0.3 }));

    // 첫 화면의 원형 신호가 마우스와 반대 방향으로 움직여 깊이를 만듭니다.
    const orbitX = gsap.quickTo(".hero-orbit", "x", { duration: 1.1, ease: "power3.out" });
    const orbitY = gsap.quickTo(".hero-orbit", "y", { duration: 1.1, ease: "power3.out" });
    document.querySelector(".story-hero")?.addEventListener("pointermove", (event) => {
      orbitX((event.clientX / innerWidth - 0.5) * -38);
      orbitY((event.clientY / innerHeight - 0.5) * -26);
    });

  }

  // 첫 장면은 제목, 지표, 궤도 순으로 열어 프로젝트의 출발점을 보여줍니다.
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".story-nav > *", { y: -18, autoAlpha: 0, duration: 0.7, stagger: 0.08 })
    .from(".hero-copy .section-label", { x: -24, autoAlpha: 0, duration: 0.55 }, "-=0.3")
    .from(".hero-copy h1 > *", { yPercent: 115, rotate: 3, duration: 0.9, stagger: 0.1 }, "-=0.2")
    .from(".hero-copy > p:last-child", { y: 22, autoAlpha: 0, duration: 0.65 }, "-=0.45")
    .from(".hero-foot > *", { y: 18, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, "-=0.35")
    .from(".hero-orbit", { scale: 0.65, rotate: -35, autoAlpha: 0, duration: 1.1 }, "-=1");

  gsap.to(".hero-orbit", { rotate: 18, yPercent: -7, ease: "none", scrollTrigger: { trigger: ".story-hero", start: "top top", end: "bottom top", scrub: 1.2 } });
  gsap.to(".hero-orbit i:nth-child(1)", { rotate: 360, duration: 24, repeat: -1, ease: "none" });
  gsap.to(".hero-orbit i:nth-child(2)", { rotate: -360, duration: 18, repeat: -1, ease: "none" });

  document.querySelectorAll(".section-head").forEach((head) => {
    gsap.from(head.children, { y: 46, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: head, start: "top 78%" } });
  });

  gsap.from(".problem-list article", { x: 55, autoAlpha: 0, duration: 0.8, stagger: 0.12, ease: "power3.out", scrollTrigger: { trigger: ".problem-list", start: "top 76%" } });
  gsap.from(".origin-content .lead", { y: 40, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: ".origin-content", start: "top 78%" } });

  const shiftTimeline = gsap.timeline({ scrollTrigger: {
    trigger: ".story-shift",
    start: "top top",
    end: "+=135%",
    scrub: 1.25,
    pin: true,
    anticipatePin: 1,
    refreshPriority: 2,
    onEnter: () => document.querySelector(".story-shift")?.classList.add("is-active"),
    onEnterBack: () => document.querySelector(".story-shift")?.classList.add("is-active"),
    onLeaveBack: () => document.querySelector(".story-shift")?.classList.remove("is-active"),
  } });
  shiftTimeline
    .fromTo(".shift-before", { xPercent: -42 }, { xPercent: 125, duration: 1, ease: "sine.inOut" })
    .fromTo(".shift-after", { xPercent: 42 }, { xPercent: -110, duration: 1, ease: "sine.inOut" }, 0)
    .fromTo(".shift-signal-motion", { scale: .72, rotate: -35 }, { scale: 1.05, rotate: 220, autoAlpha: 1, duration: 1, ease: "sine.inOut" }, 0)
    .to(".shift-signal-motion", { autoAlpha: 1, duration: .01 }, 0);

  // 모든 pin을 먼저 생성해야 뒤 섹션의 ScrollTrigger 좌표가 pin 여백을 포함해 계산됩니다.
  const pinMedia = gsap.matchMedia();
  pinMedia.add("(min-width: 0px)", () => {
    gsap.set(".character-codex", { autoAlpha: 0, yPercent: 18, rotationX: -7 });
    const characterTimeline = gsap.timeline({
      scrollTrigger: { trigger: ".story-characters", start: "top top", end: "+=145%", scrub: 1, pin: true, anticipatePin: 1, refreshPriority: 1 },
    });
    characterTimeline
      .to(".character-chatgpt", { autoAlpha: 1, duration: .35 })
      .to(".character-chatgpt", { autoAlpha: 0, yPercent: -16, rotationX: 6, duration: .75 })
      .to(".character-codex", { autoAlpha: 1, yPercent: 0, rotationX: 0, duration: .75 }, "<.08")
      .to(".character-codex .character-ring", { rotate: 55, duration: .7 }, "<")
      .to(".character-codex", { autoAlpha: 1, duration: .4 });
  });

  // 두 pin의 실제 높이가 정해진 다음 아래쪽 트리거를 등록합니다.
  ScrollTrigger.refresh();

  document.querySelectorAll(".process-list li").forEach((item, index) => {
    gsap.from(item, { x: index % 2 ? 55 : 25, autoAlpha: 0, duration: 0.8, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 82%" } });
    gsap.from(item.querySelector(".process-icon"), { scale: 0.4, rotate: -90, duration: 0.8, ease: "back.out(1.7)", scrollTrigger: { trigger: item, start: "top 82%" } });
  });
  ScrollTrigger.create({
    trigger: ".process-list",
    start: "top 65%",
    end: "bottom 42%",
    scrub: true,
    onUpdate: (self) => {
      const list = document.querySelector(".process-list");
      const steps = [...document.querySelectorAll(".process-list li")];
      list?.style.setProperty("--process-progress", self.progress.toFixed(3));
      const activeIndex = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
      steps.forEach((step, index) => step.classList.toggle("is-active", index === activeIndex));
    },
  });

  gsap.from(".system-board", { y: 70, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: ".system-board", start: "top 82%" } });
  gsap.from(".source-node", { scale: 0.6, autoAlpha: 0, duration: 0.75, stagger: 0.13, ease: "back.out(1.45)", scrollTrigger: { trigger: ".system-board", start: "top 70%" } });
  document.querySelectorAll(".system-base-lines path").forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
    gsap.to(path, { strokeDashoffset: 0, duration: 1.45, ease: "power2.inOut", scrollTrigger: { trigger: ".system-board", start: "top 72%" } });
  });
  const signalTween = gsap.to(".system-signal-lines path", { strokeDashoffset: -222, duration: 2.2, ease: "none", repeat: -1, paused: true });
  ScrollTrigger.create({
    trigger: ".system-board",
    start: "top 68%",
    end: "bottom 25%",
    onEnter: () => { document.querySelector(".system-board")?.classList.add("is-signaling"); gsap.to(".system-signal-lines", { autoAlpha: 1, duration: .35 }); signalTween.restart(); },
    onEnterBack: () => { document.querySelector(".system-board")?.classList.add("is-signaling"); gsap.to(".system-signal-lines", { autoAlpha: 1, duration: .35 }); signalTween.play(); },
    onLeave: () => { document.querySelector(".system-board")?.classList.remove("is-signaling"); gsap.to(".system-signal-lines", { autoAlpha: 0, duration: .3 }); signalTween.pause(); },
    onLeaveBack: () => { document.querySelector(".system-board")?.classList.remove("is-signaling"); gsap.to(".system-signal-lines", { autoAlpha: 0, duration: .3 }); signalTween.pause(); },
  });

  const outputTimeline = gsap.timeline({ scrollTrigger: { trigger: ".output-cards", start: "top 88%", end: "center 58%", scrub: 1 } });
  outputTimeline
    .fromTo(".output-card.markdown", { x: -110, autoAlpha: 0, clipPath: "inset(0 14% 0 0 round 25px)" }, { x: 0, autoAlpha: 1, clipPath: "inset(0 0% 0 0 round 25px)", duration: 1 })
    .fromTo(".output-card.interface", { x: 110, autoAlpha: 0, clipPath: "inset(0 0 0 14% round 25px)" }, { x: 0, autoAlpha: 1, clipPath: "inset(0 0 0 0% round 25px)", duration: 1 }, 0)
    .from(".output-card pre", { y: 35, autoAlpha: 0, duration: .55 }, .35)
    .from(".mini-ui > *", { y: 24, autoAlpha: 0, stagger: .07, duration: .45 }, .42);
  document.querySelectorAll(".output-card").forEach((card) => {
    ScrollTrigger.create({ trigger: card, start: "top 62%", end: "bottom 34%", toggleClass: { targets: card, className: "is-scroll-focus" } });
  });
  gsap.from(".story-principles > header > *", { y: 42, autoAlpha: 0, duration: 0.85, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: ".story-principles", start: "top 76%" } });
  gsap.from(".principle-list article", { x: 70, autoAlpha: 0, duration: 0.85, stagger: 0.13, ease: "power3.out", scrollTrigger: { trigger: ".principle-list", start: "top 78%" } });
  gsap.to(".result-orbit", { rotate: 70, scale: 1.12, ease: "none", scrollTrigger: { trigger: ".story-result", start: "top bottom", end: "bottom top", scrub: 1.2 } });
  gsap.from(".story-result > :not(.result-orbit)", { y: 42, autoAlpha: 0, duration: 0.9, stagger: 0.1, scrollTrigger: { trigger: ".story-result", start: "top 68%" } });

  // 폰트와 이미지가 늦게 반영되는 경우에도 최종 위치를 한 번 더 동기화합니다.
  addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}
