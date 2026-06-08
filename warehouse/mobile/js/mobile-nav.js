/* ============================================
   卢米纳电子 - 仓库端移动端底部标签栏 (v2)
   使用 SVG 图标，激活态用顶部色条指示
   ============================================ */

(function() {
  'use strict';

  // Tab configuration — icon names match mobile-icons.js
  var TABS = [
    { label: '工作台', icon: 'home',      href: 'index.html' },
    { label: '发货',   icon: 'package',   href: 'delivery.html' },
    { label: '退货',   icon: 'refresh',   href: 'refund.html' },
    { label: '盘点',   icon: 'clipboard', href: 'check.html' }
  ];

  function getCurrentPage() {
    var path = window.location.pathname;
    var parts = path.replace(/\\/g, '/').split('/');
    var filename = parts[parts.length - 1] || 'index.html';
    if (!filename) filename = 'index.html';
    return filename;
  }

  function renderTabBar() {
    var currentPage = getCurrentPage();

    // Build tab bar HTML with SVG icons via data-icon placeholders
    var html = '<nav class="bottom-tab-bar" id="bottomTabBar">';
    for (var i = 0; i < TABS.length; i++) {
      var tab = TABS[i];
      var isActive = (tab.href === currentPage);
      html +=
        '<button class="tab-item' + (isActive ? ' active' : '') + '" ' +
        'onclick="window.location.href=\'' + tab.href + '\'" ' +
        'aria-label="' + tab.label + '">' +
        '<span class="tab-icon" data-icon="' + tab.icon + '" data-icon-size="22"></span>' +
        '<span class="tab-label">' + tab.label + '</span>' +
        '</button>';
    }
    html += '</nav>';

    // Inject into .pc-screen as the last flex child
    var pcScreen = document.querySelector('.pc-screen');
    if (pcScreen) {
      pcScreen.insertAdjacentHTML('beforeend', html);

      // Render SVG icons into the tab-icon placeholders
      if (window.renderMobileIcon) {
        var iconSpans = pcScreen.querySelectorAll('.tab-icon[data-icon]');
        for (var i = 0; i < iconSpans.length; i++) {
          var span = iconSpans[i];
          var name = span.getAttribute('data-icon');
          var size = span.getAttribute('data-icon-size') || '22';
          span.innerHTML = window.renderMobileIcon(name, size);
        }
      }
    }
  }

  // Render on DOM ready, after mobile-icons.js has loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderTabBar);
  } else {
    renderTabBar();
  }

  // ---- Eye-protect mobile toggle ----
  window.toggleEyeMobile = function() {
    var html = document.documentElement;
    var btn = document.getElementById('eyeMobileBtn');
    var isEyeProtect = localStorage.getItem('eyeProtect') === 'true';
    isEyeProtect = !isEyeProtect;
    localStorage.setItem('eyeProtect', String(isEyeProtect));

    if (isEyeProtect) {
      html.classList.add('eye-protect');
      if (btn) {
        btn.innerHTML = window.renderMobileIcon ? window.renderMobileIcon('sun', '20') : '☀️';
      }
    } else {
      html.classList.remove('eye-protect');
      if (btn) {
        btn.innerHTML = window.renderMobileIcon ? window.renderMobileIcon('moon', '20') : '👁️';
      }
    }
  };

})();
