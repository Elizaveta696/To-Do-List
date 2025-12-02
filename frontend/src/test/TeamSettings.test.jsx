import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import TeamSettings from "../components/TeamSettings";

describe("TeamSettings", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.spyOn(window, "alert").mockImplementation(() => {});
	});

	it("calls onChangeName when saving a new team name", async () => {
		const user = userEvent.setup();
		const onChangeName = vi.fn();
		render(
			<TeamSettings
				teamId="TEAM-1"
				teamName="Original"
				onChangeName={onChangeName}
			/>,
		);

		const nameInput = screen.getByLabelText(/change team name/i);
		await user.clear(nameInput);
		await user.type(nameInput, "New name");

		await user.click(screen.getByRole("button", { name: /save changes/i }));

		expect(onChangeName).toHaveBeenCalledWith("New name");
		expect(window.alert).toHaveBeenCalled();
	});

	it("adds a new user and allows role changes and removal", async () => {
		const user = userEvent.setup();
		render(<TeamSettings />);

		const addInput = screen.getByPlaceholderText(/new user name/i);
		const addButton = screen.getByRole("button", { name: /add user/i });

		await user.type(addInput, "Charlie");
		expect(addButton).not.toBeDisabled();
		await user.click(addButton);

		// new user should appear inside the users grid
		const usersGrid = document.querySelector(".users-grid");
		expect(
			within(usersGrid).getByText(/Charlie/i, { selector: ".users-grid-user" }),
		).toBeInTheDocument();

		// change role of the newly added user (last select in the document)
		const selects = screen.getAllByRole("combobox");
		const lastSelect = selects[selects.length - 1];
		await user.selectOptions(lastSelect, "admin");
		expect(lastSelect).toHaveValue("admin");

		// remove an existing user (e.g., Alice)
		const removeAlice = screen.getByRole("button", { name: /Remove Alice/i });
		await user.click(removeAlice);
		// confirm removal
		expect(screen.getByRole("dialog")).toBeInTheDocument();
		await user.click(screen.getByRole("button", { name: /^Yes$/i }));
		expect(screen.queryByText(/Alice/i)).not.toBeInTheDocument();
	});
});
