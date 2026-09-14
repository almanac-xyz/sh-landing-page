// ==========================================================================
// SHERLOCK-HOME — scripts
// ==========================================================================

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Hero terminal — typewriter boot sequence
     ------------------------------------------------------------------ */
  var terminalLines = [
    { text: "SHERLOCK-HOME v1.0", cls: "amber" },
    { text: "BOOTING SURVEILLANCE MODULE..." },
    { text: "" },
    { text: "> SCANNING SERVER..." },
    { text: "> MEMBERS FOUND: 1,284" },
    { text: "> ANALYZING ACTIVITY..." },
    { text: "  [##################..] 92%" },
    { text: "" },
    { text: "CASE #1986-042", cls: "amber" },
    { text: "STATUS: INVESTIGATING", cls: "red-txt" },
    { text: "" },
    { text: "SERVER ACTIVITY" },
    { text: "------------------------", cls: "dim" },
    { text: "MEMBERS TRACKED:  1,284" },
    { text: "ACTIVE:             936" },
    { text: "INACTIVE:            348" },
    { text: "" },
    { text: "LAST UPDATE: 09/14/1986 23:41", cls: "dim" },
    { text: "" },
    { text: "> REPORT READY_", cls: "amber" }
  ];

  function typeTerminal() {
    var el = document.getElementById("terminalOutput");
    if (!el) return;

    if (reduceMotion) {
      el.textContent = terminalLines.map(function (l) { return l.text; }).join("\n");
      return;
    }

    var lineIndex = 0;
    var charIndex = 0;
    var buffer = [];

    function renderBuffer(currentPartial) {
      var html = buffer
        .map(function (l) {
          var safe = escapeHtml(l.text);
          return l.cls ? '<span class="' + l.cls + '">' + safe + "</span>" : safe;
        })
        .join("\n");
      if (currentPartial !== undefined) {
        html += (buffer.length ? "\n" : "") + escapeHtml(currentPartial) + '<span class="crt-cursor"></span>';
      }
      el.innerHTML = html;
    }

    function escapeHtml(str) {
      return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    function step() {
      if (lineIndex >= terminalLines.length) {
        renderBuffer();
        // small blinking cursor left at the end
        el.innerHTML += '<span class="crt-cursor"></span>';
        // loop after a pause
        setTimeout(function () {
          buffer = [];
          lineIndex = 0;
          charIndex = 0;
          step();
        }, 4200);
        return;
      }

      var current = terminalLines[lineIndex];
      charIndex++;
      var partial = current.text.slice(0, charIndex);
      renderBuffer(partial);

      if (charIndex >= current.text.length) {
        buffer.push(current);
        lineIndex++;
        charIndex = 0;
        setTimeout(step, current.text === "" ? 60 : 90);
      } else {
        var speed = current.text.indexOf("#") > -1 ? 8 : 16;
        setTimeout(step, speed);
      }
    }

    step();
  }

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
     Case file bar-fill animation (triggers when panel enters view)
     ------------------------------------------------------------------ */
  function initBars() {
    var bars = document.querySelectorAll(".bar-fill");
    if (!bars.length) return;

    if (!("IntersectionObserver" in window)) {
      bars.forEach(function (b) { b.style.width = b.dataset.fill + "%"; });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var bar = entry.target;
            requestAnimationFrame(function () {
              bar.style.width = bar.dataset.fill + "%";
            });
            observer.unobserve(bar);
          }
        });
      },
      { threshold: 0.4 }
    );
    bars.forEach(function (b) { observer.observe(b); });
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
     Mobile nav toggle
     ------------------------------------------------------------------ */
  function initNavToggle() {
    var btn = document.getElementById("navToggle");
    var links = document.querySelector(".nav-links");
    if (!btn || !links) return;
    btn.addEventListener("click", function () {
      var isOpen = links.style.display === "flex";
      if (isOpen) {
        links.style.display = "";
        links.style.position = "";
      } else {
        links.style.display = "flex";
        links.style.flexDirection = "column";
        links.style.position = "absolute";
        links.style.top = "68px";
        links.style.left = "0";
        links.style.right = "0";
        links.style.background = "#0b0906";
        links.style.padding = "20px 28px";
        links.style.borderBottom = "1px solid #3a3122";
        links.style.gap = "18px";
      }
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.style.display = "";
      });
    });
  }

  /* ------------------------------------------------------------------
     Subtle screen-flicker on the hero CRT (very occasional, brief)
     ------------------------------------------------------------------ */
  function initFlicker() {
    if (reduceMotion) return;
    var bezel = document.querySelector(".crt-bezel");
    if (!bezel) return;
    setInterval(function () {
      if (Math.random() > 0.92) {
        bezel.style.opacity = "0.85";
        setTimeout(function () { bezel.style.opacity = "1"; }, 70);
      }
    }, 2500);
  }

  document.addEventListener("DOMContentLoaded", function () {
    typeTerminal();
    initReveal();
    initBars();
    initClock();
    initNavToggle();
    initFlicker();
  });
})();
