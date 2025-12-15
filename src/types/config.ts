/**
 * Configuration types for UnthreadWebhook client
 */

export interface Logger {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

export interface UnthreadWebhookConfig {
  /** Redis connection URL */
  redisUrl: string;
  /** Queue name to consume from (default: 'unthread-events') */
  queueName?: string;
  /** Poll interval in milliseconds (default: 1000) */
  pollInterval?: number;
  /** Validate events before passing to handlers (default: true) */
  validateEvents?: boolean;
  /** Custom logger instance */
  logger?: Logger;
}
