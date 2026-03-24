import { MapPin } from "lucide-react";

interface PopularCardProps {
  image: string;
  name: string;
  distance: string;
}

export function PopularCard({ image, name, distance }: PopularCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden flex-shrink-0 w-40">
      <div className="relative h-24">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">{name}</h4>
        <div className="flex items-center gap-1 text-gray-500">
          <MapPin className="w-3 h-3" />
          <span className="text-xs">{distance}</span>
        </div>
      </div>
    </div>
  );
}
