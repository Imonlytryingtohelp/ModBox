#QUICKSTART.md - DevBox Development Guide

Get DevBox running locally in 5 minutes.

## Prerequisites

- [Node.js 16+](https://nodejs.org/)
- [Devvit CLI](https://developers.reddit.com/docs/devvit/quickstart)
- Account with mod permissions on a test subreddit

## Setup

### 1. Install Dependencies
```bash
cd extension-devvitbuild
npm install
```

### 2. Build the Project
```bash
npm run build
```

### 3. Run in Development Mode
```bash
npm run dev
```

This starts a local dev server with hot reload. Any changes to source files automatically rebuild.

### 4. Upload to Your Test Subreddit
```bash
npm run upload
```

Follow the prompts to select your test subreddit. The app will be installed.

### 5. Create a DevBox Post
- Go to r/your_test_subreddit
- Create a new post
- Select "DevBox Manager" custom post type
- The configuration interface loads automatically

## File Structure

```
src/
├── types.ts              # Data structures shared with ModBox
├── storage.ts            # KVStore operations (persistence)
├── notifications.ts      # Webhook handling
├── index.tsx             # Main app with navigation
└── screens/
    ├── ConfigEditor.tsx  # Edit removal reasons & usernote types
    ├── Dashboard.tsx     # Statistics display
    └── Settings.tsx      # App preferences
```

## Common Tasks

### Add a New Configuration Field

1. **Update types.ts**
```typescript
export interface UsernoteConfig {
  types: UsernoteType[];
  maxNoteLength: number;
  newField: boolean;  // Add here
  // ...
}
```

2. **Update storage.ts**
```typescript
export async function saveUsernoteConfig(subreddit: string, config: UsernoteConfig) {
  // Handles new field automatically via JSON
  const key = `${USERNOTES_KEY_PREFIX}${subreddit}`;
  await kvStore.put(key, JSON.stringify(config));
}
```

3. **Update ConfigEditor.tsx**
```typescript
// Add UI component for newField
<vstack gap="small">
  <text>My New Field</text>
  <button onPress={() => setNewField(!newField)}>
    {newField ? '✓' : '✗'}
  </button>
</vstack>
```

### Test Configuration Persistence

1. Edit config in ConfigEditor
2. Press "Save"
3. Refresh the post view (F5)
4. Verify config persisted

### Debug KVStore

The storage layer logs all operations:
```
[DevBox] Config loaded for test_subreddit
[DevBox] Config saved for test_subreddit
[DevBox] Error loading config: [error message]
```

Check browser console (DevTools) for logs.

## Testing Scenarios

### Scenario 1: Save & Load Config
```
1. Open ConfigEditor tab
2. Add/modify removal reasons
3. Click "Save Removal Reasons"
4. Refresh page
5. Verify config persists
```

### Scenario 2: Multiple Subreddits
```
1. Save config for r/sub1
2. Navigate to different subreddit  
3. Create new DevBox post
4. Verify config is separate
```

### Scenario 3: Webhook Notification Simulation

DevBox is prepared to send webhooks. To test:

1. Set webhook URL in Settings tab
2. Update config in ConfigEditor
3. Webhook would send POST to your URL with notification

For local testing, use a service like [RequestBin](https://requestbin.com/) or [ngrok](https://ngrok.com/) to capture the request.

## Performance Tips

- Config saved in KVStore automatically paginates for large datasets
- Changes don't propagate until "Save" button clicked
- Dashboard stats can be cached server-side

## Troubleshooting

### "npm: command not found"
```bash
# Install Node.js from https://nodejs.org
# Verify installation:
node --version
npm --version
```

### "Devvit CLI not installed"
```bash
npm install -g @devvit/cli
devvit --version
```

### Build Errors
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### KVStore Errors
- KVStore operations time out occasionally
- Dev server may lose KVStore access temporarily  
- These errors are logged but catch-handled
- Production uses different backend

### Config Not Persisting
1. Check browser console for errors
2. Verify "Save" button was clicked
3. Try refreshing after saving
4. Clear browser cache

## Next Steps

After getting comfortable with DevBox:

1. **Add ModBox Integration** - See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
2. **Build Dashboard Analytics** - Use Reddit API to fetch real stats
3. **Implement Webhooks** - Send notifications when config changes
4. **Add Automation** - Create rules engine for mod actions

## Getting Help

**Devvit Documentation:**
- [Devvit Quickstart](https://developers.reddit.com/docs/devvit/quickstart)
- [Devvit API Reference](https://developers.reddit.com/docs/devvit/api)
- [Block Kit UI Guide](https://developers.reddit.com/docs/devvit/blockkit)

**ModBox Integration Help:**
- See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- Review [types.ts](./src/types.ts) for data structures

**Community:**
- [r/Devvit](https://reddit.com/r/devvit)
- [Reddit Developer Forum](https://developers.reddit.com/discussions)

## Tips & Tricks

### Hot Reload During Development
```bash
npm run dev
# Changes to src/ trigger automatic rebuild
# Refresh DevBox post to see changes
```

### Test with Multiple Moderators
- Use incognito window with different Reddit account
- Verify each mod has independent DevBox instances
- Test permission restrictions

### Monitor KVStore Usage
```bash
# View stored data size
# In production, KVStore has size limits
# Monitor Config object growth
```

---

**Happy developing!** 🚀

Questions? Check [README.md](./README.md) or [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
