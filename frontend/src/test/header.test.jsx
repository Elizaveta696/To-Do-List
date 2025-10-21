import { render, screen } from "@testing-library/react";
import React from "react";
import Header from "../components/Header";
import { describe, it, expect } from "vitest";

describe("Header", () => {
  it("renders the app title (teamName)", () => {
    render(<Header teamName="TeamBoard" />);
    expect(screen.getByText(/TeamBoard/i)).toBeInTheDocument();
  });

  it("renders New Task and Logout buttons", () => {
    render(<Header teamName="TeamBoard" />);
    expect(screen.getByRole("button", { name: /new task/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
  });

  it("renders theme toggle button if feature enabled", () => {
    render(<Header teamName="TeamBoard" nightMode={false} />);
    expect(screen.getByRole("button", { name: /toggle night mode/i })).toBeInTheDocument();
  });
});
