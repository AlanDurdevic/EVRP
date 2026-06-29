import { useEVRPStore } from '@/lib/evrp-store'
import { Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { FieldRow } from '../FieldRow'
import { NumericInput } from '../NumericInput'

export function CustomerProperties() {
  const { problem, selection, updateCustomer, removeCustomer } = useEVRPStore()
  const customer = problem.customers.find((c) => c.id === selection.id)

  if (!customer) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-customer">
          <Users className="size-4" />
          <span className="font-medium">Customer {customer.id}</span>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => removeCustomer(customer.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      <div className="space-y-3">
        <FieldRow label="X Coordinate">
          <NumericInput
            step="0.0001"
            decimals={4}
            value={customer.x}
            onChange={(x) => updateCustomer(customer.id, { x })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Y Coordinate">
          <NumericInput
            step="0.0001"
            decimals={4}
            value={customer.y}
            onChange={(y) => updateCustomer(customer.id, { y })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <Separator />
        <FieldRow label="Demand">
          <NumericInput
            step="0.1"
            min="0"
            value={customer.demand}
            onChange={(demand) => updateCustomer(customer.id, { demand })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Ready Time">
          <NumericInput
            step="0.1"
            min="0"
            value={customer.readyTime}
            onChange={(readyTime) => updateCustomer(customer.id, { readyTime })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Due Date">
          <NumericInput
            step="0.1"
            min="0"
            value={customer.dueDate}
            onChange={(dueDate) => updateCustomer(customer.id, { dueDate })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Service Time">
          <NumericInput
            step="0.1"
            min="0"
            value={customer.serviceTime}
            onChange={(serviceTime) => updateCustomer(customer.id, { serviceTime })}
            className="h-8 text-sm"
          />
        </FieldRow>
      </div>
    </div>
  )
}
