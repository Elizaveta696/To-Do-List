import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it } from "vitest";
import Header from "../components/Header";

describe("Header", () => {
  it("renders the app title (teamName)", async () => {
    render(<Header teamName="TeamBoard" />);
    // team name is shown in the expanded navigation; open it first
    const expandBtn = screen.getByRole("button", {
      name: /expand navigation/i,
    });
    const user = userEvent.setup();
    await user.click(expandBtn);
    expect(
      await screen.findByRole("button", { name: /open TeamBoard tasks/i }),
    ).toBeInTheDocument();
  });

  it("renders New Task and Logout buttons", () => {
    render(<Header teamName="TeamBoard" />);
    // Header exposes profile and logout in the sidebar bottom
    expect(
      screen.getByRole("button", { name: /profile/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("renders theme toggle button if feature enabled", () => {
    render(<Header teamName="TeamBoard" nightMode={false} />);
    expect(
      screen.getByRole("button", { name: /toggle night mode/i }),
    ).toBeInTheDocument();
  });
});
