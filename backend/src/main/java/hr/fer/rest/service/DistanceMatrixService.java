package hr.fer.rest.service;

import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DistanceMatrixService {

    private final OsrmClient osrmClient;
    private final CacheManager cacheManager;

    public DistanceMatrixService(OsrmClient osrmClient, CacheManager cacheManager) {
        this.osrmClient = osrmClient;
        this.cacheManager = cacheManager;
    }

    public double[][] buildMatrix(List<double[]> coordinates) {
        String cacheKey = buildCacheKey(coordinates);
        Cache cache = cacheManager.getCache("distanceMatrix");
        if (cache != null) {
            double[][] cached = cache.get(cacheKey, double[][].class);
            if (cached != null) return cached;
        }
        double[][] matrix = osrmClient.fetchDistanceMatrix(coordinates);
        if (cache != null) cache.put(cacheKey, matrix);
        return matrix;
    }

    private String buildCacheKey(List<double[]> coordinates) {
        return coordinates.stream()
                .map(c -> c[0] + "," + c[1])
                .collect(Collectors.joining(";"));
    }
}
