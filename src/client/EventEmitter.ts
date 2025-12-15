/**
 * Event emitter for routing webhook events to handlers
 */

import {
  UnthreadEvent,
  MessageCreatedHandler,
  ConversationCreatedHandler,
  ConversationUpdatedHandler,
  UnthreadEventHandler,
  ErrorHandler,
} from '../types/index.js';

type EventHandler = MessageCreatedHandler | ConversationCreatedHandler | ConversationUpdatedHandler;

export class EventEmitter {
  private handlers: Map<string, EventHandler[]> = new Map();
  private anyHandlers: UnthreadEventHandler[] = [];
  private errorHandlers: ErrorHandler[] = [];

  /**
   * Register a handler for a specific event type
   */
  on(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
  }

  /**
   * Register a handler for all events
   */
  onAny(handler: UnthreadEventHandler): void {
    this.anyHandlers.push(handler);
  }

  /**
   * Register an error handler
   */
  onError(handler: ErrorHandler): void {
    this.errorHandlers.push(handler);
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit(event: UnthreadEvent): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];
    const allHandlers: Array<EventHandler | UnthreadEventHandler> = [...handlers, ...this.anyHandlers];

    await Promise.all(
      allHandlers.map(async (handler) => {
        try {
          // Type-safe call: both EventHandler and UnthreadEventHandler accept UnthreadEvent
          await (handler as UnthreadEventHandler)(event);
        } catch (error) {
          await this.emitError(error instanceof Error ? error : new Error(String(error)));
        }
      })
    );
  }

  /**
   * Emit an error to all registered error handlers
   */
  async emitError(error: Error): Promise<void> {
    if (this.errorHandlers.length === 0) {
      // If no error handlers are registered, log to console
      console.error('[UnthreadWebhook] Unhandled error:', error);
      return;
    }

    await Promise.all(
      this.errorHandlers.map(async (handler) => {
        try {
          await handler(error);
        } catch (handlerError) {
          // Prevent infinite loop if error handler throws
          console.error('[UnthreadWebhook] Error in error handler:', handlerError);
        }
      })
    );
  }
}
