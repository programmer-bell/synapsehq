import { describe, expect, it } from "vitest";

import { createUniqueWorkspaceSlug, slugifyWorkspaceName } from "./slug";

describe("slugifyWorkspaceName", () => {
  it("normalizes names into URL-safe slugs", () => {
    expect(slugifyWorkspaceName("  Engineering Platform  ")).toBe(
      "engineering-platform",
    );
  });

  it("collapses repeated separators", () => {
    expect(slugifyWorkspaceName("A---B___C")).toBe("a-b-c");
  });

  it("falls back to workspace for empty input", () => {
    expect(slugifyWorkspaceName("!!!")).toBe("workspace");
  });

  it("truncates long slugs", () => {
    expect(slugifyWorkspaceName("a".repeat(200)).length).toBeLessThanOrEqual(120);
  });
});

describe("createUniqueWorkspaceSlug", () => {
  it("appends a suffix when the slug exists", async () => {
    const existing = new Set(["engineering-platform"]);

    const slug = await createUniqueWorkspaceSlug("Engineering Platform", async (candidate) =>
      existing.has(candidate),
    );

    expect(slug).toBe("engineering-platform-2");
  });
});