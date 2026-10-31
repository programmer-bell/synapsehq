/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TaskKanban } from "./task-kanban";

describe("TaskKanban", () => {
  it("renders task cards in their status columns", () => {
    render(
      <TaskKanban
        projectId="project-1"
        tasks={[
          {
            id: "task-1",
            title: "Implement login",
            description: null,
            status: "TODO",
            priority: "HIGH",
            assigneeId: null,
            dueDate: null,
          },
        ]}
      />,
    );

    expect(screen.getByText("Implement login")).toBeInTheDocument();
    expect(screen.getByText("To do")).toBeInTheDocument();
  });
});
