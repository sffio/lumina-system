/* ============================================
   卢米纳电子 - PC端 扫码/语音交互模块
   打开摄像头预览 + 手动输入降级 / 录音界面 + 文字输入降级
   ============================================ */

(function() {
  'use strict';

  // ====== DOM: 动态创建遮罩层 ======
  var overlay = document.createElement('div');
  overlay.id = 'svOverlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;align-items:center;justify-content:center;';
  document.body.appendChild(overlay);

  // ====== 扫码 — 摄像头预览 + 手动输入 ======
  window.openScanner = function(callback) {
    var stream = null;

    var html = '<div style="background:#fff;border-radius:12px;width:520px;max-height:90vh;overflow-y:auto;display:flex;flex-direction:column;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee;">' +
        '<span style="font-size:18px;font-weight:bold;">📷 扫码录入</span>' +
        '<button onclick="closeSV()" style="border:none;background:none;font-size:22px;cursor:pointer;color:#999;">✕</button>' +
      '</div>' +
      '<div style="padding:16px 20px;">' +
        '<div id="svCameraBox" style="width:100%;height:300px;background:#111;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden;margin-bottom:12px;">' +
          '<video id="svVideo" autoplay playsinline style="width:100%;height:100%;object-fit:cover;display:none;"></video>' +
          '<div id="svCameraMsg" style="color:#fff;text-align:center;padding:20px;">' +
            '<div style="font-size:40px;margin-bottom:12px;">📸</div>' +
            '<div>正在启动摄像头...</div>' +
          '</div>' +
        '</div>' +
        '<div style="font-size:13px;color:#999;margin-bottom:8px;">手动输入（摄像头降级方案）</div>' +
        '<div style="display:flex;gap:10px;">' +
          '<input type="text" id="svManualInput" placeholder="请输入编码" style="flex:1;height:44px;padding:0 12px;border:1px solid #ddd;border-radius:6px;font-size:16px;">' +
          '<button onclick="confirmScanner()" style="height:44px;padding:0 20px;background:#0078d4;color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:bold;cursor:pointer;">确认</button>' +
        '</div>' +
      '</div></div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
    window._svCallback = callback;

    // 尝试打开摄像头
    var video = null;
    setTimeout(function() {
      video = document.getElementById('svVideo');
      if (!video) return;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(s) {
          stream = s;
          video.srcObject = s;
          video.style.display = 'block';
          var msg = document.getElementById('svCameraMsg');
          if (msg) msg.style.display = 'none';
        }).catch(function() {
          var msg = document.getElementById('svCameraMsg');
          if (msg) msg.innerHTML = '<div style="font-size:40px;margin-bottom:12px;">🚫</div><div>摄像头不可用<br><span style="font-size:13px;opacity:0.7;">请使用下方手动输入</span></div>';
        });
      } else {
        var msg = document.getElementById('svCameraMsg');
        if (msg) msg.innerHTML = '<div style="font-size:40px;margin-bottom:12px;">🚫</div><div>浏览器不支持摄像头<br><span style="font-size:13px;opacity:0.7;">请使用下方手动输入</span></div>';
      }
    }, 100);

    // 存储 stream 以便关闭
    overlay._stream = stream;
  };

  window.confirmScanner = function() {
    var input = document.getElementById('svManualInput');
    var value = input ? input.value.trim() : '';
    if (!value) { alert('请输入编码'); return; }
    if (window._svCallback) window._svCallback(value);
    closeSV();
  };

  // ====== 语音 — 录音界面 + 文字输入降级 ======
  window.openVoiceInput = function(callback) {
    var html = '<div style="background:#fff;border-radius:12px;width:440px;display:flex;flex-direction:column;">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee;">' +
        '<span style="font-size:18px;font-weight:bold;">🎤 语音输入</span>' +
        '<button onclick="closeSV()" style="border:none;background:none;font-size:22px;cursor:pointer;color:#999;">✕</button>' +
      '</div>' +
      '<div style="padding:24px 20px;text-align:center;">' +
        '<div id="svVoiceStatus" style="font-size:15px;color:#666;margin-bottom:20px;">点击麦克风开始录音</div>' +
        '<button id="svMicBtn" onclick="startVoiceRecord()" style="width:80px;height:80px;border-radius:50%;border:3px solid #0078d4;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;transition:all 0.2s;">' +
          '<span style="font-size:36px;">🎙️</span>' +
        '</button>' +
        '<div id="svWaveBox" style="display:flex;align-items:center;justify-content:center;gap:4px;height:40px;margin-bottom:16px;"></div>' +
        '<div style="font-size:13px;color:#999;margin-bottom:8px;">文字输入（降级方案）</div>' +
        '<div style="display:flex;gap:10px;">' +
          '<input type="text" id="svVoiceInput" placeholder="请输入内容" style="flex:1;height:44px;padding:0 12px;border:1px solid #ddd;border-radius:6px;font-size:16px;">' +
          '<button onclick="confirmVoice()" style="height:44px;padding:0 20px;background:#0f9d58;color:#fff;border:none;border-radius:6px;font-size:15px;font-weight:bold;cursor:pointer;">确认</button>' +
        '</div>' +
      '</div></div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
    window._svCallback = callback;
    window._voiceRecording = false;
  };

  window.startVoiceRecord = function() {
    if (window._voiceRecording) return;
    window._voiceRecording = true;
    var btn = document.getElementById('svMicBtn');
    var status = document.getElementById('svVoiceStatus');
    var waveBox = document.getElementById('svWaveBox');

    btn.style.borderColor = '#d93025';
    btn.style.background = '#ffebee';
    status.innerText = '🔴 正在录音...';
    status.style.color = '#d93025';

    // CSS波形动画
    waveBox.innerHTML = '';
    for (var i = 0; i < 12; i++) {
      var bar = document.createElement('div');
      bar.style.cssText = 'width:4px;height:16px;border-radius:2px;background:#0078d4;animation:svWave 0.6s ease-in-out infinite;animation-delay:' + (i * 0.08) + 's;';
      waveBox.appendChild(bar);
    }

    // 2秒后模拟识别完成
    setTimeout(function() {
      if (!window._voiceRecording) return;
      window._voiceRecording = false;
      btn.style.borderColor = '#0078d4';
      btn.style.background = '#fff';
      status.innerText = '识别完成，结果已填入';
      status.style.color = '#0f9d58';
      waveBox.innerHTML = '';

      var input = document.getElementById('svVoiceInput');
      if (input) {
        var simulated = 'SN' + new Date().getFullYear() + String(new Date().getMonth()+1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0') + String(Math.floor(Math.random()*1000)).padStart(3,'0');
        input.value = simulated;
      }
    }, 2000);
  };

  window.confirmVoice = function() {
    var input = document.getElementById('svVoiceInput');
    var value = input ? input.value.trim() : '';
    if (!value) { alert('请输入内容'); return; }
    if (window._svCallback) window._svCallback(value);
    closeSV();
  };

  window.closeSV = function() {
    // 关闭摄像头
    if (overlay._stream) {
      overlay._stream.getTracks().forEach(function(t) { t.stop(); });
      overlay._stream = null;
    }
    overlay.style.display = 'none';
    window._svCallback = null;
    window._voiceRecording = false;
  };

  // 波形动画 keyframes（注入一次）
  if (!document.getElementById('svWaveStyle')) {
    var style = document.createElement('style');
    style.id = 'svWaveStyle';
    style.textContent = '@keyframes svWave { 0%,100%{height:8px;opacity:0.4;} 50%{height:32px;opacity:1;} }';
    document.head.appendChild(style);
  }

  // 点击遮罩空白处关闭
  overlay.addEventListener('click', function(e) {
    if (e.target === overlay) closeSV();
  });

  // ESC 关闭
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSV();
  });

})();
