import type { EVRPProblem } from './evrp-types'
import type { OptimizationTarget, VehicleMethod } from './evrp-store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface RouteLocation {
  id: string
  x: number
  y: number
}

export interface Route {
  locations: RouteLocation[]
  polylines: ([number, number][] | null)[] | null
}

export interface RoutingResult {
  routes: Route[]
}

async function callRoutingApi(
  problem: EVRPProblem,
  optimizationTarget: OptimizationTarget,
  vehicleMethod: VehicleMethod,
): Promise<RoutingResult> {
  const payload = { ...problem, optimizationTarget, vehicleMethod }

  const response = await fetch(`${API_BASE_URL}/api/evrp/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(payload),
  })

  if (response.status === 401) {
    throw new Error('Session expired — please sign in again')
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    const message = body?.error ?? body?.message ?? `${response.status} ${response.statusText}`
    throw new Error(message)
  }

  return response.json()
}

export async function calculateRoute(
  problem: EVRPProblem,
  optimizationTarget: OptimizationTarget,
  vehicleMethod: VehicleMethod,
): Promise<RoutingResult> {
  const result = await callRoutingApi(problem, optimizationTarget, vehicleMethod)
  console.log('Routing result:', result)
  return result
}
