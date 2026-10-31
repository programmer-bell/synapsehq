"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  addTaskCommentAction,
  createTaskSubtaskAction,
  removeTaskAttachmentAction,
  uploadTaskAttachmentAction,
} from "../actions/task-collaboration-actions";

type FormState = { status: "idle" | "error" | "success"; message?: string };

type Comment = {
  id: string;
  body: string;
  createdAt: Date;
  authorName: string;
};

type Subtask = {
  id: string;
  title: string;
  status: string;
};

type Attachment = {
  id: string;
  fileName: string;
  sizeBytes: number;
  createdAt: Date;
};

export function TaskCollaborationPanel({
  taskId,
  projectId,
  comments,
  subtasks,
  attachments,
  canEdit,
}: {
  taskId: string;
  projectId: string;
  comments: Comment[];
  subtasks: Subtask[];
  attachments: Attachment[];
  canEdit: boolean;
}) {
  const [commentState, commentAction, commenting] = useActionState<
    FormState,
    FormData
  >(addTaskCommentAction.bind(null, taskId), { status: "idle" });
  const [subtaskState, subtaskAction, addingSubtask] = useActionState<
    FormState,
    FormData
  >(createTaskSubtaskAction.bind(null, taskId), { status: "idle" });
  const [attachmentState, attachmentAction, uploading] = useActionState<
    FormState,
    FormData
  >(uploadTaskAttachmentAction.bind(null, taskId), { status: "idle" });

  return (
    <div className="space-y-4">
      <section className="rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Subtasks</h2>
        {subtasks.length ? (
          <ul className="mt-2 divide-y divide-border">
            {subtasks.map((subtask) => (
              <li
                key={subtask.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <Link
                  href={`/projects/${projectId}/tasks/${subtask.id}`}
                  className="text-sm text-foreground hover:text-accent"
                >
                  {subtask.title}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {subtask.status.replace("_", " ")}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No subtasks.</p>
        )}
        {canEdit ? (
          <form action={subtaskAction} className="mt-3 flex gap-2">
            <input
              name="title"
              required
              minLength={2}
              maxLength={160}
              placeholder="Subtask title"
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
            <button
              type="submit"
              disabled={addingSubtask}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted disabled:opacity-50"
            >
              Add
            </button>
          </form>
        ) : null}
        <FormMessage state={subtaskState} />
      </section>

      <section className="rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Attachments</h2>
        {attachments.length ? (
          <ul className="mt-2 divide-y divide-border">
            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center justify-between gap-3 py-2"
              >
                <a
                  href={`/api/tasks/${taskId}/attachments/${attachment.id}`}
                  className="truncate text-sm font-medium text-accent hover:underline"
                >
                  {attachment.fileName}
                </a>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {(attachment.sizeBytes / 1024).toFixed(0)} KB
                </span>
                {canEdit ? (
                  <form
                    action={removeTaskAttachmentAction.bind(
                      null,
                      taskId,
                      attachment.id,
                    )}
                  >
                    <button
                      type="submit"
                      className="text-xs text-muted-foreground hover:text-rose-700"
                    >
                      Remove
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No attachments.</p>
        )}
        {canEdit ? (
          <form action={attachmentAction} className="mt-3 flex flex-wrap gap-2">
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/png,image/jpeg,image/webp,text/plain"
              className="min-w-0 flex-1 text-xs text-muted-foreground file:mr-2 file:rounded-md file:border file:border-border file:bg-background file:px-2 file:py-1.5 file:text-xs file:text-foreground"
            />
            <button
              type="submit"
              disabled={uploading}
              className="rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground hover:bg-surface-muted disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </form>
        ) : null}
        <FormMessage state={attachmentState} />
      </section>

      <section className="rounded-md border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-foreground">Comments</h2>
        {comments.length ? (
          <ul className="mt-3 space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="border-l-2 border-border pl-3">
                <p className="whitespace-pre-wrap text-sm text-foreground">
                  {comment.body}
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {comment.authorName} · {comment.createdAt.toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No comments yet.</p>
        )}
        <form action={commentAction} className="mt-4 space-y-2">
          <textarea
            name="body"
            required
            maxLength={4000}
            rows={3}
            placeholder="Write a comment..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
          />
          <button
            type="submit"
            disabled={commenting}
            className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
          >
            {commenting ? "Posting..." : "Post comment"}
          </button>
        </form>
        <FormMessage state={commentState} />
      </section>
    </div>
  );
}

function FormMessage({ state }: { state: FormState }) {
  if (!state.message) return null;
  return (
    <p
      role={state.status === "error" ? "alert" : "status"}
      className={`mt-2 text-xs ${state.status === "error" ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}
    >
      {state.message}
    </p>
  );
}
