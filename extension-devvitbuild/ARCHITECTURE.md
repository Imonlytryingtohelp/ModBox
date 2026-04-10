# DevBox Architecture & Integration Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    REDDIT INFRASTRUCTURE                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MODERATORS' BROWSER (Client-side)                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  ModBox Extension (Chrome/Firefox)             │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │ • Inline pill buttons (N, H, P, ML)            │  │  │
│  │  │ • Real-time DOM manipulation                   │  │  │
│  │  │ • Usernotes editor UI                          │  │  │
│  │  │ • Quick removal actions                        │  │  │
│  │  │                                                │  │  │
│  │  │ [New] Config Fetcher:                          │  │  │
│  │  │ • Pulls removal reasons from DevBox            │  │  │
│  │  │ • Listens for webhook notifications            │  │  │
│  │  │ • Sends mod actions to DevBox audit log        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │           ↕ (Webhook API)                            │  │
│  │           ↕ (Message Bridge)                         │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Browser Console / Extension Background       │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │ • Webhook listener                             │  │  │
│  │  │ • Config cache (IndexedDB)                     │  │  │
│  │  │ • Error handling & fallbacks                   │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│                           ↕↕↕                               │
│              (HTTPS / Reddit OAuth API)                      │
│                           ↕↕↕                               │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  r / your_subreddit                                  │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  DevBox Companion Devvit App                   │  │  │
│  │  ├────────────────────────────────────────────────┤  │  │
│  │  │ (Custom Post Type: "DevBox Manager")           │  │  │
│  │  │                                                │  │  │
│  │  │  Navigation Tabs:                             │  │  │
│  │  │  ┌─────────────────────────────────────────┐  │  │  │
│  │  │  │ Config Editor: Removal Reasons/Usernote │  │  │  │
│  │  │  │ Dashboard: Analytics & Metrics           │  │  │  │
│  │  │  │ Settings: Webhooks & Preferences        │  │  │  │
│  │  │  └─────────────────────────────────────────┘  │  │  │
│  │  │                                                │  │  │
│  │  │  Backend:                                      │  │  │
│  │  │  ├─ Reddit KVStore (Persistence)             │  │  │
│  │  │  ├─ Audit Logging                            │  │  │
│  │  │  ├─ Webhook Notifications                    │  │  │
│  │  │  └─ Config Change Events                     │  │  │
│  │  │                                                │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  Accessible at: r/sub/comments/{postId}/...         │  │  │
│  │  (Mods bookmark this for quick access)              │  │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Configuration Sync Flow
```
┌──────────────────────────────────────────────────────────────────────┐
│                   INITIAL LOAD (On Extension Startup)               │
└──────────────────────────────────────────────────────────────────────┘

  ModBox Extension                           DevBox App
       │                                         │
       │  1. User visits subreddit               │
       │  ────────────────────────────────────→ │
       │                                         │
       │  2. GET /api/devbox/config/sub         │
       │  ────────────────────────────────────→ │
       │                                         │
       │  3. Fetch from KVStore                 │
       │  ←────────────────────────────────────│
       │                                         │
       │  4. Cache locally (IndexedDB)          │
       │  ↓                                      │
       │  Ready for inline editing              │
```

### Webhook Notification Flow
```
┌──────────────────────────────────────────────────────────────────────┐
│               LIVE UPDATE (Admin Edits Config in DevBox)            │
└──────────────────────────────────────────────────────────────────────┘

  ModBox Extension                           DevBox App
       │                                         │
       │                                  1. Admin edits config
       │                                  2. Clicks "Save"
       │                                         ↓
       │                                  3. Updates KVStore
       │                                  4. Sends webhook POST
       │                                         │
       │ webhook: {                              │
       │   type: "reasons_changed",              │
       │   subreddit: "sub",                     │
       │   changedFields: ["reasons"],           │
       │   timestamp: 1691516400000              │
       │ }                                       │
       │ ←────────────────────────────────────│
       │         5. Receive notification        │
       │         ↓                               │
       │    6. Update local cache                │
       │    7. Refresh UI                        │
       │    8. Show "Config updated" notification
```

### Audit Logging Flow
```
┌──────────────────────────────────────────────────────────────────────┐
│          MOD ACTION LOGGING (Moderator Uses ModBox Tools)           │
└──────────────────────────────────────────────────────────────────────┘

  ModBox Extension                           DevBox App
       │                                         │
       │  1. Mod clicks "Remove" pill            │
       │  2. Local action (instant UX)           │
       │  ↓                                       │
       │  3. Log action:                         │
       │  {                                      │
       │    type: "remove",                      │
       │    subreddit: "sub",                    │
       │    moderator: "mod_name",               │
       │    reason: "Rule 1: No spam",           │
       │    timestamp: 1691516400000             │
       │  }                                      │
       │  ────────────────────────────────────→ │
       │                                    4. Store in audit log
       │                                    5. Update analytics
       │ ←───────── Ack ────────────────────── │
       │  (Can show in Dashboard later)         │
```

## Component Interaction Details

### When Would Each Component Be Used?

**ModBox Extension (Client)**
- ✅ Browsing comments/posts (always active)
- ✅ Editing removal reasons locally
- ✅ Quick mod actions (remove, approve, etc.)
- ✅ Inline usernotes editing
- ❌ Managing subreddit-wide config templates
- ❌ Viewing audit logs
- ❌ Analytics dashboards

**DevBox App (Server)**
- ✅ Admin configures removal reason sets
- ✅ Admin customizes usernote types
- ✅ View subreddit mod statistics
- ✅ Browse audit logs
- ✅ Manage automation rules (future)
- ❌ Edit individual comments/posts
- ❌ Inline moderation during browsing

### Permission Model

```
┌─────────────────────────────────────────────┐
│           ROLE PERMISSIONS                  │
├─────────────────────────────────────────────┤
│ Junior Mod (View permissions)               │
│ ├─ View config in ModBox                   │
│ ├─ View removal reasons                    │
│ └─ Cannot edit in DevBox                   │
├─────────────────────────────────────────────┤
│ Senior Mod (Use permissions)                │
│ ├─ All Junior permissions                  │
│ ├─ Use removal reasons in ModBox           │
│ ├─ Add custom usernotes in ModBox          │
│ └─ Cannot edit config in DevBox            │
├─────────────────────────────────────────────┤
│ Mod Config Admin (Edit permissions)         │
│ ├─ All Senior permissions                  │
│ ├─ Edit removal reason templates           │
│ ├─ Customize usernote types                │
│ ├─ Create removal sets in DevBox           │
│ └─ Manage automation rules (future)        │
└─────────────────────────────────────────────┘

Note: Implementation TBD - could use subreddit roles
or separate permission system in DevBox
```

## Error Handling & Failsafes

```
┌─────────────────────────────────────────────────────────────────┐
│              ERROR SCENARIOS & RESILIENCE                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│ Scenario 1: DevBox Unavailable                                 │
│   ModBox Action: Use cached config from IndexedDB              │
│   Impact: Minor - No config updates, mods can still work       │
│                                                                 │
│ Scenario 2: Reddit OAuth Down                                  │
│   ModBox Action: Queues actions, retries when back             │
│   Impact: Temporary delay in audit logging                     │
│                                                                 │
│ Scenario 3: Webhook Delivery Failed                            │
│   ModBox Action: Retry with exponential backoff                │
│   Impact: Config updates delayed, eventual consistency         │
│                                                                 │
│ Scenario 4: KVStore Full                                       │
│   DevBox Action: Archive old config versions                   │
│   Impact: None (automatic cleanup at 30-day TTL)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

**Frontend (ModBox Extension)**
- JavaScript / TypeScript
- Chrome Extensions API / Firefox WebExtensions API
- IndexedDB (local caching)

**Frontend + Backend (DevBox App)**
- TypeScript
- Devvit API
- Block Kit (UI framework)
- KVStore (Persistent data)

**Communication**
- HTTP/HTTPS (REST API calls)
- Webhooks (Event notifications)
- Message passing (between content/background scripts)

---

## Scalability Considerations

### Multi-Subreddit Support
- Each subreddit gets its own config namespace
- KVStore keys prefixed: `devbox:config:{subreddit}`
- Webhook URLs configurable per subreddit

### Large Subreddits
- Config kept minimal (removal reasons, usernote types)
- Heavy analytics deferred to future phase
- Real-time stats fetched on-demand vs pre-computed

### Moderator Teams
- DevBox accessible to all subreddit mods (via page)
- Permissions extended via mod role system (future)
- Audit logs track who made changes

---

## Future Enhancement Hooks

The PoC includes extension points for:

1. **Automation Engine**
   - Config in DevBox has "automation_rules" field
   - ModBox can execute rules on mod actions

2. **Real Analytics**
   - DevBox collects action logs
   - Generates dashboards in Dashboard tab
   - Can export data for external analysis

3. **Appeal System**
   - Mod action → Appeal request → DevBox review
   - Assign to appeal team → Notification

4. **Multi-Sub Federation**
   - Cross-subreddit removal reason library
   - Shared modmail templates
   - Federated mod team coordination

These can be added incrementally without breaking existing functionality.
