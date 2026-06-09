import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { getStorage, type Storage } from "firebase-admin/storage";
import { getFirebaseAdminCredentials } from "@/lib/firebase-admin-credentials";

function initAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0]!;
  }

  const { projectId, clientEmail, privateKey } = getFirebaseAdminCredentials();

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(initAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(initAdminApp());
}

export function getAdminStorage(): Storage {
  return getStorage(initAdminApp());
}

export function getAdminStorageBucket() {
  const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const storage = getAdminStorage();
  return bucketName ? storage.bucket(bucketName) : storage.bucket();
}
