// language toggle
function setLang(lang) {
  var target = lang === "en" ? "/en" : "/";
  window.location.assign(target + window.location.hash);
}

window.toggleStandardNav = function (button) {
  var page = document.querySelector(".standard-page");
  if (!page) return;
  var open = page.classList.toggle("nav-open");
  if (button) button.setAttribute("aria-expanded", String(open));
};

window.closeStandardNav = function () {
  var page = document.querySelector(".standard-page");
  if (page) page.classList.remove("nav-open");
  var button = document.querySelector(".navtoggle");
  if (button) button.setAttribute("aria-expanded", "false");
};

// reveal spectrum
window.addEventListener("load", function () {
  var bar = document.getElementById("specBar");
  setTimeout(function () {
    if (bar) bar.classList.add("lit");
  }, 350);
});

// animate axis bars in view
var io = new IntersectionObserver(
  function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.querySelectorAll(".fill").forEach(function (f) {
        f.style.width = f.getAttribute("data-w") + "%";
      });
      io.unobserve(e.target);
    });
  },
  { threshold: 0.4 },
);
var axes = document.getElementById("axesBlock");
if (axes) io.observe(axes);

// close mobile nav on link tap
document.querySelectorAll(".standard-nav a").forEach(function (a) {
  a.addEventListener("click", function () {
    if (window.innerWidth <= 980) {
      closeStandardNav();
    }
  });
});

/* ---- Sector search & filter (bilingual) ---- */
(function () {
  function initSectorSearch() {
    var root = document.getElementById("sectors");
    if (!root) return;
    var input = document.getElementById("secSearch");
    var tierSel = document.getElementById("secTier");
    var count = document.getElementById("secCount");
    var clear = document.getElementById("secClear");
    if (!input || !tierSel || tierSel.dataset.ready === "1") return;
    tierSel.dataset.ready = "1";
    var en = document.documentElement.lang === "en";
    var tiers = Array.prototype.map.call(root.querySelectorAll(".tier"), function (tier, i) {
      var h = tier.querySelector(".tier-head h3");
      var name = h ? (en && h.getAttribute("data-en")) || h.textContent : "Tier " + (i + 1);
      var opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = name;
      tierSel.appendChild(opt);
      var cards = Array.prototype.map.call(tier.querySelectorAll(".sec"), function (card) {
        var parts = [card.textContent || ""];
        Array.prototype.forEach.call(card.querySelectorAll("[data-en]"), function (el) {
          parts.push(el.getAttribute("data-en") || "");
        });
        return { el: card, hay: parts.join(" ").toLowerCase() };
      });
      return { el: tier, cards: cards };
    });
    var total = tiers.reduce(function (n, t) {
      return n + t.cards.length;
    }, 0);
    function apply() {
      var q = input.value.trim().toLowerCase();
      var ti = tierSel.value;
      var shown = 0;
      tiers.forEach(function (tier, i) {
        var tierOk = ti === "" || String(i) === ti;
        var visible = 0;
        tier.cards.forEach(function (c) {
          var ok = tierOk && (!q || c.hay.indexOf(q) !== -1);
          c.el.hidden = !ok;
          if (ok) visible++;
        });
        tier.el.hidden = visible === 0;
        shown += visible;
      });
      if (count) {
        count.textContent =
          q || ti
            ? en
              ? shown + " of " + total + " sectors"
              : "عرض " + shown + " من " + total + " قطاعًا"
            : en
              ? total + " sectors"
              : total + " قطاعًا";
      }
    }
    input.addEventListener("input", apply);
    tierSel.addEventListener("change", apply);
    if (clear)
      clear.addEventListener("click", function () {
        input.value = "";
        tierSel.value = "";
        apply();
        input.focus();
      });
    apply();
  }
  if (document.readyState !== "loading") initSectorSearch();
  else document.addEventListener("DOMContentLoaded", initSectorSearch);
})();
