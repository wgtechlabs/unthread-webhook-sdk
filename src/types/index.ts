/**
 * Type exports for @wgtechlabs/unthread-webhook-sdk
 */

export * from './config.js';
export * from './platforms.js';
export * from './events/index.js';

// Handler types
import { MessageCreatedEvent } from './events/message.js';
import { ConversationCreatedEvent, ConversationUpdatedEvent } from './events/conversation.js';
import { UnthreadEvent } from './events/index.js';

export type MessageCreatedHandler = (event: MessageCreatedEvent) => void | Promise<void>;
export type ConversationCreatedHandler = (event: ConversationCreatedEvent) => void | Promise<void>;
export type ConversationUpdatedHandler = (event: ConversationUpdatedEvent) => void | Promise<void>;
export type UnthreadEventHandler = (event: UnthreadEvent) => void | Promise<void>;
export type ErrorHandler = (error: Error) => void | Promise<void>;
