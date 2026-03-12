import { useState } from "react";

const categories = [
  "Halal",
  "Vegan", 
  "Vegetarian",
  "Gluten-Free",
  "Healthy",
  "High Protein"
];

export function CategoryChips() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => setSelected(selected === category ? null : category)}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
            selected === category
              ? 'bg-green-500 text-white'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}
