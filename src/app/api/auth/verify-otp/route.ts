import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { phone, token } = await request.json();

  if (!phone || !token) {
    return Response.json({ error: "Phone and token are required." }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) {
    console.error("[verify-otp]", error.message);
    return Response.json({ error: "Invalid or expired code." }, { status: 401 });
  }

  // Check whether this user already has a guide profile
  const { data: guide } = await supabase
    .from("guides")
    .select("id, verification_status")
    .eq("id", data.user!.id)
    .maybeSingle();

  return Response.json({
    hasProfile: !!guide,
    verificationStatus: guide?.verification_status ?? null,
  });
}
