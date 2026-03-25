package hr.fer.evrp.entities;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Getter
@AllArgsConstructor
public abstract class Location {

    private final String id;

    private final double x;

    private final double y;

    private final double demand;

    private final double readyTime;

    private final double dueDate;

    private final double serviceTime;

    private final Map<Customer, Double> customerDistances = new HashMap<>();

    public abstract ChargingStation getNearestChargingStation();

    public void addCustomerDistance(Customer customer, double distance) {
        customerDistances.put(customer, distance);
    }

    @Override
    public String toString() {
        return "Location [id=" + id + ", x=" + x + ", y=" + y + ", demand=" + demand + ", readyTime=" + readyTime
                + ", dueDate=" + dueDate + ", serviceTime=" + serviceTime + "]";
    }

    public static double distance(Location location1, Location location2) {
        return Math.sqrt(Math.pow(location1.x - location2.x, 2) + Math.pow(location1.y - location2.y, 2));
    }

    @Override
    public int hashCode() {
        return Objects.hash(x, y);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null) return false;
        if (getClass() != obj.getClass()) return false;
        Location other = (Location) obj;
        return Double.doubleToLongBits(x) == Double.doubleToLongBits(other.x)
                && Double.doubleToLongBits(y) == Double.doubleToLongBits(other.y);
    }
}
