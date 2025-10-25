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
import { FEATURE_FLAGS } from "../featureFlags";
import { createTask, fetchTasks } from "../api/tasks";

describe("App integration", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		window.localStorage.clear();
		// Mock fetch for login
		global.fetch = vi.fn((url, options) => {
			if (url.includes("/api/auth/login")) {
				return Promise.resolve({
					json: () => Promise.resolve({ accessToken: "mock-token" })
				});
			}
			// fallback for other fetches
			return Promise.resolve({
				json: () => Promise.resolve({})
			});
		});
	});

	it("should allow login and add a task", async () => {
		const newTask = {
			id: "1",
			title: "Buy milk",
			description: "2L",
			completed: false,
		};
		fetchTasks.mockResolvedValueOnce([]).mockResolvedValueOnce([newTask]);
		createTask.mockResolvedValueOnce(newTask);

		render(<App />);
		const user = userEvent.setup();

		// Simulate login
		await user.type(screen.getByPlaceholderText(/username/i), "testuser");
		await user.type(screen.getByPlaceholderText(/password/i), "testpass");
		await user.click(screen.getByRole("button", { name: /login/i }));

		// Should show header after login
		expect(await screen.findByText("TeamBoard")).toBeInTheDocument();
		// Should show 'No tasks yet' in TaskList
		expect(await screen.findByText("No tasks yet")).toBeInTheDocument();

		// Theme toggle button presence depends on feature flag
		if (FEATURE_FLAGS.lightThemeToggle) {
			expect(screen.getByRole("button", { name: /toggle night mode/i })).toBeInTheDocument();
		} else {
			expect(screen.queryByRole("button", { name: /toggle night mode/i })).not.toBeInTheDocument();
		}

		// Add a task
		await user.click(screen.getByRole("button", { name: /new task/i }));
		expect(screen.getByText(/new task/i)).toBeInTheDocument();
		await user.type(screen.getByPlaceholderText("Title"), newTask.title);
		await user.type(screen.getByPlaceholderText("Description"), newTask.description);
		await user.click(screen.getByRole("button", { name: /add/i }));

			expect(createTask).toHaveBeenCalledWith({
				title: newTask.title,
				description: newTask.description,
				priority: "medium",
				dueDate: null,
			});
			expect(await screen.findByText(newTask.title)).toBeInTheDocument();
	});
});
