package hr.fer.rest.service;

import hr.fer.rest.dto.SolveRequestDTO;
import hr.fer.rest.dto.SolveResponseDTO;
import lombok.NonNull;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EVRPServiceMock implements EVRPSolverService {
    @Override
    public SolveResponseDTO solveVRP(@NonNull SolveRequestDTO request) {
        System.out.println(request);

        return new SolveResponseDTO(List.of());
    }
}
