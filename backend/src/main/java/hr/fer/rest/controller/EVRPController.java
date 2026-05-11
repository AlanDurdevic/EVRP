package hr.fer.rest.controller;

import hr.fer.rest.dto.SolveRequestDTO;
import hr.fer.rest.dto.SolveResponseDTO;
import hr.fer.rest.service.EVRPService;
import hr.fer.rest.service.EVRPSolverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/evrp")
public class EVRPController {

    @Autowired
    private EVRPSolverService vrpService;

    @GetMapping
    public Map<String, Object> index() {
        return Map.of(
                "message", "Hello",
                "status", "ok");
    }

    @PostMapping(value = "/solve", produces = MediaType.APPLICATION_JSON_VALUE)
    public SolveResponseDTO solve(@RequestBody SolveRequestDTO request) {
        return vrpService.solveVRP(request);
    }
}
