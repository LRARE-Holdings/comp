import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function FeedPage() {
  const supabase = createServerSupabaseClient();

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

      {updates && updates.length > 0 ? (
        <div className="space-y-4">
          {updates.map((update) => (
            <div key={update.id} className="vara-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={
                      update.impact_level === "high" ? "vara-badge-high" :
                      update.impact_level === "medium" ? "vara-badge-medium" :
                      update.impact_level === "low" ? "vara-badge-low" :
                      "vara-badge-info"
                    }>
                      {update.impact_level.toUpperCase()}
                    </span>
                    <span className="text-xs text-vara-slate">
                      {formatDate(update.publication_date)}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-white text-lg mb-2">
                    {update.title}
                  </h3>
                  {update.summary && (
                    <p className="text-vara-slate text-sm leading-relaxed mb-3">
                      {update.summary}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {update.practice_areas.map((area) => (
                      <span key={area} className="text-xs bg-white/5 text-vara-slate px-2 py-1 rounded">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
                {update.source_url && (
                  <a
                    href={update.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-vara-blue hover:underline text-sm shrink-0"
                  >
                    SRA source &rarr;
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="vara-card text-center py-12">
          <p className="text-vara-slate font-body">No regulatory updates yet. Check back soon.</p>
        </div>
      )}
    </div>
  );
}
