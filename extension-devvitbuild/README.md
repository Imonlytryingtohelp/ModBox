# DevBox - ModBox Companion Devvit App

DevBox is a companion Devvit application for the [ModBox browser extension](../). It provides server-side configuration management, analytics, and automation capabilities that complement ModBox's client-side moderation tools.

## Features

### ✅ Current (PoC)
- **Configuration Editor**: Manage removal reasons and usernote types
- **Persistent Storage**: All settings stored in Reddit's KVStore
- **Dashboard Scaffolding**: Framework for mod statistics and activity monitoring
- **Settings Panel**: Configure webhook notifications and app preferences
- **Audit Logging**: Track configuration changes by moderator

### 🚀 Planned
- Real-time modqueue analytics
- Mod action frequency tracking
- Automation rules and triggers
- Scheduled bulk operations
- Removal appeal workflow
- Advanced reporting and exports

## Architecture

```
┌─────────────────────────────────────────┐
│  ModBox (Extension - Client-side)       │
│  • Inline moderation tools              │
│  • Real-time DOM modifications          │
│  • User interactions                    │
└──────────────┬──────────────────────────┘
               │ (Webhook API)
               ↓
┌─────────────────────────────────────────┐
│  DevBox (Devvit App - Server-side)      │
│  • Configuration management             │
│  • Persistent data storage (KVStore)    │
│  • Audit logging & compliance           │
│  • Analytics & automation               │
└─────────────────────────────────────────┘
```

## Installation

### Prerequisites
- Node.js 16+ and npm
- [Devvit CLI](https://developers.reddit.com/docs/devvit) installed
- A subreddit where you have mod permissions

### Setup

1. **Initialize the app**
```bash
cd extension-devvitbuild
npm install
```

2. **Build the app**
```bash
npm run build
```

3. **Upload to your subreddit**
```bash
npm run upload
```

4. **Configure in your subreddit**
   - Visit your subreddit's Apps & Tools
   - Find "DevBox - ModBox Config Manager"
   - Create a post using the DevBox custom post type
   - Bookmark the post for quick access

## Configuration

### Removing Webhook Integration (Optional)

To receive ModBox notifications, configure a webhook URL in DevBox Settings:

1. Go to DevBox Settings tab
2. Enter your webhook endpoint
3. DevBox will send `POST` requests with configuration change events

**Webhook Payload Structure:**
```json
{
  "type": "config_updated|reasons_changed|usernotes_changed|actions_changed",
  "subreddit": "your_subreddit",
  "changedFields": ["field1", "field2"],
  "timestamp": 1691516400000,
  "modifiedBy": "moderator_username"
}
```

### Usernote Types

Default usernote types included:
- **N** (Note) - General moderator note
- **W** (Warning) - User warning  
- **B** (Ban) - User banned
- **M** (Mute) - User muted
- **P** (Positive) - Positive interaction

Customize colors, labels, and descriptions in the Config Editor tab.

### Removal Reasons

Create multiple removal reason sets organized by category:
- Define reason templates with variables
- Set which reasons are default
- Track reason usage statistics

## Data Storage

Configuration data is stored in Reddit's KVStore with the following key structure:

```
devbox:config:{subreddit}       - Main configuration object
devbox:reasons:{subreddit}      - Removal reason sets
devbox:usernotes:{subreddit}    - Usernote type configuration
devbox:actions:{subreddit}      - Quick action templates
```

**TTL:** 30 days (automatic cleanup)

## Integration with ModBox Extension

The ModBox extension can:

1. **Fetch config from DevBox** - Pull latest removal reasons and usernote types
2. **Receive notifications** - Get instant updates when DevBox config changes
3. **Log actions back** - Send moderation data to DevBox for analytics

### ModBox Configuration File

Add to your ModBox extension configuration:

```javascript
{
  "devbox": {
    "enabled": true,
    "appPostUrl": "https://reddit.com/r/your_subreddit/comments/...",
    "webhookUrl": "https://your-webhook-endpoint.com/devbox",
    "autoSync": true,
    "syncInterval": 3600000  // 1 hour
  }
}
```

## Development

### Project Structure

```
extension-devvitbuild/
├── src/
│   ├── types.ts              # Shared data types
│   ├── storage.ts            # KVStore operations
│   ├── notifications.ts      # Webhook handlers
│   ├── index.tsx             # Main app entry
│   └── screens/
│       ├── ConfigEditor.tsx  # Config management UI
│       ├── Dashboard.tsx     # Analytics dashboard
│       └── Settings.tsx      # App settings
├── package.json
├── tsconfig.json
├── devvit.yaml              # Devvit app manifest
└── README.md
```

### Adding New Screens

1. Create new file in `src/screens/`
2. Implement as Devvit Block component
3. Add navigation in `src/index.tsx`

### Testing Locally

```bash
npm run dev
```

This starts a development server with hot reload.

## Audit Logging

All configuration changes are logged with:
- Timestamp
- Moderator username
- Action type
- Changed fields
- Old and new values

Logs can be exported for compliance and analysis.

## Troubleshooting

### Config changes not syncing to ModBox
- Check webhook URL in Settings is correct
- Verify webhook endpoint is accessible
- Check ModBox extension console for errors

### KVStore errors
- Ensure Devvit app has KVStore permission
- Check subreddit's app configuration
- Review Devvit logs for storage issues

### Performance issues
- Increase cache TTL for less frequently changed configs
- Consider pagination for large reason sets
- Monitor KVStore usage patterns

## Future Roadmap

- [ ] Automation engine (auto-removal, auto-assign)
- [ ] Advanced analytics dashboard
- [ ] Mod activity reports
- [ ] Appeal workflow management
- [ ] Scheduled bulk operations
- [ ] Integration with other moderation bots
- [ ] Custom alert rules
- [ ] Multi-subreddit management

## Contributing

To contribute improvements:

1. Fork the ModBox repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT - See LICENSE in parent directory

## Support

For issues, questions, or suggestions:
- [ModBox GitHub Issues](https://github.com/your-repo/issues)
- [Reddit Devvit Docs](https://developers.reddit.com/docs/devvit)

---

**DevBox v1.0** - Companion for ModBox Extension
