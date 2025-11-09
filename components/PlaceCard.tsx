
import React from 'react';
import type { Place } from '../types';
import { StarIcon } from './icons';

interface PlaceCardProps {
  place: Place;
  onSelect: (place: Place) => void;
  isSelected: boolean;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onSelect, isSelected }) => {
  return (
    <div
      onClick={() => onSelect(place)}
      className={`
        bg-slate-800 rounded-lg overflow-hidden flex flex-col md:flex-row 
        gap-4 p-4 cursor-pointer transition-all duration-300 ease-in-out
        hover:bg-slate-700/80 hover:shadow-cyan-500/10 hover:shadow-lg
        ${isSelected ? 'ring-2 ring-cyan-400' : 'ring-1 ring-slate-700'}
      `}
    >
      <img
        src={place.imageUrl}
        alt={place.name}
        className="w-full md:w-32 h-32 object-cover rounded-md flex-shrink-0"
      />
      <div className="flex flex-col justify-between">
        <div>
            <span className="text-xs font-semibold bg-cyan-400/10 text-cyan-400 py-1 px-2 rounded-full">
                {place.category}
            </span>
            <h3 className="text-lg font-bold text-white mt-2">{place.name}</h3>
        </div>
        <div className="flex items-center gap-1 text-amber-400 mt-2">
          <StarIcon className="w-5 h-5" />
          <span className="text-white font-semibold">{place.rating.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
