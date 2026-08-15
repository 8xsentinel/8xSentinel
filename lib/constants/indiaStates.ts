export interface IndianState {
  code: string;
  name: string;
  type: 'state' | 'ut';
  region: 'North India' | 'South India' | 'East India' | 'West India' | 'Central India' | 'North-East India';
}

export const INDIAN_STATES: IndianState[] = [
  // --- States (28) ---
  { code: 'AP', name: 'Andhra Pradesh', type: 'state', region: 'South India' },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'state', region: 'North-East India' },
  { code: 'AS', name: 'Assam', type: 'state', region: 'North-East India' },
  { code: 'BR', name: 'Bihar', type: 'state', region: 'East India' },
  { code: 'CG', name: 'Chhattisgarh', type: 'state', region: 'Central India' },
  { code: 'GA', name: 'Goa', type: 'state', region: 'West India' },
  { code: 'GJ', name: 'Gujarat', type: 'state', region: 'West India' },
  { code: 'HR', name: 'Haryana', type: 'state', region: 'North India' },
  { code: 'HP', name: 'Himachal Pradesh', type: 'state', region: 'North India' },
  { code: 'JH', name: 'Jharkhand', type: 'state', region: 'East India' },
  { code: 'KA', name: 'Karnataka', type: 'state', region: 'South India' },
  { code: 'KL', name: 'Kerala', type: 'state', region: 'South India' },
  { code: 'MP', name: 'Madhya Pradesh', type: 'state', region: 'Central India' },
  { code: 'MH', name: 'Maharashtra', type: 'state', region: 'West India' },
  { code: 'MN', name: 'Manipur', type: 'state', region: 'North-East India' },
  { code: 'ML', name: 'Meghalaya', type: 'state', region: 'North-East India' },
  { code: 'MZ', name: 'Mizoram', type: 'state', region: 'North-East India' },
  { code: 'NL', name: 'Nagaland', type: 'state', region: 'North-East India' },
  { code: 'OD', name: 'Odisha', type: 'state', region: 'East India' },
  { code: 'PB', name: 'Punjab', type: 'state', region: 'North India' },
  { code: 'RJ', name: 'Rajasthan', type: 'state', region: 'North India' },
  { code: 'SK', name: 'Sikkim', type: 'state', region: 'North-East India' },
  { code: 'TN', name: 'Tamil Nadu', type: 'state', region: 'South India' },
  { code: 'TS', name: 'Telangana', type: 'state', region: 'South India' },
  { code: 'TR', name: 'Tripura', type: 'state', region: 'North-East India' },
  { code: 'UP', name: 'Uttar Pradesh', type: 'state', region: 'North India' },
  { code: 'UK', name: 'Uttarakhand', type: 'state', region: 'North India' },
  { code: 'WB', name: 'West Bengal', type: 'state', region: 'East India' },

  // --- Union Territories (8) ---
  { code: 'AN', name: 'Andaman and Nicobar Islands', type: 'ut', region: 'East India' },
  { code: 'CH', name: 'Chandigarh', type: 'ut', region: 'North India' },
  { code: 'DN', name: 'Dadra and Nagar Haveli and Daman and Diu', type: 'ut', region: 'West India' },
  { code: 'DL', name: 'Delhi (NCT)', type: 'ut', region: 'North India' },
  { code: 'JK', name: 'Jammu and Kashmir', type: 'ut', region: 'North India' },
  { code: 'LA', name: 'Ladakh', type: 'ut', region: 'North India' },
  { code: 'LD', name: 'Lakshadweep', type: 'ut', region: 'South India' },
  { code: 'PY', name: 'Puducherry', type: 'ut', region: 'South India' },
];

export const INDIA_REGIONS = [
  'All Regions',
  'North India',
  'South India',
  'West India',
  'East India',
  'Central India',
  'North-East India',
] as const;

export const ALL_STATE_NAMES = INDIAN_STATES.map((s) => s.name);

export function getStateRegion(stateName?: string | null): string {
  if (!stateName) return 'Pan India';
  const found = INDIAN_STATES.find((s) => s.name.toLowerCase() === stateName.toLowerCase());
  return found ? found.region : 'Pan India';
}
