import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "notifications@getvara.co.uk";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from: `Vara <${FROM_EMAIL}>`,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

export async function sendHighPriorityAlert({
  to,
  updateTitle,
  summary,
  deadline,
  dashboardUrl,
}: {
  to: string;
  updateTitle: string;
  summary: string;
  deadline?: string;
  dashboardUrl: string;
}) {
  const deadlineHtml = deadline
    ? `<p style="color: #FF6B4A; font-weight: 600;">Deadline: ${deadline}</p>`
    : "";

  return sendEmail({
    to,
    subject: `[Vara] High Priority: ${updateTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1923; color: #ffffff; padding: 32px; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 700; letter-spacing: 0.09em;">VARA</span>
        </div>
        <div style="background: #1A2744; border-radius: 8px; padding: 24px; border-left: 4px solid #FF6B4A;">
          <p style="color: #FF6B4A; font-size: 12px; font-weight: 600; text-transform: uppercase; margin: 0 0 8px;">High Priority Update</p>
          <h2 style="margin: 0 0 12px; font-size: 18px; color: #ffffff;">${updateTitle}</h2>
          <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 12px;">${summary}</p>
          ${deadlineHtml}
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${dashboardUrl}" style="background: #2D7FF9; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">View in Dashboard</a>
        </div>
        <p style="color: #64748B; font-size: 12px; margin-top: 32px; text-align: center;">Vara — Regulation, decoded.</p>
      </div>
    `,
  });
}

export async function sendWeeklyDigest({
  to,
  updates,
  actionsCount,
  completedCount,
  dashboardUrl,
}: {
  to: string;
  updates: Array<{ title: string; impact: string }>;
  actionsCount: number;
  completedCount: number;
  dashboardUrl: string;
}) {
  const updatesHtml = updates
    .map(
      (u) =>
        `<li style="padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
          <span style="color: #ffffff;">${u.title}</span>
          <span style="color: ${u.impact === "high" ? "#FF6B4A" : u.impact === "medium" ? "#F5C542" : "#2D7FF9"}; font-size: 12px; margin-left: 8px;">${u.impact.toUpperCase()}</span>
        </li>`
    )
    .join("");

  return sendEmail({
    to,
    subject: `[Vara] Your Weekly Compliance Digest`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1923; color: #ffffff; padding: 32px; border-radius: 12px;">
        <div style="margin-bottom: 24px;">
          <span style="font-size: 20px; font-weight: 700; letter-spacing: 0.09em;">VARA</span>
        </div>
        <h2 style="font-size: 20px; margin: 0 0 24px;">Weekly Digest</h2>
        <div style="background: #1A2744; border-radius: 8px; padding: 24px;">
          <h3 style="font-size: 14px; color: #64748B; text-transform: uppercase; margin: 0 0 12px;">Recent Updates</h3>
          <ul style="list-style: none; padding: 0; margin: 0;">${updatesHtml}</ul>
        </div>
        <div style="margin-top: 24px; text-align: center;">
          <a href="${dashboardUrl}" style="background: #2D7FF9; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">Open Dashboard</a>
        </div>
        <p style="color: #64748B; font-size: 12px; margin-top: 32px; text-align: center;">Vara — Regulation, decoded.</p>
      </div>
    `,
  });
}
