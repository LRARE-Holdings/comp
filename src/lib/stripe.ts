import { createHmac, timingSafeEqual } from "crypto";

export type BillingTier = "solo" | "small" | "mid";
export type BillingInterval = "monthly" | "yearly";
export type VaraSubscriptionStatus = "trial" | "active" | "cancelled" | "expired";

const STRIPE_API_BASE = "https://api.stripe.com/v1";
const STRIPE_TIER_CONFIG: Record<BillingTier, Record<BillingInterval, string>> = {
  solo: {
    monthly: "STRIPE_PRICE_SOLO_MONTHLY",
    yearly: "STRIPE_PRICE_SOLO_YEARLY",
  },
  small: {
    monthly: "STRIPE_PRICE_SMALL_MONTHLY",
    yearly: "STRIPE_PRICE_SMALL_YEARLY",
  },
  mid: {
    monthly: "STRIPE_PRICE_MID_MONTHLY",
    yearly: "STRIPE_PRICE_MID_YEARLY",
  },
};

interface StripeApiError {
  error?: {
    message?: string;
  };
}

interface StripeRecurring {
  interval?: string | null;
  interval_count?: number | null;
}

interface StripePrice {
  id: string;
  recurring?: StripeRecurring | null;
}

interface StripeSubscriptionItem {
  id: string;
  price?: StripePrice | null;
}

export interface StripeCustomer {
  id: string;
  email: string | null;
}

export interface StripeCheckoutSession {
  id: string;
  url: string | null;
  customer: string | null;
  subscription: string | null;
}

export interface StripeBillingPortalSession {
  url: string;
}

export interface StripeSubscription {
  id: string;
  customer: string | { id: string };
  status: string;
  cancel_at_period_end?: boolean;
  current_period_end?: number;
  trial_end?: number | null;
  metadata?: Record<string, string>;
  items?: {
    data?: StripeSubscriptionItem[];
  };
}

export interface StripeWebhookEvent<T = unknown> {
  id: string;
  type: string;
  data: {
    object: T;
  };
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured.`);
  }
  return value;
}

function getStripeSecretKey(): string {
  return getRequiredEnv("STRIPE_SECRET_KEY");
}

function getStripeWebhookSecret(): string {
  return getRequiredEnv("STRIPE_WEBHOOK_SECRET");
}

async function parseStripeResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  let parsed: T | StripeApiError | null = null;

  if (text) {
    try {
      parsed = JSON.parse(text) as T | StripeApiError;
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const errorPayload = parsed as StripeApiError | null;
    const message =
      errorPayload?.error?.message ??
      `Stripe request failed with status ${response.status}.`;
    throw new Error(message);
  }

  if (!parsed) {
    throw new Error("Stripe returned an empty response.");
  }

  return parsed as T;
}

async function stripeRequest<T>({
  path,
  method = "GET",
  body,
}: {
  path: string;
  method?: "GET" | "POST";
  body?: URLSearchParams;
}): Promise<T> {
  const headers: HeadersInit = {
    Authorization: `Bearer ${getStripeSecretKey()}`,
  };

  let requestBody: string | undefined;
  if (method === "POST") {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    requestBody = body?.toString() ?? "";
  }

  const response = await fetch(`${STRIPE_API_BASE}${path}`, {
    method,
    headers,
    body: requestBody,
    cache: "no-store",
  });

  return parseStripeResponse<T>(response);
}

function withStringParam(
  params: URLSearchParams,
  key: string,
  value: string | null | undefined
) {
  if (value) {
    params.set(key, value);
  }
}

export function getPriceIdForTier(
  tier: BillingTier,
  interval: BillingInterval
): string {
  const envKey = STRIPE_TIER_CONFIG[tier][interval];
  return getRequiredEnv(envKey);
}

export function getConfiguredPriceIdForTier(
  tier: BillingTier,
  interval: BillingInterval
): string | null {
  const envKey = STRIPE_TIER_CONFIG[tier][interval];
  return process.env[envKey] ?? null;
}

export function mapStripePriceToTier(
  priceId: string | null | undefined
): BillingTier | null {
  if (!priceId) {
    return null;
  }

  for (const [tier, intervals] of Object.entries(STRIPE_TIER_CONFIG) as [
    BillingTier,
    Record<BillingInterval, string>,
  ][]) {
    for (const envKey of Object.values(intervals)) {
      if (process.env[envKey] && process.env[envKey] === priceId) {
        return tier;
      }
    }
  }

  return null;
}

export function mapStripeStatusToVaraStatus(
  stripeStatus: string
): VaraSubscriptionStatus {
  switch (stripeStatus) {
    case "trialing":
      return "trial";
    case "active":
    case "past_due":
    case "incomplete":
      return "active";
    case "canceled":
      return "cancelled";
    case "incomplete_expired":
    case "unpaid":
      return "expired";
    default:
      return "active";
  }
}

export function getSubscriptionPrimaryPriceId(
  subscription: StripeSubscription
): string | null {
  return subscription.items?.data?.[0]?.price?.id ?? null;
}

export function getSubscriptionPrimaryItemId(
  subscription: StripeSubscription
): string | null {
  return subscription.items?.data?.[0]?.id ?? null;
}

export function getCustomerIdFromStripeReference(
  customer: StripeSubscription["customer"] | string | null | undefined
): string | null {
  if (!customer) {
    return null;
  }

  if (typeof customer === "string") {
    return customer;
  }

  return customer.id ?? null;
}

export async function createStripeCustomer({
  email,
  name,
  firmId,
}: {
  email: string;
  name: string | null;
  firmId: string;
}) {
  const params = new URLSearchParams();
  params.set("email", email);
  withStringParam(params, "name", name);
  params.set("metadata[firm_id]", firmId);

  return stripeRequest<StripeCustomer>({
    path: "/customers",
    method: "POST",
    body: params,
  });
}

export async function createStripeCheckoutSession({
  customerId,
  customerEmail,
  firmId,
  tier,
  interval,
  successUrl,
  cancelUrl,
}: {
  customerId: string | null;
  customerEmail: string;
  firmId: string;
  tier: BillingTier;
  interval: BillingInterval;
  successUrl: string;
  cancelUrl: string;
}) {
  const priceId = getPriceIdForTier(tier, interval);
  const params = new URLSearchParams();

  params.set("mode", "subscription");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("allow_promotion_codes", "true");
  params.set("line_items[0][price]", priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("client_reference_id", firmId);
  params.set("metadata[firm_id]", firmId);
  params.set("subscription_data[metadata][firm_id]", firmId);

  if (customerId) {
    params.set("customer", customerId);
  } else {
    params.set("customer_email", customerEmail);
  }

  return stripeRequest<StripeCheckoutSession>({
    path: "/checkout/sessions",
    method: "POST",
    body: params,
  });
}

export async function createStripeBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  const params = new URLSearchParams();
  params.set("customer", customerId);
  params.set("return_url", returnUrl);

  return stripeRequest<StripeBillingPortalSession>({
    path: "/billing_portal/sessions",
    method: "POST",
    body: params,
  });
}

export async function retrieveStripeSubscription(subscriptionId: string) {
  return stripeRequest<StripeSubscription>({
    path: `/subscriptions/${subscriptionId}`,
    method: "GET",
  });
}

export async function updateStripeSubscription({
  subscriptionId,
  params,
}: {
  subscriptionId: string;
  params: URLSearchParams;
}) {
  return stripeRequest<StripeSubscription>({
    path: `/subscriptions/${subscriptionId}`,
    method: "POST",
    body: params,
  });
}

function timingSafeHexCompare(expectedHex: string, actualHex: string): boolean {
  const expected = Buffer.from(expectedHex, "hex");
  const actual = Buffer.from(actualHex, "hex");

  if (expected.length === 0 || actual.length === 0) {
    return false;
  }

  if (expected.length !== actual.length) {
    return false;
  }

  return timingSafeEqual(expected, actual);
}

export function verifyStripeWebhookSignature({
  payload,
  signatureHeader,
  toleranceSeconds = 300,
}: {
  payload: string;
  signatureHeader: string | null;
  toleranceSeconds?: number;
}): boolean {
  if (!signatureHeader) {
    return false;
  }

  const signatureParts = signatureHeader.split(",");
  const timestampPart = signatureParts.find((part) => part.startsWith("t="));
  const versionOneSignatures = signatureParts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.replace("v1=", ""));

  if (!timestampPart || versionOneSignatures.length === 0) {
    return false;
  }

  const timestamp = Number(timestampPart.replace("t=", ""));
  if (!Number.isFinite(timestamp)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > toleranceSeconds) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", getStripeWebhookSecret())
    .update(signedPayload)
    .digest("hex");

  return versionOneSignatures.some((signature) =>
    timingSafeHexCompare(expectedSignature, signature)
  );
}
