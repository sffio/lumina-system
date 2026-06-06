/* ============================================
   卢米纳电子 - PC端 Toast 通知组件
   页面顶部滑入，非阻塞，3秒自动消失
   ============================================ */
(function() {
  'use strict';

  var container = document.createElement('div');
  container.id = 'toastContainer';
  container.style.cssText = 'position:fixed;top:16px;right:16px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
  document.body.appendChild(container);

  var COLORS = {
    success: { bg: '#e8f5e9', border: '#4caf50', text: '#1b5e20' },
    error:   { bg: '#ffebee', border: '#f44336', text: '#b71c1c' },
    warning: { bg: '#fff3e0', border: '#ff9800', text: '#e65100' },
    info:    { bg: '#e3f2fd', border: '#2196f3', text: '#0d47a1' }
  };

  window.showToast = function(message, type) {
    type = type || 'info';
    var c = COLORS[type] || COLORS.info;
    var el = document.createElement('div');
    el.style.cssText = 'pointer-events:auto;max-width:420px;padding:14px 18px;border-left:4px solid ' + c.border +
      ';background:' + c.bg + ';color:' + c.text + ';border-radius:8px;font-size:15px;font-weight:500;' +
      'box-shadow:0 4px 12px rgba(0,0,0,0.12);animation:toastIn 0.3s ease;';
    el.textContent = message;
    container.appendChild(el);

    setTimeout(function() {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0';
      el.style.transform = 'translateX(40px)';
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3000);
  };

  // Inject keyframes
  if (!document.getElementById('toastStyle')) {
    var s = document.createElement('style');
    s.id = 'toastStyle';
    s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(60px);}to{opacity:1;transform:translateX(0);}}';
    document.head.appendChild(s);
  }
})();
