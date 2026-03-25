package hr.fer.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LocationDTO {
    private String id;
    private double x;
    private double y;
}
