"use client";

import { useRef } from "react";

import { CreateTaskForm } from "./create-task-form";

type CreateTaskDialogProps = {
  projectId: string;
  assignableUsers: { id: string; name: string; email: string }[];
};

export function CreateTaskDialog({ projectId, assignableUsers }: CreateTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="rounded-lg bg-accent px-4 py-2.5 text-sm font-medium text-accent-foreground transition hover:opacity-90"
      >
        New task
      </button>
      <dialog
        ref={dialogRef}
        className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 text-foreground shadow-xl backdrop:bg-black/40"
      >
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold tracking-tight">Create task</h2>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-border px-3 py-1.5 text-sm text-foreground transition hover:bg-surface-muted"
          >
            Close
          </button>
        </div>
        <div className="mt-6">
          <CreateTaskForm projectId={projectId} assignableUsers={assignableUsers} />
        </div>
      </dialog>
    </>
  );
}