import { Trash2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldRow } from '@/components/FieldRow'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useEVRPStore } from '@/lib/evrp-store'

export function StationProperties() {
  const { problem, selection, updateStation, removeStation } = useEVRPStore()
  const station = problem.chargingStations.find((s) => s.id === selection.id)

  if (!station) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-station">
          <Zap className="size-4" />
          <span className="font-medium">Station {station.id}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => removeStation(station.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <FieldRow label="X Coordinate">
          <Input
            type="number"
            step="0.0001"
            value={parseFloat(station.x.toFixed(4))}
            onChange={(e) => updateStation(station.id, { x: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Y Coordinate">
          <Input
            type="number"
            step="0.0001"
            value={parseFloat(station.y.toFixed(4))}
            onChange={(e) => updateStation(station.id, { y: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <Separator />
        <FieldRow label="Due Date">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={station.dueDate}
            onChange={(e) =>
              updateStation(station.id, { dueDate: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
      </div>
    </div>
  )
}
