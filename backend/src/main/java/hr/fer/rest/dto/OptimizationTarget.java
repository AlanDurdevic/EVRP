package hr.fer.rest.dto;

import com.fasterxml.jackson.annotation.JsonValue;

public enum OptimizationTarget {
    ENERGY("energy"),
    TARDINESS("tardiness"),
    VEHICLE("vehicle");

    private final String value;

    OptimizationTarget(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
