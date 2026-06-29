package hr.fer.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class RouteDTO {
    private List<LocationDTO> locations;
    private List<List<double[]>> polylines;
    private double totalDistanceMeters;
}
