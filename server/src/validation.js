const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function validateSignup(body) {
  const name = cleanText(body?.name);
  const email = cleanText(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!name || !email || !password || !confirmPassword) {
    return { error: "All fields are required." };
  }
  if (name.length > 100) {
    return { error: "Name must be 100 characters or fewer." };
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }
  if (password.length < 8 || password.length > 128) {
    return { error: "Password must be between 8 and 128 characters." };
  }
  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  return { value: { name, email, password } };
}

export function validateLogin(body) {
  const email = cleanText(body?.email).toLowerCase();
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return { error: "Enter a valid email address." };
  }

  return { value: { email, password } };
}

export function validateRestaurant(body) {
  const name = cleanText(body?.name);
  const location = cleanText(body?.location) || null;
  const latitude = body?.latitude == null ? null : Number(body.latitude);
  const longitude = body?.longitude == null ? null : Number(body.longitude);

  if (!name || name.length > 150) {
    return { error: "Restaurant name is required and must be 150 characters or fewer." };
  }
  if (location && location.length > 200) {
    return { error: "Location must be 200 characters or fewer." };
  }
  if (latitude !== null && (!Number.isFinite(latitude) || latitude < -90 || latitude > 90)) {
    return { error: "Latitude must be between -90 and 90." };
  }
  if (longitude !== null && (!Number.isFinite(longitude) || longitude < -180 || longitude > 180)) {
    return { error: "Longitude must be between -180 and 180." };
  }

  return { value: { name, location, latitude, longitude } };
}

export function validateFoods(body) {
  const payload = Array.isArray(body) ? body : [body];
  if (payload.length === 0 || payload.length > 100) {
    return { error: "Submit between 1 and 100 food items." };
  }

  const foods = payload.map((food) => ({
    name: cleanText(food?.name),
    restaurantId: Number(food?.restaurant_id),
    category: cleanText(food?.category) || null,
    price: food?.price == null ? null : Number(food.price),
    rating: food?.rating == null ? null : Number(food.rating),
    image: cleanText(food?.image) || null,
  }));

  const invalid = foods.some(
    (food) =>
      !food.name ||
      food.name.length > 150 ||
      !Number.isInteger(food.restaurantId) ||
      food.restaurantId <= 0 ||
      (food.price !== null && (!Number.isFinite(food.price) || food.price < 0)) ||
      (food.rating !== null &&
        (!Number.isFinite(food.rating) || food.rating < 0 || food.rating > 5))
  );

  return invalid
    ? { error: "Each food needs a valid name, restaurant_id, price, and rating." }
    : { value: foods };
}
