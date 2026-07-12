import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEVRPStore } from '@/lib/evrp-store'
import { useIsMobile } from '@/hooks/use-mobile'
import { Button } from './ui/button'
import { useSidebar } from './ui/sidebar'

const TUTORIAL_DONE_KEY = 'evrp-tutorial-done'
const SPOTLIGHT_PADDING = 8
const CARD_WIDTH = 320

type Placement = 'bottom' | 'right' | 'top' | 'screen-bottom'

type Step = {
  selector: string
  title: string
  body: string
  placement: Placement
  enter?: () => void
}

type Rect = { top: number; left: number; width: number; height: number }

export function Tutorial() {
  const [step, setStep] = useState<number | null>(() =>
    localStorage.getItem(TUTORIAL_DONE_KEY) ? null : 0,
  )
  const [rect, setRect] = useState<Rect | null>(null)

  const isMobile = useIsMobile()
  const { setOpen, setOpenMobile } = useSidebar()
  const setActiveTab = useEVRPStore((s) => s.setActiveTab)
  const setToolbarMenuOpen = useEVRPStore((s) => s.setToolbarMenuOpen)

  const steps = useMemo<Step[]>(() => {
    const openSidebar = (v: boolean) => (isMobile ? setOpenMobile(v) : setOpen(v))

    const closeAll = () => {
      setToolbarMenuOpen(false)
      if (isMobile) setOpenMobile(false)
    }

    const list: Step[] = [
      {
        selector: '[data-tutorial="edit-tools"]',
        title: 'Build your problem',
        body:
          'Use these tools to place the depot, customers and charging stations on the map. ' +
          'Pick a tool, then click anywhere on the map. The eraser removes elements.',
        placement: 'bottom',
        enter: closeAll,
      },
    ]

    if (isMobile) {
      list.push({
        selector: '[data-tutorial="sidebar-toggle"]',
        title: 'Open the sidebar',
        body: 'Tap this button any time to open the sidebar with all your elements.',
        placement: 'bottom',
        enter: closeAll,
      })
    }

    list.push({
      selector: '[data-slot="sidebar-container"], [data-slot="sidebar"][data-mobile="true"]',
      title: 'Inspect your elements',
      body:
        'Everything you place shows up here. Click an element to edit its properties in the ' +
        'Settings tab, and configure your fleet in the Vehicles tab.',
      placement: isMobile ? 'screen-bottom' : 'right',
      enter: () => {
        setToolbarMenuOpen(false)
        openSidebar(true)
        setActiveTab('elements')
      },
    })

    if (isMobile) {
      list.push({
        selector: '[data-tutorial="menu-button"]',
        title: 'More options',
        body: 'Tap this button to open the menu with solver settings and problem actions.',
        placement: 'bottom',
        enter: closeAll,
      })
    }

    list.push({
      selector: '[data-tutorial="solver-options"]',
      title: 'Pick a goal and scheme',
      body:
        'Choose what the solver should minimise — energy, tardiness or vehicle count — and ' +
        'which vehicle-assignment scheme it uses to build the routes.',
      placement: isMobile ? 'screen-bottom' : 'bottom',
      enter: () => {
        if (isMobile) {
          setOpenMobile(false)
          setToolbarMenuOpen(true)
        }
      },
    })

    list.push({
      selector: '[data-tutorial="calculate"]',
      title: 'Calculate routes',
      body:
        'When your problem is ready, hit this button. The solver computes optimised routes ' +
        'and draws them on the map.',
      placement: 'bottom',
      enter: closeAll,
    })

    return list
  }, [isMobile, setOpen, setOpenMobile, setActiveTab, setToolbarMenuOpen])

  const finish = useCallback(() => {
    setToolbarMenuOpen(false)
    localStorage.setItem(TUTORIAL_DONE_KEY, '1')
    setStep(null)
  }, [setToolbarMenuOpen])

  const targetFound = useRef(false)

  useLayoutEffect(() => {
    if (step === null) return

    targetFound.current = false
    steps[step].enter?.()

    // Targets can live inside sheets that mount and animate open — retry the measurement
    // until the element exists and is visible
    const measure = () => {
      const rects = Array.from(document.querySelectorAll(steps[step].selector)).map((el) =>
        el.getBoundingClientRect(),
      )
      const r = rects.find((rect) => rect.width >= 1 && rect.height >= 1)
      if (!r) return

      targetFound.current = true
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    const frame = requestAnimationFrame(measure)
    const timers = [150, 350, 700].map((ms) => setTimeout(measure, ms))

    // If the target never appeared, the step does not apply here — move on
    const skipTimer = setTimeout(() => {
      if (targetFound.current) return
      if (step + 1 >= steps.length) finish()
      else setStep(step + 1)
    }, 900)

    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(frame)
      timers.forEach(clearTimeout)
      clearTimeout(skipTimer)
      window.removeEventListener('resize', measure)
    }
  }, [step, steps, finish])

  if (step === null || rect === null) return null

  const isLast = step === steps.length - 1
  const { title, body } = steps[step]

  const spotlight = {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  }

  // Targets in the lower half of the screen (e.g. the floating calculate button) get the
  // card above them regardless of the step's configured placement
  const placement: Placement =
    steps[step].placement !== 'screen-bottom' && rect.top > window.innerHeight / 2
      ? 'top'
      : steps[step].placement

  const clampLeft = (left: number) =>
    Math.min(Math.max(left, 12), window.innerWidth - CARD_WIDTH - 12)

  const cardStyle: React.CSSProperties =
    placement === 'bottom'
      ? {
          top: spotlight.top + spotlight.height + 12,
          left: clampLeft(spotlight.left),
        }
      : placement === 'top'
        ? {
            top: spotlight.top - 12,
            left: clampLeft(spotlight.left + spotlight.width - CARD_WIDTH),
            transform: 'translateY(-100%)',
          }
        : placement === 'screen-bottom'
          ? {
              bottom: 12,
              left: '50%',
              transform: 'translateX(-50%)',
            }
          : {
              top: Math.max(spotlight.top + 40, 12),
              left: spotlight.left + spotlight.width + 12,
            }

  return createPortal(
    // pointer-events-auto: open Radix sheets set pointer-events: none on <body>; the card
    // must stay clickable above them
    <div className="fixed inset-0 z-[3000] pointer-events-auto" data-tutorial-overlay>
      <div
        className="fixed rounded-lg border-2 border-violet-400 transition-all duration-300
          shadow-[0_0_0_100vmax_rgba(0,0,0,0.6)] pointer-events-none"
        style={spotlight}
      />

      <div
        className="fixed w-80 rounded-lg bg-background p-4 shadow-xl transition-all duration-300"
        style={cardStyle}
      >
        <p className="text-xs text-muted-foreground mb-1">
          Step {step + 1} of {steps.length}
        </p>

        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{body}</p>

        <div className="flex items-center justify-between mt-4">
          <Button variant="ghost" size="sm" onClick={finish}>
            Skip
          </Button>

          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}

            <Button
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => (isLast ? finish() : setStep(step + 1))}
            >
              {isLast ? 'Finish' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
