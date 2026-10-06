(function () {
  var root = document.documentElement;
  var btn = document.getElementById("theme");
  var KEY = "portfolio-theme";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- theme ---------- */
  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function label() {
    var t = root.getAttribute("data-theme");
    btn.textContent = "mavzu: " + (t === "dark" ? "qorong'i" : t === "light" ? "yorug'" : "avto");
  }
  try {
    var saved = localStorage.getItem(KEY);
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}
  label();

  btn.addEventListener("click", function () {
    var t = root.getAttribute("data-theme");
    var current = t || (systemDark() ? "dark" : "light");
    var next = current === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem(KEY, next); } catch (e) {}
    label();
    document.dispatchEvent(new Event("themechange"));
  });

  /* ---------- copy buttons ---------- */
  function selectText(el) {
    try {
      var r = document.createRange();
      r.selectNodeContents(el);
      var s = window.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    } catch (e) {}
  }

  Array.prototype.forEach.call(document.querySelectorAll(".row"), function (row) {
    var b = row.querySelector(".copy");
    var v = row.querySelector(".v");
    b.addEventListener("click", function () {
      var done = function () {
        b.textContent = "nusxalandi";
        setTimeout(function () { b.textContent = "nusxa olish"; }, 1600);
      };
      var text = v.textContent;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { selectText(v); });
      } else {
        selectText(v);
      }
    });
  });

  /* ---------- scroll progress + header shadow ---------- */
  var bar = document.getElementById("progress");
  var top = document.getElementById("top");
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(window.scrollY / h, 1) : 0;
      bar.style.setProperty("--p", p.toFixed(4));
      top.classList.toggle("scrolled", window.scrollY > 8);
      ticking = false;
    });
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- active nav link ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".nav a"));
  if (window.IntersectionObserver) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Array.prototype.forEach.call(document.querySelectorAll("main section[id]"), function (s) { secObs.observe(s); });
  }

  if (reduce) return;

  /* ---------- reveal on scroll ---------- */
  root.classList.add("anim");
  var groups = new Map();
  Array.prototype.forEach.call(document.querySelectorAll(".rv"), function (el) {
    var p = el.parentNode;
    var n = groups.get(p) || 0;
    el.style.setProperty("--d", (n * 0.09).toFixed(2) + "s");
    groups.set(p, n + 1);
  });
  if (window.IntersectionObserver) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revObs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    Array.prototype.forEach.call(document.querySelectorAll(".rv"), function (el) { revObs.observe(el); });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll(".rv"), function (el) { el.classList.add("in"); });
  }

  /* ---------- 3D tilt ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".tilt"), function (el) {
    var max = parseFloat(el.getAttribute("data-tilt")) || 8;
    var raf = 0;
    el.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        el.style.setProperty("--ry", ((px - 0.5) * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--rx", ((0.5 - py) * 2 * max).toFixed(2) + "deg");
        el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
        el.style.setProperty("--ga", "1");
      });
    });
    el.addEventListener("pointerleave", function () {
      cancelAnimationFrame(raf);
      el.style.setProperty("--rx", "0deg");
      el.style.setProperty("--ry", "0deg");
      el.style.setProperty("--ga", "0");
    });
  });

  /* ---------- hero spotlight ---------- */
  var hero = document.getElementById("kirish");
  if (hero) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", (e.clientX - r.left) + "px");
      hero.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  }
})();
