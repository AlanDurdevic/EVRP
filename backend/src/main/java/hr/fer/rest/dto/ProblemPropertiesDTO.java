package hr.fer.rest.dto;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class ProblemPropertiesDTO {
    private double vehicleFuelTankCapacity;
    private double vehicleLoadCapacity;
    private double fuelConsumptionRate;
    private double inverseRefuelingRate;
    private double averageVelocity;
}
