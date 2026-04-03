export interface GeoPoint {
  lat: number;
  lon: number;
  ndvi: number;
  lst: number;
  cost: number;
}

export interface IntentResponse {
  budget: number;
  tree_type: string;
  priority: string;
}

export interface OptimizeResponse {
  selected: GeoPoint[];
  total_cost: number;
}

export interface ESGResponse {
  trees_planted: number;
  carbon_10yr: number;
  temp_reduction: number;
}
