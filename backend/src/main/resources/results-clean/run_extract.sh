#!/usr/bin/env bash

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

for file in "$DIR"/*; do
    [[ -d "$file" ]] && continue
    [[ "$file" == *.py ]] && continue
    [[ "$(basename "$file")" == *.sh ]] && continue
    uv run "$DIR/extract_best.py" "$file"
done
