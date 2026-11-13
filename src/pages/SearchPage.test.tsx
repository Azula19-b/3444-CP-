import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SearchPage from "./SearchPage";

const apiMocks = vi.hoisted(() => ({ getFoods: vi.fn() }));

vi.mock("../api/quickbytes", () => ({
  getFoods: apiMocks.getFoods,
}));

describe("SearchPage", () => {
  beforeEach(() => {
    apiMocks.getFoods.mockReset();
  });

  it("renders an empty state when the catalog has no matches", async () => {
    apiMocks.getFoods.mockResolvedValue([]);
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("No results found")).toBeInTheDocument();
  });

  it("submits trimmed search text and renders returned food", async () => {
    apiMocks.getFoods
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 7,
          restaurant_id: 1,
          name: "Vegan Bowl",
          category: "Vegan",
          price: 8.5,
          rating: 4.8,
          image: null,
          restaurant_name: "Union Kitchen",
          restaurant_location: "University Union",
        },
      ]);
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );
    await screen.findByText("No results found");

    const input = screen.getByPlaceholderText("Search food or restaurants");
    await userEvent.type(input, "  vegan  {enter}");

    expect(await screen.findByText("Vegan Bowl")).toBeInTheDocument();
    expect(apiMocks.getFoods).toHaveBeenLastCalledWith("vegan");
  });

  it("renders a recoverable error state when the API fails", async () => {
    apiMocks.getFoods.mockRejectedValue(new Error("offline"));
    render(
      <MemoryRouter>
        <SearchPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.getByText("Unable to load search results right now.")
      ).toBeInTheDocument();
    });
  });
});
