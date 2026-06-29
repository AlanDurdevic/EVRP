import { create } from 'zustand'
import type {
  EVRPProblem,
  Selection,
  PlacementMode,
  Customer,
  ChargingStation,
  Depot,
} from './evrp-types'
import type { RoutingResult } from './routing-service'

export type SidebarTab = 'elements' | 'settings' | 'vehicles'
export type OptimizationTarget = 'energy' | 'tardiness' | 'vehicle'
export type VehicleMethod = 'parallel' | 'parallelB' | 'semiparallel' | 'semiparallelB' | 'serial'

interface EVRPStore {
  // --- Auth ---
  isAuthenticated: boolean
  isCheckingAuth: boolean
  setAuthenticated: (v: boolean) => void
  setCheckingAuth: (v: boolean) => void

  // --- Problem ---
  problem: EVRPProblem
  customerCounter: number
  stationCounter: number

  nextCustomerId: () => string
  nextStationId: () => string
  setDepot: (depot: Depot) => void
  removeDepot: () => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (id: string, updates: Partial<Customer>) => void
  removeCustomer: (id: string) => void
  clearCustomers: () => void
  addStation: (station: ChargingStation) => void
  updateStation: (id: string, updates: Partial<ChargingStation>) => void
  removeStation: (id: string) => void
  clearStations: () => void
  updateProblemProperties: (props: Partial<EVRPProblem['problemProperties']>) => void
  exportProblem: () => EVRPProblem
  importProblem: (problem: EVRPProblem) => void
  resetProblem: () => void

  // --- UI ---
  selection: Selection
  placementMode: PlacementMode
  activeTab: SidebarTab
  hoveredId: string | null
  mapBounds: { minX: number; maxX: number; minY: number; maxY: number }
  customersVisible: boolean
  stationsVisible: boolean

  setSelection: (selection: Selection) => void
  clearSelection: () => void
  setPlacementMode: (mode: PlacementMode) => void
  setActiveTab: (tab: SidebarTab) => void
  setHoveredId: (id: string | null) => void
  toggleCustomersVisible: () => void
  toggleStationsVisible: () => void

  // --- Routing ---
  optimizationTarget: OptimizationTarget
  vehicleMethod: VehicleMethod
  routingResult: RoutingResult | null
  routeVisibility: Record<number, boolean>

  setOptimizationTarget: (target: OptimizationTarget) => void
  setVehicleMethod: (method: VehicleMethod) => void
  setRoutingResult: (result: RoutingResult | null) => void
  toggleRouteVisible: (index: number) => void
}

const initialProblem: EVRPProblem = {
  depot: { x: 0, y: 0, id: 'depot' },
  problemProperties: {
    vehicleFuelTankCapacity: 15000,
    vehicleLoadCapacity: 10,
    fuelConsumptionRate: 1,
    inverseRefuelingRate: 0.0001,
    averageVelocity: 60,
  },
  customers: [],
  chargingStations: [],
}

export const useEVRPStore = create<EVRPStore>((set, get) => ({
  // --- Auth ---
  isAuthenticated: false,
  isCheckingAuth: true,
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setCheckingAuth: (v) => set({ isCheckingAuth: v }),

  // --- Problem ---
  problem: initialProblem,
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

  setDepot: (depot) => set((state) => ({ problem: { ...state.problem, depot } })),

  removeDepot: () =>
    set((state) => ({
      problem: { ...state.problem, depot: { id: 'depot', x: 0, y: 0 } },
      selection: state.selection.type === 'depot' ? { type: null, id: null } : state.selection,
    })),

  addCustomer: (customer) =>
    set((state) => ({
      problem: { ...state.problem, customers: [...state.problem.customers, customer] },
    })),

  updateCustomer: (id, updates) =>
    set((state) => ({
      problem: {
        ...state.problem,
        customers: state.problem.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
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
          s.id === id ? { ...s, ...updates } : s,
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

  clearStations: () =>
    set((state) => ({
      problem: { ...state.problem, chargingStations: [] },
      selection: state.selection.type === 'station' ? { type: null, id: null } : state.selection,
    })),

  updateProblemProperties: (props) =>
    set((state) => ({
      problem: {
        ...state.problem,
        problemProperties: { ...state.problem.problemProperties, ...props },
      },
    })),

  exportProblem: () => get().problem,

  importProblem: (problem) =>
    set({
      problem,
      selection: { type: null, id: null },
      placementMode: 'select',
      customerCounter: problem.customers.length,
      stationCounter: problem.chargingStations.length,
      routingResult: null,
      routeVisibility: {},
    }),

  resetProblem: () =>
    set({
      problem: initialProblem,
      selection: { type: null, id: null },
      placementMode: 'select',
      customerCounter: 0,
      stationCounter: 0,
      routingResult: null,
      routeVisibility: {},
    }),

  // --- UI ---
  selection: { type: null, id: null },
  placementMode: 'select',
  activeTab: 'elements',
  hoveredId: null as string | null,
  mapBounds: { minX: 0, maxX: 10, minY: 0, maxY: 10 },
  customersVisible: true,
  stationsVisible: true,

  setSelection: (selection) => set({ selection }),
  clearSelection: () => set({ selection: { type: null, id: null } }),
  setPlacementMode: (mode) => set({ placementMode: mode }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setHoveredId: (id) => set({ hoveredId: id }),
  toggleCustomersVisible: () => set((s) => ({ customersVisible: !s.customersVisible })),
  toggleStationsVisible: () => set((s) => ({ stationsVisible: !s.stationsVisible })),

  // --- Routing ---
  optimizationTarget: 'energy' as OptimizationTarget,
  vehicleMethod: 'parallel' as VehicleMethod,
  routingResult: null,
  routeVisibility: {},

  setOptimizationTarget: (target) => set({ optimizationTarget: target }),
  setVehicleMethod: (method) => set({ vehicleMethod: method }),
  setRoutingResult: (result) => set({ routingResult: result, routeVisibility: {} }),
  toggleRouteVisible: (index) =>
    set((s) => ({
      routeVisibility: { ...s.routeVisibility, [index]: !(s.routeVisibility[index] ?? true) },
    })),
}))
