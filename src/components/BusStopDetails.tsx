import { useState, useMemo } from 'react';
import { BusStop, BusArrivalResponse } from '../types/bus';
import { BusServiceRow } from './BusServiceRow';
import {
  Star,
  RefreshCw,
  Search,
  Filter,
  Train,
  Share2,
  Navigation,
  Clock,
  Layers,
  MapPin,
  Check,
} from 'lucide-react';

interface Props {
  stop: BusStop;
  arrivals: BusArrivalResponse | null;
  isLoading: boolean;
  onRefresh: () => void;
  isFavorite: boolean;
  onToggleFavorite: (stopCode: string) => void;
  onFocusBusOnMap: (busId: string) => void;
  focusedBusId: string | null;
  lastUpdatedTime: Date | null;
}

export function BusStopDetails({
  stop,
  arrivals,
  isLoading,
  onRefresh,
  isFavorite,
  onToggleFavorite,
  onFocusBusOnMap,
  focusedBusId,
  lastUpdatedTime,
}: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDDOnly, setFilterDDOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter services by search or double decker
  const filteredServices = useMemo(() => {
    if (!arrivals?.Services) return [];
    return arrivals.Services.filter((s) => {
      const matchesSearch =
        s.ServiceNo.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        s.Operator.toLowerCase().includes(searchQuery.toLowerCase().trim());
      if (!matchesSearch) return false;

      if (filterDDOnly) {
        return s.NextBus?.Type === 'DD' || s.NextBus2?.Type === 'DD' || s.NextBus3?.Type === 'DD';
      }
      return true;
    });
  }, [arrivals, searchQuery, filterDDOnly]);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Bus Stop ${stop.BusStopCode} - ${stop.Description} (${stop.RoadName})`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top Header Card */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm tracking-wider">
                {stop.BusStopCode}
              </span>
              <span className="text-xs text-slate-400 font-medium">{stop.RoadName}</span>
              {stop.distanceMeters !== undefined && (
                <span className="text-xs text-slate-500">· {stop.distanceMeters}m away</span>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">{stop.Description}</h2>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => onToggleFavorite(stop.BusStopCode)}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-2.5 rounded-xl border transition-colors ${
                isFavorite
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              title="Copy bus stop info"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700 hover:bg-slate-750 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh bus arrivals now"
              className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-750 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* MRT Station Interchanges */}
        {stop.mrtConnections && stop.mrtConnections.length > 0 && (
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800/80">
            <Train className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-xs text-slate-400 font-medium">MRT Connections:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {stop.mrtConnections.map((line) => (
                <span
                  key={line}
                  className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-xs font-mono font-semibold text-slate-200"
                >
                  {line}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Last updated & Search / Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 mt-4 pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>
              Updated{' '}
              {lastUpdatedTime
                ? lastUpdatedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                : 'Just now'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-44">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter service..."
                className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              onClick={() => setFilterDDOnly(!filterDDOnly)}
              className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-medium transition-colors ${
                filterDDOnly
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Double Deck</span>
            </button>
          </div>
        </div>
      </div>

      {/* Services List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
        {isLoading && (!arrivals || arrivals.Services.length === 0) ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
            <p className="text-sm">Fetching real-time predictions for Stop {stop.BusStopCode}...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <p className="text-sm font-medium text-slate-300">No matching bus services found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your search query or removing filters.
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <BusServiceRow
              key={service.ServiceNo}
              service={service}
              onFocusBusOnMap={onFocusBusOnMap}
              isFocusedOnMap={focusedBusId?.startsWith(`${service.ServiceNo}-`) ?? false}
            />
          ))
        )}
      </div>

      {/* Bottom Crowd Legend */}
      <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-300">LTA Crowd:</span>
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Seats Available
          </span>
          <span className="flex items-center gap-1 text-amber-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Standing
          </span>
          <span className="flex items-center gap-1 text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Limited
          </span>
        </div>
        <div className="text-slate-500">
          Auto-refreshing live LTA predictions
        </div>
      </div>
    </div>
  );
}
