import { BusArrivalResponse, BusArrivalService, BusLoad, BusOperator, BusPrediction, BusStop, BusType, LiveBusMarker, BackendConfig } from '../types/bus';
import { SINGAPORE_BUS_STOPS } from '../data/singaporeBusStops';

const BACKEND_CONFIG_KEY = 'sg_bus_arrival_backend_config';

export function getStoredBackendConfig(): BackendConfig {
  try {
    const raw = localStorage.getItem(BACKEND_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse backend config from localStorage', e);
  }
  return {
    mode: 'simulator',
    backendEndpoint: '/api/busarrival',
  };
}

export function saveBackendConfig(config: BackendConfig): void {
  localStorage.setItem(BACKEND_CONFIG_KEY, JSON.stringify(config));
}

// In-memory simulation state tracking live progress of buses
interface SimulatedBusState {
  serviceNo: string;
  busStopCode: string;
  nextBusArrivalTime: number; // unix timestamp ms
  nextBus2ArrivalTime: number;
  nextBus3ArrivalTime: number;
  operator: BusOperator;
  type: BusType;
  type2: BusType;
  type3: BusType;
  load: BusLoad;
  load2: BusLoad;
  load3: BusLoad;
  initialDistance: number; // meters
}

const simulationRegistry: Map<string, SimulatedBusState> = new Map();

function getOperatorForService(serviceNo: string): BusOperator {
  const sNum = parseInt(serviceNo, 10);
  if (isNaN(sNum)) return 'SBST';
  if ([169, 178, 187, 856, 858, 900, 901, 903, 904, 911, 912, 913, 925, 960, 961, 962, 963, 964, 965, 966, 969].includes(sNum)) {
    return 'SMRT';
  }
  if ([77, 97, 106, 143, 167, 177, 183, 188, 189, 941, 945, 947, 990].includes(sNum)) {
    return 'TTS'; // Tower Transit
  }
  if ([3, 12, 17, 34, 36, 43, 68, 82, 83, 84, 85, 118, 119, 136, 381, 382, 386].includes(sNum)) {
    return 'GAS'; // Go-Ahead
  }
  return 'SBST'; // SBS Transit
}

function getRandomLoad(): BusLoad {
  const rand = Math.random();
  if (rand < 0.58) return 'SEA'; // Seats Available (Green)
  if (rand < 0.88) return 'SDA'; // Standing Available (Amber)
  return 'LSD'; // Limited Standing (Red)
}

function getRandomType(): BusType {
  const rand = Math.random();
  if (rand < 0.65) return 'DD'; // High proportion of Double Deckers in SG
  if (rand < 0.95) return 'SD';
  return 'BD'; // Bendy (articulated)
}

function getOrInitSimulationState(busStopCode: string, serviceNo: string, stop: BusStop): SimulatedBusState {
  const key = `${busStopCode}_${serviceNo}`;
  const now = Date.now();
  let state = simulationRegistry.get(key);

  if (!state || state.nextBusArrivalTime < now - 35000) {
    // Generate fresh offsets: e.g. 1st bus is 1 to 5 mins away, 2nd is 6-12 mins, 3rd is 14-22 mins
    const baseMinutes = Math.floor(Math.random() * 5) + 1;
    const baseSec = Math.floor(Math.random() * 60);
    const arrival1 = now + (baseMinutes * 60 + baseSec) * 1000;
    const arrival2 = arrival1 + (Math.floor(Math.random() * 6) + 6) * 60 * 1000;
    const arrival3 = arrival2 + (Math.floor(Math.random() * 8) + 8) * 60 * 1000;

    state = {
      serviceNo,
      busStopCode,
      nextBusArrivalTime: arrival1,
      nextBus2ArrivalTime: arrival2,
      nextBus3ArrivalTime: arrival3,
      operator: getOperatorForService(serviceNo),
      type: getRandomType(),
      type2: getRandomType(),
      type3: getRandomType(),
      load: getRandomLoad(),
      load2: getRandomLoad(),
      load3: getRandomLoad(),
      initialDistance: (baseMinutes * 60 + baseSec) * 10.5, // approx 38 km/h
    };
    simulationRegistry.set(key, state);
  }

  // If next bus has arrived and 25s passed, rotate buses
  if (state.nextBusArrivalTime < now - 20000) {
    state.nextBusArrivalTime = state.nextBus2ArrivalTime;
    state.nextBus2ArrivalTime = state.nextBus3ArrivalTime;
    state.nextBus3ArrivalTime = state.nextBus2ArrivalTime + (Math.floor(Math.random() * 8) + 8) * 60 * 1000;
    state.load = state.load2;
    state.load2 = state.load3;
    state.load3 = getRandomLoad();
    state.type = state.type2;
    state.type2 = state.type3;
    state.type3 = getRandomType();
  }

  return state;
}

// Compute live GPS coordinates for moving bus heading towards the bus stop
export function computeLiveBusPosition(
  stopLat: number,
  stopLng: number,
  secondsAway: number,
  serviceSeed: number
): { lat: number; lng: number; bearing: number; speed: number } {
  const validLat = Number.isFinite(stopLat) ? stopLat : 1.3521;
  const validLng = Number.isFinite(stopLng) ? stopLng : 103.8198;
  const validSec = Number.isFinite(secondsAway) ? Math.max(0, secondsAway) : 0;
  const validSeed = Number.isFinite(serviceSeed) ? serviceSeed : 1;

  // If arrived, sit at or very near stop
  if (validSec <= 0) {
    return {
      lat: validLat + (Math.sin(validSeed) * 0.00008),
      lng: validLng + (Math.cos(validSeed) * 0.00008),
      bearing: (validSeed * 45) % 360,
      speed: 0,
    };
  }

  // Approach vector along an angle seeded by service
  const approachAngleRad = ((validSeed * 77) % 360) * (Math.PI / 180);
  // Speed is ~35 km/h -> 9.7 meters per second
  const distanceMeters = Math.min(validSec * 9.7, 4500);
  
  // 1 degree lat approx 111,000 m, lng approx 111,000 * cos(1.3 deg) ~ 111,000 m
  const deltaLat = (distanceMeters / 111000) * Math.cos(approachAngleRad);
  const deltaLng = (distanceMeters / 111000) * Math.sin(approachAngleRad);

  const busLat = validLat - deltaLat;
  const busLng = validLng - deltaLng;

  // Bearing towards stop
  const bearingDeg = (approachAngleRad * (180 / Math.PI) + 360) % 360;

  return {
    lat: Number.isFinite(busLat) ? busLat : validLat,
    lng: Number.isFinite(busLng) ? busLng : validLng,
    bearing: Math.round(bearingDeg),
    speed: validSec > 15 ? 38 + (validSeed % 12) : 18,
  };
}

export async function fetchBusArrivals(busStopCode: string): Promise<BusArrivalResponse> {
  const config = getStoredBackendConfig();

  // If user configured a live custom backend or LTA DataMall proxy
  if (config.mode === 'custom_backend' && config.backendEndpoint) {
    try {
      const url = `${config.backendEndpoint}?BusStopCode=${encodeURIComponent(busStopCode)}`;
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (config.ltaAccountKey) {
        headers['AccountKey'] = config.ltaAccountKey;
      }
      const response = await fetch(url, { headers });
      if (response.ok) {
        const data: BusArrivalResponse = await response.json();
        return processArrivalTimings(data);
      }
      console.warn('Custom backend responded with non-200. Falling back to simulator.', response.status);
    } catch (err) {
      console.warn('Error fetching from custom backend. Falling back to simulator:', err);
    }
  }

  // High-fidelity Simulator mode (matching LTA DataMall v2 response structure exactly)
  const stop = SINGAPORE_BUS_STOPS.find(s => s.BusStopCode === busStopCode);
  const servicesList = stop?.services || ['7', '14', '65', '147', '190'];
  const now = Date.now();

  const services: BusArrivalService[] = servicesList.map((serviceNo, index) => {
    const defaultStop = stop || {
      BusStopCode: busStopCode,
      RoadName: 'Orchard Rd',
      Description: 'City Bus Stop',
      Latitude: 1.304,
      Longitude: 103.833,
      services: servicesList,
    };

    const state = getOrInitSimulationState(busStopCode, serviceNo, defaultStop);
    const sec1 = Math.max(0, Math.round((state.nextBusArrivalTime - now) / 1000));
    const sec2 = Math.max(0, Math.round((state.nextBus2ArrivalTime - now) / 1000));
    const sec3 = Math.max(0, Math.round((state.nextBus3ArrivalTime - now) / 1000));

    const livePos1 = computeLiveBusPosition(defaultStop.Latitude, defaultStop.Longitude, sec1, index + 1);
    const livePos2 = computeLiveBusPosition(defaultStop.Latitude, defaultStop.Longitude, sec2, (index + 1) * 2);
    const livePos3 = computeLiveBusPosition(defaultStop.Latitude, defaultStop.Longitude, sec3, (index + 1) * 3);

    const nextBus: BusPrediction = {
      OriginCode: defaultStop.BusStopCode,
      DestinationCode: '99009',
      EstimatedArrival: new Date(state.nextBusArrivalTime).toISOString(),
      Latitude: livePos1.lat.toFixed(6),
      Longitude: livePos1.lng.toFixed(6),
      VisitNumber: '1',
      Load: state.load,
      Feature: 'WAB',
      Type: state.type,
      minutesAway: Math.floor(sec1 / 60),
      secondsAway: sec1,
      speed: livePos1.speed,
    };

    const nextBus2: BusPrediction = {
      OriginCode: defaultStop.BusStopCode,
      DestinationCode: '99009',
      EstimatedArrival: new Date(state.nextBus2ArrivalTime).toISOString(),
      Latitude: livePos2.lat.toFixed(6),
      Longitude: livePos2.lng.toFixed(6),
      VisitNumber: '1',
      Load: state.load2,
      Feature: 'WAB',
      Type: state.type2,
      minutesAway: Math.floor(sec2 / 60),
      secondsAway: sec2,
      speed: livePos2.speed,
    };

    const nextBus3: BusPrediction = {
      OriginCode: defaultStop.BusStopCode,
      DestinationCode: '99009',
      EstimatedArrival: new Date(state.nextBus3ArrivalTime).toISOString(),
      Latitude: livePos3.lat.toFixed(6),
      Longitude: livePos3.lng.toFixed(6),
      VisitNumber: '1',
      Load: state.load3,
      Feature: 'WAB',
      Type: state.type3,
      minutesAway: Math.floor(sec3 / 60),
      secondsAway: sec3,
      speed: livePos3.speed,
    };

    return {
      ServiceNo: serviceNo,
      Operator: state.operator,
      NextBus: nextBus,
      NextBus2: nextBus2,
      NextBus3: nextBus3,
    };
  });

  // Sort services alphabetically and numerically like LTA standards
  services.sort((a, b) => {
    const numA = parseInt(a.ServiceNo, 10);
    const numB = parseInt(b.ServiceNo, 10);
    if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
    return a.ServiceNo.localeCompare(b.ServiceNo);
  });

  return {
    BusStopCode: busStopCode,
    Services: services,
  };
}

export function processArrivalTimings(response: BusArrivalResponse): BusArrivalResponse {
  const now = Date.now();
  response.Services.forEach(s => {
    if (s.NextBus?.EstimatedArrival) {
      const targetTime = new Date(s.NextBus.EstimatedArrival).getTime();
      const sec = Math.max(0, Math.round((targetTime - now) / 1000));
      s.NextBus.secondsAway = sec;
      s.NextBus.minutesAway = Math.floor(sec / 60);
    }
    if (s.NextBus2?.EstimatedArrival) {
      const targetTime = new Date(s.NextBus2.EstimatedArrival).getTime();
      const sec = Math.max(0, Math.round((targetTime - now) / 1000));
      s.NextBus2.secondsAway = sec;
      s.NextBus2.minutesAway = Math.floor(sec / 60);
    }
    if (s.NextBus3?.EstimatedArrival) {
      const targetTime = new Date(s.NextBus3.EstimatedArrival).getTime();
      const sec = Math.max(0, Math.round((targetTime - now) / 1000));
      s.NextBus3.secondsAway = sec;
      s.NextBus3.minutesAway = Math.floor(sec / 60);
    }
  });
  return response;
}

// Convert current arrival services into active live map vehicle markers
export function extractLiveBusesFromArrivals(
  stop: BusStop,
  services: BusArrivalService[]
): LiveBusMarker[] {
  const markers: LiveBusMarker[] = [];

  services.forEach(svc => {
    if (svc.NextBus && svc.NextBus.Latitude && svc.NextBus.Longitude) {
      const lat = parseFloat(svc.NextBus.Latitude);
      const lng = parseFloat(svc.NextBus.Longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        markers.push({
          id: `${svc.ServiceNo}-next1`,
          serviceNo: svc.ServiceNo,
          operator: svc.Operator,
          lat,
          lng,
          bearing: 0,
          load: svc.NextBus.Load,
          type: svc.NextBus.Type,
          speed: svc.NextBus.speed || 36,
          targetStopCode: stop.BusStopCode,
          estimatedArrival: svc.NextBus.EstimatedArrival,
          secondsAway: svc.NextBus.secondsAway || 0,
          destination: stop.Description,
        });
      }
    }

    // Also include NextBus2 if it has valid GPS
    if (svc.NextBus2 && svc.NextBus2.Latitude && svc.NextBus2.Longitude) {
      const lat = parseFloat(svc.NextBus2.Latitude);
      const lng = parseFloat(svc.NextBus2.Longitude);
      if (!isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0) {
        markers.push({
          id: `${svc.ServiceNo}-next2`,
          serviceNo: svc.ServiceNo,
          operator: svc.Operator,
          lat,
          lng,
          bearing: 0,
          load: svc.NextBus2.Load,
          type: svc.NextBus2.Type,
          speed: svc.NextBus2.speed || 40,
          targetStopCode: stop.BusStopCode,
          estimatedArrival: svc.NextBus2.EstimatedArrival,
          secondsAway: svc.NextBus2.secondsAway || 0,
          destination: stop.Description,
        });
      }
    }
  });

  return markers;
}
