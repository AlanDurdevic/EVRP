import { useEVRPStore } from '@/lib/evrp-store'
import { Settings } from 'lucide-react'
import { FieldRow } from './FieldRow'
import { NumericInput } from './NumericInput'

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
          <NumericInput
            step="1"
            min="0"
            value={props.vehicleFuelTankCapacity}
            onChange={(vehicleFuelTankCapacity) =>
              updateProblemProperties({ vehicleFuelTankCapacity })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Load Capacity">
          <NumericInput
            step="0.1"
            min="0"
            value={props.vehicleLoadCapacity}
            onChange={(vehicleLoadCapacity) => updateProblemProperties({ vehicleLoadCapacity })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Fuel Consumption">
          <NumericInput
            step="0.1"
            min="0"
            value={props.fuelConsumptionRate}
            onChange={(fuelConsumptionRate) => updateProblemProperties({ fuelConsumptionRate })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Refueling Rate">
          <NumericInput
            step="0.1"
            min="0"
            value={props.inverseRefuelingRate}
            onChange={(inverseRefuelingRate) => updateProblemProperties({ inverseRefuelingRate })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Avg Velocity">
          <NumericInput
            step="1"
            min="0"
            value={props.averageVelocity}
            onChange={(averageVelocity) => updateProblemProperties({ averageVelocity })}
            className="h-8 text-sm"
          />
        </FieldRow>
      </div>
    </div>
  )
}
