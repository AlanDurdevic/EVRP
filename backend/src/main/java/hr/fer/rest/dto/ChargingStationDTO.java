package hr.fer.rest.dto;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class ChargingStationDTO {
    private String id;
    private double x;
    private double y;
    private double dueDate;
}
