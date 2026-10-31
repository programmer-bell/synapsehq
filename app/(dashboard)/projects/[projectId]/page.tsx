import Link from "next/link";
import { notFound } from "next/navigation";

import { requireUser } from "@/src/modules/auth";
import { getProjectAccess } from "@/src/modules/projects/services/project-service";
import { getWorkspaceAccess } from "@/src/modules/workspaces/services/workspace-service";
import { UpdateProjectForm } from "@/src/modules/projects/components/update-project-form";
import { deleteProjectAction } from "@/src/modules/projects/actions/project-actions";

type ProjectDetailPageProps = {
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { projectId } = await params;
  const user = await requireUser();
  const access = await getProjectAccess(user.id, projectId);

  if (!access) {
    notFound();
  }

  const workspaceAccess = await getWorkspaceAccess(user.id, access.workspaceId);
  const canManage = access.role === "OWNER" || access.role === "ADMIN" || access.createdBy === user.id;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-accent">Project</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            {access.project.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {access.project.status} · Created in workspace
          </p>
          {workspaceAccess ? (
            <Link
              href={`/workspaces/${workspaceAccess.workspace.id}`}
              className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
            >
              Back to {workspaceAccess.workspace.name}
            </Link>
          ) : null}
          <Link
            href={`/projects/${projectId}/tasks`}
            className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
          >
            View tasks
          </Link>
        </div>
        {canManage ? (
          <form action={deleteProjectAction.bind(null, projectId)}>
            <button
              type="submit"
              className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
            >
              Delete project
            </button>
          </form>
        ) : null}
      </div>

      <section className="rounded-2xl border border-border bg-surface p-6">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Details</h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
          {access.project.description || "No description provided."}
        </p>
      </section>

      {canManage ? (
        <section className="rounded-2xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">Edit project</h2>
          <div className="mt-4 max-w-2xl">
            <UpdateProjectForm
              projectId={projectId}
              initialName={access.project.name}
              initialDescription={access.project.description}
              initialStatus={access.project.status}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}