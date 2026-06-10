# FLASH 正式環境部署指南（GitHub + Render + Firebase）

本專案為 Next.js App Router，建議以 **Render Web Service** 部署，Firebase 負責 Auth / Firestore / Storage。

---

## 1. 前置準備清單

| 項目 | 說明 |
|------|------|
| GitHub 帳號 | 存放原始碼、觸發 CI |
| Render 帳號 | 託管 Next.js 應用 |
| Firebase 專案 | 已建立並啟用 Auth、Firestore、Storage |
| Gemini API Key | AI 虛擬店長 |
| Resend 帳號 + 已驗證網域 | 交易型 Email |
| Stripe 帳號（選用，帳單功能） | 工作室用量計費與 webhook |
| 自訂網域（選用） | 例如 `app.yourstudio.com` |

---

## 2. GitHub 設定

### 2.1 建立 Repository 並推送

```bash
git init   # 若尚未初始化
git add .
git commit -m "Prepare production deployment"
git branch -M main
git remote add origin https://github.com/YOUR_ORG/flash.git
git push -u origin main
```

> `render.yaml` 預設追蹤 `main` 分支。若使用 `master`，請同步修改 `render.yaml` 的 `branch` 欄位。

### 2.2 CI（已內建）

推送至 `main` / `master` 或開 PR 時，`.github/workflows/ci.yml` 會執行：

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`（使用 placeholder 環境變數）

無需在 GitHub Secrets 設定部署金鑰；Render 透過 OAuth 連接 repo 即可自動部署。

### 2.3 建議的 Branch 保護（選用）

GitHub → Settings → Branches → Add rule：

- Branch: `main`
- ✅ Require status checks to pass（選 `CI / check`）
- ✅ Require pull request reviews before merging

---

## 3. Firebase 設定

### 3.1 部署 Security Rules（本機執行一次）

```bash
cp .firebaserc.example .firebaserc
# 編輯 .firebaserc，填入 Firebase project ID

npm run firebase:deploy:rules
```

### 3.2 Authentication — 授權網域

Firebase Console → Authentication → Settings → **Authorized domains**，新增：

- `localhost`（開發用，預設已有）
- `flash.onrender.com`（Render 預設網域，依實際服務名稱調整）
- 你的自訂網域（例如 `app.example.com`）

### 3.3 Service Account（Admin SDK）

Firebase Console → Project settings → Service accounts → Generate new private key

在 Render 設定：

| 變數 | 值 |
|------|-----|
| `FIREBASE_ADMIN_CLIENT_EMAIL` | JSON 內的 `client_email` |
| `FIREBASE_ADMIN_PRIVATE_KEY` | JSON 內的 `private_key`（見下方格式說明） |

**Private Key 在 Render 的貼法：**

將多行私鑰改成單行，換行以 `\n` 表示，例如：

```
-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n
```

程式會自動將 `\\n` 轉回真實換行（見 `lib/firebase-admin.ts`）。

### 3.4 初始資料（選用，本機執行）

```bash
# .env.local 需有 SEED_ADMIN_UID、SEED_ARTIST_UID（先在 Firebase Auth 建立帳號）
npm run seed
```

---

## 4. Render 設定

### 4.1 方式 A：Blueprint（推薦）

1. [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
2. 連接 GitHub repo
3. Render 會讀取根目錄 `render.yaml`
4. 在建立流程中填入所有標記 `sync: false` 的環境變數

### 4.2 方式 B：手動建立 Web Service

| 欄位 | 值 |
|------|-----|
| Environment | Node |
| Region | Singapore（或離用戶最近的區域） |
| Branch | `main` |
| Build Command | `npm ci && npm run build` |
| Start Command | `npm start` |
| Health Check Path | `/` |

### 4.3 環境變數（完整列表）

複製 `.env.example` 所有欄位至 Render → Environment。**`NEXT_PUBLIC_*` 必須在 build 前就存在**，修改後需觸發重新部署。

| 變數 | 必填 | 說明 |
|------|------|------|
| `NEXT_PUBLIC_FIREBASE_*` | ✅ | Firebase 客戶端設定 |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | ✅ | Admin SDK |
| `FIREBASE_ADMIN_PRIVATE_KEY` | ✅ | Admin SDK 私鑰 |
| `GEMINI_API_KEY` | ✅ | AI 功能 |
| `GEMINI_MODEL` | 選填 | 預設 `gemini-2.0-flash` |
| `NEXT_PUBLIC_APP_URL` | ✅ 正式環境 | 正式網域，例如 `https://ink-flash.com`（無尾隨斜線） |
| `RESEND_API_KEY` | ✅ | Email 發送 |
| `EMAIL_FROM` | ✅ | 例如 `FLASH <hello@ink-flash.com>` |
| `STRIPE_SECRET_KEY` | 帳單功能 | Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | 帳單功能 | Stripe → Webhooks → 端點簽章密鑰 |

Render 會自動注入 `RENDER_EXTERNAL_URL`（例如 `https://flash-0r0t.onrender.com`）。在尚未綁定自訂網域前，可暫時將 `NEXT_PUBLIC_APP_URL` 設為該 URL。

**綁定自訂網域後（例如 `ink-flash.com`）必須：**

1. 將 `NEXT_PUBLIC_APP_URL` 改為 `https://ink-flash.com`（不要用 `onrender.com`）
2. 觸發 **Manual Deploy**（`NEXT_PUBLIC_*` 在 build 時嵌入，只改變數不 redeploy 不會生效）

`sitemap.xml` 與 `robots.txt` 會依請求網域產生正確 URL；但客戶端連結、OG、`metadataBase` 等仍依賴 `NEXT_PUBLIC_APP_URL`，務必設對並重新部署。

### 4.4 自訂網域

1. Render → 你的 Web Service → **Settings** → **Custom Domains**
2. 依指示在 DNS 新增 CNAME
3. 更新 `NEXT_PUBLIC_APP_URL` 為 `https://ink-flash.com`（或你的正式網域）
4. 在 Firebase Authorized domains 加入同一網域
5. 在 Resend 驗證同一網域（用於 `EMAIL_FROM`）
6. 觸發 **Manual Deploy**（必做，否則 build 仍嵌入舊的 `NEXT_PUBLIC_APP_URL`）
7. Google Search Console：重新提交 `https://ink-flash.com/sitemap.xml`，確認 `<loc>` 皆為 `ink-flash.com` 而非 `onrender.com`

### 4.5 自動部署

連接 GitHub 後，push 至 `main` 會自動 build + deploy。可在 Render 設定 **Auto-Deploy** 開關。

---

## 5. Resend Email

1. [resend.com](https://resend.com) 建立 API Key → 填入 `RESEND_API_KEY`
2. Domains → 驗證發信網域（DNS TXT / MX）
3. `EMAIL_FROM` 必須使用已驗證網域，例如 `FLASH <hello@ink-flash.com>`

未設定時，Email 相關 API 會靜默略過或記錄錯誤（見 `lib/email/send.server.ts`）。

---

## 5.1 Stripe 帳單（選用）

FLASH 採用**用量計費**：每間工作室前 30 筆成功預約免費，之後每月每筆成功預約 USD $3（無固定月費）。

### 環境變數

| 變數 | 說明 |
|------|------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys（Secret key） |
| `STRIPE_WEBHOOK_SECRET` | Webhook 端點的 Signing secret |

未設定時，`/api/webhooks/stripe` 回傳 `501`；工作室仍可使用免費額度，但無法自動扣款。

### Webhook 端點

1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL：`https://你的網域/api/webhooks/stripe`
3. 建議訂閱事件：
   - `invoice.paid` → 恢復 `billingStatus: active`
   - `invoice.payment_failed` → 設為 `past_due`
   - `customer.subscription.deleted` → 設為 `suspended`
   - `checkout.session.completed` → 綁定 `stripeCustomerId`（metadata 需含 `studioId`）

### 暫停邏輯

當 Firestore `studios.billingStatus === 'suspended'` 時：

- 工作室後台（`/dashboard` 等）會導向 `/billing`
- 工作室 API（`requireStudioAdmin` / `requireStudioProjectAccess`）回傳 403

### 待完成（TODO）

- Stripe Checkout / Customer Portal 串接（`/billing` 頁面 placeholder）
- 每月依 `completedBookingsCount` 開立 metered invoice
- `past_due` 寬限期政策

Firestore 欄位：`billingStatus`、`freeBookingsRemaining`、`completedBookingsCount`、`stripeCustomerId`、`stripeSubscriptionId`、`lastBilledMonth`。

---

## 6. 部署後驗證

- [ ] 首頁與行銷頁可開啟
- [ ] 工作室註冊 / 登入
- [ ] 客戶預約表單提交 + AI Brief 生成
- [ ] 圖片上傳（Storage）
- [ ] 訂金證明 / 術前文件簽署
- [ ] Email 驗證連結導向正確（檢查 `NEXT_PUBLIC_APP_URL`）
- [ ] 交易通知信可送達
- [ ] `https://ink-flash.com/sitemap.xml` 內所有 URL 使用自訂網域（非 `onrender.com`）
- [ ] `https://ink-flash.com/robots.txt` 的 `Sitemap:` 指向自訂網域

---

## 7. 常見問題

### Build 失敗：Firebase 相關

確認所有 `NEXT_PUBLIC_FIREBASE_*` 已在 Render 環境變數中設定，且已觸發完整 rebuild。

### 登入後被導回 localhost

`NEXT_PUBLIC_APP_URL` 未設為正式網址，或修改後未重新部署。

### 可登入 Firebase 但顯示「登入驗證失敗」

代表瀏覽器端 Firebase Auth 成功，但伺服器建立 Session 失敗（`/api/auth/session`）。

1. 開啟 `https://你的網域/api/health`  
   - `ok: false` → Firebase Admin 未正確設定  
   - `ok: true` → Admin 正常，請看 Render Logs 的 `Session creation failed`

2. 確認 Render **Runtime** 環境變數（不只是 Build）已設定：
   - `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `FIREBASE_ADMIN_PRIVATE_KEY`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`（須與 Service Account 同一專案）

3. **Private Key 正確貼法（Render 單行）：**

```
-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...(中間全部)...\n-----END PRIVATE KEY-----\n
```

從 Firebase 下載的 JSON 取 `private_key` 欄位值，原樣貼上（已含 `\n`）即可，**不要**貼整份 JSON。

4. 修改 Admin 相關變數後，在 Render 點 **Manual Deploy** 重新部署。

### Admin SDK 錯誤

檢查 `FIREBASE_ADMIN_PRIVATE_KEY` 格式（`\n` 換行）與 `client_email` 是否正確。

### Google Search Console：Sitemap「不允許的網址」

若 sitemap 出現 `https://flash-xxxx.onrender.com` 而非自訂網域：

1. Render → Environment → 設定 `NEXT_PUBLIC_APP_URL=https://ink-flash.com`
2. **Manual Deploy** 重新 build
3. 瀏覽器開啟 `https://ink-flash.com/sitemap.xml`，確認 `<loc>` 與 `hreflang` 皆為 `ink-flash.com`
4. Search Console → Sitemaps → 重新提交或等待 Google 重新抓取

部署後即使未設 `NEXT_PUBLIC_APP_URL`，透過自訂網域存取 sitemap 也會依請求 host 產生正確 URL；仍建議設好 env 並 redeploy，讓全站 metadata 一致。

### Free / Starter 方案冷啟動

Render 免費或閒置後首次請求可能較慢，可升級方案或接受冷啟動延遲。

---

## 8. 檔案對照

| 檔案 | 用途 |
|------|------|
| `render.yaml` | Render Blueprint 定義 |
| `.github/workflows/ci.yml` | GitHub CI |
| `.env.example` | 環境變數範本 |
| `.firebaserc.example` | Firebase CLI 專案 ID 範本 |
| `firestore.rules` / `storage.rules` | 需以 CLI 部署至 Firebase |
