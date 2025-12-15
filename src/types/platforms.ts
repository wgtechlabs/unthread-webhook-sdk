/**
 * Platform types for Unthread events
 */

export enum Platform {
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
  SLACK = 'slack',
  TEAMS = 'teams',
  WEB = 'web',
}

export type SourcePlatform = 'dashboard' | 'api' | 'unknown';
