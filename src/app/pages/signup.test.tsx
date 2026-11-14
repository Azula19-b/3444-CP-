import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import Signup from "./signup";

function renderSignup() {
  return render(
    <MemoryRouter>
      <Signup />
    </MemoryRouter>
  );
}

describe("Signup", () => {
  it("shows required-field validation without calling the API", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderSignup();

    await userEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText("Please fill in all fields.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("checks password confirmation before submitting", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    renderSignup();

    await userEvent.type(screen.getByLabelText("Name"), "Test Student");
    await userEvent.type(screen.getByLabelText("Email"), "student@unt.edu");
    await userEvent.type(screen.getByLabelText("Password", { selector: "#signup-password" }), "Password123");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "Different123");
    await userEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(screen.getByText("Passwords do not match.")).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("surfaces a duplicate-email response from the API", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      json: async () => ({ message: "This email is already registered." }),
    } as Response);
    renderSignup();

    await userEvent.type(screen.getByLabelText("Name"), "Test Student");
    await userEvent.type(screen.getByLabelText("Email"), "student@unt.edu");
    await userEvent.type(screen.getByLabelText("Password", { selector: "#signup-password" }), "Password123");
    await userEvent.type(screen.getByLabelText("Confirm Password"), "Password123");
    await userEvent.click(screen.getByRole("button", { name: "Sign Up" }));

    expect(await screen.findByText("This email is already registered.")).toBeInTheDocument();
  });
});
