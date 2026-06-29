package hr.fer.rest.controller;

import hr.fer.rest.exception.RoutingServiceException;
import hr.fer.rest.exception.SolverTimeoutException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RoutingServiceException.class)
    public ResponseEntity<Map<String, String>> handleRoutingServiceException(RoutingServiceException ex) {
        return ResponseEntity.status(503).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(SolverTimeoutException.class)
    public ResponseEntity<Map<String, String>> handleSolverTimeoutException(SolverTimeoutException ex) {
        return ResponseEntity.status(422).body(Map.of("error", ex.getMessage()));
    }
}
