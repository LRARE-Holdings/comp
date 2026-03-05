import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// This endpoint is called by a Supabase database trigger or webhook
// when a new auth user is created. It creates the firm and user profile.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { record } = body; // Supabase webhook payload

    if (!record?.id || !record?.email) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const metadata = record.raw_user_meta_data || {};

    // Create firm if metadata includes firm info
    let firmId = null;
    if (metadata.firm_name) {
      const sizeBand = metadata.size_band || "1-5";
      const tier =
        sizeBand === "1-5" ? "solo" :
        sizeBand === "6-20" ? "small" :
        sizeBand === "21-50" ? "mid" : "enterprise";

      const { data: firm, error: firmError } = await supabase
        .from("firms")
        .insert({
          name: metadata.firm_name,
          sra_number: metadata.sra_number || null,
          size_band: sizeBand,
          practice_areas: metadata.practice_areas || [],
          role_types: [],
          subscription_tier: tier,
          subscription_status: "trial",
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (firmError) {
        console.error("Firm creation error:", firmError);
      } else {
        firmId = firm.id;
      }
    }

    // Create user profile
    const { error: userError } = await supabase.from("users").insert({
      auth_id: record.id,
      firm_id: firmId,
      email: record.email,
      full_name: metadata.full_name || record.email,
      role: metadata.role || "colp",
      notification_preferences: {
        high_priority: true,
        deadlines: true,
        weekly_digest: true,
        frequency: "immediate",
      },
    });

    if (userError) {
      console.error("User profile creation error:", userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
