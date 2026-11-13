import { all, run, exec } from "./database.js";

const FOOD_SELECT = `
  SELECT
    foods.id,
    foods.restaurant_id,
    foods.name,
    foods.category,
    foods.price,
    foods.rating,
    foods.image,
    restaurants.name AS restaurant_name,
    restaurants.location AS restaurant_location
  FROM foods
  LEFT JOIN restaurants ON foods.restaurant_id = restaurants.id
`;

export class FoodRepository {
  constructor(db) {
    this.db = db;
  }

  listFoods() {
    return all(this.db, `${FOOD_SELECT} ORDER BY foods.name COLLATE NOCASE`);
  }

  searchFoods(query) {
    const searchValue = `%${query}%`;
    return all(
      this.db,
      `${FOOD_SELECT}
       WHERE foods.name LIKE ?
          OR foods.category LIKE ?
          OR restaurants.name LIKE ?
          OR restaurants.location LIKE ?
       ORDER BY foods.name COLLATE NOCASE`,
      [searchValue, searchValue, searchValue, searchValue]
    );
  }

  listRestaurants() {
    return all(
      this.db,
      `SELECT id, name, location, latitude, longitude
       FROM restaurants
       ORDER BY name COLLATE NOCASE`
    );
  }

  async createRestaurant(restaurant) {
    const result = await run(
      this.db,
      `INSERT INTO restaurants (name, location, latitude, longitude)
       VALUES (?, ?, ?, ?)`,
      [
        restaurant.name,
        restaurant.location,
        restaurant.latitude,
        restaurant.longitude,
      ]
    );
    return result.lastID;
  }

  async createFoods(foods) {
    const insertedIds = [];
    await exec(this.db, "BEGIN IMMEDIATE TRANSACTION");

    try {
      for (const food of foods) {
        const result = await run(
          this.db,
          `INSERT INTO foods
            (name, restaurant_id, category, price, rating, image)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            food.name,
            food.restaurantId,
            food.category,
            food.price,
            food.rating,
            food.image,
          ]
        );
        insertedIds.push(result.lastID);
      }

      await exec(this.db, "COMMIT");
      return insertedIds;
    } catch (error) {
      await exec(this.db, "ROLLBACK");
      throw error;
    }
  }
}
