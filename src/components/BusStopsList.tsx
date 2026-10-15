import { useState, useMemo } from 'react';
import { BusStop } from '../types/bus';
import { Search, Star, MapPin, Train, Bus, X } from 'lucide-react';

interface Props {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onSelectStop: (stop: BusStop) => void;
  favorites: string[];
  onToggleFavorite: (stopCode: string) => void;
  userCoords: { lat: number; lng: number } | null;
  onLocateMe: () => void;
  isLocating: boolean;
}

export function BusStopsList({
  stops,
  selectedStop,
  onSelectStop,
  favorites,
  onToggleFavorite,
  userCoords,
  onLocateMe,
  isLocating,
}: Props) {
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'nearby' | 'mrt' | 'favorites'>('all');

  // Filter and search logic
  const filteredStops = useMemo(() => {
    let result = [...stops];

    // Filter mode
    if (filterMode === 'favorites') {
      result = result.filter((s) => favorites.includes(s.BusStopCode));
    } else if (filterMode === 'mrt') {
      result = result.filter((s) => s.mrtConnections && s.mrtConnections.length > 0);
    } else if (filterMode === 'nearby') {
      if (userCoords) {
        result.sort((a, b) => (a.distanceMeters ?? 999999) - (b.distanceMeters ?? 999999));
      }
    }

    // Text search query
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => {
        return (
          s.BusStopCode.toLowerCase().includes(q) ||
          s.Description.toLowerCase().includes(q) ||
          s.RoadName.toLowerCase().includes(q) ||
          s.services.some((svc) => svc.toLowerCase() === q || svc.toLowerCase().includes(q))
        );
      });
    }

    return result;
  }, [stops, search, filterMode, favorites, userCoords]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Search Header */}
      <div className="p-4 border-b border-slate-800 space-y-3 bg-slate-900/90 backdrop-blur-md">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code (09048), road, stop, or bus (190)..."
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-sans"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/80 rounded-xl overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
              filterMode === 'all'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            All Stops ({stops.length})
          </button>

          <button
            onClick={() => {
              setFilterMode('nearby');
              if (!userCoords) onLocateMe();
            }}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              filterMode === 'nearby'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Nearby {isLocating ? '...' : ''}</span>
          </button>

          <button
            onClick={() => setFilterMode('mrt')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              filterMode === 'mrt'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            <span>MRT Stns</span>
          </button>

          <button
            onClick={() => setFilterMode('favorites')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap flex items-center gap-1.5 transition-colors ${
              filterMode === 'favorites'
                ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${filterMode === 'favorites' ? 'fill-slate-950' : ''}`} />
            <span>Saved ({favorites.length})</span>
          </button>
        </div>
      </div>

      {/* Stop List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {filteredStops.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Bus className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-300">No bus stops found</p>
            <p className="text-xs text-slate-500">
              {filterMode === 'favorites'
                ? 'You have not favorited any bus stops yet. Click the star icon on any stop.'
                : 'Try searching with a 5-digit code like "09048", "Victoria St", or bus "190".'}
            </p>
          </div>
        ) : (
          filteredStops.map((stop) => {
            const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
            const isFav = favorites.includes(stop.BusStopCode);

            return (
              <div
                key={stop.BusStopCode}
                onClick={() => onSelectStop(stop)}
                className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-emerald-500/10 border-l-4 border-l-emerald-400'
                    : 'hover:bg-slate-850'
                }`}
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {stop.BusStopCode}
                    </span>
                    <span className="text-xs text-slate-400 truncate">{stop.RoadName}</span>
                    {stop.distanceMeters !== undefined && (
                      <span className="text-[11px] text-slate-500 shrink-0">
                        {stop.distanceMeters > 1000
                          ? `${(stop.distanceMeters / 1000).toFixed(1)}km`
                          : `${stop.distanceMeters}m`}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-white">
                    {stop.Description}
                  </h4>

                  {/* Services preview tags */}
                  <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                    {stop.services.slice(0, 6).map((svc) => (
                      <span
                        key={svc}
                        className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700/60"
                      >
                        {svc}
                      </span>
                    ))}
                    {stop.services.length > 6 && (
                      <span className="text-[10px] text-slate-500">
                        +{stop.services.length - 6} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Star Action */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(stop.BusStopCode);
                  }}
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isFav
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                  title={isFav ? 'Remove favorite' : 'Add to favorites'}
                >
                  <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
