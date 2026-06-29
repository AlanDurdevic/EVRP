package hr.fer.rest.exception;

public class SolverTimeoutException extends RuntimeException {
    public SolverTimeoutException(String message) {
        super(message);
    }
}
