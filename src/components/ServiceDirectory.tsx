import { useState, useMemo } from 'react';
import { BusStop } from '../types/bus';
import { Search, Bus, ArrowRight, MapPin } from 'lucide-react';

interface Props {
  stops: BusStop[];
  onSelectStop: (stop: BusStop) => void;
}

export function ServiceDirectory({ stops, onSelectStop }: Props) {
  const [search, setSearch] = useState('');

  // Extract all unique bus services across stops
  const serviceMap = useMemo(() => {
    const map = new Map<string, BusStop[]>();
    stops.forEach((stop) => {
      stop.services.forEach((svc) => {
        if (!map.has(svc)) {
          map.set(svc, []);
        }
        map.get(svc)!.push(stop);
      });
    });

    const entries = Array.from(map.entries());
    entries.sort((a, b) => {
      const numA = parseInt(a[0], 10);
      const numB = parseInt(b[0], 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a[0].localeCompare(b[0]);
    });

    return entries;
  }, [stops]);

  const filteredServices = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return serviceMap;
    return serviceMap.filter(([svc, servedStops]) => {
      return (
        svc.toLowerCase().includes(q) ||
        servedStops.some(
          (s) =>
            s.Description.toLowerCase().includes(q) ||
            s.RoadName.toLowerCase().includes(q) ||
            s.BusStopCode.includes(q)
        )
      );
    });
  }, [serviceMap, search]);

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl p-5">
      <div className="pb-4 border-b border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Singapore Bus Service Directory</h3>
            <p className="text-xs text-slate-400">
              Explore bus routes across key transit corridors and connect directly to real-time stops
            </p>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
            {serviceMap.length} Services
          </span>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search service number (e.g. 190, 7, 65)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/80 pt-2 space-y-3">
        {filteredServices.map(([serviceNo, servedStops]) => (
          <div key={serviceNo} className="pt-3 pb-2 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center min-w-[44px] h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-sm">
                  {serviceNo}
                </div>
                <span className="text-xs text-slate-400">
                  Serves {servedStops.length} tracked stations
                </span>
              </div>
            </div>

            {/* List of stops on this route */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
              {servedStops.map((stop) => (
                <button
                  key={stop.BusStopCode}
                  onClick={() => onSelectStop(stop)}
                  className="p-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/50 text-left transition-colors group flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-mono text-[10px] text-emerald-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                        {stop.BusStopCode}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">{stop.RoadName}</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-white">
                      {stop.Description}
                    </div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400 shrink-0 mt-1 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
