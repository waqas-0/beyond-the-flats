// Guide notifications — verification approvals/rejections.
//
// The product brief originally specced WhatsApp, but OTP was reverted to SMS
// and no messaging channel is wired yet. This module is the single seam where
// that integration will live: today it records the message (console) and
// no-ops cleanly when no provider is configured, so the approve/reject flow
// works end-to-end now. Swap the body of `deliver()` for Twilio/SMS later
// without touching any caller.

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
  /** "noop" until a real channel is configured. */
  channel: "noop";
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

/**
 * Notify a guide about a verification outcome.
 *
 * Never throws — notification failures must not roll back an approval. The
 * caller can inspect `sent` if it cares, but the verification decision is the
 * source of truth either way.
 */
export async function notifyGuide(input: NotifyInput): Promise<NotifyResult> {
  const message = composeMessage(input);

  // No channel configured yet: record and no-op so the flow stays unblocked.
  console.info(
    `[notify:${input.kind}] → ${input.phone ?? "(no phone on file)"}: ${message}`,
  );

  return { sent: false, channel: "noop", message };
}
