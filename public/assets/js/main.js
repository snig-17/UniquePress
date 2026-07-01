/* ------------------------------------------------------------------
   Unique Press — interaction runtime.

   The Claude design uses `style-hover` and `style-focus` attributes for
   its interactive states (originally powered by Claude's support.js).
   This reproduces that behaviour with plain DOM events, so the site needs
   no external runtime and the markup stays identical to the design. Each
   element's base `style` is captured once; the extra rules are appended
   on enter/focus and removed on leave/blur.

   Exposed as window.UP.wireStates(root) so dynamically-rendered content
   (the Google-Sheet machine cards in inventory.js) can be wired too.
   ------------------------------------------------------------------ */
window.UP = window.UP || {};

(function () {
  function bind(el, attr, onEvents, offEvents) {
    var base = el.getAttribute("style") || "";
    var extra = el.getAttribute(attr) || "";
    var on = function () { el.setAttribute("style", base + ";" + extra); };
    var off = function () { el.setAttribute("style", base); };
    onEvents.forEach(function (e) { el.addEventListener(e, on); });
    offEvents.forEach(function (e) { el.addEventListener(e, off); });
  }

  window.UP.wireStates = function (root) {
    root = root || document;
    var nodes = root.querySelectorAll("[style-hover], [style-focus]");
    nodes.forEach(function (el) {
      if (el.dataset.upWired) return;   // don't double-bind
      el.dataset.upWired = "1";
      if (el.hasAttribute("style-hover")) bind(el, "style-hover", ["mouseenter"], ["mouseleave"]);
      if (el.hasAttribute("style-focus")) bind(el, "style-focus", ["focus"], ["blur"]);
    });
  };

  function init() { window.UP.wireStates(document); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
