package hr.fer.evrp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class EVRPProblem {

    private final Depot depot;

    private final double vehicleFuelTankCapacity;

    private final double vehicleLoadCapacity;

    private final double fuelConsumptionRate;

    private final double inverseRefuelingRate;

    private final double averageVelocity;

    private final List<Customer> customers;

    private final List<ChargingStation> chargingStations;

    @Override
    public String toString() {
        return "EVRPProblem [depot=" + depot + ", vehicleFuelTankCapacity="
                + vehicleFuelTankCapacity + ", vehicleLoadCapacity=" + vehicleLoadCapacity + ", fuelConsumptionRate="
                + fuelConsumptionRate + ", inverseRefuelingRate=" + inverseRefuelingRate + ", averageVelocity="
                + averageVelocity + "]";
    }
}
