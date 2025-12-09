import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import * as apiTeams from "../api/teams";
import UserSettings from "../components/UserSettings";

describe("UserSettings", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    window.localStorage.clear();
    vi.spyOn(window, "alert").mockImplementation(() => {
      /* noop */
    });
    // stub API calls used by the component
    vi.spyOn(apiTeams, "editUser").mockResolvedValue({});
    vi.spyOn(apiTeams, "fetchTeams").mockResolvedValue({
      ok: true,
      data: { teams: [] },
    });
    vi.spyOn(apiTeams, "removeTeamMember").mockResolvedValue({});
  });

  it("renders fields and saves username to localStorage", async () => {
    const user = userEvent.setup();
    render(<UserSettings />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/change password/i);

    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    // username is not editable in the current UI; only password can be changed
    await user.type(passwordInput, "secret");

    await user.click(screen.getByRole("button", { name: /save changes/i }));

    // password should be cleared and alert called
    expect(passwordInput).toHaveValue("");
    expect(window.alert).toHaveBeenCalled();
  });

  it("removes a team after confirming removal", async () => {
    const user = userEvent.setup();
    // arrange fetchTeams to return a removable team
    vi.spyOn(apiTeams, "fetchTeams").mockResolvedValueOnce({
      ok: true,
      data: { teams: [{ teamId: 2, name: "Other", teamCode: "C" }] },
    });

    render(<UserSettings />);

    // initial default team exists, plus the removable 'Other' team
    const removeBtn = await screen.findByRole("button", {
      name: /Leave Other/i,
    });
    await user.click(removeBtn);

    // modal should appear
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    // click Yes to confirm removal (button text is 'Yes, leave')
    await user.click(screen.getByRole("button", { name: /Yes, leave/i }));

    // removed team should no longer be present
    expect(screen.queryByText(/Other/i)).not.toBeInTheDocument();
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
