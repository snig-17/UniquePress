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

  /* Enquiry form -> WhatsApp. No backend: the form fields are composed into
     a pre-filled WhatsApp message so the visitor just reviews and hits send. */
  var WHATSAPP_NUMBER = "919842145579"; // country code + number, no + or spaces

  function wireEnquiryForm() {
    var form = document.getElementById("up-enquiry-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      function val(id) {
        var el = document.getElementById(id);
        return el ? el.value.trim() : "";
      }
      var lines = ["Hi Unique Press, I'd like to enquire."];
      if (val("up-name"))    lines.push("Name: " + val("up-name"));
      if (val("up-phone"))   lines.push("Phone: " + val("up-phone"));
      if (val("up-machine")) lines.push("Machine: " + val("up-machine"));
      if (val("up-msg"))     lines.push("Message: " + val("up-msg"));
      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
      window.open(url, "_blank", "noopener");
    });
  }

  /* Brand reel: build from a [name, logoFile] list. A logo renders as an
     <img>; a brand with no logo (or a broken image) falls back to its name
     as text. The sequence is duplicated once for a seamless -50% loop. */
  var BRANDS = [
    ["Komori", "komori-n.png"], ["Ryobi", "ryobi-n.png"], ["Mitsubishi", "mitsubishi-n.png"],
    ["Shinohara", "shinohara-n.png"], ["Sakurai", "sakurai-n.png"], ["Shiki", "shiki-n.png"],
    ["Iwasaki", "iwasaki-n.png"], ["PBM", "pbm-n.png"], ["Horizon", "horizon-n.png"],
    ["Shoei", "shoei-n.png"], ["Itoh", "itoh-n.png"], ["Polar", "polar-n.png"],
    ["JMC Katsuda", "jmc-katsuda-n.png"], ["Yoda", "yoda-n.png"], ["Uchida", "uchida-n.png"]
  ];

  function reelItem(brand) {
    var name = brand[0], file = brand[1];
    var wrap = 'margin-right:56px; display:inline-flex; align-items:center; height:52px;';
    if (file) {
      // Sizing/greyscale handled by #up-reel img in styles.css so all logos stay uniform.
      return '<span style="' + wrap + '"><img src="/assets/img/logos/' + file +
        '" alt="' + name + '" ' +
        'onerror="this.replaceWith(document.createTextNode(\'' + name + '\'))"></span>';
    }
    return '<span style="' + wrap + '">' + name + "</span>";
  }

  function buildReel() {
    var host = document.getElementById("up-reel");
    if (!host) return;
    var seq = BRANDS.map(reelItem).join("");
    host.innerHTML = seq + seq;
  }

  function init() {
    window.UP.wireStates(document);
    wireEnquiryForm();
    buildReel();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
