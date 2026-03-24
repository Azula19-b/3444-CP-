import { useState, useEffect } from "react";

const FoodCollection = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const route = search.trim()
      ? `/search-foods?query=${encodeURIComponent(search.trim())}`
      : "/foods";

    setLoading(true);
    setError(null);

    fetch(route)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch foods");
        }

        return res.json();
      })
      .then((data) => {
        setFoods(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch food data from the server.");
        setLoading(false);
      });
  }, [search]);

  return (
    <div
      style={{
        maxWidth: "720px",
        margin: "0 auto",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      <h1>UNT Quick Bytes</h1>
      <p>Search the foods saved in your project database.</p>

      <input
        type="text"
        placeholder="Search food, category, restaurant, or location..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "100%",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "1px solid #ccc"
        }}
      />

      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && foods.length === 0 && (
        <p>No foods matched your search.</p>
      )}

      {!loading &&
        foods.map((food) => (
          <div
            key={food.id}
            style={{
              border: "1px solid #ddd",
              padding: "15px",
              borderRadius: "10px",
              marginBottom: "15px",
              boxShadow: "0 2px 5px rgba(211, 23, 23, 0.1)",
              backgroundColor: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>{food.name}</h3>
            {food.image ? (
              <img
                src={food.image}
                alt={food.name}
                style={{ width: "100%", borderRadius: "8px", marginBottom: "12px" }}
              />
            ) : null}
            <p>
              <strong>Restaurant:</strong> {food.restaurant_name}
            </p>
            <p>
              <strong>Location:</strong> {food.restaurant_location || "Unknown"}
            </p>
            <p>
              <strong>Category:</strong> {food.category || "Uncategorized"}
            </p>
            <p>
              <strong>Price:</strong>{" "}
              {food.price != null ? `$${Number(food.price).toFixed(2)}` : "N/A"}
            </p>
            <p>
              <strong>Rating:</strong> {food.rating != null ? food.rating : "N/A"}
            </p>
          </div>
        ))}
    </div>
  );
};

export default FoodCollection;
