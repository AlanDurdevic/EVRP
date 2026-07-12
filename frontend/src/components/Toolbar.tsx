import { useEVRPStore } from '@/lib/evrp-store'
import type { OptimizationTarget, VehicleMethod } from '@/lib/evrp-store'
import { logout } from '@/lib/auth-service'
import { calculateRoute } from '@/lib/routing-service'
import { cn } from '@/lib/utils'
import {
  Download,
  Eraser,
  Info,
  Loader2,
  LogOut,
  MapPin,
  Menu,
  MousePointer,
  Route,
  RotateCcw,
  SidebarIcon,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { ConfirmDialog } from './ConfirmDialog'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Separator } from './ui/separator'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet'
import { useSidebar } from './ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

const OPTIMIZATION_TARGETS: { value: OptimizationTarget; label: string }[] = [
  { value: 'energy', label: 'Min. Energy' },
  { value: 'tardiness', label: 'Min. Tardiness' },
  { value: 'vehicle', label: 'Min. Vehicles' },
]

const VEHICLE_METHODS: { value: VehicleMethod; label: string }[] = [
  { value: 'parallel', label: 'Parallel' },
  { value: 'parallelB', label: 'Parallel B' },
  { value: 'semiparallel', label: 'Semi-parallel' },
  { value: 'semiparallelB', label: 'Semi-parallel B' },
  { value: 'serial', label: 'Serial' },
]

const TARGET_INFO =
  'The objective the solver minimises: total energy consumed by all vehicles, total ' +
  'tardiness (sum of late arrivals), or total number of vehicles used.'

const METHOD_INFO =
  'The vehicle-selection heuristic used when building routes. Parallel and serial differ ' +
  'in how vehicles are assigned simultaneously vs. one at a time. The B variants use an ' +
  'alternative scoring function. Iteration variants run multiple passes to refine the solution.'

export default function Toolbar() {
  const {
    placementMode,
    setPlacementMode,
    problem,
    exportProblem,
    importProblem,
    resetProblem,
    setRoutingResult,
    optimizationTarget,
    vehicleMethod,
    setAuthenticated,
    toolbarMenuOpen: menuOpen,
    setToolbarMenuOpen: setMenuOpen,
  } = useEVRPStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const { toggleSidebar, open } = useSidebar()

  const headerRef = useRef<HTMLElement>(null)
  const [isWrapped, setIsWrapped] = useState(false)

  // A single toolbar row is 56px; anything taller means the items wrapped onto extra rows.
  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const observer = new ResizeObserver(() => setIsWrapped(el.offsetHeight > 64))
    observer.observe(el)

    return () => observer.disconnect()
  }, [])

  const handleExport = () => {
    const data = exportProblem()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'evrp-problem.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Problem exported', {
      description: `${data.customers.length} customers, ${data.chargingStations.length} stations saved to evrp-problem.json`,
    })
  }

  const handleCalculate = async () => {
    setIsCalculating(true)
    try {
      const result = await calculateRoute(problem, optimizationTarget, vehicleMethod)
      setRoutingResult(result)
      toast.success('Routes calculated', {
        description: `${result.routes.length} vehicle route${result.routes.length !== 1 ? 's' : ''} found.`,
      })
    } catch (err) {
      toast.error('Calculation failed', {
        description: err instanceof Error ? err.message : 'An unexpected error occurred.',
      })
    } finally {
      setIsCalculating(false)
    }
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        const text = await file.text()
        const parsed = JSON.parse(text)
        importProblem(parsed)
        toast.success('Problem imported', {
          description: `${parsed.customers.length} customers, ${parsed.chargingStations.length} stations loaded from ${file.name}`,
        })
      } catch {
        toast.error('Import failed', { description: 'The file is not a valid EVRP problem JSON.' })
      }
    }
    input.click()
  }

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
  }

  const legend = (
    <>
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-sm bg-depot" />
        <span>Depot</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-full bg-customer" />
        <span>Customers: {problem.customers.length}</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="size-3 rounded-full bg-station" />
        <span>Stations: {problem.chargingStations.length}</span>
      </div>
    </>
  )

  return (
    <TooltipProvider delayDuration={0}>
      <header
        ref={headerRef}
        className="flex flex-wrap items-center min-h-14 w-full gap-x-1 gap-y-2 px-4 py-2
          border-b border-gray-200 md:pr-8 relative z-20 bg-background [&>*]:shrink-0"
      >
        <div data-tutorial="sidebar-toggle">
          <ToolbarButton
            active={!open}
            onClick={toggleSidebar}
            tooltip={!open ? 'Expand sidebar' : 'Collapse sidebar'}
            className="text-black bg-white"
          >
            <SidebarIcon className="size-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1" data-tutorial="edit-tools">
          <ToolbarButton
            active={placementMode === 'select'}
            onClick={() => setPlacementMode('select')}
            tooltip="Select / Move"
          >
            <MousePointer className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            activeClassName="bg-depot"
            active={placementMode === 'depot'}
            onClick={() => setPlacementMode('depot')}
            tooltip="Place Depot"
          >
            <MapPin className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            activeClassName="bg-customer"
            active={placementMode === 'customer'}
            onClick={() => setPlacementMode('customer')}
            tooltip="Add Customer"
          >
            <Users className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            activeClassName="bg-station"
            active={placementMode === 'station'}
            onClick={() => setPlacementMode('station')}
            tooltip="Add Charging Station"
          >
            <Zap className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            activeClassName="bg-red-500"
            active={placementMode === 'erase'}
            onClick={() => setPlacementMode('erase')}
            tooltip="Erase"
          >
            <Eraser className="size-4" />
          </ToolbarButton>
        </div>

        <div className="hidden md:flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="hidden md:flex items-center gap-1">
          <ToolbarButton tooltip="Import problem" onClick={handleImport}>
            <Upload className="size-4" />
          </ToolbarButton>

          <ToolbarButton tooltip="Export problem" onClick={handleExport}>
            <Download className="size-4" />
          </ToolbarButton>
        </div>

        <div className="hidden md:flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="hidden md:flex items-center gap-4" data-tutorial="solver-options">
          <LabeledSelect label="Target" info={TARGET_INFO}>
            <TargetSelect className="w-36" />
          </LabeledSelect>

          <LabeledSelect label="Program type" info={METHOD_INFO}>
            <MethodSelect className="w-44" />
          </LabeledSelect>
        </div>

        <div className="hidden lg:block" data-tutorial="calculate">
          <ToolbarButton
            tooltip="Calculate best route"
            onClick={handleCalculate}
            disabled={isCalculating}
            className={cn(
              'w-auto px-3 gap-1.5 text-xs font-medium',
              'bg-violet-600 text-white border border-violet-700 shadow-sm',
              'hover:bg-violet-700 hover:text-white',
            )}
          >
            {isCalculating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Route className="size-4" />
            )}
            {isCalculating ? 'Calculating…' : 'Calculate routes'}
          </ToolbarButton>
        </div>

        <ToolbarButton
          tooltip="Reset problem"
          onClick={() => setConfirmReset(true)}
          className="hidden md:inline-flex"
        >
          <RotateCcw className="size-4" />
        </ToolbarButton>

        <div className={cn('hidden md:flex items-center mx-2', isWrapped && 'invisible')}>
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className={cn('hidden md:flex items-center gap-1', !isWrapped && 'ml-auto')}>
          <div className="hidden lg:flex items-center gap-4 text-xs text-muted-foreground mr-3">
            {legend}
          </div>

          <ToolbarButton tooltip="Sign out" onClick={handleLogout}>
            <LogOut className="size-4" />
          </ToolbarButton>
        </div>

        <div className="md:hidden ml-auto" data-tutorial="menu-button">
          <ToolbarButton tooltip="Menu" onClick={() => setMenuOpen(true)}>
            <Menu className="size-4" />
          </ToolbarButton>
        </div>
      </header>

      <div className="lg:hidden fixed bottom-8 right-6 z-[1200]" data-tutorial="calculate">
        <Button
          onClick={handleCalculate}
          disabled={isCalculating}
          className="h-10 rounded-lg px-4 gap-2 text-sm font-medium bg-violet-600 text-white
            border border-violet-700 shadow-lg hover:bg-violet-700"
        >
          {isCalculating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Route className="size-4" />
          )}
          {isCalculating ? 'Calculating…' : 'Calculate routes'}
        </Button>
      </div>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="right" className="w-80">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Solver options and problem actions
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 px-4 pb-4 overflow-y-auto">
            <div className="flex flex-col gap-3" data-tutorial="solver-options">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Target</span>
                <TargetSelect className="w-full" />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-muted-foreground">Program type</span>
                <MethodSelect className="w-full" />
              </div>
            </div>

            <Separator />

            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  setMenuOpen(false)
                  handleImport()
                }}
              >
                <Upload className="size-4" />
                Import problem
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={handleExport}
              >
                <Download className="size-4" />
                Export problem
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                onClick={() => {
                  setMenuOpen(false)
                  setConfirmReset(true)
                }}
              >
                <RotateCcw className="size-4" />
                Reset problem
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-2 text-xs text-muted-foreground">{legend}</div>

            <Separator />

            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        title="Reset problem"
        description="This will remove all elements and reset all settings. This cannot be undone."
        onConfirm={resetProblem}
      />
    </TooltipProvider>
  )
}

const TargetSelect = ({ className }: { className?: string }) => {
  const optimizationTarget = useEVRPStore((s) => s.optimizationTarget)
  const setOptimizationTarget = useEVRPStore((s) => s.setOptimizationTarget)

  return (
    <Select
      value={optimizationTarget}
      onValueChange={(v) => setOptimizationTarget(v as OptimizationTarget)}
    >
      <SelectTrigger className={cn('h-8 text-xs', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Target</SelectLabel>
          {OPTIMIZATION_TARGETS.map(({ value, label }) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

const MethodSelect = ({ className }: { className?: string }) => {
  const vehicleMethod = useEVRPStore((s) => s.vehicleMethod)
  const setVehicleMethod = useEVRPStore((s) => s.setVehicleMethod)

  return (
    <Select value={vehicleMethod} onValueChange={(v) => setVehicleMethod(v as VehicleMethod)}>
      <SelectTrigger className={cn('h-8 text-xs', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Program type</SelectLabel>
          {VEHICLE_METHODS.map(({ value, label }) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

type ToolbarButtonProps = {
  children: ReactNode
  tooltip: string
  onClick: () => void
  activeClassName?: string
  active?: boolean
  disabled?: boolean
  className?: string
}

type LabeledSelectProps = {
  label: string
  info: string
  children: ReactNode
}

const LabeledSelect = ({ label, info, children }: LabeledSelectProps) => (
  <div className="flex items-center gap-1.5">
    <span className="text-xs text-muted-foreground whitespace-nowrap">{label}</span>
    <Popover>
      <PopoverTrigger asChild>
        <button
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Info about ${label}`}
        >
          <Info className="size-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-64 text-xs">
        {info}
      </PopoverContent>
    </Popover>
    {children}
  </div>
)

const ToolbarButton = ({
  children,
  tooltip,
  onClick,
  active,
  disabled,
  className,
  activeClassName,
}: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant={active ? 'default' : 'ghost'}
        size="icon-sm"
        aria-label={tooltip}
        onClick={onClick}
        disabled={disabled}
        className={cn(
          'p-4',
          active && (activeClassName ? activeClassName : 'bg-green-500'),
          className,
        )}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
)
