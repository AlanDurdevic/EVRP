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
import hr.fer.seminar.entities.Vehicle;
import hr.fer.seminar.operators.cs.CustomerSelector;
import hr.fer.seminar.operators.cs.NNCustomerSelector;
import hr.fer.seminar.operators.vs.SerialVehicleSupplier;
import hr.fer.seminar.operators.vs.VehicleSupplier;
import hr.fer.seminar.solution.NNStohasticSolutionEVRP;
import hr.fer.seminar.util.stohastic.distribution.Distribution;
import hr.fer.seminar.util.stohastic.distribution.impl.GaussianDistribution;
import hr.fer.seminar.util.stohastic.distribution.impl.NoDistribution;

public class NNStohasticMultiple {
	
	private static final Distribution demandDistribution = new GaussianDistribution(0.2);
	
	private static final Distribution serviceTimeDistribution = new GaussianDistribution(0.2);
	
	private static final Distribution velocityDistribution = new GaussianDistribution(0.2);
	
	private static final String trainFolder = "./data/stohastic/train";
	
	private static final String testFolder = "./data/stohastic/test";
	
	private static final int numberOfClonesTrain = 2;
	
	private static final int numberOfClonesTest = 5;
		
	public static void main(String[] args) {
		
		File folder = new File(trainFolder);
		File[] listFiles = folder.listFiles();
		List<String> trainFileNames = new LinkedList<>();
		for(File file : listFiles) {
			for(int i = 0; i < numberOfClonesTrain; i++) {
				trainFileNames.add(trainFolder + "/" + file.getName());
			}
		}
		CustomerSelector cs = new NNCustomerSelector();
		int vehiclesNumber = 0;
		for(String filename : trainFileNames) {
			StohasticEVRPProblem problem = generateProblem(filename);
			List<Vehicle> vehicles = initializeVehicles(problem);
			VehicleSupplier vs = new SerialVehicleSupplier(vehicles);
			NNStohasticSolutionEVRP<?> solution = new NNStohasticSolutionEVRP<>(problem, cs, vs);
			vehiclesNumber += solution.getUsedVehicles().size();
		}
		System.out.println("Number of vehicles train: " + vehiclesNumber);
		
		
		folder = new File(testFolder);
		listFiles = folder.listFiles();
		List<String> testFileNames = new LinkedList<>();
		for(File file : listFiles) {
			for(int i = 0; i < numberOfClonesTest; i++) {
				testFileNames.add(testFolder + "/" + file.getName());
			}
		}
		vehiclesNumber = 0;
		for(String filename : testFileNames) {
			StohasticEVRPProblem problem = generateProblemTest(filename);
			List<Vehicle> vehicles = initializeVehicles(problem);
			VehicleSupplier vs = new SerialVehicleSupplier(vehicles);
			NNStohasticSolutionEVRP<?> solution = new NNStohasticSolutionEVRP<>(problem, cs, vs);
			vehiclesNumber += solution.getUsedVehicles().size();
		}
		System.out.println("Number of vehicles test: " + vehiclesNumber);
	
		
		
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
	
	private static int getLUNumberOfVehicles(StohasticEVRPProblem problem) {
		double sum = 0;
		for (Customer customer : problem.getCustomers()) {
			sum += customer.getDemand();
		}
		return (int) (sum / problem.getVehicleLoadCapacity()) + 1;
	}
	
	private static List<Vehicle> initializeVehicles(StohasticEVRPProblem problem) {
		int LB = getLUNumberOfVehicles(problem);
		List<Vehicle> V = new ArrayList<>();
		Depot startingLocation = problem.getDepot();
		double fuelCapacity = problem.getVehicleFuelTankCapacity();
		double loadCapacity = problem.getVehicleLoadCapacity();
		for (int i = 0; i < LB; i++) {
			Vehicle newVehicle = new Vehicle(i, fuelCapacity, loadCapacity, startingLocation);
			V.add(newVehicle);
		}
		return V;
	}
	
	private static StohasticEVRPProblem generateProblemTest(String filename) {
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
				inverseRefuelingRate, averageVelocity, customers, chargingStations, new NoDistribution(), new NoDistribution(), new NoDistribution());
	}

}
