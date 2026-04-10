# ModBox + DevBox Integration Guide

This document outlines the recommended changes to ModBox to integrate with the DevBox companion app.

## Overview

DevBox handles server-side concerns while ModBox remains the client-side UI/UX layer. Integration allows:

1. **Config Sync**: ModBox pulls removal reasons and usernotes config from DevBox
2. **Action Logging**: ModBox sends mod actions to DevBox for analytics
3. **Live Updates**: DevBox notifies ModBox when configuration changes
4. **Settings Management**: Admin-only configuration via DevBox portal

## Architecture Changes

### Current (Extension-only)
```
ModBox Extension
└─ Config stored locally (indexedDB)
└─ No server component
```

### With DevBox
```
ModBox Extension
├─ Fetches config from DevBox on startup
├─ Receives webhook notifications when config changes
├─ Sends mod actions to DevBox for logging
└─ Falls back to local cache if DevBox unavailable

    ↕ (Message passing)

DevBox Devvit App
├─ Persists config in KVStore
├─ Sends webhook notifications
├─ Stores audit logs
└─ Provides admin dashboard
```

## Recommended Implementation Steps

### Phase 1: Foundation (Current PoC)

✅ **DevBox**
- Config editor UI
- KVStore persistence
- Notification structure

⚠️ **ModBox** 
- Add DevBox configuration settings
- Implement webhook listener

### Phase 2: Config Sync

**ModBox Changes:**
```javascript
// Add to manifest.json
"permissions": {
  "...": "...",
  "webRequest": {
    "urls": ["https://reddit.com/api/v1/*"]
  }
}

// Add to background.js
const DEVBOX_CONFIG = {
  appPostUrl: "", // Configured by user
  webhookUrl: "", // Optional
  autoSync: true,
  syncInterval: 3600000 // 1 hour
};

// Fetch config from DevBox KVStore via API
async function syncConfigFromDevBox(subreddit) {
  try {
    const response = await fetch(`/api/devbox/config/${subreddit}`);
    const config = await response.json();
    
    // Store locally
    await ext.storage.local.set({
      removalReasons: config.removalReasons,
      usernoteTypes: config.usernoteConfig.types
    });
    
    return config;
  } catch (error) {
    console.error("[ModBox] Failed to sync from DevBox:", error);
    return null;
  }
}

// Listen for webhook notifications
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.includes("devbox/webhook")) {
      const notification = JSON.parse(details.requestBody);
      handleDevBoxNotification(notification);
    }
  },
  { urls: ["https://your-domain.com/devbox/*"] }
);
```

### Phase 3: Action Logging

**ModBox Changes:**
```javascript
// Log when moderator takes action
async function logModActionToDevBox(action, context) {
  const log = {
    type: action.type, // 'remove', 'approve', 'usernote', etc.
    subreddit: context.subreddit,
    target: context.targetId,
    moderator: context.moderator,
    reason: action.reason,
    timestamp: Date.now()
  };
  
  await sendMessage({
    type: 'LOG_ACTION',
    payload: log
  });
}

// In background.js:
ext.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'LOG_ACTION') {
    fetch('/api/devbox/audit', {
      method: 'POST',
      body: JSON.stringify(request.payload)
    }).catch(console.error);
  }
});
```

### Phase 4: Advanced Features

**DevBox Enhancements:**
- Real-time action logging
- Mod activity analytics
- Automation rules & triggers
- Appeal workflow

**ModBox Enhancements:**
- Execute DevBox automation rules
- Receive suggested actions from DevBox
- Display mod statistics in UI

## Data Structures

### DevBox Config Object

```typescript
interface DevBoxConfig {
  subreddit: string;
  removalReasons: RemovalReasonSet[];
  usernoteConfig: UsernoteConfig;
  quickActions: QuickAction[];
  modBoxWebhookUrl?: string;
  version: string;
  lastModifiedBy: string;
  lastModifiedAt: number;
}
```

### Webhook Notification

```typescript
interface ConfigChangeNotification {
  type: 'config_updated' | 'reasons_changed' | 'usernotes_changed';
  subreddit: string;
  changedFields: string[];
  timestamp: number;
  modifiedBy: string;
}
```

### Action Log

```typescript
interface ModActionLog {
  type: 'remove' | 'approve' | 'usernote' | 'ban' | 'mute';
  subreddit: string;
  targetId: string;
  moderator: string;
  reason?: string;
  details?: Record<string, unknown>;
  timestamp: number;
}
```

## API Endpoints

DevBox would expose (via background.js proxy):

```
GET  /api/devbox/config/{subreddit}           - Fetch config
POST /api/devbox/config/{subreddit}           - Update config (admin)
GET  /api/devbox/usernotes/{subreddit}        - Fetch usernotes config
GET  /api/devbox/removal-reasons/{subreddit}  - Fetch removal reasons
POST /api/devbox/audit                        - Log mod action
POST /api/devbox/webhook                      - Receive notifications
```

## Configuration in ModBox

Add new settings panel in extension:

```javascript
"DevBox Integration" tab:
├─ [ ] Enable DevBox
├─ App Post URL: _________________________
├─ [ ] Auto-sync configuration
├─ Sync interval: _____ minutes
├─ [ ] Enable action logging
├─ [Test Connection] [Save]
```

## Error Handling & Fallbacks

ModBox should gracefully handle DevBox unavailability:

```javascript
async function getRemovalReasonsWithFallback(subreddit) {
  try {
    // Try DevBox first
    return await fetchFromDevBox(subreddit);
  } catch (error) {
    console.warn("[ModBox] DevBox unavailable, using local cache", error);
    
    // Fall back to local storage
    const cached = await ext.storage.local.get('removalReasons');
    if (cached) return cached.removalReasons;
    
    // Last resort: empty/default set
    return getDefaultRemovalReasons();
  }
}
```

## Priority Integration Path

For MVP release:

1. **DevBox Persistence** ✅ (Current PoC)
   - Config editor works
   - Data persists in KVStore

2. **Config Sync** ⭐ (High Priority)
   - ModBox pulls config from DevBox on startup
   - Falls back to local cache
   - No webhook required yet

3. **Webhook Notifications** ⭐ (High Priority)
   - Admin modifies config in DevBox
   - ModBox receives notification
   - Updates UI/cache automatically

4. **Action Logging** (Medium Priority)
   - ModBox sends mod actions to DevBox
   - DevBox stores audit trail
   - Enables future analytics

5. **Advanced Features** (Future)
   - Automation rules
   - Real-time analytics
   - Appeal workflows

## Testing the Integration

### Manual Testing

1. **Install both extensions/apps**
   ```bash
   # ModBox
   npm run build
   # Load unpacked in Chrome
   
   # DevBox
   cd extension-devvitbuild
   npm run upload
   ```

2. **Test config sync**
   - Edit config in DevBox
   - Refresh subreddit in ModBox
   - Verify new config loads

3. **Test webhook**
   - Modify config in DevBox
   - Check ModBox receives notification
   - Verify UI updates

### Automated Testing

```typescript
// tests/integration.test.ts
describe('ModBox + DevBox Integration', () => {
  it('syncs config from DevBox', async () => {
    const config = await syncConfigFromDevBox('test_subreddit');
    expect(config).toBeDefined();
    expect(config.removalReasons).toBeInstanceOf(Array);
  });

  it('handles DevBox unavailability', async () => {
    // Mock DevBox offline
    const config = await getRemovalReasonsWithFallback('test');
    expect(config).toBeDefined(); // Should use fallback
  });
});
```

## Deployment

1. **Deploy DevBox first** - Ensure config is available
2. **Update ModBox** - Add DevBox integration
3. **Notify moderators** - Post update notes in subreddit
4. **Monitor logs** - Check for sync/notification errors

## Future Considerations

- Multi-subreddit support (manage federated mod teams)
- Mobile app companion
- CLI tools for bulk operations
- Database integration for larger communities
- Advanced permission models
