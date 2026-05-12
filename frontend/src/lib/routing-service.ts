import type { Customer, ChargingStation, EVRPProblem } from './evrp-types'
import type { OptimizationTarget, VehicleMethod } from './evrp-store'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface NormalizedCustomer extends Omit<Customer, 'x' | 'y'> {
  x: number
  y: number
}
interface NormalizedStation extends Omit<ChargingStation, 'x' | 'y'> {
  x: number
  y: number
}

interface NormalizedProblem {
  depot: { x: 0; y: 0 }
  problemProperties: EVRPProblem['problemProperties']
  customers: NormalizedCustomer[]
  chargingStations: NormalizedStation[]
  optimizationTarget: OptimizationTarget
  vehicleMethod: VehicleMethod
}

interface RouteLocation {
  id: string
  x: number
  y: number
}

export interface Route {
  locations: RouteLocation[]
}

export interface RoutingResult {
  routes: Route[]
}

function translateCoords<T extends { x: number; y: number }>(
  item: T,
  originX: number,
  originY: number,
): T {
  return { ...item, x: item.x - originX, y: item.y - originY }
}

function normalizeProblem(
  problem: EVRPProblem,
  optimizationTarget: OptimizationTarget,
  vehicleMethod: VehicleMethod,
): NormalizedProblem {
  const { depot, customers, chargingStations, problemProperties } = problem
  return {
    depot: { x: 0, y: 0 },
    problemProperties,
    customers: customers.map((c) => translateCoords(c, depot.x, depot.y)),
    chargingStations: chargingStations.map((s) => translateCoords(s, depot.x, depot.y)),
    optimizationTarget,
    vehicleMethod,
  }
}

async function callRoutingApi(payload: NormalizedProblem): Promise<RoutingResult> {
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
    const message = body?.message ?? `${response.status} ${response.statusText}`
    throw new Error(message)
  }

  return response.json()
}

export async function calculateRoute(
  problem: EVRPProblem,
  optimizationTarget: OptimizationTarget,
  vehicleMethod: VehicleMethod,
): Promise<RoutingResult> {
  const normalized = normalizeProblem(problem, optimizationTarget, vehicleMethod)
  const result = await callRoutingApi(normalized)
  console.log('Routing result:', result)
  return result
}
