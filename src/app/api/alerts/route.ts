import { sendHighPriorityAlert, sendWeeklyDigest } from "@/lib/email";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const alertsSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("high_priority"),
    update_id: z.string().uuid(),
  }),
  z.object({
    type: z.literal("weekly_digest"),
  }),
]);

function getDashboardBaseUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function formatDeadline(deadline: string | null) {
  if (!deadline) {
    return undefined;
  }

  return new Date(deadline).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");
  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: z.infer<typeof alertsSchema>;
  try {
    const body = await request.json();
    payload = alertsSchema.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const dashboardBaseUrl = getDashboardBaseUrl();

  if (payload.type === "high_priority") {
    const { data: update, error: updateError } = await supabase
      .from("regulatory_updates")
      .select("id, title, summary, deadline, practice_areas")
      .eq("id", payload.update_id)
      .single();

    if (updateError || !update) {
      return NextResponse.json({ error: "Update not found" }, { status: 404 });
    }

    let firmIds: string[] | null = null;

    if (update.practice_areas.length > 0) {
      const { data: firms, error: firmsError } = await supabase
        .from("firms")
        .select("id")
        .overlaps("practice_areas", update.practice_areas);

      if (firmsError) {
        return NextResponse.json(
          { error: firmsError.message },
          { status: 500 }
        );
      }

      firmIds = (firms ?? []).map((firm) => firm.id);
    }

    let usersQuery = supabase
      .from("users")
      .select("email, firm_id")
      .contains("notification_preferences", { high_priority: true })
      .not("firm_id", "is", null);

    if (firmIds) {
      if (firmIds.length === 0) {
        return NextResponse.json({
          type: payload.type,
          attempted: 0,
          sent: 0,
          failed: 0,
        });
      }

      usersQuery = usersQuery.in("firm_id", firmIds);
    }

    const { data: users, error: usersError } = await usersQuery;

    if (usersError) {
      return NextResponse.json(
        { error: usersError.message },
        { status: 500 }
      );
    }

    let attempted = 0;
    let sent = 0;

    for (const recipient of users ?? []) {
      attempted += 1;
      const result = await sendHighPriorityAlert({
        to: recipient.email,
        updateTitle: update.title,
        summary:
          update.summary ??
          "A high-priority SRA regulatory update requires your attention.",
        deadline: formatDeadline(update.deadline),
        dashboardUrl: `${dashboardBaseUrl}/dashboard/feed`,
      });

      if (result.success) {
        sent += 1;
      }
    }

    return NextResponse.json({
      type: payload.type,
      attempted,
      sent,
      failed: attempted - sent,
    });
  }

  const sevenDaysAgo = new Date(
    Date.now() - 7 * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: updates, error: updatesError } = await supabase
    .from("regulatory_updates")
    .select("title, impact_level")
    .eq("status", "published")
    .gte("publication_date", sevenDaysAgo)
    .order("publication_date", { ascending: false });

  if (updatesError) {
    return NextResponse.json({ error: updatesError.message }, { status: 500 });
  }

  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("email, firm_id")
    .contains("notification_preferences", { weekly_digest: true })
    .not("firm_id", "is", null);

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const { data: actions, error: actionsError } = await supabase
    .from("actions")
    .select("firm_id, status");

  if (actionsError) {
    return NextResponse.json({ error: actionsError.message }, { status: 500 });
  }

  const actionCountsByFirm = new Map<string, { total: number; completed: number }>();

  for (const action of actions ?? []) {
    const existing = actionCountsByFirm.get(action.firm_id) ?? {
      total: 0,
      completed: 0,
    };

    existing.total += 1;
    if (action.status === "complete") {
      existing.completed += 1;
    }

    actionCountsByFirm.set(action.firm_id, existing);
  }

  let attempted = 0;
  let sent = 0;

  for (const recipient of users ?? []) {
    if (!recipient.firm_id) {
      continue;
    }

    attempted += 1;

    const counts = actionCountsByFirm.get(recipient.firm_id) ?? {
      total: 0,
      completed: 0,
    };

    const result = await sendWeeklyDigest({
      to: recipient.email,
      updates: (updates ?? []).map((update) => ({
        title: update.title,
        impact: update.impact_level,
      })),
      actionsCount: counts.total,
      completedCount: counts.completed,
      dashboardUrl: `${dashboardBaseUrl}/dashboard`,
    });

    if (result.success) {
      sent += 1;
    }
  }

  return NextResponse.json({
    type: payload.type,
    attempted,
    sent,
    failed: attempted - sent,
  });
}
