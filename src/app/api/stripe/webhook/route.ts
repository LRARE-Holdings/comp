import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { syncFirmBillingFromStripeSubscription } from "@/lib/billing";
import {
  retrieveStripeSubscription,
  verifyStripeWebhookSignature,
  type StripeSubscription,
  type StripeWebhookEvent,
} from "@/lib/stripe";

export const runtime = "nodejs";

type StripeCheckoutSessionEventObject = {
  mode?: string;
  customer?: string | null;
  subscription?: string | null;
  client_reference_id?: string | null;
  metadata?: Record<string, string>;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStripeSubscription(value: unknown): value is StripeSubscription {
  if (!isObject(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    "customer" in value &&
    typeof value.status === "string"
  );
}

function getFirmIdFromCheckoutSession(
  session: StripeCheckoutSessionEventObject
): string | null {
  return session.metadata?.firm_id ?? session.client_reference_id ?? null;
}

async function handleCheckoutCompleted(
  session: StripeCheckoutSessionEventObject
) {
  if (session.mode !== "subscription" || !session.subscription) {
    return;
  }

  const firmId = getFirmIdFromCheckoutSession(session);
  const subscription = await retrieveStripeSubscription(session.subscription);

  await syncFirmBillingFromStripeSubscription({
    subscription,
    firmId,
  });
}

async function handleSubscriptionEvent(subscription: StripeSubscription) {
  await syncFirmBillingFromStripeSubscription({
    subscription,
  });
}

async function maybeStoreCustomerIdFromCheckout(
  session: StripeCheckoutSessionEventObject
) {
  const customerId = session.customer;
  const firmId = getFirmIdFromCheckoutSession(session);

  if (!customerId || !firmId) {
    return;
  }

  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("firms")
    .update({ stripe_customer_id: customerId })
    .eq("id", firmId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function POST(request: Request) {
  const signatureHeader = request.headers.get("stripe-signature");
  const payload = await request.text();

  if (
    !verifyStripeWebhookSignature({
      payload,
      signatureHeader,
    })
  ) {
    return NextResponse.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  let event: StripeWebhookEvent;
  try {
    event = JSON.parse(payload) as StripeWebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const eventObject = event.data?.object as StripeCheckoutSessionEventObject;
        await maybeStoreCustomerIdFromCheckout(eventObject);
        await handleCheckoutCompleted(eventObject);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const eventObject = event.data?.object;
        if (isStripeSubscription(eventObject)) {
          await handleSubscriptionEvent(eventObject);
        }
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to process Stripe webhook event.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
