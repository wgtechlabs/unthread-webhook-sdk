/**
 * Redis queue consumer for webhook events
 */

import { createClient, RedisClientType } from 'redis';
import { ConnectionError } from '../errors/index.js';
import { Logger } from '../types/index.js';

export class EventConsumer {
  private client: RedisClientType | null = null;
  private blockingClient: RedisClientType | null = null;
  private isRunning = false;
  private logger: Logger;

  constructor(
    private readonly redisUrl: string,
    private readonly queueName: string,
    private readonly pollInterval: number,
    logger?: Logger
  ) {
    this.logger = logger || this.createDefaultLogger();
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    try {
      // Create main client
      this.client = createClient({ url: this.redisUrl });
      this.client.on('error', (err) => {
        this.logger.error('Redis client error:', err);
      });

      // Create blocking client for BLPOP operations
      this.blockingClient = createClient({ url: this.redisUrl });
      this.blockingClient.on('error', (err) => {
        this.logger.error('Redis blocking client error:', err);
      });

      await Promise.all([this.client.connect(), this.blockingClient.connect()]);

      this.logger.info(`Connected to Redis at ${this.redisUrl}`);
    } catch (error) {
      throw ConnectionError.fromRedisError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    this.isRunning = false;

    if (this.client) {
      await this.client.quit();
      this.client = null;
    }

    if (this.blockingClient) {
      await this.blockingClient.quit();
      this.blockingClient = null;
    }

    this.logger.info('Disconnected from Redis');
  }

  /**
   * Check if connected to Redis
   */
  isConnected(): boolean {
    return this.client?.isOpen === true && this.blockingClient?.isOpen === true;
  }

  /**
   * Start consuming events from the queue
   */
  async consume(onEvent: (event: unknown) => Promise<void>): Promise<void> {
    if (!this.blockingClient) {
      throw new ConnectionError('Not connected to Redis. Call connect() first.');
    }

    this.isRunning = true;
    this.logger.info(`Starting to consume events from queue: ${this.queueName}`);

    while (this.isRunning) {
      try {
        // BLPOP blocks until an item is available or timeout (pollInterval in seconds)
        const result = await this.blockingClient.blPop(this.queueName, this.pollInterval / 1000);

        if (result) {
          try {
            const event = JSON.parse(result.element);
            await onEvent(event);
          } catch (error) {
            this.logger.error('Error parsing or processing event:', error);
          }
        }
      } catch (error) {
        if (this.isRunning) {
          this.logger.error('Error consuming from queue:', error);
          // Brief pause before retrying
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }

  /**
   * Stop consuming events
   */
  stop(): void {
    this.isRunning = false;
    this.logger.info('Stopping event consumer');
  }

  private createDefaultLogger(): Logger {
    return {
      info: (message: string, ...args: unknown[]) => console.log(`[UnthreadWebhook] ${message}`, ...args),
      warn: (message: string, ...args: unknown[]) => console.warn(`[UnthreadWebhook] ${message}`, ...args),
      error: (message: string, ...args: unknown[]) => console.error(`[UnthreadWebhook] ${message}`, ...args),
      debug: (message: string, ...args: unknown[]) => console.debug(`[UnthreadWebhook] ${message}`, ...args),
    };
  }
}
