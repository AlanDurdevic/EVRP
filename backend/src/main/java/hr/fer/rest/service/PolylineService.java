package hr.fer.rest.service;

import hr.fer.evrp.entities.Location;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PolylineService {

    private final OsrmClient osrmClient;
    private final CacheManager cacheManager;

    public PolylineService(OsrmClient osrmClient, CacheManager cacheManager) {
        this.osrmClient = osrmClient;
        this.cacheManager = cacheManager;
    }

    public List<double[]> fetchPolyline(Location from, Location to) {
        String key = buildCacheKey(from.getX(), from.getY(), to.getX(), to.getY());
        Cache cache = cacheManager.getCache("polylines");
        if (cache != null) {
            Cache.ValueWrapper wrapper = cache.get(key);
            if (wrapper != null) {
                @SuppressWarnings("unchecked")
                List<double[]> cached = (List<double[]>) wrapper.get();
                return cached;
            }
        }
        List<double[]> polyline = osrmClient.fetchPolyline(
                new double[]{from.getX(), from.getY()},
                new double[]{to.getX(), to.getY()}
        );
        if (cache != null) cache.put(key, polyline);
        return polyline;
    }

    private String buildCacheKey(double x1, double y1, double x2, double y2) {
        String a = x1 + "," + y1;
        String b = x2 + "," + y2;
        return a.compareTo(b) <= 0 ? a + "->" + b : b + "->" + a;
    }
}
