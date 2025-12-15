/**
 * Event type exports
 */

export * from './base.js';
export * from './shared.js';
export * from './message.js';
export * from './conversation.js';

import { MessageCreatedEvent } from './message.js';
import { ConversationCreatedEvent, ConversationUpdatedEvent } from './conversation.js';

/** Union type of all supported event types */
export type UnthreadEvent =
  | MessageCreatedEvent
  | ConversationCreatedEvent
  | ConversationUpdatedEvent;

/** Event type string literals */
export type EventType = UnthreadEvent['type'];
