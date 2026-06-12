import type { Project } from "@/types/project";
import {
  MOCK_ARTIST_IDS,
  MOCK_PROJECT_IDS,
  MOCK_STUDIO_ID,
  MOCK_USER_IDS,
} from "@/data/mock/ids";

const baseIntake = {
  placement: "左上臂外側",
  size: "約 10 × 8",
  sizeUnit: "cm" as const,
  style: "細線花卉",
  description: "希望以線條勾勒玫瑰與葉片，整體偏簡約，不要過度填色。",
  isCoverUp: false,
  budget: "15,000 - 20,000",
  budgetCurrency: "TWD" as const,
  availability: ["週六下午", "週日晚上"],
  notes: "第一次刺青，皮膚較敏感。",
  placementPhotoUrl: "https://placehold.co/600x400?text=Placement+Photo",
  referenceUrls: ["https://placehold.co/400x400?text=Ref+1"],
};

const sampleBrief = {
  summary:
    "左上臂細線玫瑰圖，中等複雜度，需預留皮膚質感與線條層次，適合單次 3-4 小時完成。",
  inboxSummary: "左上臂細線玫瑰，客戶要簡約線條不要過度填色",
  keyElements: ["玫瑰主花", "葉片延伸", "細線勾勒", "留白呼吸感"],
  complexity: "Medium" as const,
  riskFlags: [
    {
      level: "warning" as const,
      reason: "首次刺青且皮膚敏感，建議縮短單次操作時間並加強術後追蹤。",
    },
  ],
  managerNotes: "客戶偏好簡約，報價可落在預算中位數，建議先確認線條密度。",
  photoSizeEstimate: {
    estimatedSize: "約 9 × 7 cm",
    confidence: "Medium" as const,
    notes: "照片圈示範圍與客人自填尺寸大致相符。",
  },
};

function daysFromNow(days: number, hour = 14): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const sampleSketchRecordsV2 = [
  {
    id: "mock-sketch-v1",
    url: "https://placehold.co/500x500?text=Sketch+v1",
    uploadedAt: daysFromNow(-5, 10),
    note: "初版草圖，玫瑰主花位置與葉片延伸方向",
    sessionIndex: 1,
  },
  {
    id: "mock-sketch-v2",
    url: "https://placehold.co/500x500?text=Sketch+v2",
    uploadedAt: daysFromNow(-2, 15),
    note: "依客戶意見縮小主花、加強線條留白",
    sessionIndex: 1,
  },
] as const;

export const mockProjects: Project[] = [
  {
    projectId: MOCK_PROJECT_IDS.pendingBrief,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.main,
    clientId: MOCK_USER_IDS.client,
    status: "pending_brief",
    intakeForm: {
      ...baseIntake,
      placement: "右小腿",
      style: "幾何圖騰",
      description: "想要對稱幾何圖騰，黑白為主。",
    },
    sketches: [],
    finalPhotos: [],
    privateNotes: "",
  },
  {
    projectId: MOCK_PROJECT_IDS.quoting,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.second,
    clientId: MOCK_USER_IDS.client2,
    status: "quoting",
    intakeForm: baseIntake,
    tattooBrief: sampleBrief,
    sketches: [],
    finalPhotos: [],
    privateNotes: "客戶可接受分兩次完成，等待報價確認。",
  },
  {
    projectId: MOCK_PROJECT_IDS.pendingPayment,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.main,
    clientId: MOCK_USER_IDS.client,
    status: "pending_payment",
    intakeForm: baseIntake,
    tattooBrief: sampleBrief,
    sessionDetails: {
      sessions: 1,
      hoursPerSession: 4,
      totalPrice: 18000,
      depositRequired: 5000,
    },
    proposedTimeSlots: [
      {
        startTime: daysFromNow(7, 14),
        endTime: daysFromNow(7, 18),
      },
      {
        startTime: daysFromNow(10, 13),
        endTime: daysFromNow(10, 17),
      },
    ],
    sketchRecords: [...sampleSketchRecordsV2],
    sketches: sampleSketchRecordsV2.map((record) => record.url),
    finalPhotos: [],
    privateNotes: "已提供草圖，等待訂金。",
  },
  {
    projectId: MOCK_PROJECT_IDS.depositSubmitted,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.main,
    clientId: MOCK_USER_IDS.client2,
    status: "deposit_submitted",
    intakeForm: {
      ...baseIntake,
      placement: "右肩",
      style: "黑灰寫實",
    },
    tattooBrief: sampleBrief,
    sessionDetails: {
      sessions: 1,
      hoursPerSession: 4,
      totalPrice: 20000,
      depositRequired: 5000,
    },
    proposedTimeSlots: [],
    confirmedTimeSlot: {
      startTime: daysFromNow(5, 14),
      endTime: daysFromNow(5, 18),
    },
    depositProofUrl: "https://placehold.co/400x600?text=Deposit+Proof",
    depositSubmittedAt: new Date(),
    sketches: [],
    finalPhotos: [],
    privateNotes: "客戶已上傳訂金證明，待核對。",
  },
  {
    projectId: MOCK_PROJECT_IDS.booked,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.main,
    clientId: MOCK_USER_IDS.client2,
    status: "booked",
    intakeForm: baseIntake,
    tattooBrief: sampleBrief,
    sessionDetails: {
      sessions: 2,
      hoursPerSession: 3,
      totalPrice: 12000,
      depositRequired: 3000,
    },
    currentSessionIndex: 1,
    proposedTimeSlots: [],
    confirmedTimeSlots: [
      {
        startTime: daysFromNow(-7, 11),
        endTime: daysFromNow(-7, 14),
      },
    ],
    sessionRecords: [
      {
        sessionIndex: 1,
        confirmedTimeSlot: {
          startTime: daysFromNow(-7, 11),
          endTime: daysFromNow(-7, 14),
        },
        depositProofUrl: "https://placehold.co/400x300?text=Deposit+S1",
        depositSubmittedAt: daysFromNow(-8),
        confirmedAt: daysFromNow(-7, 10),
      },
    ],
    sketches: [],
    finalPhotos: [],
    privateNotes: "第 1 次施作已預約，待施作後上傳作品交付。",
  },
  {
    projectId: MOCK_PROJECT_IDS.bookedPreSession,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.main,
    clientId: MOCK_USER_IDS.client,
    status: "booked",
    intakeForm: baseIntake,
    tattooBrief: sampleBrief,
    sessionDetails: {
      sessions: 1,
      hoursPerSession: 4,
      totalPrice: 18000,
      depositRequired: 5000,
    },
    confirmedTimeSlot: {
      startTime: daysFromNow(3, 14),
      endTime: daysFromNow(3, 18),
    },
    confirmedTimeSlots: [
      {
        startTime: daysFromNow(3, 14),
        endTime: daysFromNow(3, 18),
      },
    ],
    preSessionDocumentRecords: [
      {
        documentId: "mock-consent-in-person",
        title: "刺青同意書",
        signatureMode: "in_person",
        status: "pending",
        isRequired: true,
      },
      {
        documentId: "mock-health-online",
        title: "健康聲明",
        signatureMode: "online_advance",
        status: "pending",
        isRequired: true,
      },
    ],
    sketchRecords: [...sampleSketchRecordsV2],
    sketches: sampleSketchRecordsV2.map((record) => record.url),
    finalPhotos: [],
    privateNotes: "預約已成立，待完成術前文件。",
  },
  {
    projectId: MOCK_PROJECT_IDS.completed,
    studioId: MOCK_STUDIO_ID,
    artistId: MOCK_ARTIST_IDS.main,
    clientId: MOCK_USER_IDS.client,
    status: "completed",
    intakeForm: baseIntake,
    tattooBrief: sampleBrief,
    sessionDetails: {
      sessions: 1,
      hoursPerSession: 3,
      totalPrice: 15000,
      depositRequired: 4000,
    },
    confirmedTimeSlot: {
      startTime: daysFromNow(-14, 13),
      endTime: daysFromNow(-14, 16),
    },
    preSessionDocumentRecords: [
      {
        documentId: "mock-consent-in-person",
        title: "刺青同意書",
        signatureMode: "in_person",
        status: "completed",
        isRequired: true,
        completedAt: daysFromNow(-15),
        completionMethod: "studio_upload",
        fileUrl: "https://placehold.co/500x700?text=Signed+Consent",
      },
      {
        documentId: "mock-health-online",
        title: "健康聲明",
        signatureMode: "online_advance",
        status: "completed",
        isRequired: true,
        completedAt: daysFromNow(-16),
        completionMethod: "client_signature",
        fileUrl: "https://placehold.co/500x200?text=Client+Signature",
        signerInfo: {
          name: "王小明",
          birthday: "1995-06-15",
          phone: "+886 912345678",
          email: "client@example.com",
        },
      },
    ],
    sketchRecords: [...sampleSketchRecordsV2],
    sketches: sampleSketchRecordsV2.map((record) => record.url),
    finalPhotos: [
      "https://placehold.co/600x600?text=Healed+1",
      "https://placehold.co/600x600?text=Healed+2",
    ],
    privateNotes: "已完成，術後回診無異狀。",
  },
];
