import { useState } from 'react'
import { Input } from '@/components/ui/input'

interface Props {
  value: number
  onChange: (value: number) => void
  step?: string
  min?: string
  className?: string
  decimals?: number
}

function fmt(value: number, decimals?: number) {
  return decimals !== undefined ? parseFloat(value.toFixed(decimals)).toString() : String(value)
}

export function NumericInput({ value, onChange, step, min, className, decimals }: Props) {
  const [local, setLocal] = useState(() => fmt(value, decimals))
  const [prevValue, setPrevValue] = useState(value)
  const [prevDecimals, setPrevDecimals] = useState(decimals)

  if (value !== prevValue || decimals !== prevDecimals) {
    setPrevValue(value)
    setPrevDecimals(decimals)
    setLocal(fmt(value, decimals))
  }

  return (
    <Input
      type="number"
      step={step}
      min={min}
      className={className}
      value={local}
      onChange={(e) => {
        const str = e.target.value
        setLocal(str)
        const num = parseFloat(str)
        if (!isNaN(num)) onChange(num)
      }}
      onBlur={() => {
        const num = parseFloat(local)
        if (local === '' || isNaN(num)) {
          setLocal('0')
          onChange(0)
        } else {
          setLocal(fmt(num, decimals))
          onChange(num)
        }
      }}
    />
  )
}
