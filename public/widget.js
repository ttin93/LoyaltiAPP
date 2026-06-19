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
  var label = (s && s.getAttribute("data-label")) || "🎡 Zavrti kolo sreče";

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text) e.textContent = text;
    return e;
  }

  function open() {
    var overlay = el(
      "div",
      "position:fixed;inset:0;z-index:1000000;background:rgba(20,12,8,.62);display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;"
    );
    var box = el("div", "position:relative;width:392px;max-width:92vw;");
    var iframe = el("iframe", "width:100%;height:520px;border:none;border-radius:28px;background:#FFFCF6;display:block;");
    iframe.src = origin + "/embed/" + encodeURIComponent(code);
    iframe.setAttribute("allowtransparency", "true");
    var close = el(
      "button",
      "position:absolute;top:-14px;right:-14px;width:36px;height:36px;border-radius:50%;border:none;background:#fff;cursor:pointer;font-size:17px;box-shadow:0 2px 8px rgba(0,0,0,.2);z-index:2;",
      "✕"
    );
    function onMsg(e) {
      if (e && e.data && e.data.type === "zig-wheel-height" && e.data.height) {
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
    overlay.onclick = function (e) {
      if (e.target === overlay) cleanup();
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
