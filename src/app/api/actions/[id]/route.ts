import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Action } from "@/types/database";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateActionStatusSchema = z.object({
  status: z.enum(["not_started", "in_progress", "complete"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof updateActionStatusSchema>;
  try {
    const body = await request.json();
    payload = updateActionStatusSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { data: existingAction, error: existingError } = await supabase
    .from("actions")
    .select("id, status, completed_at")
    .eq("id", id)
    .single();

  if (existingError || !existingAction) {
    if (existingError?.code === "PGRST116") {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: existingError?.message ?? "Failed to fetch action" },
      { status: 500 }
    );
  }

  let completedAt: Action["completed_at"] = existingAction.completed_at;
  if (payload.status === "complete" && existingAction.status !== "complete") {
    completedAt = new Date().toISOString();
  }
  if (payload.status !== "complete" && existingAction.status === "complete") {
    completedAt = null;
  }

  const { data: updatedAction, error: updateError } = await supabase
    .from("actions")
    .update({
      status: payload.status,
      completed_at: completedAt,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !updatedAction) {
    if (updateError?.code === "PGRST116") {
      return NextResponse.json({ error: "Action not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: updateError?.message ?? "Failed to update action" },
      { status: 500 }
    );
  }

  return NextResponse.json(updatedAction);
}
