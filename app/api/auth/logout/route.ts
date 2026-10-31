import { logoutCurrentSession } from "@/src/modules/auth/services/session-service";

export async function POST() {
  await logoutCurrentSession();
  return new Response(
    JSON.stringify({ ok: true, message: "Logged out successfully." }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
}
