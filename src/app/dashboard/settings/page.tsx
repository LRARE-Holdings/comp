import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  getConfiguredPriceIdForTier,
  type BillingInterval,
  type BillingTier,
} from "@/lib/stripe";
import type { Database } from "@/types/database";

type SearchParams = Record<string, string | string[] | undefined>;

type FirmRecord = Pick<
  Database["public"]["Tables"]["firms"]["Row"],
  | "id"
  | "name"
  | "size_band"
  | "subscription_tier"
  | "subscription_status"
  | "trial_ends_at"
  | "stripe_customer_id"
  | "stripe_subscription_id"
  | "stripe_price_id"
  | "stripe_subscription_status"
  | "subscription_current_period_end"
  | "cancel_at_period_end"
>;

type ProfileRecord = {
  full_name: string;
  email: string;
  firms: FirmRecord | FirmRecord[] | null;
};

type Plan = {
  tier: BillingTier;
  name: string;
  subtitle: string;
  monthlyLabel: string;
  yearlyLabel: string;
};

const PLANS: Plan[] = [
  {
    tier: "solo",
    name: "Solo / Micro",
    subtitle: "1-5 solicitors",
    monthlyLabel: "£49/mo",
    yearlyLabel: "£499/yr",
  },
  {
    tier: "small",
    name: "Small",
    subtitle: "6-20 solicitors",
    monthlyLabel: "£99/mo",
    yearlyLabel: "£999/yr",
  },
  {
    tier: "mid",
    name: "Mid-size",
    subtitle: "21-50 solicitors",
    monthlyLabel: "£179/mo",
    yearlyLabel: "£1,799/yr",
  },
];

function firstValue(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
}

function formatDate(value: string | null): string {
  if (!value) {
    return "N/A";
  }

  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function extractFirm(profile: ProfileRecord | null): FirmRecord | null {
  if (!profile?.firms) {
    return null;
  }

  if (Array.isArray(profile.firms)) {
    return profile.firms[0] ?? null;
  }

  return profile.firms;
}

function getPlanConfig(tier: BillingTier, interval: BillingInterval) {
  const priceId = getConfiguredPriceIdForTier(tier, interval);
  const isConfigured = Boolean(priceId);
  return { priceId, isConfigured };
}

function getPlanDisplayName(tier: string | null) {
  if (!tier) {
    return "Not set";
  }

  switch (tier) {
    case "solo":
      return "Solo / Micro";
    case "small":
      return "Small";
    case "mid":
      return "Mid-size";
    case "enterprise":
      return "Enterprise";
    default:
      return tier;
  }
}

async function resolveSearchParams(
  value: SearchParams | Promise<SearchParams> | undefined
): Promise<SearchParams> {
  if (!value) {
    return {};
  }

  if (typeof (value as Promise<SearchParams>).then === "function") {
    return value as Promise<SearchParams>;
  }

  return value;
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const params = await resolveSearchParams(searchParams);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select(
      "full_name, email, firms(id, name, size_band, subscription_tier, subscription_status, trial_ends_at, stripe_customer_id, stripe_subscription_id, stripe_price_id, stripe_subscription_status, subscription_current_period_end, cancel_at_period_end)"
    )
    .eq("auth_id", user.id)
    .single<ProfileRecord>();

  const firm = extractFirm(profile);
  const billingState = firstValue(params.billing);
  const billingMessage = firstValue(params.message);
  const hasManagedSubscription =
    !!firm?.stripe_subscription_id &&
    (firm.subscription_status === "active" || firm.subscription_status === "trial");

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        <p className="text-vara-slate font-body mt-1">
          Account, billing, and subscription controls
        </p>
      </div>

      {billingState && billingMessage && (
        <div
          className={`mb-6 rounded-lg border px-4 py-3 text-sm font-body ${
            billingState === "success"
              ? "border-vara-success/30 bg-vara-success/10 text-vara-success"
              : billingState === "cancelled"
                ? "border-vara-warning/30 bg-vara-warning/10 text-vara-warning"
                : "border-vara-danger/30 bg-vara-danger/10 text-vara-danger"
          }`}
        >
          {billingMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <section className="vara-card">
          <h2 className="font-display font-semibold text-lg text-white mb-4">
            Account
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-vara-slate uppercase tracking-wide mb-1">
                Name
              </p>
              <p className="text-white font-body">{profile?.full_name ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-vara-slate uppercase tracking-wide mb-1">
                Email
              </p>
              <p className="text-white font-body">{profile?.email ?? "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-vara-slate uppercase tracking-wide mb-1">
                Firm
              </p>
              <p className="text-white font-body">{firm?.name ?? "N/A"}</p>
            </div>
          </div>
        </section>

        <section className="vara-card">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-semibold text-lg text-white">
                Billing
              </h2>
              <p className="text-vara-slate text-sm mt-1">
                Fully custom Stripe subscription management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-vara-slate uppercase tracking-wide">
                Current plan
              </span>
              <span className="text-xs rounded-full border border-vara-blue/30 bg-vara-blue/10 text-vara-blue px-2.5 py-1">
                {getPlanDisplayName(firm?.subscription_tier ?? null)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-white/10 bg-vara-dark px-4 py-3">
              <p className="text-xs text-vara-slate uppercase tracking-wide mb-1">
                Status
              </p>
              <p className="text-white">
                {(firm?.stripe_subscription_status ?? firm?.subscription_status ?? "trial")
                  .replace("_", " ")
                  .toUpperCase()}
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-vara-dark px-4 py-3">
              <p className="text-xs text-vara-slate uppercase tracking-wide mb-1">
                Trial ends
              </p>
              <p className="text-white">{formatDate(firm?.trial_ends_at ?? null)}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-vara-dark px-4 py-3">
              <p className="text-xs text-vara-slate uppercase tracking-wide mb-1">
                Current period end
              </p>
              <p className="text-white">
                {formatDate(firm?.subscription_current_period_end ?? null)}
              </p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {PLANS.map((plan) => {
              const monthlyConfig = getPlanConfig(plan.tier, "monthly");
              const yearlyConfig = getPlanConfig(plan.tier, "yearly");
              const isCurrentMonthly =
                firm?.stripe_price_id && monthlyConfig.priceId
                  ? firm.stripe_price_id === monthlyConfig.priceId
                  : false;
              const isCurrentYearly =
                firm?.stripe_price_id && yearlyConfig.priceId
                  ? firm.stripe_price_id === yearlyConfig.priceId
                  : false;

              return (
                <div
                  key={plan.tier}
                  className="rounded-lg border border-white/10 bg-vara-dark px-4 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <p className="text-white font-medium">{plan.name}</p>
                      <p className="text-vara-slate text-sm">{plan.subtitle}</p>
                    </div>
                    <span className="text-xs text-vara-slate">
                      {plan.monthlyLabel} or {plan.yearlyLabel}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <form
                      action={
                        hasManagedSubscription
                          ? "/api/billing/subscription"
                          : "/api/billing/checkout"
                      }
                      method="POST"
                    >
                      {hasManagedSubscription && (
                        <input type="hidden" name="action" value="change_plan" />
                      )}
                      <input type="hidden" name="tier" value={plan.tier} />
                      <input type="hidden" name="interval" value="monthly" />
                      <button
                        type="submit"
                        disabled={!monthlyConfig.isConfigured || Boolean(isCurrentMonthly)}
                        className="vara-btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!monthlyConfig.isConfigured
                          ? "Monthly not configured"
                          : isCurrentMonthly
                            ? "Current monthly plan"
                            : hasManagedSubscription
                              ? "Switch to monthly"
                              : "Start monthly"}
                      </button>
                    </form>

                    <form
                      action={
                        hasManagedSubscription
                          ? "/api/billing/subscription"
                          : "/api/billing/checkout"
                      }
                      method="POST"
                    >
                      {hasManagedSubscription && (
                        <input type="hidden" name="action" value="change_plan" />
                      )}
                      <input type="hidden" name="tier" value={plan.tier} />
                      <input type="hidden" name="interval" value="yearly" />
                      <button
                        type="submit"
                        disabled={!yearlyConfig.isConfigured || Boolean(isCurrentYearly)}
                        className="vara-btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {!yearlyConfig.isConfigured
                          ? "Yearly not configured"
                          : isCurrentYearly
                            ? "Current yearly plan"
                            : hasManagedSubscription
                              ? "Switch to yearly"
                              : "Start yearly"}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3">
            {hasManagedSubscription && (
              <form action="/api/billing/subscription" method="POST">
                <input
                  type="hidden"
                  name="action"
                  value={firm?.cancel_at_period_end ? "resume" : "cancel"}
                />
                <button type="submit" className="vara-btn-secondary">
                  {firm?.cancel_at_period_end
                    ? "Resume subscription"
                    : "Cancel at period end"}
                </button>
              </form>
            )}

            {firm?.stripe_customer_id && (
              <form action="/api/billing/portal" method="POST">
                <button type="submit" className="vara-btn-primary">
                  Open Stripe billing portal
                </button>
              </form>
            )}
          </div>

          <div className="mt-6 text-xs text-vara-slate">
            Enterprise (50+) is handled manually. Contact support for custom terms.
          </div>
        </section>
      </div>
    </div>
  );
}
