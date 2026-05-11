package hr.fer.rest.service;

import hr.fer.rest.dto.SolveRequestDTO;
import hr.fer.rest.dto.SolveResponseDTO;
import lombok.NonNull;

public interface EVRPSolverService {
    SolveResponseDTO solveVRP(@NonNull SolveRequestDTO request);
}
