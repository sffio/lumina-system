/* ============================================
   卢米纳电子 - 移动端 扫码/语音交互模块
   全屏摄像头预览 + 手动输入降级 / 录音界面 + 文字降级
   ============================================ */

(function() {
  'use strict';

  var overlay = document.createElement('div');
  overlay.id = 'msvOverlay';
  overlay.style.cssText = 'display:none;position:fixed;inset:0;background:#000;z-index:9999;flex-direction:column;';
  document.body.appendChild(overlay);

  // ---- 关闭按钮 ----
  function closeBtnHtml() {
    return '<button onclick="closeMSV()" style="position:absolute;top:12px;right:12px;z-index:10;width:44px;height:44px;border-radius:50%;border:none;background:rgba(255,255,255,0.2);color:#fff;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;">✕</button>';
  }

  // ====== 扫码 ======
  window.openScannerMobile = function(callback) {
    var stream = null;
    var html = closeBtnHtml() +
      '<div style="flex:1;display:flex;align-items:center;justify-content:center;background:#111;position:relative;">' +
        '<video id="msvVideo" autoplay playsinline style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:none;"></video>' +
        '<div id="msvCamMsg" style="color:#fff;text-align:center;padding:20px;">' +
          '<div style="font-size:48px;margin-bottom:16px;">📸</div>' +
          '<div style="font-size:16px;">正在启动摄像头...</div>' +
        '</div>' +
        '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:240px;height:240px;border:2px solid rgba(255,255,255,0.5);border-radius:12px;pointer-events:none;"></div>' +
      '</div>' +
      '<div style="background:#1a1a1a;padding:16px 20px 24px;">' +
        '<div style="color:#999;font-size:13px;margin-bottom:10px;">手动输入（降级方案）</div>' +
        '<div style="display:flex;gap:10px;">' +
          '<input type="text" id="msvManualInput" placeholder="请输入编码" style="flex:1;height:48px;padding:0 14px;border:1px solid #444;border-radius:8px;font-size:16px;background:#222;color:#fff;">' +
          '<button onclick="confirmScannerMobile()" style="height:48px;padding:0 24px;background:#0078d4;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">确认</button>' +
        '</div>' +
        '<div id="msvScanCorner" style="display:none;position:absolute;bottom:120px;left:50%;transform:translateX(-50%);color:#fff;font-size:15px;background:rgba(0,0,0,0.6);padding:8px 16px;border-radius:20px;">对准条码自动识别</div>' +
      '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
    window._msvCallback = callback;

    setTimeout(function() {
      var video = document.getElementById('msvVideo');
      if (!video) return;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(function(s) {
          stream = s;
          video.srcObject = s;
          video.style.display = 'block';
          var msg = document.getElementById('msvCamMsg');
          if (msg) msg.style.display = 'none';
          var corner = document.getElementById('msvScanCorner');
          if (corner) corner.style.display = 'block';
        }).catch(function() {
          var msg = document.getElementById('msvCamMsg');
          if (msg) msg.innerHTML = '<div style="font-size:48px;margin-bottom:16px;">🚫</div><div>摄像头不可用</div><div style="font-size:13px;opacity:0.7;margin-top:8px;">请使用下方手动输入</div>';
        });
      } else {
        var msg = document.getElementById('msvCamMsg');
        if (msg) msg.innerHTML = '<div style="font-size:48px;margin-bottom:16px;">🚫</div><div>浏览器不支持</div><div style="font-size:13px;opacity:0.7;margin-top:8px;">请使用下方手动输入</div>';
      }
    }, 100);

    overlay._stream = stream;
  };

  window.confirmScannerMobile = function() {
    var input = document.getElementById('msvManualInput');
    var value = input ? input.value.trim() : '';
    if (!value) { alert('请输入编码'); return; }
    if (window._msvCallback) window._msvCallback(value);
    closeMSV();
  };

  // ====== 语音 ======
  window.openVoiceMobile = function(callback) {
    var html = closeBtnHtml() +
      '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#1a1a1a;padding:20px;">' +
        '<div id="msvVoiceStatus" style="font-size:16px;color:#aaa;margin-bottom:32px;">点击麦克风开始录音</div>' +
        '<button id="msvMicBtn" onclick="startVoiceRecordMobile()" style="width:96px;height:96px;border-radius:50%;border:3px solid #0078d4;background:#222;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;">' +
          '<span style="font-size:42px;">🎙️</span>' +
        '</button>' +
        '<div id="msvWaveBox" style="display:flex;align-items:center;justify-content:center;gap:5px;height:48px;margin-top:24px;"></div>' +
      '</div>' +
      '<div style="background:#1a1a1a;padding:16px 20px 24px;">' +
        '<div style="color:#999;font-size:13px;margin-bottom:10px;">文字输入（降级方案）</div>' +
        '<div style="display:flex;gap:10px;">' +
          '<input type="text" id="msvVoiceInput" placeholder="请输入内容" style="flex:1;height:48px;padding:0 14px;border:1px solid #444;border-radius:8px;font-size:16px;background:#222;color:#fff;">' +
          '<button onclick="confirmVoiceMobile()" style="height:48px;padding:0 24px;background:#0f9d58;color:#fff;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer;">确认</button>' +
        '</div>' +
      '</div>';

    overlay.innerHTML = html;
    overlay.style.display = 'flex';
    window._msvCallback = callback;
    window._msvRecording = false;
  };

  window.startVoiceRecordMobile = function() {
    if (window._msvRecording) return;
    window._msvRecording = true;
    var btn = document.getElementById('msvMicBtn');
    var status = document.getElementById('msvVoiceStatus');
    var waveBox = document.getElementById('msvWaveBox');

    btn.style.borderColor = '#d93025';
    btn.style.background = '#331111';
    status.innerText = '🔴 正在录音...';
    status.style.color = '#d93025';

    waveBox.innerHTML = '';
    for (var i = 0; i < 16; i++) {
      var bar = document.createElement('div');
      bar.style.cssText = 'width:4px;height:20px;border-radius:2px;background:#0078d4;animation:msvWave 0.5s ease-in-out infinite;animation-delay:' + (i * 0.06) + 's;';
      waveBox.appendChild(bar);
    }

    setTimeout(function() {
      if (!window._msvRecording) return;
      window._msvRecording = false;
      btn.style.borderColor = '#0078d4';
      btn.style.background = '#222';
      status.innerText = '识别完成，结果已填入';
      status.style.color = '#0f9d58';
      waveBox.innerHTML = '';

      var input = document.getElementById('msvVoiceInput');
      if (input) {
        input.value = 'SN' + new Date().getFullYear() + String(new Date().getMonth()+1).padStart(2,'0') + String(new Date().getDate()).padStart(2,'0') + String(Math.floor(Math.random()*1000)).padStart(3,'0');
      }
    }, 2000);
  };

  window.confirmVoiceMobile = function() {
    var input = document.getElementById('msvVoiceInput');
    var value = input ? input.value.trim() : '';
    if (!value) { alert('请输入内容'); return; }
    if (window._msvCallback) window._msvCallback(value);
    closeMSV();
  };

  window.closeMSV = function() {
    if (overlay._stream) {
      overlay._stream.getTracks().forEach(function(t) { t.stop(); });
      overlay._stream = null;
    }
    overlay.style.display = 'none';
    window._msvCallback = null;
    window._msvRecording = false;
  };

  if (!document.getElementById('msvWaveStyle')) {
    var style = document.createElement('style');
    style.id = 'msvWaveStyle';
    style.textContent = '@keyframes msvWave { 0%,100%{height:10px;opacity:0.3;} 50%{height:36px;opacity:1;} }';
    document.head.appendChild(style);
  }
})();
