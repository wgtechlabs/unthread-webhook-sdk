/**
 * Tests for event validation
 */

import { describe, it, expect } from 'vitest';
import { EventValidator } from '../src/validation/EventValidator.js';
import { ValidationError } from '../src/errors/index.js';
import {
  mockMessageCreatedEvent,
  mockConversationCreatedEvent,
  mockConversationUpdatedEvent,
  mockInvalidEventType,
} from './mocks/events.js';

describe('EventValidator', () => {
  describe('validate', () => {
    it('should validate a valid message_created event', () => {
      expect(() => EventValidator.validate(mockMessageCreatedEvent)).not.toThrow();
    });

    it('should validate a valid conversation_created event', () => {
      expect(() => EventValidator.validate(mockConversationCreatedEvent)).not.toThrow();
    });

    it('should validate a valid conversation_updated event', () => {
      expect(() => EventValidator.validate(mockConversationUpdatedEvent)).not.toThrow();
    });

    it('should throw ValidationError for non-object input', () => {
      expect(() => EventValidator.validate(null)).toThrow(ValidationError);
      expect(() => EventValidator.validate('string')).toThrow(ValidationError);
      expect(() => EventValidator.validate(123)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing required base fields', () => {
      const invalidEvent = { type: 'message_created' };
      expect(() => EventValidator.validate(invalidEvent)).toThrow(ValidationError);
      expect(() => EventValidator.validate(invalidEvent)).toThrow(/platform/);
    });

    it('should throw ValidationError for invalid event type', () => {
      expect(() => EventValidator.validate(mockInvalidEventType)).toThrow(ValidationError);
      expect(() => EventValidator.validate(mockInvalidEventType)).toThrow(/Unsupported event type/);
    });

    it('should throw ValidationError for invalid source platform', () => {
      const invalidEvent = {
        ...mockMessageCreatedEvent,
        sourcePlatform: 'invalid',
      };
      expect(() => EventValidator.validate(invalidEvent)).toThrow(ValidationError);
    });

    it('should throw ValidationError for missing message fields', () => {
      const invalidEvent = {
        ...mockMessageCreatedEvent,
        data: {
          conversationId: 'conv-123',
          messageId: 'msg-456',
          // Missing message field
        },
      };
      expect(() => EventValidator.validate(invalidEvent)).toThrow(ValidationError);
      expect(() => EventValidator.validate(invalidEvent)).toThrow(/message/);
    });

    it('should throw ValidationError for missing conversation fields', () => {
      const invalidEvent = {
        ...mockConversationCreatedEvent,
        data: {
          id: 'conv-123',
          // Missing required fields
        },
      };
      expect(() => EventValidator.validate(invalidEvent)).toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid updatedFields in conversation_updated', () => {
      const invalidEvent = {
        ...mockConversationUpdatedEvent,
        data: {
          ...mockConversationUpdatedEvent.data,
          updatedFields: 'not-an-array', // Should be an array
        },
      };
      expect(() => EventValidator.validate(invalidEvent)).toThrow(ValidationError);
      expect(() => EventValidator.validate(invalidEvent)).toThrow(/array/);
    });
  });
});
