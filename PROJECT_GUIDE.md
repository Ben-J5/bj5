# Stitch Home Feed - 優雅的二手商品交易平台

## 項目概述

**Stitch Home Feed** 是一個現代化的二手商品交易平台，採用優雅且完美的設計風格。用戶可以瀏覽精心挑選的二手商品，與賣家直接溝通，享受優質的交易體驗。

## 核心功能

### 1. 商品列表展示
- 從資料庫即時獲取商品資料
- 優雅的卡片式設計展示商品
- 包含商品圖片、標題、價格、描述
- 圖片載入錯誤自動顯示佔位符
- 商品狀態標籤（可購買、已售出、待確認）

### 2. 使用者認證系統
- 整合 Manus OAuth 認證
- 支援登入/登出功能
- 顯示當前登入用戶資訊
- 受保護的 API 端點需要認證

### 3. 聊天功能
- 點擊商品卡片開啟聊天
- 實時訊息發送和接收
- 對話歷史記錄
- 自動輪詢刷新訊息（2秒間隔）
- 完整的錯誤處理和加載狀態

### 4. 安全性
- 訊息檢索需要認證和授權檢查
- 用戶只能存取自己參與的對話
- 對話唯一性由 itemId + buyerId + sellerId 組合保證

## 技術架構

### 前端技術棧
- **React 19** - UI 框架
- **Tailwind CSS 4** - 樣式系統
- **tRPC** - 類型安全的 RPC 調用
- **Wouter** - 路由管理
- **shadcn/ui** - UI 組件庫

### 後端技術棧
- **Express 4** - Web 框架
- **tRPC 11** - 類型安全的 API
- **Drizzle ORM** - 資料庫 ORM
- **MySQL/TiDB** - 資料庫

### 資料庫架構

#### users 表
存儲用戶信息，包含 OAuth 認證信息

#### items 表
存儲二手商品信息
- title: 商品標題
- description: 商品描述
- price: 商品價格
- imageUrl: 商品圖片 URL
- sellerId: 賣家用戶 ID
- status: 商品狀態（available/sold/pending）

#### conversations 表
存儲用戶之間的對話
- itemId: 商品 ID
- buyerId: 買家用戶 ID
- sellerId: 賣家用戶 ID
- lastMessageAt: 最後訊息時間

#### messages 表
存儲聊天訊息
- conversationId: 對話 ID
- senderId: 發送者用戶 ID
- content: 訊息內容
- createdAt: 建立時間

## API 端點

### 商品 API
- `GET /api/trpc/items.list` - 獲取所有商品
- `GET /api/trpc/items.getById` - 獲取特定商品

### 對話 API
- `GET /api/trpc/conversations.list` - 獲取用戶的對話列表（需認證）
- `POST /api/trpc/conversations.getOrCreate` - 建立或獲取對話（需認證）

### 訊息 API
- `GET /api/trpc/messages.getByConversation` - 獲取對話訊息（需認證和授權）
- `POST /api/trpc/messages.send` - 發送訊息（需認證和授權）

### 認證 API
- `GET /api/trpc/auth.me` - 獲取當前用戶信息
- `POST /api/trpc/auth.logout` - 登出用戶

## 設計風格

### 色彩系統
採用優雅的色彩方案，提供淺色和深色主題支持：
- **主色調**：藍色（oklch(0.55 0.25 259)）
- **背景色**：淺灰色（淺色）/ 深灰色（深色）
- **文字色**：深灰色（淺色）/ 淺灰色（深色）

### 排版
- 字體：系統字體棧（-apple-system, BlinkMacSystemFont, 'Segoe UI', 等）
- 圓角半徑：0.75rem
- 字母間距：-0.3px

### 組件設計
- 卡片式設計，帶有陰影和邊框
- 平滑的過渡動畫
- 懸停效果提升互動性
- 響應式設計支持所有設備

## 測試覆蓋

所有核心功能都有 Vitest 測試覆蓋：

### 商品 API 測試
- ✓ 列表所有商品
- ✓ 按 ID 獲取商品

### 對話功能測試
- ✓ 建立或獲取對話
- ✓ 列出用戶對話
- ✓ 發送和檢索訊息
- ✓ 未授權存取防護

### 認證測試
- ✓ 登出功能

運行測試：
```bash
pnpm test
```

## 部署指南

### 環境要求
- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL 或 TiDB 資料庫

### 本地開發
```bash
# 安裝依賴
pnpm install

# 生成資料庫遷移
pnpm drizzle-kit generate

# 執行資料庫遷移
pnpm drizzle-kit migrate

# 啟動開發伺服器
pnpm dev
```

### 構建和部署
```bash
# 構建應用
pnpm build

# 啟動生產伺服器
pnpm start
```

## 已知限制和改進方向

### 當前限制
1. 聊天訊息使用輪詢方式更新（每 2 秒），不支持實時 WebSocket
2. 商品列表無分頁，一次性加載所有商品
3. 未實現商品搜索和過濾功能
4. 未實現用戶評分系統

### 建議的改進
1. 實現 WebSocket 實時聊天
2. 添加商品列表分頁和虛擬化
3. 實現全文搜索和高級過濾
4. 添加用戶評分和評論系統
5. 實現商品上傳功能
6. 添加支付集成（Stripe）
7. 實現訂單管理系統
8. 添加推送通知功能

## 文件結構

```
stitch-home-feed/
├── client/                 # 前端應用
│   ├── src/
│   │   ├── pages/         # 頁面組件
│   │   ├── components/    # 可重用組件
│   │   ├── lib/           # 工具函數
│   │   └── App.tsx        # 主應用組件
│   └── index.html
├── server/                # 後端應用
│   ├── routers.ts         # tRPC 路由定義
│   ├── db.ts              # 資料庫查詢函數
│   └── *.test.ts          # 測試文件
├── drizzle/               # 資料庫架構
│   ├── schema.ts          # 表定義
│   └── migrations/        # 遷移文件
└── package.json
```

## 支持和貢獻

如有任何問題或建議，歡迎提出 Issue 或 Pull Request。

## 許可證

MIT

---

**最後更新**：2026 年 3 月 29 日
**版本**：1.0.0
