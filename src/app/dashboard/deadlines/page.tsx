import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatDate, daysUntil } from "@/lib/utils";

export default async function DeadlinesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("firm_id")
    .eq("auth_id", user!.id)
    .single();

  // Upcoming deadlines from actions
  const { data: actionDeadlines } = await supabase
    .from("actions")
    .select("id, title, deadline, priority, status")
    .eq("firm_id", profile?.firm_id ?? "")
    .neq("status", "complete")
    .not("deadline", "is", null)
    .order("deadline", { ascending: true });

  // Upcoming deadlines from regulatory updates (consultation closing dates etc)
  const { data: updateDeadlines } = await supabase
    .from("regulatory_updates")
    .select("id, title, deadline, impact_level")
    .eq("status", "published")
    .not("deadline", "is", null)
    .gte("deadline", new Date().toISOString())
    .order("deadline", { ascending: true });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Deadlines</h1>
        <p className="text-vara-slate font-body mt-1">Upcoming regulatory deadlines and consultation dates</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Action deadlines */}
        <div className="vara-card">
          <h2 className="font-display font-semibold text-lg text-white mb-4">Action Deadlines</h2>
          {actionDeadlines && actionDeadlines.length > 0 ? (
            <div className="space-y-3">
              {actionDeadlines.map((action) => {
                const days = daysUntil(action.deadline!);
                const isUrgent = days <= 7;
                return (
                  <div key={action.id} className="flex items-center justify-between p-3 rounded-lg bg-vara-dark/50 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        action.priority === "high" ? "bg-vara-danger" : action.priority === "medium" ? "bg-vara-warning" : "bg-vara-blue"
                      }`} />
                      <span className="text-sm text-white font-body">{action.title}</span>
                    </div>
                    <span className={`text-xs font-medium ${isUrgent ? "text-vara-danger" : "text-vara-slate"}`}>
                      {days <= 0 ? "Overdue" : `${days}d`}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-vara-slate text-sm py-6 text-center">No upcoming action deadlines.</p>
          )}
        </div>

        {/* Regulatory deadlines */}
        <div className="vara-card">
          <h2 className="font-display font-semibold text-lg text-white mb-4">Regulatory Dates</h2>
          {updateDeadlines && updateDeadlines.length > 0 ? (
            <div className="space-y-3">
              {updateDeadlines.map((update) => {
                const days = daysUntil(update.deadline!);
                return (
                  <div key={update.id} className="flex items-center justify-between p-3 rounded-lg bg-vara-dark/50 border border-white/5">
                    <span className="text-sm text-white font-body">{update.title}</span>
                    <span className="text-xs text-vara-slate">{formatDate(update.deadline!)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-vara-slate text-sm py-6 text-center">No upcoming regulatory dates.</p>
          )}
        </div>
      </div>
    </div>
  );
}
