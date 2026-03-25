package hr.fer.evrp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.LinkedList;
import java.util.List;
import java.util.Objects;

@Getter
public class Vehicle {

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
			System.out.println("Greška FC");
			throw new RuntimeException();
		}
		if (loadCapacityLeft < location.getDemand()) {
			System.out.println("Greška LC");
			throw new RuntimeException();
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
