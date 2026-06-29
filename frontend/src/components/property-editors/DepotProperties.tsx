import { useEVRPStore } from '@/lib/evrp-store'
import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FieldRow } from '@/components/FieldRow'
import { NumericInput } from '@/components/NumericInput'

export function DepotProperties() {
  const { problem, setDepot } = useEVRPStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-depot">
        <MapPin className="size-4" />
        <span className="font-medium">Depot</span>
      </div>
      <div className="space-y-3">
        <FieldRow label="ID">
          <Input
            type="text"
            value={problem.depot.id}
            onChange={(e) => setDepot({ ...problem.depot, id: e.target.value })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="X Coordinate">
          <NumericInput
            step="0.0001"
            decimals={4}
            value={problem.depot.x}
            onChange={(x) => setDepot({ ...problem.depot, x })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Y Coordinate">
          <NumericInput
            step="0.0001"
            decimals={4}
            value={problem.depot.y}
            onChange={(y) => setDepot({ ...problem.depot, y })}
            className="h-8 text-sm"
          />
        </FieldRow>
      </div>
    </div>
  )
}
