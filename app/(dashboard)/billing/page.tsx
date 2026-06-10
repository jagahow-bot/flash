import { CreditCard, AlertTriangle } from "lucide-react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthenticatedUser } from "@/lib/auth/session";
import { getCurrentMonthBookingCount } from "@/lib/billing/billing-months.server";
import { FREE_TIER_BOOKINGS, PRICE_PER_BOOKING_USD } from "@/lib/billing/constants";
import { getStudioById } from "@/lib/firestore/studios.server";
import { getAppDictionary } from "@/lib/i18n/get-app-dictionary";
import { getRequestLocale } from "@/lib/i18n/resolve-locale";
import { formatMessage } from "@/lib/i18n/format";

export default async function BillingPage() {
  const user = await getAuthenticatedUser();
  if (!user?.studioId) {
    redirect("/setup");
  }

  const locale = await getRequestLocale();
  const dict = await getAppDictionary(locale);
  const b = dict.billing;
  const studio = await getStudioById(user.studioId);

  if (!studio) {
    redirect("/setup");
  }

  const isSuspended = studio.billingStatus === "suspended";
  const isPastDue = studio.billingStatus === "past_due";
  const freeRemaining = studio.freeBookingsRemaining ?? FREE_TIER_BOOKINGS;
  const completedCount = studio.completedBookingsCount ?? 0;
  const { yearMonth, count: monthlyCount } = await getCurrentMonthBookingCount(
    user.studioId
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{b.title}</h1>
        <p className="mt-2 text-muted-foreground">{b.description}</p>
      </div>

      {(isSuspended || isPastDue) && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-destructive">
              <AlertTriangle className="size-5" aria-hidden="true" />
              {isSuspended ? b.suspendedTitle : b.pastDueTitle}
            </CardTitle>
            <CardDescription>
              {isSuspended ? b.suspendedDescription : b.pastDueDescription}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="size-5" aria-hidden="true" />
            {b.usageTitle}
          </CardTitle>
          <CardDescription>{b.usageDescription}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            {formatMessage(b.freeBookingsRemaining, {
              count: String(freeRemaining),
            })}
          </p>
          <p>
            {formatMessage(b.monthlyBookingsCount, {
              count: String(monthlyCount),
              month: yearMonth,
            })}
          </p>
          <p>
            {formatMessage(b.completedBookingsCount, {
              count: String(completedCount),
            })}
          </p>
          <p className="text-muted-foreground">
            {formatMessage(b.pricePerBooking, {
              price: String(PRICE_PER_BOOKING_USD),
            })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{b.paymentTitle}</CardTitle>
          <CardDescription>{b.paymentDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{b.paymentTodo}</p>
        </CardContent>
      </Card>
    </div>
  );
}
