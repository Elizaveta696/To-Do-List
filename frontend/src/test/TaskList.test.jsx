// src/test/TaskList.test.jsx

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the api module used by TaskList
vi.mock("../api/tasks", () => ({
	fetchTasks: vi.fn(),
	updateTask: vi.fn(),
	removeTask: vi.fn(),
}));

import { fetchTasks, removeTask, updateTask } from "../api/tasks";
import TaskList from "../components/TaskList";

describe("TaskList (unit)", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		// Default confirm true; individual tests can override
		global.confirm = () => true;
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("shows 'No tasks yet' when fetchTasks returns []", async () => {
		fetchTasks.mockResolvedValueOnce([]);
		render(<TaskList />);
		// Component now renders column-specific empty messages
		expect(
			await screen.findByText(/No medium priority tasks/i),
		).toBeInTheDocument();
		expect(fetchTasks).toHaveBeenCalled();
	});

	it("toggles complete via updateTask and updates UI class", async () => {
		const t = { id: "a", title: "Test", description: "", completed: false };
		fetchTasks.mockResolvedValueOnce([t]);
		updateTask.mockResolvedValueOnce({ ...t, completed: true });

		render(<TaskList />);

		const titleEl = await screen.findByText(t.title);
		const card = titleEl.closest("article");
		const completeBtn = within(card).getByRole("button", { name: /complete/i });

		await userEvent.click(completeBtn);

		expect(updateTask).toHaveBeenCalledWith(t.id, { completed: true });

		await waitFor(() => {
			expect(screen.getByText(t.title)).toHaveClass("task-completed");
		});
	});

	it("calls updateTask to mark the task completed and updates the UI", async () => {
		const task = {
			id: "done-1",
			title: "Do the thing",
			description: "desc",
			completed: false,
		};
		const toggled = { ...task, completed: true };

		fetchTasks.mockResolvedValueOnce([task]);
		updateTask.mockResolvedValueOnce(toggled);

		render(<TaskList />);

		// Wait for the task to appear
		const titleEl = await screen.findByText(task.title);
		const card = titleEl.closest("article");
		expect(card).toBeTruthy();

		const completeBtn = within(card).getByRole("button", { name: /complete/i });
		await userEvent.click(completeBtn);

		// updateTask should be called to toggle completed
		expect(updateTask).toHaveBeenCalledWith(task.id, { completed: true });

		// Wait for the DOM to reflect updated completed state (component applies 'task-completed' class)
		await waitFor(() => {
			const titleAfter = screen.getByText(task.title);
			expect(titleAfter).toHaveClass("task-completed");
		});

		// The action button text should now show "Undo"
		expect(
			within(card).getByRole("button", { name: /undo/i }),
		).toBeInTheDocument();
	});

	it("deletes a task after confirm", async () => {
		const t = {
			id: "b",
			title: "Delete me",
			description: "",
			completed: false,
		};
		fetchTasks.mockResolvedValueOnce([t]);
		removeTask.mockResolvedValueOnce({});

		render(<TaskList />);

		const titleEl = await screen.findByText(t.title);
		const card = titleEl.closest("article");
		// Find the delete button by its accessible name (aria-label 'Delete task')
		const deleteBtn = within(card).getByRole("button", { name: /delete/i });

		await userEvent.click(deleteBtn);

		expect(removeTask).toHaveBeenCalledWith(t.id);
		await waitFor(() =>
			expect(screen.queryByText(t.title)).not.toBeInTheDocument(),
		);
	});

	it("shows priority and due date", async () => {
		const t = {
			id: "c",
			title: "Priority Test",
			description: "desc",
			completed: false,
			priority: "high",
			dueDate: "2025-10-21T00:00:00.000Z",
		};
		fetchTasks.mockResolvedValueOnce([t]);
		render(<TaskList />);
		const titleEl = await screen.findByText(t.title);
		const card = titleEl.parentElement.parentElement; // h3 > div > article
		expect(within(card).getByText(/Priority: High/i)).toBeInTheDocument();
		expect(within(card).getByText(/Due:/i)).toBeInTheDocument();
	});
});
