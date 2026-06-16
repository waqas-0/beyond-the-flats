import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  let phone: unknown;
  try {
    ({ phone } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!phone || typeof phone !== "string") {
    return Response.json({ error: "Phone number is required." }, { status: 400 });
  }

  // Normalise: strip spaces/dashes, ensure E.164 format
  const normalised = phone.replace(/[\s\-().]/g, "");
  if (!/^\+\d{7,15}$/.test(normalised)) {
    return Response.json(
      { error: "Enter a valid international phone number (e.g. +1 242 555-0123)." },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    phone: normalised,
    options: { channel: "sms" },
  });

  if (error) {
    console.error("[send-otp]", error.message);
    // Provider rejects bad/unreachable numbers — that's a client input error,
    // not a server fault. Surface the provider message with a 4xx.
    const status = error.status && error.status >= 400 && error.status < 500 ? error.status : 422;
    return Response.json({ error: error.message }, { status });
  }

  return Response.json({ phone: normalised });
}
