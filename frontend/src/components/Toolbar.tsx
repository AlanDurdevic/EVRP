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
  MousePointer,
  Route,
  RotateCcw,
  SidebarIcon,
  Upload,
  Users,
  Zap,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useState } from 'react'
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
    setOptimizationTarget,
    setVehicleMethod,
    setAuthenticated,
  } = useEVRPStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [isCalculating, setIsCalculating] = useState(false)
  const { toggleSidebar, open } = useSidebar()

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

  return (
    <TooltipProvider delayDuration={0}>
      <header className="flex items-center h-(--header-height) w-full gap-1 px-4 border-b border-gray-200 pr-8">
        <ToolbarButton
          active={!open}
          onClick={toggleSidebar}
          tooltip={!open ? 'Expand sidebar' : 'Collapse sidebar'}
          className="text-black bg-white"
        >
          <SidebarIcon className="size-4" />
        </ToolbarButton>

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
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

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton tooltip="Import problem" onClick={handleImport}>
            <Upload className="size-4" />
          </ToolbarButton>

          <ToolbarButton tooltip="Export problem" onClick={handleExport}>
            <Download className="size-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-4">
          <LabeledSelect
            label="Target"
            info="The objective the solver minimises: total energy consumed by all vehicles, total tardiness (sum of late arrivals), or total number of vehicles used."
          >
            <Select
              value={optimizationTarget}
              onValueChange={(v) => setOptimizationTarget(v as OptimizationTarget)}
            >
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectGroup>
                <SelectContent>
                  <SelectLabel>Target</SelectLabel>
                  {OPTIMIZATION_TARGETS.map(({ value, label }) => (
                    <SelectItem key={value} value={value} className="text-xs">
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectGroup>
            </Select>
          </LabeledSelect>

          <LabeledSelect
            label="Program type"
            info="The vehicle-selection heuristic used when building routes. Parallel and serial differ in how vehicles are assigned simultaneously vs. one at a time. The B variants use an alternative scoring function. Iteration variants run multiple passes to refine the solution."
          >
            <Select
              value={vehicleMethod}
              onValueChange={(v) => setVehicleMethod(v as VehicleMethod)}
            >
              <SelectTrigger className="h-8 w-44 text-xs">
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
          </LabeledSelect>
        </div>

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

        <ToolbarButton tooltip="Reset problem" onClick={() => setConfirmReset(true)}>
          <RotateCcw className="size-4" />
        </ToolbarButton>

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
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
        </div>

        <ToolbarButton
          tooltip="Sign out"
          onClick={async () => {
            await logout()
            setAuthenticated(false)
          }}
        >
          <LogOut className="size-4" />
        </ToolbarButton>
      </header>

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
