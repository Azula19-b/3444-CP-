import { useState, useEffect } from "react";

const FoodCollection = () => {
  const [foods, setFoods] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${search}`)
      .then(res => res.json())
      .then(data => {
        setFoods(data.meals || []);
        setLoading(false);
      })
      .catch(err => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, [search]);

  return (
    <div style={{
      maxWidth: "400px",
      margin: "0 auto",
      padding: "20px",
      fontFamily: "Arial"
    }}>
      <h1>UNT Quick Bytes</h1>

      <input
        type="text"
        placeholder="Search food..."
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

      {!loading && foods.map(food => (
        <div
          key={food.idMeal}
          style={{
            border: "1px solid #ddd",
            padding: "15px",
            borderRadius: "10px",
            marginBottom: "15px",
            boxShadow: "0 2px 5px rgba(211, 23, 23, 0.1)"
          }}
        >
          <h3>{food.strMeal}</h3>
          <img
            src={food.strMealThumb}
            alt={food.strMeal}
            style={{ width: "100%", borderRadius: "8px" }}
          />
        </div>
      ))}
    </div>
  );
};

export default FoodCollection;