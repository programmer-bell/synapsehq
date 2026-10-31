"use client";

import { useRef } from "react";

import { CreateProjectForm } from "./create-project-form";

type CreateProjectDialogProps = {
  workspaceId: string;
};

export function CreateProjectDialog({ workspaceId }: CreateProjectDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        New project
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">
            Create project
          </h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-surface-muted"
          >
            Close
          </button>
        </div>
        <div className="mt-6">
          <CreateProjectForm workspaceId={workspaceId} />
        </div>
      </dialog>
    </>
  );
}
