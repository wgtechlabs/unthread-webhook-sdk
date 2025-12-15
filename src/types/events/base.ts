/**
 * Base event types for all Unthread webhook events
 */

import { Platform, SourcePlatform } from '../platforms.js';

export interface BaseEvent {
  /** Event type identifier */
  type: string;
  /** Target platform for the event */
  platform: Platform;
  /** Target platform (same as platform) */
  targetPlatform: Platform;
  /** Source platform where the event originated */
  sourcePlatform: SourcePlatform;
  /** ISO 8601 timestamp of when the event occurred */
  timestamp: string;
  /** Event-specific data */
  data: Record<string, unknown>;
}
