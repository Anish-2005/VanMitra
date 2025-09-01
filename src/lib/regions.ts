export const STATES = [
  { code: 'MP', name: 'Madhya Pradesh', districts: ['Bhopal', 'Indore', 'Jabalpur'], center: [78.9629, 22.9734] },
  { code: 'TR', name: 'Tripura', districts: ['West Tripura', 'North Tripura'], center: [91.9882, 23.9408] },
  { code: 'OD', name: 'Odisha', districts: ['Puri', 'Kandhamal', 'Balasore'], center: [85.0985, 20.9517] },
  { code: 'TS', name: 'Telangana', districts: ['Hyderabad', 'Adilabad', 'Warangal'], center: [79.0193, 18.1124] },
  { code: 'WB', name: 'West Bengal', districts: ['Sundarban', 'Kolkata', 'Darjeeling'], center: [88.3639, 22.5726] },
];

export const DEFAULT_STATE = STATES[0].name;
export const DEFAULT_DISTRICT = STATES[0].districts[0];
