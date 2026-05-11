package hr.fer.rest.dto;

import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class CustomerDTO {
    private String id;
    private double x;
    private double y;
    private double demand;
    private double readyTime;
    private double dueDate;
    private double serviceTime;
}
