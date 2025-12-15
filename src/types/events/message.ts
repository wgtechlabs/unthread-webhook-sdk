/**
 * Message event types
 */

import { BaseEvent } from './base.js';
import { CustomerInfo } from './shared.js';

export type AuthorType = 'agent' | 'customer' | 'system';

export interface Author {
  id: string;
  name: string;
  email?: string;
}

export interface Message {
  id: string;
  body: string;
  authorType: AuthorType;
  author?: Author;
  createdAt: string;
}

export interface MessageCreatedEvent extends BaseEvent {
  type: 'message_created';
  data: {
    conversationId: string;
    messageId: string;
    message: Message;
    customer?: CustomerInfo;
  };
}
