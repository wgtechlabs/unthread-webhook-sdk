/**
 * Validation schemas for webhook events
 */

import { Platform, SourcePlatform } from '../types/platforms.js';
import { EventType } from '../types/events/index.js';

export const VALID_PLATFORMS: readonly Platform[] = Object.values(Platform);
export const VALID_SOURCE_PLATFORMS: readonly SourcePlatform[] = ['dashboard', 'api', 'unknown'];
export const VALID_EVENT_TYPES: readonly EventType[] = [
  'message_created',
  'conversation_created',
  'conversation_updated',
];

export const REQUIRED_BASE_FIELDS = [
  'type',
  'platform',
  'targetPlatform',
  'sourcePlatform',
  'timestamp',
  'data',
] as const;

export const REQUIRED_MESSAGE_CREATED_FIELDS = {
  data: ['conversationId', 'messageId', 'message'],
  message: ['id', 'body', 'authorType', 'createdAt'],
} as const;

export const REQUIRED_CONVERSATION_CREATED_FIELDS = {
  data: ['id', 'conversationId', 'friendlyId', 'status', 'createdAt'],
} as const;

export const REQUIRED_CONVERSATION_UPDATED_FIELDS = {
  data: ['id', 'conversationId', 'friendlyId', 'status', 'updatedFields', 'updatedAt'],
} as const;
