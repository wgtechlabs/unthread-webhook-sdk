/**
 * Error class for Redis connection errors
 */

import { UnthreadError } from './UnthreadError.js';

export class ConnectionError extends UnthreadError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONNECTION_ERROR', cause);
    this.name = 'ConnectionError';
  }

  static fromRedisError(error: Error): ConnectionError {
    return new ConnectionError(`Redis connection error: ${error.message}`, error);
  }

  static connectionFailed(url: string): ConnectionError {
    return new ConnectionError(`Failed to connect to Redis at ${url}`);
  }

  static connectionLost(): ConnectionError {
    return new ConnectionError('Redis connection lost');
  }
}
