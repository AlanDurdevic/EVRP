package hr.fer.rest.repository;

import hr.fer.rest.dto.OptimizationTarget;
import hr.fer.rest.dto.VehicleMethod;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Repository
public class ProgramRepository {

    private static final String PROGRAMS_PATH = "classpath:results-clean/programs/*";

    private final Map<String, String> programs = new HashMap<>();

    @PostConstruct
    public void load() throws IOException {
        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources(PROGRAMS_PATH);
        for (Resource resource : resources) {
            String name = resource.getFilename();
            String content = resource.getContentAsString(StandardCharsets.UTF_8).trim();
            programs.put(name, content);
            System.out.println("Loaded program: " + name);
        }
    }

    public String getProgram(OptimizationTarget target, VehicleMethod method) {
        String key = getProgramFileName(target, method);
        String program = programs.get(key);

        if (program == null) {
            throw new IllegalArgumentException("No program found for: " + key);
        }

        return program;
    }

	public String getProgramFileName(OptimizationTarget target, VehicleMethod method) {
		return target.getValue() + "-" + method.getValue() + "-program";
	}
}
