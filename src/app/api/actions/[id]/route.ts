import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["not_started", "in_progress", "complete"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServerSupabaseClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = updateStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { status } = parsed.data;

    const updateData: Record<string, unknown> = { status };
    if (status === "complete") {
      updateData.completed_at = new Date().toISOString();
    } else {
      updateData.completed_at = null;
    }

    // RLS policy "Users can update firm actions" handles authorization
    const { data: action, error: updateError } = await supabase
      .from("actions")
      .update(updateData)
      .eq("id", id)
      .select("*, regulatory_updates(title, impact_level)")
      .single();

    if (updateError) {
      if (updateError.code === "PGRST116") {
        return NextResponse.json({ error: "Action not found" }, { status: 404 });
      }
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(action);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
