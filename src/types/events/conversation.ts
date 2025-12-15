/**
 * Conversation event types
 */

import { BaseEvent } from './base.js';
import { CustomerInfo, AgentInfo } from './shared.js';

export type ConversationStatus = 'open' | 'closed' | 'pending' | 'resolved';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export interface ConversationCreatedEvent extends BaseEvent {
  type: 'conversation_created';
  data: {
    id: string;
    conversationId: string;
    friendlyId: string;
    title?: string;
    status: ConversationStatus;
    priority?: Priority;
    customer?: CustomerInfo;
    assignee?: AgentInfo;
    createdAt: string;
  };
}

export interface ConversationUpdatedEvent extends BaseEvent {
  type: 'conversation_updated';
  data: {
    id: string;
    conversationId: string;
    friendlyId: string;
    status: ConversationStatus;
    previousStatus?: ConversationStatus;
    updatedFields: string[];
    updatedAt: string;
  };
}
