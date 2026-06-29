package hr.fer.rest.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class OsrmClientIntegrationTest {

    // Three Zagreb locations: Ban Jelačić Square, Zagreb Central Station, Maksimir Park
    private static final List<double[]> COORDS = List.of(
            new double[]{15.9782, 45.8131}, // lon, lat — Ban Jelačić Square
            new double[]{15.9789, 45.8044}, // Zagreb Central Station
            new double[]{16.0175, 45.8136}  // Maksimir Park
    );

    @Autowired
    OsrmClient osrmClient;

    @Test
    void fetchDistanceMatrix_returnsSquareMatrix() {
        double[][] matrix = osrmClient.fetchDistanceMatrix(COORDS);

        assertThat(matrix.length).isEqualTo(3);
        for (double[] row : matrix) {
            assertThat(row.length).isEqualTo(3);
        }
    }

    @Test
    void fetchDistanceMatrix_diagonalIsZero() {
        double[][] matrix = osrmClient.fetchDistanceMatrix(COORDS);

        for (int i = 0; i < matrix.length; i++) {
            assertThat(matrix[i][i]).isEqualTo(0.0);
        }
    }

    @Test
    void fetchDistanceMatrix_distancesArePositive() {
        double[][] matrix = osrmClient.fetchDistanceMatrix(COORDS);

        for (int i = 0; i < matrix.length; i++) {
            for (int j = 0; j < matrix.length; j++) {
                if (i != j) {
                    assertThat(matrix[i][j]).isGreaterThan(0.0);
                }
            }
        }
    }

    @Test
    void fetchPolyline_returnsLatLngPoints() {
        double[] from = COORDS.get(0);
        double[] to = COORDS.get(1);

        List<double[]> polyline = osrmClient.fetchPolyline(from, to);

        assertThat(polyline).isNotNull().isNotEmpty();
        // each point is [lat, lng]
        for (double[] point : polyline) {
            assertThat(point).hasSize(2);
            assertThat(point[0]).isBetween(45.0, 46.5); // lat range for Zagreb
            assertThat(point[1]).isBetween(15.5, 16.5); // lng range for Zagreb
        }
    }
}
