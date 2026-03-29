# Stitch Home Feed - Project TODO

## 資料庫與後端
- [x] 建立 items 資料表（title、price、imageUrl、sellerId、description、createdAt）
- [x] 建立 messages 資料表用於聊天功能
- [x] 建立 conversations 資料表用於聊天對話管理
- [x] 實現商品查詢 API（getItems）
- [x] 實現商品詳情 API（getItemById）
- [x] 實現聊天相關 API（sendMessage、getMessages、getConversations）

## 前端 UI 與設計
- [x] 設計優雅完美的全局風格（色系、字體、間距）
- [x] 建立首頁布局與導航結構
- [x] 實現商品卡片組件（ProductCard）
- [x] 實現商品列表頁面（ProductList）
- [ ] 實現商品詳情頁面（ProductDetail）
- [x] 實現聊天介面（ChatBox）
- [x] 實現使用者認證相關 UI（登入、登出、使用者資訊）

## 功能實現
- [x] 整合 Manus OAuth 認證系統
- [x] 實現商品列表展示（從資料庫即時獲取）
- [x] 實現商品卡片 UI 組件（圖片、標題、價格、錯誤處理）
- [x] 實現點擊商品開啟聊天功能
- [x] 實現聊天功能（發送訊息、接收訊息、對話歷史）
- [x] 實現使用者登入/登出功能

## 測試與優化
- [x] 編寫單元測試（vitest）
- [x] 測試商品列表功能
- [ ] 測試聊天功能
- [ ] 測試認證流程
- [ ] 優化頁面性能與加載速度

## 部署
- [ ] 建立檢查點（checkpoint）
- [ ] 部署到 Manus 平台
- [ ] 驗證公開網址可訪問
- [ ] 交付最終文件與說明
