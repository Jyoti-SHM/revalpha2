/* =====================================================================
   RevAlpha — Main interaction & motion system
   Vanilla JS. GSAP / ScrollTrigger / Lenis / SplitType / Swiper are
   optional progressive enhancements loaded via CDN.
   ===================================================================== */
(function () {
  "use strict";

  const doc = document;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  const DESKTOP = window.matchMedia("(min-width: 1025px)").matches && !isTouch;

  const $ = (s, c) => (c || doc).querySelector(s);
  const $$ = (s, c) => Array.prototype.slice.call((c || doc).querySelectorAll(s));

  /* ================================================================
     LOADER
     ================================================================ */
  function initLoader() {
    const loader = $("#loader");
    const curtain = $(".loader-curtain");
    if (!loader) return;
    if (prefersReduced) { loader.classList.add("is-done"); if (curtain) curtain.classList.add("is-up"); return; }

    const finish = () => {
      loader.classList.add("is-done");
      if (curtain) {
        requestAnimationFrame(() => curtain.classList.add("is-up"));
      }
      setTimeout(() => { loader.style.display = "none"; if (curtain) curtain.style.display = "none"; }, 900);
      doc.body.classList.remove("is-locked");
    };
    doc.body.classList.add("is-locked");
    window.addEventListener("load", () => setTimeout(finish, 700));
    // Safety fallback
    setTimeout(finish, 2600);
  }

  /* ================================================================
     CUSTOM CURSOR (desktop only)
     ================================================================ */
  function initCursor() {
    if (!DESKTOP || prefersReduced) return;
    const dot = $(".cursor");
    const ring = $(".cursor-ring");
    const label = $(".cursor-label");
    if (!dot || !ring) return;
    doc.body.classList.add("has-cursor");

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.opacity = 1; ring.style.opacity = 1;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
      if (label) label.style.left = mx + "px", label.style.top = (my - 34) + "px";
    });
    window.addEventListener("mouseout", () => { dot.style.opacity = 0; ring.style.opacity = 0; });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    })();

    const hoverSel = "a, button, .card, .htype, .problem-panel, input, select, textarea, .swiper-slide, [data-cursor]";
    doc.addEventListener("mouseover", (e) => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      ring.classList.add("is-hover");
      const text = t.getAttribute("data-cursor");
      if (text && label) { label.textContent = text; label.classList.add("is-on"); }
    });
    doc.addEventListener("mouseout", (e) => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      ring.classList.remove("is-hover");
      if (label) label.classList.remove("is-on");
    });
  }

  /* ================================================================
     HEADER — glass on scroll, hide/show
     ================================================================ */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;
    let last = window.scrollY;
    let ticking = false;

    function update() {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 40);
      if (y > last && y > 300) header.classList.add("is-hidden");
      else header.classList.remove("is-hidden");
      last = y;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ================================================================
     MOBILE MENU
     ================================================================ */
  function initMobileMenu() {
    const toggle = $(".nav-toggle");
    const menu = $(".mobile-menu");
    if (!toggle || !menu) return;

    function open() {
      menu.classList.add("is-open");
      toggle.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      doc.body.classList.add("is-locked");
      $$("nav a", menu).forEach((a, i) => { a.style.transitionDelay = (0.12 + i * 0.05) + "s"; });
    }
    function close() {
      menu.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      doc.body.classList.remove("is-locked");
      $$("nav a", menu).forEach((a) => { a.style.transitionDelay = "0s"; });
    }
    toggle.addEventListener("click", () => menu.classList.contains("is-open") ? close() : open());
    $$("a", menu).forEach((a) => a.addEventListener("click", close));
    doc.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ================================================================
     SCROLL PROGRESS
     ================================================================ */
  function initScrollProgress() {
    const bar = $("#scroll-progress");
    if (!bar) return;
    let ticking = false;
    function update() {
      const h = doc.documentElement.scrollHeight - window.innerHeight;
      const p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = `scaleX(${Math.min(p, 1)})`;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ================================================================
     LENIS SMOOTH SCROLL
     ================================================================ */
  let lenis = null;
  function initLenis() {
    if (prefersReduced || !DESKTOP || typeof window.Lenis === "undefined") return;
    lenis = new window.Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 1 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on("scroll", window.ScrollTrigger.update);
    }
    // Anchor links
    $$('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = doc.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: -80 });
      });
    });
  }

  /* ================================================================
     REVEALS
     ================================================================ */
  function initReveals() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    if (prefersReduced) { items.forEach((el) => el.classList.add("is-visible")); return; }

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseFloat(el.getAttribute("data-reveal-delay") || 0);
          setTimeout(() => el.classList.add("is-visible"), delay * 1000);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.14, rootMargin: "0px 0px -8% 0px" });
    items.forEach((el) => io.observe(el));
  }

  /* ================================================================
     SPLIT TEXT (masked line reveals)
     ================================================================ */
  function initSplitText() {
    const targets = $$("[data-split]");
    if (!targets.length) return;
    if (prefersReduced) return;

    targets.forEach((el) => {
      let lines = [];
      if (typeof window.SplitType !== "undefined") {
        const st = new window.SplitType(el, { types: "lines", lineClass: "line-mask" });
        lines = st.lines;
        st.revert();
      }
      // Fallback: wrap existing .line spans
      if (!lines.length) lines = $$(".line", el);
      if (!lines.length) return;

      lines.forEach((line) => {
        const inner = doc.createElement("span");
        while (line.firstChild) inner.appendChild(line.firstChild);
        line.appendChild(inner);
        line.style.overflow = "hidden";
        line.style.display = "block";
        inner.style.display = "block";
        inner.style.transform = "translateY(110%)";
        inner.style.transition = "transform 0.9s cubic-bezier(0.22,1,0.36,1)";
      });

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            $$(".line-mask > span, span", el).forEach((s, i) => {
              setTimeout(() => { s.style.transform = "translateY(0)"; }, i * 90);
            });
            io.unobserve(el);
          }
        });
      }, { threshold: 0.3 });
      io.observe(el);
    });
  }

  /* ================================================================
     COUNTERS
     ================================================================ */
  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.getAttribute("data-count"));
        const prefix = el.getAttribute("data-prefix") || "";
        const suffix = el.getAttribute("data-suffix") || "";
        const dur = prefersReduced ? 0 : 1600;
        const start = performance.now();
        function tick(now) {
          const p = dur === 0 ? 1 : Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.round(target * eased);
          el.textContent = prefix + val + suffix;
          if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach((el) => io.observe(el));
  }

  /* ================================================================
     ACCORDIONS
     ================================================================ */
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
              const p = $(".accordion__panel", it);
              if (p) p.style.height = "0px";
              const t = $(".accordion__trigger", it);
              if (t) t.setAttribute("aria-expanded", "false");
            });
          }
          if (isOpen) {
            item.classList.remove("is-open");
            panel.style.height = "0px";
            trigger.setAttribute("aria-expanded", "false");
          } else {
            item.classList.add("is-open");
            panel.style.height = panel.scrollHeight + "px";
            trigger.setAttribute("aria-expanded", "true");
          }
        });
      });
    });
    window.addEventListener("resize", () => {
      $$(".accordion__item.is-open .accordion__panel").forEach((p) => { p.style.height = p.scrollHeight + "px"; });
    });
  }

  /* ================================================================
     PROBLEM PANELS (homepage)
     ================================================================ */
  function initProblemPanels() {
    const panels = $$(".problem-panel");
    if (!panels.length) return;
    panels.forEach((panel) => {
      const toggle = panel;
      function activate() {
        panels.forEach((p) => p.classList.remove("is-open"));
        panel.classList.add("is-open");
        drawChartsIn(panel);
      }
      panel.addEventListener("click", activate);
      panel.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(); } });
    });
    // Open the first by default once visible
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { panels[0].classList.add("is-open"); drawChartsIn(panels[0]); io.disconnect(); } });
    }, { threshold: 0.3 });
    io.observe(panels[0]);
  }

  /* ================================================================
     CHART ENGINE (inline SVG, animated on viewport)
     ================================================================ */
  const NS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    const n = doc.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function smoothPath(values, w, h, pad) {
    const n = values.length;
    const max = Math.max.apply(null, values) * 1.12;
    const min = Math.min.apply(null, values) * 0.85;
    const range = max - min || 1;
    const stepX = (w - pad * 2) / (n - 1);
    const pts = values.map((v, i) => [pad + i * stepX, h - pad - ((v - min) / range) * (h - pad * 2)]);
    let d = `M ${pts[0][0]} ${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i], p1 = pts[i + 1];
      const cx = (p0[0] + p1[0]) / 2;
      d += ` C ${cx} ${p0[1]}, ${cx} ${p1[1]}, ${p1[0]} ${p1[1]}`;
    }
    return { d, pts };
  }

  function buildLineChart(values, opts) {
    opts = opts || {};
    const w = opts.w || 320, h = opts.h || 120, pad = opts.pad || 10;
    const color = opts.color || "gold";
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", role: "img", "aria-label": opts.label || "Illustrative revenue trend" });
    const defs = el("defs", {});
    const gid = "grad" + Math.random().toString(36).slice(2, 8);
    const lg = el("linearGradient", { id: gid, x1: "0", y1: "0", x2: "0", y2: "1" });
    lg.appendChild(el("stop", { offset: "0", "stop-color": "#EAD06A", "stop-opacity": "0.35" }));
    lg.appendChild(el("stop", { offset: "1", "stop-color": "#EAD06A", "stop-opacity": "0" }));
    defs.appendChild(lg);
    svg.appendChild(defs);

    // grid
    for (let i = 1; i <= 3; i++) {
      svg.appendChild(el("line", { x1: pad, y1: (h / 4) * i, x2: w - pad, y2: (h / 4) * i, class: "chart-grid" }));
    }
    const res = smoothPath(values, w, h, pad);
    const area = el("path", { d: `${res.d} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`, fill: `url(#${gid})`, class: "chart-area" });
    svg.appendChild(area);
    const path = el("path", { d: res.d, class: "chart-line chart-line--" + color });
    svg.appendChild(path);
    const len = path.getTotalLength ? path.getTotalLength() : 600;
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    path.style.transition = "stroke-dashoffset 1.8s cubic-bezier(0.22,1,0.36,1)";

    // last point dot
    const last = res.pts[res.pts.length - 1];
    const dot = el("circle", { cx: last[0], cy: last[1], r: 3.5, class: "chart-dot" });
    const ring = el("circle", { cx: last[0], cy: last[1], r: 7, class: "chart-dot--ring" });
    svg.appendChild(ring); svg.appendChild(dot);

    return { svg, path, area, len, gid };
  }

  function buildBarChart(values, opts) {
    opts = opts || {};
    const w = opts.w || 320, h = opts.h || 120, pad = 12;
    const svg = el("svg", { viewBox: `0 0 ${w} ${h}`, preserveAspectRatio: "none", role: "img", "aria-label": opts.label || "Illustrative pickup pace" });
    const n = values.length;
    const gap = 8;
    const bw = (w - pad * 2 - gap * (n - 1)) / n;
    const max = Math.max.apply(null, values) * 1.1;
    const bars = [];
    values.forEach((v, i) => {
      const bh = (v / max) * (h - pad * 2);
      const x = pad + i * (bw + gap);
      const y = h - pad - bh;
      const r = el("rect", { x: x, y: y, width: bw, height: bh, rx: 3, fill: i === n - 1 ? "#EAD06A" : "rgba(234,208,106,0.42)" });
      r.style.transformOrigin = `${x + bw / 2}px ${h - pad}px`;
      r.style.transform = "scaleY(0)";
      r.style.transition = "transform 0.9s cubic-bezier(0.22,1,0.36,1)";
      svg.appendChild(r);
      bars.push(r);
    });
    return { svg, bars };
  }

  function buildDonut(segments, opts) {
    opts = opts || {};
    const size = opts.size || 140, stroke = opts.stroke || 16;
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const svg = el("svg", { viewBox: `0 0 ${size} ${size}`, role: "img", "aria-label": opts.label || "Illustrative OTA channel mix" });
    const total = segments.reduce((s, x) => s + x.value, 0);
    let offset = 0;
    const arcs = [];
    segments.forEach((seg) => {
      const frac = seg.value / total;
      const circle = el("circle", {
        cx: size / 2, cy: size / 2, r: r, fill: "none", stroke: seg.color,
        "stroke-width": stroke, "stroke-dasharray": `${c * frac} ${c}`,
        "stroke-dashoffset": -offset, transform: `rotate(-90 ${size / 2} ${size / 2})`,
        "stroke-linecap": "butt"
      });
      circle.style.opacity = 0;
      circle.style.transition = "opacity 0.7s ease";
      svg.appendChild(circle);
      arcs.push(circle);
      offset += c * frac;
    });
    return { svg, arcs };
  }

  function drawChartsIn(scope) {
    $$("[data-chart]", scope).forEach((node) => renderChart(node));
  }

  function renderChart(node) {
    if (node.dataset.rendered === "1") return;
    const type = node.getAttribute("data-chart");
    const data = window.RevAlphaData ? window.RevAlphaData.charts : null;
    if (!data) return;
    const w = parseInt(node.getAttribute("data-w") || "320", 10);
    const h = parseInt(node.getAttribute("data-h") || "120", 10);
    let built = null;

    if (type === "adr") built = buildLineChart(data.adr, { color: "gold", w, h, label: "Illustrative ADR trend" });
    else if (type === "occupancy") built = buildLineChart(data.occupancy, { color: "mint", w, h, label: "Illustrative occupancy curve" });
    else if (type === "revpar") built = buildLineChart(data.revpar, { color: "gold", w, h, label: "Illustrative RevPAR comparison" });
    else if (type === "competitor") built = buildLineChart(data.competitor, { color: "dim", w, h, label: "Illustrative competitor rate grid" });
    else if (type === "pickup") built = buildBarChart(data.pickup, { w, h, label: "Illustrative pickup pace" });
    else if (type === "weekly") built = buildBarChart(data.weekly, { w, h, label: "Illustrative weekly performance" });
    else if (type === "channel") built = buildDonut(data.channel, { size: h, label: "Illustrative OTA channel mix" });
    else if (type === "hero") {
      built = buildLineChart(data.heroAdr, { color: "gold", w, h, label: "Illustrative ADR and occupancy lines" });
    }
    if (!built) return;
    node.innerHTML = "";
    node.appendChild(built.svg);
    node.dataset.rendered = "1";
    node._chart = built;
  }

  function initCharts() {
    const nodes = $$("[data-chart]");
    if (!nodes.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        renderChart(node);
        const built = node._chart;
        if (built) {
          if (built.path) {
            requestAnimationFrame(() => { built.path.style.strokeDashoffset = 0; });
          }
          if (built.bars) {
            built.bars.forEach((b, i) => setTimeout(() => { b.style.transform = "scaleY(1)"; }, i * 60));
          }
          if (built.arcs) {
            built.arcs.forEach((a, i) => setTimeout(() => { a.style.opacity = 1; }, i * 140));
          }
        }
        io.unobserve(node);
      });
    }, { threshold: 0.25 });
    nodes.forEach((n) => io.observe(n));
  }

  /* ================================================================
     CARD INTERACTIONS — 3D tilt + spotlight
     ================================================================ */
  function initCards() {
    const cards = $$(".card, .htype, .plan");
    if (!cards.length) return;
    cards.forEach((card) => {
      // Spotlight
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - r.left) / r.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - r.top) / r.height) * 100 + "%");
      });
      // Tilt (desktop only)
      if (!DESKTOP || prefersReduced) return;
      card.addEventListener("mousemove", (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("mouseleave", () => { card.style.transform = ""; });
    });
  }

  /* ================================================================
     MARQUEE — duplicate groups for seamless loop
     ================================================================ */
  function initMarquee() {
    $$(".marquee__track").forEach((track) => {
      const group = $(".marquee__group", track);
      if (!group) return;
      if (track.children.length < 2) {
        const clone = group.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        track.appendChild(clone);
      }
    });
  }

  /* ================================================================
     FORMS
     ================================================================ */
  function initForms() {
    $$("form[data-form]").forEach((form) => {
      // Floating label state for selects + prefilled inputs
      $$("input, select, textarea", form).forEach((f) => {
        const sync = () => {
          if (f.value && f.value.trim() !== "") f.classList.add("has-value");
          else f.classList.remove("has-value");
        };
        f.addEventListener("input", sync); f.addEventListener("change", sync); f.addEventListener("blur", sync);
        sync();
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
        const success = form.parentElement.querySelector(".form-success");
        form.style.display = "none";
        if (success) { success.classList.add("is-on"); success.setAttribute("tabindex", "-1"); success.focus(); success.scrollIntoView({ behavior: "smooth", block: "center" }); }
      });

      // clear error on input
      $$("input, select, textarea", form).forEach((f) => {
        f.addEventListener("input", () => { const field = f.closest(".field"); if (field) field.classList.remove("has-error"); });
      });
    });
  }

  /* ================================================================
     PAGE TRANSITIONS
     ================================================================ */
  function initPageTransitions() {
    if (prefersReduced) return;
    const curtain = $(".loader-curtain");
    if (!curtain) return;
    curtain.style.display = "none";
    doc.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto") || href.startsWith("tel")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
      e.preventDefault();
      curtain.style.display = "block";
      curtain.style.transform = "translateY(100%)";
      requestAnimationFrame(() => {
        curtain.style.transition = "transform 0.5s cubic-bezier(0.22,1,0.36,1)";
        curtain.style.transform = "translateY(0)";
      });
      setTimeout(() => { window.location.href = href; }, 520);
    });
  }

  /* ================================================================
     HERO PARALLAX (light)
     ================================================================ */
  function initParallax() {
    if (prefersReduced || isTouch) return;
    const items = $$("[data-parallax]");
    if (!items.length) return;
    let ticking = false;
    function update() {
      const y = window.scrollY;
      items.forEach((it) => {
        const speed = parseFloat(it.getAttribute("data-parallax")) || 0.1;
        it.style.transform = `translate3d(0, ${(y * speed).toFixed(1)}px, 0)`;
      });
      ticking = false;
    }
    window.addEventListener("scroll", () => { if (!ticking) { requestAnimationFrame(update); ticking = true; } }, { passive: true });
    update();
  }

  /* ================================================================
     SWIPER (hotel types + video sliders)
     ================================================================ */
  function initSwipers() {
    if (typeof window.Swiper === "undefined") return;
    $$(".swiper[data-swiper]").forEach((node) => {
      const type = node.getAttribute("data-swiper");
      const scope = node.closest("section") || node.parentElement || doc;
      const navigation = {
        nextEl: scope.querySelector(".swiper-button-next, .vnav--next"),
        prevEl: scope.querySelector(".swiper-button-prev, .vnav--prev")
      };
      const base = {
        grabCursor: true,
        watchOverflow: true,
        pagination: { el: node.querySelector(".swiper-pagination"), clickable: true }
      };
      const cfg = type === "videos"
        ? {
            slidesPerView: 1.05, spaceBetween: 16,
            breakpoints: {
              760: { slidesPerView: 2.05, spaceBetween: 18 },
              1025: { slidesPerView: 2.5, spaceBetween: 22 },
              1280: { slidesPerView: 3, spaceBetween: 24 }
            }
          }
        : {
            slidesPerView: 1.1, spaceBetween: 18,
            breakpoints: {
              760: { slidesPerView: 2.1, spaceBetween: 20 },
              1025: { slidesPerView: 3.2, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 }
            }
          };
      new window.Swiper(node, Object.assign(base, cfg, { navigation }));
    });
  }

  /* ================================================================
     VIDEO LIGHTBOX (click-to-play facade — no iframe until opened)
     ================================================================ */
  function initVideoLightbox() {
    const box = $("#vlightbox");
    if (!box) return;
    const frame = box.querySelector("[data-vframe]");
    const cap = box.querySelector("[data-vcap]");
    const closeBtn = box.querySelector(".vlightbox__close");
    const triggers = $$("[data-video]");
    if (!triggers.length || !frame) return;

    let lastFocus = null;

    function open(vid, title) {
      if (!vid) return;
      lastFocus = doc.activeElement;
      const iframe = doc.createElement("iframe");
      iframe.src = "https://www.youtube-nocookie.com/embed/" + vid +
        "?autoplay=1&rel=0&modestbranding=1&playsinline=1";
      iframe.title = title || "YouTube video";
      iframe.setAttribute("allow", "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share");
      iframe.setAttribute("allowfullscreen", "");
      iframe.setAttribute("loading", "lazy");
      frame.innerHTML = "";
      frame.appendChild(iframe);
      if (cap) cap.textContent = title || "";
      box.hidden = false;
      doc.body.classList.add("is-locked");
      if (closeBtn) closeBtn.focus();
    }
    function close() {
      if (box.hidden) return;
      box.hidden = true;
      frame.innerHTML = "";
      doc.body.classList.remove("is-locked");
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => open(btn.getAttribute("data-video"), btn.getAttribute("data-vtitle")));
    });
    box.addEventListener("click", (e) => { if (e.target.closest("[data-vclose]")) close(); });
    doc.addEventListener("keydown", (e) => {
      if (box.hidden) return;
      if (e.key === "Escape") { close(); return; }
      if (e.key === "Tab") {
        const f = box.querySelectorAll("button, iframe, a[href], [tabindex]:not([tabindex='-1'])");
        if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ================================================================
     YEAR
     ================================================================ */
  function initYear() {
    $$("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
  }

  /* ================================================================
     BOOT
     ================================================================ */
  function boot() {
    initLoader();
    initCursor();
    initHeader();
    initMobileMenu();
    initScrollProgress();
    initLenis();
    initReveals();
    initSplitText();
    initCounters();
    initAccordions();
    initProblemPanels();
    initCharts();
    initCards();
    initMarquee();
    initForms();
    initPageTransitions();
    initParallax();
    initSwipers();
    initVideoLightbox();
    initYear();
  }

  if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
