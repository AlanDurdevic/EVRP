package hr.fer.seminar.operators.cs;

import java.util.List;

import hr.fer.seminar.entities.Customer;
import hr.fer.seminar.entities.EVRPProblem;
import hr.fer.seminar.entities.Location;
import hr.fer.seminar.entities.StohasticEVRPProblem;
import hr.fer.seminar.entities.Vehicle;
import io.jenetics.prog.ProgramGene;

public class GPCustomerSelectorStohastic implements CustomerSelector{

	private final ProgramGene<Double> program;
	
	public GPCustomerSelectorStohastic(ProgramGene<Double> program) {
		this.program = program;
	}

	@Override
	public Customer selectCustomer(Vehicle vehicle, List<Customer> UC, EVRPProblem p, Vehicle[] vehicles) {
		if (UC.isEmpty()) {
			return null;
		}
	
		double UCn = UC.size();
		
		double DsumUC = 0;
		for(Customer customer : UC) {
			DsumUC += customer.getDemand();
		}
		
		double CsumV = 0;
		double CminV = Double.MAX_VALUE;
		for(Vehicle v : vehicles) {
			CsumV += v.getLoadCapacityLeft();
			if(v.getLoadCapacityLeft() < CminV) {
				CminV = v.getLoadCapacityLeft();
			}
		}
		
		StohasticEVRPProblem problem = (StohasticEVRPProblem) p;

		double fuelConsumptionRate = problem.getFuelConsumptionRate();
		double Evk = vehicle.getFuelCapacityLeft();
		double Cvk = vehicle.getLoadCapacityLeft();
		double Tvk = vehicle.getCurrentTime();
		double ERPpvk = 0;

		Location currentLocation = vehicle.getCurrentLocation();
		if (currentLocation instanceof Customer) {
			ERPpvk = fuelConsumptionRate
					* Location.distance(((Customer) currentLocation).getNearestChargingStation(), currentLocation);
		}
		double EDeppvk = fuelConsumptionRate * Location.distance(currentLocation, problem.getDepot());

		double centroidX = 0;
		double centroidY = 0;
		for (Customer customer : UC) {
			centroidX += customer.getX();
			centroidY += customer.getY();
		}
		centroidX /= UC.size();
		centroidY /= UC.size();

		Customer bestCustomer = UC.getFirst();
		double bestPriority = Double.MIN_VALUE;
		for (Customer customer : UC) {
			double distance = Location.distance(currentLocation, customer);
			double Eni = fuelConsumptionRate * distance;
			double Dni = customer.getDemand();
			double DDni = customer.getDueDate();
			double STni = customer.getServiceTime();
			double RTni = customer.getReadyTime();
			double ECni = fuelConsumptionRate
					* Math.sqrt(Math.pow(centroidX - customer.getX(), 2) + Math.pow(centroidY - customer.getY(), 2));
			double ERPni = fuelConsumptionRate * Location.distance(customer, customer.getNearestChargingStation());
			double EDepni = fuelConsumptionRate * Location.distance(customer, problem.getDepot());
			double Var_Dni = problem.getDemandDistribution().getCV();
			double Var_Sni = problem.getServiceTimeDistribution().getCV();
			double Var_Tij = problem.getVelocityDistribution().getCV();
			double Slack_TW = customer.getDueDate() - vehicle.getCurrentTime();

			Double[] arguments = { Eni, Dni, DDni, STni, RTni, Evk, Cvk, Tvk, ECni, ERPni, EDepni, ERPpvk, EDeppvk, Var_Dni, Var_Sni, Var_Tij, Slack_TW,
					UCn, DsumUC, CsumV, CminV};
			double customerPriority = program.apply(arguments);
			if (customerPriority > bestPriority) {
				bestPriority = customerPriority;
				bestCustomer = customer;
			}
		}
		return bestCustomer;
	}


}
