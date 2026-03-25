package hr.fer.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@AllArgsConstructor
public class RouteDTO {
    private List<LocationDTO> locations;
}
