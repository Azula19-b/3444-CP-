import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Login from "./login";

describe("Login", () => {
  it("stores the authenticated user after a successful login", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        message: "Login successful.",
        user: { id: "test-id", name: "Test Student", email: "student@unt.edu" },
      }),
    } as Response);
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText("Email"), "student@unt.edu");
    await userEvent.type(screen.getByLabelText("Password"), "Password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Login successful.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("loggedInUser") || "null")).toEqual(
      expect.objectContaining({ email: "student@unt.edu" })
    );
  });

  it("shows a network error without storing credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText("Email"), "student@unt.edu");
    await userEvent.type(screen.getByLabelText("Password"), "Password123");
    await userEvent.click(screen.getByRole("button", { name: "Login" }));

    expect(await screen.findByText("Unable to connect to the server.")).toBeInTheDocument();
    expect(localStorage.getItem("loggedInUser")).toBeNull();
  });
});
