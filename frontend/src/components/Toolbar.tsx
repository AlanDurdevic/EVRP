import { useEVRPStore } from '@/lib/evrp-store'
import { cn } from '@/lib/utils'
import { Download, Eraser, MapPin, MousePointer, SidebarIcon, Upload, Users, Zap } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { useSidebar } from './ui/sidebar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

export default function Toolbar() {
  const { placementMode, setPlacementMode, problem, exportProblem } = useEVRPStore()
  const { toggleSidebar, open } = useSidebar();

  const handleExport = () => {
    // const data = exportProblem()
    // const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    // const url = URL.createObjectURL(blob)
    // const a = document.createElement('a')
    // a.href = url
    // a.download = 'evrp-problem.json'
    // a.click()
    // URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    // const input = document.createElement('input')
    // input.type = 'file'
    // input.accept = '.json'
    // input.onchange = async (e) => {
    //   const file = (e.target as HTMLInputElement).files?.[0]
    //   if (!file) return
    //
    //   try {
    //     const text = await file.text()
    //     const data = JSON.parse(text)
    //     // TODO: Validate and load data
    //     console.log('Imported:', data)
    //   } catch {
    //     console.error('Failed to parse file')
    //   }
    // }
    // input.click()
  }

  return (
    <TooltipProvider delayDuration={0}>
      <header className="flex items-center h-(--header-height) w-full gap-1 px-4 border-b border-gray-200 pr-8">
        <ToolbarButton
          active={!open}
          onClick={toggleSidebar}
          tooltip={!open ? "Expand sidebar" : "Collapse sidebar"}
          className='text-black bg-white'
        >
          <SidebarIcon className="size-4" />
        </ToolbarButton>

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            active={placementMode === "select"}
            onClick={() => setPlacementMode('select')}
            tooltip='Select / Move'
          >
            <MousePointer className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            active={placementMode === "depot"}
            onClick={() => setPlacementMode('depot')}
            tooltip='Place Depot'
          >
            <MapPin className="size-4" />
          </ToolbarButton>


          <ToolbarButton

            active={placementMode === "customer"}
            onClick={() => setPlacementMode('customer')}
            tooltip='Add Customer'
          >

            <Users className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            active={placementMode === "station"}
            onClick={() => setPlacementMode('station')}
            tooltip='Add Charging Station'
          >
            <Zap className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            active={placementMode === "erase"}
            onClick={() => setPlacementMode('erase')}
            tooltip='Erase'
          >
            <Eraser className="size-4" />
          </ToolbarButton>
        </div>

        <div className="flex items-center mx-2">
          <Separator orientation="vertical" className="h-6" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton
            tooltip='Import problem'
            onClick={handleImport}
          >
            <Upload className="size-4" />
          </ToolbarButton>

          <ToolbarButton
            tooltip='Import problem'
            onClick={handleExport}
          >
            <Download className="size-4" />
          </ToolbarButton>

        </div>

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
      </header>
    </TooltipProvider>
  )
}


type ToolbarButtonProps = {
  children: ReactNode,
  tooltip: string,
  onClick: () => void,
  active?: boolean,
  className?: string
}

const ToolbarButton = ({
  children,
  tooltip,
  onClick,
  active,
  className,
}: ToolbarButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button variant={active ? "default" : "ghost"} size="icon-sm" onClick={onClick} className={
        cn("p-4", active && "bg-green-600", className)
      }>
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
)
