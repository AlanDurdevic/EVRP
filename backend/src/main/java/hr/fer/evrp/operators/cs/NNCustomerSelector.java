package hr.fer.evrp.operators.cs;

import java.util.List;

import hr.fer.evrp.entities.Customer;
import hr.fer.evrp.entities.EVRPProblem;
import hr.fer.evrp.entities.Location;
import hr.fer.evrp.entities.Vehicle;

public class NNCustomerSelector implements CustomerSelector{

	@Override
	public Customer selectCustomer(Vehicle v, List<Customer> UC, EVRPProblem problem, Vehicle[] vehicles) {
		if(UC.isEmpty())
			return null;
		Location currentLocation = v.getCurrentLocation();
		Customer nearestCustomer = UC.getFirst();
		double closestDistance = problem.distance(currentLocation, nearestCustomer);
		for(Customer customer : UC) {
			double newDistance = problem.distance(currentLocation, customer);
			if(newDistance < closestDistance) {
				closestDistance = newDistance;
				nearestCustomer = customer;
			}		
		}
		return nearestCustomer;
	}

}
