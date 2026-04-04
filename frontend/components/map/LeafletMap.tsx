'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import type { GeoPoint } from '@/lib/api'
import 'leaflet/dist/leaflet.css'

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface LocationPin {
  name: string
  lat: number
  lon: number
  state: string
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

const pointKey = (p: GeoPoint) => `${p.lat}-${p.lon}`

function markerColor(p: GeoPoint, selected: boolean) {
  if (selected) return '#3c4514'
  if (p.lst > 45) return '#dc2626'
  if (p.lst > 42) return '#d97706'
  return '#9dac50'
}

/* ── Component ──────────────────────────────────────────────────────────── */

export default function LeafletMap({
  allZones,
  selected,
  locationPins = [],
  onZoneClick,
}: {
  allZones: GeoPoint[]
  selected: GeoPoint[]
  locationPins?: LocationPin[]
  onZoneClick?: (point: GeoPoint) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef      = useRef<any>(null)
  const markersRef  = useRef<Map<string, any>>(new Map())
  const LRef        = useRef<any>(null)
  const [ready, setReady]             = useState(false)
  const [showPicker, setShowPicker]   = useState(false)
  const [search, setSearch]           = useState('')
  const initRef = useRef(false)

  const selectedKeys = useMemo(() => new Set(selected.map(pointKey)), [selected])

  /* ── 1. Initialize map once ──────────────────────────────────────────── */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!containerRef.current) return
    if (initRef.current) return
    initRef.current = true

    const container = containerRef.current
    // Wipe any stale Leaflet state on the DOM node
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id
    }

    ;(async () => {
      try {
        const L = await import('leaflet')
        LRef.current = L

        // Following the user's sample: initialize with world view then flyTo
        const map = L.map(container, { zoomControl: true }).setView([20.5937, 78.9629], 5)
        mapRef.current = map

        // Same tile URL as user's sample
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map)

        setReady(true)
      } catch (err) {
        console.error('LeafletMap init error:', err)
        initRef.current = false
      }
    })()

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markersRef.current.clear()
      }
      if ((container as any)._leaflet_id) delete (container as any)._leaflet_id
      initRef.current = false
    }
  }, [])

  /* ── 2. Update zone markers ──────────────────────────────────────────── */
  useEffect(() => {
    if (!ready || !mapRef.current || !LRef.current) return
    const L   = LRef.current
    const map = mapRef.current

    // Remove stale markers
    const live = new Set(allZones.map(pointKey))
    markersRef.current.forEach((m, k) => {
      if (!live.has(k)) { m.remove(); markersRef.current.delete(k) }
    })

    // Add / update
    allZones.forEach(point => {
      const key  = pointKey(point)
      const isSel = selectedKeys.has(key)
      const color = markerColor(point, isSel)
      const existing = markersRef.current.get(key)

      if (existing) {
        existing.setStyle({ fillColor: color, color: isSel ? '#fff' : color,
          weight: isSel ? 3 : 2, radius: isSel ? 13 : 8 })
        return
      }

      const marker = L.circleMarker([point.lat, point.lon], {
        fillColor: color, color: isSel ? '#fff' : color,
        weight: isSel ? 3 : 2, opacity: 1, fillOpacity: 0.85,
        radius: isSel ? 13 : 8,
      }).addTo(map)

      const soil = point.soil_moisture !== undefined ? `<div style="display:flex;justify-content:space-between"><span>Soil:</span><span style="font-weight:500">${point.soil_moisture}%</span></div>` : ''
      const drought = point.drought_impact_score !== undefined ? `<div style="display:flex;justify-content:space-between"><span>Drought:</span><span style="font-weight:500">${point.drought_impact_score.toFixed(2)}</span></div>` : ''
      const selBadge = isSel ? `<div style="margin-top:8px;padding-top:6px;border-top:1px solid #e5e7eb"><span style="font-size:11px;background:#f0fdf4;border:1px solid #bbf7d0;color:#15803d;padding:2px 8px;border-radius:4px;font-weight:600">✓ Selected</span></div>` : ''

      marker.bindPopup(`
        <div style="min-width:190px;font-family:system-ui,sans-serif;padding:6px">
          <div style="font-weight:700;font-size:13px;color:#1c1917;margin-bottom:6px">${point.neighbourhood || `${point.lat.toFixed(4)}, ${point.lon.toFixed(4)}`}</div>
          <div style="font-size:12px;color:#57534e;line-height:1.6">
            <div style="display:flex;justify-content:space-between"><span>LST:</span><span style="font-weight:500">${point.lst}°C</span></div>
            <div style="display:flex;justify-content:space-between"><span>NDVI:</span><span style="font-weight:500">${point.ndvi}</span></div>
            <div style="display:flex;justify-content:space-between"><span>Cost:</span><span style="font-weight:500">₹${point.cost.toLocaleString('en-IN')}</span></div>
            ${soil}${drought}
          </div>
          ${selBadge}
        </div>
      `)

      // Feed zone click into parent (for AI directive)
      if (onZoneClick) {
        marker.on('click', () => onZoneClick(point))
      }

      markersRef.current.set(key, marker)
    })

    // Fly to selected zones or all zones
    if (selected.length > 0) {
      const lats = selected.map(p => p.lat)
      const lons = selected.map(p => p.lon)
      const bounds = L.latLngBounds(
        L.latLng(Math.min(...lats) - 0.01, Math.min(...lons) - 0.01),
        L.latLng(Math.max(...lats) + 0.01, Math.max(...lons) + 0.01),
      )
      map.flyToBounds(bounds, { padding: [40, 40], duration: 1.2 })
    } else if (allZones.length > 0) {
      const lats = allZones.map(p => p.lat)
      const lons = allZones.map(p => p.lon)
      const bounds = L.latLngBounds(
        L.latLng(Math.min(...lats) - 0.02, Math.min(...lons) - 0.02),
        L.latLng(Math.max(...lats) + 0.02, Math.max(...lons) + 0.02),
      )
      map.flyToBounds(bounds, { padding: [20, 20], duration: 1.0 })
    }
  }, [allZones, selected, selectedKeys, ready, onZoneClick])

  /* ── 3. Location picker flyTo ────────────────────────────────────────── */
  function flyToPin(pin: LocationPin) {
    if (!mapRef.current) return
    mapRef.current.flyTo([pin.lat, pin.lon], 12, { duration: 1.5 })
    setShowPicker(false)
    setSearch('')
  }

  const filtered = locationPins.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.state.toLowerCase().includes(search.toLowerCase())
  )

  /* ── 4. Render ───────────────────────────────────────────────────────── */
  return (
    <div className="relative w-full h-full" style={{ minHeight: 320 }}>
      {/* Map container — explicit height required by Leaflet */}
      <div
        ref={containerRef}
        style={{ width: '100%', height: '100%', minHeight: 320, background: '#f0ede4' }}
        className="z-0"
      />

      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#f0ede4] z-10">
          <div style={{ fontFamily: 'DM Mono,monospace', color: '#78716c', fontSize: 13 }}>
            Loading map…
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-3 left-3 z-[1000] rounded-xl bg-white/95 border border-stone-200 shadow-xl px-3 py-2 text-xs"
        style={{ fontFamily: 'DM Mono,monospace' }}>
        <div className="font-semibold text-stone-700 mb-1.5">Zone Heat Map</div>
        {[
          { color: '#3c4514', label: 'Selected' },
          { color: '#dc2626', label: 'Critical (>45°C)' },
          { color: '#d97706', label: 'High (>42°C)' },
          { color: '#9dac50', label: 'Moderate' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
            <span className="text-stone-500">{label}</span>
          </div>
        ))}
      </div>

      {/* Location picker button */}
      {locationPins.length > 0 && (
        <div className="absolute top-3 right-3 z-[1000]">
          <button
            onClick={() => setShowPicker(v => !v)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/95 border border-stone-200 shadow-xl text-xs font-medium text-stone-700 hover:bg-stone-50 transition"
            style={{ fontFamily: 'DM Mono,monospace' }}
          >
            <svg className="w-3.5 h-3.5 text-olive-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Select Location
          </button>

          {/* Picker dropdown */}
          {showPicker && (
            <div className="absolute top-10 right-0 w-64 rounded-xl bg-white border border-stone-200 shadow-2xl z-[2000] overflow-hidden"
              style={{ maxHeight: 320 }}>
              <div className="p-2 border-b border-stone-100">
                <input
                  autoFocus
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search city or state…"
                  className="w-full px-2 py-1.5 text-xs rounded-md border border-stone-200 focus:outline-none focus:border-olive-400"
                  style={{ fontFamily: 'DM Mono,monospace' }}
                />
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 260 }}>
                {filtered.map(pin => (
                  <button
                    key={`${pin.lat}-${pin.lon}`}
                    onClick={() => flyToPin(pin)}
                    className="w-full flex items-start gap-2 px-3 py-2 hover:bg-stone-50 transition text-left border-b border-stone-50 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-stone-700 truncate"
                        style={{ fontFamily: 'DM Mono,monospace' }}>
                        {pin.name}
                      </div>
                      <div className="text-[10px] text-stone-400 flex items-center gap-1 mt-0.5">
                        <span>{pin.state}</span>
                        <span className="text-stone-300">·</span>
                        <span>{pin.lat.toFixed(4)}, {pin.lon.toFixed(4)}</span>
                      </div>
                    </div>
                    <svg className="w-3 h-3 text-olive-500 shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center text-xs text-stone-400 py-6" style={{ fontFamily: 'DM Mono,monospace' }}>
                    No locations found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Zone count overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] rounded-lg bg-white/95 border border-stone-200 shadow-xl px-3 py-2 text-xs text-stone-500"
        style={{ fontFamily: 'DM Mono,monospace' }}>
        {allZones.length} zones{selected.length > 0 ? ` · ${selected.length} selected` : ''}
      </div>
    </div>
  )
}
