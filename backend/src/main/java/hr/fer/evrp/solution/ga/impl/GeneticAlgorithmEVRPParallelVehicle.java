package hr.fer.evrp.solution.ga.impl;

import java.util.List;

import hr.fer.evrp.entities.EVRPProblem;
import hr.fer.evrp.entities.Vehicle;
import hr.fer.evrp.operators.cs.CustomerSelector;
import hr.fer.evrp.operators.cs.GACustomerSelector;
import hr.fer.evrp.operators.vs.ParallelVehicleSupplier;
import hr.fer.evrp.operators.vs.VehicleSupplier;
import hr.fer.evrp.solution.ga.GeneticAlgorithmEVRP;
import io.jenetics.EnumGene;
import io.jenetics.Genotype;
import io.jenetics.PermutationChromosome;

public class GeneticAlgorithmEVRPParallelVehicle extends GeneticAlgorithmEVRP{

	public GeneticAlgorithmEVRPParallelVehicle(EVRPProblem problem) {
		super(problem);
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<Vehicle> getUsedVehicles(Genotype<EnumGene<Integer>> gt) {
		PermutationChromosome<Integer> c = gt.chromosome().as(PermutationChromosome.class);
		List<Vehicle> vehicles = initializeVehicles(getLUNumberOfVehicles());
		CustomerSelector customerSelector = new GACustomerSelector(c, customerMap);
		VehicleSupplier vehicleSupplier = new ParallelVehicleSupplier(vehicles, problem);
		return getUsedVehicles(customerSelector, vehicleSupplier);
	}

}
