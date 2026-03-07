import Link from "next/link";
import { VaraBrand } from "@/components/layout/vara-brand";
import { WaitlistForm } from "@/components/marketing/waitlist-form";

type SearchParams = Record<string, string | string[] | undefined>;
type EntryPoint = "signin" | "get-started" | "auth" | "unknown";

function firstValue(value: string | string[] | undefined): string | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? value[0] ?? null : value;
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

function normalizeEntryPoint(value: string | null): EntryPoint {
  if (value === "signin" || value === "get-started" || value === "auth") {
    return value;
  }

  return "unknown";
}

function getContextLabel(entryPoint: EntryPoint): string {
  switch (entryPoint) {
    case "signin":
      return "Sign in";
    case "get-started":
      return "Get started";
    default:
      return "Access";
  }
}

export default async function ComingSoonPage({
  searchParams,
}: {
  searchParams?: SearchParams | Promise<SearchParams>;
}) {
  const params = await resolveSearchParams(searchParams);
  const entryPoint = normalizeEntryPoint(firstValue(params.from));
  const contextLabel = getContextLabel(entryPoint);

  return (
    <div className="min-h-screen bg-vara-dark flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-vara-navy/60 p-8 text-center backdrop-blur">
        <VaraBrand className="justify-center mb-8" priority />

        <p className="vara-badge-info inline-block mb-4">Coming soon</p>
        <h1 className="font-display font-bold text-4xl text-white">
          {contextLabel} is not live yet.
        </h1>
        <p className="text-vara-slate text-base mt-4 mb-8">
          Vara is currently in private build. Join the waitlist and we&apos;ll
          email you when early access opens.
        </p>

        <div className="flex justify-center">
          <WaitlistForm
            source="coming_soon_gate"
            entryPoint={entryPoint}
            buttonLabel="Join waitlist"
            helperText="No spam. We only email for launch updates."
            successMessage="Thanks. You are on the waitlist."
          />
        </div>

        <Link
          href="/"
          className="inline-flex mt-6 text-sm text-vara-slate hover:text-white transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
