import L from 'leaflet'
import { useEffect, useRef } from 'react'
import type { CSSProperties, ReactNode } from 'react'

interface MapControlButtonProps {
  onClick: () => void
  title: string
  style?: CSSProperties
  children: ReactNode
}

export function MapControlButton({ onClick, title, style, children }: MapControlButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) L.DomEvent.disableClickPropagation(ref.current)
  }, [])
  return (
    <div ref={ref} className="leaflet-top leaflet-right" style={style}>
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={onClick}
          title={title}
          className="flex size-[30px] items-center justify-center bg-white cursor-pointer"
        >
          {children}
        </button>
      </div>
    </div>
  )
}
