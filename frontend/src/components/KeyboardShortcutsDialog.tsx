import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"

const SHORTCUTS = [
  { keys: ["V"], description: "Select / Move mode" },
  { keys: ["D"], description: "Place depot" },
  { keys: ["C"], description: "Add customer" },
  { keys: ["S"], description: "Add charging station" },
  { keys: ["E"], description: "Erase mode" },
  { keys: ["Shift", "Click"], description: "Remove element" },
  { keys: ["Del / Backspace"], description: "Remove selected element" },
  { keys: ["?"], description: "Show this cheat sheet" },
]

export function KeyboardShortcutsDialog() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === "?") setOpen((v) => !v)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1">
          {SHORTCUTS.map(({ keys, description }) => (
            <div key={description} className="flex items-center justify-between py-1">
              <span className="text-sm text-muted-foreground">{description}</span>
              <div className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd
                    key={k}
                    className="inline-flex items-center rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
