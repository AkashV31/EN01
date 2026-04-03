"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAppStore } from "@/lib/store";
import { parseIntent, optimize, generateESGReport } from "@/lib/api";

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

function ChartFrame({ children }: { children: React.ReactNode }) {
  const mounted = useIsClient();
  if (!mounted) {
    return (
      <div className="flex h-full items-center justify-center rounded-[24px] bg-[var(--green-50)]">
        <div className="text-sm font-medium text-[var(--green-600)]">Loading chart…</div>
      </div>
    );
  }
  return <>{children}</>;
}

const EXAMPLE_QUERIES = [
  { label: "🌿 Carbon Focus", text: "Plant neem trees for carbon sequestration, budget 30k" },
  { label: "🌳 Shade Coverage", text: "I want shade trees for the city, budget of 50000" },
  { label: "❄️ Heat Reduction", text: "Plant pine trees to reduce temperature, $15k budget" },
  { label: "🦋 Biodiversity", text: "We need biodiversity improvement with banyan trees, 80k" },
];

function formatNum(n: number) {
  return Number(n).toLocaleString();
}

export function WorkspaceDashboard() {
  const store = useAppStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleParseIntent() {
    if (!query.trim()) return;
    setLoading("parse");
    setError(null);
    try {
      const res = await parseIntent(query);
      store.setIntentResult(res);
      store.setStep(2);
    } catch (e: unknown) {
      setError(`Parse failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleOptimize() {
    const budget = store.intentResult?.budget ?? 20000;
    setLoading("optimize");
    setError(null);
    try {
      const res = await optimize(budget, store.geoData);
      store.setOptimizeResult(res);
      store.setStep(3);
    } catch (e: unknown) {
      setError(`Optimize failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(null);
    }
  }

  async function handleESG() {
    if (!store.optimizeResult?.selected.length) return;
    setLoading("esg");
    setError(null);
    try {
      const res = await generateESGReport(store.optimizeResult.selected);
      store.setESGResult(res);
      store.setStep(4);
    } catch (e: unknown) {
      setError(`ESG failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(null);
    }
  }

  function handleReset() {
    store.resetDemo();
    setQuery("");
    setError(null);
  }

  const step = store.currentStep;

  return (
    <main className="app-shell flex flex-1 px-5 py-6 md:px-8">
      <div className="mx-auto grid w-full max-w-[1600px] gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">

        {/* ──── SIDEBAR ──── */}
        <aside className="glass-card rounded-[32px] p-6">
          <div className="space-y-8">
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-[0.3em] text-[var(--green-600)]">
                CanopyROI
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold tracking-[-0.05em] text-[var(--green-700)]">
                Demo Workspace
              </h1>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Interactive 3-step pipeline connected to your FastAPI backend.
              </p>
            </div>

            {/* Step indicators */}
            <nav className="space-y-3">
              {[
                { n: 1, label: "Parse Intent", icon: "🎯" },
                { n: 2, label: "Optimize Zones", icon: "📍" },
                { n: 3, label: "ESG Report", icon: "📊" },
              ].map(({ n, label, icon }) => (
                <div
                  key={n}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all ${
                    step === n
                      ? "bg-[var(--green-600)] text-white shadow-[0_8px_24px_rgba(34,107,57,0.2)]"
                      : step > n
                      ? "border border-[var(--green-200)] bg-[var(--green-50)] text-[var(--green-700)]"
                      : "border border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  <span className="text-lg">{step > n ? "✅" : icon}</span>
                  <span>Step {n}: {label}</span>
                </div>
              ))}
              {step >= 4 && (
                <div className="flex items-center gap-3 rounded-2xl bg-[var(--green-600)] px-4 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(34,107,57,0.2)]">
                  <span className="text-lg">🎉</span>
                  <span>Complete!</span>
                </div>
              )}
            </nav>

            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)]"
              >
                Login
              </Link>
              <Link
                href="/intro"
                className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)]"
              >
                Intro
              </Link>
            </div>
          </div>
        </aside>

        {/* ──── MAIN CONTENT ──── */}
        <section className="space-y-6">

          {/* Error banner */}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              ⚠️ {error} — Make sure FastAPI is running at <code className="rounded bg-red-100 px-1">localhost:8000</code>
            </div>
          )}

          {/* ──────────────── STEP 1: PARSE INTENT ──────────────── */}
          <div className={`glass-card rounded-[32px] p-6 md:p-8 transition-all ${step !== 1 && step < 4 ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--green-600)]">
                  Step 01
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-[var(--green-700)]">
                  Describe your planting goal
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--muted)]">
                  Type a natural language query. Our NLP engine extracts budget, tree type, and priority automatically.
                </p>
              </div>
              {store.intentResult && (
                <span className="rounded-full bg-[var(--green-50)] px-3 py-1.5 text-sm font-semibold text-[var(--green-700)]">
                  ✅ Parsed
                </span>
              )}
            </div>

            {/* Example pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {EXAMPLE_QUERIES.map((ex) => (
                <button
                  key={ex.label}
                  type="button"
                  onClick={() => setQuery(ex.text)}
                  className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-medium text-[var(--green-700)] transition hover:bg-[var(--green-50)] hover:border-[var(--green-200)] active:scale-95"
                >
                  {ex.label}
                </button>
              ))}
            </div>

            {/* Input */}
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Plant oak trees for heat reduction with a budget of $20k"
              rows={3}
              className="w-full rounded-2xl border border-[var(--line)] bg-white px-4 py-3.5 text-[15px] text-[var(--foreground)] outline-none transition focus:border-[var(--green-500)] focus:ring-4 focus:ring-[rgba(45,138,74,0.12)] resize-none"
            />

            <button
              onClick={handleParseIntent}
              disabled={!query.trim() || loading === "parse"}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-600)] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--green-700)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading === "parse" ? (
                <><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Parsing…</>
              ) : (
                "🎯 Parse Intent"
              )}
            </button>

            {/* Results */}
            {store.intentResult && (
              <div className="mt-5 grid gap-4 sm:grid-cols-3 animate-in">
                {[
                  { label: "Budget", value: `$${formatNum(store.intentResult.budget)}`, icon: "💰" },
                  { label: "Tree Type", value: store.intentResult.tree_type, icon: "🌱" },
                  { label: "Priority", value: store.intentResult.priority.replace(/_/g, " "), icon: "🎯" },
                ].map((item) => (
                  <div key={item.label} className="metric-card rounded-[28px] p-5 text-center">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)]">{item.label}</p>
                    <p className="mt-2 font-display text-xl font-bold text-[var(--green-700)] capitalize">{item.value}</p>
                  </div>
                ))}
              </div>
            )}

            {store.intentResult && step === 1 && (
              <button
                onClick={() => store.setStep(2)}
                className="mt-4 w-full rounded-2xl border border-[var(--green-600)] px-5 py-3 text-base font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)] active:scale-[0.98]"
              >
                Continue to Optimization →
              </button>
            )}
          </div>

          {/* ──────────────── STEP 2: OPTIMIZE ──────────────── */}
          <div className={`glass-card rounded-[32px] p-6 md:p-8 transition-all ${step < 2 ? "opacity-30 pointer-events-none" : step > 2 && step < 4 ? "opacity-50 pointer-events-none" : ""}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--green-600)]">
                  Step 02
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-[var(--green-700)]">
                  Optimize Planting Zones
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--muted)]">
                  Our algorithm selects highest-impact zones within your budget using LST, NDVI, and cost scoring.
                </p>
              </div>
              {store.optimizeResult && (
                <span className="rounded-full bg-[var(--green-50)] px-3 py-1.5 text-sm font-semibold text-[var(--green-700)]">
                  ✅ Optimized
                </span>
              )}
            </div>

            {/* Budget + zone count */}
            <div className="grid gap-4 sm:grid-cols-2 mb-4">
              <div>
                <label className="text-sm font-semibold text-[var(--green-700)]">Budget</label>
                <p className="mt-1 font-display text-3xl font-bold text-[var(--green-700)]">
                  ${formatNum(store.intentResult?.budget ?? 20000)}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-[var(--green-700)]">Geo Zones</label>
                <p className="mt-1 font-display text-3xl font-bold text-[var(--green-700)]">
                  {store.geoData.length}
                </p>
                <button
                  onClick={() => store.addGeoPoint()}
                  className="mt-2 rounded-full border border-[var(--line)] px-3 py-1 text-xs font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)]"
                >
                  + Add Random Zone
                </button>
              </div>
            </div>

            {/* Geo table */}
            <div className="max-h-[200px] overflow-y-auto rounded-2xl border border-[var(--line)] bg-white mb-4">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--green-50)]">
                  <tr className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--green-600)]">
                    <th className="px-4 py-3 text-left">Zone</th>
                    <th className="px-3 py-3 text-left">Lat</th>
                    <th className="px-3 py-3 text-left">Lon</th>
                    <th className="px-3 py-3 text-left">NDVI</th>
                    <th className="px-3 py-3 text-left">LST °C</th>
                    <th className="px-3 py-3 text-left">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {store.geoData.map((p, i) => (
                    <tr key={i} className="border-t border-[var(--line)] hover:bg-[var(--green-50)] transition">
                      <td className="px-4 py-2.5 font-semibold text-[var(--green-700)]">Z{String(i + 1).padStart(2, "0")}</td>
                      <td className="px-3 py-2.5 font-mono text-[var(--muted)]">{p.lat}</td>
                      <td className="px-3 py-2.5 font-mono text-[var(--muted)]">{p.lon}</td>
                      <td className="px-3 py-2.5">
                        <span className={`font-semibold ${p.ndvi > 0.5 ? "text-[var(--green-600)]" : "text-amber-600"}`}>{p.ndvi}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`font-semibold ${p.lst > 38 ? "text-red-500" : "text-[var(--green-600)]"}`}>{p.lst}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[var(--muted)]">{formatNum(p.cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleOptimize}
              disabled={step < 2 || loading === "optimize"}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-600)] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--green-700)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading === "optimize" ? (
                <><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Optimizing…</>
              ) : (
                "📍 Run Optimizer"
              )}
            </button>

            {/* Optimize results */}
            {store.optimizeResult && (
              <>
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  {[
                    { label: "Zones Selected", value: store.optimizeResult.selected.length, icon: "📍" },
                    { label: "Total Cost", value: `$${formatNum(store.optimizeResult.total_cost)}`, icon: "💵" },
                    { label: "Budget Remaining", value: `$${formatNum((store.intentResult?.budget ?? 20000) - store.optimizeResult.total_cost)}`, icon: "💰" },
                  ].map((item) => (
                    <div key={item.label} className="metric-card rounded-[28px] p-5 text-center">
                      <div className="text-2xl mb-2">{item.icon}</div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)]">{item.label}</p>
                      <p className="mt-2 font-display text-xl font-bold text-[var(--green-700)]">{String(item.value)}</p>
                    </div>
                  ))}
                </div>

                {/* Selected vs skipped */}
                <div className="mt-4 rounded-2xl border border-[var(--line)] bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)] mb-3">Zone Selection</p>
                  <div className="flex flex-wrap gap-2">
                    {store.geoData.map((p, i) => {
                      const isSelected = store.optimizeResult!.selected.some(
                        (s) => s.lat === p.lat && s.lon === p.lon
                      );
                      return (
                        <span
                          key={i}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                            isSelected
                              ? "bg-[var(--green-600)] text-white shadow-[0_4px_12px_rgba(34,107,57,0.25)]"
                              : "border border-[var(--line)] bg-gray-50 text-gray-400"
                          }`}
                        >
                          Z{String(i + 1).padStart(2, "0")} {isSelected ? "✓" : "✗"}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {step === 2 && (
                  <button
                    onClick={() => store.setStep(3)}
                    className="mt-4 w-full rounded-2xl border border-[var(--green-600)] px-5 py-3 text-base font-semibold text-[var(--green-700)] transition hover:bg-[var(--green-50)] active:scale-[0.98]"
                  >
                    Generate ESG Report →
                  </button>
                )}
              </>
            )}
          </div>

          {/* ──────────────── STEP 3: ESG REPORT ──────────────── */}
          <div className={`glass-card rounded-[32px] p-6 md:p-8 transition-all ${step < 3 ? "opacity-30 pointer-events-none" : ""}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="font-display text-sm font-semibold uppercase tracking-[0.28em] text-[var(--green-600)]">
                  Step 03
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-[var(--green-700)]">
                  ESG Impact Report
                </h2>
                <p className="mt-2 max-w-lg text-sm leading-7 text-[var(--muted)]">
                  10-year environmental impact analysis — trees planted, carbon sequestered, and urban heat reduced.
                </p>
              </div>
              {store.esgResult && (
                <span className="rounded-full bg-[var(--green-50)] px-3 py-1.5 text-sm font-semibold text-[var(--green-700)]">
                  ✅ Generated
                </span>
              )}
            </div>

            {!store.esgResult && (
              <button
                onClick={handleESG}
                disabled={step < 3 || loading === "esg"}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--green-600)] px-5 py-3.5 text-base font-semibold text-white transition hover:bg-[var(--green-700)] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {loading === "esg" ? (
                  <><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Generating…</>
                ) : (
                  "📊 Generate ESG Report"
                )}
              </button>
            )}

            {store.esgResult && (
              <>
                {/* Metric cards */}
                <div className="grid gap-4 sm:grid-cols-3 mb-6">
                  <div className="metric-card rounded-[28px] p-6 text-center">
                    <div className="text-3xl mb-3">🌳</div>
                    <p className="font-display text-4xl font-bold text-[var(--green-700)]">{store.esgResult.trees_planted}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)]">Trees Planted</p>
                    <div className="mt-3 h-2 rounded-full bg-[var(--green-100)] overflow-hidden">
                      <div className="h-full rounded-full bg-[var(--green-600)] transition-all duration-1000" style={{ width: `${Math.min(store.esgResult.trees_planted * 10, 100)}%` }} />
                    </div>
                  </div>
                  <div className="metric-card rounded-[28px] p-6 text-center">
                    <div className="text-3xl mb-3">💨</div>
                    <p className="font-display text-4xl font-bold text-[#0891b2]">{store.esgResult.carbon_10yr}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)]">kg CO₂ Captured (10yr)</p>
                    <div className="mt-3 h-2 rounded-full bg-cyan-100 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-600 transition-all duration-1000" style={{ width: `${Math.min(store.esgResult.carbon_10yr / 5, 100)}%` }} />
                    </div>
                  </div>
                  <div className="metric-card rounded-[28px] p-6 text-center">
                    <div className="text-3xl mb-3">🌡️</div>
                    <p className="font-display text-4xl font-bold text-amber-600">{store.esgResult.temp_reduction}°C</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)]">Heat Reduction</p>
                    <div className="mt-3 h-2 rounded-full bg-amber-100 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.min(store.esgResult.temp_reduction * 30, 100)}%` }} />
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--green-600)] mb-4">
                    Impact Breakdown
                  </p>
                  <div className="h-[240px]">
                    <ChartFrame>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { metric: "Trees", value: store.esgResult.trees_planted, fill: "#226b39" },
                            { metric: "CO₂ (kg)", value: store.esgResult.carbon_10yr, fill: "#0891b2" },
                            { metric: "Temp (×100)", value: +(store.esgResult.temp_reduction * 100).toFixed(1), fill: "#d97706" },
                          ]}
                        >
                          <CartesianGrid stroke="rgba(34,107,57,0.1)" strokeDasharray="4 4" />
                          <XAxis dataKey="metric" stroke="#6d8374" tickLine={false} axisLine={false} />
                          <YAxis stroke="#6d8374" tickLine={false} axisLine={false} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[10, 10, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartFrame>
                  </div>
                </div>

                {/* Narrative */}
                <div className="rounded-[28px] bg-[var(--green-50)] p-5 mb-5">
                  <p className="text-sm font-semibold text-[var(--green-700)] mb-2">Impact Summary</p>
                  <p className="text-sm leading-7 text-[var(--muted)] italic">
                    By planting {store.esgResult.trees_planted} {store.intentResult?.tree_type ?? "native"} trees across{" "}
                    {store.optimizeResult?.selected.length ?? 0} optimized zones, this campaign will sequester{" "}
                    {store.esgResult.carbon_10yr} kg of CO₂ over the next decade and reduce urban heat by{" "}
                    {store.esgResult.temp_reduction}°C — directly addressing the city&apos;s{" "}
                    {(store.intentResult?.priority ?? "environmental").replace(/_/g, " ")} goals.
                  </p>
                </div>

                {/* Reset */}
                <button
                  onClick={handleReset}
                  className="w-full rounded-2xl border border-cyan-400 px-5 py-3 text-base font-semibold text-cyan-700 transition hover:bg-cyan-50 active:scale-[0.98]"
                >
                  🔄 Start New Campaign
                </button>
              </>
            )}
          </div>

        </section>
      </div>
    </main>
  );
}
