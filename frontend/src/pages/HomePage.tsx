import { useEffect, useRef, useSyncExternalStore } from 'react'
import MapView from '@/components/MapView'
import AppSidebar from '@/components/Sidebar'
import Toolbar from '@/components/Toolbar'
import { Tutorial } from '@/components/Tutorial'
import { KeyboardShortcutsDialog } from '@/components/KeyboardShortcutsDialog'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { Toaster } from '@/components/ui/sonner'

const DESKTOP_QUERY = '(min-width: 1024px)'

function useIsDesktop() {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(DESKTOP_QUERY)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(DESKTOP_QUERY).matches,
  )
}

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()

  // The toolbar wraps onto multiple rows on narrow screens, so its height is dynamic.
  // Keep --header-height in sync with the real height; the sidebar and map size off it.
  useEffect(() => {
    const root = rootRef.current
    const header = root?.querySelector('header')
    if (!root || !header) return

    const observer = new ResizeObserver(() => {
      root.style.setProperty('--header-height', `${header.offsetHeight}px`)
    })
    observer.observe(header)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={rootRef}
      className="[--header-height:calc(--spacing(14))] h-svh flex flex-col overflow-hidden"
    >
      <SidebarProvider className="flex flex-col flex-1 min-h-0">
        <Toolbar />
        <div className="flex flex-1 min-h-0">
          <AppSidebar />
          <SidebarInset>
            <div className="flex-1 flex overflow-hidden">
              <MapView />
            </div>
          </SidebarInset>
        </div>
        <Tutorial />
      </SidebarProvider>
      <KeyboardShortcutsDialog />
      {/* Below lg the floating calculate button occupies the bottom-right corner */}
      <Toaster
        richColors
        position={isDesktop ? 'bottom-right' : 'bottom-center'}
        swipeDirections={['left', 'right', 'bottom']}
        closeButton
      />
    </div>
  )
}
