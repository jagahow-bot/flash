import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "zh-Hant",
  meta: {
    title: "FLASH — 專為刺青工作室打造的智能預約與案件管理系統",
    description:
      "告別繁瑣的私訊溝通！FLASH 提供刺青師專屬的預約連結、AI 需求摘要、自動浮水印保護與雙向溝通看板。無固定月費，讓您專注於刺青創作，輕鬆管理客製化與認領圖訂單。",
    ogDescription:
      "告別繁瑣的私訊溝通！FLASH 提供刺青師專屬的預約連結、AI 需求摘要、自動浮水印保護與雙向溝通看板。",
    keywords: [
      "刺青預約",
      "刺青工作室管理",
      "刺青店系統",
      "FLASH",
      "刺青案件管理",
      "AI 智慧摘要",
      "刺青預約管理系統",
      "多國語言預約",
    ],
  },
  header: {
    home: "首頁",
    login: "登入",
    myProjects: "我的預約",
    studioRegister: "註冊工作室",
    studioDashboard: "工作室後台",
    language: "語言",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "刺青工作室專用",
    brand: "FLASH",
    heading: "刺青預約系統與案件管理",
    subtitle: "每一個點線面的勾勒，都值得你付出百分之百的專注。",
    description: "",
    ctaLogin: "登入",
    ctaRegisterStudio: "註冊工作室",
  },
  about: {
    title: "為什麼全台刺青師都在用 FLASH 預約管理系統？",
    paragraphs: [
      "每一個點線面的勾勒，都值得你付出百分之百的專注。但現實是，回覆私訊和管理預約，往往佔據了你大半的精力。",
      "FLASH 的誕生，就是為了解放刺青師的雙手。我們把「詢問需求、預約排班、圖稿防護」等繁雜的店務瑣事全部自動化。",
      "不需要再為了沒收到客人的尺寸而卡關，也不用在多個社群軟體切換找紀錄。讓多餘的溝通歸零，把最有價值的時間，留給下一個即將誕生的完美作品。",
    ],
  },
  productShowcase: {
    title: "看看 FLASH 實際運作",
    subtitle: "工作室後台與客端專案頁——雙視角同步，各走各的也能對上進度",
    studioTitle: "工作室後台",
    studioDescription:
      "待辦信箱、行程日曆與案件狀態——一個畫面掌握全店營運",
    studioAlt: "FLASH 工作室後台儀表板，顯示待辦案件與近期行程",
    clientTitle: "客端專案頁",
    clientDescription:
      "報價確認、時段選擇與圖稿進度——客人打開連結就知道下一步",
    clientProgressAlt: "FLASH 客端專案頁報價階段畫面",
    clientArtworkAlt: "FLASH 客端專案頁圖稿與進度時間軸",
  },
  features: {
    title: "自動化店務管理，替刺青工作室省下 80% 的通訊時間",
    subtitle: "",
    items: [
      {
        title: "AI 智慧摘要：精準捕捉客人紋身需求",
        schemaName: "AI 智慧摘要",
        description:
          "客人填完需求，AI 自動整理成重點摘要，複雜度與風險一目了然，報價前先心裡有數。",
      },
      {
        title: "多國語言支援：輕鬆承接國外旅客訂單",
        schemaName: "多國語言支援",
        description:
          "十國語言介面，國外旅客也能輕鬆預約，溝通零障礙，輕鬆承接國際訂單。",
      },
      {
        title: "獨立雙向看板：草圖修改紀錄不遺漏",
        schemaName: "獨立雙向看板",
        description:
          "客端與工作室各自專屬視圖，草圖修改紀錄完整保留，再也不怕訊息淹沒在私訊裡。",
      },
      {
        title: "自動智慧浮水印：全方位保護原創手稿",
        schemaName: "自動智慧浮水印",
        description:
          "上傳即自動加上浮水印，全方位保護原創手稿，防止截圖外流。",
      },
    ],
  },
  howItWorks: {
    title: "從初次諮詢到簽署同意書：最流暢的刺青預約流程",
    subtitle: "客人跟工作室各走各的，\n進度會同步",
    clientTitle: "顧客端：清晰引導、輕鬆填寫",
    clientSteps: [
      {
        title: "打開預約連結",
        description: "你想要的刺青有想法了嗎",
      },
      {
        title: "把想法說清楚",
        description: "圖案、位置、預算——用說的就好，照片也一起給",
      },
      {
        title: "等報價、挑時間",
        description: "價格出來了自己選時段，訂金照指示付就好",
      },
      {
        title: "隨時知道進展",
        description: "不用再問「有更新了嗎」——打開就看得到",
      },
    ],
    studioTitle: "工作室端：一目了然、數位歸檔",
    studioSteps: [
      {
        title: "先把店開起來",
        description: "註冊完把店的基本資料填好，就能分享預約連結",
      },
      {
        title: "看新案子、決定接不接",
        description: "客人送來的需求一目了然，確認後給報價",
      },
      {
        title: "約時間、收訂金",
        description: "你排出有空的日子，客人選好、付好，預約就成立",
      },
      {
        title: "一次畫不完的也管得住",
        description: "每一趟什麼時候，一清二楚",
      },
    ],
  },
  pricing: {
    title: "真正挺刺青師的彈性收費：免固定月費、有案才計價",
    subtitle: "沒有固定月費——只有透過 FLASH 成功預約時才需付費。",
    pricePerBooking: "每月每筆成功預約 USD $3",
    noMonthlyFee: "無固定月費",
    freeTier: "每間工作室前 30 筆預約免費",
    footnote:
      "帳單依工作室當月成功預約筆數計算。多次施作的專案在確認預約時計為一筆。",
  },
  faq: {
    title: "關於 FLASH 刺青管理軟體的常見問題",
    subtitle: "刺青店常問的，白話回答",
    items: [
      {
        question: "FLASH 適合誰用？",
        answer:
          "你是刺青師或店長——想少漏單、流程清楚就用它。\n你是客人——想預約、自己查進度也用它。",
      },
      {
        question: "要畫好幾次的大圖怎麼管？",
        answer:
          "一個案子裡能排好幾趟，每一趟都會記錄下來。\n你跟客人都看得清楚第幾次、下次什麼時候。",
      },
      {
        question: "系統怎麼整理客人需求？",
        answer:
          "客人送完需求，幫你整理成重點摘要。\n複雜不複雜、蓋圖有沒有風險，打開就大概知道要不要接。",
      },
      {
        question: "客人怎麼預約？訂金怎麼收？",
        answer:
          "客人從你的預約連結開案，報價出來後自己挑時間、付訂金。\n你確認收到了，預約就成立。",
      },
      {
        question: "後台可以幹嘛？",
        answer:
          "先看還沒處理的案子和還沒對到的訂金，再看近期行程。\n今天該做什麼，打開就懂。",
      },
      {
        question: "跟一般預約軟體差在哪？",
        answer:
          "一般預約軟體多半只管訂一個時段。\n刺青還得管需求、訂金、好幾趟——FLASH 就是為這些設計的。",
      },
      {
        question: "蓋圖的案子可以接嗎？",
        answer:
          "可以接。客人能標示蓋圖，有風險的會提醒你。\n你也可以事先寫明接不接，省得白聊。",
      },
      {
        question: "工作室可以上架認領圖嗎？",
        answer:
          "可以。在後台設定的認領圖管理裡上傳圖案——可設統一價格，也可為每張圖個別定價，並設定客人可選的尺寸。\n預約頁上客人可瀏覽認領圖目錄，或改走客製化刺青流程。",
      },
      {
        question: "一定要裝 App 才能用嗎？",
        answer:
          "不用。客人跟工作室都用瀏覽器開連結就行，手機電腦都可以。",
      },
      {
        question: "訂金對不起來怎麼辦？",
        answer:
          "誰付了多少都有紀錄，後台會標出還沒對到的訂金，不用再翻私訊對帳。",
      },
      {
        question: "刺青要分好幾次，客人會搞混嗎？",
        answer:
          "一個案子裡每一趟都清楚標示，客人自己打開連結就知道第幾次、下次什麼時候。",
      },
    ],
  },
  cta: {
    title: "想少漏單、少回重複訊息？",
    description:
      "想預約就打開連結；\n想把案子管好，現在就能註冊。",
    loginButton: "登入",
    studioButton: "註冊工作室",
  },
  footer: {
    tagline: "刺青工作室預約與案件管理",
    product: "產品",
    account: "帳號",
    legal: "法律",
    login: "登入",
    myProjects: "我的預約",
    studioRegister: "註冊工作室",
    privacyPolicy: "隱私權政策",
    termsOfService: "服務條款",
    blog: "刺青工作室指南",
    rights: "保留所有權利。",
    contactSupportPrefix: "有任何問題請寄信詢問 ",
  },
  legal: {
    privacy: {
      metaTitle: "隱私權政策",
      metaDescription:
        "了解 FLASH 如何在 ink-flash.com 收集、使用與保護您的個人資料。",
    },
    terms: {
      metaTitle: "服務條款",
      metaDescription: "使用 FLASH 刺青工作室管理平台的條款與條件。",
    },
  },
  blog: {
    metaTitle: "刺青工作室指南｜FLASH",
    metaDescription:
      "版權保護、法律防線與工作室營運實務，專為刺青師與工作室主理人撰寫。",
    title: "刺青工作室指南",
    description:
      "版權保護、法律防線與工作室營運實務，幫助刺青師建立更安全的創作與預約流程。",
    backToBlog: "返回文章列表",
    readMore: "閱讀全文",
    categories: {
      ipProtection: "版權保護",
      legalSafeguards: "法律防線",
      globalMarketing: "國際行銷",
    },
  },
};

export default dictionary;
