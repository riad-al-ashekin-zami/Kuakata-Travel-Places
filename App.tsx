
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Place, Category } from './types';
import { CATEGORIES } from './types';
import { fetchKuakataPlaces } from './services/geminiService';
import PlaceCard from './components/PlaceCard';
import PlaceDetailModal from './components/PlaceDetailModal';
import { StarIcon } from './components/icons';

const Header: React.FC = () => (
    <header className="text-center p-4 sm:p-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
            Kuakata
            <span className="block text-cyan-400 text-2xl sm:text-3xl font-medium mt-1">AI Travel Guide</span>
        </h1>
        <p className="mt-3 max-w-2xl mx-auto text-base sm:text-lg text-slate-400">
            Discover top-rated local gems with Google Maps.
        </p>
    </header>
);

const FilterPills: React.FC<{ activeFilter: Category, onFilterChange: (category: Category) => void }> = ({ activeFilter, onFilterChange }) => (
    <div className="flex justify-center flex-wrap gap-2 px-4 py-3">
        {CATEGORIES.map((category) => (
            <button
                key={category}
                onClick={() => onFilterChange(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
                    activeFilter === category
                        ? 'bg-cyan-500 text-white shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
            >
                {category}
            </button>
        ))}
    </div>
);

const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center text-center p-10">
        <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-lg font-semibold text-white">Crafting your Kuakata adventure...</p>
        <p className="text-slate-400">Using AI to find the best spots.</p>
    </div>
);

const ErrorMessage: React.FC<{ message: string }> = ({ message }) => (
    <div className="text-center p-10 bg-red-900/20 border border-red-500/30 rounded-lg m-4">
        <p className="text-xl font-bold text-red-400">Oops! Something went wrong.</p>
        <p className="text-slate-300 mt-2">{message}</p>
    </div>
);

const App: React.FC = () => {
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; } | null>(null);
    const [activeFilter, setActiveFilter] = useState<Category>('All');
    const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);

    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (err) => {
                console.error("Geolocation error:", err);
                // Fallback location near Kuakata if permission denied
                setUserLocation({ latitude: 21.8267, longitude: 90.1234 });
                setError("Could not get your location. Using a default location for recommendations.");
            }
        );
    }, []);

    const loadPlaces = useCallback(async () => {
        if (!userLocation) return;
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            const fetchedPlaces = await fetchKuakataPlaces(userLocation);
            setPlaces(fetchedPlaces);
        } catch (e: unknown) {
            if (e instanceof Error) {
                setError(e.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setLoading(false);
        }
    }, [userLocation]);


    useEffect(() => {
        if (userLocation) {
            loadPlaces();
        }
    }, [userLocation, loadPlaces]);

    const filteredPlaces = useMemo(() => {
        if (activeFilter === 'All') {
            return places;
        }
        return places.filter(place => place.category === activeFilter);
    }, [places, activeFilter]);

    const handleToggleFavorite = (placeId: string) => {
        setFavorites(prev => 
            prev.includes(placeId) 
            ? prev.filter(id => id !== placeId)
            : [...prev, placeId]
        );
    };

    const handleSelectPlace = (place: Place) => {
        setSelectedPlace(place);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans">
            <Header />
            <FilterPills activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            <main className="max-w-7xl mx-auto px-4 py-6">
                {loading && <LoadingSpinner />}
                {error && !loading && <ErrorMessage message={error} />}
                {!loading && !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlaces.length > 0 ? (
                            filteredPlaces.map(place => (
                                <PlaceCard
                                    key={place.id}
                                    place={place}
                                    onSelect={handleSelectPlace}
                                    isSelected={selectedPlace?.id === place.id}
                                />
                            ))
                        ) : (
                             <div className="col-span-full text-center py-10">
                                <p className="text-lg text-slate-400">No places found for "{activeFilter}".</p>
                            </div>
                        )}
                    </div>
                )}
            </main>
            
            <PlaceDetailModal 
                place={selectedPlace}
                onClose={() => setSelectedPlace(null)}
                isFavorite={selectedPlace ? favorites.includes(selectedPlace.id) : false}
                onToggleFavorite={handleToggleFavorite}
            />
        </div>
    );
};

export default App;
