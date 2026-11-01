"use client";

import { Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { CreateTaskForm } from "./create-task-form";

type CreateTaskDialogProps = {
  projectId: string;
  assignableUsers: { id: string; name: string; email: string }[];
  milestones: { id: string; name: string }[];
  defaultOpen?: boolean;
};

export function CreateTaskDialog({
  projectId,
  assignableUsers,
  milestones,
  defaultOpen = false,
}: CreateTaskDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (defaultOpen) dialogRef.current?.showModal();
  }, [defaultOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-indigo-500/25 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:via-violet-500 hover:to-fuchsia-500 active:scale-[0.98]"
      >
        <Plus aria-hidden="true" className="size-4" />
        New task
      </button>
      <dialog
        ref={dialogRef}
        aria-labelledby="create-task-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
        className="w-[min(94vw,680px)] overflow-hidden rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-slate-950/55 backdrop:backdrop-blur-sm"
      >
        <div className="relative border-b border-border bg-surface-muted/40 px-5 py-4">
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
          />
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/20">
                <Sparkles aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2
                  id="create-task-title"
                  className="text-base font-semibold tracking-tight"
                >
                  Create task
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Capture the work and assign it to the right teammate.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close create task dialog"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-all duration-200 hover:bg-surface-muted hover:text-foreground active:scale-95"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </div>
        </div>
        <div className="max-h-[78vh] overflow-y-auto p-5">
          <CreateTaskForm
            projectId={projectId}
            assignableUsers={assignableUsers}
            milestones={milestones}
          />
        </div>
      </dialog>
    </>
  );
}
