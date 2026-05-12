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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Primary;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

import static java.util.Objects.requireNonNull;

@Service
@Primary
public class EVRPService implements EVRPSolverService {

    private static final Logger log = LoggerFactory.getLogger(EVRPService.class);

    @Autowired
    private EvrpMapper evrpMapper;

    @Autowired
    private ProgramRepository programRepository;

    @Autowired
    private ProgramParserService programParserService;

    public SolveResponseDTO solveVRP(@NonNull SolveRequestDTO request) {
        List<CustomerDTO> customers = requireNonNull(request.getCustomers(), "Customers list must not be null");
        List<ChargingStationDTO> chargingStations =
                Optional.ofNullable(request.getChargingStations()).orElse(List.of());

        if (customers.isEmpty()) {
            throw new IllegalArgumentException("Customers list must not be empty");
        }

        List<ChargingStation> evrpChargingStations = evrpMapper.toEvrpChargingStationList(chargingStations);
        List<Customer> evrpCustomers = evrpMapper.toEvrpCustomerList(customers);

        evrpCustomers.forEach(customer ->
                customer.setNearestChargingStation(findNearestChargingStation(customer, evrpChargingStations)));

        StohasticEVRPProblem problem = new StohasticEVRPProblem(
                evrpMapper.toEvrpDepot(request.getDepot()),
                request.getProblemProperties().getVehicleFuelTankCapacity(),
                request.getProblemProperties().getVehicleLoadCapacity(),
                request.getProblemProperties().getFuelConsumptionRate(),
                request.getProblemProperties().getInverseRefuelingRate(),
                request.getProblemProperties().getAverageVelocity(),
                evrpCustomers,
                evrpChargingStations,
                // TODO: how to define this?
                new UniformDistribution(2),
                new UniformDistribution(2),
                new UniformDistribution(2));

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

        List<Vehicle> usedVehicles = gp.getUsedVehicles(genotype);

        List<List<Location>> domainRoutes =
                usedVehicles.stream().map(Vehicle::getRoute).toList();

        List<RouteDTO> routes = domainRoutes.stream()
                .map(evrpMapper::toLocationDtoList)
                .map(RouteDTO::new)
                .toList();

        return new SolveResponseDTO(routes);
    }

    /**
     * Finds the nearest charging station to the given customer.
     * Returns null if the chargingStations list is empty.
     */
    private ChargingStation findNearestChargingStation(Customer customer, List<ChargingStation> chargingStations) {
        return chargingStations.stream()
                .min(Comparator.comparingDouble(cs -> Location.distance(customer, cs)))
                .orElse(null);
    }
}
