import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "zh-Hant",
  meta: {
    title: "FLASH — 刺青工作室預約與案件管理",
    description:
      "刺青工作室預約系統：少漏單、少回重複訊息。集中管理需求、報價排程、訂金與多次預約。",
    keywords: [
      "刺青預約",
      "刺青工作室管理",
      "刺青店系統",
      "FLASH",
      "刺青訂金",
      "多次刺青預約",
      "刺青案件管理",
      "刺青客戶管理",
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
    heading: "刺青工作室預約與案件管理",
    subtitle: "少漏單、少回重複訊息，\n讓你專心刺青",
    description:
      "不用在私訊裡從頭問到尾，\n你跟客人都知道下一步該做什麼。",
    ctaLogin: "登入",
    ctaRegisterStudio: "註冊工作室",
  },
  about: {
    title: "FLASH 是什麼？",
    paragraphs: [
      "專為刺青工作室打造的預約系統：後台管案子，客人填需求、查進度，各走各的，資料同步。",
      "你是不是也遇過：客人需求講一半、訂金對不上帳、畫好幾次搞混第幾趟、一直問進度？\nFLASH 把這些弄在同一個地方：從接需求、報價排程、收訂金到多次預約，流程清楚有紀錄。",
      "客人用連結就能開案，你想處理的時候打開後台就好。",
    ],
  },
  features: {
    title: "幫工作室省時間的事",
    subtitle: "最怕的那些漏單環節，\n不想只靠記憶硬撐",
    items: [
      {
        title: "聽懂客人在說什麼",
        schemaName: "AI 需求整理",
        description:
          "講不清楚的需求，打開就有重點，\n報價前先心裡有數。",
      },
      {
        title: "報價不用再喬半天",
        schemaName: "報價與排程",
        description:
          "新案子集中看，挑好時間送出去，\n客人自己選，你專心畫圖。",
      },
      {
        title: "訂金對得起來",
        schemaName: "訂金管理",
        description:
          "誰轉了、轉多少都有紀錄，\n不用再翻對話紀錄對帳。",
      },
      {
        title: "客製化 vs 認領圖",
        schemaName: "客製化與認領圖預約",
        description:
          "不管是客製化討論、還是認領圖挑選，\n你跟客人都能輕鬆準備下次的刺青施作。",
      },
    ],
  },
  howItWorks: {
    title: "怎麼用",
    subtitle: "客人跟工作室各走各的，\n進度會同步",
    clientTitle: "客人這邊",
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
    studioTitle: "工作室這邊",
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
    title: "簡單的用量計價",
    subtitle: "沒有固定月費——只有透過 FLASH 成功預約時才需付費。",
    pricePerBooking: "每月每筆成功預約 USD $3",
    noMonthlyFee: "無固定月費",
    freeTier: "每間工作室前 30 筆預約免費",
    footnote:
      "帳單依工作室當月成功預約筆數計算。多次 Session 的專案在確認預約時計為一筆。",
  },
  faq: {
    title: "常見問題",
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
};

export default dictionary;
