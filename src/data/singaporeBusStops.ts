import { BusStop } from '../types/bus';

export const SINGAPORE_BUS_STOPS: BusStop[] = [
  // Orchard & Somerset Corridor
  {
    BusStopCode: '09048',
    RoadName: 'Orchard Rd',
    Description: 'Orchard Stn / Lucky Plaza',
    Latitude: 1.30403,
    Longitude: 103.83355,
    mrtConnections: ['NS22', 'TE14'],
    services: ['7', '14', '16', '65', '106', '111', '123', '175', '502'],
  },
  {
    BusStopCode: '09037',
    RoadName: 'Orchard Rd',
    Description: 'Opp Mandarin Orchard / Cineleisure',
    Latitude: 1.30232,
    Longitude: 103.83605,
    mrtConnections: ['NS23'],
    services: ['14', '16', '36', '65', '124', '143', '167', '174', '190'],
  },
  {
    BusStopCode: '08138',
    RoadName: 'Somerset Rd',
    Description: 'Somerset Stn',
    Latitude: 1.30055,
    Longitude: 103.83832,
    mrtConnections: ['NS23'],
    services: ['7', '14', '16', '36', '65', '77', '106', '111', '123', '174'],
  },
  {
    BusStopCode: '08057',
    RoadName: 'Orchard Rd',
    Description: 'Dhoby Ghaut Stn',
    Latitude: 1.29891,
    Longitude: 103.84583,
    mrtConnections: ['NS24', 'NE6', 'CC1'],
    services: ['7', '14', '16', '36', '64', '65', '111', '124', '139', '174'],
  },

  // Bugis & Bras Basah Corridor
  {
    BusStopCode: '01012',
    RoadName: 'Victoria St',
    Description: 'Hotel Grand Pacific',
    Latitude: 1.29684,
    Longitude: 103.85302,
    mrtConnections: ['EW12', 'DT14'],
    services: ['2', '7', '12', '33', '130', '133', '175', '197'],
  },
  {
    BusStopCode: '01112',
    RoadName: 'Victoria St',
    Description: 'Bugis Stn Exit A',
    Latitude: 1.30018,
    Longitude: 103.85605,
    mrtConnections: ['EW12', 'DT14'],
    services: ['2', '12', '33', '130', '133', '960', '980'],
  },
  {
    BusStopCode: '01059',
    RoadName: 'Bras Basah Rd',
    Description: 'Raffles Hotel',
    Latitude: 1.29497,
    Longitude: 103.85412,
    mrtConnections: ['CC3', 'DT21'],
    services: ['14', '16', '36', '77', '106', '130', '133', '167', '502'],
  },

  // Marina Bay & CBD Financial District
  {
    BusStopCode: '03011',
    RoadName: 'Collyer Quay',
    Description: 'Ocean Financial Ctr / Raffles Place Stn',
    Latitude: 1.28292,
    Longitude: 103.85244,
    mrtConnections: ['NS26', 'EW14'],
    services: ['10', '57', '70', '100', '107', '130', '131', '167', '196'],
  },
  {
    BusStopCode: '03509',
    RoadName: 'Bayfront Ave',
    Description: 'Marina Bay Sands Hotel',
    Latitude: 1.28318,
    Longitude: 103.85965,
    mrtConnections: ['CE1', 'DT16'],
    services: ['97', '106', '133', '502', '518'],
  },
  {
    BusStopCode: '03511',
    RoadName: 'Bayfront Ave',
    Description: 'Bayfront Stn Exit B / MBS',
    Latitude: 1.28189,
    Longitude: 103.85885,
    mrtConnections: ['CE1', 'DT16'],
    services: ['97', '106', '133', '502'],
  },
  {
    BusStopCode: '03211',
    RoadName: 'Shenton Way',
    Description: 'UIC Bldg / Shenton Way Stn',
    Latitude: 1.27745,
    Longitude: 103.84976,
    mrtConnections: ['TE19'],
    services: ['10', '57', '70', '97', '100', '131', '196', '400'],
  },

  // Chinatown & Clarke Quay
  {
    BusStopCode: '05049',
    RoadName: 'Eu Tong Sen St',
    Description: 'Chinatown Stn Exit C',
    Latitude: 1.28424,
    Longitude: 103.84372,
    mrtConnections: ['NE4', 'DT19'],
    services: ['2', '12', '33', '54', '61', '124', '143', '147', '190'],
  },
  {
    BusStopCode: '04239',
    RoadName: 'Eu Tong Sen St',
    Description: 'Clarke Quay Stn Exit E',
    Latitude: 1.28822,
    Longitude: 103.84655,
    mrtConnections: ['NE5'],
    services: ['2', '12', '33', '54', '147', '190'],
  },

  // HarbourFront & Sentosa Gateway
  {
    BusStopCode: '14141',
    RoadName: 'Telok Blangah Rd',
    Description: 'HarbourFront Stn / VivoCity',
    Latitude: 1.26528,
    Longitude: 103.82191,
    mrtConnections: ['NE1', 'CC29'],
    services: ['10', '30', '57', '61', '97', '100', '131', '143', '166', '188'],
  },
  {
    BusStopCode: '14119',
    RoadName: 'Telok Blangah Rd',
    Description: 'Opp VivoCity',
    Latitude: 1.26639,
    Longitude: 103.82361,
    mrtConnections: ['NE1', 'CC29'],
    services: ['10', '30', '57', '61', '97', '100', '131', '143', '166'],
  },
  {
    BusStopCode: '14519',
    RoadName: 'Sentosa Gateway',
    Description: 'Resorts World Sentosa',
    Latitude: 1.25624,
    Longitude: 103.82087,
    mrtConnections: [],
    services: ['123', 'RWS8'],
  },

  // Jurong East & West Region
  {
    BusStopCode: '28009',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Jurong East Temp Int',
    Latitude: 1.33311,
    Longitude: 103.74232,
    mrtConnections: ['NS1', 'EW24'],
    services: ['51', '52', '66', '78', '79', '97', '98', '105', '143', '183', '197', '333', '334', '335', '506'],
  },
  {
    BusStopCode: '28011',
    RoadName: 'Jurong Gateway Rd',
    Description: 'Opp JEM / Westgate',
    Latitude: 1.33415,
    Longitude: 103.74382,
    mrtConnections: ['NS1', 'EW24'],
    services: ['51', '52', '66', '78', '143', '183', '197'],
  },
  {
    BusStopCode: '17179',
    RoadName: 'Clementi Ave 3',
    Description: 'Clementi Int',
    Latitude: 1.31498,
    Longitude: 103.76451,
    mrtConnections: ['EW23'],
    services: ['7', '14', '52', '96', '99', '147', '156', '165', '166', '175', '196', '282', '284', '285'],
  },
  {
    BusStopCode: '11009',
    RoadName: 'Commonwealth Ave West',
    Description: 'Buona Vista Stn Exit C',
    Latitude: 1.30691,
    Longitude: 103.79042,
    mrtConnections: ['EW21', 'CC22'],
    services: ['74', '91', '95', '100', '105', '106', '111', '147', '196', '198', '200'],
  },

  // Ang Mo Kio & Bishan Corridor
  {
    BusStopCode: '54009',
    RoadName: 'Ang Mo Kio Ave 8',
    Description: 'Ang Mo Kio Int',
    Latitude: 1.36982,
    Longitude: 103.84964,
    mrtConnections: ['NS16', 'CR11'],
    services: ['22', '24', '25', '73', '86', '130', '133', '135', '136', '138', '166', '169', '261', '262', '265'],
  },
  {
    BusStopCode: '53231',
    RoadName: 'Bishan St 13',
    Description: 'Bishan Int',
    Latitude: 1.35081,
    Longitude: 103.84883,
    mrtConnections: ['NS17', 'CC15'],
    services: ['52', '53', '54', '55', '56', '57', '58', '59', '410G', '410W'],
  },
  {
    BusStopCode: '52009',
    RoadName: 'Lor 6 Toa Payoh',
    Description: 'Toa Payoh Int',
    Latitude: 1.33235,
    Longitude: 103.84803,
    mrtConnections: ['NS19'],
    services: ['8', '26', '28', '31', '73', '88', '90', '139', '141', '142', '143', '145', '155', '157', '159', '163', '231', '232', '235', '238'],
  },

  // Woodlands & North Region
  {
    BusStopCode: '46009',
    RoadName: 'Woodlands Sq',
    Description: 'Woodlands Temp Int',
    Latitude: 1.43682,
    Longitude: 103.78652,
    mrtConnections: ['NS9', 'TE2'],
    services: ['161', '168', '169', '178', '187', '856', '858', '900', '901', '903', '904', '911', '912', '913', '925', '960', '961', '962', '963', '964', '965', '966', '969'],
  },

  // Tampines, Bedok & East Region
  {
    BusStopCode: '75009',
    RoadName: 'Tampines Ctrl 1',
    Description: 'Tampines Int',
    Latitude: 1.35345,
    Longitude: 103.94421,
    mrtConnections: ['EW2', 'DT32'],
    services: ['3', '4', '8', '10', '19', '20', '23', '28', '29', '31', '37', '38', '46', '65', '67', '68', '69', '72', '81', '291', '292', '293'],
  },
  {
    BusStopCode: '84009',
    RoadName: 'Bedok North Ave 1',
    Description: 'Bedok Int',
    Latitude: 1.32431,
    Longitude: 103.93012,
    mrtConnections: ['EW5'],
    services: ['7', '9', '14', '16', '17', '18', '25', '26', '30', '32', '33', '35', '38', '40', '60', '66', '69', '87', '168', '196', '197', '222', '225G', '225W', '228', '229'],
  },
  {
    BusStopCode: '95029',
    RoadName: 'Airport Blvd',
    Description: 'Changi Airport PTB2',
    Latitude: 1.35512,
    Longitude: 103.98925,
    mrtConnections: ['CG2'],
    services: ['24', '27', '34', '36', '53', '110', '858'],
  },
];

// Helper to calculate distance in meters using Haversine formula
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}
