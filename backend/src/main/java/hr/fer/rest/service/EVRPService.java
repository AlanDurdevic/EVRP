package hr.fer.rest.service;

import hr.fer.evrp.entities.*;
import hr.fer.evrp.solution.gp.GeneticProgrammingStohasticEVRP;
import hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPParallelBVehicle;
import hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPParallelVehicle;
import hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPSemiParallelBVehicle;
import hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPSemiParallelVehicle;
import hr.fer.evrp.solution.gp.impl.GeneticProgrammingStohasticEVRPSerialVehicle;
import hr.fer.evrp.util.stohastic.distribution.impl.UniformDistribution;
import hr.fer.rest.dto.*;
import hr.fer.rest.mapper.EvrpMapper;
import hr.fer.rest.repository.ProgramRepository;
import io.jenetics.Genotype;
import io.jenetics.prog.ProgramGene;
import lombok.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import hr.fer.rest.exception.SolverTimeoutException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static java.util.Objects.requireNonNull;

@Service
@Primary
public class EVRPService implements EVRPSolverService {

    private static final Logger log = LoggerFactory.getLogger(EVRPService.class);
    private static final int SOLVER_TIMEOUT_SECONDS = 5;

    private final EvrpMapper evrpMapper;

    private final ProgramRepository programRepository;

    private final ProgramParserService programParserService;

    private final DistanceMatrixService distanceMatrixService;

    private final PolylineService polylineService;

	public EVRPService(DistanceMatrixService distanceMatrixService, PolylineService polylineService, EvrpMapper evrpMapper, ProgramRepository programRepository, ProgramParserService programParserService) {
		this.distanceMatrixService = distanceMatrixService;
		this.polylineService = polylineService;
		this.evrpMapper = evrpMapper;
		this.programRepository = programRepository;
		this.programParserService = programParserService;
	}

	public SolveResponseDTO solveVRP(@NonNull SolveRequestDTO request) {
        List<CustomerDTO> customers = requireNonNull(request.getCustomers(), "Customers list must not be null");
        List<ChargingStationDTO> chargingStations =
                Optional.ofNullable(request.getChargingStations()).orElse(List.of());

        if (customers.isEmpty()) {
            throw new IllegalArgumentException("Customers list must not be empty");
        }

        Depot depot = evrpMapper.toEvrpDepot(request.getDepot());
        List<ChargingStation> evrpChargingStations = evrpMapper.toEvrpChargingStationList(chargingStations);
        List<Customer> evrpCustomers = evrpMapper.toEvrpCustomerList(customers);

        // build coordinate list: depot=0, customers=1..N, charging stations=N+1..N+M
        List<double[]> coordinates = new ArrayList<>();
        coordinates.add(new double[]{depot.getX(), depot.getY()});
        for (Customer c : evrpCustomers) {
            coordinates.add(new double[]{c.getX(), c.getY()});
        }
        for (ChargingStation cs : evrpChargingStations) {
            coordinates.add(new double[]{cs.getX(), cs.getY()});
        }

        // fetch real road distance matrix from OSRM — throws RoutingServiceException if unreachable
        long t0 = System.currentTimeMillis();
        double[][] distanceMatrix = distanceMatrixService.buildMatrix(coordinates);
        log.info("OSRM /table took {}ms", System.currentTimeMillis() - t0);

        // build location index matching coordinate order
        Map<Location, Integer> locationIndex = new HashMap<>();
        locationIndex.put(depot, 0);
        for (int i = 0; i < evrpCustomers.size(); i++) {
            locationIndex.put(evrpCustomers.get(i), i + 1);
        }
        for (int i = 0; i < evrpChargingStations.size(); i++) {
            locationIndex.put(evrpChargingStations.get(i), evrpCustomers.size() + 1 + i);
        }

        evrpCustomers.forEach(customer ->
                customer.setNearestChargingStation(findNearestChargingStation(customer, evrpChargingStations, distanceMatrix, locationIndex)));

        StohasticEVRPProblem problem = new StohasticEVRPProblem(
                depot,
                request.getProblemProperties().getVehicleFuelTankCapacity(),
                request.getProblemProperties().getVehicleLoadCapacity(),
                request.getProblemProperties().getFuelConsumptionRate(),
                request.getProblemProperties().getInverseRefuelingRate(),
                request.getProblemProperties().getAverageVelocity(),
                evrpCustomers,
                evrpChargingStations,
                distanceMatrix,
                locationIndex,
                // CV 0.2 matches the mid-range used in the thesis experiments (0.1–0.3)
                new UniformDistribution(0.2),
                new UniformDistribution(0.2),
                new UniformDistribution(0.2));

        GeneticProgrammingStohasticEVRP gp = switch (request.getVehicleMethod()) {
            case SERIAL -> new GeneticProgrammingStohasticEVRPSerialVehicle(problem);
            case PARALLEL -> new GeneticProgrammingStohasticEVRPParallelVehicle(problem);
            case PARALLEL_B -> new GeneticProgrammingStohasticEVRPParallelBVehicle(problem);
            case SEMI_PARALLEL -> new GeneticProgrammingStohasticEVRPSemiParallelVehicle(problem);
            case SEMI_PARALLEL_B -> new GeneticProgrammingStohasticEVRPSemiParallelBVehicle(problem);
        };

        String programText = programRepository.getProgram(request.getOptimizationTarget(), request.getVehicleMethod());
		String programFileName = programRepository.getProgramFileName(request.getOptimizationTarget(), request.getVehicleMethod());
        log.info("Solver: {} | Program: {}", gp.getClass().getSimpleName(), programFileName);
        Genotype<ProgramGene<Double>> genotype = programParserService.parse(programText);

        @SuppressWarnings("resource")
        ExecutorService executor = Executors.newSingleThreadExecutor();
        Future<List<Vehicle>> future = executor.submit(() -> gp.getUsedVehicles(genotype));
        executor.shutdown();

        long t1 = System.currentTimeMillis();
        List<Vehicle> usedVehicles;
        try {
            usedVehicles = future.get(SOLVER_TIMEOUT_SECONDS, TimeUnit.SECONDS);
            log.info("Solver took {}ms", System.currentTimeMillis() - t1);
        } catch (TimeoutException e) {
            future.cancel(true);
            executor.shutdownNow();
            throw new SolverTimeoutException("Solver did not find a solution within " + SOLVER_TIMEOUT_SECONDS + " seconds - check problem parameters");
        } catch (ExecutionException e) {
            if (e.getCause() instanceof SolverTimeoutException ste) throw ste;
            if (e.getCause() instanceof RuntimeException re) throw re;
            throw new RuntimeException(e.getCause());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new SolverTimeoutException("Solver was interrupted");
        }

        List<RouteDTO> routes = usedVehicles.stream()
                .map(vehicle -> {
                    List<Location> route = vehicle.getRoute();
                    List<LocationDTO> locations = evrpMapper.toLocationDtoList(route);
                    List<List<double[]>> polylines = new ArrayList<>();
                    double totalDistance = 0;
                    for (int i = 0; i < route.size() - 1; i++) {
                        polylines.add(polylineService.fetchPolyline(route.get(i), route.get(i + 1)));
                        Integer from = locationIndex.get(route.get(i));
                        Integer to = locationIndex.get(route.get(i + 1));
                        if (from != null && to != null) {
                            totalDistance += distanceMatrix[from][to];
                        }
                    }
                    return new RouteDTO(locations, polylines, totalDistance);
                })
                .toList();

        return new SolveResponseDTO(routes);
    }

    private ChargingStation findNearestChargingStation(Customer customer, List<ChargingStation> chargingStations,
            double[][] distanceMatrix, Map<Location, Integer> locationIndex) {
        return chargingStations.stream()
                .min(Comparator.comparingDouble(cs -> distanceMatrix[locationIndex.get(customer)][locationIndex.get(cs)]))
                .orElse(null);
    }
}
