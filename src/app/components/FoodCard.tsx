import { Heart, Star } from "lucide-react";
import { useState } from "react";

interface FoodCardProps {
  image: string;
  name: string;
  restaurant: string;
  tags: string[];
  calories: number;
  rating: number;
}

export function FoodCard({ image, name, restaurant, tags, calories, rating }: FoodCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4">
      <div className="relative h-48">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
        <button 
          onClick={() => setIsFavorite(!isFavorite)}
          className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
        >
          <Heart 
            className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{name}</h3>
        <p className="text-sm text-gray-500 mb-3">{restaurant}</p>
        
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {tags.map((tag) => (
            <span 
              key={tag}
              className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{calories} cal</span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
            <span className="text-sm font-medium text-gray-900">{rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
