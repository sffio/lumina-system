/* ============================================
   卢米纳电子 — 前端 API 请求封装层
   连接后端 REST API，替代 localStorage 直读直写
   ============================================ */

var API_BASE = '/api/v1/warehouse';

// ---- 内部请求函数 ----
function apiGet(path) {
  return fetch(API_BASE + path)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.code !== 200) throw new Error(d.message || '请求失败');
      return d.data;
    });
}

function apiPost(path, body) {
  return fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
    .then(function(r) { return r.json(); })
    .then(function(d) {
      if (d.code !== 200) throw new Error(d.message || '请求失败');
      return d.data;
    });
}

// ---- 库存 API ----
window.API = {
  // 获取全部库存
  getInventory: function() { return apiGet('/inventory'); },
  // 获取预警
  getAlerts: function() { return apiGet('/inventory/alerts'); },
  // 单个 SKU
  getSku: function(sku) { return apiGet('/inventory/' + sku); },
  // 库存修正
  adjustInventory: function(body) { return apiPost('/inventory/adjust', body); },

  // ---- 订单 API ----
  getPendingOrders: function() { return apiGet('/orders/pending'); },
  getOrder: function(id) { return apiGet('/orders/' + id); },
  shipOrder: function(id, body) { return apiPost('/orders/' + id + '/ship', body); },

  // ---- 退货 API ----
  getReturns: function(status) { return apiGet('/returns' + (status ? '?status=' + status : '')); },
  getReturn: function(id) { return apiGet('/returns/' + id); },
  createReturn: function(body) { return apiPost('/returns', body); },
  checkReturn: function(id, body) { return apiPost('/returns/' + id + '/check', body); },

  // ---- 盘点 API ----
  startCheck: function(body) { return apiPost('/check/start', body); },
  submitCheck: function(sessionId, body) { return apiPost('/check/' + sessionId + '/submit', body); },
  getCheckHistory: function() { return apiGet('/check/history'); },
  getCheckSession: function(id) { return apiGet('/check/' + id); },

  // ---- 变动历史 API ----
  getTransactions: function(params) {
    var qs = [];
    if (params) {
      for (var k in params) { if (params[k]) qs.push(k + '=' + encodeURIComponent(params[k])); }
    }
    return apiGet('/stock-transactions' + (qs.length ? '?' + qs.join('&') : ''));
  },

  // ---- 仪表盘 API ----
  getDashboard: function() { return apiGet('/dashboard'); },

  // ---- 种子数据 ----
  seed: function() { return apiPost('/seed', {}); }
};

// ---- 字段映射：后端格式 → 前端格式 ----
function mapOrder(o) {
  return {
    id: o.id, customer: o.customer_name, amount: o.total_amount,
    orderDate: o.order_date, dueDate: o.due_date,
    status: o.status === 'pending_shipment' ? '待发货' : o.status === 'shipped' ? '已发货' : o.status,
    items: o.items || []
  };
}
function mapReturn(r) {
  return {
    id: r.id, orderId: r.order_id, sn: r.sn_code,
    customer: '待查', phone: '-', account: '-', bank: '-',
    amount: 0, product: r.sku || '未知',
    quality: r.quality_result === 'resellable' ? '可再次销售' : r.quality_result === 'defective' ? '不良品' : '未质检',
    operator: r.operator, status: r.status === 'pending_check' ? '待审核' : r.status === 'checked' ? '已质检' : r.status,
    reason: r.reason, remark: r.remark, createTime: (r.created_at || '').replace('T',' ').slice(0,19)
  };
}
function mapTx(t) {
  return {
    time: (t.created_at || '').replace('T',' ').slice(0,19), operator: t.operator,
    type: t.type === 'ship' ? '库存变动' : t.type === 'return_good' ? '库存变动' : t.type === 'return_defect' ? '库存变动' : t.type === 'check_adjust' ? '库存调整' : t.type,
    content: (t.remark || '') + ' [' + t.sku + ']',
    before: (t.quantity_before != null ? t.sku + ' 库存：' + t.quantity_before : '-'),
    after: (t.quantity_after != null ? t.sku + ' 库存：' + t.quantity_after : '-'),
    ip: '192.168.1.' + (t.id || 1)
  };
}

// ---- 同步函数：拉取后端数据 → 转换格式 → 写入 localStorage ----
window.syncFromBackend = function() {
  var promises = [];

  // 库存（字段兼容，直接存）
  promises.push(API.getInventory().then(function(data) {
    localStorage.setItem('stockData', JSON.stringify(data));
    return data;
  }));

  // 订单（翻译字段 + 合并已发货订单）
  promises.push(API.getPendingOrders().then(function(data) {
    var existing = JSON.parse(localStorage.getItem('orderData') || '[]');
    var map = {};
    existing.forEach(function(o) { map[o.id] = o; });
    data.forEach(function(o) { map[o.id] = mapOrder(o); });
    localStorage.setItem('orderData', JSON.stringify(Object.values(map)));
    return data;
  }));

  // 退货（翻译字段）
  promises.push(API.getReturns().then(function(data) {
    localStorage.setItem('refundData', JSON.stringify(data.map(mapReturn)));
    return data;
  }));

  // 盘点历史
  promises.push(API.getCheckHistory().then(function(data) {
    localStorage.setItem('checkHistory', JSON.stringify(data));
    return data;
  }));

  // 变动历史（翻译字段）
  promises.push(API.getTransactions({limit: 200}).then(function(data) {
    localStorage.setItem('auditLogData', JSON.stringify(data.map(mapTx)));
    return data;
  }));

  return Promise.all(promises).then(function() {
    console.log('[API] 后端数据已同步到 localStorage (已翻译字段)');
    return true;
  }).catch(function(e) {
    console.warn('[API] 后端同步失败，使用 localStorage 缓存:', e.message);
    return false;
  });
};

// ---- 智能数据读取：优先 API，回退 localStorage ----
window.loadData = function(key, apiCall) {
  return apiCall().then(function(data) {
    if (Array.isArray(data)) localStorage.setItem(key, JSON.stringify(data));
    return data;
  }).catch(function() {
    return JSON.parse(localStorage.getItem(key) || '[]');
  });
};

console.log('[API] 仓库端 API 层已加载，端点：' + API_BASE);
