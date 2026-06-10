import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  linkStripeCustomer,
  setStudioBillingStatus,
} from "@/lib/billing/studio-billing.server";
import { getStripe } from "@/lib/billing/stripe.server";
import { getAdminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/firestore/collections";

export const runtime = "nodejs";

async function findStudioIdByStripeCustomer(
  customerId: string
): Promise<string | null> {
  const snapshot = await getAdminDb()
    .collection(COLLECTIONS.studios)
    .where("stripeCustomerId", "==", customerId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].id;
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const studioId = await findStudioIdByStripeCustomer(customerId);
  if (!studioId) return;

  await setStudioBillingStatus(studioId, "active");
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice
): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;

  if (!customerId) return;

  const studioId = await findStudioIdByStripeCustomer(customerId);
  if (!studioId) return;

  // TODO: grace period / retry policy before full suspension
  await setStudioBillingStatus(studioId, "past_due");
}

async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
): Promise<void> {
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  if (!customerId) return;

  const studioId = await findStudioIdByStripeCustomer(customerId);
  if (!studioId) return;

  await setStudioBillingStatus(studioId, "suspended");
}

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 501 }
    );
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature verification failed:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "invoice.paid":
        await handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        );
        break;
      case "checkout.session.completed": {
        // TODO: attach stripeCustomerId when Checkout is implemented
        const session = event.data.object as Stripe.Checkout.Session;
        const studioId = session.metadata?.studioId;
        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id;

        if (studioId && customerId) {
          await linkStripeCustomer(studioId, customerId, subscriptionId);
          await setStudioBillingStatus(studioId, "active");
        }
        break;
      }
      default:
        // Unhandled events are acknowledged for Stripe retry semantics
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
