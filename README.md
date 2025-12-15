# @wgtechlabs/unthread-webhook-sdk

Official SDK for consuming Unthread webhook events from `unthread-webhook-server`.

[![License: GPL-3.0](https://img.shields.io/badge/License-GPL%203.0-blue.svg)](https://opensource.org/licenses/GPL-3.0)

## Overview

This SDK provides a **general-purpose, storage-agnostic, platform-agnostic** client for any integrator that wants to consume webhooks from the Unthread platform via `unthread-webhook-server`.

**Target users:**
- WG Tech Labs bots (Discord, Telegram) - will wire with Nuvex for storage
- Companies building custom dashboards
- Developers building integrations (Slack, Teams, custom apps)
- Any application that needs Unthread webhook data

## Architecture

```
unthread-webhook-server (queues events to Redis)
          │
          ▼
@wgtechlabs/unthread-webhook-sdk (this package)
          │
          ▼
Integrator's Application (brings their own storage)
```

## Installation

```bash
npm install @wgtechlabs/unthread-webhook-sdk redis
```

**Note:** `redis` is a peer dependency. You must install it separately.

## Quick Start

```typescript
import { UnthreadWebhook } from '@wgtechlabs/unthread-webhook-sdk';

// Create client
const client = new UnthreadWebhook({
  redisUrl: 'redis://localhost:6379',
});

// Register event handlers
client
  .on('message_created', async (event) => {
    console.log('New message:', event.data.message.body);
    // Save to your database
  })
  .on('conversation_created', async (event) => {
    console.log('New conversation:', event.data.friendlyId);
  })
  .on('conversation_updated', async (event) => {
    console.log('Conversation updated:', event.data.status);
  })
  .onError(async (error) => {
    console.error('Error processing event:', error);
  });

// Connect and start consuming
await client.connect();
await client.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  await client.disconnect();
  process.exit(0);
});
```

## Configuration

```typescript
interface UnthreadWebhookConfig {
  /** Redis connection URL (required) */
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
```

### Example with Custom Configuration

```typescript
const client = new UnthreadWebhook({
  redisUrl: 'redis://localhost:6379',
  queueName: 'my-custom-queue',
  pollInterval: 2000,
  validateEvents: true,
  logger: {
    info: (msg, ...args) => console.log(msg, ...args),
    warn: (msg, ...args) => console.warn(msg, ...args),
    error: (msg, ...args) => console.error(msg, ...args),
    debug: (msg, ...args) => console.debug(msg, ...args),
  },
});
```

## API Reference

### UnthreadWebhook

Main client class for consuming webhook events.

#### Methods

##### `constructor(config: UnthreadWebhookConfig)`

Creates a new instance of the webhook client.

##### `connect(): Promise<void>`

Connects to Redis. Must be called before `start()`.

##### `start(): Promise<void>`

Starts consuming events from the Redis queue.

##### `stop(): void`

Stops consuming events from the queue.

##### `disconnect(): Promise<void>`

Stops consuming and disconnects from Redis.

##### `on(event: 'message_created', handler: MessageCreatedHandler): this`

Registers a handler for `message_created` events.

##### `on(event: 'conversation_created', handler: ConversationCreatedHandler): this`

Registers a handler for `conversation_created` events.

##### `on(event: 'conversation_updated', handler: ConversationUpdatedHandler): this`

Registers a handler for `conversation_updated` events.

##### `onAny(handler: UnthreadEventHandler): this`

Registers a handler that receives all event types.

##### `onError(handler: ErrorHandler): this`

Registers an error handler for processing errors.

##### `isConnected(): boolean`

Returns `true` if connected to Redis, `false` otherwise.

## Event Types

### MessageCreatedEvent

Triggered when a new message is created in a conversation.

```typescript
{
  type: 'message_created',
  platform: Platform,
  targetPlatform: Platform,
  sourcePlatform: 'dashboard' | 'api' | 'unknown',
  timestamp: string, // ISO 8601
  data: {
    conversationId: string,
    messageId: string,
    message: {
      id: string,
      body: string,
      authorType: 'agent' | 'customer' | 'system',
      author?: {
        id: string,
        name: string,
        email?: string,
      },
      createdAt: string, // ISO 8601
    },
    customer?: {
      id: string,
      name?: string,
      email?: string,
    },
  },
}
```

### ConversationCreatedEvent

Triggered when a new conversation is created.

```typescript
{
  type: 'conversation_created',
  platform: Platform,
  targetPlatform: Platform,
  sourcePlatform: 'dashboard' | 'api' | 'unknown',
  timestamp: string, // ISO 8601
  data: {
    id: string,
    conversationId: string,
    friendlyId: string,
    title?: string,
    status: 'open' | 'closed' | 'pending' | 'resolved',
    priority?: 'low' | 'medium' | 'high' | 'urgent',
    customer?: {
      id: string,
      name?: string,
      email?: string,
    },
    assignee?: {
      id: string,
      name: string,
      email?: string,
    },
    createdAt: string, // ISO 8601
  },
}
```

### ConversationUpdatedEvent

Triggered when a conversation is updated.

```typescript
{
  type: 'conversation_updated',
  platform: Platform,
  targetPlatform: Platform,
  sourcePlatform: 'dashboard' | 'api' | 'unknown',
  timestamp: string, // ISO 8601
  data: {
    id: string,
    conversationId: string,
    friendlyId: string,
    status: 'open' | 'closed' | 'pending' | 'resolved',
    previousStatus?: 'open' | 'closed' | 'pending' | 'resolved',
    updatedFields: string[],
    updatedAt: string, // ISO 8601
  },
}
```

## Usage Examples

### Simple Integration

```typescript
import { UnthreadWebhook } from '@wgtechlabs/unthread-webhook-sdk';

const client = new UnthreadWebhook({
  redisUrl: process.env.REDIS_URL!,
});

client.onAny(async (event) => {
  console.log(`Received ${event.type} event`);
});

await client.connect();
await client.start();
```

### With Custom Storage (Storage-Agnostic)

```typescript
import { UnthreadWebhook } from '@wgtechlabs/unthread-webhook-sdk';
import { MyDatabase } from './database'; // Your storage layer

const db = new MyDatabase();
const client = new UnthreadWebhook({
  redisUrl: process.env.REDIS_URL!,
});

client.on('message_created', async (event) => {
  // Save to YOUR database (MongoDB, PostgreSQL, etc.)
  await db.messages.create({
    id: event.data.messageId,
    conversationId: event.data.conversationId,
    body: event.data.message.body,
    authorType: event.data.message.authorType,
    createdAt: event.data.message.createdAt,
  });
});

client.on('conversation_created', async (event) => {
  // Save to YOUR database
  await db.conversations.create({
    id: event.data.conversationId,
    friendlyId: event.data.friendlyId,
    status: event.data.status,
    customerId: event.data.customer?.id,
  });
});

await client.connect();
await client.start();
```

### With Error Handling

```typescript
import { UnthreadWebhook, ValidationError, ConnectionError } from '@wgtechlabs/unthread-webhook-sdk';

const client = new UnthreadWebhook({
  redisUrl: process.env.REDIS_URL!,
});

client.on('message_created', async (event) => {
  // Your handler logic
  await processMessage(event);
});

client.onError(async (error) => {
  if (error instanceof ValidationError) {
    console.error('Invalid event received:', error.eventData);
  } else if (error instanceof ConnectionError) {
    console.error('Redis connection error:', error.message);
    // Implement reconnection logic
  } else {
    console.error('Unexpected error:', error);
  }
});

await client.connect();
await client.start();
```

### Platform-Specific Handling

```typescript
import { UnthreadWebhook, Platform } from '@wgtechlabs/unthread-webhook-sdk';

const client = new UnthreadWebhook({
  redisUrl: process.env.REDIS_URL!,
});

client.on('message_created', async (event) => {
  if (event.platform === Platform.DISCORD) {
    // Handle Discord-specific logic
    await sendToDiscordBot(event);
  } else if (event.platform === Platform.TELEGRAM) {
    // Handle Telegram-specific logic
    await sendToTelegramBot(event);
  }
});

await client.connect();
await client.start();
```

## Error Types

### UnthreadError

Base error class for all SDK errors.

```typescript
class UnthreadError extends Error {
  code: string;
  cause?: Error;
}
```

### ConnectionError

Thrown for Redis connection errors.

```typescript
class ConnectionError extends UnthreadError {
  // Extends UnthreadError with code: 'CONNECTION_ERROR'
}
```

### ValidationError

Thrown when an event fails validation.

```typescript
class ValidationError extends UnthreadError {
  eventData?: unknown;
  // Extends UnthreadError with code: 'VALIDATION_ERROR'
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Type Checking

```bash
npm run typecheck
```

## Related Projects

- [unthread-webhook-server](https://github.com/wgtechlabs/unthread-webhook-server) - The webhook server that queues events to Redis

## License

GPL-3.0 © [Waren Gonzaga](https://github.com/warengonzaga)

## Author

**Waren Gonzaga**
- Website: [warengonzaga.com](https://warengonzaga.com)
- Email: opensource@warengonzaga.com
- GitHub: [@warengonzaga](https://github.com/warengonzaga)

---

Made with ❤️ by WG Tech Labs