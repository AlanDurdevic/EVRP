import { useState } from 'react'
import { useEVRPStore } from '@/lib/evrp-store'
import { Button } from './ui/button'
import { ConfirmDialog } from './ConfirmDialog'
import { cn } from '@/lib/utils'
import { ChevronRight, Eye, EyeOff, MapPin, Route, Trash2, Users, Zap } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'

const ROUTE_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#34495e',
]

export const ElementsList = () => {
  const {
    problem,
    selection,
    setSelection,
    setActiveTab,
    setHoveredId,
    setPlacementMode,
    clearCustomers,
    clearStations,
    removeDepot,
    customersVisible,
    stationsVisible,
    toggleCustomersVisible,
    toggleStationsVisible,
    routingResult,
    routeVisibility,
    toggleRouteVisible,
    customersOpen,
    stationsOpen,
    routesOpen,
    openRouteDetails,
    setCustomersOpen,
    setStationsOpen,
    setRoutesOpen,
    toggleRouteDetails,
  } = useEVRPStore()
  const [confirmClearCustomers, setConfirmClearCustomers] = useState(false)
  const [confirmClearStations, setConfirmClearStations] = useState(false)
  const [confirmRemoveDepot, setConfirmRemoveDepot] = useState(false)

  function locationType(id: string): 'depot' | 'customer' | 'station' {
    if (id === 'depot') return 'depot'
    if (problem.customers.some((c) => c.id === id)) return 'customer'
    return 'station'
  }

  function select(type: 'depot' | 'customer' | 'station', id: string | null) {
    setSelection({ type, id })
    setActiveTab('settings')
  }

  const depotPlaced = Math.abs(problem.depot.x) >= 10 || Math.abs(problem.depot.y) >= 10

  return (
    <div className="space-y-4 h-full">
      {/* Depot */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Depot
          </div>
          {depotPlaced && (
            <button
              onClick={() => setConfirmRemoveDepot(true)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
              title="Remove depot"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
        {depotPlaced ? (
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start gap-2 h-9 hover:bg-depot/20 hover:text-depot transition-colors duration-150',
              selection.type === 'depot' && 'bg-depot/20 text-depot',
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
      <Collapsible open={customersOpen} onOpenChange={setCustomersOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
            <ChevronRight
              className={cn(
                'size-3 transition-transform duration-150',
                customersOpen && 'rotate-90',
              )}
            />
            Customers ({problem.customers.length})
          </CollapsibleTrigger>
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleCustomersVisible}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={customersVisible ? 'Hide customers' : 'Show customers'}
            >
              {customersVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
            {problem.customers.length > 0 && (
              <button
                onClick={() => setConfirmClearCustomers(true)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Clear all customers"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
        <CollapsibleContent className="space-y-2 mt-2">
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
                  selection.type === 'customer' &&
                    selection.id === customer.id &&
                    'bg-customer/20 text-customer',
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
        </CollapsibleContent>
      </Collapsible>

      {/* Charging Stations */}
      <Collapsible open={stationsOpen} onOpenChange={setStationsOpen}>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
            <ChevronRight
              className={cn(
                'size-3 transition-transform duration-150',
                stationsOpen && 'rotate-90',
              )}
            />
            Charging Stations ({problem.chargingStations.length})
          </CollapsibleTrigger>
          <div className="flex items-center gap-0.5">
            <button
              onClick={toggleStationsVisible}
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title={stationsVisible ? 'Hide charging stations' : 'Show charging stations'}
            >
              {stationsVisible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
            </button>
            {problem.chargingStations.length > 0 && (
              <button
                onClick={() => setConfirmClearStations(true)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                title="Clear all stations"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        </div>
        <CollapsibleContent className="space-y-2 mt-2">
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
                  selection.type === 'station' &&
                    selection.id === station.id &&
                    'bg-station/20 text-station',
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
        </CollapsibleContent>
      </Collapsible>

      {/* Routes */}
      {routingResult &&
        routingResult.routes.some((r) => !r.locations.every((loc) => loc.id === 'depot')) && (
          <Collapsible open={routesOpen} onOpenChange={setRoutesOpen}>
            <div className="flex items-center justify-between">
              <CollapsibleTrigger className="flex items-center gap-1 text-xs font-medium text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors cursor-pointer">
                <ChevronRight
                  className={cn(
                    'size-3 transition-transform duration-150',
                    routesOpen && 'rotate-90',
                  )}
                />
                Routes ({routingResult.routes.length})
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent className="space-y-1 mt-2">
              {routingResult.routes.map((route, index) => {
                if (route.locations.every((loc) => loc.id === 'depot')) return null
                const color = ROUTE_COLORS[index % ROUTE_COLORS.length]
                const visible = routeVisibility[index] ?? true
                const stopCount = route.locations.length
                const isOpen = !!openRouteDetails[index]

                return (
                  <Collapsible
                    key={index}
                    open={isOpen}
                    onOpenChange={() => toggleRouteDetails(index)}
                  >
                    <div className="flex items-center gap-2 min-h-9 py-1 px-2 rounded-md hover:bg-accent transition-colors duration-150">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <Route className="size-4 text-muted-foreground shrink-0" />
                      <CollapsibleTrigger className="flex items-center gap-1 flex-1 min-w-0 text-left cursor-pointer">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm leading-tight">Route {index + 1}</span>
                          <span className="text-xs text-muted-foreground leading-tight">
                            {stopCount} stop{stopCount !== 1 ? 's' : ''} ·{' '}
                            {(route.totalDistanceMeters / 1000).toFixed(2)} km
                          </span>
                        </div>
                        <ChevronRight
                          className={cn(
                            'size-3 text-muted-foreground shrink-0 transition-transform duration-150',
                            isOpen && 'rotate-90',
                          )}
                        />
                      </CollapsibleTrigger>
                      <button
                        onClick={() => toggleRouteVisible(index)}
                        className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                        title={visible ? 'Hide route' : 'Show route'}
                      >
                        {visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                      </button>
                    </div>
                    <CollapsibleContent className="ml-7 mt-1 mb-1 space-y-0.5">
                      {route.locations.map((loc, i) => {
                        const type = locationType(loc.id)
                        const Icon = type === 'depot' ? MapPin : type === 'customer' ? Users : Zap
                        const hoverClass =
                          type === 'depot'
                            ? 'hover:bg-depot/20 hover:text-depot'
                            : type === 'customer'
                              ? 'hover:bg-customer/20 hover:text-customer'
                              : 'hover:bg-station/20 hover:text-station'
                        const activeClass =
                          selection.id === loc.id
                            ? type === 'depot'
                              ? 'bg-depot/20 text-depot'
                              : type === 'customer'
                                ? 'bg-customer/20 text-customer'
                                : 'bg-station/20 text-station'
                            : ''
                        return (
                          <Button
                            key={i}
                            variant="ghost"
                            className={cn(
                              'w-full justify-start gap-2 h-8 transition-colors duration-150',
                              hoverClass,
                              activeClass,
                            )}
                            onClick={() => select(type, loc.id)}
                            onMouseEnter={() => setHoveredId(loc.id)}
                            onMouseLeave={() => setHoveredId(null)}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span>{loc.id}</span>
                          </Button>
                        )
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                )
              })}
            </CollapsibleContent>
          </Collapsible>
        )}

      <ConfirmDialog
        open={confirmRemoveDepot}
        onOpenChange={setConfirmRemoveDepot}
        title="Remove depot"
        description="This will remove the depot from the map. This cannot be undone."
        onConfirm={removeDepot}
      />
      <ConfirmDialog
        open={confirmClearCustomers}
        onOpenChange={setConfirmClearCustomers}
        title="Clear all customers"
        description={`This will permanently remove all ${problem.customers.length} customer${problem.customers.length !== 1 ? 's' : ''}. This cannot be undone.`}
        onConfirm={clearCustomers}
      />
      <ConfirmDialog
        open={confirmClearStations}
        onOpenChange={setConfirmClearStations}
        title="Clear all charging stations"
        description={`This will permanently remove all ${problem.chargingStations.length} charging station${problem.chargingStations.length !== 1 ? 's' : ''}. This cannot be undone.`}
        onConfirm={clearStations}
      />
    </div>
  )
}
