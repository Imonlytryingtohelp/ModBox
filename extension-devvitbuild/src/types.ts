/**
 * DevBox Configuration Types
 * Shared data structures between DevBox and ModBox
 */

export interface RemovalReason {
  id: string;
  title: string;
  description: string;
  template: string;
  category?: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface RemovalReasonSet {
  setId: string;
  name: string;
  description: string;
  reasons: RemovalReason[];
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface UsernoteType {
  code: string;
  label: string;
  color: string;
  description?: string;
  enabled: boolean;
}

export interface UsernoteConfig {
  types: UsernoteType[];
  maxNoteLength: number;
  allowedRemovalReasons: string[];
  createdAt: number;
  updatedAt: number;
}

export interface QuickAction {
  id: string;
  name: string;
  description: string;
  template: string;
  shortcut?: string;
  category?: string;
  enabled: boolean;
}

export interface DevBoxConfig {
  subreddit: string;
  removalReasons: RemovalReasonSet[];
  usernoteConfig: UsernoteConfig;
  quickActions: QuickAction[];
  modBoxWebhookUrl?: string;
  version: string;
  lastModifiedBy: string;
  lastModifiedAt: number;
}

export interface ConfigChangeNotification {
  type: 'config_updated' | 'reasons_changed' | 'usernotes_changed' | 'actions_changed';
  subreddit: string;
  changedFields: string[];
  timestamp: number;
  modifiedBy: string;
}
