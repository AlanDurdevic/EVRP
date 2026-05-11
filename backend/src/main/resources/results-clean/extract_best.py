#!/usr/bin/env python3
"""Extract best programs from a GP experiment result file."""

import os
import sys


def parse_file(filepath):
    experiments = []
    current = {}

    with open(filepath, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if line.startswith("#EXPERIMENT:"):
                if current:
                    experiments.append(current)
                current = {"experiment": line.split(":", 1)[1]}
            elif line.startswith("BestProgram:"):
                current["program"] = line.split(":", 1)[1]
            elif line.startswith("ErrorTrain:"):
                try:
                    current["error"] = float(line.split(":", 1)[1])
                except ValueError:
                    pass

    if current:
        experiments.append(current)

    return [e for e in experiments if "program" in e and "error" in e]


def main():
    if len(sys.argv) < 2:
        print(f"Usage: {sys.argv[0]} <result-file>")
        sys.exit(1)

    filepath = sys.argv[1]
    experiments = parse_file(filepath)

    if not experiments:
        print("No experiments found.")
        sys.exit(1)

    best = min(experiments, key=lambda e: e["error"])

    for exp in experiments:
        marker = " <-- best" if exp is best else ""
        print(f"Experiment {exp['experiment']:>3}  ErrorTrain: {exp['error']:.6f}{marker}")

    print()
    print(f"Best: experiment {best['experiment']}, ErrorTrain: {best['error']:.6f}")
    print(f"Program: {best['program']}")

    programs_dir = os.path.join(os.path.dirname(os.path.abspath(filepath)), "programs")
    os.makedirs(programs_dir, exist_ok=True)
    output_path = os.path.join(programs_dir, os.path.basename(filepath) + "-program")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(best["program"] + "\n")
    print(f"Saved to: {output_path}")


if __name__ == "__main__":
    main()
