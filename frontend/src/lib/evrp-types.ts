export interface Depot {
  id: string,
  x: number
  y: number
}

export interface Customer {
  id: string
  x: number
  y: number
  demand: number
  readyTime: number
  dueDate: number
  serviceTime: number
}

export interface ChargingStation {
  id: string
  x: number
  y: number
  dueDate: number
}

export interface ProblemProperties {
  vehicleFuelTankCapacity: number
  vehicleLoadCapacity: number
  fuelConsumptionRate: number
  inverseRefuelingRate: number
  averageVelocity: number
}

export interface EVRPProblem {
  depot: Depot
  problemProperties: ProblemProperties
  customers: Customer[]
  chargingStations: ChargingStation[]
}

export type SelectionType = 'depot' | 'customer' | 'station' | null
export type PlacementMode = 'select' | 'depot' | 'customer' | 'station' | 'erase'

export interface Selection {
  type: SelectionType
  id: string | null
}

