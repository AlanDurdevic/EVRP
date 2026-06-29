import { useEVRPStore } from '@/lib/evrp-store'
import { Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { FieldRow } from '../FieldRow'

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
          <Input
            type="number"
            step="0.0001"
            value={parseFloat(customer.x.toFixed(4))}
            onChange={(e) => updateCustomer(customer.id, { x: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Y Coordinate">
          <Input
            type="number"
            step="0.0001"
            value={parseFloat(customer.y.toFixed(4))}
            onChange={(e) => updateCustomer(customer.id, { y: parseFloat(e.target.value) || 0 })}
            className="h-8 text-sm"
          />
        </FieldRow>
        <Separator />
        <FieldRow label="Demand">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={customer.demand}
            onChange={(e) =>
              updateCustomer(customer.id, { demand: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Ready Time">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={customer.readyTime}
            onChange={(e) =>
              updateCustomer(customer.id, { readyTime: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Due Date">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={customer.dueDate}
            onChange={(e) =>
              updateCustomer(customer.id, { dueDate: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
        <FieldRow label="Service Time">
          <Input
            type="number"
            step="0.1"
            min="0"
            value={customer.serviceTime}
            onChange={(e) =>
              updateCustomer(customer.id, { serviceTime: parseFloat(e.target.value) || 0 })
            }
            className="h-8 text-sm"
          />
        </FieldRow>
      </div>
    </div>
  )
}
