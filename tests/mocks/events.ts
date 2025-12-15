/**
 * Mock event data for tests
 */

import { MessageCreatedEvent, ConversationCreatedEvent, ConversationUpdatedEvent, Platform } from '../../src/types/index.js';

export const mockMessageCreatedEvent: MessageCreatedEvent = {
  type: 'message_created',
  platform: Platform.DISCORD,
  targetPlatform: Platform.DISCORD,
  sourcePlatform: 'dashboard',
  timestamp: '2024-01-15T10:30:00Z',
  data: {
    conversationId: 'conv-123',
    messageId: 'msg-456',
    message: {
      id: 'msg-456',
      body: 'Hello, how can I help you?',
      authorType: 'agent',
      author: {
        id: 'agent-789',
        name: 'Support Agent',
        email: 'agent@example.com',
      },
      createdAt: '2024-01-15T10:30:00Z',
    },
    customer: {
      id: 'customer-101',
      name: 'John Doe',
      email: 'john@example.com',
    },
  },
};

export const mockConversationCreatedEvent: ConversationCreatedEvent = {
  type: 'conversation_created',
  platform: Platform.DISCORD,
  targetPlatform: Platform.DISCORD,
  sourcePlatform: 'api',
  timestamp: '2024-01-15T10:00:00Z',
  data: {
    id: 'conv-123',
    conversationId: 'conv-123',
    friendlyId: 'CONV-001',
    title: 'Help with installation',
    status: 'open',
    priority: 'medium',
    customer: {
      id: 'customer-101',
      name: 'John Doe',
      email: 'john@example.com',
    },
    assignee: {
      id: 'agent-789',
      name: 'Support Agent',
      email: 'agent@example.com',
    },
    createdAt: '2024-01-15T10:00:00Z',
  },
};

export const mockConversationUpdatedEvent: ConversationUpdatedEvent = {
  type: 'conversation_updated',
  platform: Platform.DISCORD,
  targetPlatform: Platform.DISCORD,
  sourcePlatform: 'dashboard',
  timestamp: '2024-01-15T11:00:00Z',
  data: {
    id: 'conv-123',
    conversationId: 'conv-123',
    friendlyId: 'CONV-001',
    status: 'closed',
    previousStatus: 'open',
    updatedFields: ['status'],
    updatedAt: '2024-01-15T11:00:00Z',
  },
};

export const mockInvalidEventType = {
  type: 'invalid_type',
  platform: Platform.DISCORD,
  targetPlatform: Platform.DISCORD,
  sourcePlatform: 'dashboard',
  timestamp: '2024-01-15T12:00:00Z',
  data: {},
};
