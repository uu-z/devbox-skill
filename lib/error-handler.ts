/**
 * Error Handler Module
 * Centralized error handling with structured logging
 */

import pino from 'pino';

// Configure logger
export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  } : undefined,
});

// Error types
export enum ErrorType {
  CONTAINER_ERROR = 'CONTAINER_ERROR',
  SESSION_ERROR = 'SESSION_ERROR',
  ROUTING_ERROR = 'ROUTING_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// Custom error class
export class DevboxError extends Error {
  constructor(
    public type: ErrorType,
    message: string,
    public details?: any,
    public recoverable: boolean = true
  ) {
    super(message);
    this.name = 'DevboxError';
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler
export class ErrorHandler {
  private retryAttempts = new Map<string, number>();
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // ms

  /**
   * Handle error with logging and recovery
   */
  async handleError(error: Error | DevboxError, context?: any): Promise<void> {
    const isDevboxError = error instanceof DevboxError;
    const errorType = isDevboxError ? error.type : ErrorType.UNKNOWN_ERROR;
    const recoverable = isDevboxError ? error.recoverable : false;

    // Log error
    logger.error({
      type: errorType,
      message: error.message,
      stack: error.stack,
      context,
      recoverable,
      details: isDevboxError ? error.details : undefined,
    }, 'Error occurred');

    // Attempt recovery if possible
    if (recoverable && context?.operationId) {
      await this.attemptRecovery(context.operationId, error, context);
    }
  }

  /**
   * Attempt to recover from error
   */
  private async attemptRecovery(
    operationId: string,
    error: Error,
    context: any
  ): Promise<boolean> {
    const attempts = this.retryAttempts.get(operationId) || 0;

    if (attempts >= this.maxRetries) {
      logger.error({
        operationId,
        attempts,
        maxRetries: this.maxRetries,
      }, 'Max retry attempts reached');
      this.retryAttempts.delete(operationId);
      return false;
    }

    this.retryAttempts.set(operationId, attempts + 1);

    logger.info({
      operationId,
      attempt: attempts + 1,
      maxRetries: this.maxRetries,
      delay: this.retryDelay,
    }, 'Attempting recovery');

    // Wait before retry
    await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempts + 1)));

    return true;
  }

  /**
   * Wrap async operation with error handling
   */
  async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: {
      operationId: string;
      operationName: string;
      metadata?: any;
    }
  ): Promise<T | null> {
    try {
      logger.debug({
        operationId: context.operationId,
        operationName: context.operationName,
      }, 'Starting operation');

      const result = await operation();

      logger.debug({
        operationId: context.operationId,
        operationName: context.operationName,
      }, 'Operation completed successfully');

      // Clear retry counter on success
      this.retryAttempts.delete(context.operationId);

      return result;
    } catch (error) {
      await this.handleError(error as Error, context);

      // Retry if recoverable
      if (error instanceof DevboxError && error.recoverable) {
        const shouldRetry = await this.attemptRecovery(
          context.operationId,
          error,
          context
        );

        if (shouldRetry) {
          return this.withErrorHandling(operation, context);
        }
      }

      return null;
    }
  }

  /**
   * Create container-specific error
   */
  static containerError(message: string, details?: any): DevboxError {
    return new DevboxError(ErrorType.CONTAINER_ERROR, message, details, true);
  }

  /**
   * Create session-specific error
   */
  static sessionError(message: string, details?: any): DevboxError {
    return new DevboxError(ErrorType.SESSION_ERROR, message, details, true);
  }

  /**
   * Create routing-specific error
   */
  static routingError(message: string, details?: any): DevboxError {
    return new DevboxError(ErrorType.ROUTING_ERROR, message, details, true);
  }

  /**
   * Create validation error
   */
  static validationError(message: string, details?: any): DevboxError {
    return new DevboxError(ErrorType.VALIDATION_ERROR, message, details, false);
  }

  /**
   * Create timeout error
   */
  static timeoutError(message: string, details?: any): DevboxError {
    return new DevboxError(ErrorType.TIMEOUT_ERROR, message, details, true);
  }
}

// Global error handler instance
export const errorHandler = new ErrorHandler();

// Process-level error handlers
process.on('uncaughtException', (error) => {
  logger.fatal({ error }, 'Uncaught exception');
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal({ reason, promise }, 'Unhandled rejection');
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  // Cleanup logic here
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  // Cleanup logic here
  process.exit(0);
});
