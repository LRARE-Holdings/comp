import { NextResponse } from "next/server";
import { z } from "zod";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { syncFirmBillingFromStripeSubscription } from "@/lib/billing";
import {
  getPriceIdForTier,
  getSubscriptionPrimaryItemId,
  getSubscriptionPrimaryPriceId,
  retrieveStripeSubscription,
  updateStripeSubscription,
  type BillingInterval,
  type BillingTier,
} from "@/lib/stripe";

const subscriptionActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("change_plan"),
    tier: z.enum(["solo", "small", "mid"]),
    interval: z.enum(["monthly", "yearly"]).default("monthly"),
  }),
  z.object({
    action: z.literal("cancel"),
  }),
  z.object({
    action: z.literal("resume"),
  }),
]);

type FirmBillingRecord = {
  id: string;
  stripe_subscription_id: string | null;
  stripe_subscription_status: string | null;
  cancel_at_period_end: boolean;
};

type AuthProfile = {
  firm_id: string | null;
  firms: FirmBillingRecord | FirmBillingRecord[] | null;
};

function getSettingsUrl(request: Request) {
  return new URL("/dashboard/settings", request.url);
}

function redirectToSettingsWithMessage(
  request: Request,
  billing: "error" | "success",
  message: string
) {
  const url = getSettingsUrl(request);
  url.searchParams.set("billing", billing);
  url.searchParams.set("message", message);
  return NextResponse.redirect(url, 303);
}

function extractFirm(profile: AuthProfile): FirmBillingRecord | null {
  if (!profile.firms) {
    return null;
  }

  if (Array.isArray(profile.firms)) {
    return profile.firms[0] ?? null;
  }

  return profile.firms;
}

async function parseSubscriptionAction(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return subscriptionActionSchema.parse(await request.json());
  }

  const formData = await request.formData();
  return subscriptionActionSchema.parse({
    action: formData.get("action"),
    tier: formData.get("tier"),
    interval: formData.get("interval") ?? "monthly",
  });
}

export async function POST(request: Request) {
  let payload:
    | { action: "cancel" | "resume" }
    | { action: "change_plan"; tier: BillingTier; interval: BillingInterval };

  try {
    payload = await parseSubscriptionAction(request);
  } catch {
    return redirectToSettingsWithMessage(
      request,
      "error",
      "Invalid subscription request."
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url), 303);
    }

    const { data: profile, error } = await supabase
      .from("users")
      .select(
        "firm_id, firms(id, stripe_subscription_id, stripe_subscription_status, cancel_at_period_end)"
      )
      .eq("auth_id", user.id)
      .single<AuthProfile>();

    if (error || !profile) {
      throw new Error("Could not load your billing profile.");
    }

    const firm = extractFirm(profile);
    if (!profile.firm_id || !firm) {
      throw new Error("No firm is linked to your account.");
    }

    const subscriptionId = firm.stripe_subscription_id;
    if (!subscriptionId) {
      throw new Error("No Stripe subscription exists for this account yet.");
    }

    const subscription = await retrieveStripeSubscription(subscriptionId);

    if (payload.action === "change_plan") {
      const subscriptionItemId = getSubscriptionPrimaryItemId(subscription);
      if (!subscriptionItemId) {
        throw new Error("No subscription item found for plan update.");
      }

      const requestedPriceId = getPriceIdForTier(payload.tier, payload.interval);
      const currentPriceId = getSubscriptionPrimaryPriceId(subscription);

      if (currentPriceId === requestedPriceId) {
        return redirectToSettingsWithMessage(
          request,
          "success",
          "Plan already matches your selection."
        );
      }

      const params = new URLSearchParams();
      params.set("items[0][id]", subscriptionItemId);
      params.set("items[0][price]", requestedPriceId);
      params.set("proration_behavior", "create_prorations");
      params.set("metadata[firm_id]", firm.id);

      const updatedSubscription = await updateStripeSubscription({
        subscriptionId,
        params,
      });

      await syncFirmBillingFromStripeSubscription({
        subscription: updatedSubscription,
        firmId: firm.id,
      });

      return redirectToSettingsWithMessage(
        request,
        "success",
        "Subscription plan updated."
      );
    }

    if (payload.action === "cancel") {
      if (firm.cancel_at_period_end) {
        return redirectToSettingsWithMessage(
          request,
          "success",
          "Subscription is already set to cancel at period end."
        );
      }

      const params = new URLSearchParams();
      params.set("cancel_at_period_end", "true");
      params.set("metadata[firm_id]", firm.id);

      const updatedSubscription = await updateStripeSubscription({
        subscriptionId,
        params,
      });

      await syncFirmBillingFromStripeSubscription({
        subscription: updatedSubscription,
        firmId: firm.id,
      });

      return redirectToSettingsWithMessage(
        request,
        "success",
        "Subscription will cancel at period end."
      );
    }

    const params = new URLSearchParams();
    params.set("cancel_at_period_end", "false");
    params.set("metadata[firm_id]", firm.id);

    const updatedSubscription = await updateStripeSubscription({
      subscriptionId,
      params,
    });

    await syncFirmBillingFromStripeSubscription({
      subscription: updatedSubscription,
      firmId: firm.id,
    });

    return redirectToSettingsWithMessage(
      request,
      "success",
      "Cancellation removed. Subscription stays active."
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update subscription.";

    return redirectToSettingsWithMessage(request, "error", message);
  }
}
