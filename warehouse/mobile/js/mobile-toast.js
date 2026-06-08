/* ============================================
   卢米纳电子 - 移动端 Toast 通知组件
   页面顶部滑入，非阻塞，3秒自动消失
   ============================================ */
(function() {
  'use strict';

  var container = document.createElement('div');
  container.id = 'mToastContainer';
  container.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;display:flex;flex-direction:column;align-items:center;padding:12px 16px;padding-top:calc(12px + env(safe-area-inset-top, 0px));gap:6px;pointer-events:none;';
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
    el.style.cssText = 'pointer-events:auto;width:100%;max-width:430px;padding:14px 18px;border-left:4px solid ' + c.border +
      ';background:' + c.bg + ';color:' + c.text + ';border-radius:10px;font-size:14px;font-weight:500;' +
      'box-shadow:0 4px 16px rgba(0,0,0,0.15);animation:mToastIn 0.3s ease;';
    el.textContent = message;
    container.appendChild(el);

    setTimeout(function() {
      el.style.transition = 'opacity 0.3s, transform 0.3s';
      el.style.opacity = '0';
      el.style.transform = 'translateY(-20px)';
      setTimeout(function() { if (el.parentNode) el.parentNode.removeChild(el); }, 300);
    }, 3000);
  };

  if (!document.getElementById('mToastStyle')) {
    var s = document.createElement('style');
    s.id = 'mToastStyle';
    s.textContent = '@keyframes mToastIn{from{opacity:0;transform:translateY(-24px);}to{opacity:1;transform:translateY(0);}}';
    document.head.appendChild(s);
  }
})();
