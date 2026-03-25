package hr.fer.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@AllArgsConstructor
@Getter
public final class SolveResponseDTO {
    private final List<RouteDTO> routes;
}
