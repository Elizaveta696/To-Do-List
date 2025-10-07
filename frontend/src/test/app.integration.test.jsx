// src/test/app.integration.test.jsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the api module so network calls don't go out
vi.mock("../api/tasks", () => ({
	fetchTasks: vi.fn(),
	createTask: vi.fn(),
	updateTask: vi.fn(),
	removeTask: vi.fn(),
}));

import App from "../App";
import { createTask, fetchTasks } from "../api/tasks";

describe("App integration", () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	it("renders title and can add a task (TaskForm -> TaskList)", async () => {
		const newTask = {
			id: "1",
			title: "Buy milk",
			description: "2L",
			completed: false,
		};

		// Initial TaskList: empty; after create, TaskList should show newTask
		fetchTasks.mockResolvedValueOnce([]).mockResolvedValueOnce([newTask]);
		createTask.mockResolvedValueOnce(newTask);

		render(<App />);

		// Title check (integration, global)
		expect(screen.getByText("TeamBoard — Tasks")).toBeInTheDocument();

		const user = userEvent.setup();
		await user.type(screen.getByPlaceholderText("Title"), newTask.title);
		await user.type(
			screen.getByPlaceholderText("Description"),
			newTask.description,
		);
		await user.click(screen.getByRole("button", { name: /add task/i }));

		expect(createTask).toHaveBeenCalledWith({
			title: newTask.title,
			description: newTask.description,
		});

		// After the form triggers onCreated, TaskList remounts and should show the task
		expect(await screen.findByText(newTask.title)).toBeInTheDocument();
	});
});
