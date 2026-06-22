/* Tally — vgradljiv wheel widget.
   Uporaba na poljubnem websiteu:
   <script src="https://TVOJ-DOMAIN/widget.js" data-venue="moka" defer></script>
*/
(function () {
  var s =
    document.currentScript ||
    (function () {
      var els = document.getElementsByTagName("script");
      return els[els.length - 1];
    })();
  var code = (s && s.getAttribute("data-venue")) || "demo";
  var origin = s && s.src ? new URL(s.src).origin : window.location.origin;
  var label = (s && s.getAttribute("data-label")) || "Osvoji nagrado";

  var INK = "#2A241D", AMBER = "#E2A04A", PAPER = "#FBF3E6";

  function el(tag, css, html) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // floaty animacija
  var st = document.createElement("style");
  st.textContent = "@keyframes tallyFloaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}";
  document.head.appendChild(st);

  var wheelSvg =
    '<svg width="24" height="24" viewBox="0 0 24 24" style="fill:none;stroke:' + INK + ';stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;display:block;"><circle cx="12" cy="12" r="9"></circle><path d="M12 3v18M3 12h18M6 6l12 12M18 6 6 18"></path></svg>';

  function open() {
    var overlay = el("div", "position:fixed;inset:0;z-index:1000000;background:rgba(26,18,13,.46);backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;");
    var box = el("div", "position:relative;width:392px;max-width:92vw;");
    var iframe = el("iframe", "width:100%;height:560px;border:none;border-radius:26px;background:transparent;display:block;box-shadow:0 24px 60px rgba(26,18,13,.32);");
    iframe.src = origin + "/embed/" + encodeURIComponent(code);
    iframe.setAttribute("allowtransparency", "true");
    var close = el(
      "button",
      "position:absolute;top:14px;right:14px;width:34px;height:34px;border-radius:50%;border:none;background:rgba(42,36,29,.08);cursor:pointer;z-index:8;display:flex;align-items:center;justify-content:center;",
      '<svg width="14" height="14" viewBox="0 0 24 24" style="fill:none;stroke:' + INK + ';stroke-width:2.2;stroke-linecap:round;"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"></path></svg>'
    );
    function onMsg(e) {
      if (e && e.data && (e.data.type === "zig-wheel-height" || e.data.type === "tally-wheel-height") && e.data.height) {
        var max = Math.floor(window.innerHeight * 0.92);
        iframe.style.height = Math.min(e.data.height, max) + "px";
      }
    }
    window.addEventListener("message", onMsg);
    function cleanup() {
      window.removeEventListener("message", onMsg);
      if (overlay.parentNode) document.body.removeChild(overlay);
    }
    close.onclick = cleanup;
    overlay.onclick = function (e) { if (e.target === overlay) cleanup(); };
    box.appendChild(iframe);
    box.appendChild(close);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  function init() {
    var btn = el(
      "button",
      "position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;align-items:center;gap:11px;background:" + INK + ";border:none;border-radius:999px;padding:9px 9px 9px 18px;box-shadow:0 14px 30px rgba(26,18,13,.35);cursor:pointer;font-family:'Plus Jakarta Sans',system-ui,sans-serif;animation:tallyFloaty 4s ease-in-out infinite;",
      '<span style="font-size:14.5px;font-weight:700;color:' + PAPER + ';">' + label + '</span><span style="width:44px;height:44px;border-radius:50%;background:' + AMBER + ';display:flex;align-items:center;justify-content:center;">' + wheelSvg + "</span>"
    );
    btn.onclick = open;
    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
