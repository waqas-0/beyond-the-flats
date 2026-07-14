// Guide notifications — verification approvals/rejections.
//
// Channel is SMS (WhatsApp was dropped). Sent via Twilio's Messages API using
// plain fetch (no SDK dependency). This is the single seam every approve/reject
// flows through.
//
// Required env vars to actually send (otherwise it safely no-ops + logs):
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_MESSAGING_SERVICE_SID   (preferred)  — or —  TWILIO_FROM_NUMBER
//
// Even when SMS isn't configured, the guide still sees their status + rejection
// reason in-app on their profile page, so they're never left in the dark.

export type NotifyKind = "approved" | "rejected";

export type NotifyInput = {
  phone: string | null | undefined;
  kind: NotifyKind;
  /** Guide's name, for a friendlier message. */
  name?: string | null;
  /** Required when kind === "rejected". */
  reason?: string | null;
};

export type NotifyResult = {
  sent: boolean;
  channel: "sms" | "noop";
  message: string;
};

function composeMessage({ kind, name, reason }: NotifyInput): string {
  const who = name?.trim() ? name.trim() : "Guide";
  if (kind === "approved") {
    return `Beyond The Flats: Congratulations ${who}, your guide profile has been verified. Your QR code is now ready in the app.`;
  }
  const why = reason?.trim() ? ` Reason: ${reason.trim()}` : "";
  return `Beyond The Flats: Hi ${who}, we couldn't verify your guide application yet.${why} Please update your details and re-submit.`;
}

function smsConfig() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || (!messagingServiceSid && !from)) return null;
  return { accountSid, authToken, messagingServiceSid, from };
}

async function sendSms(to: string, body: string): Promise<void> {
  const cfg = smsConfig();
  if (!cfg) throw new Error("SMS not configured");

  const params = new URLSearchParams();
  params.set("To", to);
  params.set("Body", body);
  if (cfg.messagingServiceSid) params.set("MessagingServiceSid", cfg.messagingServiceSid);
  else params.set("From", cfg.from!);

  const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    },
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Twilio ${res.status}: ${detail.slice(0, 200)}`);
  }
}

/**
 * Notify a guide about a verification outcome via SMS.
 *
 * Never throws — a notification failure must not roll back an approval. The
 * verification decision is the source of truth either way; the caller can
 * inspect `sent` if it cares.
 */
export async function notifyGuide(input: NotifyInput): Promise<NotifyResult> {
  const message = composeMessage(input);

  // No channel configured, or no phone on file → record and no-op.
  if (!smsConfig() || !input.phone) {
    console.info(
      `[notify:${input.kind}] (not sent) → ${input.phone ?? "no phone"}: ${message}`,
    );
    return { sent: false, channel: "noop", message };
  }

  try {
    await sendSms(input.phone, message);
    console.info(`[notify:${input.kind}] SMS sent → ${input.phone}`);
    return { sent: true, channel: "sms", message };
  } catch (err) {
    console.error(
      `[notify:${input.kind}] SMS send failed:`,
      err instanceof Error ? err.message : err,
    );
    return { sent: false, channel: "sms", message };
  }
}
