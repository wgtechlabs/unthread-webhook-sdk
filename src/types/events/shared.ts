/**
 * Shared types used across event types
 */

export interface CustomerInfo {
  id: string;
  name?: string;
  email?: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  email?: string;
}
