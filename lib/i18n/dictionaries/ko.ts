import type { LandingDictionary } from "@/lib/i18n/types";

const dictionary: LandingDictionary = {
  locale: "ko",
  meta: {
    title: "FLASH — 타투 스튜디오를 위한 스마트 예약 및 고객 관리 시스템",
    description:
      "복잡한 SNS 메시지 관리에서 벗어나세요! FLASH는 타투이스트 전용 예약 링크, AI 요구사항 요약, 자동 워터마크 보호, 양방향 대화 보드를 제공합니다. 고정 월회비 없음—오직 창작에만 집중하며 커스텀 도안과 플래시 예약을 손쉽게 관리하세요.",
    ogDescription:
      "복잡한 SNS 메시지 관리에서 벗어나세요! FLASH는 타투이스트 전용 예약 링크, AI 요약, 자동 워터마크, 양방향 대화 보드를 제공합니다.",
    keywords: [
      "타투 예약",
      "타투 스튜디오 관리",
      "타투샵 시스템",
      "FLASH",
      "타투 고객 관리",
      "AI 스마트 요약",
      "타투 예약 관리 시스템",
      "다국어 예약",
    ],
  },
  header: {
    home: "홈",
    login: "로그인",
    myProjects: "내 예약",
    studioRegister: "스튜디오 등록",
    studioDashboard: "스튜디오 대시보드",
    language: "언어",
    switchToEn: "English",
    switchToZh: "繁體中文",
  },
  hero: {
    eyebrow: "타투 스튜디오 전용",
    brand: "FLASH",
    heading: "타투 스튜디오 예약 및 고객 관리",
    subtitle: "선 하나, 점 하나, 모든 명암의 표현에 100% 집중해야 합니다.",
    description: "",
    ctaLogin: "로그인",
    ctaRegisterStudio: "스튜디오 등록",
  },
  about: {
    title: "왜 많은 타투이스트들이 FLASH 예약 관리 시스템을 선택할까요?",
    paragraphs: [
      "선 하나, 점 하나, 모든 명암의 표현에 100% 집중해야 합니다. 하지만 현실은 DM 답장과 예약 관리에 대부분의 에너지를 빼앗기곤 합니다.",
      "FLASH는 타투이스트의 손을 자유롭게 하기 위해 태어났습니다. '요구사항 파악, 일정 조율, 도안 보호' 등 번거로운 스튜디오 업무를 모두 자동화합니다.",
      "고객의 사이즈 답변을 기다리며 멈출 필요도, 여러 SNS를 넘나들며 기록을 찾을 필요도 없습니다. 불필요한 소통을 제로로 만들고, 가장 가치 있는 시간을 다음에 탄생할 완벽한 작품에 투자하세요.",
    ],
  },
  productShowcase: {
    title: "FLASH 실제 화면 보기",
    subtitle:
      "스튜디오 대시보드와 고객 프로젝트 페이지——각자의 화면에서 진행 상황이 동기화됩니다",
    studioTitle: "스튜디오 대시보드",
    studioDescription:
      "할 일 받은편지함, 캘린더, 프로젝트 상태——한 화면에서 스튜디오 전체 운영",
    studioAlt:
      "FLASH 스튜디오 대시보드. 대기 중인 프로젝트와 다가오는 일정 표시",
    clientTitle: "고객 프로젝트 페이지",
    clientDescription:
      "견적 확인, 시간대 선택, 도안 진행 상황——링크를 열면 다음 단계를 바로 확인",
    clientProgressAlt: "FLASH 고객 프로젝트 페이지 견적 단계 화면",
    clientArtworkAlt:
      "FLASH 고객 프로젝트 페이지 도안 및 진행 타임라인",
  },
  features: {
    title: "자동화된 스튜디오 관리, 소통 시간 80% 절감",
    subtitle: "",
    items: [
      {
        title: "AI 스마트 요약: 고객의 타투 요구사항을 정확하게 파악",
        schemaName: "AI 스마트 요약",
        description:
          "고객이 요청을 제출하면 AI가 핵심을 자동 정리합니다. 복잡도와 리스크를 한눈에 파악하고 견적 전에 판단할 수 있습니다.",
      },
      {
        title: "다국어 지원: 해외 여행객의 예약도 간편하게 수락",
        schemaName: "다국어 지원",
        description:
          "10개 언어 인터페이스로 해외 여행객도 쉽게 예약할 수 있습니다. 소통 장벽을 제로로 만듭니다.",
      },
      {
        title: "독립형 양방향 보드: 도안 수정 기록 유실 방지",
        schemaName: "독립형 양방향 보드",
        description:
          "고객과 스튜디오 각각 전용 뷰로 도안 수정 기록을 완벽하게 보존합니다. DM에 묻히는 걱정이 없습니다.",
      },
      {
        title: "자동 스마트 워터마크: 소중한 오리지널 도안을 전방위 보호",
        schemaName: "자동 스마트 워터마크",
        description:
          "업로드 시 자동으로 워터마크를 적용해 오리지널 도안을 스크린샷 유출로부터 전방위 보호합니다.",
      },
    ],
  },
  howItWorks: {
    title: "첫 상담부터 동의서까지: 가장 매끄러운 타투 예약 흐름",
    subtitle: "고객과 스튜디오는 각자의 흐름으로,\n진행 상황은 동기화됩니다",
    clientTitle: "고객 측: 명확한 안내, 쉬운 작성",
    clientSteps: [
      {
        title: "예약 링크 열기",
        description: "원하는 타투, 아이디어 있으신가요?",
      },
      {
        title: "아이디어를 전달해요",
        description: "도안, 위치, 예산——말로 전하면 되고, 사진도 함께 주세요",
      },
      {
        title: "견적을 기다리고, 시간을 골라요",
        description: "가격이 나오면 시간대를 고르고, 안내에 따라 보증금을 내면 됩니다",
      },
      {
        title: "언제든 진행 상황을 알 수 있어요",
        description: "\"진행 어떻게 됐어요?\" 물어볼 필요 없이——열어보면 됩니다",
      },
    ],
    studioTitle: "스튜디오 측: 한눈에 파악, 디지털 보관",
    studioSteps: [
      {
        title: "먼저 샵을 열어요",
        description: "등록하고 기본 정보를 입력하면, 예약 링크를 공유할 수 있습니다",
      },
      {
        title: "새 프로젝트를 보고, 받을지 결정해요",
        description: "고객 요청이 한눈에 보입니다. 확인한 뒤 견적을 내세요",
      },
      {
        title: "시간을 잡고, 보증금을 받아요",
        description: "가능한 날을 내면, 고객이 고르고 결제하면 예약이 성립됩니다",
      },
      {
        title: "여러 번에 걸친 작품도 관리할 수 있어요",
        description: "각 회차가 언제인지——명확하게 알 수 있습니다",
      },
    ],
  },
  pricing: {
    title: "타투이스트를 위한 유연한 요금: 월정액 없음, 건별 과금",
    subtitle:
      "고정 월 요금 없음 — FLASH로 예약이 성공했을 때만 비용이 발생합니다.",
    pricePerBooking: "매월 성공한 예약 건당 USD $3",
    noMonthlyFee: "고정 월 요금 없음",
    freeTier: "스튜디오당 첫 30건 예약 무료",
    footnote:
      "청구는 스튜디오의 해당 월 성공 예약 건수를 기준으로 합니다. 여러 세션 프로젝트도 예약 확정 시 1건으로 집계됩니다.",
  },
  faq: {
    title: "FLASH 타투 관리 소프트웨어에 관한 자주 묻는 질문",
    subtitle: "타투샵이 자주 묻는 것, 쉬운 답변",
    items: [
      {
        question: "FLASH는 누구를 위한 건가요?",
        answer:
          "아티스트나 원장이라면——누락을 줄이고 흐름을 명확하게 하고 싶을 때.\n고객이라면——예약하고 직접 진행 상황을 확인하고 싶을 때.",
      },
      {
        question: "여러 번 시술하는 큰 작품은 어떻게 관리하나요?",
        answer:
          "하나의 프로젝트에 여러 회차를 잡을 수 있고, 각 회차가 기록됩니다.\n몇 번째인지, 다음은 언제인지——당신과 고객 모두 명확하게 알 수 있습니다.",
      },
      {
        question: "고객 요청은 어떻게 정리되나요?",
        answer:
          "고객이 제출하면 핵심이 정리된 요약이 만들어집니다.\n복잡도, 커버업 위험——열어보면 받을지 판단할 수 있습니다.",
      },
      {
        question: "고객은 어떻게 예약하고 보증금은 어떻게 내나요?",
        answer:
          "고객은 예약 링크로 프로젝트를 시작하고, 견적 후 시간을 고르고 보증금을 냅니다.\n입금을 확인하면 예약이 성립됩니다.",
      },
      {
        question: "백오피스에서 뭘 할 수 있나요?",
        answer:
          "먼저 처리할 프로젝트와 맞지 않은 보증금을 확인하고, 다가오는 일정을 봅니다.\n열어보면 오늘 뭘 해야 할지 바로 알 수 있습니다.",
      },
      {
        question: "일반 예약 소프트웨어와 뭐가 다른가요?",
        answer:
          "일반 예약 소프트웨어는 대부분 한 시간 예약만 다룹니다.\n타투샵은 요청, 보증금, 여러 번 시술도 관리해야 합니다——FLASH는 그걸 위해 만들었습니다.",
      },
      {
        question: "커버업 프로젝트도 받을 수 있나요?",
        answer:
          "받을 수 있습니다. 고객이 커버업을 표시할 수 있고, 위험한 경우 알려줍니다.\n미리 받는지 여부를 적어두면, 쓸데없는 대화를 줄일 수 있습니다.",
      },
      {
        question: "스튜디오에서 플래시 타투를 올릴 수 있나요?",
        answer:
          "네. 대시보드 설정의 플래시 관리에서 디자인을 업로드할 수 있습니다——통일 가격 또는 디자인별 가격을 설정하고, 고객이 고를 수 있는 사이즈를 정합니다.\n예약 페이지에서는 플래시 카탈로그에서 고르거나 맞춤 타투 상담으로 전환할 수 있습니다.",
      },
      {
        question: "앱을 설치해야 하나요?",
        answer:
          "아니요. 고객과 스튜디오 모두 브라우저에서 링크를 열면 됩니다. 휴대폰이든 PC든 상관없어요.",
      },
      {
        question: "보증금이 장부와 안 맞으면 어떻게 하나요?",
        answer:
          "누가 얼마를 냈는지 기록되고, 아직 맞지 않은 보증금은 백오피스에서 표시됩니다. DM을 뒤져서 대조할 필요 없어요.",
      },
      {
        question: "여러 번 시술할 때 고객이 헷갈리지 않나요?",
        answer:
          "하나의 프로젝트에서 각 회차가 명확히 표시됩니다. 고객이 링크를 열면 몇 번째인지, 다음은 언제인지 바로 알 수 있습니다.",
      },
    ],
  },
  cta: {
    title: "누락과 반복 메시지를 줄이고 싶으신가요?",
    description:
      "예약하고 싶다면 링크를 여세요.\n프로젝트를 제대로 관리하고 싶다면, 지금 등록하세요.",
    loginButton: "로그인",
    studioButton: "스튜디오 등록",
  },
  footer: {
    tagline: "타투 스튜디오 예약 및 프로젝트 관리",
    product: "제품",
    account: "계정",
    legal: "법적 고지",
    login: "로그인",
    myProjects: "내 예약",
    studioRegister: "스튜디오 등록",
    privacyPolicy: "개인정보 처리방침",
    termsOfService: "서비스 약관",
    blog: "스튜디오 가이드",
    rights: "All rights reserved.",
    contactSupportPrefix: "문의 사항은 ",
    contactSupportSuffix: " 으로 보내주세요",
  },
  legal: {
    privacy: {
      metaTitle: "개인정보 처리방침",
      metaDescription:
        "FLASH가 ink-flash.com에서 개인정보를 수집·이용·보호하는 방법을 설명합니다.",
    },
    terms: {
      metaTitle: "서비스 약관",
      metaDescription: "FLASH 타투 스튜디오 관리 플랫폼 이용 약관.",
    },
  },
  blog: {
    metaTitle: "타투 스튜디오 가이드 | FLASH",
    metaDescription:
      "저작권 보호, 법적 리스크 관리, 스튜디오 운영 실무를 다룬 타투이스트 전용 아티클.",
    title: "타투 스튜디오 가이드",
    description:
      "저작권 보호와 법적 방어선 등, 더 안전한 스튜디오 운영을 위한 실무 가이드입니다.",
    backToBlog: "글 목록으로",
    readMore: "전체 읽기",
    categories: {
      ipProtection: "저작권 보호",
      legalSafeguards: "법적 방어선",
      globalMarketing: "글로벌 마케팅",
    },
  },
};

export default dictionary;
