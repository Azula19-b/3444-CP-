import { useEffect, useMemo, useState } from "react";

const sortFoods = (foods, sortBy) => {
  const copiedFoods = [...foods];

  switch (sortBy) {
    case "rating":
      return copiedFoods.sort(
        (a, b) => (b.rating ?? 0) - (a.rating ?? 0)
      );
    case "calories":
      return copiedFoods.sort(
        (a, b) => (a.calories ?? 0) - (b.calories ?? 0)
      );
    case "popularity":
      return copiedFoods.sort(
        (a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)
      );
    case "distance":
    default:
      return copiedFoods.sort(
        (a, b) => (a.distance ?? 0) - (b.distance ?? 0)
      );
  }
};

const tagOptions = [
  ["Halal", "tag-halal"],
  ["Vegan", "tag-vegan"],
  ["Gluten-Free", "tag-gluten-free"],
  ["High Protein", "tag-protein"],
];

const getMockMeta = (food, index) => {
  const tags = [];
  if (index % 2 === 0) tags.push("Halal");
  if (index % 3 === 0) tags.push("Vegan");
  if (index % 4 === 0) tags.push("Gluten-Free");
  if (tags.length === 0) tags.push("High Protein");

  return {
    restaurant: `UNT Dining Spot ${((index % 5) + 1)}`,
    distance: (0.2 + (index % 6) * 0.2).toFixed(1),
    calories: 320 + (index % 6) * 70,
    rating: (4.1 + (index % 5) * 0.15).toFixed(1),
    popularity: 100 - index,
    tags,
  };
};

const FoodCollection = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [favorites, setFavorites] = useState({});
  const [sortBy, setSortBy] = useState("distance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${submittedSearch}`)
      .then((res) => res.json())
      .then((data) => {
        const meals = data.meals || [];
        const mappedFoods = meals.map((food, index) => ({
          ...food,
          ...getMockMeta(food, index),
        }));

        setFoods(mappedFoods);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data.");
        setLoading(false);
      });
  }, [submittedSearch]);

  const displayedFoods = useMemo(() => sortFoods(foods, sortBy), [foods, sortBy]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmittedSearch(search.trim());
  };

  const toggleFavorite = (idMeal) => {
    setFavorites((prev) => ({
      ...prev,
      [idMeal]: !prev[idMeal],
    }));
  };

  return (
    <div className="page-shell">
      <div className="mobile-frame">
        <header className="top-bar">
          <button className="icon-button" aria-label="Go back">
            ←
          </button>

          <form className="search-form" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Search food or restaurants"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
          </form>

          <button className="icon-button" aria-label="Filters">
            ☰
          </button>
        </header>

        <section className="hero-section">
  <h1 className="page-title">UNT Quick Bytes</h1>
</section>
        <section className="controls-row">
          <div>
            <p className="results-label">
              {loading
                ? "Searching..."
                : `${displayedFoods.length} result${displayedFoods.length === 1 ? "" : "s"} found`}
            </p>
            <p className="results-query">
              {submittedSearch ? `for "${submittedSearch}"` : "showing all available meals"}
            </p>
          </div>

          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort results"
          >
            <option value="distance">Distance</option>
            <option value="rating">Rating</option>
            <option value="calories">Calories</option>
            <option value="popularity">Popularity</option>
          </select>
        </section>

        <section className="tags-row">
          {tagOptions.map(([tag, className]) => (
            <span key={tag} className={`tag-pill ${className}`}>
              {tag}
            </span>
          ))}
        </section>

        <main className="results-list">
          {loading && (
            <div className="state-card">
              <p className="state-title">Loading results...</p>
              <p className="state-text">Looking for food spots for you.</p>
            </div>
          )}

          {error && !loading && (
            <div className="state-card error-state">
              <p className="state-title">Something went wrong</p>
              <p className="state-text">{error}</p>
            </div>
          )}

          {!loading && !error && displayedFoods.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">🍽️</div>
              <h2>No results found</h2>
              <p>
                Try another search or adjust what you are looking for.
              </p>
            </div>
          )}

          {!loading &&
            !error &&
            displayedFoods.map((food) => (
              <article className="food-card" key={food.idMeal}>
                <div className="food-image-wrap">
                  <img
                    src={food.strMealThumb}
                    alt={food.strMeal}
                    className="food-image"
                  />
                  <button
                    className={`favorite-button ${favorites[food.idMeal] ? "favorited" : ""}`}
                    onClick={() => toggleFavorite(food.idMeal)}
                    aria-label="Toggle favorite"
                    type="button"
                  >
                    {favorites[food.idMeal] ? "♥" : "♡"}
                  </button>
                </div>

                <div className="food-card-content">
                  <div className="food-card-top">
                    <div>
                      <h3 className="food-name">{food.strMeal}</h3>
                      <p className="restaurant-name">{food.restaurant}</p>
                    </div>
                    <div className="rating-badge">⭐ {food.rating}</div>
                  </div>

                  <div className="meta-row">
                    <span>{food.distance} miles</span>
                    <span>•</span>
                    <span>{food.calories} cal</span>
                    <span>•</span>
                    <span>{food.strArea || "Campus Favorite"}</span>
                  </div>

                  <div className="tags-wrap">
                    {food.tags.map((tag) => (
                      <span key={tag} className="food-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
        </main>

        <nav className="bottom-nav">
          <button className="nav-item">Home</button>
          <button className="nav-item nav-active">Search</button>
          <button className="nav-item">Map</button>
          <button className="nav-item">Favorites</button>
          <button className="nav-item">Profile</button>
        </nav>
      </div>
    </div>
  );
};

export default FoodCollection;