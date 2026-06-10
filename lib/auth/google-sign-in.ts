"use client";

import { useEffect, useRef } from "react";
import { type FirebaseError } from "firebase/app";
import {
  GoogleAuthProvider,
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
  type UserCredential,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { AppDictionary } from "@/lib/i18n/app-types";

type AuthMessages = AppDictionary["auth"];

export async function signInWithGoogle(): Promise<UserCredential | null> {
  const provider = new GoogleAuthProvider();

  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    const code = (error as FirebaseError).code;
    if (code === "auth/popup-blocked") {
      await signInWithRedirect(auth, provider);
      return null;
    }
    throw error;
  }
}

export async function resolveGoogleRedirectResult(): Promise<UserCredential | null> {
  return getRedirectResult(auth);
}

export function getGoogleAuthErrorMessage(
  error: unknown,
  messages: AuthMessages
): string | null {
  const code = (error as FirebaseError).code;

  if (
    code === "auth/popup-closed-by-user" ||
    code === "auth/cancelled-popup-request"
  ) {
    return null;
  }

  if (code === "auth/account-exists-with-different-credential") {
    return messages.emailInUse;
  }

  if (code === "auth/operation-not-allowed") {
    return messages.authNotEnabled;
  }

  if (code === "auth/too-many-requests") {
    return messages.tooManyRequests;
  }

  return (error as Error).message || messages.googleLoginFailed;
}

export function useGoogleRedirectSignIn(
  onCredential: (credential: UserCredential) => Promise<void>,
  onError?: (error: unknown) => void
) {
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const result = await resolveGoogleRedirectResult();
        if (!result || cancelled) {
          return;
        }

        await onCredentialRef.current(result);
      } catch (error) {
        if (!cancelled) {
          onErrorRef.current?.(error);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}
