package hr.fer.rest.dto;

import lombok.Getter;

import java.util.List;

@Getter
public class SolveRequestDTO {
    private DepotDTO depot;
    private ProblemPropertiesDTO problemProperties;
    private List<CustomerDTO> customers;
    private List<ChargingStationDTO> chargingStations;
}
