package hr.fer.rest.service;

import hr.fer.rest.dto.SolveRequestDTO;
import hr.fer.rest.dto.SolveResponseDTO;
import hr.fer.rest.repository.ProgramRepository;
import io.jenetics.Genotype;
import io.jenetics.prog.ProgramGene;
import lombok.NonNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EVRPServiceMock implements EVRPSolverService {

    @Autowired
    private ProgramParserService programParserService;

    @Autowired
    private ProgramRepository programRepository;

    @Override
    public SolveResponseDTO solveVRP(@NonNull SolveRequestDTO request) {
        String programText = programRepository.getProgram(request.getOptimizationTarget(), request.getVehicleMethod());
        Genotype<ProgramGene<Double>> genotype = programParserService.parse(programText);

		System.out.println(programParserService.toTreeString(genotype));

        return new SolveResponseDTO(List.of());
    }
}
