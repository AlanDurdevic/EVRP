package hr.fer.evrp.util.stohastic.distribution;

public interface Distribution {
	
	double generate(double value);
	
	double getCV();
	
	void setSeed(long seed);
	
	Distribution copy();

}
