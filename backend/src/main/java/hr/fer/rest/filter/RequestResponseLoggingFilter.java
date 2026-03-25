package hr.fer.rest.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.jspecify.annotations.NonNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class RequestResponseLoggingFilter extends OncePerRequestFilter {
    private static final Logger httpLogger = LoggerFactory.getLogger("hr.fer.evrp.logging");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request, @NonNull HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String query = request.getQueryString();

        httpLogger.info("Incoming: {} {}{}", method, uri, query != null ? "?" + query : "");

        filterChain.doFilter(request, response);

        int status = response.getStatus();
        httpLogger.info("Outgoing: HTTP {}", status);
    }
}
