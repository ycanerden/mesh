/**
 * Mesh Embeddable Widget
 * Drop into any page: <script src="https://trymesh.chat/widget.js" data-room="your-room"></script>
 *
 * Options (data attributes):
 *   data-room         Room code (required)
 *   data-sender       Sender name — enables send UI (optional, read-only if omitted)
 *   data-position     "bottom-right" (default) | "bottom-left"
 *   data-label        Button label (default: "Live feed")
 *   data-access-token Access token for protected rooms (optional)
 *   data-open         "true" to start open (optional)
 */
(function() {
  'use strict';
  if (window.__meshWidget) return; // already loaded
  window.__meshWidget = true;

  var script = document.currentScript ||
    document.querySelector('script[data-room][src*="widget.js"]');
  if (!script) return;

  var ROOM         = script.getAttribute('data-room') || 'mesh01';
  var SENDER       = script.getAttribute('data-sender') || '';
  var POSITION     = script.getAttribute('data-position') || 'bottom-right';
  var LABEL        = script.getAttribute('data-label') || 'Live feed';
  var ACCESS       = script.getAttribute('data-access-token') || '';
  var START_OPEN   = script.getAttribute('data-open') === 'true';
  var BASE_URL     = (script.src || '').replace('/widget.js', '') || 'https://trymesh.chat';

  var READONLY = !SENDER;
  var isOpen = START_OPEN;
  var frameH = READONLY ? 360 : 420;

  // Inject styles
  var style = document.createElement('style');
  style.textContent = [
    '#mesh-widget-btn{position:fixed;z-index:2147483647;bottom:20px;' +
      (POSITION === 'bottom-left' ? 'left:20px;' : 'right:20px;') +
      'background:#4d94ff;color:#fff;border:none;border-radius:24px;padding:10px 18px;' +
      'font-family:-apple-system,BlinkMacSystemFont,system-ui,sans-serif;font-size:13px;font-weight:600;' +
      'cursor:pointer;box-shadow:0 4px 20px rgba(77,148,255,.4);display:flex;align-items:center;gap:7px;' +
      'transition:transform .15s,box-shadow .15s;}',
    '#mesh-widget-btn:hover{transform:translateY(-1px);box-shadow:0 6px 24px rgba(77,148,255,.5);}',
    '#mesh-widget-btn .mw-dot{width:7px;height:7px;border-radius:50%;background:#22c55e;' +
      'animation:mwpulse 2s infinite;}',
    '@keyframes mwpulse{0%,100%{opacity:1}50%{opacity:.4}}',
    '#mesh-widget-panel{position:fixed;z-index:2147483646;bottom:68px;' +
      (POSITION === 'bottom-left' ? 'left:20px;' : 'right:20px;') +
      'width:320px;height:' + frameH + 'px;border-radius:12px;overflow:hidden;' +
      'box-shadow:0 8px 40px rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.08);' +
      'transition:opacity .2s,transform .2s;transform-origin:bottom ' +
      (POSITION === 'bottom-left' ? 'left' : 'right') + ';}',
    '#mesh-widget-panel.mw-hidden{opacity:0;transform:scale(.95);pointer-events:none;}',
    '#mesh-widget-panel iframe{width:100%;height:100%;border:none;display:block;}',
  ].join('');
  document.head.appendChild(style);

  // Build iframe URL
  var frameUrl = BASE_URL + '/embed-frame?room=' + encodeURIComponent(ROOM) +
    (SENDER ? '&sender=' + encodeURIComponent(SENDER) : '') +
    (READONLY ? '&readonly=1' : '') +
    (ACCESS ? '&access_token=' + encodeURIComponent(ACCESS) : '');

  // Create button
  var btn = document.createElement('button');
  btn.id = 'mesh-widget-btn';
  btn.setAttribute('aria-label', 'Open Mesh live feed');
  btn.innerHTML = '<span class="mw-dot"></span>' + escHtml(LABEL);
  document.body.appendChild(btn);

  // Create panel (lazy — build iframe on first open)
  var panel = document.createElement('div');
  panel.id = 'mesh-widget-panel';
  panel.className = isOpen ? '' : 'mw-hidden';
  document.body.appendChild(panel);

  var iframeLoaded = false;
  function ensureIframe() {
    if (iframeLoaded) return;
    iframeLoaded = true;
    var iframe = document.createElement('iframe');
    iframe.src = frameUrl;
    iframe.setAttribute('allow', 'clipboard-write');
    iframe.setAttribute('loading', 'lazy');
    panel.appendChild(iframe);
  }

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      ensureIframe();
      panel.classList.remove('mw-hidden');
      btn.innerHTML = '<span class="mw-dot"></span>Close';
    } else {
      panel.classList.add('mw-hidden');
      btn.innerHTML = '<span class="mw-dot"></span>' + escHtml(LABEL);
    }
  }

  btn.addEventListener('click', toggle);
  if (isOpen) { ensureIframe(); btn.innerHTML = '<span class="mw-dot"></span>Close'; }

  function escHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // Expose API
  window.MeshWidget = { open: function(){ if(!isOpen) toggle(); }, close: function(){ if(isOpen) toggle(); }, toggle: toggle };
})();
