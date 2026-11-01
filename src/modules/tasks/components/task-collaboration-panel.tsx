"use client";

import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  Download,
  ListChecks,
  MessageSquare,
  Paperclip,
  Send,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useActionState, useEffect } from "react";
import type { ReactNode } from "react";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { inputClass } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/src/shared/lib/cn";
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

function SectionCard({
  icon,
  title,
  description,
  action,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-border/70 bg-surface-muted/30 px-4 py-3">
        <div className="flex items-start gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
            {icon}
          </span>
          <div>
            <h2 className="text-sm font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

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
  const { toast } = useToast();
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

  useEffect(() => {
    if (commentState.status === "success") {
      toast({
        title: "Comment posted",
        description: commentState.message,
        variant: "success",
      });
    } else if (commentState.status === "error" && commentState.message) {
      toast({
        title: "Could not post comment",
        description: commentState.message,
        variant: "error",
      });
    }
  }, [commentState.status, commentState.message, toast]);

  useEffect(() => {
    if (subtaskState.status === "success") {
      toast({
        title: "Subtask added",
        description: subtaskState.message,
        variant: "success",
      });
    } else if (subtaskState.status === "error" && subtaskState.message) {
      toast({
        title: "Could not add subtask",
        description: subtaskState.message,
        variant: "error",
      });
    }
  }, [subtaskState.status, subtaskState.message, toast]);

  useEffect(() => {
    if (attachmentState.status === "success") {
      toast({
        title: "Attachment uploaded",
        description: attachmentState.message,
        variant: "success",
      });
    } else if (attachmentState.status === "error" && attachmentState.message) {
      toast({
        title: "Could not upload attachment",
        description: attachmentState.message,
        variant: "error",
      });
    }
  }, [attachmentState.status, attachmentState.message, toast]);

  const completedSubtasks = subtasks.filter(
    (subtask) => subtask.status === "DONE",
  ).length;
  const subtaskPercent = subtasks.length
    ? Math.round((completedSubtasks / subtasks.length) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <SectionCard
        icon={<ListChecks aria-hidden="true" className="size-4" />}
        title="Subtasks"
        description={`${completedSubtasks} of ${subtasks.length} complete`}
        action={
          subtasks.length ? (
            <Badge variant={subtaskPercent === 100 ? "success" : "violet"}>
              {subtaskPercent}%
            </Badge>
          ) : null
        }
      >
        {subtasks.length ? (
          <>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 transition-[width] duration-500"
                style={{ width: `${subtaskPercent}%` }}
              />
            </div>
            <ul className="divide-y divide-border/70">
              {subtasks.map((subtask) => {
                const done = subtask.status === "DONE";
                return (
                  <li
                    key={subtask.id}
                    className="flex items-center justify-between gap-3 py-2"
                  >
                    <Link
                      href={`/projects/${projectId}/tasks/${subtask.id}`}
                      className="flex min-w-0 items-center gap-2 text-sm text-foreground transition-colors hover:text-accent"
                    >
                      {done ? (
                        <CheckCircle2
                          aria-hidden="true"
                          className="size-4 shrink-0 text-emerald-500"
                        />
                      ) : (
                        <Circle
                          aria-hidden="true"
                          className="size-4 shrink-0 text-muted-foreground/50"
                        />
                      )}
                      <span
                        className={cn(
                          "truncate",
                          done && "line-through opacity-60",
                        )}
                      >
                        {subtask.title}
                      </span>
                    </Link>
                    <Badge variant={done ? "success" : "outline"}>
                      {subtask.status.replace("_", " ")}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-surface-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
            No subtasks yet. Break this task into smaller steps.
          </p>
        )}
        {canEdit ? (
          <form action={subtaskAction} className="mt-3 flex gap-2">
            <input
              name="title"
              required
              minLength={2}
              maxLength={160}
              placeholder="Add a subtask..."
              className={inputClass}
            />
            <Button type="submit" size="sm" loading={addingSubtask}>
              {addingSubtask ? "Adding..." : "Add"}
            </Button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard
        icon={<Paperclip aria-hidden="true" className="size-4" />}
        title="Attachments"
        description={`${attachments.length} file${attachments.length === 1 ? "" : "s"}`}
      >
        {attachments.length ? (
          <ul className="divide-y divide-border/70">
            {attachments.map((attachment) => (
              <li
                key={attachment.id}
                className="flex items-center gap-3 py-2.5"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-300">
                  <Paperclip aria-hidden="true" className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <a
                    href={`/api/tasks/${taskId}/attachments/${attachment.id}`}
                    className="flex items-center gap-1 truncate text-sm font-medium text-accent hover:underline"
                  >
                    {attachment.fileName}
                    <Download
                      aria-hidden="true"
                      className="size-3 shrink-0 opacity-60"
                    />
                  </a>
                  <p className="text-[10px] text-muted-foreground">
                    {(attachment.sizeBytes / 1024).toFixed(0)} KB ·{" "}
                    <span suppressHydrationWarning>
                      {attachment.createdAt.toLocaleDateString()}
                    </span>
                  </p>
                </div>
                {canEdit ? (
                  <form
                    action={removeTaskAttachmentAction.bind(
                      null,
                      taskId,
                      attachment.id,
                    )}
                  >
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${attachment.fileName}`}
                      className="size-7 rounded-md text-muted-foreground hover:bg-rose-500/10 hover:text-rose-600 dark:hover:text-rose-300"
                    >
                      <Trash2 aria-hidden="true" className="size-3.5" />
                    </Button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-surface-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
            No attachments yet. Add specs, screenshots, or documents.
          </p>
        )}
        {canEdit ? (
          <form action={attachmentAction} className="mt-3 flex flex-wrap gap-2">
            <input
              name="file"
              type="file"
              required
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,application/pdf,image/png,image/jpeg,image/webp,text/plain"
              className="min-w-0 flex-1 text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border file:border-border file:bg-background file:px-2.5 file:py-1.5 file:text-xs file:font-medium file:text-foreground hover:file:bg-surface-muted"
            />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              loading={uploading}
            >
              <Upload aria-hidden="true" className="size-3.5" />
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </form>
        ) : null}
      </SectionCard>

      <SectionCard
        icon={<MessageSquare aria-hidden="true" className="size-4" />}
        title="Comments"
        description={`${comments.length} comment${comments.length === 1 ? "" : "s"}`}
      >
        {comments.length ? (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex gap-2.5">
                <Avatar name={comment.authorName} size="sm" />
                <div className="min-w-0 flex-1 rounded-lg border border-border/70 bg-surface-muted/30 px-3 py-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground">
                      {comment.authorName}
                    </span>
                    <span
                      suppressHydrationWarning
                      className="text-[10px] text-muted-foreground"
                    >
                      {comment.createdAt.toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
                    {comment.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-lg border border-dashed border-border bg-surface-muted/20 px-3 py-4 text-center text-xs text-muted-foreground">
            No comments yet. Start the conversation.
          </p>
        )}
        <form action={commentAction} className="mt-4 space-y-2">
          <textarea
            name="body"
            required
            maxLength={4000}
            rows={3}
            placeholder="Write a comment..."
            className={inputClass}
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={commenting}>
              <Send aria-hidden="true" className="size-3.5" />
              {commenting ? "Posting..." : "Post comment"}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
