package hr.fer.seminar.operators;

import io.jenetics.engine.EvolutionInterceptor;
import io.jenetics.engine.EvolutionStart;
import io.jenetics.prog.ProgramGene;

public class InterceptorGP implements EvolutionInterceptor<ProgramGene<Double>, Double> {

	@Override
	public EvolutionStart<ProgramGene<Double>, Double> before(final EvolutionStart<ProgramGene<Double>, Double> start) {
		System.out.println(start.generation());
		return start;
	}

}