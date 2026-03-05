import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*, firms(*)")
    .eq("auth_id", user!.id)
    .single();

  const firmId = profile?.firm_id ?? "";

  const { data: actions } = await supabase
    .from("actions")
    .select("*, regulatory_updates(title, impact_level)")
    .eq("firm_id", firmId)
    .neq("status", "complete")
    .order("deadline", { ascending: true });

  const { count: totalActions } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", firmId);

  const { count: completedActions } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", firmId)
    .eq("status", "complete");

  const score = totalActions
    ? Math.round(((completedActions ?? 0) / totalActions) * 100)
    : 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Action Centre</h1>
        <p className="text-vara-slate font-body mt-1">Outstanding compliance actions for your firm</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">Compliance Score</p>
          <p className="text-3xl font-display font-bold text-vara-success mt-1">{score}%</p>
        </div>
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">Open Actions</p>
          <p className="text-3xl font-display font-bold text-white mt-1">{actions?.length ?? 0}</p>
        </div>
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">High Priority</p>
          <p className="text-3xl font-display font-bold text-vara-danger mt-1">
            {actions?.filter((a) => a.priority === "high").length ?? 0}
          </p>
        </div>
        <div className="vara-card">
          <p className="text-vara-slate text-sm font-body">Completed</p>
          <p className="text-3xl font-display font-bold text-vara-blue mt-1">{completedActions ?? 0}</p>
        </div>
      </div>

      <div className="vara-card">
        <h2 className="font-display font-semibold text-lg text-white mb-4">Outstanding Actions</h2>
        {actions && actions.length > 0 ? (
          <div className="space-y-3">
            {actions.map((action) => (
              <div key={action.id} className="flex items-start gap-4 p-4 rounded-lg bg-vara-dark/50 border border-white/5">
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                  action.priority === "high" ? "bg-vara-danger" : action.priority === "medium" ? "bg-vara-warning" : "bg-vara-blue"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-body font-medium text-sm">{action.title}</p>
                  {action.description && (
                    <p className="text-vara-slate text-sm mt-1 line-clamp-2">{action.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {action.deadline && (
                      <span className="text-xs text-vara-slate">
                        Due {new Date(action.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      action.status === "in_progress" ? "bg-vara-warning/15 text-vara-warning" : "bg-white/5 text-vara-slate"
                    }`}>
                      {action.status === "in_progress" ? "In progress" : "Not started"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-vara-slate font-body">No outstanding actions. You&apos;re fully up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
}
