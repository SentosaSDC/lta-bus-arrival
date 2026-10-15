import { useState, useEffect, useCallback, useMemo } from 'react';
import { SINGAPORE_BUS_STOPS, calculateDistanceMeters } from './data/singaporeBusStops';
import { BusStop, BusArrivalResponse, LiveBusMarker } from './types/bus';
import { fetchBusArrivals, extractLiveBusesFromArrivals, processArrivalTimings } from './services/ltaBusService';
import { Header } from './components/Header';
import { BusStopsList } from './components/BusStopsList';
import { BusStopDetails } from './components/BusStopDetails';
import { BusMap } from './components/BusMap';
import { BackendSettingsModal } from './components/BackendSettingsModal';
import { ServiceDirectory } from './components/ServiceDirectory';
import { Map, Bus, Star, Compass, Layers, AlertCircle, RefreshCw } from 'lucide-react';

const FAVORITES_KEY = 'sg_bus_arrival_favorites';

export default function App() {
  const [stops, setStops] = useState<BusStop[]>(SINGAPORE_BUS_STOPS);
  const [selectedStop, setSelectedStop] = useState<BusStop>(SINGAPORE_BUS_STOPS[0]);
  const [arrivals, setArrivals] = useState<BusArrivalResponse | null>(null);
  const [isLoadingArrivals, setIsLoadingArrivals] = useState(false);
  const [liveBuses, setLiveBuses] = useState<LiveBusMarker[]>([]);
  const [focusedBusId, setFocusedBusId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stops' | 'map' | 'favorites' | 'routes'>('stops');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Favorites state persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    // Default initial favorites in SG
    return ['09048', '01012', '14141'];
  });

  const toggleFavorite = (stopCode: string) => {
    setFavorites((prev) => {
      const next = prev.includes(stopCode)
        ? prev.filter((c) => c !== stopCode)
        : [...prev, stopCode];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Geolocation handling
  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setUserCoords({ lat, lng });
        setIsLocating(false);

        // Recalculate distance to all stops and sort nearest
        const updatedStops = SINGAPORE_BUS_STOPS.map((s) => ({
          ...s,
          distanceMeters: calculateDistanceMeters(lat, lng, s.Latitude, s.Longitude),
        })).sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));

        setStops(updatedStops);
        // Automatically select the nearest stop
        if (updatedStops.length > 0) {
          setSelectedStop(updatedStops[0]);
        }
      },
      (err) => {
        console.warn('Geolocation failed or permission denied, using default central SG', err);
        setIsLocating(false);
        // Simulated GPS location at Orchard Road for seamless testing
        const defaultLat = 1.30403;
        const defaultLng = 103.83355;
        setUserCoords({ lat: defaultLat, lng: defaultLng });
        const updatedStops = SINGAPORE_BUS_STOPS.map((s) => ({
          ...s,
          distanceMeters: calculateDistanceMeters(defaultLat, defaultLng, s.Latitude, s.Longitude),
        })).sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
        setStops(updatedStops);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  }, []);

  // Fetch Arrivals for Selected Bus Stop
  const loadArrivals = useCallback(async (stopCode: string) => {
    setIsLoadingArrivals(true);
    try {
      const data = await fetchBusArrivals(stopCode);
      setArrivals(data);
      setLastUpdated(new Date());

      const currentStop = stops.find((s) => s.BusStopCode === stopCode) || selectedStop;
      const markers = extractLiveBusesFromArrivals(currentStop, data.Services);
      setLiveBuses(markers);
    } catch (err) {
      console.error('Failed to load arrivals:', err);
    } finally {
      setIsLoadingArrivals(false);
    }
  }, [stops, selectedStop]);

  // Load arrivals when selectedStop changes
  useEffect(() => {
    if (selectedStop) {
      loadArrivals(selectedStop.BusStopCode);
      setFocusedBusId(null);
    }
  }, [selectedStop.BusStopCode, loadArrivals]);

  // 1-Second Real-Time Clock & Vehicle Interpolation Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setArrivals((prev) => {
        if (!prev) return null;
        const updated = processArrivalTimings({ ...prev });
        return updated;
      });

      // Update live moving bus markers smoothly
      setLiveBuses((prev) => {
        if (!prev.length || !selectedStop) return prev;
        return prev.map((bus) => {
          const nextSec = Math.max(0, bus.secondsAway - 1);
          // Interpolate GPS coordinates closer to the stop as seconds decrease
          const approachFactor = Math.max(0, nextSec / Math.max(bus.secondsAway, 1));
          const targetLat = selectedStop.Latitude;
          const targetLng = selectedStop.Longitude;

          const currentLat = bus.lat;
          const currentLng = bus.lng;

          const newLat = nextSec <= 0 ? targetLat : currentLat + (targetLat - currentLat) * 0.035;
          const newLng = nextSec <= 0 ? targetLng : currentLng + (targetLng - currentLng) * 0.035;

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            secondsAway: nextSec,
            speed: nextSec <= 5 ? 0 : bus.speed,
          };
        });
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedStop]);

  // Periodic Auto-refresh (every 25 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedStop) {
        loadArrivals(selectedStop.BusStopCode);
      }
    }, 25000);
    return () => clearInterval(interval);
  }, [selectedStop, loadArrivals]);

  // Handle focusing a specific bus on the map
  const handleFocusBusOnMap = (busId: string) => {
    setFocusedBusId(busId);
    // On mobile, switch to map tab to show the vehicle
    if (window.innerWidth < 1024) {
      setActiveTab('map');
    }
  };

  const handleSelectStopAndSwitch = (stop: BusStop) => {
    setSelectedStop(stop);
    if (activeTab === 'routes') {
      setActiveTab('stops');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Universal Top Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLocateMe={handleLocateMe}
        isLocating={isLocating}
        favoritesCount={favorites.length}
      />

      {/* Main Responsive Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col gap-4 pb-20 lg:pb-6">
        {/* Quick Kicker Strip: Singapore Live Transit Info */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-semibold text-slate-200">Singapore LTA Bus Real-Time Network</span>
            <span className="hidden sm:inline text-slate-600">·</span>
            <span className="hidden sm:inline">Tracking {stops.length} major transit stops</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-emerald-400 font-semibold">{liveBuses.length} Live Buses</span>
            <span className="text-slate-600">·</span>
            <button
              onClick={() => loadArrivals(selectedStop.BusStopCode)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* View Routing */}
        {activeTab === 'routes' ? (
          <ServiceDirectory stops={stops} onSelectStop={handleSelectStopAndSwitch} />
        ) : (
          /* Desktop 2-column or 3-zone split */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[640px]">
            {/* Left Column: Stops & Favorites Explorer */}
            <div
              className={`lg:col-span-4 h-full ${
                activeTab === 'stops' || activeTab === 'favorites' ? 'block' : 'hidden lg:block'
              }`}
            >
              <BusStopsList
                stops={stops}
                selectedStop={selectedStop}
                onSelectStop={setSelectedStop}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                userCoords={userCoords}
                onLocateMe={handleLocateMe}
                isLocating={isLocating}
              />
            </div>

            {/* Middle Column: Selected Bus Stop Arrivals & Services */}
            <div
              className={`lg:col-span-4 h-full ${
                activeTab === 'stops' || activeTab === 'favorites' ? 'block' : 'hidden lg:block'
              }`}
            >
              <BusStopDetails
                stop={selectedStop}
                arrivals={arrivals}
                isLoading={isLoadingArrivals}
                onRefresh={() => loadArrivals(selectedStop.BusStopCode)}
                isFavorite={favorites.includes(selectedStop.BusStopCode)}
                onToggleFavorite={toggleFavorite}
                onFocusBusOnMap={handleFocusBusOnMap}
                focusedBusId={focusedBusId}
                lastUpdatedTime={lastUpdated}
              />
            </div>

            {/* Right Column: Interactive Leaflet Map & GPS Vehicles */}
            <div
              className={`lg:col-span-4 h-full min-h-[460px] lg:min-h-0 ${
                activeTab === 'map' ? 'block col-span-12' : 'hidden lg:block'
              }`}
            >
              <BusMap
                stops={stops}
                selectedStop={selectedStop}
                onSelectStop={setSelectedStop}
                liveBuses={liveBuses}
                focusedBusId={focusedBusId}
                userCoords={userCoords}
                className="h-full"
              />
            </div>
          </div>
        )}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Ergonomic thumb zone, <15% sticky height) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center h-16 px-2">
        <button
          onClick={() => setActiveTab('stops')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'stops' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bus className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Arrivals</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'map' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Map className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Live Map</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'favorites' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Star className={`w-5 h-5 mb-0.5 ${favorites.length > 0 && activeTab === 'favorites' ? 'fill-emerald-400' : ''}`} />
          <span className="text-[11px] leading-tight">Favorites</span>
        </button>

        <button
          onClick={() => setActiveTab('routes')}
          className={`flex flex-col items-center justify-center min-h-[44px] transition-colors ${
            activeTab === 'routes' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] leading-tight">Routes</span>
        </button>
      </nav>

      {/* Backend & LTA API Integration Modal */}
      <BackendSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onConfigUpdated={() => {
          loadArrivals(selectedStop.BusStopCode);
        }}
      />
    </div>
  );
}
