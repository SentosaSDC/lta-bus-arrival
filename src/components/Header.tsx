import { Bus, Settings2, MapPin } from 'lucide-react';

interface Props {
  activeTab: 'stops' | 'map' | 'favorites' | 'routes';
  onSelectTab: (tab: 'stops' | 'map' | 'favorites' | 'routes') => void;
  onOpenSettings: () => void;
  onLocateMe: () => void;
  isLocating: boolean;
  favoritesCount: number;
}

export function Header({
  activeTab,
  onSelectTab,
  onOpenSettings,
  onLocateMe,
  isLocating,
  favoritesCount,
}: Props) {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-8 h-16">
        {/* Zone 1: Single Brand Wordmark */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bus className="w-4 h-4" />
          </div>
          <button
            onClick={() => onSelectTab('stops')}
            className="text-left group cursor-pointer"
          >
            <span className="text-base font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors whitespace-nowrap">
              SG Bus Arrival
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links (Single-Line, concise) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('stops')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'stops'
                ? 'text-emerald-400 border-b-2 border-emerald-400 py-1'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Bus Stops
          </button>
          <button
            onClick={() => onSelectTab('map')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'map'
                ? 'text-emerald-400 border-b-2 border-emerald-400 py-1'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Live Map & GPS
          </button>
          <button
            onClick={() => onSelectTab('favorites')}
            className={`whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'favorites'
                ? 'text-emerald-400 border-b-2 border-emerald-400 py-1'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="text-xs px-1.5 py-0.2 rounded-full bg-slate-800 text-emerald-400 font-mono">
                {favoritesCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onSelectTab('routes')}
            className={`whitespace-nowrap transition-colors cursor-pointer ${
              activeTab === 'routes'
                ? 'text-emerald-400 border-b-2 border-emerald-400 py-1'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Service Directory
          </button>
        </nav>

        {/* Zone 3: 1 Primary contextual Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onLocateMe}
            disabled={isLocating}
            title="Locate nearest Singapore bus stop"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium border border-slate-700 transition-colors whitespace-nowrap"
          >
            <MapPin className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-bounce' : ''}`} />
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-emerald-500/20"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Backend API</span>
          </button>
        </div>
      </div>
    </header>
  );
}
