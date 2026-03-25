package hr.fer.evrp.operators.vs;

import java.util.List;
import java.util.PriorityQueue;

import hr.fer.evrp.entities.Vehicle;
import hr.fer.evrp.operators.VehicleComparator;

public class SemiParallelVehicleSupplier implements VehicleSupplier {

	public PriorityQueue<Vehicle> vehicles = new PriorityQueue<>(new VehicleComparator());

	public SemiParallelVehicleSupplier(List<Vehicle> vehicles) {
		this.vehicles.addAll(vehicles);
	}

	@Override
	public Vehicle getVehicle() {
		return vehicles.poll();
	}

	@Override
	public void addVehicle(Vehicle vehicle) {
		vehicles.add(vehicle);
	}

	@Override
	public boolean hasMoreVehicles() {
		return !vehicles.isEmpty();
	}

	@Override
	public int getNumberOfVehiclesLeft() {
		return vehicles.size();
	}
	
	@Override
	public Vehicle[] getVehicles() {
		return vehicles.toArray(new Vehicle[vehicles.size()]);
	}

}
