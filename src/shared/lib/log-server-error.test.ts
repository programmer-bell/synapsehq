import { afterEach, describe, expect, it, vi } from "vitest";

import { logServerError } from "./log-server-error";

describe("logServerError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("logs structured driver diagnostics and safe metadata", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = Object.assign(new Error("Database query failed"), {
      code: "42P01",
      detail: "The relation does not exist.",
      hint: "Apply the pending migration.",
    });

    logServerError("task list failed", error, { projectId: "project-1" });

    expect(consoleError).toHaveBeenCalledOnce();
    const record = JSON.parse(String(consoleError.mock.calls[0][0]));
    expect(record).toMatchObject({
      level: "error",
      context: "task list failed",
      projectId: "project-1",
      error: {
        name: "Error",
        message: "Database query failed",
        code: "42P01",
        detail: "The relation does not exist.",
        hint: "Apply the pending migration.",
      },
    });
    expect(record.error.stack).toContain("Database query failed");
  });
});
