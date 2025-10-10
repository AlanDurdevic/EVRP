package hr.fer.seminar.util.stohastic.distribution.impl;

import hr.fer.seminar.util.stohastic.distribution.Distribution;

public class NoDistribution implements Distribution{

	@Override
	public double generate(double mean) {
		return mean;
	}

}
