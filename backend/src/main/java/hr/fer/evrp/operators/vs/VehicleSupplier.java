package hr.fer.evrp.operators.vs;

import java.util.List;

import hr.fer.evrp.entities.Customer;
import hr.fer.evrp.entities.Vehicle;

public interface VehicleSupplier {
	
	Vehicle getVehicle();
	
	void addVehicle(Vehicle vehicle);
	
	boolean hasMoreVehicles();
	
	int getNumberOfVehiclesLeft();
	
	Vehicle[] getVehicles();
	
	default void vehicleFinished(Vehicle vehicle, List<Customer> UC) {
		
	}

}
