/**
 * Tests for UnthreadWebhook client
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnthreadWebhook } from '../src/client/UnthreadWebhook.js';
import { mockMessageCreatedEvent, mockConversationCreatedEvent } from './mocks/events.js';

describe('UnthreadWebhook', () => {
  describe('constructor', () => {
    it('should create an instance with required config', () => {
      const client = new UnthreadWebhook({
        redisUrl: 'redis://localhost:6379',
      });

      expect(client).toBeInstanceOf(UnthreadWebhook);
    });

    it('should use default values for optional config', () => {
      const client = new UnthreadWebhook({
        redisUrl: 'redis://localhost:6379',
      });

      expect(client).toBeInstanceOf(UnthreadWebhook);
      expect(client.isConnected()).toBe(false);
    });

    it('should accept custom config values', () => {
      const client = new UnthreadWebhook({
        redisUrl: 'redis://localhost:6379',
        queueName: 'custom-queue',
        pollInterval: 2000,
        validateEvents: false,
      });

      expect(client).toBeInstanceOf(UnthreadWebhook);
    });
  });

  describe('event handlers', () => {
    let client: UnthreadWebhook;

    beforeEach(() => {
      client = new UnthreadWebhook({
        redisUrl: 'redis://localhost:6379',
      });
    });

    it('should register message_created handler', () => {
      const handler = vi.fn();
      const result = client.on('message_created', handler);

      expect(result).toBe(client); // Should return this for chaining
    });

    it('should register conversation_created handler', () => {
      const handler = vi.fn();
      const result = client.on('conversation_created', handler);

      expect(result).toBe(client);
    });

    it('should register conversation_updated handler', () => {
      const handler = vi.fn();
      const result = client.on('conversation_updated', handler);

      expect(result).toBe(client);
    });

    it('should register onAny handler', () => {
      const handler = vi.fn();
      const result = client.onAny(handler);

      expect(result).toBe(client);
    });

    it('should register onError handler', () => {
      const handler = vi.fn();
      const result = client.onError(handler);

      expect(result).toBe(client);
    });

    it('should support method chaining', () => {
      const result = client
        .on('message_created', vi.fn())
        .on('conversation_created', vi.fn())
        .onAny(vi.fn())
        .onError(vi.fn());

      expect(result).toBe(client);
    });
  });

  describe('isConnected', () => {
    it('should return false when not connected', () => {
      const client = new UnthreadWebhook({
        redisUrl: 'redis://localhost:6379',
      });

      expect(client.isConnected()).toBe(false);
    });
  });
});
