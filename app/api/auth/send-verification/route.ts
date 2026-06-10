import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanitizeRedirectTo } from "@/lib/auth/sanitize-redirect";
import { sendVerificationEmailViaResend } from "@/lib/auth/send-verification-email.server";
import { resolveRecipientLocale } from "@/lib/email/resolve-recipient-locale.server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getUserById } from "@/lib/firestore/users.server";

const bodySchema = z.object({
  idToken: z.string().min(1),
  audience: z.enum(["client", "studio"]).default("client"),
  redirectTo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, audience, redirectTo } = bodySchema.parse(body);

    const decoded = await getAdminAuth().verifyIdToken(idToken);
    const email = decoded.email?.trim();

    if (!email) {
      return NextResponse.json({ error: "此帳號沒有 Email" }, { status: 400 });
    }

    if (decoded.email_verified) {
      return NextResponse.json({ sent: false, alreadyVerified: true });
    }

    const result = await sendVerificationEmailViaResend({
      email,
      audience,
      redirectTo: sanitizeRedirectTo(redirectTo),
      locale: resolveRecipientLocale(await getUserById(decoded.uid)),
    });

    if (result.skipped) {
      return NextResponse.json({
        sent: false,
        fallback: "firebase",
        reason: result.reason,
      });
    }

    return NextResponse.json({ sent: true });
  } catch (error) {
    console.error("Send verification email failed:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "資料格式不正確" }, { status: 400 });
    }

    return NextResponse.json(
      { error: "寄送驗證信失敗，請稍後再試" },
      { status: 500 }
    );
  }
}
