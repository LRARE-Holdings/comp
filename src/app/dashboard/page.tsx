import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ActionList } from "@/components/dashboard/action-list";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("*, firms(*)")
    .eq("auth_id", user!.id)
    .single();

  const firmId = profile?.firm_id ?? "";

  const { data: actions } = await supabase
    .from("actions")
    .select("id, title, description, deadline, priority, status, completed_at")
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
        <ActionList initialActions={actions ?? []} />
      </div>
    </div>
  );
}
