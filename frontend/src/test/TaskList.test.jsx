// src/test/tasks.test.jsx

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Mock the tasks api module used by the components
vi.mock("../api/tasks", () => {
	return {
		fetchTasks: vi.fn(),
		createTask: vi.fn(),
		updateTask: vi.fn(),
		removeTask: vi.fn(),
	};
});

import App from "../App.jsx";
import { createTask, fetchTasks, removeTask, updateTask } from "../api/tasks";

describe("Task UI flows", () => {
	beforeEach(() => {
		// Reset all mocks before each test
		vi.resetAllMocks();

		// Default confirm to true for delete flows; individual tests may override
		global.confirm = () => true;
	});

	afterEach(() => {
		// Cleanup any possible side effects
		vi.restoreAllMocks();
	});

	it("renders app and title", async () => {
		// Make fetchTasks return empty list for the initial mount
		fetchTasks.mockResolvedValueOnce([]);

		render(<App />);

		// Title should be present
		expect(screen.getByText("TeamBoard — Tasks")).toBeInTheDocument();

		// Should show "No tasks yet" because fetchTasks returned []
		expect(await screen.findByText("No tasks yet")).toBeInTheDocument();
		expect(fetchTasks).toHaveBeenCalled();
	});

	it("can add a task (TaskForm -> TaskList reload)", async () => {
		const newTask = {
			id: "1",
			title: "Buy milk",
			description: "2 liters",
			completed: false,
		};

		// fetchTasks first call (initial TaskList) -> no tasks
		// second call (after onCreated -> App remounts TaskList) -> returns array with newTask
		fetchTasks.mockResolvedValueOnce([]).mockResolvedValueOnce([newTask]);

		// createTask returns the created task
		createTask.mockResolvedValueOnce(newTask);

		render(<App />);

		// Wait for initial "No tasks yet"
		expect(await screen.findByText("No tasks yet")).toBeInTheDocument();

		const user = userEvent.setup();

		// Fill the TaskForm inputs (placeholders used in your components)
		const titleInput = screen.getByPlaceholderText("Title");
		const descriptionInput = screen.getByPlaceholderText("Description");
		const addButton = screen.getByRole("button", { name: /add task/i });

		await user.type(titleInput, newTask.title);
		await user.type(descriptionInput, newTask.description);
		await user.click(addButton);

		// createTask should have been called with the provided values
		expect(createTask).toHaveBeenCalledWith({
			title: newTask.title,
			description: newTask.description,
		});

		// After onCreated, the TaskList should remount and show the created task
		expect(await screen.findByText(newTask.title)).toBeInTheDocument();
	});

	it("can edit a task (open edit form, save changes)", async () => {
		const existing = {
			id: "2",
			title: "Old title",
			description: "Old desc",
			completed: false,
		};
		const updated = {
			...existing,
			title: "New title",
			description: "New desc",
		};

		// fetchTasks returns the existing task
		fetchTasks.mockResolvedValueOnce([existing]);

		// updateTask resolves with the updated task
		updateTask.mockResolvedValueOnce(updated);

		render(<App />);

		// Wait for the task to appear
		const titleEl = await screen.findByText(existing.title);
		expect(titleEl).toBeInTheDocument();

		// Find the article/card that contains this task and then the Edit button within it
		const card = titleEl.closest("article");
		expect(card).toBeTruthy();

		const editButton = within(card).getByRole("button", { name: /edit/i });
		await userEvent.click(editButton);

		// Now the edit form should be visible in that card; inputs have placeholder "Title"/"Description"
		const editTitleInput = within(card).getByPlaceholderText("Title");
		const editDescriptionInput =
			within(card).getByPlaceholderText("Description");
		const saveButton = within(card).getByRole("button", { name: /save/i });

		// Replace title/description and submit
		await userEvent.clear(editTitleInput);
		await userEvent.type(editTitleInput, updated.title);
		await userEvent.clear(editDescriptionInput);
		await userEvent.type(editDescriptionInput, updated.description);
		await userEvent.click(saveButton);

		// updateTask should be called with id and updates
		expect(updateTask).toHaveBeenCalledWith(existing.id, {
			title: updated.title,
			description: updated.description,
		});

		// Wait for the updated title to appear in the DOM
		expect(await screen.findByText(updated.title)).toBeInTheDocument();
	});

	it("can toggle a task to completed (Complete -> Undo and CSS class)", async () => {
		const t = {
			id: "3",
			title: "Do laundry",
			description: "",
			completed: false,
		};
		const toggled = { ...t, completed: true };

		fetchTasks.mockResolvedValueOnce([t]);
		updateTask.mockResolvedValueOnce(toggled);

		render(<App />);

		const titleEl = await screen.findByText(t.title);
		const card = titleEl.closest("article");

		const completeButton = within(card).getByRole("button", {
			name: /complete/i,
		});
		await userEvent.click(completeButton);

		// updateTask should be called to toggle completed
		expect(updateTask).toHaveBeenCalledWith(t.id, { completed: true });

		// Wait until the DOM reflects the updated completed state; the component adds 'task-completed' class
		await waitFor(() => {
			const titleAfter = screen.getByText(t.title);
			expect(titleAfter).toHaveClass("task-completed");
		});

		// Also the button text should change to "Undo"
		expect(
			within(card).getByRole("button", { name: /undo/i }),
		).toBeInTheDocument();
	});

	it("can delete a task (Delete)", async () => {
		const t = {
			id: "4",
			title: "Remove me",
			description: "",
			completed: false,
		};

		fetchTasks.mockResolvedValueOnce([t]);
		removeTask.mockResolvedValueOnce({}); // whatever your backend returns

		// Ensure confirm returns true
		global.confirm = () => true;

		render(<App />);

		const titleEl = await screen.findByText(t.title);
		const card = titleEl.closest("article");

		const deleteButton = within(card).getByRole("button", { name: /delete/i });
		await userEvent.click(deleteButton);

		expect(removeTask).toHaveBeenCalledWith(t.id);

		// After delete, the task should no longer be in the document
		await waitFor(() => {
			expect(screen.queryByText(t.title)).not.toBeInTheDocument();
		});
	});
});
