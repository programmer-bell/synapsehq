const UNIQUE_VIOLATION_CODE = "23505";

export function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  const code = (error as { code?: unknown }).code;

  if (code === UNIQUE_VIOLATION_CODE) {
    return true;
  }

  return isUniqueViolation((error as { cause?: unknown }).cause);
}
