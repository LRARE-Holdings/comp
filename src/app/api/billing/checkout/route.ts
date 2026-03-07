import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createStripeCheckoutSession,
  createStripeCustomer,
  type BillingInterval,
  type BillingTier,
} from "@/lib/stripe";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { updateFirmStripeCustomer } from "@/lib/billing";

const checkoutSchema = z.object({
  tier: z.enum(["solo", "small", "mid"]),
  interval: z.enum(["monthly", "yearly"]).default("monthly"),
});

type FirmBillingRecord = {
  id: string;
  name: string;
  subscription_status: "trial" | "active" | "cancelled" | "expired";
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
};

type AuthProfile = {
  full_name: string;
  email: string;
  firm_id: string | null;
  firms: FirmBillingRecord | FirmBillingRecord[] | null;
};

function getSettingsUrl(request: Request) {
  return new URL("/dashboard/settings", request.url);
}

function redirectToSettingsWithMessage(
  request: Request,
  billing: "error" | "cancelled" | "success",
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

async function parseCheckoutRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return checkoutSchema.parse(await request.json());
  }

  const formData = await request.formData();
  return checkoutSchema.parse({
    tier: formData.get("tier"),
    interval: formData.get("interval") ?? "monthly",
  });
}

export async function POST(request: Request) {
  let payload: { tier: BillingTier; interval: BillingInterval };
  try {
    payload = await parseCheckoutRequest(request);
  } catch {
    return redirectToSettingsWithMessage(
      request,
      "error",
      "Invalid billing request."
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

    const { data: profile, error: profileError } = await supabase
      .from("users")
      .select(
        "full_name, email, firm_id, firms(id, name, subscription_status, stripe_customer_id, stripe_subscription_id)"
      )
      .eq("auth_id", user.id)
      .single<AuthProfile>();

    if (profileError || !profile) {
      throw new Error("Could not load your billing profile.");
    }

    const firm = extractFirm(profile);
    if (!profile.firm_id || !firm) {
      throw new Error("No firm is linked to your account.");
    }

    const hasLiveSubscription =
      !!firm.stripe_subscription_id &&
      (firm.subscription_status === "active" ||
        firm.subscription_status === "trial");

    if (hasLiveSubscription) {
      return redirectToSettingsWithMessage(
        request,
        "error",
        "You already have an active subscription. Use plan controls to change it."
      );
    }

    let customerId = firm.stripe_customer_id;

    if (!customerId) {
      const customer = await createStripeCustomer({
        email: profile.email,
        name: profile.full_name,
        firmId: firm.id,
      });

      customerId = customer.id;
      await updateFirmStripeCustomer({
        firmId: firm.id,
        customerId,
        billingEmail: profile.email,
      });
    }

    const successUrl = getSettingsUrl(request);
    successUrl.searchParams.set("billing", "success");
    successUrl.searchParams.set("message", "Checkout complete. Syncing billing...");

    const cancelUrl = getSettingsUrl(request);
    cancelUrl.searchParams.set("billing", "cancelled");
    cancelUrl.searchParams.set("message", "Checkout cancelled.");

    const session = await createStripeCheckoutSession({
      customerId,
      customerEmail: profile.email,
      firmId: firm.id,
      tier: payload.tier,
      interval: payload.interval,
      successUrl: successUrl.toString(),
      cancelUrl: cancelUrl.toString(),
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to start Stripe checkout.";

    return redirectToSettingsWithMessage(request, "error", message);
  }
}
