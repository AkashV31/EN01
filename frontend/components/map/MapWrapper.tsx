'use client'

import dynamic from 'next/dynamic'
import type { LocationPin } from './LeafletMap'
import type { GeoPoint } from '@/lib/api'

const LeafletMap = dynamic(() => import('./LeafletMap'), { ssr: false })

export default function MapWrapper(props: {
  allZones: GeoPoint[]
  selected: GeoPoint[]
  locationPins?: LocationPin[]
  onZoneClick?: (point: GeoPoint) => void
}) {
  return <LeafletMap {...props} />
}
