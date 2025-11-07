package hr.fer.seminar;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.LinkedList;
import java.util.List;

import hr.fer.seminar.entities.ChargingStation;
import hr.fer.seminar.entities.Customer;
import hr.fer.seminar.entities.Depot;
import hr.fer.seminar.entities.Location;
import hr.fer.seminar.entities.StohasticEVRPProblem;
import hr.fer.seminar.solution.gp.GeneticProgrammingStohasticEVRP;
import hr.fer.seminar.solution.gp.impl.GeneticProgrammingStohasticEVRPMultiple;
import hr.fer.seminar.solution.gp.impl.GeneticProgrammingStohasticEVRPSerialVehicle;
import hr.fer.seminar.util.stohastic.distribution.Distribution;
import hr.fer.seminar.util.stohastic.distribution.impl.GaussianDistribution;
import io.jenetics.Genotype;
import io.jenetics.ext.util.TreeNode;
import io.jenetics.prog.ProgramGene;
import io.jenetics.prog.op.Op;

public class StohasticPipeline {
	
	private static final Distribution demandDistribution = new GaussianDistribution(0.2);
	
	private static final Distribution serviceTimeDistribution = new GaussianDistribution(0.2);
	
	private static final Distribution velocityDistribution = new GaussianDistribution(0.2);
	
	private static final String trainFolder = "./data/stohastic/train";
	
	private static final int numberOfClones = 2;
		
	public static void main(String[] args) {
		
		File folder = new File(trainFolder);
		File[] listFiles = folder.listFiles();
		List<String> testFileNames = new LinkedList<>();
		for(File file : listFiles) {
			for(int i = 0; i < numberOfClones; i++) {
				testFileNames.add(trainFolder + "/" + file.getName());
			}
		}
		
		List<GeneticProgrammingStohasticEVRP> testProblems = new LinkedList<>();
		for(String filename : testFileNames) {
			testProblems.add(new GeneticProgrammingStohasticEVRPSerialVehicle(generateProblem(filename)));
		}
	
		GeneticProgrammingStohasticEVRPMultiple gp = new GeneticProgrammingStohasticEVRPMultiple(testProblems);
		final Genotype<ProgramGene<Double>> programDynamic = gp.calculate();
		final TreeNode<Op<Double>> treeDynamic = programDynamic.gene().toTreeNode();
		System.out.println("Program: " + treeDynamic);
		System.out.println("Tree depth: " + programDynamic.gene().depth());
		System.out.println("Error: " + gp.error(programDynamic));
		
		
	}
	
	private static StohasticEVRPProblem generateProblem(String filename) {

		Depot depot = null;
		double dueDate = 0, vehicleFuelTankCapacity = 0, vehicleLoadCapacity = 0, fuelConsumptionRate = 0,
				inverseRefuelingRate = 0, averageVelocity = 0;
		List<Customer> customers = new ArrayList<>();
		List<ChargingStation> chargingStations = new ArrayList<>();

		try (BufferedReader br = Files.newBufferedReader(Paths.get(filename))) {
			br.readLine();
			while (true) {
				String line = br.readLine();
				if (line.isBlank()) {
					break;
				}

				String[] splittedLine = line.split("\\s+");
				char locationTag = splittedLine[0].charAt(0);
				switch (locationTag) {
				case 'D' -> {
					String id = splittedLine[0];
					double x = Double.parseDouble(splittedLine[2]);
					double y = Double.parseDouble(splittedLine[3]);
					dueDate = Double.parseDouble(splittedLine[6]);
					depot = new Depot(id, x, y, dueDate);
				}
				case 'S' -> {
					String id = splittedLine[0];
					double x = Double.parseDouble(splittedLine[2]);
					double y = Double.parseDouble(splittedLine[3]);
					ChargingStation newChargingStation = new ChargingStation(id, x, y, dueDate);
					chargingStations.add(newChargingStation);
				}
				case 'C' -> {
					String id = splittedLine[0];
					double x = Double.parseDouble(splittedLine[2]);
					double y = Double.parseDouble(splittedLine[3]);
					double demand = Double.parseDouble(splittedLine[4]);
					double readyTime = Double.parseDouble(splittedLine[5]);
					double dueDateCustomer = Double.parseDouble(splittedLine[6]);
					double serviceTime = Double.parseDouble(splittedLine[7]);
					Customer newCustomer = new Customer(id, x, y, demand, readyTime, dueDateCustomer, serviceTime);
					customers.add(newCustomer);
				}
				}
			}

			String line = br.readLine();
			line = line.substring(line.indexOf('/') + 1, line.length() - 1);
			vehicleFuelTankCapacity = Double.parseDouble(line);

			line = br.readLine();
			line = line.substring(line.indexOf('/') + 1, line.length() - 1);
			vehicleLoadCapacity = Double.parseDouble(line);

			line = br.readLine();
			line = line.substring(line.indexOf('/') + 1, line.length() - 1);
			fuelConsumptionRate = Double.parseDouble(line);

			line = br.readLine();
			line = line.substring(line.indexOf('/') + 1, line.length() - 1);
			inverseRefuelingRate = Double.parseDouble(line);

			line = br.readLine();
			line = line.substring(line.indexOf('/') + 1, line.length() - 1);
			averageVelocity = Double.parseDouble(line);

		} catch (IOException e) {
			System.err.println("Error while opening file: " + filename);
			System.exit(2);
		}

		for (Customer customer : customers) {
			ChargingStation nearestChargingStation = null;
			double nearestDistance = Double.MAX_VALUE;
			for (ChargingStation chargingStation : chargingStations) {
				double newDistance = Location.distance(customer, chargingStation);
				if (newDistance < nearestDistance) {
					nearestChargingStation = chargingStation;
					nearestDistance = newDistance;
				}
			}
			customer.setNearestChargingStation(nearestChargingStation);
		}

		return new StohasticEVRPProblem(depot, dueDate, vehicleFuelTankCapacity, vehicleLoadCapacity, fuelConsumptionRate,
				inverseRefuelingRate, averageVelocity, customers, chargingStations, demandDistribution, serviceTimeDistribution, velocityDistribution);
	}

}
