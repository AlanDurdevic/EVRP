package hr.fer.rest.dto;

import lombok.Getter;
import lombok.ToString;

import java.util.List;

@Getter
@ToString
public class SolveRequestDTO {
    private DepotDTO depot;
    private ProblemPropertiesDTO problemProperties;
    private List<CustomerDTO> customers;
    private List<ChargingStationDTO> chargingStations;
    private OptimizationTarget optimizationTarget;
    private VehicleMethod vehicleMethod;
}
