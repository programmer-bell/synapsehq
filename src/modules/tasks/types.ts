export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Task = {
  id: string;
  projectId: string;
  parentTaskId: string | null;
  milestoneId: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string | null;
  dueDate: Date | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
};

export type TaskField =
  | "title"
  | "description"
  | "status"
  | "priority"
  | "assigneeId"
  | "milestoneId"
  | "dueDate";

export type TaskFormState = {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Partial<Record<TaskField, string[]>>;
};

export type TaskSortBy =
  "createdAt" | "dueDate" | "priority" | "title" | "status";

export type TaskSortDirection = "asc" | "desc";

export type TaskFilters = {
  search?: string;
  status?: TaskStatus | "ALL";
  priority?: TaskPriority | "ALL";
  assigneeId?: string | "ALL" | "UNASSIGNED";
  dueBefore?: string;
  dueAfter?: string;
  sortBy?: TaskSortBy;
  sortDirection?: TaskSortDirection;
  page?: number;
  pageSize?: number;
};
