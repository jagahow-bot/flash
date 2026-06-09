/**
 * 將 mock 資料寫入 Firestore。
 *
 * 用法：
 *   1. 在 .env.local 設定 SEED_ADMIN_UID（Firebase Auth 中 admin 使用者的 uid）
 *   2. npm run seed
 */

import { COLLECTIONS } from "../lib/firestore/collections";
import { getAdminDb } from "../lib/firebase-admin";
import { projectToFirestore } from "../lib/firestore/serializers";
import {
  mockArtists,
  mockProjects,
  mockStudio,
  mockUsers,
} from "../data/mock/index";

async function seed() {
  const adminUid = process.env.SEED_ADMIN_UID;
  const artistUid = process.env.SEED_ARTIST_UID;

  if (!adminUid) {
    throw new Error(
      "請在 .env.local 設定 SEED_ADMIN_UID（你的 Firebase Auth admin 使用者 uid）"
    );
  }

  const db = getAdminDb();
  const batch = db.batch();

  const usersToSeed = mockUsers.map((user) => {
    if (user.role === "admin") {
      return { ...user, uid: adminUid, studioId: mockStudio.studioId };
    }
    if (user.role === "artist" && artistUid) {
      return { ...user, uid: artistUid };
    }
    return user;
  });

  for (const user of usersToSeed) {
    const { uid, ...data } = user;
    batch.set(db.collection(COLLECTIONS.users).doc(uid), data, { merge: true });
  }

  batch.set(db.collection(COLLECTIONS.studios).doc(mockStudio.studioId), mockStudio);

  for (const artist of mockArtists) {
    const { artistId, userEmail, ...data } = artist;
    batch.set(db.collection(COLLECTIONS.artists).doc(artistId), {
      ...data,
      ...(userEmail ? { userEmail } : {}),
    });
  }

  for (const project of mockProjects) {
    batch.set(
      db.collection(COLLECTIONS.projects).doc(project.projectId),
      projectToFirestore(project)
    );
  }

  await batch.commit();

  console.log("✓ Firestore seed 完成");
  console.log(`  - users: ${usersToSeed.length} 筆`);
  console.log(`  - studios: 1 筆 (${mockStudio.slug})`);
  console.log(`  - artists: ${mockArtists.length} 筆`);
  console.log(`  - projects: ${mockProjects.length} 筆`);
  console.log(`  - admin uid: ${adminUid}`);
  if (artistUid) console.log(`  - artist uid: ${artistUid}`);
}

seed().catch((error) => {
  console.error("Seed 失敗:", error);
  process.exit(1);
});
