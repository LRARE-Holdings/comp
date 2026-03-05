import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { sendHighPriorityAlert, sendWeeklyDigest } from "@/lib/email";

const alertSchema = z.object({
  type: z.enum(["high_priority", "weekly_digest"]),
  update_id: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get("authorization");
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const parsed = alertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, update_id } = parsed.data;
    const supabase = createServiceRoleClient();
    const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://app.getvara.co.uk"}/dashboard`;

    if (type === "high_priority") {
      if (!update_id) {
        return NextResponse.json(
          { error: "update_id is required for high_priority alerts" },
          { status: 400 }
        );
      }

      const { data: update, error: updateError } = await supabase
        .from("regulatory_updates")
        .select("*")
        .eq("id", update_id)
        .single();

      if (updateError || !update) {
        return NextResponse.json({ error: "Update not found" }, { status: 404 });
      }

      // Find firms with overlapping practice areas
      const { data: firms } = await supabase
        .from("firms")
        .select("id, practice_areas");

      const matchingFirmIds = (firms ?? [])
        .filter((firm) =>
          firm.practice_areas.some((area: string) =>
            update.practice_areas.includes(area)
          )
        )
        .map((firm) => firm.id);

      if (matchingFirmIds.length === 0) {
        return NextResponse.json({ sent: 0, message: "No matching firms" });
      }

      const { data: users } = await supabase
        .from("users")
        .select("email, notification_preferences")
        .in("firm_id", matchingFirmIds);

      type NotifPrefs = { high_priority?: boolean };
      const recipients = (users ?? []).filter(
        (u) => (u.notification_preferences as NotifPrefs)?.high_priority === true
      );

      let sent = 0;
      for (const recipient of recipients) {
        const result = await sendHighPriorityAlert({
          to: recipient.email,
          updateTitle: update.title,
          summary: update.summary || "",
          deadline: update.deadline ?? undefined,
          dashboardUrl,
        });
        if (result.success) sent++;
      }

      return NextResponse.json({ sent, total: recipients.length });
    }

    if (type === "weekly_digest") {
      const sevenDaysAgo = new Date(
        Date.now() - 7 * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data: recentUpdates } = await supabase
        .from("regulatory_updates")
        .select("id, title, impact_level, practice_areas")
        .eq("status", "published")
        .gte("publication_date", sevenDaysAgo)
        .order("publication_date", { ascending: false });

      if (!recentUpdates || recentUpdates.length === 0) {
        return NextResponse.json({ sent: 0, message: "No recent updates" });
      }

      const { data: users } = await supabase
        .from("users")
        .select("email, firm_id, notification_preferences, firms(practice_areas)");

      type NotifPrefs = { weekly_digest?: boolean };
      const digestRecipients = (users ?? []).filter(
        (u) => (u.notification_preferences as NotifPrefs)?.weekly_digest === true
      );

      let sent = 0;
      for (const recipient of digestRecipients) {
        const firmAreas =
          (recipient.firms as { practice_areas: string[] } | null)
            ?.practice_areas ?? [];

        const relevantUpdates =
          firmAreas.length > 0
            ? recentUpdates.filter((u) =>
                u.practice_areas.some((area: string) =>
                  firmAreas.includes(area)
                )
              )
            : recentUpdates;

        if (relevantUpdates.length === 0) continue;

        const { count: actionsCount } = await supabase
          .from("actions")
          .select("*", { count: "exact", head: true })
          .eq("firm_id", recipient.firm_id ?? "");

        const { count: completedCount } = await supabase
          .from("actions")
          .select("*", { count: "exact", head: true })
          .eq("firm_id", recipient.firm_id ?? "")
          .eq("status", "complete");

        const result = await sendWeeklyDigest({
          to: recipient.email,
          updates: relevantUpdates.map((u) => ({
            title: u.title,
            impact: u.impact_level,
          })),
          actionsCount: actionsCount ?? 0,
          completedCount: completedCount ?? 0,
          dashboardUrl,
        });
        if (result.success) sent++;
      }

      return NextResponse.json({ sent, total: digestRecipients.length });
    }

    return NextResponse.json({ error: "Unknown type" }, { status: 400 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
