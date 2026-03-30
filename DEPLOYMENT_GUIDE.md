# Stitch Home Feed - 完整部署教學指南

## 📋 目錄

1. [項目概述](#項目概述)
2. [系統需求](#系統需求)
3. [本地開發環境設置](#本地開發環境設置)
4. [Manus 平台部署](#manus-平台部署)
5. [自主部署指南](#自主部署指南)
6. [環境變數配置](#環境變數配置)
7. [資料庫設置](#資料庫設置)
8. [故障排除](#故障排除)
9. [性能優化](#性能優化)

---

## 項目概述

**Stitch Home Feed** 是一個優雅的二手商品交易平台，採用現代化的技術棧：

| 層級 | 技術 | 版本 |
|------|------|------|
| **前端** | React + Tailwind CSS + tRPC | 19 + 4 + 11 |
| **後端** | Express + tRPC | 4 + 11 |
| **資料庫** | MySQL/TiDB | 8.0+ |
| **認證** | Manus OAuth | - |
| **部署** | Manus 平台 / 自主部署 | - |

### 核心功能

- ✅ 商品列表展示（即時資料庫同步）
- ✅ 商品詳情頁面
- ✅ 使用者認證（Manus OAuth）
- ✅ 實時聊天功能
- ✅ 對話歷史記錄
- ✅ 優雅的 UI 設計

---

## 系統需求

### 本地開發

- **Node.js**: 18.0.0 或更高版本
- **pnpm**: 9.0.0 或更高版本（推薦）或 npm 8.0.0+
- **Git**: 2.30.0 或更高版本
- **MySQL**: 8.0.0 或更高版本（用於本地開發）

### 部署環境

- **Manus 平台**（推薦）：無需額外配置
- **自主部署**：
  - Linux 伺服器（Ubuntu 20.04+ 推薦）
  - Docker（可選）
  - 域名和 SSL 證書
  - MySQL 資料庫

---

## 本地開發環境設置

### 1. 克隆倉庫

```bash
git clone https://github.com/Ben-J5/bj5.git
cd bj5
```

### 2. 安裝依賴

```bash
# 使用 pnpm（推薦）
pnpm install

# 或使用 npm
npm install
```

### 3. 環境變數配置

創建 `.env.local` 文件：

```bash
cp .env.example .env.local
```

編輯 `.env.local` 並設置以下變數：

```env
# 資料庫
DATABASE_URL="mysql://user:password@localhost:3306/stitch_home_feed"

# OAuth
VITE_APP_ID="your_manus_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# JWT
JWT_SECRET="your_jwt_secret_key_min_32_chars"

# 擁有者信息
OWNER_OPEN_ID="your_open_id"
OWNER_NAME="Your Name"

# Manus API
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="your_api_key"
VITE_FRONTEND_FORGE_API_KEY="your_frontend_api_key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
```

### 4. 資料庫設置

```bash
# 生成遷移文件
pnpm drizzle-kit generate

# 執行遷移
pnpm drizzle-kit migrate
```

### 5. 啟動開發伺服器

```bash
# 啟動開發伺服器（同時運行前端和後端）
pnpm dev
```

訪問 http://localhost:3000 查看應用

### 6. 運行測試

```bash
# 運行所有測試
pnpm test

# 監視模式
pnpm test:watch
```

---

## Manus 平台部署

### 推薦方式：使用 Manus 管理界面

Manus 平台提供了最簡單的部署方式，無需手動配置伺服器或資料庫。

#### 步驟 1：訪問 Manus 管理界面

1. 打開您的 Manus 專案
2. 點擊右上角的「Dashboard」按鈕
3. 進入管理面板

#### 步驟 2：檢查部署狀態

1. 在「Dashboard」中查看「Dev Server」狀態
2. 確保所有依賴已安裝（dependencies: OK）
3. 檢查 TypeScript 編譯狀態（typescript: No errors）

#### 步驟 3：發佈網站

1. 在管理界面中找到最新的「Checkpoint」卡片
2. 點擊卡片上的「Publish」按鈕
3. 確認發佈設置
4. 點擊「Publish」完成發佈

#### 步驟 4：獲取公開網址

發佈完成後，您將獲得一個公開網址：

```
https://stitchfeed-in3bovt8.manus.space
```

此網址將永久有效，您的應用已部署到全球 CDN。

### 自訂域名（可選）

1. 進入「Settings」→「Domains」
2. 選擇「Add Custom Domain」
3. 輸入您的域名（例如：stitch.example.com）
4. 按照 DNS 配置指南設置 CNAME 記錄
5. 等待 DNS 生效（通常 5-30 分鐘）

---

## 自主部署指南

### 選項 1：使用 Docker 部署

#### 1. 創建 Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# 安裝 pnpm
RUN npm install -g pnpm

# 複製 package 文件
COPY package.json pnpm-lock.yaml ./

# 安裝依賴
RUN pnpm install --frozen-lockfile

# 複製源代碼
COPY . .

# 構建應用
RUN pnpm build

# 暴露端口
EXPOSE 3000

# 啟動應用
CMD ["pnpm", "start"]
```

#### 2. 創建 docker-compose.yml

```yaml
version: '3.8'

services:
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: stitch_home_feed
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: "mysql://root:root_password@mysql:3306/stitch_home_feed"
      NODE_ENV: production
      # 其他環境變數...
    depends_on:
      - mysql

volumes:
  mysql_data:
```

#### 3. 部署

```bash
# 構建並啟動容器
docker-compose up -d

# 查看日誌
docker-compose logs -f app

# 停止容器
docker-compose down
```

### 選項 2：使用 Linux 伺服器部署

#### 1. 準備伺服器

```bash
# 更新系統
sudo apt update && sudo apt upgrade -y

# 安裝 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安裝 pnpm
npm install -g pnpm

# 安裝 MySQL
sudo apt install -y mysql-server

# 安裝 Nginx（反向代理）
sudo apt install -y nginx

# 安裝 PM2（進程管理）
sudo npm install -g pm2
```

#### 2. 配置 MySQL

```bash
# 登入 MySQL
sudo mysql

# 創建資料庫和用戶
CREATE DATABASE stitch_home_feed;
CREATE USER 'stitch_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON stitch_home_feed.* TO 'stitch_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. 部署應用

```bash
# 克隆倉庫
cd /var/www
git clone https://github.com/Ben-J5/bj5.git stitch-home-feed
cd stitch-home-feed

# 安裝依賴
pnpm install

# 設置環境變數
cp .env.example .env.production
# 編輯 .env.production 並設置生產環境變數

# 構建應用
pnpm build

# 使用 PM2 啟動應用
pm2 start "pnpm start" --name "stitch-home-feed"
pm2 save
pm2 startup
```

#### 4. 配置 Nginx

創建 `/etc/nginx/sites-available/stitch-home-feed`：

```nginx
server {
    listen 80;
    server_name stitch.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

啟用配置：

```bash
sudo ln -s /etc/nginx/sites-available/stitch-home-feed /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. 配置 SSL（使用 Let's Encrypt）

```bash
# 安裝 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 獲取 SSL 證書
sudo certbot --nginx -d stitch.example.com

# 自動續期
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer
```

---

## 環境變數配置

### 開發環境 (.env.local)

```env
# 資料庫
DATABASE_URL="mysql://user:password@localhost:3306/stitch_home_feed"

# OAuth
VITE_APP_ID="dev_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# JWT
JWT_SECRET="dev_secret_key_at_least_32_characters_long"

# 擁有者
OWNER_OPEN_ID="dev_owner_id"
OWNER_NAME="Dev Owner"

# API
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="dev_api_key"
VITE_FRONTEND_FORGE_API_KEY="dev_frontend_key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# 應用
VITE_APP_TITLE="Stitch Home Feed"
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="analytics_id"
```

### 生產環境 (.env.production)

```env
# 資料庫（使用生產資料庫）
DATABASE_URL="mysql://prod_user:strong_password@prod-db.example.com:3306/stitch_home_feed"

# OAuth（使用生產應用 ID）
VITE_APP_ID="prod_app_id"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://portal.manus.im"

# JWT（使用強密鑰）
JWT_SECRET="production_secret_key_very_long_and_secure_min_32_chars"

# 擁有者
OWNER_OPEN_ID="prod_owner_id"
OWNER_NAME="Production Owner"

# API
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="prod_api_key"
VITE_FRONTEND_FORGE_API_KEY="prod_frontend_key"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"

# 應用
VITE_APP_TITLE="Stitch Home Feed"
NODE_ENV="production"
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="prod_analytics_id"
```

### 環境變數說明

| 變數名 | 說明 | 範例 |
|--------|------|------|
| `DATABASE_URL` | MySQL 連接字符串 | `mysql://user:pass@host/db` |
| `VITE_APP_ID` | Manus OAuth 應用 ID | `app_12345` |
| `JWT_SECRET` | JWT 簽名密鑰（最少 32 字符） | `your_secret_key...` |
| `OWNER_OPEN_ID` | 擁有者的 OpenID | `user_12345` |
| `OWNER_NAME` | 擁有者名稱 | `John Doe` |
| `NODE_ENV` | 運行環境 | `production` 或 `development` |

---

## 資料庫設置

### 本地開發

#### 1. 安裝 MySQL

```bash
# macOS
brew install mysql

# Ubuntu/Debian
sudo apt install mysql-server

# Windows
# 下載 MySQL 安裝程序：https://dev.mysql.com/downloads/mysql/
```

#### 2. 啟動 MySQL

```bash
# macOS
brew services start mysql

# Ubuntu/Debian
sudo systemctl start mysql

# Windows
# MySQL 通常自動啟動
```

#### 3. 創建資料庫

```bash
# 登入 MySQL
mysql -u root -p

# 創建資料庫
CREATE DATABASE stitch_home_feed;
CREATE USER 'stitch_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON stitch_home_feed.* TO 'stitch_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 4. 運行遷移

```bash
# 生成遷移文件
pnpm drizzle-kit generate

# 執行遷移
pnpm drizzle-kit migrate
```

### 生產環境

#### 使用 Manus 平台

Manus 自動提供 MySQL 資料庫，無需手動配置。

#### 自主部署

使用 AWS RDS、Google Cloud SQL 或自主 MySQL 伺服器：

```bash
# 連接到遠程資料庫
mysql -h db.example.com -u admin -p stitch_home_feed

# 執行遷移
DATABASE_URL="mysql://user:pass@db.example.com/stitch_home_feed" pnpm drizzle-kit migrate
```

### 資料庫架構

應用包含以下表：

| 表名 | 說明 | 主要欄位 |
|------|------|---------|
| `users` | 使用者信息 | id, openId, email, name, role, createdAt |
| `items` | 商品列表 | id, title, price, imageUrl, description, sellerId, createdAt |
| `conversations` | 聊天對話 | id, buyerId, sellerId, itemId, createdAt, updatedAt |
| `messages` | 聊天訊息 | id, conversationId, senderId, content, createdAt |

---

## 故障排除

### 常見問題

#### 1. 資料庫連接失敗

**症狀**：`Error: connect ECONNREFUSED 127.0.0.1:3306`

**解決方案**：

```bash
# 檢查 MySQL 是否運行
sudo systemctl status mysql

# 啟動 MySQL
sudo systemctl start mysql

# 驗證連接字符串
echo $DATABASE_URL
```

#### 2. OAuth 登入失敗

**症狀**：登入後重定向到錯誤頁面

**解決方案**：

1. 檢查 `VITE_APP_ID` 是否正確
2. 驗證 OAuth 回調 URL 配置
3. 檢查瀏覽器控制台錯誤信息

```bash
# 查看伺服器日誌
tail -f .manus-logs/devserver.log
```

#### 3. 聊天功能不工作

**症狀**：訊息無法發送或接收

**解決方案**：

1. 確認使用者已登入
2. 檢查資料庫中的 `conversations` 和 `messages` 表
3. 查看瀏覽器網絡標籤中的 API 請求

```bash
# 檢查 API 日誌
tail -f .manus-logs/networkRequests.log
```

#### 4. 頁面加載緩慢

**症狀**：首頁或商品列表加載超過 3 秒

**解決方案**：

1. 檢查資料庫查詢性能
2. 添加資料庫索引
3. 實現分頁功能

```sql
-- 為常用查詢添加索引
ALTER TABLE items ADD INDEX idx_seller_id (sellerId);
ALTER TABLE messages ADD INDEX idx_conversation_id (conversationId);
```

#### 5. 部署後 CSS 樣式不顯示

**症狀**：頁面顯示但沒有樣式

**解決方案**：

1. 清除瀏覽器快取（Ctrl+Shift+Delete）
2. 檢查 Tailwind CSS 構建是否成功
3. 驗證 `client/src/index.css` 是否正確導入

```bash
# 重新構建
pnpm build

# 檢查構建輸出
ls -la dist/
```

### 調試技巧

#### 啟用詳細日誌

```bash
# 開發環境
DEBUG=* pnpm dev

# 生產環境
NODE_DEBUG=* pnpm start
```

#### 檢查 API 響應

```bash
# 測試商品 API
curl http://localhost:3000/api/trpc/items.list

# 測試認證
curl http://localhost:3000/api/trpc/auth.me
```

#### 資料庫查詢調試

```bash
# 啟用 Drizzle 日誌
DEBUG=drizzle:* pnpm dev
```

---

## 性能優化

### 前端優化

#### 1. 代碼分割

```typescript
// 使用動態導入進行代碼分割
const Chat = lazy(() => import('./pages/Chat'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
```

#### 2. 圖片優化

```typescript
// 使用 WebP 格式和懶加載
<img 
  src="image.webp" 
  alt="Product"
  loading="lazy"
  width={300}
  height={300}
/>
```

#### 3. 緩存策略

```typescript
// 使用 tRPC 查詢緩存
const { data } = trpc.items.list.useQuery(
  { page: 1 },
  { staleTime: 5 * 60 * 1000 } // 5 分鐘快取
);
```

### 後端優化

#### 1. 資料庫查詢優化

```typescript
// 使用 select 限制返回欄位
const items = await db
  .select({ id: items.id, title: items.title, price: items.price })
  .from(items)
  .limit(20);
```

#### 2. 分頁實現

```typescript
// 實現分頁以減少資料傳輸
export const listItems = publicProcedure
  .input(z.object({ page: z.number().default(1), limit: z.number().default(20) }))
  .query(async ({ input }) => {
    const offset = (input.page - 1) * input.limit;
    return db.select().from(items).limit(input.limit).offset(offset);
  });
```

#### 3. 連接池配置

```typescript
// 優化 MySQL 連接池
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### 部署優化

#### 1. 啟用 Gzip 壓縮

```nginx
# Nginx 配置
gzip on;
gzip_types text/plain text/css application/json application/javascript;
gzip_min_length 1024;
```

#### 2. 設置 CDN

```bash
# 使用 Cloudflare 或其他 CDN 服務
# 配置 CNAME 記錄指向 CDN
```

#### 3. 監控和告警

```bash
# 使用 PM2 監控
pm2 monit

# 設置告警
pm2 install pm2-auto-pull
```

---

## 監控和維護

### 日誌管理

```bash
# 查看應用日誌
pm2 logs stitch-home-feed

# 查看錯誤日誌
tail -f /var/log/stitch-home-feed/error.log

# 清理舊日誌
find /var/log/stitch-home-feed -name "*.log" -mtime +30 -delete
```

### 定期備份

```bash
# 備份資料庫
mysqldump -u user -p stitch_home_feed > backup_$(date +%Y%m%d).sql

# 備份應用文件
tar -czf stitch-home-feed_$(date +%Y%m%d).tar.gz /var/www/stitch-home-feed

# 上傳到雲存儲
aws s3 cp backup_*.sql s3://my-backups/
```

### 安全更新

```bash
# 定期更新依賴
pnpm update

# 檢查安全漏洞
pnpm audit

# 修復漏洞
pnpm audit --fix
```

---

## 支持和反饋

如有任何部署問題或建議，請：

1. 查看 [GitHub Issues](https://github.com/Ben-J5/bj5/issues)
2. 提交新的 Issue 或 Pull Request
3. 聯繫 Manus 支持團隊：https://help.manus.im

---

**祝您部署順利！** 🚀
