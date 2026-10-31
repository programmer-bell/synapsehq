import { getCurrentUser } from "@/src/modules/auth/services/session-service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response(JSON.stringify({ ok: true, user }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
