import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { JsonUserStore } from "../src/user-store.js";

function createFoodRepository() {
  return {
    listFoods: vi.fn().mockResolvedValue([{ id: 1, name: "Campus Salad" }]),
    searchFoods: vi.fn().mockResolvedValue([{ id: 2, name: "Veggie Bowl" }]),
    listRestaurants: vi.fn().mockResolvedValue([]),
    createRestaurant: vi.fn().mockResolvedValue(1),
    createFoods: vi.fn().mockResolvedValue([1]),
  };
}

describe("QuickBytes API", () => {
  let temporaryDirectory;
  let foodRepository;
  let app;

  beforeEach(async () => {
    temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "quickbytes-test-"));
    foodRepository = createFoodRepository();
    app = createApp({
      foodRepository,
      userStore: new JsonUserStore(path.join(temporaryDirectory, "users.json")),
      clientOrigin: "http://localhost:5173",
      passwordHashRounds: 4,
    });
  });

  afterEach(async () => {
    await fs.rm(temporaryDirectory, { recursive: true, force: true });
  });

  it("rejects signup when required fields are missing", async () => {
    const response = await request(app).post("/api/signup").send({ email: "student@unt.edu" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("All fields are required.");
  });

  it("rejects invalid email addresses and short passwords", async () => {
    const invalidEmail = await request(app).post("/api/signup").send({
      name: "Student",
      email: "not-an-email",
      password: "Password123",
      confirmPassword: "Password123",
    });
    const shortPassword = await request(app).post("/api/signup").send({
      name: "Student",
      email: "student@unt.edu",
      password: "short",
      confirmPassword: "short",
    });

    expect(invalidEmail.status).toBe(400);
    expect(shortPassword.status).toBe(400);
  });

  it("rejects a mismatched password confirmation", async () => {
    const response = await request(app).post("/api/signup").send({
      name: "Student",
      email: "student@unt.edu",
      password: "Password123",
      confirmPassword: "Different123",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Passwords do not match.");
  });

  it("creates an account without returning its password hash", async () => {
    const response = await request(app).post("/api/signup").send({
      name: "Student",
      email: "STUDENT@unt.edu",
      password: "Password123",
      confirmPassword: "Password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({ name: "Student", email: "student@unt.edu" });
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("treats duplicate email addresses as case-insensitive", async () => {
    const account = {
      name: "Student",
      email: "student@unt.edu",
      password: "Password123",
      confirmPassword: "Password123",
    };
    await request(app).post("/api/signup").send(account);

    const response = await request(app)
      .post("/api/signup")
      .send({ ...account, email: "STUDENT@UNT.EDU" });

    expect(response.status).toBe(409);
  });

  it("logs in with valid credentials", async () => {
    await request(app).post("/api/signup").send({
      name: "Student",
      email: "student@unt.edu",
      password: "Password123",
      confirmPassword: "Password123",
    });

    const response = await request(app).post("/api/login").send({
      email: "student@unt.edu",
      password: "Password123",
    });

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("student@unt.edu");
  });

  it.each([
    ["student@unt.edu", "WrongPassword"],
    ["missing@unt.edu", "Password123"],
  ])("returns the same failure for invalid login credentials", async (email, password) => {
    const response = await request(app).post("/api/login").send({ email, password });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password.");
  });

  it("uses the unfiltered food query when search text is empty", async () => {
    const response = await request(app).get("/api/search-foods?query=%20%20");

    expect(response.status).toBe(200);
    expect(foodRepository.listFoods).toHaveBeenCalledOnce();
    expect(foodRepository.searchFoods).not.toHaveBeenCalled();
  });

  it("passes trimmed search text to the repository", async () => {
    const response = await request(app).get("/api/search-foods?query=%20vegan%20");

    expect(response.status).toBe(200);
    expect(foodRepository.searchFoods).toHaveBeenCalledWith("vegan");
  });

  it("rejects oversized search input", async () => {
    const response = await request(app).get(`/api/search-foods?query=${"a".repeat(101)}`);

    expect(response.status).toBe(400);
    expect(foodRepository.searchFoods).not.toHaveBeenCalled();
  });

  it("does not expose database error details", async () => {
    foodRepository.listFoods.mockRejectedValue(new Error("SQLITE_ERROR: private detail"));
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const response = await request(app).get("/api/foods");

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("An unexpected server error occurred.");
    expect(JSON.stringify(response.body)).not.toContain("SQLITE_ERROR");
    consoleSpy.mockRestore();
  });

  it("validates restaurant coordinate boundaries", async () => {
    const response = await request(app).post("/api/add-restaurant").send({
      name: "Test Cafe",
      latitude: 91,
      longitude: -97.1,
    });

    expect(response.status).toBe(400);
    expect(foodRepository.createRestaurant).not.toHaveBeenCalled();
  });

  it("validates food price and rating boundaries", async () => {
    const response = await request(app).post("/api/add-food").send({
      name: "Invalid Meal",
      restaurant_id: 1,
      price: -1,
      rating: 6,
    });

    expect(response.status).toBe(400);
    expect(foodRepository.createFoods).not.toHaveBeenCalled();
  });
});
