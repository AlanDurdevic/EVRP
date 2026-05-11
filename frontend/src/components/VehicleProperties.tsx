import { useEVRPStore } from '@/lib/evrp-store'
import { Settings } from 'lucide-react'
import { FieldRow } from './FieldRow'
import { Input } from './ui/input'

export function VehicleProperties() {
  const { problem, updateProblemProperties } = useEVRPStore()
  const props = problem.problemProperties

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Settings className="size-4" />
        <span className="font-medium">Vehicle Configuration</span>
      </div>
      <div className="space-y-3">
        <FieldRow label="Fuel Tank Capacity">
          <Input
            type="number"
            step="1"
            min="0"
            value={props.vehicleFuelTankCapacity}
            onChange={(e) =>
              updateProblemProperties({ vehicleFuelTankCapacity: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Load Capacity">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={props.vehicleLoadCapacity}
            onChange={(e) =>
              updateProblemProperties({ vehicleLoadCapacity: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Fuel Consumption">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={props.fuelConsumptionRate}
            onChange={(e) =>
              updateProblemProperties({ fuelConsumptionRate: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Refueling Rate">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={props.inverseRefuelingRate}
            onChange={(e) =>
              updateProblemProperties({ inverseRefuelingRate: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Avg Velocity">
          <Input
            type="number"
            step="1"
            min="0"
            value={props.averageVelocity}
            onChange={(e) =>
              updateProblemProperties({ averageVelocity: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
      </div>
    </div>
  )
}
