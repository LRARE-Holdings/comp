import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FeedFilter } from "@/components/dashboard/feed-filter";

export default async function FeedPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("firm_id, firms(practice_areas)")
    .eq("auth_id", user!.id)
    .single();

  const firmPracticeAreas =
    (profile?.firms as { practice_areas: string[] } | null)?.practice_areas ?? [];

  const { data: updates } = await supabase
    .from("regulatory_updates")
    .select("*")
    .eq("status", "published")
    .order("publication_date", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Regulatory Feed</h1>
        <p className="text-vara-slate font-body mt-1">Latest SRA updates relevant to your firm</p>
      </div>

      <FeedFilter
        updates={updates ?? []}
        firmPracticeAreas={firmPracticeAreas}
      />
    </div>
  );
}
