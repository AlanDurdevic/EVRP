package hr.fer.evrp.operators.cs;

import java.util.List;

import hr.fer.evrp.entities.Customer;
import hr.fer.evrp.entities.EVRPProblem;
import hr.fer.evrp.entities.Vehicle;

public interface CustomerSelector {
	
	Customer selectCustomer(Vehicle v, List<Customer> UC, EVRPProblem problem, Vehicle[] vehicles);

}
