import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function CompliancePage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("firm_id")
    .eq("auth_id", user!.id)
    .single();

  const firmId = profile?.firm_id ?? "";

  const { count: total } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", firmId);

  const { count: completed } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", firmId)
    .eq("status", "complete");

  const { count: inProgress } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", firmId)
    .eq("status", "in_progress");

  const { count: notStarted } = await supabase
    .from("actions")
    .select("*", { count: "exact", head: true })
    .eq("firm_id", firmId)
    .eq("status", "not_started");

  const score = total ? Math.round(((completed ?? 0) / total) * 100) : 100;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-3xl text-white">Compliance</h1>
        <p className="text-vara-slate font-body mt-1">Your firm&apos;s overall compliance status</p>
      </div>

      {/* Score display */}
      <div className="vara-card mb-6 text-center py-12">
        <p className="text-vara-slate text-sm font-body mb-2">Overall Compliance Score</p>
        <p className={`text-7xl font-display font-bold ${
          score >= 80 ? "text-vara-success" : score >= 50 ? "text-vara-warning" : "text-vara-danger"
        }`}>
          {score}%
        </p>
        <p className="text-vara-slate text-sm mt-2">
          {completed ?? 0} of {total ?? 0} actions completed
        </p>
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="vara-card text-center">
          <p className="text-vara-slate text-sm font-body">Completed</p>
          <p className="text-4xl font-display font-bold text-vara-success mt-2">{completed ?? 0}</p>
        </div>
        <div className="vara-card text-center">
          <p className="text-vara-slate text-sm font-body">In Progress</p>
          <p className="text-4xl font-display font-bold text-vara-warning mt-2">{inProgress ?? 0}</p>
        </div>
        <div className="vara-card text-center">
          <p className="text-vara-slate text-sm font-body">Not Started</p>
          <p className="text-4xl font-display font-bold text-vara-slate mt-2">{notStarted ?? 0}</p>
        </div>
      </div>
    </div>
  );
}
