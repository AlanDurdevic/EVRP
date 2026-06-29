import { Polyline } from 'react-leaflet'
import { useEVRPStore } from '@/lib/evrp-store'

const ROUTE_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#34495e',
]

function RouteLines() {
  const routingResult = useEVRPStore((s) => s.routingResult)
  const routeVisibility = useEVRPStore((s) => s.routeVisibility)
  const problem = useEVRPStore((s) => s.problem)

  if (!routingResult) return null

  function resolveCoords(id: string): [number, number] | null {
    if (id === 'depot') return [problem.depot.y, problem.depot.x]
    const customer = problem.customers.find((c) => c.id === id)
    if (customer) return [customer.y, customer.x]
    const station = problem.chargingStations.find((s) => s.id === id)
    if (station) return [station.y, station.x]
    return null
  }

  return (
    <>
      {routingResult.routes.flatMap((route, routeIndex) => {
        if (route.locations.every((loc) => loc.id === 'depot')) return []
        if (!(routeVisibility[routeIndex] ?? true)) return []

        const color = ROUTE_COLORS[routeIndex % ROUTE_COLORS.length]
        const pathOptions = { color, weight: 3 }

        if (route.polylines && route.polylines.length > 0) {
          return route.locations.slice(0, -1).map((loc, i) => {
            const segmentPolyline = route.polylines![i]

            const pts: [number, number][] =
              segmentPolyline && segmentPolyline.length > 0
                ? segmentPolyline
                : ([resolveCoords(loc.id), resolveCoords(route.locations[i + 1].id)].filter(
                    Boolean,
                  ) as [number, number][])

            return <Polyline key={`${routeIndex}-${i}`} positions={pts} pathOptions={pathOptions} />
          })
        }

        const positions = route.locations
          .map((loc) => resolveCoords(loc.id))
          .filter((pos): pos is [number, number] => pos !== null)

        return [<Polyline key={routeIndex} positions={positions} pathOptions={pathOptions} />]
      })}
    </>
  )
}

export default RouteLines
