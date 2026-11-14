import bcrypt from "bcryptjs";
import cors from "cors";
import express from "express";
import {
  validateFoods,
  validateLogin,
  validateRestaurant,
  validateSignup,
} from "./validation.js";

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function createApp({
  foodRepository,
  userStore,
  clientOrigin,
  passwordHashRounds = 12,
}) {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors({ origin: clientOrigin }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/", (_request, response) => {
    response.send("QuickBytes backend is running.");
  });

  app.post(
    "/api/signup",
    asyncRoute(async (request, response) => {
      const result = validateSignup(request.body);
      if (result.error) {
        return response.status(400).json({ message: result.error });
      }

      const { name, email, password } = result.value;
      if (await userStore.findByEmail(email)) {
        return response.status(409).json({ message: "This email is already registered." });
      }

      const passwordHash = await bcrypt.hash(password, passwordHashRounds);
      const user = await userStore.create({ name, email, passwordHash });
      return response.status(201).json({
        message: "Signup successful.",
        user: publicUser(user),
      });
    })
  );

  app.post(
    "/api/login",
    asyncRoute(async (request, response) => {
      const result = validateLogin(request.body);
      if (result.error) {
        return response.status(400).json({ message: result.error });
      }

      const user = await userStore.findByEmail(result.value.email);
      const passwordMatches = user
        ? await bcrypt.compare(result.value.password, user.password)
        : false;

      // The same response for an unknown email and a wrong password avoids
      // exposing which addresses are registered.
      if (!user || !passwordMatches) {
        return response.status(401).json({ message: "Invalid email or password." });
      }

      return response.json({
        message: "Login successful.",
        user: publicUser(user),
      });
    })
  );

  app.get(
    "/api/foods",
    asyncRoute(async (_request, response) => {
      response.json(await foodRepository.listFoods());
    })
  );

  app.get(
    "/api/restaurants",
    asyncRoute(async (_request, response) => {
      response.json(await foodRepository.listRestaurants());
    })
  );

  app.get(
    "/api/search-foods",
    asyncRoute(async (request, response) => {
      const query = String(request.query.query ?? "").trim();
      if (query.length > 100) {
        return response.status(400).json({ error: "Search query is too long." });
      }

      const foods = query
        ? await foodRepository.searchFoods(query)
        : await foodRepository.listFoods();
      return response.json(foods);
    })
  );

  app.post(
    "/api/add-restaurant",
    asyncRoute(async (request, response) => {
      const result = validateRestaurant(request.body);
      if (result.error) {
        return response.status(400).json({ error: result.error });
      }

      const id = await foodRepository.createRestaurant(result.value);
      return response.status(201).json({ id });
    })
  );

  app.post(
    "/api/add-food",
    asyncRoute(async (request, response) => {
      const result = validateFoods(request.body);
      if (result.error) {
        return response.status(400).json({ error: result.error });
      }

      const ids = await foodRepository.createFoods(result.value);
      return response.status(201).json(
        Array.isArray(request.body)
          ? { ids, count: ids.length }
          : { id: ids[0] }
      );
    })
  );

  app.use((error, _request, response, _next) => {
    console.error("Request failed:", error.message);
    response.status(500).json({ error: "An unexpected server error occurred." });
  });

  return app;
}
