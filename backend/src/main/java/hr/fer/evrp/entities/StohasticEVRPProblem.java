package hr.fer.evrp.entities;

import hr.fer.evrp.util.stohastic.distribution.Distribution;
import lombok.Getter;

import java.util.List;

@Getter
public class StohasticEVRPProblem extends EVRPProblem {

    private final Distribution demandDistribution;

    private final Distribution serviceTimeDistribution;

    private final Distribution velocityDistribution;

    public StohasticEVRPProblem(
            Depot depot,
            double vehicleFuelTankCapacity,
            double vehicleLoadCapacity,
            double fuelConsumptionRate,
            double inverseRefuelingRate,
            double averageVelocity,
            List<Customer> customers,
            List<ChargingStation> chargingStations,
            Distribution demandDistribution,
            Distribution serviceTimeDistribution,
            Distribution velocityDistribution
    ) {
        super(
            depot,
            vehicleFuelTankCapacity,
            vehicleLoadCapacity,
            fuelConsumptionRate,
            inverseRefuelingRate,
            averageVelocity,
            customers,
            chargingStations
        );
        this.demandDistribution = demandDistribution;
        this.serviceTimeDistribution = serviceTimeDistribution;
        this.velocityDistribution = velocityDistribution;
    }

}
