import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import UserSettings from "../components/UserSettings";

describe("UserSettings", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		window.localStorage.clear();
		vi.spyOn(window, "alert").mockImplementation(() => {});
	});

	it("renders fields and saves username to localStorage", async () => {
		const user = userEvent.setup();
		render(<UserSettings />);

		const usernameInput = screen.getByLabelText(/username/i);
		const passwordInput = screen.getByLabelText(/change password/i);

		expect(usernameInput).toBeInTheDocument();
		expect(passwordInput).toBeInTheDocument();

		await user.clear(usernameInput);
		await user.type(usernameInput, "alice");
		await user.type(passwordInput, "secret");

		await user.click(screen.getByRole("button", { name: /save changes/i }));

		expect(localStorage.getItem("username")).toBe("alice");
		expect(passwordInput).toHaveValue("");
		expect(window.alert).toHaveBeenCalled();
	});

	it("removes a team after confirming removal", async () => {
		const user = userEvent.setup();
		render(<UserSettings />);

		// initial team is "My tasks"
		const removeBtn = screen.getByRole("button", { name: /Remove My tasks/i });
		await user.click(removeBtn);

		// modal should appear
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		// click Yes to confirm removal
		await user.click(screen.getByRole("button", { name: /^Yes$/i }));

		// team name should no longer be in the document
		expect(screen.queryByText(/My tasks/i)).not.toBeInTheDocument();
	});

	it("delete account triggers onNavigate('login') when confirmed", async () => {
		const user = userEvent.setup();
		const onNavigate = vi.fn();
		render(<UserSettings onNavigate={onNavigate} />);

		await user.click(screen.getByRole("button", { name: /delete account/i }));
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^Yes$/i }));

		expect(onNavigate).toHaveBeenCalledWith("login");
		expect(window.alert).toHaveBeenCalled();
	});
});
