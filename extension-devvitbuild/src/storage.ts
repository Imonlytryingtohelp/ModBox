/**
 * DevBox Storage Layer
 * Handles KVStore persistence for configuration data
 */

import { kvStore } from '@devvit/public-api';
import type { DevBoxConfig, RemovalReasonSet, UsernoteConfig, QuickAction } from './types.js';

const CONFIG_KEY_PREFIX = 'devbox:config:';
const REASONS_KEY_PREFIX = 'devbox:reasons:';
const USERNOTES_KEY_PREFIX = 'devbox:usernotes:';
const ACTIONS_KEY_PREFIX = 'devbox:actions:';

export async function getConfig(subreddit: string): Promise<DevBoxConfig | null> {
  try {
    const key = `${CONFIG_KEY_PREFIX}${subreddit}`;
    const data = await kvStore.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('[DevBox] Error loading config:', error);
    return null;
  }
}

export async function saveConfig(subreddit: string, config: DevBoxConfig): Promise<boolean> {
  try {
    const key = `${CONFIG_KEY_PREFIX}${subreddit}`;
    await kvStore.put(key, JSON.stringify(config), { ttl: 30 * 24 * 60 * 60 }); // 30 days
    console.log('[DevBox] Config saved for', subreddit);
    return true;
  } catch (error) {
    console.error('[DevBox] Error saving config:', error);
    return false;
  }
}

export async function getRemovalReasons(subreddit: string): Promise<RemovalReasonSet[]> {
  try {
    const key = `${REASONS_KEY_PREFIX}${subreddit}`;
    const data = await kvStore.get(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[DevBox] Error loading removal reasons:', error);
    return [];
  }
}

export async function saveRemovalReasons(subreddit: string, reasons: RemovalReasonSet[]): Promise<boolean> {
  try {
    const key = `${REASONS_KEY_PREFIX}${subreddit}`;
    await kvStore.put(key, JSON.stringify(reasons), { ttl: 30 * 24 * 60 * 60 });
    console.log('[DevBox] Removal reasons saved for', subreddit);
    return true;
  } catch (error) {
    console.error('[DevBox] Error saving removal reasons:', error);
    return false;
  }
}

export async function getUsernoteConfig(subreddit: string): Promise<UsernoteConfig | null> {
  try {
    const key = `${USERNOTES_KEY_PREFIX}${subreddit}`;
    const data = await kvStore.get(key);
    if (!data) return null;
    return JSON.parse(data);
  } catch (error) {
    console.error('[DevBox] Error loading usernote config:', error);
    return null;
  }
}

export async function saveUsernoteConfig(subreddit: string, config: UsernoteConfig): Promise<boolean> {
  try {
    const key = `${USERNOTES_KEY_PREFIX}${subreddit}`;
    await kvStore.put(key, JSON.stringify(config), { ttl: 30 * 24 * 60 * 60 });
    console.log('[DevBox] Usernote config saved for', subreddit);
    return true;
  } catch (error) {
    console.error('[DevBox] Error saving usernote config:', error);
    return false;
  }
}

export async function getQuickActions(subreddit: string): Promise<QuickAction[]> {
  try {
    const key = `${ACTIONS_KEY_PREFIX}${subreddit}`;
    const data = await kvStore.get(key);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error('[DevBox] Error loading quick actions:', error);
    return [];
  }
}

export async function saveQuickActions(subreddit: string, actions: QuickAction[]): Promise<boolean> {
  try {
    const key = `${ACTIONS_KEY_PREFIX}${subreddit}`;
    await kvStore.put(key, JSON.stringify(actions), { ttl: 30 * 24 * 60 * 60 });
    console.log('[DevBox] Quick actions saved for', subreddit);
    return true;
  } catch (error) {
    console.error('[DevBox] Error saving quick actions:', error);
    return false;
  }
}
