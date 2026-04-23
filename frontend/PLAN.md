# UX Improvement Plan

## 1. Undo / Redo
- `Ctrl+Z` / `Ctrl+Y` (or `Ctrl+Shift+Z`) support
- Track action history in the Zustand store (or a separate history slice)
- Scope: depot placement, customer add/move/remove, station add/move/remove

## 2. Import / Export
- Uncomment and wire up the existing Import/Export buttons in `Toolbar.tsx`
- Export: serialize `EVRPProblem` to JSON and trigger a file download
- Import: file picker, parse JSON, validate shape, load into store
- Reset counters (`customerCounter`, `stationCounter`) to max existing IDs on import
