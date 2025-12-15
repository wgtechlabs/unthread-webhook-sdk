/**
 * Error class for event validation errors
 */

import { UnthreadError } from './UnthreadError.js';

export class ValidationError extends UnthreadError {
  public readonly eventData?: unknown;

  constructor(message: string, eventData?: unknown, cause?: Error) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
    this.eventData = eventData;
  }

  static missingField(field: string, eventData?: unknown): ValidationError {
    return new ValidationError(`Missing required field: ${field}`, eventData);
  }

  static invalidType(field: string, expected: string, actual: string, eventData?: unknown): ValidationError {
    return new ValidationError(
      `Invalid type for field '${field}': expected ${expected}, got ${actual}`,
      eventData
    );
  }

  static unsupportedEventType(type: string, eventData?: unknown): ValidationError {
    return new ValidationError(`Unsupported event type: ${type}`, eventData);
  }

  static invalidEventStructure(message: string, eventData?: unknown): ValidationError {
    return new ValidationError(`Invalid event structure: ${message}`, eventData);
  }
}
