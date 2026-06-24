import { COLLECTIONS } from "@/lib/firestore/collections";
import { projectToFirestore } from "@/lib/firestore/serializers";
import { getAdminDb } from "@/lib/firebase-admin";
import { allocateBookingNumber } from "@/lib/project/booking-number.server";
import { DEMO_CLIENT_NAMES, DEMO_INBOX_SUMMARIES } from "@/lib/studio/demo-client-names";
import { DEMO_SEED_ASSETS, demoAssetUrl, demoAssetUrls } from "@/lib/studio/demo-assets";
import { pickProspectArtistId } from "@/lib/studio/prospect-artists";
import type { Project } from "@/types/project";
import type { Studio } from "@/types/studio";
import type { TattooBrief } from "@/types/tattoo-brief";

function daysFromNow(days: number, hour = 14): Date {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 0, 0, 0);
  return date;
}

const DEMO_BRIEFS: [TattooBrief, TattooBrief, TattooBrief] = [
  {
    summary:
      "Fine-line floral on outer forearm, medium complexity — single 3–4h session recommended.",
    inboxSummary: DEMO_INBOX_SUMMARIES["demo-client-1"],
    keyElements: ["rose focal", "leaf extensions", "fine lines", "breathing room"],
    complexity: "Medium",
    riskFlags: [
      {
        level: "warning",
        reason: "First tattoo — suggest a shorter session and an extra aftercare check-in.",
      },
    ],
    managerNotes: "Client prefers minimal shading; quote mid-range of budget.",
    photoSizeEstimate: {
      estimatedSize: "~9 × 7 cm",
      confidence: "Medium",
      notes: "Marked area on placement photo matches stated size.",
    },
  },
  {
    summary:
      "Neo-traditional panther flash on upper arm, medium complexity — fits a focused 3–4h session.",
    inboxSummary: DEMO_INBOX_SUMMARIES["demo-client-2"],
    keyElements: ["panther head", "bold outlines", "grey shading", "classic flash read"],
    complexity: "Medium",
    riskFlags: [],
    managerNotes: "Flash is pre-approved; confirm exact scale on upper arm before deposit.",
  },
  {
    summary:
      "Neo-traditional koi back piece, high complexity — likely 2 sessions.",
    inboxSummary: DEMO_INBOX_SUMMARIES["demo-client-3"],
    keyElements: ["koi body flow", "wave background", "red accents", "scale detail"],
    complexity: "High",
    riskFlags: [
      {
        level: "warning",
        reason: "Large color work — schedule hydration breaks; patch test if sensitive skin.",
      },
    ],
    managerNotes: "Deposit required before locking the weekend slot.",
    photoSizeEstimate: {
      estimatedSize: "~18 × 12 cm",
      confidence: "Medium",
      notes: "Back placement allows room for the wave background.",
    },
  },
];

async function persistDemoProject(project: Project): Promise<void> {
  await getAdminDb()
    .collection(COLLECTIONS.projects)
    .doc(project.projectId)
    .set(projectToFirestore(project));
}

/** Seed three English demo bookings in quoting, pending_payment, and booked states. */
export async function seedDemoProjectsForStudio(studio: Studio): Promise<Project[]> {
  const [id1, id2, id3] = await Promise.all([
    allocateBookingNumber(studio),
    allocateBookingNumber(studio),
    allocateBookingNumber(studio),
  ]);

  const demoClientPrefix = "demo-client";

  const quotingProject: Project = {
    projectId: id1,
    studioId: studio.studioId,
    artistId: pickProspectArtistId(studio, 0),
    clientId: `${demoClientPrefix}-1`,
    status: "quoting",
    intakeForm: {
      placement: "outer left forearm",
      size: "~4 × 3 in",
      sizeUnit: "cm",
      style: "fine-line floral",
      description:
        "Fine-line rose and leaves with minimal shading and airy negative space.",
      isCoverUp: false,
      budget: "USD 400–600",
      budgetCurrency: "USD",
      availability: ["Sat afternoon", "Sun evening"],
      notes: "Demo booking for preview — first tattoo, prefers light touch.",
      placementPhotoUrl: demoAssetUrl(DEMO_SEED_ASSETS.placement.forearm),
      referenceUrls: demoAssetUrls([
        DEMO_SEED_ASSETS.references.floralRose,
        DEMO_SEED_ASSETS.references.floralLeaves,
      ]),
      socialContacts: {
        clientName: DEMO_CLIENT_NAMES[`${demoClientPrefix}-1`],
      },
    },
    tattooBrief: DEMO_BRIEFS[0],
    sketches: [],
    finalPhotos: [],
    privateNotes: "Demo: new inquiry with AI brief ready for quoting.",
  };

  const pendingPaymentProject: Project = {
    projectId: id2,
    studioId: studio.studioId,
    artistId: pickProspectArtistId(studio, 1),
    clientId: `${demoClientPrefix}-2`,
    status: "pending_payment",
    intakeForm: {
      placement: "upper outer right arm",
      size: "~5 × 4 in",
      sizeUnit: "cm",
      style: "neo-traditional panther flash",
      description:
        "Classic crawling panther flash, bold black outlines with grey shading — palm to fist size.",
      isCoverUp: false,
      budget: "USD 350–500",
      budgetCurrency: "USD",
      availability: ["Fri evening", "Sat morning"],
      notes: "Demo booking — client chose shop flash, ready to lock a slot after deposit.",
      placementPhotoUrl: demoAssetUrl(DEMO_SEED_ASSETS.placement.upperArm),
      referenceUrls: demoAssetUrls([
        DEMO_SEED_ASSETS.references.pantherFlash,
        DEMO_SEED_ASSETS.references.pantherDetail,
      ]),
      socialContacts: {
        clientName: DEMO_CLIENT_NAMES[`${demoClientPrefix}-2`],
      },
    },
    tattooBrief: DEMO_BRIEFS[1],
    sessionDetails: {
      sessions: 1,
      hoursPerSession: 3.5,
      totalPrice: 420,
      depositRequired: 100,
    },
    proposedTimeSlots: [
      {
        startTime: daysFromNow(7, 14),
        endTime: daysFromNow(7, 17),
      },
      {
        startTime: daysFromNow(10, 13),
        endTime: daysFromNow(10, 16),
      },
      {
        startTime: daysFromNow(14, 11),
        endTime: daysFromNow(14, 14),
      },
    ],
    depositDeadlineAt: daysFromNow(5, 23),
    sketches: demoAssetUrls([
      DEMO_SEED_ASSETS.sketches.pantherV1,
      DEMO_SEED_ASSETS.sketches.pantherV2,
    ]),
    sketchRecords: [
      {
        id: "demo-sketch-1",
        url: demoAssetUrl(DEMO_SEED_ASSETS.sketches.pantherV1),
        uploadedAt: daysFromNow(-3, 11),
        note: "Panther scale layout draft",
        sessionIndex: 1,
      },
      {
        id: "demo-sketch-2",
        url: demoAssetUrl(DEMO_SEED_ASSETS.sketches.pantherV2),
        uploadedAt: daysFromNow(-1, 16),
        note: "Refined outline and shading plan",
        sessionIndex: 1,
      },
    ],
    finalPhotos: [],
    privateNotes: "Demo: quote sent, awaiting deposit.",
  };

  const bookedProject: Project = {
    projectId: id3,
    studioId: studio.studioId,
    artistId: pickProspectArtistId(studio, 2),
    clientId: `${demoClientPrefix}-3`,
    status: "booked",
    intakeForm: {
      placement: "upper back / shoulder blade",
      size: "~7 × 5 in",
      sizeUnit: "cm",
      style: "neo-traditional koi",
      description:
        "Colorful koi with Japanese wave background — bold outlines and saturated reds.",
      isCoverUp: false,
      budget: "USD 800–1,200",
      budgetCurrency: "USD",
      availability: ["Weekend afternoons"],
      notes: "Demo booking — two-session color piece, deposit received.",
      placementPhotoUrl: demoAssetUrl(DEMO_SEED_ASSETS.placement.upperBack),
      referenceUrls: demoAssetUrls([
        DEMO_SEED_ASSETS.references.koiDesign,
        DEMO_SEED_ASSETS.references.koiWaves,
      ]),
      socialContacts: {
        clientName: DEMO_CLIENT_NAMES[`${demoClientPrefix}-3`],
      },
    },
    tattooBrief: DEMO_BRIEFS[2],
    sessionDetails: {
      sessions: 2,
      hoursPerSession: 4,
      totalPrice: 950,
      depositRequired: 200,
    },
    confirmedTimeSlot: {
      startTime: daysFromNow(5, 14),
      endTime: daysFromNow(5, 18),
    },
    confirmedTimeSlots: [
      {
        startTime: daysFromNow(5, 14),
        endTime: daysFromNow(5, 18),
      },
      {
        startTime: daysFromNow(19, 14),
        endTime: daysFromNow(19, 18),
      },
    ],
    sketches: demoAssetUrls([
      DEMO_SEED_ASSETS.sketches.koiLine,
      DEMO_SEED_ASSETS.sketches.koiColor,
    ]),
    sketchRecords: [
      {
        id: "demo-sketch-koi-1",
        url: demoAssetUrl(DEMO_SEED_ASSETS.sketches.koiLine),
        uploadedAt: daysFromNow(-10, 10),
        note: "Line work approved",
        sessionIndex: 1,
      },
      {
        id: "demo-sketch-koi-2",
        url: demoAssetUrl(DEMO_SEED_ASSETS.sketches.koiColor),
        uploadedAt: daysFromNow(-4, 15),
        note: "Color study for session 1",
        sessionIndex: 1,
      },
    ],
    finalPhotos: [demoAssetUrl(DEMO_SEED_ASSETS.healed.koiPreview)],
    privateNotes: "Demo: confirmed appointment on the calendar.",
  };

  const projects = [quotingProject, pendingPaymentProject, bookedProject];
  await Promise.all(projects.map(persistDemoProject));
  return projects;
}
