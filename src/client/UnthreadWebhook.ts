/**
 * Main client class for consuming Unthread webhook events
 */

import {
  UnthreadWebhookConfig,
  MessageCreatedHandler,
  ConversationCreatedHandler,
  ConversationUpdatedHandler,
  UnthreadEventHandler,
  ErrorHandler,
  UnthreadEvent,
} from '../types/index.js';
import { EventValidator } from '../validation/EventValidator.js';
import { EventEmitter } from './EventEmitter.js';
import { EventConsumer } from './EventConsumer.js';

const DEFAULT_QUEUE_NAME = 'unthread-events';
const DEFAULT_POLL_INTERVAL = 1000;
const DEFAULT_VALIDATE_EVENTS = true;

export class UnthreadWebhook {
  private readonly config: Required<Omit<UnthreadWebhookConfig, 'logger'>> & Pick<UnthreadWebhookConfig, 'logger'>;
  private readonly eventEmitter: EventEmitter;
  private readonly eventConsumer: EventConsumer;
  private consumePromise: Promise<void> | null = null;

  constructor(config: UnthreadWebhookConfig) {
    this.config = {
      redisUrl: config.redisUrl,
      queueName: config.queueName || DEFAULT_QUEUE_NAME,
      pollInterval: config.pollInterval || DEFAULT_POLL_INTERVAL,
      validateEvents: config.validateEvents ?? DEFAULT_VALIDATE_EVENTS,
      logger: config.logger,
    };

    this.eventEmitter = new EventEmitter();
    this.eventConsumer = new EventConsumer(
      this.config.redisUrl,
      this.config.queueName,
      this.config.pollInterval,
      this.config.logger
    );
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    await this.eventConsumer.connect();
  }

  /**
   * Start consuming events from the queue
   */
  async start(): Promise<void> {
    if (this.consumePromise) {
      throw new Error('Already started. Call stop() first.');
    }

    this.consumePromise = this.eventConsumer.consume(async (event: unknown) => {
      try {
        // Validate event if enabled
        if (this.config.validateEvents) {
          EventValidator.validate(event);
        }

        // Emit event to handlers
        await this.eventEmitter.emit(event as UnthreadEvent);
      } catch (error) {
        // Emit error to error handlers
        await this.eventEmitter.emitError(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * Stop consuming events
   */
  stop(): void {
    this.eventConsumer.stop();
    this.consumePromise = null;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    this.stop();
    await this.eventConsumer.disconnect();
  }

  /**
   * Register a handler for message_created events
   */
  on(event: 'message_created', handler: MessageCreatedHandler): this;
  /**
   * Register a handler for conversation_created events
   */
  on(event: 'conversation_created', handler: ConversationCreatedHandler): this;
  /**
   * Register a handler for conversation_updated events
   */
  on(event: 'conversation_updated', handler: ConversationUpdatedHandler): this;
  on(event: string, handler: any): this {
    this.eventEmitter.on(event, handler);
    return this;
  }

  /**
   * Register a handler for all events
   */
  onAny(handler: UnthreadEventHandler): this {
    this.eventEmitter.onAny(handler);
    return this;
  }

  /**
   * Register an error handler
   */
  onError(handler: ErrorHandler): this {
    this.eventEmitter.onError(handler);
    return this;
  }

  /**
   * Check if connected to Redis
   */
  isConnected(): boolean {
    return this.eventConsumer.isConnected();
  }
}
