// 护眼模式切换
function toggleEyeProtect() {
    const html = document.documentElement;
    const switchEl = document.getElementById('eyeSwitch');
    let isEyeProtect = localStorage.getItem('eyeProtect') === 'true';
    isEyeProtect = !isEyeProtect;
    localStorage.setItem('eyeProtect', isEyeProtect);
    switchEl.classList.toggle('active', isEyeProtect);
    html.classList.toggle('eye-protect', isEyeProtect);
}

// 页面加载时应用护眼模式
window.addEventListener('DOMContentLoaded', function() {
    const isEyeProtect = localStorage.getItem('eyeProtect') === 'true';
    const html = document.documentElement;
    const switchEl = document.getElementById('eyeSwitch');
    if(isEyeProtect) {
        html.classList.add('eye-protect');
        if(switchEl) switchEl.classList.add('active');
    }
});

// 初始化系统数据
function initSystemData() {
    if(localStorage.getItem('systemInitialized') === 'true') return;
    
    // 导入你提供的库存数据
    const stockData = [
        {sku: "SPK-A100", warehouse_qty: 8, website_qty: 20, difference: 12, sync_error_type: "sync_successful", resolved_time_minutes: 0},
        {sku: "SPK-B200", warehouse_qty: 11, website_qty: 7, difference: -4, sync_error_type: "manual_entry_delay", resolved_time_minutes: 40},
        {sku: "SPK-C300", warehouse_qty: 3, website_qty: 6, difference: 3, sync_error_type: "virtual_stock_overestimate", resolved_time_minutes: 150},
        {sku: "SPK-D400", warehouse_qty: 17, website_qty: 17, difference: 0, sync_error_type: "sync_successful", resolved_time_minutes: 0},
        {sku: "SPK-E500", warehouse_qty: 14, website_qty: 14, difference: 0, sync_error_type: "sync_successful", resolved_time_minutes: 0}
    ];
    
    // 初始订单数据
    const orderData = [
        {id: "B2B20260401001", customer: "华为技术有限公司", amount: 150000, orderDate: "2026-04-01", dueDate: "2026-05-01", status: "待发货", items: [{sku: "MS-200", name: "智能门锁", qty: 50}, {sku: "CAM-300", name: "监控摄像头", qty: 100}, {sku: "SPK-100", name: "智能音箱", qty: 200}]},
        {id: "B2B20260420003", customer: "小米科技有限公司", amount: 85000, orderDate: "2026-04-20", dueDate: "2026-05-20", status: "已发货", items: [{sku: "SPK-100", name: "智能音箱", qty: 300}]},
        {id: "B2B20260501005", customer: "字节跳动有限公司", amount: 120000, orderDate: "2026-05-01", dueDate: "2026-06-01", status: "待发货", items: [{sku: "CAM-300", name: "监控摄像头", qty: 500}]}
    ];
    
    // 初始退货数据
    const refundData = [
        {id: "RT20260501001", orderId: "ORD20260428005", sn: "SN20260428005001", customer: "张三", phone: "138XXXX1234", account: "6226XXXX1234", bank: "招商银行北京海淀支行", amount: 2999, product: "SPK100 智能音箱", quality: "已确认质量问题", operator: "王主管", status: "待审核", createTime: "2026-05-01 09:30"},
        {id: "RT20260503002", orderId: "ORD20260430012", sn: "SN20260430012001", customer: "李四", phone: "139XXXX5678", account: "6217XXXX4567", bank: "工商银行北京朝阳支行", amount: 1999, product: "CAM300 监控摄像头", quality: "已确认质量问题", operator: "王主管", status: "待审核", createTime: "2026-05-03 14:20"}
    ];
    
    // 初始应收款数据
    const receivableData = [
        {orderId: "B2B20260401001", customer: "华为技术有限公司", amount: 150000, received: 0, dueDate: "2026-05-01", nextRemind: "已逾期", status: "未核销", statusText: "逾期15天"},
        {orderId: "B2B20260420003", customer: "小米科技有限公司", amount: 85000, received: 0, dueDate: "2026-05-20", nextRemind: "2026-05-17", status: "待核销", statusText: "账期前3天"},
        {orderId: "B2B20260501005", customer: "字节跳动有限公司", amount: 120000, received: 0, dueDate: "2026-06-01", nextRemind: "2026-05-25", status: "待核销", statusText: "正常"},
        {orderId: "B2B20260310002", customer: "OPPO广东移动通信有限公司", amount: 200000, received: 200000, dueDate: "2026-04-10", nextRemind: "已完成", status: "已核销", statusText: "已结清"}
    ];
    
    // 初始审计日志数据
    const auditLogData = [
        {time: "2026-05-10 09:15:23", operator: "王主管", type: "库存变动", content: "确认发货 B2B20260509002", before: "SPK100 库存：241", after: "SPK100 库存：236", ip: "192.168.1.10"},
        {time: "2026-05-10 08:42:11", operator: "王主管", type: "退货录入", content: "录入退货 RT20260509003", before: "-", after: "SN码：SN20260502008002", ip: "192.168.1.10"},
        {time: "2026-05-09 16:30:45", operator: "陈总监", type: "退款审核", content: "审核通过 RT20260503002", before: "状态：待审核", after: "状态：已通过", ip: "192.168.1.20"}
    ];
    
    // 保存到localStorage
    localStorage.setItem('stockData', JSON.stringify(stockData));
    localStorage.setItem('orderData', JSON.stringify(orderData));
    localStorage.setItem('refundData', JSON.stringify(refundData));
    localStorage.setItem('receivableData', JSON.stringify(receivableData));
    localStorage.setItem('auditLogData', JSON.stringify(auditLogData));
    localStorage.setItem('systemInitialized', 'true');
}

// 添加审计日志
function addAuditLog(type, content, before, after) {
    const logs = JSON.parse(localStorage.getItem('auditLogData') || '[]');
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    const role = localStorage.getItem('currentRole');
    let operator = '系统';
    if(role === 'manager') operator = '林总';
    if(role === 'warehouse') operator = '王主管';
    if(role === 'finance') operator = '陈总监';
    
    logs.unshift({
        time: time,
        operator: operator,
        type: type,
        content: content,
        before: before,
        after: after,
        ip: "192.168.1." + Math.floor(Math.random()*255)
    });
    
    localStorage.setItem('auditLogData', JSON.stringify(logs));
}

// Excel导出函数（使用CDN）
function exportToExcel(tableId, filename) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    script.onload = function() {
        const table = document.getElementById(tableId);
        const wb = XLSX.utils.table_to_book(table);
        XLSX.writeFile(wb, filename + '.xlsx');
    };
    document.head.appendChild(script);
}