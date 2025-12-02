import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import Header from "../components/Header";

describe("Navigation / Header", () => {
	it("calls onNavigate when profile button clicked", async () => {
		const user = userEvent.setup();
		const onNavigate = vi.fn();
		render(<Header onNavigate={onNavigate} teamName="MyTeam" />);

		const profileBtn = screen.getByRole("button", { name: /profile/i });
		await user.click(profileBtn);
		expect(onNavigate).toHaveBeenCalledWith("user-settings");
	});

	it("opens expanded nav and navigates to team settings", async () => {
		const user = userEvent.setup();
		const onNavigate = vi.fn();
		render(<Header onNavigate={onNavigate} teamName="BoardName" />);

		// open navigation
		const expandBtn = screen.getByRole("button", {
			name: /expand navigation/i,
		});
		await user.click(expandBtn);

		// the portal content contains a button with title "Board settings" (gear)
		const gearBtn = await screen.findByTitle(/Board settings/i);
		await user.click(gearBtn);
		expect(onNavigate).toHaveBeenCalledWith("team-settings");
	});
});
