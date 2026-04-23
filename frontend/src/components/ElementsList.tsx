import { useEVRPStore } from "@/lib/evrp-store"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { MapPin, Users, Zap } from "lucide-react"

export const ElementsList = () => {
  const { problem, selection, setSelection, setActiveTab, setHoveredId, setPlacementMode } = useEVRPStore()

  function select(type: 'depot' | 'customer' | 'station', id: string | null) {
    setSelection({ type, id })
    setActiveTab('settings')
  }

  const depotPlaced = Math.abs(problem.depot.x) >= 10 || Math.abs(problem.depot.y) >= 10

  return (
    <div className="space-y-4 h-full">
      {/* Depot */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Depot
        </div>
        {depotPlaced ? (
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2 h-9 hover:bg-depot/20 hover:text-depot transition-colors duration-150',
              selection.type === 'depot' && 'bg-depot/20 text-depot'
            )}
            onClick={() => select('depot', 'depot')}
            onMouseEnter={() => setHoveredId('depot')}
            onMouseLeave={() => setHoveredId(null)}
          >
            <MapPin className="size-4" />
            <span>Depot</span>
            <span className="ml-auto text-xs text-muted-foreground">
              ({problem.depot.x.toFixed(1)}, {problem.depot.y.toFixed(1)})
            </span>
          </Button>
        ) : (
          <button
            className="text-xs text-muted-foreground px-2 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setPlacementMode('depot')}
          >
            Click to add a depot
          </button>
        )}
      </div>

      {/* Customers */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Customers ({problem.customers.length})
        </div>
        {problem.customers.length === 0 ? (
          <button
            className="text-xs text-muted-foreground px-2 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setPlacementMode('customer')}
          >
            Click to add a customer
          </button>
        ) : (
          problem.customers.map((customer) => (
            <Button
              key={customer.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-9 hover:bg-customer/20 hover:text-customer transition-colors duration-150',
                selection.type === 'customer' && selection.id === customer.id && 'bg-customer/20 text-customer'
              )}
              onClick={() => select('customer', customer.id)}
              onMouseEnter={() => setHoveredId(customer.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Users className="size-4" />
              <span>{customer.id}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                ({customer.x.toFixed(1)}, {customer.y.toFixed(1)})
              </span>
            </Button>
          ))
        )}
      </div>

      {/* Charging Stations */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Charging Stations ({problem.chargingStations.length})
        </div>
        {problem.chargingStations.length === 0 ? (
          <button
            className="text-xs text-muted-foreground px-2 hover:text-foreground transition-colors cursor-pointer"
            onClick={() => setPlacementMode('station')}
          >
            Click to add a charging station
          </button>
        ) : (
          problem.chargingStations.map((station) => (
            <Button
              key={station.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-9 hover:bg-station/20 hover:text-station transition-colors duration-150',
                selection.type === 'station' && selection.id === station.id && 'bg-station/20 text-station'
              )}
              onClick={() => select('station', station.id)}
              onMouseEnter={() => setHoveredId(station.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <Zap className="size-4" />
              <span>{station.id}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                ({station.x.toFixed(1)}, {station.y.toFixed(1)})
              </span>
            </Button>
          ))
        )}
      </div>
    </div>
  )
}
