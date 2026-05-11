import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { LocateFixed, Maximize2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { useEVRPStore } from '@/lib/evrp-store'
import type { PlacementMode } from '@/lib/evrp-types'
import { ELEMENT_COLORS } from '@/lib/element-colors'
import { MapControlButton } from './MapControlButton'
import RouteLines from './RouteLines'

// Fix default marker icon paths broken by bundlers
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const ZAGREB: [number, number] = [45.815, 15.9819]
const DEFAULT_ZOOM = 13

function coloredIcon(color: string) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  })
}

const icons = {
  depot: coloredIcon(ELEMENT_COLORS.depot.leaflet),
  customer: coloredIcon(ELEMENT_COLORS.customer.leaflet),
  station: coloredIcon(ELEMENT_COLORS.station.leaflet),
}

interface MapPinProps {
  position: [number, number]
  icon: L.Icon
  highlighted: boolean
  onSelect: () => void
  onMove: (lat: number, lng: number) => void
  onRemove?: () => void
}

function MapPin({ position, icon, highlighted, onSelect, onMove, onRemove }: MapPinProps) {
  const eraseMode = useEVRPStore((s) => s.placementMode === 'erase')
  const markerRef = useRef<L.Marker>(null)

  useEffect(() => {
    const el = markerRef.current?.getElement()
    if (!el) return
    el.style.filter = highlighted ? 'drop-shadow(0 0 3px white) drop-shadow(0 0 4px black)' : ''
  }, [highlighted])

  return (
    <Marker
      ref={markerRef}
      position={position}
      icon={icon}
      draggable
      eventHandlers={{
        click(e) {
          if (onRemove && (eraseMode || e.originalEvent.shiftKey)) onRemove()
          else onSelect()
        },
        dragend(e) {
          const { lat, lng } = (e.target as L.Marker).getLatLng()
          onMove(lat, lng)
        },
      }}
    />
  )
}

const KEY_MODES: Record<string, PlacementMode> = {
  v: 'select',
  d: 'depot',
  c: 'customer',
  s: 'station',
  e: 'erase',
}

function KeyboardShortcuts() {
  const setPlacementMode = useEVRPStore((s) => s.setPlacementMode)
  const clearSelection = useEVRPStore((s) => s.clearSelection)
  const removeCustomer = useEVRPStore((s) => s.removeCustomer)
  const removeStation = useEVRPStore((s) => s.removeStation)
  const removeDepot = useEVRPStore((s) => s.removeDepot)

  useEffect(() => {
    function onKeyDown(ev: KeyboardEvent) {
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) return

      const mode = KEY_MODES[ev.key]
      if (mode) {
        setPlacementMode(mode)
        return
      }

      if (ev.key === 'Delete' || ev.key === 'Backspace') {
        const { selection } = useEVRPStore.getState()
        if (selection.type === 'customer' && selection.id) removeCustomer(selection.id)
        else if (selection.type === 'station' && selection.id) removeStation(selection.id)
        else if (selection.type === 'depot') removeDepot()
        else return
        clearSelection()
        setPlacementMode('select')
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [setPlacementMode, clearSelection, removeCustomer, removeStation, removeDepot])

  return null
}

function MapClickHandler() {
  const placementMode = useEVRPStore((s) => s.placementMode)
  const setDepot = useEVRPStore((s) => s.setDepot)
  const addCustomer = useEVRPStore((s) => s.addCustomer)
  const addStation = useEVRPStore((s) => s.addStation)
  const setPlacementMode = useEVRPStore((s) => s.setPlacementMode)
  const setSelection = useEVRPStore((s) => s.setSelection)
  const nextCustomerId = useEVRPStore((s) => s.nextCustomerId)
  const nextStationId = useEVRPStore((s) => s.nextStationId)

  useMapEvents({
    click(e) {
      const { lng, lat } = e.latlng
      if (placementMode === 'depot') {
        setDepot({ id: 'depot', x: lng, y: lat })
        setSelection({ type: 'depot', id: 'depot' })
        setPlacementMode('select')
      } else if (placementMode === 'customer') {
        const id = nextCustomerId()
        addCustomer({ id, x: lng, y: lat, demand: 1, readyTime: 0, dueDate: 1440, serviceTime: 0 })
        setSelection({ type: 'customer', id })
      } else if (placementMode === 'station') {
        const id = nextStationId()
        addStation({ id, x: lng, y: lat, dueDate: 1440 })
        setSelection({ type: 'station', id })
      }
    },
  })

  return null
}

function DepotMarker() {
  const depot = useEVRPStore((s) => s.problem.depot)
  const setDepot = useEVRPStore((s) => s.setDepot)
  const setSelection = useEVRPStore((s) => s.setSelection)
  const setActiveTab = useEVRPStore((s) => s.setActiveTab)
  const highlighted = useEVRPStore((s) => s.hoveredId === 'depot')
  if (Math.abs(depot.x) < 10 && Math.abs(depot.y) < 10) return null
  return (
    <MapPin
      position={[depot.y, depot.x]}
      icon={icons.depot}
      highlighted={highlighted}
      onSelect={() => {
        setSelection({ type: 'depot', id: 'depot' })
        setActiveTab('settings')
      }}
      onMove={(lat, lng) => setDepot({ ...depot, x: lng, y: lat })}
    />
  )
}

function CustomerMarkers() {
  const visible = useEVRPStore((s) => s.customersVisible)
  const customers = useEVRPStore((s) => s.problem.customers)
  const setSelection = useEVRPStore((s) => s.setSelection)
  const setActiveTab = useEVRPStore((s) => s.setActiveTab)
  const updateCustomer = useEVRPStore((s) => s.updateCustomer)
  const removeCustomer = useEVRPStore((s) => s.removeCustomer)
  const hoveredId = useEVRPStore((s) => s.hoveredId)
  if (!visible) return null
  return (
    <>
      {customers.map((c) => (
        <MapPin
          key={c.id}
          position={[c.y, c.x]}
          icon={icons.customer}
          highlighted={hoveredId === c.id}
          onSelect={() => {
            setSelection({ type: 'customer', id: c.id })
            setActiveTab('settings')
          }}
          onMove={(lat, lng) => updateCustomer(c.id, { x: lng, y: lat })}
          onRemove={() => removeCustomer(c.id)}
        />
      ))}
    </>
  )
}

function StationMarkers() {
  const visible = useEVRPStore((s) => s.stationsVisible)
  const stations = useEVRPStore((s) => s.problem.chargingStations)
  const setSelection = useEVRPStore((s) => s.setSelection)
  const setActiveTab = useEVRPStore((s) => s.setActiveTab)
  const updateStation = useEVRPStore((s) => s.updateStation)
  const removeStation = useEVRPStore((s) => s.removeStation)
  const hoveredId = useEVRPStore((s) => s.hoveredId)
  if (!visible) return null
  return (
    <>
      {stations.map((s) => (
        <MapPin
          key={s.id}
          position={[s.y, s.x]}
          icon={icons.station}
          highlighted={hoveredId === s.id}
          onSelect={() => {
            setSelection({ type: 'station', id: s.id })
            setActiveTab('settings')
          }}
          onMove={(lat, lng) => updateStation(s.id, { x: lng, y: lat })}
          onRemove={() => removeStation(s.id)}
        />
      ))}
    </>
  )
}

function RecenterButton() {
  const map = useMap()
  return (
    <MapControlButton onClick={() => map.setView(ZAGREB, DEFAULT_ZOOM)} title="Center on Zagreb">
      <LocateFixed size={16} />
    </MapControlButton>
  )
}

function ZoomToFitButton() {
  const map = useMap()
  const problem = useEVRPStore((s) => s.problem)

  function handleZoomToFit() {
    const points: [number, number][] = []
    const depot = problem.depot
    if (Math.abs(depot.x) >= 10 || Math.abs(depot.y) >= 10) points.push([depot.y, depot.x])
    for (const c of problem.customers) points.push([c.y, c.x])
    for (const s of problem.chargingStations) points.push([s.y, s.x])
    if (points.length === 0) return
    if (points.length === 1) {
      map.setView(points[0], 14)
      return
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] })
  }

  return (
    <MapControlButton
      onClick={handleZoomToFit}
      title="Zoom to fit all elements"
      style={{ marginTop: 40 }}
    >
      <Maximize2 size={16} />
    </MapControlButton>
  )
}

export default function MapView() {
  return (
    <MapContainer center={ZAGREB} zoom={DEFAULT_ZOOM} className="w-full h-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <KeyboardShortcuts />
      <MapClickHandler />
      <RouteLines />
      <DepotMarker />
      <CustomerMarkers />
      <StationMarkers />
      <RecenterButton />
      <ZoomToFitButton />
    </MapContainer>
  )
}
