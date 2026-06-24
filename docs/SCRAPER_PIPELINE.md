# 爬蟲 → FLASH → Cold Outreach 流程

本文件說明如何將 **yoga-scraper** 爬到的工作室資料匯入 **FLASH** 體驗工作室，再寫入 cold outreach 名單並寄信。

## 架構概覽

```
yoga-scraper (爬蟲 + 內容豐富化)
    │
    ▼  *_tattoo_leads.csv（含官網內文、FB簡介、IG、作品圖等）
csv-to-scraped-json.js
    │
    ▼  data/scraped/*.json
enrich-studio-ai.js  ──POST /api/platform/enrich-studio──► Gemini 萃取（含 artistNames）
    │
    ▼  data/scraped-enriched/studios.json
import-flash-prospects.js
    │
    ▼  POST /api/platform/prospect-studios
FLASH (體驗工作室 + claim token)
    │
    ├─► data/flash-prospects.json（匯入紀錄）
    └─► cold-outreach/data/studios_pool.json（待寄名單）
            │
            ▼  npm run cold-outreach
        Resend 寄信（模板含 {{claimUrl}}）
```

## FLASH 端設定

在 `.env.local` 設定：

```env
GEMINI_API_KEY=your-gemini-api-key
PLATFORM_IMPORT_API_KEY=your-long-random-secret
NEXT_PUBLIC_APP_URL=https://ink-flash.com
PREVIEW_JWT_SECRET=your-preview-jwt-secret
RESEND_API_KEY=re_xxxx
EMAIL_FROM=FLASH <hello@ink-flash.com>
```

- `GEMINI_API_KEY`：`POST /api/platform/enrich-studio` 使用（yoga-scraper 透過此 API 萃取，不需在本機設定 Gemini）
- 平台管理員仍可用瀏覽器登入 `/platform` 手動建立或上傳 JSON 批次匯入
- 腳本匯入時在 request header 帶入 `x-platform-import-key`

## API：`POST /api/platform/prospect-studios`

授權方式（二擇一）：

1. 已登入的平台管理員 session
2. `x-platform-import-key: <PLATFORM_IMPORT_API_KEY>` 或 `Authorization: Bearer <key>`

請求範例：

```json
{
  "email": "studio@example.com",
  "name": "墨痕刺青",
  "slug": "mohen-tattoo",
  "bio": "台南專業刺青工作室",
  "country": "tw",
  "instagram": "mohen_tattoo",
  "facebook": "https://facebook.com/mohen",
  "logoUrl": "https://example.com/logo.jpg",
  "flashImageUrls": [
    "https://example.com/flash1.jpg",
    "https://example.com/flash2.jpg"
  ],
  "sendEmail": false
}
```

回應：

```json
{
  "studioId": "...",
  "slug": "mohen-tattoo",
  "claimUrl": "https://ink-flash.com/claim?token=...",
  "storefrontUrl": "https://ink-flash.com/mohen-tattoo",
  "status": "pending_activation",
  "demoProjectIds": ["..."],
  "emailQueued": false
}
```

行為說明：

- `logoUrl`、`flashImageUrls` 會 best-effort 下載並上傳至 Firebase Storage；失敗時保留外部 URL
- 有 `flashImageUrls` 時以爬蟲圖片取代預設 demo flash；仍會種入 3 筆 demo 預約單
- `country` 會對應 `preferredLocale`（例如 `tw` → `zh-Hant`）
- 未提供 `slug` 時由名稱自動產生
- `artistNames` 會寫入 `prospectArtistNames`；預覽後台與 demo 預約單會顯示刺青師名稱

## API：`POST /api/platform/enrich-studio`

將爬蟲 **raw bundle** 送交 Gemini 結構化萃取（需 FLASH `.env.local` 的 `GEMINI_API_KEY`）。

授權與 `prospect-studios` 相同。

回應含 `profile.artistNames`、`profile.bio`、`profile.flashImageUrls` 等。

yoga-scraper：

```bash
# CSV（選用）
npm run csv-to-scraped -- tainan_tattoo_leads.csv
# AI 萃取 → 匯入
npm run enrich-studios
npm run import-flash
npm run cold-outreach
```

## 平台 UI

`/platform` → **匯入爬蟲名單**：上傳 JSON 陣列，批次建立後可匯出 `flash-prospects.json`。

## 與 yoga-scraper 串接

詳見 yoga-scraper 專案：

- `schemas/scraped-studio.schema.json`
- `cold-outreach/import-flash-prospects.js`
- `cold-outreach/README.md`

完整指令見 yoga-scraper `README.md` 的「爬蟲 → FLASH → 寄信」章節。
