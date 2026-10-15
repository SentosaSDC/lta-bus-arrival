export type BusLoad = 'SEA' | 'SDA' | 'LSD'; // Seats Available | Standing Available | Limited Standing
export type BusType = 'SD' | 'DD' | 'BD'; // Single Deck | Double Deck | Bendy
export type BusOperator = 'SBST' | 'SMRT' | 'TTS' | 'GAS';

export interface BusPrediction {
  OriginCode: string;
  DestinationCode: string;
  EstimatedArrival: string; // ISO string
  Latitude: string;
  Longitude: string;
  VisitNumber: string;
  Load: BusLoad;
  Feature: 'WAB' | '';
  Type: BusType;
  // Computed runtime helpers
  minutesAway?: number;
  secondsAway?: number;
  speed?: number; // km/h
}

export interface BusArrivalService {
  ServiceNo: string;
  Operator: BusOperator;
  NextBus: BusPrediction;
  NextBus2?: BusPrediction;
  NextBus3?: BusPrediction;
}

export interface BusArrivalResponse {
  'odata.metadata'?: string;
  BusStopCode: string;
  Services: BusArrivalService[];
}

export interface BusStop {
  BusStopCode: string;
  RoadName: string;
  Description: string;
  Latitude: number;
  Longitude: number;
  mrtConnections?: string[];
  services: string[];
  distanceMeters?: number;
}

export interface LiveBusMarker {
  id: string;
  serviceNo: string;
  operator: BusOperator;
  lat: number;
  lng: number;
  bearing: number;
  load: BusLoad;
  type: BusType;
  speed: number;
  targetStopCode: string;
  estimatedArrival: string;
  secondsAway: number;
  destination: string;
}

export interface BackendConfig {
  mode: 'simulator' | 'custom_backend' | 'lta_datamall';
  backendEndpoint: string;
  ltaAccountKey?: string;
}
