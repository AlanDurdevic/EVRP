package hr.fer.seminar.util.stohastic.distribution.impl;

import java.util.Random;

import hr.fer.seminar.util.stohastic.distribution.Distribution;

public class UniformDistribution implements Distribution{
	
	private final double variation;
	
	private final Random random = new Random();

	public UniformDistribution(double variation) {
		this.variation = variation;
	}

	@Override
	public double generate(double mean) {
		double diff = mean * variation;
		return random.nextInt((int)(mean - diff), (int)(mean + diff + 1));
	}

}
