import { loginSchema } from "@/src/modules/auth/schemas/auth";
import { loginUser } from "@/src/modules/auth/services/login-service";
import { getClientIp } from "@/src/modules/auth/lib/request";
import { setSessionCookie } from "@/src/modules/auth/lib/cookies";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON request body." }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const ip = await getClientIp();
  const result = await loginUser(parsed.data, { ip });

  if (!result.ok) {
    if (result.code === "RATE_LIMITED") {
      return new Response(
        JSON.stringify({
          error:
            "Too many failed attempts. Please wait a few minutes and try again.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    if (result.code === "INVALID_CREDENTIALS") {
      return new Response(
        JSON.stringify({ error: "Invalid email or password." }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "We could not sign you in. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  await setSessionCookie(result.token, result.expiresAt);

  return new Response(
    JSON.stringify({
      ok: true,
      user: result.user,
      token: result.token,
      expiresAt: result.expiresAt,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}
