package hr.fer.seminar.util.stohastic.distribution.impl;

import java.util.Random;

import hr.fer.seminar.util.stohastic.distribution.Distribution;

public class GaussianDistribution implements Distribution{
	
	private final double stddev;
	
	private final Random random = new Random();

	public GaussianDistribution(double stddev) {
		this.stddev = stddev;
	}

	@Override
	public double generate(double mean) {
		return random.nextGaussian(mean, stddev);
	}

}
