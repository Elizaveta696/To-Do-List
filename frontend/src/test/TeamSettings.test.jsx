import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiTeams from "../api/teams";
import TeamSettings from "../components/TeamSettings";

describe("TeamSettings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(window, "alert").mockImplementation(() => {
      /* noop */
    });
  });

  it("calls onChangeName when saving a new team name", async () => {
    const user = userEvent.setup();
    const onChangeName = vi.fn();
    // arrange: make the current user an owner so save is allowed
    const payload = btoa(JSON.stringify({ userId: 1 }));
    localStorage.setItem("token", `x.${payload}.y`);

    vi.spyOn(apiTeams, "fetchTeamMembers").mockResolvedValue({
      users: [{ userId: 1, username: "Alice", role: "owner" }],
      team: { teamCode: "CODE" },
    });
    vi.spyOn(apiTeams, "editTeam").mockResolvedValue({});

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
    // make current user owner so admin actions are allowed
    const payload = btoa(JSON.stringify({ userId: 1 }));
    localStorage.setItem("token", `x.${payload}.y`);

    // Mock API calls to populate members and allUsers
    vi.spyOn(apiTeams, "fetchTeamMembers").mockResolvedValue({
      users: [{ userId: 1, username: "Alice", role: "owner" }],
      team: { teamCode: "CODE" },
    });
    vi.spyOn(apiTeams, "fetchAllUsers").mockResolvedValue([
      { userId: 2, username: "Charlie" },
    ]);
    vi.spyOn(apiTeams, "addUserToTeam").mockResolvedValue({});

    // render with a real teamId so the component loads members
    render(<TeamSettings teamId="TEAM-1" />);

    // wait for the add-user select to be populated; there are multiple selects
    const allSelects = await screen.findAllByRole("combobox");
    // prefer the element with the add-user class
    const addSelect =
      allSelects.find((s) => s.classList.contains("add-user-select")) ||
      document.querySelector(".add-user-select");
    expect(addSelect).toBeTruthy();
    await user.selectOptions(addSelect, "2");

    const addButton = screen.getByRole("button", { name: /add user/i });
    expect(addButton).not.toBeDisabled();
    await user.click(addButton);

    // wait for Charlie to appear in the users grid
    expect(await screen.findByText(/Charlie/i)).toBeInTheDocument();

    // change role of the newly added user (last select in the document)
    const selectsAfter = screen.getAllByRole("combobox");
    const lastSelect = selectsAfter[selectsAfter.length - 1];
    // component supports 'owner' and 'member' roles; switch to owner
    await user.selectOptions(lastSelect, "owner");
    expect(lastSelect).toHaveValue("owner");

    // mock removal API and remove the newly added user (Charlie)
    vi.spyOn(apiTeams, "removeTeamMember").mockResolvedValue({});

    const removeCharlie = screen.getByRole("button", {
      name: /Remove Charlie/i,
    });
    await user.click(removeCharlie);
    // confirm removal
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^Yes$/i }));

    // wait for the user to be removed from the DOM
    await waitFor(() =>
      expect(screen.queryByText(/Charlie/i)).not.toBeInTheDocument(),
    );
  });
});
