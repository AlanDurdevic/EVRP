import { Polyline } from 'react-leaflet'
import { useEVRPStore } from '@/lib/evrp-store'

const ROUTE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e']

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
      {routingResult.routes.map((route, index) => {
        if (route.locations.every((loc) => loc.id === 'depot')) return null
        if (!(routeVisibility[index] ?? true)) return null

        const positions = route.locations
          .map((loc) => resolveCoords(loc.id))
          .filter((pos): pos is [number, number] => pos !== null)

        return (
          <Polyline
            key={index}
            positions={positions}
            pathOptions={{ color: ROUTE_COLORS[index % ROUTE_COLORS.length], weight: 3 }}
          />
        )
      })}
    </>
  )
}

export default RouteLines
