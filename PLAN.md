# EVRP Routing Service — Implementation Plan

## Design Decisions

- OSRM demo server (`demo.project-osrm.org`) for routing — no self-hosting needed
- Distance matrix fetched from OSRM `/table?annotations=distance` before solve
- Matrix index: depot=0, customers=1..N, charging stations=N+1..N+M
- All `Location.distance()` calls replaced with O(1) `matrix[i][j]` lookup
- Nearest-charging-station lookup in `EVRPService.java:106` also uses matrix
- If OSRM unreachable when building matrix → fail solve with error
- Polylines fetched per-segment from OSRM `/route` after solve
- Polylines decoded on backend → `List<double[]>` (lat/lng pairs)
- Polylines returned per-segment, added to existing solve response structure
- If OSRM unreachable for a polyline → return `null`, frontend draws straight line
- Two Caffeine caches: one for distance matrices, one for polylines
- OSRM fully hidden behind the backend — frontend unchanged except RouteLines.tsx

---

## Features

### Feature 1 — OSRM client + distance matrix pre-fetch
- Add Caffeine dependency to `build.gradle.kts`
- Add `OsrmClient.java` — calls `/table` and `/route`, handles HTTP, decodes polylines
- Add `DistanceMatrixService.java` — builds matrix from OSRM, caches result, exposes `getDistance(i, j)`
- Add cache config (`CacheConfig.java`) with two named caches: `distanceMatrix`, `polylines`
- **No changes to the solver yet** — pure infrastructure

### Feature 2 — Wire matrix into the solver
- Add `distanceMatrix` field to `SolutionEVRP` (and stochastic variant)
- Replace all `Location.distance(l1, l2)` calls in the hot path with `matrix[l1.index][l2.index]`
- Files affected: `SolutionEVRP.java`, `StohasticSolutionEVRP.java`, `GPCustomerSelector.java`, `NNCustomerSelector.java`, `GPCustomerSelectorStohastic.java`
- Update `EVRPService.java:106` nearest-charging-station lookup to use matrix
- Update `EVRPService.java` solve flow to fetch matrix before constructing solver

### Feature 3 — Polyline fetch + solve response update
- Add `SegmentPolylineService.java` — fetches polylines for solution segments, caches per pair
- Add `PolylineDTO.java` — `List<double[]>` points
- Add `RouteSegmentDTO.java` — wraps existing segment with optional polyline
- Update `SolveResponseDTO` to include polylines per segment
- Update `EVRPService.java` to fetch polylines after solve and attach to response

### Feature 4 — Frontend RouteLines.tsx update
- Update `RouteLines.tsx` to render road polylines when present, straight line when `null`
- Update types in `evrp-types.ts` to include polyline data in route response
- Update `routing-service.ts` to pass through polyline data from response

---

## Commit Checkpoints

- [ ] Feature 1: OSRM client + Caffeine cache infrastructure
- [ ] Feature 2: Matrix wired into solver (Euclidean replaced)
- [ ] Feature 3: Polylines in solve response
- [ ] Feature 4: Frontend renders road polylines
