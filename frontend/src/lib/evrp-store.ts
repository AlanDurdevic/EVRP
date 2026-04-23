import { create } from 'zustand'
import type { EVRPProblem, Selection, PlacementMode, Customer, ChargingStation, Depot } from './evrp-types'

export type SidebarTab = 'elements' | 'settings' | 'vehicles'

interface EVRPStore {
  problem: EVRPProblem
  selection: Selection
  placementMode: PlacementMode
  activeTab: SidebarTab
  hoveredId: string | null
  mapBounds: { minX: number; maxX: number; minY: number; maxY: number }
  customerCounter: number
  stationCounter: number

  // Actions
  nextCustomerId: () => string
  nextStationId: () => string
  setDepot: (depot: Depot) => void
  setActiveTab: (tab: SidebarTab) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  clearCustomers: () => void
  addStation: (station: ChargingStation) => void
  updateStation: (id: string, updates: Partial<ChargingStation>) => void
  removeStation: (id: string) => void
  clearStations: () => void
  removeDepot: () => void
  updateProblemProperties: (props: Partial<EVRPProblem['problemProperties']>) => void
  setSelection: (selection: Selection) => void
  setPlacementMode: (mode: PlacementMode) => void
  setHoveredId: (id: string | null) => void
  clearSelection: () => void
  exportProblem: () => EVRPProblem
}

const initialProblem: EVRPProblem = {
  depot: { x: 0, y: 0, id: "depot" },
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
  activeTab: 'elements',
  hoveredId: null as string | null,
  mapBounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
  customerCounter: 0,
  stationCounter: 0,

  nextCustomerId: () => {
    const n = get().customerCounter + 1
    set({ customerCounter: n })
    return `customer-${n}`
  },
  nextStationId: () => {
    const n = get().stationCounter + 1
    set({ stationCounter: n })
    return `station-${n}`
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setHoveredId: (id) => set({ hoveredId: id }),

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

  clearCustomers: () =>
    set((state) => ({
      problem: { ...state.problem, customers: [] },
      selection: state.selection.type === 'customer' ? { type: null, id: null } : state.selection,
    })),

  clearStations: () =>
    set((state) => ({
      problem: { ...state.problem, chargingStations: [] },
      selection: state.selection.type === 'station' ? { type: null, id: null } : state.selection,
    })),

  removeDepot: () =>
    set((state) => ({
      problem: { ...state.problem, depot: { id: 'depot', x: 0, y: 0 } },
      selection: state.selection.type === 'depot' ? { type: null, id: null } : state.selection,
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

