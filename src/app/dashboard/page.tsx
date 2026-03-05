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

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Action Centre</h1>
        <p className="text-vara-slate font-body mt-1">Outstanding compliance actions for your firm</p>
      </div>

      <ActionList
        actions={actions ?? []}
        totalActions={totalActions ?? 0}
        completedActions={completedActions ?? 0}
      />
    </div>
  );
}
