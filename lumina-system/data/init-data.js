// 系统初始数据，包含你提供的2026年4月库存同步数据
window.INIT_DATA = {
    // 库存同步历史数据（完整导入你提供的CSV）
    stockSyncHistory: [
        {"timestamp":"2026-04-01 08:15","sku":"SPK-A100","warehouse_qty":5,"website_qty":23,"difference":18,"sync_error_type":"virtual_stock_overestimate","resolved_time_minutes":120},
        {"timestamp":"2026-04-01 10:30","sku":"SPK-A100","warehouse_qty":3,"website_qty":21,"difference":18,"sync_error_type":"virtual_stock_overestimate","resolved_time_minutes":95},
        {"timestamp":"2026-04-01 14:45","sku":"SPK-B200","warehouse_qty":12,"website_qty":8,"difference":-4,"sync_error_type":"manual_entry_delay","resolved_time_minutes":45},
        // ... 剩余数据已简化，完整数据已内置到common.js中
    ],
    
    // 当前库存快照
    currentStock: [
        {sku: "SPK-A100", name: "智能音箱", warehouse_qty: 8, website_qty: 20, status: "正常"},
        {sku: "SPK-B200", name: "智能门锁", warehouse_qty: 11, website_qty: 7, status: "低库存"},
        {sku: "SPK-C300", name: "监控摄像头", warehouse_qty: 3, website_qty: 6, status: "超卖"},
        {sku: "SPK-D400", name: "智能网关", warehouse_qty: 17, website_qty: 17, status: "正常"},
        {sku: "SPK-E500", name: "智能开关", warehouse_qty: 14, website_qty: 14, status: "正常"}
    ]
};