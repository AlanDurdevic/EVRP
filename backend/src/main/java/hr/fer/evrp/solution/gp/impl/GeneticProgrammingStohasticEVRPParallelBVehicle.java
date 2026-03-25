package hr.fer.evrp.solution.gp.impl;

import java.util.List;

import hr.fer.evrp.entities.StohasticEVRPProblem;
import hr.fer.evrp.entities.Vehicle;
import hr.fer.evrp.operators.cs.CustomerSelector;
import hr.fer.evrp.operators.cs.GPCustomerSelectorStohastic;
import hr.fer.evrp.operators.vs.ParallelBVehicleSupplier;
import hr.fer.evrp.operators.vs.VehicleSupplier;
import hr.fer.evrp.solution.gp.GeneticProgrammingStohasticEVRP;
import io.jenetics.Genotype;
import io.jenetics.prog.ProgramGene;

public class GeneticProgrammingStohasticEVRPParallelBVehicle extends GeneticProgrammingStohasticEVRP{

	public GeneticProgrammingStohasticEVRPParallelBVehicle(StohasticEVRPProblem problem) {
		super(problem);
	}
	
	@Override
	public List<Vehicle> getUsedVehicles(Genotype<ProgramGene<Double>> programGenotype){
		ProgramGene<Double> program = programGenotype.gene();
		List<Vehicle> vehicles = initializeVehicles(getLUNumberOfVehicles());
		CustomerSelector customerSelector = new GPCustomerSelectorStohastic(program);
		VehicleSupplier vehicleSupplier = new ParallelBVehicleSupplier(vehicles, problem);
		return getUsedVehicles(customerSelector, vehicleSupplier);
	}


}
