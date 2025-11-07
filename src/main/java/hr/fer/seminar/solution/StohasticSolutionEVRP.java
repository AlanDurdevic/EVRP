package hr.fer.seminar.solution;

import java.util.ArrayList;
import java.util.List;

import hr.fer.seminar.entities.ChargingStation;
import hr.fer.seminar.entities.Customer;
import hr.fer.seminar.entities.Depot;
import hr.fer.seminar.entities.Location;
import hr.fer.seminar.entities.StohasticEVRPProblem;
import hr.fer.seminar.entities.Vehicle;
import hr.fer.seminar.operators.cs.CustomerSelector;
import hr.fer.seminar.operators.vs.VehicleSupplier;
import hr.fer.seminar.util.stohastic.distribution.Distribution;
import io.jenetics.Gene;

public abstract class StohasticSolutionEVRP<T extends Gene<?, T>> extends SolutionEVRP<T>{

	public StohasticSolutionEVRP(StohasticEVRPProblem problem) {
		super(problem);
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
			Location destination = null;
			Vehicle v = vehicleSupplier.getVehicle();
			Customer c = cs.selectCustomer(v, UC, problem);
			double velocity = 0;
			if (c == null) {
				destination = depot;
			} else {
				if (v.getLoadCapacityLeft() >= c.getDemand()) {
					double timeNeeded = Location.distance(v.getCurrentLocation(), c) / averageVelocity;
					if (v.getCurrentTime() + timeNeeded <= c.getDueDate()) {
						destination = c;
					} else {
						destination = depot;
					}
				} else {
					destination = depot;
				}
			}

			if (destination instanceof Customer && !checkIfVehicleCanReturnToDepot(v, c)) {
				if(checkIfCanVisitChargingStationBeforeLastCustomer(v, c)) {
					// choose charging station
					charge(v, chooseChargingStationBeforeDepot(v, c));
					// go to customer
					velocity = velocityDistribution.generate(averageVelocity);
					double distance = Location.distance(v.getCurrentLocation(), destination);
					double time = distance / velocity;
					v.addTime(time);
					double fuel = fuelConsumptionRate * distance;
					v.subtractFuelCapacity(fuel);
					//calculate new demand and service time
					double serviceTime = serviceTimeDistribution.generate(destination.getServiceTime());
					double demand = demandDistribution.generate(destination.getDemand());			
					if(demand <= v.getLoadCapacityLeft()) {
						v.addLocation(new Customer((Customer) destination, demand, serviceTime));
						// wait if arrive early
						if (v.getCurrentTime() < destination.getReadyTime()) {
							v.addTime(destination.getReadyTime() - v.getCurrentTime());
						}
						// serving customer
						v.addTime(serviceTime);
						v.subtractLoadCapacity(demand);
						UC.remove(c);
					}
					else {
						v.addLocation(new Customer((Customer) destination, 0, 0));
					}
				}
				destination = depot;
			}

			double fuelNeeded = fuelConsumptionRate * (Location.distance(v.getCurrentLocation(), destination));
			if (destination instanceof Customer) {
				fuelNeeded += fuelConsumptionRate
						* Location.distance(destination, ((Customer) destination).getNearestChargingStation());
			}
			if (v.getFuelCapacityLeft() < fuelNeeded) {
				ChargingStation chargingStation = chooseChargingStation(v, destination);
				if (chargingStation == null) {
					double fuel = fuelConsumptionRate * Location.distance(v.getCurrentLocation(), depot);
					if (fuel > v.getFuelCapacityLeft()) {
						chargingStation = ((Customer) v.getCurrentLocation()).getNearestChargingStation();
					}
					destination = depot;
				}
				if (chargingStation != null) {
					charge(v, chargingStation);
				}

			}
			// travel to destination
			velocity = velocityDistribution.generate(averageVelocity);
			double distance = Location.distance(v.getCurrentLocation(), destination);
			double time = distance / velocity;
			v.addTime(time);
			double fuel = fuelConsumptionRate * distance;
			v.subtractFuelCapacity(fuel);
			if (destination instanceof Customer) {
				//calculate new demand and service time
				double serviceTime = serviceTimeDistribution.generate(destination.getServiceTime());
				double demand = demandDistribution.generate(destination.getDemand());	
				if(demand <= v.getLoadCapacityLeft()) {
					v.addLocation(new Customer((Customer)destination, demand, serviceTime));
					// arrives before
					if (v.getCurrentTime() < destination.getReadyTime()) {
						v.addTime(destination.getReadyTime() - v.getCurrentTime());
					}
					// serving customer
					v.addTime(serviceTime);
					v.subtractLoadCapacity(demand);
					UC.remove(c);
					vehicleSupplier.addVehicle(v);
				}
				else {
					v.addLocation(new Customer((Customer)destination, 0, 0));
					// check if can return to depot
					distance = Location.distance(destination, depot);
					fuelNeeded = distance * fuelConsumptionRate;
					if (fuelNeeded > v.getFuelCapacityLeft()) {
						charge(v, ((Customer) destination).getNearestChargingStation());
					}
					
					destination = depot;
					// return to depot
					velocity = velocityDistribution.generate(averageVelocity);
					distance = Location.distance(v.getCurrentLocation(), destination);
					time = distance / velocity;
					v.addTime(time);
					fuel = fuelConsumptionRate * distance;
					v.subtractFuelCapacity(fuel);
					v.addLocation(destination);
					usedVehicles.add(v);
					vehicleSupplier.vehicleFinished(v, UC);
					if (!vehicleSupplier.hasMoreVehicles() && !UC.isEmpty()) {
						vehicleSupplier.addVehicle(new Vehicle(numberOfVehicles++, problem.getVehicleFuelTankCapacity(),
								problem.getVehicleLoadCapacity(), depot));
					}
				}
			} else {
				v.addLocation(destination);
				// returning vehicle to depot
				usedVehicles.add(v);
				vehicleSupplier.vehicleFinished(v, UC);

				if (!vehicleSupplier.hasMoreVehicles() && !UC.isEmpty()) {
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
		double distance = Location.distance(v.getCurrentLocation(), chargingStation);
		double time = distance / velocity;
		v.addTime(time);
		double fuel = problem.getFuelConsumptionRate() * distance;
		v.subtractFuelCapacity(fuel);
		v.addLocation(chargingStation);
		// charging vehicle
		double capacityToCharge = problem.getVehicleFuelTankCapacity() - v.getFuelCapacityLeft();
		time = capacityToCharge * problem.getInverseRefuelingRate();
		v.addTime(time);
		v.setFuelCapacity(problem.getVehicleFuelTankCapacity());
	}

}
