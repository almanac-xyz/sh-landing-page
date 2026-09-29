// ==========================================================================
// SHERLOCK-HOME — scripts
// ==========================================================================

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Scroll reveal
     ------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || reduceMotion) {
      items.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Footer live clock
     ------------------------------------------------------------------ */
  function initClock() {
    var el = document.getElementById("footerTime");
    if (!el) return;
    function tick() {
      var now = new Date();
      var h = String(now.getHours()).padStart(2, "0");
      var m = String(now.getMinutes()).padStart(2, "0");
      var s = String(now.getSeconds()).padStart(2, "0");
      el.textContent = h + ":" + m + ":" + s;
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------
     Navbar — indicador deslizante (link "Main") + destaque do trigger
     "About" quando uma das seções do dropdown está em foco
     ------------------------------------------------------------------ */
  var ABOUT_SECTION_IDS = ["case-files", "activity-evidence", "dayzero", "how-it-works"];

  function initNav() {
    var nav = document.querySelector(".nav-links");
    var indicator = nav && nav.querySelector(".nav-indicator");
    var aboutTrigger = document.getElementById("aboutTrigger");
    if (!indicator) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

    var current = null;
    var placed = false;

    function place(link, instant) {
      if (!link) { indicator.style.opacity = "0"; return; }
      if (instant) indicator.style.transition = "none";
      indicator.style.width = link.offsetWidth + "px";
      indicator.style.transform = "translateX(" + link.offsetLeft + "px)";
      indicator.style.opacity = "1";
      if (instant) {
        void indicator.offsetWidth; // aplica o estado antes de reativar a transição
        indicator.style.transition = "";
      }
    }

    function setActive(link) {
      if (link === current) return;
      if (current) current.removeAttribute("aria-current");
      current = link;
      if (link) link.setAttribute("aria-current", "true");
      place(link, !placed);      // primeira vez: sem deslizar a partir do zero
      placed = placed || !!link;
    }

    if ("IntersectionObserver" in window) {
      var activeAboutSections = new Set();
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            var id = entry.target.id;

            if (byId[id] !== undefined && entry.isIntersecting) {
              setActive(byId[id] || null);
            }

            if (ABOUT_SECTION_IDS.indexOf(id) !== -1 && aboutTrigger) {
              if (entry.isIntersecting) activeAboutSections.add(id);
              else activeAboutSections.delete(id);
              aboutTrigger.classList.toggle("is-active", activeAboutSections.size > 0);
            }
          });
        },
        { rootMargin: "-40% 0px -55% 0px" }   // faixa de leitura no meio da tela
      );
      document.querySelectorAll("section[id]").forEach(function (s) { observer.observe(s); });
    }

    function refresh() { place(current, true); }
    window.addEventListener("resize", refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
  }

  /* ------------------------------------------------------------------
     Dropdown "About" — Liquid Glass, abre para cima (a navbar fica
     na parte de baixo da tela)
     ------------------------------------------------------------------ */
  function initAboutDropdown() {
    var wrap = document.querySelector(".nav-about");
    var trigger = document.getElementById("aboutTrigger");
    var dropdown = document.getElementById("aboutDropdown");
    if (!wrap || !trigger || !dropdown) return;

    var isOpen = false;

    function open() {
      if (isOpen) return;
      isOpen = true;
      dropdown.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      document.addEventListener("click", onDocClick, true);
      document.addEventListener("keydown", onKeydown, true);
    }

    function close(focusTrigger) {
      if (!isOpen) return;
      isOpen = false;
      dropdown.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onKeydown, true);
      if (focusTrigger) trigger.focus();
    }

    function onDocClick(e) {
      if (!wrap.contains(e.target)) close(false);
    }

    function onKeydown(e) {
      if (e.key === "Escape" || e.key === "Esc") close(true);
    }

    trigger.addEventListener("click", function () {
      if (isOpen) close(false);
      else open();
    });

    dropdown.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { close(false); });
    });
  }

  /* ------------------------------------------------------------------
     Tema claro / escuro
     O atributo data-theme já vem definido pelo script no <head>.
     ------------------------------------------------------------------ */
  var THEME_KEY = "sh-theme";
  var THEME_COLORS = { light: "#f5f5f7", dark: "#0b0906" };

  function initTheme() {
    var root = document.documentElement;
    var btn = document.getElementById("themeToggle");
    var meta = document.querySelector('meta[name="theme-color"]');
    var media = window.matchMedia("(prefers-color-scheme: dark)");

    function stored() {
      try {
        var v = localStorage.getItem(THEME_KEY);
        return v === "light" || v === "dark" ? v : null;
      } catch (e) { return null; }
    }

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
      if (btn) {
        var label = "Switch to " + (theme === "dark" ? "light" : "dark") + " theme";
        btn.setAttribute("aria-label", label);
        btn.setAttribute("title", label);
      }
    }

    apply(root.getAttribute("data-theme") === "dark" ? "dark" : "light");

    if (btn) {
      btn.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        if (!reduceMotion) {
          root.classList.add("theme-anim");
          setTimeout(function () { root.classList.remove("theme-anim"); }, 350);
        }
        apply(next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
      });
    }

    // Sem escolha manual salva, acompanha o tema do sistema em tempo real
    if (media.addEventListener) {
      media.addEventListener("change", function (e) {
        if (!stored()) apply(e.matches ? "dark" : "light");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initClock();
    initNav();
    initAboutDropdown();
    initTheme();
  });
})();
