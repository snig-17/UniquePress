/* ------------------------------------------------------------------
   Unique Press — interaction runtime.

   The Claude design uses `style-hover` and `style-focus` attributes for
   its interactive states (originally powered by Claude's support.js).
   This small script reproduces that behaviour with plain DOM events, so
   the site needs no external runtime and the markup stays identical to
   the design. Each element's base `style` is captured once; the extra
   rules are appended on enter/focus and removed on leave/blur.
   ------------------------------------------------------------------ */
(function () {
  function wire(attr, onEvents, offEvents) {
    document.querySelectorAll("[" + attr + "]").forEach(function (el) {
      var base = el.getAttribute("style") || "";
      var extra = el.getAttribute(attr) || "";
      var on = function () { el.setAttribute("style", base + ";" + extra); };
      var off = function () { el.setAttribute("style", base); };
      onEvents.forEach(function (e) { el.addEventListener(e, on); });
      offEvents.forEach(function (e) { el.addEventListener(e, off); });
    });
  }

  function init() {
    wire("style-hover", ["mouseenter"], ["mouseleave"]);
    wire("style-focus", ["focus"], ["blur"]);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
