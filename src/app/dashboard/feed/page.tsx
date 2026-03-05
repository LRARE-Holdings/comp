import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FeedFilterList } from "@/components/dashboard/feed-filter-list";

export default async function FeedPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("firm_id")
    .eq("auth_id", user!.id)
    .single();

  let firmPracticeAreas: string[] = [];
  if (profile?.firm_id) {
    const { data: firm } = await supabase
      .from("firms")
      .select("practice_areas")
      .eq("id", profile.firm_id)
      .single();

    firmPracticeAreas = firm?.practice_areas ?? [];
  }

  const { data: updates } = await supabase
    .from("regulatory_updates")
    .select("id, title, summary, impact_level, publication_date, practice_areas, source_url")
    .eq("status", "published")
    .order("publication_date", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Regulatory Feed</h1>
        <p className="text-vara-slate font-body mt-1">Latest SRA updates relevant to your firm</p>
      </div>

      {updates && updates.length > 0 ? (
        <FeedFilterList updates={updates} practiceAreas={firmPracticeAreas} />
      ) : (
        <div className="vara-card text-center py-12">
          <p className="text-vara-slate font-body">No regulatory updates yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
