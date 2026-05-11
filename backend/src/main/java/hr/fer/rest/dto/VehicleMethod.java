package hr.fer.rest.dto;

import com.fasterxml.jackson.annotation.JsonValue;

public enum VehicleMethod {
    PARALLEL("parallel"),
    PARALLEL_B("parallelB"),
    SEMI_PARALLEL("semiparallel"),
    SEMI_PARALLEL_B("semiparallelB"),
    SERIAL("serial");

    private final String value;

    VehicleMethod(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
