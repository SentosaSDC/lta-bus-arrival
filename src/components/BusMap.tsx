import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { BusStop, LiveBusMarker, BusLoad } from '../types/bus';
import { Navigation, Bus, Compass, Layers } from 'lucide-react';

interface Props {
  stops: BusStop[];
  selectedStop: BusStop | null;
  onSelectStop: (stop: BusStop) => void;
  liveBuses: LiveBusMarker[];
  focusedBusId: string | null;
  userCoords: { lat: number; lng: number } | null;
  className?: string;
}

function getLoadColor(load: BusLoad): string {
  switch (load) {
    case 'SEA':
      return '#10b981'; // Green
    case 'SDA':
      return '#f59e0b'; // Amber
    case 'LSD':
      return '#f43f5e'; // Red
    default:
      return '#10b981';
  }
}

function getLoadLabel(load: BusLoad): string {
  switch (load) {
    case 'SEA':
      return 'Seats Available';
    case 'SDA':
      return 'Standing Available';
    case 'LSD':
      return 'Limited Standing';
  }
}

export function BusMap({
  stops,
  selectedStop,
  onSelectStop,
  liveBuses,
  focusedBusId,
  userCoords,
  className = '',
}: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const stopMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const busMarkersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Default center at Singapore City Center
    const map = L.map(mapContainerRef.current, {
      center: [1.3521, 103.8198],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Clean CartoDB Dark Matter / Positron tiles for high-contrast transit display
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Bus Stops Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers not in current list
    const currentCodeSet = new Set(stops.map((s) => s.BusStopCode));
    stopMarkersRef.current.forEach((marker, code) => {
      if (!currentCodeSet.has(code)) {
        marker.remove();
        stopMarkersRef.current.delete(code);
      }
    });

    // Add or update markers
    stops.forEach((stop) => {
      const isSelected = selectedStop?.BusStopCode === stop.BusStopCode;
      let marker = stopMarkersRef.current.get(stop.BusStopCode);

      const html = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 hover:scale-110">
          ${
            isSelected
              ? '<div class="absolute -inset-2 rounded-full bg-emerald-500/30 bus-pulse-ring"></div>'
              : ''
          }
          <div class="flex items-center justify-center w-7 h-7 rounded-lg ${
            isSelected
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/50 ring-2 ring-white font-bold'
              : 'bg-slate-800 text-slate-200 border border-slate-600 shadow-md'
          } text-[11px] font-mono font-semibold transition-colors">
            🚏
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono text-slate-200 border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30">
            ${stop.BusStopCode} · ${stop.Description}
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-bus-stop-icon',
        html,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      if (!marker) {
        marker = L.marker([stop.Latitude, stop.Longitude], { icon }).addTo(map);
        marker.on('click', () => {
          onSelectStop(stop);
        });
        stopMarkersRef.current.set(stop.BusStopCode, marker);
      } else {
        marker.setIcon(icon);
        marker.setLatLng([stop.Latitude, stop.Longitude]);
      }
    });
  }, [stops, selectedStop, onSelectStop]);

  // Update User Location Marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (userCoords) {
      const html = `
        <div class="relative -translate-x-1/2 -translate-y-1/2">
          <div class="absolute -inset-3 rounded-full bg-cyan-500/30 bus-pulse-ring"></div>
          <div class="w-4 h-4 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-500/50"></div>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-user-icon',
        html,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      if (!userMarkerRef.current) {
        userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], { icon, zIndexOffset: 1000 }).addTo(map);
      } else {
        userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
  }, [userCoords]);

  // Update Live Buses Markers & Trajectory
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const currentBusIds = new Set(liveBuses.map((b) => b.id));

    // Remove deleted buses
    busMarkersRef.current.forEach((marker, id) => {
      if (!currentBusIds.has(id)) {
        marker.remove();
        busMarkersRef.current.delete(id);
      }
    });

    // Update or add live bus markers
    liveBuses.forEach((bus) => {
      const isFocused = focusedBusId === bus.id;
      const loadColor = getLoadColor(bus.load);
      const isArrived = bus.secondsAway <= 5;

      const html = `
        <div class="relative group cursor-pointer -translate-x-1/2 -translate-y-1/2 transition-transform ${
          isFocused ? 'scale-125 z-50' : 'hover:scale-115 z-40'
        }">
          <div class="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border-2 shadow-xl ${
            isFocused ? 'ring-2 ring-emerald-400 border-white' : 'border-slate-700'
          }" style="border-color: ${loadColor}">
            <span class="text-[10px] font-bold" style="color: ${loadColor}">🚌</span>
            <span class="font-mono font-bold text-xs text-white leading-none">${bus.serviceNo}</span>
            <span class="text-[9px] font-mono text-slate-300 ml-0.5">${bus.type}</span>
          </div>
          ${
            isArrived
              ? '<div class="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>'
              : ''
          }
          <div class="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/95 text-[11px] text-slate-200 border border-slate-700 whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            <div class="font-bold text-white flex items-center justify-between gap-2">
              <span>Service ${bus.serviceNo}</span>
              <span class="text-emerald-400 font-mono">${bus.secondsAway <= 0 ? 'ARRIVED' : `${Math.ceil(bus.secondsAway / 60)}m away`}</span>
            </div>
            <div class="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
              <span>${bus.operator}</span>
              <span>·</span>
              <span style="color: ${loadColor}">${getLoadLabel(bus.load)}</span>
              <span>·</span>
              <span>${bus.speed} km/h</span>
            </div>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-live-bus-icon',
        html,
        iconSize: [52, 28],
        iconAnchor: [26, 14],
      });

      let marker = busMarkersRef.current.get(bus.id);
      if (!marker) {
        marker = L.marker([bus.lat, bus.lng], { icon, zIndexOffset: isFocused ? 500 : 300 }).addTo(map);
        busMarkersRef.current.set(bus.id, marker);
      } else {
        marker.setIcon(icon);
        marker.setLatLng([bus.lat, bus.lng]);
        marker.setZIndexOffset(isFocused ? 500 : 300);
      }
    });

    // Draw trajectory polyline from focused bus or nearest bus to selected stop
    if (selectedStop) {
      const activeBus = liveBuses.find((b) => b.id === focusedBusId) || liveBuses[0];
      if (activeBus) {
        const points: [number, number][] = [
          [activeBus.lat, activeBus.lng],
          [selectedStop.Latitude, selectedStop.Longitude],
        ];

        if (!polylineRef.current) {
          polylineRef.current = L.polyline(points, {
            color: getLoadColor(activeBus.load),
            dashArray: '6, 8',
            weight: 3,
            opacity: 0.8,
          }).addTo(map);
        } else {
          polylineRef.current.setLatLngs(points);
          polylineRef.current.setStyle({
            color: getLoadColor(activeBus.load),
          });
        }
      } else if (polylineRef.current) {
        polylineRef.current.remove();
        polylineRef.current = null;
      }
    } else if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }
  }, [liveBuses, focusedBusId, selectedStop]);

  // Center on selected stop or focused bus
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (focusedBusId) {
      const bus = liveBuses.find((b) => b.id === focusedBusId);
      if (bus) {
        map.flyTo([bus.lat, bus.lng], 16, { animate: true, duration: 0.8 });
        return;
      }
    }

    if (selectedStop) {
      map.flyTo([selectedStop.Latitude, selectedStop.Longitude], 15, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedStop, focusedBusId]);

  const handleCenterSG = () => {
    mapInstanceRef.current?.flyTo([1.3521, 103.8198], 12, { animate: true });
  };

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  return (
    <div className={`relative w-full h-full min-h-[350px] overflow-hidden rounded-2xl border border-slate-800 ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-base transition-colors shadow-lg shadow-black/40"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomOut}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 flex items-center justify-center font-bold text-base transition-colors shadow-lg shadow-black/40"
          title="Zoom Out"
        >
          -
        </button>
        <button
          onClick={handleCenterSG}
          className="w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-emerald-400 flex items-center justify-center transition-colors shadow-lg shadow-black/40"
          title="Singapore Overview"
        >
          <Compass className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <span>Seats</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
          <span>Standing</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
          <span>Limited</span>
        </div>
        <div className="border-l border-slate-700 pl-2.5 flex items-center gap-1.5 text-slate-400">
          <Bus className="w-3.5 h-3.5 text-emerald-400" />
          <span>{liveBuses.length} live buses</span>
        </div>
      </div>
    </div>
  );
}
