import axios from "axios";
import type { IntentResponse, OptimizeResponse, ESGResponse, GeoPoint } from "./types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
});

export async function parseIntent(query: string): Promise<IntentResponse> {
  const { data } = await api.post<IntentResponse>("/parse-intent", { query });
  return data;
}

export async function optimize(budget: number, geo_data: GeoPoint[]): Promise<OptimizeResponse> {
  const { data } = await api.post<OptimizeResponse>("/optimize", { budget, geo_data });
  return data;
}

export async function generateESGReport(selected: GeoPoint[]): Promise<ESGResponse> {
  const { data } = await api.post<ESGResponse>("/esg-report", { selected });
  return data;
}
