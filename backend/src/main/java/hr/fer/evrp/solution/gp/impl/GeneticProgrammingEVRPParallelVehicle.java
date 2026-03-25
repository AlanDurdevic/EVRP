package hr.fer.evrp.solution.gp.impl;

import java.util.List;

import hr.fer.evrp.entities.EVRPProblem;
import hr.fer.evrp.entities.Vehicle;
import hr.fer.evrp.operators.cs.CustomerSelector;
import hr.fer.evrp.operators.cs.GPCustomerSelector;
import hr.fer.evrp.operators.vs.ParallelVehicleSupplier;
import hr.fer.evrp.operators.vs.VehicleSupplier;
import hr.fer.evrp.solution.gp.GeneticProgrammingEVRP;
import io.jenetics.Genotype;
import io.jenetics.prog.ProgramGene;

public class GeneticProgrammingEVRPParallelVehicle extends GeneticProgrammingEVRP{

	public GeneticProgrammingEVRPParallelVehicle(EVRPProblem problem) {
		super(problem);
	}

	@Override
	public List<Vehicle> getUsedVehicles(Genotype<ProgramGene<Double>> programGenotype) {
		ProgramGene<Double> program = programGenotype.gene();
		List<Vehicle> vehicles = initializeVehicles(getLUNumberOfVehicles());
		CustomerSelector customerSelector = new GPCustomerSelector(program);
		VehicleSupplier vehicleSupplier = new ParallelVehicleSupplier(vehicles, problem);
		return getUsedVehicles(customerSelector, vehicleSupplier);
	}

}
