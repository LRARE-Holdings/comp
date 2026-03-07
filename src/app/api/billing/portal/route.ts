import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createStripeBillingPortalSession } from "@/lib/stripe";

type FirmRecord = {
  stripe_customer_id: string | null;
};

type AuthProfile = {
  firms: FirmRecord | FirmRecord[] | null;
};

function getSettingsUrl(request: Request) {
  return new URL("/dashboard/settings", request.url);
}

function redirectToSettingsWithMessage(request: Request, message: string) {
  const url = getSettingsUrl(request);
  url.searchParams.set("billing", "error");
  url.searchParams.set("message", message);
  return NextResponse.redirect(url, 303);
}

function extractFirm(profile: AuthProfile): FirmRecord | null {
  if (!profile.firms) {
    return null;
  }

  if (Array.isArray(profile.firms)) {
    return profile.firms[0] ?? null;
  }

  return profile.firms;
}

export async function POST(request: Request) {
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
      .select("firms(stripe_customer_id)")
      .eq("auth_id", user.id)
      .single<AuthProfile>();

    if (error || !profile) {
      throw new Error("Could not load billing profile.");
    }

    const firm = extractFirm(profile);
    if (!firm?.stripe_customer_id) {
      throw new Error("No Stripe customer exists for this account yet.");
    }

    const returnUrl = getSettingsUrl(request).toString();
    const session = await createStripeBillingPortalSession({
      customerId: firm.stripe_customer_id,
      returnUrl,
    });

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to open Stripe billing portal.";
    return redirectToSettingsWithMessage(request, message);
  }
}
