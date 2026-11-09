/* ==========================================================================
   Feuerwehr Schrietz Wiehl – Interaktionen
   Keine Abhängigkeiten, reines Vanilla JavaScript
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------------- Header */
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("scrollProgress");

  function onScroll() {
    var scrollY = window.scrollY || window.pageYOffset;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle("is-scrolled", scrollY > 12);
    }

    if (progress) {
      var ratio = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;
      progress.style.width = (ratio * 100).toFixed(2) + "%";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ------------------------------------------------------------ Mobile nav */
  var navToggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");

  function closeNav() {
    document.body.classList.remove("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Menü öffnen");
    }
  }

  function openNav() {
    document.body.classList.add("nav-open");
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", "true");
      navToggle.setAttribute("aria-label", "Menü schließen");
    }
  }

  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      if (document.body.classList.contains("nav-open")) {
        closeNav();
      } else {
        openNav();
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && document.body.classList.contains("nav-open")) {
        closeNav();
        navToggle.focus();
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        closeNav();
      }
    });
  }

  /* -------------------------------------------------------------- Scrollspy */
  var sectionIds = ["start", "ueber-uns", "community", "aktivitaeten", "projekte", "team", "discord", "abspann"];
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-list a"));
  var spySections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function updateScrollspy() {
    if (!spySections.length) return;

    var offset = (header ? header.offsetHeight : 76) + 90;
    var currentId = "start";
    var scrollY = window.scrollY || window.pageYOffset;

    spySections.forEach(function (section) {
      if (section.offsetTop - offset <= scrollY) {
        currentId = section.id;
      }
    });

    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === "#" + currentId);
    });
  }

  var spyTicking = false;

  window.addEventListener("scroll", function () {
    if (spyTicking) return;
    spyTicking = true;
    window.requestAnimationFrame(function () {
      updateScrollspy();
      spyTicking = false;
    });
  }, { passive: true });

  updateScrollspy();

  /* ---------------------------------------------------------------- Reveal */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  revealItems.forEach(function (item) {
    var delay = item.getAttribute("data-delay");
    if (delay) {
      item.style.setProperty("--reveal-delay", delay + "ms");
    }
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  }

  /* -------------------------------------------------------------- Counters */
  var counters = Array.prototype.slice.call(document.querySelectorAll(".counter"));

  function animateCounter(element) {
    var target = parseInt(element.getAttribute("data-count"), 10);
    var suffix = element.getAttribute("data-suffix") || "";

    if (isNaN(target)) return;

    if (prefersReducedMotion) {
      element.textContent = target + suffix;
      return;
    }

    var duration = 1600;
    var start = null;

    function frame(timestamp) {
      if (start === null) start = timestamp;
      var progressValue = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressValue, 3);
      element.textContent = Math.round(target * eased) + suffix;

      if (progressValue < 1) {
        window.requestAnimationFrame(frame);
      }
    }

    window.requestAnimationFrame(frame);
  }

  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var counterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.6 });

      counters.forEach(function (counter) { counterObserver.observe(counter); });
    } else {
      counters.forEach(animateCounter);
    }
  }

  /* --------------------------------------------------------------- Credits */
  var creditsStage = document.getElementById("creditsStage");
  var creditsCrawl = document.getElementById("creditsCrawl");
  var creditsToggle = document.getElementById("creditsToggle");
  var creditsLabel = document.getElementById("creditsToggleLabel");
  var creditsAutoStarted = false;

  function setCreditsPlaying(playing) {
    if (!creditsCrawl || !creditsToggle) return;

    creditsCrawl.classList.toggle("is-playing", playing);
    creditsToggle.setAttribute("aria-pressed", playing ? "true" : "false");

    if (creditsLabel) {
      creditsLabel.textContent = playing
        ? "Abspann anhalten"
        : (creditsCrawl.getBoundingClientRect().top + creditsCrawl.offsetHeight < 0
            ? "Abspann wiederholen"
            : "Abspann starten");
    }
  }

  function restartCredits() {
    if (!creditsCrawl) return;
    creditsCrawl.classList.remove("is-playing");
    // Reflow erzwingen, damit die Animation neu startet
    void creditsCrawl.offsetWidth;
    creditsCrawl.style.animation = "none";
    void creditsCrawl.offsetWidth;
    creditsCrawl.style.animation = "";
    setCreditsPlaying(false);
  }

  if (creditsCrawl && creditsToggle && creditsStage && !prefersReducedMotion) {
    creditsToggle.addEventListener("click", function () {
      var isPlaying = creditsCrawl.classList.contains("is-playing");

      if (isPlaying) {
        setCreditsPlaying(false);
        return;
      }

      var hasFinished =
        getComputedStyle(creditsCrawl).animationName === "none" ||
        (creditsCrawl.getAnimations &&
          creditsCrawl.getAnimations().some(function (animation) {
            return animation.playState === "finished";
          }));

      if (hasFinished) {
        restartCredits();
        window.requestAnimationFrame(function () {
          setCreditsPlaying(true);
        });
        return;
      }

      setCreditsPlaying(true);
    });

    creditsCrawl.addEventListener("animationend", function () {
      setCreditsPlaying(false);
      if (creditsLabel) creditsLabel.textContent = "Abspann wiederholen";
      creditsToggle.setAttribute("aria-pressed", "false");
    });

    if ("IntersectionObserver" in window) {
      var creditsObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !creditsAutoStarted) {
            creditsAutoStarted = true;
            setCreditsPlaying(true);
            creditsObserver.disconnect();
          }
        });
      }, { threshold: 0.25 });

      creditsObserver.observe(creditsStage);
    }
  } else if (creditsToggle) {
    creditsToggle.hidden = true;
  }

  /* ------------------------------------------------------------ Footer year */
  var yearElement = document.getElementById("year");
  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
})();
