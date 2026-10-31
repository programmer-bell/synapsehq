export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type AuthField = "name" | "email" | "password" | "confirmPassword";

export type AuthFieldErrors = Partial<Record<AuthField, string[]>>;

export type AuthFormState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: AuthFieldErrors;
};

export type RegistrationResult =
  { ok: true; user: AuthUser } | { ok: false; code: "EMAIL_TAKEN" | "UNKNOWN" };

export type LoginResult =
  | {
      ok: true;
      user: AuthUser;
      token: string;
      expiresAt: Date;
    }
  | {
      ok: false;
      code: "INVALID_CREDENTIALS" | "RATE_LIMITED" | "UNKNOWN";
    };
