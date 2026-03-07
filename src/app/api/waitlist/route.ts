import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.string().trim().min(1).max(80).optional(),
  entryPoint: z.string().trim().min(1).max(80).optional(),
});

export async function POST(request: Request) {
  let payload: z.infer<typeof waitlistSchema>;
  try {
    payload = waitlistSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("prelaunch_waitlist_emails")
    .insert({
      email: payload.email,
      source: payload.source ?? "landing_page",
      entry_point: payload.entryPoint ?? "unknown",
    });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Unable to save your request." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
