package hr.fer.evrp.solution.gp.impl;


import java.util.List;

import hr.fer.evrp.entities.EVRPProblem;
import hr.fer.evrp.entities.Vehicle;
import io.jenetics.Genotype;
import io.jenetics.prog.ProgramGene;
import hr.fer.evrp.operators.cs.CustomerSelector;
import hr.fer.evrp.operators.cs.GPCustomerSelector;
import hr.fer.evrp.operators.vs.SerialVehicleSupplier;
import hr.fer.evrp.operators.vs.VehicleSupplier;
import hr.fer.evrp.solution.gp.GeneticProgrammingEVRP;

public class GeneticProgrammingEVRPSerialVehicle extends GeneticProgrammingEVRP {
	
	public GeneticProgrammingEVRPSerialVehicle(EVRPProblem problem) {
		super(problem);
	}
	
	@Override
	public List<Vehicle> getUsedVehicles(Genotype<ProgramGene<Double>> programGenotype){
		ProgramGene<Double> program = programGenotype.gene();
		List<Vehicle> vehicles = initializeVehicles(getLUNumberOfVehicles());
		CustomerSelector customerSelector = new GPCustomerSelector(program);
		VehicleSupplier vehicleSupplier = new SerialVehicleSupplier(vehicles);
		return getUsedVehicles(customerSelector, vehicleSupplier);
	}

}
