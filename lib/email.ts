type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

type SendEmailResult =
  | { ok: true; dev: true; fallback?: boolean }
  | { ok: true; dev: false }
  | { ok: false; dev: false };

function logDevEmail({ to, subject, html }: SendEmailInput, reason: string) {
  console.info(`[RefiLab email — dev mode: ${reason}]`, { to, subject, html });
}

export function getAppUrl() {
  const explicit =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}

export async function sendEmail({
  to,
  subject,
  html,
}: SendEmailInput): Promise<SendEmailResult> {
  const from =
    process.env.EMAIL_FROM || "RefiLab <onboarding@resend.dev>";
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    logDevEmail({ to, subject, html }, "no API key");
    if (process.env.NODE_ENV === "development") {
      return { ok: true, dev: true };
    }
    return { ok: false, dev: false };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      let resendMessage = "";
      try {
        const payload = JSON.parse(text) as { message?: string };
        resendMessage = payload.message ?? "";
      } catch {
        resendMessage = text;
      }

      console.error("Resend error", response.status, resendMessage || text);

      if (process.env.NODE_ENV === "development") {
        logDevEmail(
          { to, subject, html },
          resendMessage
            ? `Resend HTTP ${response.status}: ${resendMessage}`
            : `Resend HTTP ${response.status}`,
        );
        return { ok: true, dev: true, fallback: true };
      }

      return { ok: false, dev: false };
    }

    const result = (await response.json().catch(() => null)) as
      | { id?: string }
      | null;

    if (process.env.NODE_ENV === "development" && result?.id) {
      console.info("[RefiLab email] Resend accepted", {
        to,
        subject,
        id: result.id,
      });
    }

    return { ok: true, dev: false };
  } catch (error) {
    console.error("Resend fetch error", error);

    if (process.env.NODE_ENV === "development") {
      logDevEmail({ to, subject, html }, "network/SSL error");
      return { ok: true, dev: true, fallback: true };
    }

    return { ok: false, dev: false };
  }
}

export function emailLayout(title: string, body: string) {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <h1 style="font-size:20px;color:#0f3d6e">${title}</h1>
      <div style="color:#334155;line-height:1.6">${body}</div>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8">RefiLab — เครื่องมือเปรียบเทียบสินเชื่อบ้าน</p>
    </div>
  `;
}
