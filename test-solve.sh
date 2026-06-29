#!/bin/bash
# Test Feature 2: solve with real Zagreb coordinates via OSRM distance matrix.
# Run with: bash test-solve.sh
# Requires: curl, jq

BASE_URL="http://localhost:8080"
COOKIE_JAR=$(mktemp)

echo "==> Logging in..."
LOGIN=$(curl -s -c "$COOKIE_JAR" -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"changeme"}')
echo "$LOGIN"

echo ""
echo "==> Solving EVRP with 3 Zagreb customers + 1 charging station..."
echo "    (depot=Jelačić Square, customers=Station/Maksimir/Mirogoj, CS=Britanski trg)"
echo "    fuelConsumptionRate scaled down for meter-range distances"
echo ""

RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST "$BASE_URL/api/evrp/solve" \
  -H "Content-Type: application/json" \
  -d '{
    "depot": {
      "x": 15.9782,
      "y": 45.8131
    },
    "problemProperties": {
      "vehicleFuelTankCapacity": 999999,
      "vehicleLoadCapacity": 100,
      "fuelConsumptionRate": 0.0001,
      "inverseRefuelingRate": 0.2,
      "averageVelocity": 40.0
    },
    "customers": [
      {
        "id": "c1",
        "x": 15.9789,
        "y": 45.8044,
        "demand": 5,
        "readyTime": 0,
        "dueDate": 9999999,
        "serviceTime": 0.1
      },
      {
        "id": "c2",
        "x": 16.0175,
        "y": 45.8136,
        "demand": 5,
        "readyTime": 0,
        "dueDate": 9999999,
        "serviceTime": 0.1
      },
      {
        "id": "c3",
        "x": 15.9874,
        "y": 45.8245,
        "demand": 5,
        "readyTime": 0,
        "dueDate": 9999999,
        "serviceTime": 0.1
      }
    ],
    "chargingStations": [
      {
        "id": "cs1",
        "x": 15.9700,
        "y": 45.8200,
        "dueDate": 9999999
      }
    ],
    "optimizationTarget": "energy",
    "vehicleMethod": "serial"
  }')

rm -f "$COOKIE_JAR"

if echo "$RESPONSE" | jq -e '.routes' > /dev/null 2>&1; then
  ROUTE_COUNT=$(echo "$RESPONSE" | jq '.routes | length')
  echo "SUCCESS: $ROUTE_COUNT route(s) returned"
  echo ""
  echo "$RESPONSE" | jq '.routes[] | {
    stops: (.locations | length),
    ids: [.locations[].id],
    polyline_segments: (.polylines | length),
    first_segment_points: (.polylines[0] | if . then length else null end),
    first_segment_sample: (.polylines[0] | if . then .[0:2] else null end)
  }'
elif echo "$RESPONSE" | jq -e '.error' > /dev/null 2>&1; then
  echo "ERROR: $(echo "$RESPONSE" | jq -r '.error')"
else
  echo "RAW RESPONSE:"
  echo "$RESPONSE"
fi
