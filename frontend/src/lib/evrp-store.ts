import { create } from 'zustand'
import type { EVRPProblem, Selection, PlacementMode, Customer, ChargingStation, Depot } from './evrp-types'

interface EVRPStore {
  problem: EVRPProblem
  selection: Selection
  placementMode: PlacementMode
  mapBounds: { minX: number; maxX: number; minY: number; maxY: number }

  // Actions
  setDepot: (depot: Depot) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  addStation: (station: ChargingStation) => void
  updateStation: (id: string, updates: Partial<ChargingStation>) => void
  removeStation: (id: string) => void
  updateProblemProperties: (props: Partial<EVRPProblem['problemProperties']>) => void
  setSelection: (selection: Selection) => void
  setPlacementMode: (mode: PlacementMode) => void
  clearSelection: () => void
  exportProblem: () => EVRPProblem
}

const initialProblem: EVRPProblem = {
  depot: { x: 5.0, y: 5.0, id: "depot" },
  problemProperties: {
    vehicleFuelTankCapacity: 50.0,
    vehicleLoadCapacity: 10.0,
    fuelConsumptionRate: 0.5,
    inverseRefuelingRate: 0.2,
    averageVelocity: 40.0,
  },
  customers: [],
  chargingStations: [],
}

export const useEVRPStore = create<EVRPStore>((set, get) => ({
  problem: initialProblem,
  selection: { type: null, id: null },
  placementMode: 'select',
  mapBounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },

  setDepot: (depot) =>
    set((state) => ({
      problem: { ...state.problem, depot },
    })),

  addCustomer: (customer) =>
    set((state) => ({
      problem: {
        ...state.problem,
        customers: [...state.problem.customers, customer],
      },
    })),

  updateCustomer: (id, updates) =>
    set((state) => ({
      problem: {
        ...state.problem,
        customers: state.problem.customers.map((c) =>
          c.id === id ? { ...c, ...updates } : c
        ),
      },
    })),

  removeCustomer: (id) =>
    set((state) => ({
      problem: {
        ...state.problem,
        customers: state.problem.customers.filter((c) => c.id !== id),
      },
      selection: state.selection.id === id ? { type: null, id: null } : state.selection,
    })),

  addStation: (station) =>
    set((state) => ({
      problem: {
        ...state.problem,
        chargingStations: [...state.problem.chargingStations, station],
      },
    })),

  updateStation: (id, updates) =>
    set((state) => ({
      problem: {
        ...state.problem,
        chargingStations: state.problem.chargingStations.map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    })),

  removeStation: (id) =>
    set((state) => ({
      problem: {
        ...state.problem,
        chargingStations: state.problem.chargingStations.filter((s) => s.id !== id),
      },
      selection: state.selection.id === id ? { type: null, id: null } : state.selection,
    })),

  updateProblemProperties: (props) =>
    set((state) => ({
      problem: {
        ...state.problem,
        problemProperties: { ...state.problem.problemProperties, ...props },
      },
    })),

  setSelection: (selection) => set({ selection }),

  setPlacementMode: (mode) => set({ placementMode: mode }),

  clearSelection: () => set({ selection: { type: null, id: null } }),

  exportProblem: () => get().problem,
}))

