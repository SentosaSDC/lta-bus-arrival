import { useState } from 'react';
import { BusArrivalService, BusLoad, BusPrediction, BusType } from '../types/bus';
import { Accessibility, MapPin, Bell, Layers, Navigation } from 'lucide-react';

interface Props {
  service: BusArrivalService;
  onFocusBusOnMap: (busId: string) => void;
  isFocusedOnMap: boolean;
}

function getLoadInfo(load?: BusLoad): { color: string; label: string; textClass: string; bgClass: string; borderClass: string } {
  switch (load) {
    case 'SEA':
      return {
        color: '#10b981',
        label: 'Seats Available',
        textClass: 'text-emerald-400',
        bgClass: 'bg-emerald-500/10',
        borderClass: 'border-emerald-500/20',
      };
    case 'SDA':
      return {
        color: '#f59e0b',
        label: 'Standing Available',
        textClass: 'text-amber-400',
        bgClass: 'bg-amber-500/10',
        borderClass: 'border-amber-500/20',
      };
    case 'LSD':
      return {
        color: '#f43f5e',
        label: 'Limited Standing',
        textClass: 'text-rose-400',
        bgClass: 'bg-rose-500/10',
        borderClass: 'border-rose-500/20',
      };
    default:
      return {
        color: '#94a3b8',
        label: 'No Data',
        textClass: 'text-slate-400',
        bgClass: 'bg-slate-800',
        borderClass: 'border-slate-700',
      };
  }
}

function getTypeName(type?: BusType): string {
  switch (type) {
    case 'DD':
      return 'Double Deck';
    case 'BD':
      return 'Bendy';
    case 'SD':
    default:
      return 'Single Deck';
  }
}

function formatWaitTime(prediction?: BusPrediction): { main: string; sub: string; isArriving: boolean } {
  if (!prediction || !prediction.EstimatedArrival) {
    return { main: '-', sub: 'No timing', isArriving: false };
  }

  const seconds = prediction.secondsAway ?? 0;
  if (seconds <= 45) {
    return { main: 'Arr', sub: 'Arriving now', isArriving: true };
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSec = seconds % 60;
  return {
    main: `${minutes}m`,
    sub: `${remainingSec}s`,
    isArriving: false,
  };
}

export function BusServiceRow({ service, onFocusBusOnMap, isFocusedOnMap }: Props) {
  const [reminded, setReminded] = useState(false);

  const next1 = service.NextBus;
  const next2 = service.NextBus2;
  const next3 = service.NextBus3;

  const time1 = formatWaitTime(next1);
  const load1 = getLoadInfo(next1?.Load);
  const load2 = getLoadInfo(next2?.Load);
  const load3 = getLoadInfo(next3?.Load);

  const busId1 = `${service.ServiceNo}-next1`;

  const handleReminderToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setReminded(!reminded);
  };

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isFocusedOnMap
          ? 'bg-slate-850 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
          : 'bg-slate-900/60 hover:bg-slate-850 border-slate-800'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Service Number & Operator */}
        <div className="flex items-center gap-3.5">
          <div className="flex flex-col items-center justify-center min-w-[62px] h-[52px] rounded-xl bg-slate-800 border border-slate-700/80 shadow-inner px-2">
            <span className="font-mono font-extrabold text-2xl text-white tracking-tight leading-none">
              {service.ServiceNo}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 mt-0.5 tracking-wider">
              {service.Operator}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${load1.textClass}`}>
                {load1.label}
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-xs text-slate-300 font-medium">
                {getTypeName(next1?.Type)}
              </span>
              {next1?.Feature === 'WAB' && (
                <span title="Wheelchair Accessible Bus" className="text-sky-400">
                  <Accessibility className="w-3.5 h-3.5" />
                </span>
              )}
            </div>

            {/* Live GPS distance/speed metadata */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              {next1?.speed !== undefined && next1.speed > 0 ? (
                <span>Moving ~{next1.speed} km/h</span>
              ) : (
                <span>At bus bay</span>
              )}
              {next1?.Type === 'DD' && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="text-slate-300 flex items-center gap-1">
                    <Layers className="w-3 h-3 text-slate-400" />
                    2 Decks
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Arrival Timings (Next 1, Next 2, Next 3) */}
        <div className="flex items-center gap-2.5 sm:self-center">
          {/* 1st Arrival Primary Display */}
          <div
            className={`flex flex-col items-center justify-center min-w-[72px] h-[52px] rounded-xl px-2.5 border transition-all ${
              time1.isArriving
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 ring-2 ring-emerald-500/30'
                : `${load1.bgClass} ${load1.borderClass}`
            }`}
          >
            <div className="flex items-baseline gap-0.5">
              <span
                className={`font-mono font-bold text-xl leading-none ${
                  time1.isArriving ? 'text-emerald-400 animate-pulse' : load1.textClass
                }`}
              >
                {time1.main}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 leading-tight mt-0.5">
              {time1.sub}
            </span>
          </div>

          {/* 2nd Bus Arrival Badge */}
          {next2 && (
            <div
              className={`flex flex-col items-center justify-center min-w-[50px] h-[52px] rounded-xl px-1.5 border bg-slate-900/80 ${load2.borderClass}`}
              title={`Next bus: ${getTypeName(next2.Type)}, ${load2.label}`}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: load2.color }} />
                <span className={`font-mono font-semibold text-xs ${load2.textClass}`}>
                  {next2.minutesAway !== undefined ? `${next2.minutesAway}m` : '-'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                {next2.Type}
              </span>
            </div>
          )}

          {/* 3rd Bus Arrival Badge */}
          {next3 && (
            <div
              className={`flex flex-col items-center justify-center min-w-[50px] h-[52px] rounded-xl px-1.5 border bg-slate-900/80 ${load3.borderClass}`}
              title={`3rd bus: ${getTypeName(next3.Type)}, ${load3.label}`}
            >
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: load3.color }} />
                <span className={`font-mono font-semibold text-xs ${load3.textClass}`}>
                  {next3.minutesAway !== undefined ? `${next3.minutesAway}m` : '-'}
                </span>
              </div>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">
                {next3.Type}
              </span>
            </div>
          )}

          {/* Actions: Track on Map & Reminder */}
          <div className="flex items-center gap-1 pl-1">
            <button
              onClick={() => onFocusBusOnMap(busId1)}
              title="Track live bus GPS location on map"
              className={`p-2 rounded-lg border transition-colors ${
                isFocusedOnMap
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold'
                  : 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Navigation className="w-4 h-4" />
            </button>
            <button
              onClick={handleReminderToggle}
              title={reminded ? 'Reminder set' : 'Notify 2 mins before arrival'}
              className={`p-2 rounded-lg border transition-colors ${
                reminded
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700 hover:bg-slate-750'
              }`}
            >
              <Bell className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
