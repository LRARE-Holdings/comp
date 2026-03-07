import { createServiceRoleClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  getCustomerIdFromStripeReference,
  getSubscriptionPrimaryPriceId,
  mapStripePriceToTier,
  mapStripeStatusToVaraStatus,
  type StripeSubscription,
} from "@/lib/stripe";

type FirmUpdate = Database["public"]["Tables"]["firms"]["Update"];

function unixSecondsToIso(value: number | null | undefined): string | null {
  if (!value || !Number.isFinite(value)) {
    return null;
  }

  return new Date(value * 1000).toISOString();
}

function buildFirmUpdateFromStripeSubscription(
  subscription: StripeSubscription
): FirmUpdate {
  const priceId = getSubscriptionPrimaryPriceId(subscription);
  const customerId = getCustomerIdFromStripeReference(subscription.customer);

  return {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    stripe_price_id: priceId,
    stripe_subscription_status: subscription.status,
    subscription_status: mapStripeStatusToVaraStatus(subscription.status),
    subscription_tier: mapStripePriceToTier(priceId),
    trial_ends_at: unixSecondsToIso(subscription.trial_end),
    subscription_current_period_end: unixSecondsToIso(
      subscription.current_period_end
    ),
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
  };
}

async function updateFirmById(firmId: string, update: FirmUpdate) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("firms")
    .update(update)
    .eq("id", firmId);

  if (error) {
    throw new Error(error.message);
  }
}

async function updateFirmByCustomerId(customerId: string, update: FirmUpdate) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("firms")
    .update(update)
    .eq("stripe_customer_id", customerId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

async function updateFirmBySubscriptionId(
  subscriptionId: string,
  update: FirmUpdate
) {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("firms")
    .update(update)
    .eq("stripe_subscription_id", subscriptionId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data?.id ?? null;
}

export async function syncFirmBillingFromStripeSubscription({
  subscription,
  firmId,
}: {
  subscription: StripeSubscription;
  firmId?: string | null;
}) {
  const update = buildFirmUpdateFromStripeSubscription(subscription);
  const metadataFirmId = subscription.metadata?.firm_id ?? null;

  if (firmId) {
    await updateFirmById(firmId, update);
    return;
  }

  if (metadataFirmId) {
    await updateFirmById(metadataFirmId, update);
    return;
  }

  const customerId = getCustomerIdFromStripeReference(subscription.customer);
  if (customerId) {
    const updatedFirmId = await updateFirmByCustomerId(customerId, update);
    if (updatedFirmId) {
      return;
    }
  }

  const updatedBySubscriptionId = await updateFirmBySubscriptionId(
    subscription.id,
    update
  );

  if (updatedBySubscriptionId) {
    return;
  }

  throw new Error("No firm matched the Stripe subscription payload.");
}

export async function updateFirmStripeCustomer({
  firmId,
  customerId,
  billingEmail,
}: {
  firmId: string;
  customerId: string;
  billingEmail: string;
}) {
  const supabase = createServiceRoleClient();
  const { error } = await supabase
    .from("firms")
    .update({
      stripe_customer_id: customerId,
      billing_email: billingEmail,
    })
    .eq("id", firmId);

  if (error) {
    throw new Error(error.message);
  }
}
