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

## 3. Zoom to Fit
- Button in the toolbar (or map control) that calls `map.fitBounds()` over all placed elements
- Should account for depot, all customers, and all stations
- Disable / no-op when no elements are placed

## 6. Keyboard Shortcut Cheatsheet
- Press `?` to open a modal listing all shortcuts
- Shortcuts to document: `v` select, `d` depot, `c` customer, `s` station, `e` erase, `?` help, `Ctrl+Z/Y` undo/redo, `Delete` remove selected

## 7. Delete Key to Remove Selected Element
- When an element is selected and `Delete` (or `Backspace`) is pressed, remove it from the store
- Guard: skip if focus is on an input/textarea
- After deletion, clear the selection

## 9. Bulk Clear
- "Clear all customers" and "Clear all stations" buttons in `ElementsList.tsx`
- Only show the button when the respective list is non-empty
- Add `clearCustomers` and `clearStations` actions to the store
