/* RevAlpha — interactions (vanilla JS). Sections render immediately; no scroll reveals. */
(function () {
  "use strict";
  const doc = document;
  const $ = (s, c) => (c || doc).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || doc).querySelectorAll(s));

  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    let last = window.scrollY, ticking = false;
    function update() {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      if (y > last && y > 320) header.classList.add("is-hidden"); else header.classList.remove("is-hidden");
      last = y; ticking = false;
    }
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  function initMobileMenu() {
    const toggle = $(".nav-toggle"), menu = $(".mobile-menu");
    if (!toggle || !menu) return;
    const set = (open) => {
      menu.classList.toggle("is-open", open);
      toggle.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      doc.body.classList.toggle("is-locked", open);
    };
    toggle.addEventListener("click", () => set(!menu.classList.contains("is-open")));
    $$("a", menu).forEach((a) => a.addEventListener("click", () => set(false)));
    doc.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
  }

  function initCounters() {
    $$("[data-count]").forEach((el) => {
      el.textContent = (el.getAttribute("data-prefix") || "") + el.getAttribute("data-count") + (el.getAttribute("data-suffix") || "");
    });
  }

  function initAccordions() {
    $$(".accordion").forEach((acc) => {
      const single = acc.hasAttribute("data-single");
      $$(".accordion__trigger", acc).forEach((trigger) => {
        trigger.addEventListener("click", () => {
          const item = trigger.closest(".accordion__item");
          const panel = $(".accordion__panel", item);
          const isOpen = item.classList.contains("is-open");
          if (single) {
            $$(".accordion__item", acc).forEach((it) => {
              it.classList.remove("is-open");
              const p = $(".accordion__panel", it); if (p) p.style.height = "0px";
              const t = $(".accordion__trigger", it); if (t) t.setAttribute("aria-expanded", "false");
            });
          }
          if (isOpen) { item.classList.remove("is-open"); panel.style.height = "0px"; trigger.setAttribute("aria-expanded", "false"); }
          else { item.classList.add("is-open"); panel.style.height = panel.scrollHeight + "px"; trigger.setAttribute("aria-expanded", "true"); }
        });
      });
    });
    window.addEventListener("resize", () => {
      $$(".accordion__item.is-open .accordion__panel").forEach((p) => { p.style.height = p.scrollHeight + "px"; });
    });
  }

  /* ---- Charts: inline SVG, drawn immediately ---- */
  const NS = "http://www.w3.org/2000/svg";
  function el(name, attrs) { const n = doc.createElementNS(NS, name); for (const k in attrs) n.setAttribute(k, attrs[k]); return n; }
  function smoothPath(values, w, h, pad) {
    const n = values.length, max = Math.max.apply(null, values) * 1.12, min = Math.min.apply(null, values) * 0.85;
    const range = max - min || 1, stepX = (w - pad * 2) / (n - 1);
    const pts = values.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - pad * 2)]);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i], p1 = pts[i + 1], cx = (p0[0] + p1[0]) / 2; d += ` C ${cx} ${p0[1]}, ${cx} ${p1[1]}, ${p1[0]} ${p1[1]}`; }
    return { d, pts };
  }
  function buildLineChart(values, o) {
    const w = o.w || 320, h = o.h || 120, pad = 10;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", role: "img", "aria-label": o.label || "Illustrative trend" });
    const gid = "grad" + Math.random().toString(36).slice(2, 8);
    const defs = el("defs", {}), lg = el("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" });
    lg.appendChild(el("stop", { offset: "0", "stop-color": "#D9B85C", "stop-opacity": "0.35" }));
    lg.appendChild(el("stop", { offset: "1", "stop-color": "#D9B85C", "stop-opacity": "0" }));
    defs.appendChild(lg); svg.appendChild(defs);
    for (let i = 1; i <= 3; i++) svg.appendChild(el("line", { x1: pad, y1: (h / 4) * i, x2: w - pad, y2: (h / 4) * i, class: "chart-grid" }));
    const res = smoothPath(values, w, h, pad);
    svg.appendChild(el("path", { d: `${res.d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`, fill: `url(#${gid})` }));
    svg.appendChild(el("path", { d: res.d, class: "chart-line chart-line--" + (o.color || "gold") }));
    const last = res.pts[res.pts.length - 1];
    svg.appendChild(el("circle", { cx: last[0], cy: last[1], r: 7, class: "chart-dot--ring" }));
    svg.appendChild(el("circle", { cx: last[0], cy: last[1], r: 3.5, class: "chart-dot" }));
    return svg;
  }
  function buildBarChart(values, o) {
    const w = o.w || 320, h = o.h || 120, pad = 12, gap = 8, n = values.length;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", role: "img", "aria-label": o.label || "Illustrative pace" });
    const bw = (w - pad * 2 - gap * (n - 1)) / n, max = Math.max.apply(null, values) * 1.1;
    values.forEach((v, i) => {
      const bh = (v / max) * (h - pad * 2);
      svg.appendChild(el("rect", { x: pad + i * (bw + gap), y: h - pad - bh, width: bw, height: bh, rx: 3, fill: i === n - 1 ? "#B08A2E" : "rgba(176,138,46,0.35)" }));
    });
    return svg;
  }
  function buildDonut(segments, o) {
    const size = o.size || 140, stroke = 16, r = (size - stroke) / 2, c = 2 * Math.PI * r;
    const svg = el("svg", { viewBox: `0 0 ${size} ${size}`, role: "img", "aria-label": o.label || "Illustrative channel mix" });
    const total = segments.reduce((s, x) => s + x.value, 0);
    let offset = 0;
    segments.forEach((seg) => {
      const frac = seg.value / total;
      svg.appendChild(el("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: seg.color, "stroke-width": stroke, "stroke-dasharray": `${c * frac} ${c}`, "stroke-dashoffset": -offset, transform: `rotate(-90 ${size / 2} ${size / 2})` }));
      offset += c * frac;
    });
    return svg;
  }
  function initCharts() {
    const data = window.RevAlphaData ? window.RevAlphaData.charts : null;
    if (!data) return;
    $$("[data-chart]").forEach((node) => {
      const type = node.getAttribute("data-chart");
      const w = parseInt(node.getAttribute("data-w") || "320", 10), h = parseInt(node.getAttribute("data-h") || "120", 10);
      const map = {
        adr: () => buildLineChart(data.adr, { color: "gold", w, h, label: "Illustrative ADR trend" }),
        occupancy: () => buildLineChart(data.occupancy, { color: "mint", w, h, label: "Illustrative occupancy curve" }),
        revpar: () => buildLineChart(data.revpar, { color: "gold", w, h, label: "Illustrative RevPAR comparison" }),
        competitor: () => buildLineChart(data.competitor, { color: "dim", w, h, label: "Illustrative competitor rate grid" }),
        pickup: () => buildBarChart(data.pickup, { w, h, label: "Illustrative pickup pace" }),
        weekly: () => buildBarChart(data.weekly, { w, h, label: "Illustrative weekly performance" }),
        channel: () => buildDonut(data.channel, { size: h, label: "Illustrative OTA channel mix" }),
        hero: () => buildLineChart(data.heroAdr, { color: "gold", w, h, label: "Illustrative ADR trend" })
      };
      if (!map[type]) return;
      node.innerHTML = ""; node.appendChild(map[type]());
    });
  }

  function initProblemPanels() {
    const panels = $$(".problem-panel");
    if (!panels.length) return;
    panels.forEach((panel) => {
      const activate = () => { panels.forEach((p) => p.classList.remove("is-open")); panel.classList.add("is-open"); };
      panel.addEventListener("click", activate);
      panel.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
    });
    panels[0].classList.add("is-open");
  }

  function initCards() {
    $$(".card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
    });
  }

  function initMarquee() {
    $$(".marquee__track").forEach((track) => {
      const group = $(".marquee__group", track);
      if (group && track.children.length < 2) { const clone = group.cloneNode(true); clone.setAttribute("aria-hidden", "true"); track.appendChild(clone); }
    });
  }

  /* ---- Forms → WhatsApp ---- */
  const WA_NUMBER = "919653128482";
  const MAIL_TO = "nilesh@hospitalityminds.com";
  const FORM_LABELS = { name: "Name", property: "Property", services: "Services", phone: "Phone", email: "Email", city: "City", rooms: "Rooms", ptype: "Property type", pms: "Uses a PMS", cm: "Uses a channel manager", be: "Has a booking engine", rm: "Uses revenue management", message: "Message" };
  function formLines(form) {
    const lines = [];
    new FormData(form).forEach((value, key) => { const v = String(value).trim(); if (v) lines.push((FORM_LABELS[key] || key) + ": " + v); });
    return lines;
  }
  function buildWhatsAppUrl(form) {
    const lines = [form.getAttribute("data-wa-title") || "New enquiry from the RevAlpha website", ""];
    formLines(form).forEach((l) => lines.push(l));
    lines.push("", "Sent from " + location.host + location.pathname);
    return "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
  }
  function buildMailtoUrl(form) {
    const title = form.getAttribute("data-wa-title") || "New enquiry from the RevAlpha website";
    const body = formLines(form).join("\n") + "\n\nSent from " + location.host + location.pathname;
    return "mailto:" + MAIL_TO + "?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body);
  }
  function initForms() {
    $$("form[data-form]").forEach((form) => {
      $$("input, select, textarea", form).forEach((f) => {
        const sync = () => f.classList.toggle("has-value", !!(f.value && f.value.trim() !== ""));
        ["input", "change", "blur"].forEach((ev) => f.addEventListener(ev, sync)); sync();
        f.addEventListener("input", () => { const field = f.closest(".field"); if (field) field.classList.remove("has-error"); });
      });
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;
        $$("[required]", form).forEach((f) => {
          const field = f.closest(".field");
          let bad = !f.value || !f.value.trim();
          if (!bad && f.type === "email") bad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value);
          if (!bad && f.type === "tel") bad = !/^[+\d][\d\s()-]{6,}$/.test(f.value);
          if (field) field.classList.toggle("has-error", bad);
          if (bad) valid = false;
        });
        if (!valid) {
          const firstErr = $(".field.has-error", form);
          if (firstErr) { firstErr.scrollIntoView({ behavior: "smooth", block: "center" }); const inp = $("input,select,textarea", firstErr); if (inp) inp.focus(); }
          return;
        }
        const waUrl = buildWhatsAppUrl(form);
        const mailUrl = buildMailtoUrl(form);
        const success = form.parentElement.querySelector(".form-success");
        const fallback = success ? success.querySelector("[data-wa-link]") : null;
        if (fallback) fallback.setAttribute("href", waUrl);
        const mailFallback = success ? success.querySelector("[data-mail-link]") : null;
        if (mailFallback) mailFallback.setAttribute("href", mailUrl);
        // Primary delivery: email the enquiry to nilesh@hospitalityminds.com
        window.location.href = mailUrl;
        form.style.display = "none";
        if (success) { success.classList.add("is-on"); success.setAttribute("tabindex", "-1"); success.focus(); success.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });
    });
  }

  /* ---- Swiper sliders ---- */
  const SLIDER_CONFIGS = {
    videos: { slidesPerView: 1.05, spaceBetween: 16, breakpoints: { 760: { slidesPerView: 2.05, spaceBetween: 18 }, 1025: { slidesPerView: 2.5, spaceBetween: 22 }, 1280: { slidesPerView: 3, spaceBetween: 24 } } },
    htypes: { slidesPerView: 1.08, spaceBetween: 16, breakpoints: { 640: { slidesPerView: 2.05, spaceBetween: 18 }, 1025: { slidesPerView: 3.1, spaceBetween: 22 }, 1280: { slidesPerView: 3.6, spaceBetween: 24 } } },
    plans: { slidesPerView: 1.05, spaceBetween: 16, breakpoints: { 640: { slidesPerView: 2.05, spaceBetween: 18 }, 1025: { slidesPerView: 3.05, spaceBetween: 22 }, 1280: { slidesPerView: 3.4, spaceBetween: 24 } } },
    cards: { slidesPerView: 1.05, spaceBetween: 16, breakpoints: { 640: { slidesPerView: 2.05, spaceBetween: 18 }, 1025: { slidesPerView: 2.5, spaceBetween: 22 }, 1280: { slidesPerView: 3, spaceBetween: 24 } } },
    sol: { slidesPerView: 1.02, spaceBetween: 16, breakpoints: { 760: { slidesPerView: 1.3, spaceBetween: 20 }, 1025: { slidesPerView: 1.6, spaceBetween: 24 }, 1280: { slidesPerView: 2, spaceBetween: 26 } } },
    quotes: { slidesPerView: 1.05, spaceBetween: 16, breakpoints: { 640: { slidesPerView: 2.05, spaceBetween: 18 }, 1025: { slidesPerView: 2.6, spaceBetween: 22 }, 1280: { slidesPerView: 3.2, spaceBetween: 24 } } }
  };
  const AUTOPLAY_DELAY = { quotes: 6000, videos: 7000 };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function initSwipers() {
    if (typeof window.Swiper === "undefined") return;
    $$(".swiper[data-swiper]").forEach((node) => {
      const type = node.getAttribute("data-swiper");
      const id = node.getAttribute("data-slider-id") || type;
      const scope = node.closest("section") || node.parentElement || doc;
      const cfg = SLIDER_CONFIGS[type] || SLIDER_CONFIGS.cards;
      const autoplay = reduceMotion ? false : { delay: AUTOPLAY_DELAY[type] || 5500, pauseOnMouseEnter: true, disableOnInteraction: false, stopOnLastSlide: false };
      const swiper = new window.Swiper(node, Object.assign({
        grabCursor: true, watchOverflow: true, a11y: { enabled: true }, speed: 700, autoplay,
        keyboard: { enabled: true, onlyInViewport: true },
        pagination: { el: node.querySelector(".swiper-pagination"), clickable: true },
        navigation: { nextEl: scope.querySelector(`[data-slider-next="${id}"]`), prevEl: scope.querySelector(`[data-slider-prev="${id}"]`) }
      }, cfg));
      if (!autoplay) return;
      // Gentle: pause while touched or focused, resume afterwards; skip autoplay entirely when nothing overflows.
      if (swiper.isLocked) swiper.autoplay.stop();
      node.addEventListener("touchstart", () => swiper.autoplay.stop(), { passive: true });
      node.addEventListener("touchend", () => { if (!swiper.isLocked) swiper.autoplay.start(); }, { passive: true });
      node.addEventListener("focusin", () => swiper.autoplay.stop());
      node.addEventListener("focusout", () => { if (!swiper.isLocked) swiper.autoplay.start(); });
    });
  }

  /* ---- Video lightbox ---- */
  function initVideoLightbox() {
    const box = $("#vlightbox");
    if (!box) return;
    const frame = box.querySelector("[data-vframe]"), cap = box.querySelector("[data-vcap]"), closeBtn = box.querySelector(".vlightbox__close");
    let lastFocus = null;
    function open(vid, title) {
      if (!vid) return;
      lastFocus = doc.activeElement;
      const iframe = doc.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + vid + "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      iframe.title = title || "YouTube video";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      frame.innerHTML = ""; frame.appendChild(iframe);
      if (cap) cap.textContent = title || "";
      box.hidden = false; doc.body.classList.add("is-locked");
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      if (box.hidden) return;
      box.hidden = true; frame.innerHTML = ""; doc.body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    $$("[data-video]").forEach((btn) => btn.addEventListener("click", () => open(btn.getAttribute("data-video"), btn.getAttribute("data-vtitle"))));
    box.addEventListener("click", (e) => { if (e.target.closest("[data-vclose]")) close(); });
    doc.addEventListener("keydown", (e) => { if (!box.hidden && e.key === "Escape") close(); });
  }

  function initYear() { $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); }); }

  function initActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    $$(".main-nav a, .mobile-menu nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
  }

  function initCursor() {
    if (!window.matchMedia) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const dot = doc.createElement("div"), ring = doc.createElement("div");
    dot.className = "cursor-dot"; ring.className = "cursor-ring";
    dot.setAttribute("aria-hidden", "true"); ring.setAttribute("aria-hidden", "true");
    doc.body.appendChild(dot); doc.body.appendChild(ring);
    const HOVER = "a, button, .btn, [role='button'], summary, label, input, textarea, select, [data-video]";
    let mx = -100, my = -100, rx = -100, ry = -100, raf = null, live = false;
    function tick() {
      rx += (mx - rx) * 0.22; ry += (my - ry) * 0.22;
      if (Math.abs(mx - rx) > 0.15 || Math.abs(my - ry) > 0.15) {
        ring.style.transform = "translate(" + rx + "px," + ry + "px)";
        raf = requestAnimationFrame(tick);
      } else {
        ring.style.transform = "translate(" + mx + "px," + my + "px)"; raf = null;
      }
    }
    window.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px)";
      if (!live) { live = true; rx = mx; ry = my; doc.body.classList.add("cursor-on"); }
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    doc.addEventListener("mouseover", function (e) {
      const t = e.target;
      doc.body.classList.toggle("cursor-hover", !!(t && t.closest && t.closest(HOVER)));
    }, { passive: true });
    doc.addEventListener("mousedown", function () { doc.body.classList.add("cursor-down"); });
    doc.addEventListener("mouseup", function () { doc.body.classList.remove("cursor-down"); });
    doc.addEventListener("mouseleave", function () { doc.body.classList.remove("cursor-on", "cursor-hover", "cursor-down"); });
    doc.addEventListener("mouseenter", function () { if (live) doc.body.classList.add("cursor-on"); });
  }

  function boot() {
    initHeader(); initMobileMenu(); initActiveNav(); initCounters(); initAccordions(); initProblemPanels();
    initCharts(); initCards(); initMarquee(); initForms(); initSwipers(); initVideoLightbox(); initYear(); initCursor();
  }
  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot); else boot();
})();
