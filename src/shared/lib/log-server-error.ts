type ErrorFields = {
  name?: string;
  message?: string;
  code?: string | number;
  detail?: string;
  hint?: string;
  stack?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getErrorFields(error: unknown): ErrorFields {
  if (!isRecord(error)) {
    return { message: String(error) };
  }

  const fields: ErrorFields = {};
  if (typeof error.name === "string") fields.name = error.name;
  if (typeof error.message === "string") fields.message = error.message;
  if (typeof error.code === "string" || typeof error.code === "number") {
    fields.code = error.code;
  }
  if (typeof error.detail === "string") fields.detail = error.detail;
  if (typeof error.hint === "string") fields.hint = error.hint;
  if (typeof error.stack === "string") fields.stack = error.stack;

  if (isRecord(error.cause)) {
    if (typeof error.cause.name === "string") {
      fields.name ??= error.cause.name;
    }
    if (typeof error.cause.message === "string") {
      fields.message ??= error.cause.message;
    }
    if (
      typeof error.cause.code === "string" ||
      typeof error.cause.code === "number"
    ) {
      fields.code ??= error.cause.code;
    }
    if (typeof error.cause.detail === "string") {
      fields.detail ??= error.cause.detail;
    }
    if (typeof error.cause.hint === "string") {
      fields.hint ??= error.cause.hint;
    }
    if (typeof error.cause.stack === "string") {
      fields.stack ??= error.cause.stack;
    }
  }

  return fields;
}

export function logServerError(
  context: string,
  error: unknown,
  metadata?: Record<string, string | number | boolean>,
): void {
  console.error(
    JSON.stringify({
      level: "error",
      context,
      ...metadata,
      error: getErrorFields(error),
    }),
  );
}
