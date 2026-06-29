package hr.fer.evrp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Getter
public class Vehicle {

	private static final Logger log = LoggerFactory.getLogger(Vehicle.class);

	@Getter
	@AllArgsConstructor
    public class State {

		private final double currentTime;

		private final double currentFuelCapacity;

		private final double currentLoadCapacity;

        @Override
		public String toString() {
			return "CT=" + currentTime + ", CFC=" + currentFuelCapacity + ", CLC=" + currentLoadCapacity;
		}

	}

	private final int id;

	private double fuelCapacityLeft;

	private double loadCapacityLeft;

	private double currentTime;

	private final List<Location> route = new LinkedList<>();

	private final List<State> state = new LinkedList<>();

	public Vehicle(int id, double fuelCapacityLeft, double loadCapacityLeft, Depot depot) {
		this.id = id;
		this.fuelCapacityLeft = fuelCapacityLeft;
		this.loadCapacityLeft = loadCapacityLeft;
		currentTime = 0;
		addLocation(depot);
	}

    public void setFuelCapacity(double fuelCapacity) {
		this.fuelCapacityLeft = fuelCapacity;
	}

	public void subtractFuelCapacity(double fuelCapacity) {
		this.fuelCapacityLeft -= fuelCapacity;
	}

    public void subtractLoadCapacity(double loadCapacity) {
		this.loadCapacityLeft -= loadCapacity;
	}

    public void addTime(double time) {
		currentTime += time;
	}

	public Location getCurrentLocation() {
		return route.getLast();
	}

	public void addLocation(Location location) {
//		if (currentTime > location.getDueDate()) {
//			System.out.println("Greška CT " + location.getId() + " current time: " + currentTime + " due time: " + location.getDueDate());
//		}
		if (fuelCapacityLeft < 0) {
			log.error("V{} fuel went negative ({:.2f}) while adding location {}", id, fuelCapacityLeft, location.getId());
			throw new RuntimeException("Vehicle " + id + " fuel negative: " + fuelCapacityLeft);
		}
		if (loadCapacityLeft < location.getDemand()) {
			log.error("V{} load capacity exceeded at {} (left={:.2f}, demand={:.2f})", id, location.getId(), loadCapacityLeft, location.getDemand());
			throw new RuntimeException("Vehicle " + id + " load exceeded at " + location.getId());
		}
		route.add(location);
		state.add(new State(currentTime, fuelCapacityLeft, loadCapacityLeft));
	}

    @Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object obj) {
		if (this == obj)
			return true;
		if (obj == null)
			return false;
		if (getClass() != obj.getClass())
			return false;
		Vehicle other = (Vehicle) obj;
		return id == other.id;
	}

}
