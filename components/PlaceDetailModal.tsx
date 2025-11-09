
import React, { useEffect } from 'react';
import type { Place } from '../types';
import { MapPinIcon, StarIcon, XIcon, HeartIcon } from './icons';

interface PlaceDetailModalProps {
  place: Place | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (placeId: string) => void;
}

const PlaceDetailModal: React.FC<PlaceDetailModalProps> = ({ place, onClose, isFavorite, onToggleFavorite }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [onClose]);

  if (!place) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-800/80 border border-slate-700 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 text-white relative animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
        
        <img src={place.imageUrl} alt={place.name} className="w-full h-60 object-cover rounded-lg mb-4" />
        
        <div className="flex justify-between items-start">
            <div>
                <span className="text-sm font-semibold bg-cyan-400/10 text-cyan-400 py-1 px-3 rounded-full">
                    {place.category}
                </span>
                <h2 className="text-3xl font-bold mt-2">{place.name}</h2>
            </div>
            <div className="flex items-center gap-2 text-amber-400 text-xl font-bold p-2 bg-slate-700/50 rounded-lg">
                <StarIcon className="w-6 h-6" />
                <span>{place.rating.toFixed(1)}</span>
            </div>
        </div>

        <p className="text-slate-300 mt-4 text-base leading-relaxed">
          {place.description}
        </p>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <a
                href={place.mapsUri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-cyan-600 transition-colors"
            >
                <MapPinIcon className="w-5 h-5" />
                <span>View on Map</span>
            </a>
            <button
                onClick={() => onToggleFavorite(place.id)}
                className={`flex-1 font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${isFavorite ? 'bg-red-500/20 text-red-400 ring-1 ring-red-500 hover:bg-red-500/30' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}
            >
                <HeartIcon className="w-5 h-5" isFavorite={isFavorite} />
                <span>{isFavorite ? 'Favorite' : 'Add to Favorites'}</span>
            </button>
        </div>
      </div>
       <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
          }
      `}</style>
    </div>
  );
};

export default PlaceDetailModal;
