import { useCallback, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEVRPStore } from '@/lib/evrp-store'
import { Button } from './ui/button'
import { useSidebar } from './ui/sidebar'

const TUTORIAL_DONE_KEY = 'evrp-tutorial-done'
const SPOTLIGHT_PADDING = 8

type Step = {
  selector: string
  title: string
  body: string
  placement: 'bottom' | 'right'
}

const STEPS: Step[] = [
  {
    selector: '[data-tutorial="edit-tools"]',
    title: 'Build your problem',
    body:
      'Use these tools to place the depot, customers and charging stations on the map. ' +
      'Pick a tool, then click anywhere on the map. The eraser removes elements.',
    placement: 'bottom',
  },
  {
    selector: '[data-slot="sidebar-container"]',
    title: 'Inspect your elements',
    body:
      'Everything you place shows up here. Click an element to edit its properties in the ' +
      'Settings tab, and configure your fleet in the Vehicles tab.',
    placement: 'right',
  },
  {
    selector: '[data-tutorial="solver-options"]',
    title: 'Pick a goal and scheme',
    body:
      'Choose what the solver should minimise — energy, tardiness or vehicle count — and ' +
      'which vehicle-assignment scheme it uses to build the routes.',
    placement: 'bottom',
  },
  {
    selector: '[data-tutorial="calculate"]',
    title: 'Calculate routes',
    body:
      'When your problem is ready, hit this button. The solver computes optimised routes ' +
      'and draws them on the map.',
    placement: 'bottom',
  },
]

type Rect = { top: number; left: number; width: number; height: number }

export function Tutorial() {
  const [step, setStep] = useState<number | null>(() =>
    localStorage.getItem(TUTORIAL_DONE_KEY) ? null : 0,
  )
  const [rect, setRect] = useState<Rect | null>(null)

  const { setOpen } = useSidebar()
  const setActiveTab = useEVRPStore((s) => s.setActiveTab)

  const measure = useCallback(() => {
    if (step === null) return

    const el = document.querySelector(STEPS[step].selector)
    if (!el) return

    const r = el.getBoundingClientRect()
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
  }, [step])

  useLayoutEffect(() => {
    if (step === null) return

    if (step === 1) {
      setOpen(true)
      setActiveTab('elements')
    }

    const frame = requestAnimationFrame(measure)
    const timer = setTimeout(measure, 350)
    window.addEventListener('resize', measure)

    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      window.removeEventListener('resize', measure)
    }
  }, [step, measure, setOpen, setActiveTab])

  if (step === null || rect === null) return null

  const finish = () => {
    localStorage.setItem(TUTORIAL_DONE_KEY, '1')
    setStep(null)
  }

  const isLast = step === STEPS.length - 1
  const { title, body, placement } = STEPS[step]

  const spotlight = {
    top: rect.top - SPOTLIGHT_PADDING,
    left: rect.left - SPOTLIGHT_PADDING,
    width: rect.width + SPOTLIGHT_PADDING * 2,
    height: rect.height + SPOTLIGHT_PADDING * 2,
  }

  const cardStyle =
    placement === 'bottom'
      ? {
          top: spotlight.top + spotlight.height + 12,
          left: Math.min(Math.max(spotlight.left, 12), window.innerWidth - 320 - 12),
        }
      : {
          top: Math.max(spotlight.top + 40, 12),
          left: spotlight.left + spotlight.width + 12,
        }

  return createPortal(
    <div className="fixed inset-0 z-[3000]">
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
          Step {step + 1} of {STEPS.length}
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
