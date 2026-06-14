/* Žig — vgradljiv wheel widget.
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
  var label = (s && s.getAttribute("data-label")) || "🎡 Osvoji nagrado";

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }

  function open() {
    var overlay = el(
      "div",
      "position:fixed;inset:0;z-index:1000000;background:rgba(20,12,8,.62);display:flex;align-items:center;justify-content:center;"
    );
    var box = el("div", "position:relative;width:390px;max-width:92vw;height:580px;max-height:90vh;");
    var iframe = el("iframe", "width:100%;height:100%;border:none;border-radius:24px;");
    iframe.src = origin + "/embed/" + encodeURIComponent(code);
    iframe.setAttribute("allowtransparency", "true");
    var close = el(
      "button",
      "position:absolute;top:-14px;right:-14px;width:36px;height:36px;border-radius:50%;border:none;background:#fff;cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,.2);",
      "✕"
    );
    close.onclick = function () {
      document.body.removeChild(overlay);
    };
    overlay.onclick = function (e) {
      if (e.target === overlay) document.body.removeChild(overlay);
    };
    box.appendChild(iframe);
    box.appendChild(close);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  function init() {
    var btn = el(
      "button",
      "position:fixed;bottom:20px;right:20px;z-index:999999;background:#2B1D17;color:#F5EFE6;border:none;border-radius:999px;padding:14px 22px;font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28);",
      label
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
