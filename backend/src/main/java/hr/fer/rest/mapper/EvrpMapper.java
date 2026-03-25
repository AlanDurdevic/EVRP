package hr.fer.rest.mapper;

import hr.fer.evrp.entities.ChargingStation;
import hr.fer.evrp.entities.Customer;
import hr.fer.evrp.entities.Depot;
import hr.fer.evrp.entities.Location;
import hr.fer.rest.dto.ChargingStationDTO;
import hr.fer.rest.dto.CustomerDTO;
import hr.fer.rest.dto.DepotDTO;
import hr.fer.rest.dto.LocationDTO;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class EvrpMapper {
    public Depot toEvrpDepot(DepotDTO dto) {
        return new Depot("depot", dto.getX(), dto.getY(), Double.MAX_VALUE);
    }

    public Customer toEvrpCustomer(CustomerDTO dto) {
        return new Customer(
                dto.getId(),
                dto.getX(),
                dto.getY(),
                dto.getDemand(),
                dto.getReadyTime(),
                dto.getDueDate(),
                dto.getServiceTime());
    }

    public List<Customer> toEvrpCustomerList(List<CustomerDTO> dtos) {
        return mapList(dtos, this::toEvrpCustomer);
    }

    public ChargingStation toEvrpChargingStation(ChargingStationDTO dto) {
        return new ChargingStation(
                dto.getId(),
                dto.getX(),
                dto.getY(),
                dto.getDueDate()
        );
    }

    public List<ChargingStation> toEvrpChargingStationList(List<ChargingStationDTO> dtos) {
        return mapList(dtos, this::toEvrpChargingStation);
    }

    public LocationDTO toLocationDto(Location location) {
        return new LocationDTO(
                location.getId(),
                location.getX(),
                location.getY()
        );
    }

    public List<LocationDTO> toLocationDtoList(List<Location> locations) {
        return mapList(locations, this::toLocationDto);
    }

    private <T, R> List<R> mapList(List<T> source, Function<T, R> mapperFunction) {
        return source.stream().map(mapperFunction) .collect(Collectors.toList());
    }
}
