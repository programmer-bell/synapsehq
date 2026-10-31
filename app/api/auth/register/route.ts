import { registerUser } from "@/src/modules/auth/services/registration-service";
import { signupSchema } from "@/src/modules/auth/schemas/auth";

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

  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Please correct the highlighted fields.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const result = await registerUser(parsed.data);

  if (!result.ok) {
    if (result.code === "EMAIL_TAKEN") {
      return new Response(
        JSON.stringify({
          error: "An account with this email already exists.",
        }),
        { status: 409, headers: { "Content-Type": "application/json" } },
      );
    }
    return new Response(
      JSON.stringify({
        error: "We could not create your account. Please try again.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      ok: true,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}