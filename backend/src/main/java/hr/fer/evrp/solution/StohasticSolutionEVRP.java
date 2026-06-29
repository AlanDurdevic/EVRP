package hr.fer.evrp.solution;

import hr.fer.evrp.entities.*;
import hr.fer.evrp.operators.cs.CustomerSelector;
import hr.fer.evrp.operators.vs.VehicleSupplier;
import hr.fer.evrp.util.stohastic.distribution.Distribution;
import io.jenetics.Gene;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public abstract class StohasticSolutionEVRP<T extends Gene<?, T>> extends SolutionEVRP<T> {

	private static final Logger log = LoggerFactory.getLogger(StohasticSolutionEVRP.class);

	public StohasticSolutionEVRP(StohasticEVRPProblem problem) {
		super(problem);
	}

	private static String routeStr(Vehicle v) {
		return v.getRoute().stream().map(Location::getId).collect(Collectors.joining(" → "));
	}

	@Override
	protected List<Vehicle> getUsedVehicles(CustomerSelector cs, VehicleSupplier vehicleSupplier) {
		StohasticEVRPProblem problem = (StohasticEVRPProblem) this.problem;
		Distribution demandDistribution = problem.getDemandDistribution();
		Distribution serviceTimeDistribution = problem.getServiceTimeDistribution();
		Distribution velocityDistribution = problem.getVelocityDistribution();

		int numberOfVehicles = vehicleSupplier.getNumberOfVehiclesLeft();
		List<Vehicle> usedVehicles = new ArrayList<>();
		Depot depot = problem.getDepot();
		double averageVelocity = problem.getAverageVelocity();
		double fuelConsumptionRate = problem.getFuelConsumptionRate();
		List<Customer> UC = initializeUC();
		while (!UC.isEmpty() || vehicleSupplier.hasMoreVehicles()) {
			if (Thread.interrupted()) {
				throw new hr.fer.rest.exception.SolverTimeoutException("Solver timed out");
			}
			Vehicle v = vehicleSupplier.getVehicle();
			Customer c = cs.selectCustomer(v, UC, problem, vehicleSupplier.getVehicles());
			Location destination = c;
			if (c == null) {
				log.debug("V{} at {} — no customer selected, returning to depot (UC={})",
						v.getId(), v.getCurrentLocation().getId(), UC.size());
				destination = depot;
			} else if (v.getLoadCapacityLeft() < c.getDemand()) {
				log.debug("V{} at {} — insufficient load for {} (demand={}, left={}), returning to depot",
						v.getId(), v.getCurrentLocation().getId(), c.getId(), c.getDemand(), v.getLoadCapacityLeft());
				destination = depot;
			} else {
				log.debug("V{} at {} — heading to customer {} (fuel={:.1f}, load={})",
						v.getId(), v.getCurrentLocation().getId(), c.getId(),
						v.getFuelCapacityLeft(), v.getLoadCapacityLeft());
			}

			double fuelNeeded = fuelConsumptionRate * (problem.distance(v.getCurrentLocation(), destination));
			if (destination instanceof Customer customerDest) {
				fuelNeeded += fuelConsumptionRate
						* problem.distance(destination, customerDest.getNearestChargingStation());
			}
			if (v.getFuelCapacityLeft() < fuelNeeded) {
				log.debug("V{} at {} — low fuel (have={:.1f}, need={:.1f}), seeking charging station",
						v.getId(), v.getCurrentLocation().getId(), v.getFuelCapacityLeft(), fuelNeeded);
				ChargingStation chargingStation = chooseChargingStation(v, destination);
				if (chargingStation == null) {
					log.warn("V{} at {} — no reachable charging station toward {}, diverting to depot",
							v.getId(), v.getCurrentLocation().getId(),
							destination instanceof Customer ? destination.getId() : "depot");
					double fuel = fuelConsumptionRate * problem.distance(v.getCurrentLocation(), depot);
					if (fuel > v.getFuelCapacityLeft()) {
						log.warn("V{} at {} — cannot even reach depot (need={:.1f}, have={:.1f}), emergency CS",
								v.getId(), v.getCurrentLocation().getId(), fuel, v.getFuelCapacityLeft());
						chargingStation = chooseChargingStation(v, depot);
					}
					destination = depot;
				}
				if (chargingStation != null) {
					log.debug("V{} charging at {}", v.getId(), chargingStation.getId());
					charge(v, chargingStation);
				}

			}
			// travel to destination
			double velocity = velocityDistribution.generate(averageVelocity);
			double distance = problem.distance(v.getCurrentLocation(), destination);
			double time = distance / velocity;
			v.addTime(time);
			double fuel = fuelConsumptionRate * distance;
			v.subtractFuelCapacity(fuel);
			if (destination instanceof Customer) {
				// calculate new demand and service time
				double serviceTime = serviceTimeDistribution.generate(destination.getServiceTime());
				double demand = demandDistribution.generate(destination.getDemand());
				if (demand <= v.getLoadCapacityLeft()) {
					v.addLocation(new Customer((Customer) destination, demand, serviceTime));
					// arrives before
					if (v.getCurrentTime() < destination.getReadyTime()) {
						v.addTime(destination.getReadyTime() - v.getCurrentTime());
					}
					// serving customer
					v.addTime(serviceTime);
					v.subtractLoadCapacity(demand);
					UC.remove(c);
					vehicleSupplier.addVehicle(v);
				} else {
					log.debug("V{} arrived at {} but stochastic demand {} exceeded load left {}, skipping",
							v.getId(), destination.getId(), demand, v.getLoadCapacityLeft());
					v.addLocation(new Customer((Customer) destination, 0, 0));
					// check if can return to depot
					distance = problem.distance(destination, depot);
					fuelNeeded = distance * fuelConsumptionRate;
					if (fuelNeeded > v.getFuelCapacityLeft()) {
						charge(v, chooseChargingStation(v, depot));
					}

					destination = depot;
					// return to depot
					velocity = velocityDistribution.generate(averageVelocity);
					distance = problem.distance(v.getCurrentLocation(), destination);
					time = distance / velocity;
					v.addTime(time);
					fuel = fuelConsumptionRate * distance;
					v.subtractFuelCapacity(fuel);
					v.addLocation(destination);
					log.info("V{} returned to depot — route: {}", v.getId(), routeStr(v));
					usedVehicles.add(v);
					vehicleSupplier.vehicleFinished(v, UC);
					if (!vehicleSupplier.hasMoreVehicles() && !UC.isEmpty()) {
						log.info("Deploying vehicle V{} ({} customers remaining)", numberOfVehicles, UC.size());
						vehicleSupplier.addVehicle(new Vehicle(numberOfVehicles++, problem.getVehicleFuelTankCapacity(),
								problem.getVehicleLoadCapacity(), depot));
					}
				}
			} else {
				v.addLocation(destination);
				// returning vehicle to depot
				log.info("V{} returned to depot — route: {}", v.getId(), routeStr(v));
				usedVehicles.add(v);
				vehicleSupplier.vehicleFinished(v, UC);

				if (!vehicleSupplier.hasMoreVehicles() && !UC.isEmpty()) {
					log.info("Deploying vehicle V{} ({} customers remaining)", numberOfVehicles, UC.size());
					vehicleSupplier.addVehicle(new Vehicle(numberOfVehicles++, problem.getVehicleFuelTankCapacity(),
							problem.getVehicleLoadCapacity(), depot));
				}
			}

		}
		return usedVehicles;
	}

	@Override
	protected void charge(Vehicle v, ChargingStation chargingStation) {
		Distribution velocityDistribution = ((StohasticEVRPProblem) problem).getVelocityDistribution();
		// travel to charging station
		double velocity = velocityDistribution.generate(problem.getAverageVelocity());
		double distance = problem.distance(v.getCurrentLocation(), chargingStation);
		double time = distance / velocity;
		v.addTime(time);
		double fuelBefore = v.getFuelCapacityLeft();
		double fuel = problem.getFuelConsumptionRate() * distance;
		v.subtractFuelCapacity(fuel);
		v.addLocation(chargingStation);
		// charging vehicle
		double capacityToCharge = problem.getVehicleFuelTankCapacity() - v.getFuelCapacityLeft();
		time = capacityToCharge * problem.getInverseRefuelingRate();
		v.addTime(time);
		v.setFuelCapacity(problem.getVehicleFuelTankCapacity());
		log.debug("V{} charged at {} (fuel {:.1f} → {:.1f}, travel {:.0f}m)",
				v.getId(), chargingStation.getId(), fuelBefore, v.getFuelCapacityLeft(), distance);
	}

	// choose station with lowest energy consumption
	@Override
	protected ChargingStation chooseChargingStation(Vehicle v, Location location) {
		Location currentLocation = v.getCurrentLocation();
		double vehicleFullTankCapacity = problem.getVehicleFuelTankCapacity();
		double fuelConsumptionRate = problem.getFuelConsumptionRate();

		ChargingStation bestChargingStation = null;
		double bestEnergy = Double.MAX_VALUE;
		int skippedOutOfRange = 0;
		for (ChargingStation cs : problem.getChargingStations()) {
			double fuelCapacityLeft = v.getFuelCapacityLeft();
			double distanceLCS = problem.distance(currentLocation, cs);
			double fuelLCS = fuelConsumptionRate * distanceLCS;
			fuelCapacityLeft -= fuelLCS;
			// check if vehicle can reach charging station
			if (fuelCapacityLeft >= 0) {
				// get to destination from charging station
				double distanceCSD = problem.distance(cs, location);
				// check if vehicle can reach destination and nearest charging station
				double fuelNeeded = fuelConsumptionRate
						* (distanceCSD + problem.distance(location, location.getNearestChargingStation()));
				if (fuelNeeded <= vehicleFullTankCapacity) {
					double energy = fuelConsumptionRate * (distanceLCS + distanceCSD);
					if (energy < bestEnergy) {
						bestChargingStation = cs;
						bestEnergy = energy;
					}
				}
			} else {
				skippedOutOfRange++;
			}
		}
		if (bestChargingStation == null) {
			log.warn("V{} at {} — no charging station reachable toward {} (fuel={:.1f}, {} stations checked, {} out of range)",
					v.getId(), currentLocation.getId(),
					location.getId(), v.getFuelCapacityLeft(),
					problem.getChargingStations().size(), skippedOutOfRange);
		}
		return bestChargingStation;
	}
}
