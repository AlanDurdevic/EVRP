package hr.fer.evrp.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@ControllerAdvice
public class SimpleErrorController {
    private static final Logger log = LoggerFactory.getLogger(SimpleErrorController.class);

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoHandlerFoundException ex) {
        log.warn("404 Not Found: {} {}", ex.getHttpMethod(), ex.getRequestURL());

        Map<String, Object> body = Map.of(
                "timestamp",
                LocalDateTime.now(),
                "status",
                HttpStatus.NOT_FOUND.value(),
                "error",
                "Not Found",
                "message",
                "The requested resource was not found");
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleBadRequest(IllegalArgumentException ex) {
        log.warn("Bad request: {}", ex.getMessage());

        Map<String, Object> body = Map.of(
                "timestamp", LocalDateTime.now(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", "Bad Request",
                "message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleException(Exception ex) {
        log.error("Internal Server Error: {}", ex.getMessage(), ex);

        Map<String, Object> body = Map.of(
                "timestamp",
                LocalDateTime.now(),
                "status",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "error",
                "Internal Server Error",
                "message",
                ex.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body);
    }
}
