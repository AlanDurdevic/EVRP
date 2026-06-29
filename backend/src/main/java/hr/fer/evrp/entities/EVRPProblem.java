package hr.fer.evrp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.Map;

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

    private final double[][] distanceMatrix;

    private final Map<Location, Integer> locationIndex;

    public double distance(Location l1, Location l2) {
        if (distanceMatrix == null || locationIndex == null) {
            return Location.distance(l1, l2);
        }
        Integer i1 = locationIndex.get(l1);
        Integer i2 = locationIndex.get(l2);
        if (i1 == null || i2 == null) {
            return Location.distance(l1, l2);
        }
        return distanceMatrix[i1][i2];
    }

    @Override
    public String toString() {
        return "EVRPProblem [depot=" + depot + ", vehicleFuelTankCapacity="
                + vehicleFuelTankCapacity + ", vehicleLoadCapacity=" + vehicleLoadCapacity + ", fuelConsumptionRate="
                + fuelConsumptionRate + ", inverseRefuelingRate=" + inverseRefuelingRate + ", averageVelocity="
                + averageVelocity + "]";
    }
}
