package hr.fer.rest.service;

import hr.fer.rest.exception.RoutingServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OsrmClient {

    private final RestClient restClient;
    private final String baseUrl;

    public OsrmClient(@Value("${osrm.base-url}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restClient = RestClient.builder()
                .defaultHeader("Accept-Encoding", "identity")
                .build();
    }

    public double[][] fetchDistanceMatrix(List<double[]> coordinates) {
        String coords = buildCoordString(coordinates);
        URI uri = URI.create(baseUrl + "/table/v1/driving/" + coords + "?annotations=distance");
        try {
            TableResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(TableResponse.class);
            if (response == null || !"Ok".equals(response.code()) || response.distances() == null) {
                throw new RoutingServiceException("OSRM table request returned unexpected response");
            }
            return response.distances();
        } catch (RestClientException e) {
            throw new RoutingServiceException("OSRM routing service is unreachable", e);
        }
    }

    public List<double[]> fetchPolyline(double[] from, double[] to) {
        String coords = from[0] + "," + from[1] + ";" + to[0] + "," + to[1];
        URI uri = URI.create(baseUrl + "/route/v1/driving/" + coords + "?overview=full&geometries=polyline");
        try {
            RouteResponse response = restClient.get()
                    .uri(uri)
                    .retrieve()
                    .body(RouteResponse.class);
            if (response == null || !"Ok".equals(response.code())
                    || response.routes() == null || response.routes().isEmpty()) {
                return null;
            }
            return decodePolyline(response.routes().getFirst().geometry());
        } catch (RestClientException e) {
            return null;
        }
    }

    private String buildCoordString(List<double[]> coordinates) {
        return coordinates.stream()
                .map(c -> c[0] + "," + c[1])
                .collect(Collectors.joining(";"));
    }

    private List<double[]> decodePolyline(String encoded) {
        List<double[]> points = new ArrayList<>();
        int index = 0, len = encoded.length();
        int lat = 0, lng = 0;
        while (index < len) {
            int b, shift = 0, result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lat += ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            shift = 0;
            result = 0;
            do {
                b = encoded.charAt(index++) - 63;
                result |= (b & 0x1f) << shift;
                shift += 5;
            } while (b >= 0x20);
            lng += ((result & 1) != 0 ? ~(result >> 1) : (result >> 1));
            points.add(new double[]{lat / 1e5, lng / 1e5});
        }
        return points;
    }

    record TableResponse(String code, double[][] distances) {}

    record RouteResponse(String code, List<Route> routes) {}

    record Route(String geometry) {}
}
