/**
 * Event validator for webhook events
 */

import { ValidationError } from '../errors/index.js';
import { UnthreadEvent } from '../types/events/index.js';
import {
  VALID_EVENT_TYPES,
  VALID_SOURCE_PLATFORMS,
  REQUIRED_BASE_FIELDS,
  REQUIRED_MESSAGE_CREATED_FIELDS,
  REQUIRED_CONVERSATION_CREATED_FIELDS,
  REQUIRED_CONVERSATION_UPDATED_FIELDS,
} from './schemas.js';

export class EventValidator {
  /**
   * Validates an event object against the expected schema
   * @throws {ValidationError} if the event is invalid
   */
  static validate(event: unknown): asserts event is UnthreadEvent {
    if (!event || typeof event !== 'object') {
      throw ValidationError.invalidEventStructure('Event must be an object', event);
    }

    const eventObj = event as Record<string, unknown>;

    // Check required base fields
    for (const field of REQUIRED_BASE_FIELDS) {
      if (!(field in eventObj)) {
        throw ValidationError.missingField(field, event);
      }
    }

    // Validate event type
    const type = eventObj.type;
    if (typeof type !== 'string') {
      throw ValidationError.invalidType('type', 'string', typeof type, event);
    }

    if (!VALID_EVENT_TYPES.includes(type as any)) {
      throw ValidationError.unsupportedEventType(type, event);
    }

    // Validate source platform
    const sourcePlatform = eventObj.sourcePlatform;
    if (typeof sourcePlatform !== 'string') {
      throw ValidationError.invalidType('sourcePlatform', 'string', typeof sourcePlatform, event);
    }

    if (!VALID_SOURCE_PLATFORMS.includes(sourcePlatform as any)) {
      throw ValidationError.invalidEventStructure(
        `Invalid sourcePlatform: ${sourcePlatform}. Must be one of: ${VALID_SOURCE_PLATFORMS.join(', ')}`,
        event
      );
    }

    // Validate timestamp
    if (typeof eventObj.timestamp !== 'string') {
      throw ValidationError.invalidType('timestamp', 'string', typeof eventObj.timestamp, event);
    }

    // Validate data object exists
    if (!eventObj.data || typeof eventObj.data !== 'object') {
      throw ValidationError.invalidType('data', 'object', typeof eventObj.data, event);
    }

    // Validate event-specific fields
    switch (type) {
      case 'message_created':
        EventValidator.validateMessageCreated(eventObj, event);
        break;
      case 'conversation_created':
        EventValidator.validateConversationCreated(eventObj, event);
        break;
      case 'conversation_updated':
        EventValidator.validateConversationUpdated(eventObj, event);
        break;
    }
  }

  private static validateMessageCreated(eventObj: Record<string, unknown>, originalEvent: unknown): void {
    const data = eventObj.data as Record<string, unknown>;

    for (const field of REQUIRED_MESSAGE_CREATED_FIELDS.data) {
      if (!(field in data)) {
        throw ValidationError.missingField(`data.${field}`, originalEvent);
      }
    }

    // Validate message object
    const message = data.message;
    if (!message || typeof message !== 'object') {
      throw ValidationError.invalidType('data.message', 'object', typeof message, originalEvent);
    }

    const messageObj = message as Record<string, unknown>;
    for (const field of REQUIRED_MESSAGE_CREATED_FIELDS.message) {
      if (!(field in messageObj)) {
        throw ValidationError.missingField(`data.message.${field}`, originalEvent);
      }
    }
  }

  private static validateConversationCreated(eventObj: Record<string, unknown>, originalEvent: unknown): void {
    const data = eventObj.data as Record<string, unknown>;

    for (const field of REQUIRED_CONVERSATION_CREATED_FIELDS.data) {
      if (!(field in data)) {
        throw ValidationError.missingField(`data.${field}`, originalEvent);
      }
    }
  }

  private static validateConversationUpdated(eventObj: Record<string, unknown>, originalEvent: unknown): void {
    const data = eventObj.data as Record<string, unknown>;

    for (const field of REQUIRED_CONVERSATION_UPDATED_FIELDS.data) {
      if (!(field in data)) {
        throw ValidationError.missingField(`data.${field}`, originalEvent);
      }
    }

    // Validate updatedFields is an array
    if (!Array.isArray(data.updatedFields)) {
      throw ValidationError.invalidType('data.updatedFields', 'array', typeof data.updatedFields, originalEvent);
    }
  }
}
