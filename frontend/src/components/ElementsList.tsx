import { useEVRPStore } from "@/lib/evrp-store"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { MapPin, Users, Zap } from "lucide-react"

export const ElementsList = () => {
  const { problem, selection, setSelection } = useEVRPStore()

  return (
    <div className="space-y-4 h-full">
      {/* Depot */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Depot
        </div>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 h-9 hover:bg-green-300/50 hover:text-green-800 transition-colors duration-150',
            selection.type === 'depot' && 'bg-green-300/30 text-green-600'
          )}
          onClick={() => setSelection({ type: selection.type === 'depot' ? null : 'depot', id: null })}
        >
          <MapPin className="size-4" />
          <span>Depot</span>
          <span className="ml-auto text-xs text-muted-foreground">
            ({problem.depot.x.toFixed(1)}, {problem.depot.y.toFixed(1)})
          </span>
        </Button>
      </div>

      {/* Customers */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Customers ({problem.customers.length})
        </div>
        {problem.customers.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2">No customers added</p>
        ) : (
          problem.customers.map((customer) => (
            <Button
              key={customer.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-9',
                selection.type === 'customer' && selection.id === customer.id && 'bg-customer/20 text-customer'
              )}
              onClick={() => setSelection({ type: 'customer', id: customer.id })}
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
          <p className="text-xs text-muted-foreground px-2">No stations added</p>
        ) : (
          problem.chargingStations.map((station) => (
            <Button
              key={station.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2 h-9',
                selection.type === 'station' && selection.id === station.id && 'bg-station/20 text-station'
              )}
              onClick={() => setSelection({ type: 'station', id: station.id })}
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
