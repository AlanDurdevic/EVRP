package hr.fer.seminar.util.stohastic.distribution;

public interface Distribution {
	
	public abstract double generate(double value);
	
	public abstract double getCV();

}
