import type { Customer, ChargingStation, EVRPProblem } from './evrp-types'

export interface NormalizedPoint {
  id: string
  x: number
  y: number
}

export interface NormalizedProblem {
  depot: { x: 0; y: 0 }
  customers: NormalizedPoint[]
  chargingStations: NormalizedPoint[]
  properties: EVRPProblem['problemProperties']
}

export interface RoutingResult {
  raw: unknown
}

function normalizePoint(
  item: Customer | ChargingStation,
  originX: number,
  originY: number,
): NormalizedPoint {
  const x = item.x - originX
  const y = item.y - originY
  return { id: item.id, x, y }
}

function normalizeProblem(problem: EVRPProblem): NormalizedProblem {
  const { depot, customers, chargingStations, problemProperties } = problem
  return {
    depot: { x: 0, y: 0 },
    customers: customers.map((c) => normalizePoint(c, depot.x, depot.y)),
    chargingStations: chargingStations.map((s) => normalizePoint(s, depot.x, depot.y)),
    properties: problemProperties,
  }
}

const API_URL = '/api/route'

async function callRoutingApi(payload: NormalizedProblem): Promise<RoutingResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Routing API error: ${response.status} ${response.statusText}`)
  }

  return { raw: await response.json() }
}

export async function calculateRoute(problem: EVRPProblem) {
  const normalized = normalizeProblem(problem)
  console.log('Normalized problem sent to API:', normalized)
  // TODO: connect to backend
  // const result = await callRoutingApi(normalized)
  // console.log('Routing result:', result)
  // return result
}
