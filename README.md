# FLASH — Tattoo Studio SaaS

B2B2C 刺青工作室預約與專案管理系統（Next.js + Firebase + Gemini AI）。

## 本機開發

```bash
cp .env.example .env.local
# 填入 Firebase、Gemini 等設定

npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)。

## 正式部署

請參考 **[docs/DEPLOY.md](./docs/DEPLOY.md)**（GitHub、Render、Firebase、Resend 完整步驟）。

## 常用指令

| 指令 | 說明 |
|------|------|
| `npm run dev` | 開發伺服器 |
| `npm run build` | 正式建置 |
| `npm run start` | 啟動正式伺服器 |
| `npm run lint` | ESLint |
| `npm run seed` | 寫入 Firestore 測試資料（需 `.env.local`） |
| `npm run firebase:deploy:rules` | 部署 Firestore / Storage 規則 |
