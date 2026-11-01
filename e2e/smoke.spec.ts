import { expect, test } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /a clearer view of your team's work/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Create account" }),
  ).toHaveAttribute("href", "/signup");
  await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
    "href",
    "/login",
  );
});

test("login page shows the registered account confirmation", async ({
  page,
}) => {
  await page.goto("/login?registered=1");

  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toHaveText(
    "Account created. Sign in with your new credentials.",
  );
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
});

test("signup and login pages link to each other", async ({ page }) => {
  await page.goto("/signup");
  await expect(
    page.getByRole("heading", { name: "Create your account" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
});

test("unauthenticated dashboard redirects to login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("unauthenticated workspace routes redirect to login", async ({ page }) => {
  await page.goto("/workspaces");
  await expect(page).toHaveURL(/\/login/);
});

test("authenticated users can create and collaborate on project tasks", async ({
  page,
}) => {
  test.skip(
    !process.env.TEST_DATABASE_URL,
    "Set TEST_DATABASE_URL to an isolated database for authenticated E2E.",
  );

  const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  const email = `e2e-${suffix}@example.com`;
  const password = "e2e-secure-password";
  const workspaceName = `E2E Workspace ${suffix}`;
  const projectName = `E2E Project ${suffix}`;
  const milestoneName = `E2E Milestone ${suffix}`;
  const taskName = `E2E Task ${suffix}`;

  await page.goto("/signup");
  await page.getByLabel("Name").fill("E2E Member");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password").fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/login\?registered=1$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/workspaces");
  await page.getByLabel("Workspace name").fill(workspaceName);
  await page.getByRole("button", { name: "Create workspace" }).click();
  await expect(
    page.getByRole("heading", { name: workspaceName }),
  ).toBeVisible();
  const workspaceId = new URL(page.url()).pathname.split("/").at(-1);
  if (!workspaceId) throw new Error("Workspace route did not include an ID.");

  await page.getByRole("button", { name: "New project" }).click();
  await page.getByLabel("Project name").fill(projectName);
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Create project", exact: true })
    .click();
  await expect(page).toHaveURL(/\/projects\/[0-9a-f-]+$/);
  const projectId = new URL(page.url()).pathname.split("/").at(-1);
  if (!projectId) throw new Error("Project route did not include an ID.");

  await page.goto(`/projects/${projectId}/milestones`);
  await page.getByLabel("Milestone name").fill(milestoneName);
  await page.getByRole("button", { name: "Add milestone" }).click();
  await expect(
    page.getByRole("heading", { name: milestoneName }),
  ).toBeVisible();

  await page.goto(`/projects/${projectId}/tasks?new=1`);
  const taskDialog = page.getByRole("dialog");
  await expect(taskDialog).toBeVisible();
  await page.getByLabel("Title", { exact: true }).fill(taskName);
  await page.getByLabel("Milestone").selectOption({ label: milestoneName });
  await page.getByRole("button", { name: "Create task" }).click();
  await expect(page.getByRole("status")).toContainText("Task created");
  await taskDialog
    .getByRole("button", { name: "Close create task dialog", exact: true })
    .click();
  await page.getByRole("link", { name: taskName }).click();
  await expect(page.getByRole("heading", { name: taskName })).toBeVisible();

  await page.getByPlaceholder("Subtask title").fill("Add workflow tests");
  await page.getByRole("button", { name: "Add", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Add workflow tests" }),
  ).toBeVisible();

  await page.getByPlaceholder("Write a comment...").fill("Ready for review.");
  await page.getByRole("button", { name: "Post comment" }).click();
  await expect(page.getByText("Ready for review.")).toBeVisible();

  await page.locator('input[name="file"]').setInputFiles({
    name: "notes.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("release notes"),
  });
  await page.getByRole("button", { name: "Upload" }).click();
  await expect(page.getByRole("link", { name: "notes.txt" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Activity" })).toBeVisible();
});
