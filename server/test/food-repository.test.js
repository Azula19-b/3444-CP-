import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  closeDatabase,
  initializeDatabase,
  openDatabase,
} from "../src/database.js";
import { FoodRepository } from "../src/food-repository.js";

describe("FoodRepository", () => {
  let database;
  let repository;

  beforeEach(async () => {
    database = openDatabase(":memory:");
    await initializeDatabase(database, { seed: false });
    repository = new FoodRepository(database);
    const restaurantId = await repository.createRestaurant({
      name: "Union Kitchen",
      location: "University Union",
      latitude: 33.2107,
      longitude: -97.1473,
    });
    await repository.createFoods([
      {
        name: "Veggie Bowl",
        restaurantId,
        category: "Vegan",
        price: 8.5,
        rating: 4.7,
        image: null,
      },
    ]);
  });

  afterEach(async () => {
    await closeDatabase(database);
  });

  it("joins food results with their restaurant details", async () => {
    const foods = await repository.listFoods();

    expect(foods).toEqual([
      expect.objectContaining({
        name: "Veggie Bowl",
        restaurant_name: "Union Kitchen",
        restaurant_location: "University Union",
      }),
    ]);
  });

  it("searches names, categories, restaurants, and locations", async () => {
    await expect(repository.searchFoods("Vegan")).resolves.toHaveLength(1);
    await expect(repository.searchFoods("Union Kitchen")).resolves.toHaveLength(1);
    await expect(repository.searchFoods("University Union")).resolves.toHaveLength(1);
  });

  it("parameterizes search text instead of treating it as SQL", async () => {
    const results = await repository.searchFoods("%' OR 1=1 --");

    expect(results).toEqual([]);
    await expect(repository.listFoods()).resolves.toHaveLength(1);
  });

  it("rolls back a batch when any food violates a database constraint", async () => {
    await expect(
      repository.createFoods([
        {
          name: "Valid Item",
          restaurantId: 1,
          category: null,
          price: 2,
          rating: 4,
          image: null,
        },
        {
          name: "Missing Restaurant",
          restaurantId: 999,
          category: null,
          price: 2,
          rating: 4,
          image: null,
        },
      ])
    ).rejects.toThrow();

    await expect(repository.listFoods()).resolves.toHaveLength(1);
  });
});
