import { create } from "zustand";
import type { IntentResponse, OptimizeResponse, ESGResponse, GeoPoint } from "./types";

function randomGeoPoint(): GeoPoint {
  return {
    lat: +(12 + Math.random() * 4).toFixed(4),
    lon: +(77 + Math.random() * 3).toFixed(4),
    ndvi: +(0.1 + Math.random() * 0.7).toFixed(2),
    lst: +(30 + Math.random() * 14).toFixed(1),
    cost: Math.round((3000 + Math.random() * 14000) / 500) * 500,
  };
}

interface AppState {
  // Auth
  isLoggedIn: boolean;
  userName: string;
  login: (name: string) => void;
  logout: () => void;

  // Step tracking
  currentStep: number;
  setStep: (s: number) => void;

  // Intent
  intentResult: IntentResponse | null;
  setIntentResult: (r: IntentResponse) => void;

  // Geo data
  geoData: GeoPoint[];
  addGeoPoint: () => void;
  resetGeoData: () => void;

  // Optimize
  optimizeResult: OptimizeResponse | null;
  setOptimizeResult: (r: OptimizeResponse) => void;

  // ESG
  esgResult: ESGResponse | null;
  setESGResult: (r: ESGResponse) => void;

  // Reset
  resetDemo: () => void;
}

const defaultGeo = () => Array.from({ length: 8 }, () => randomGeoPoint());

export const useAppStore = create<AppState>((set) => ({
  isLoggedIn: false,
  userName: "",
  login: (name) => set({ isLoggedIn: true, userName: name }),
  logout: () => set({ isLoggedIn: false, userName: "", intentResult: null, optimizeResult: null, esgResult: null, currentStep: 1, geoData: defaultGeo() }),

  currentStep: 1,
  setStep: (s) => set({ currentStep: s }),

  intentResult: null,
  setIntentResult: (r) => set({ intentResult: r }),

  geoData: defaultGeo(),
  addGeoPoint: () => set((state) => ({ geoData: [...state.geoData, randomGeoPoint()] })),
  resetGeoData: () => set({ geoData: defaultGeo() }),

  optimizeResult: null,
  setOptimizeResult: (r) => set({ optimizeResult: r }),

  esgResult: null,
  setESGResult: (r) => set({ esgResult: r }),

  resetDemo: () => set({ currentStep: 1, intentResult: null, optimizeResult: null, esgResult: null, geoData: defaultGeo() }),
}));
