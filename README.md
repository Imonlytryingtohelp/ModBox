# ModBox

A lightweight, Reddit-native browser extension that brings Toolbox-style moderation tools directly into Reddit, without requiring a separate web app.

**Current release:** `1.0.0`

---

## What is ModBox?

ModBox is a browser extension designed for Reddit moderators who need to action content quickly while staying in context. It works on all major Reddit interfaces (new Reddit, old Reddit, and mod.reddit.com) and provides a comprehensive moderation toolkit directly in the page, inspired by the philosophy and workflows of [Reddit Toolbox](https://www.reddit.com/r/toolbox).

---

## Core Features

### Moderation overlay
Fast, in-page moderation:
- **Approve** posts and comments
- **Remove** with configurable removal reasons
- **Mark as spam** with optional removal message
- **Ban/unban** users with duration options (temporary, permanent)
- **Set flair** on posts
- **Edit user flair** (apply or remove)
- **Playbooks** - Multi-step workflows (remove + comment + note, remove + ban + modmail, etc.)

### Inline moderation pills
Action buttons next to usernames:
- **N** - Opens user notes editor (full toolbox compatibility)
- **H** - Shows user history (account age, karma, top submissions/comments by domain/subreddit)
- **P** - Opens user profile (overview, submissions, comments tabs)
- **R** - Comment nuke
- **ML** - Opens modlog popup showing recent actions on that post/comment

### Queue Tools
Bulk moderation on queue pages (`modqueue`, `unmoderated`, `reports`):
- **Multi-select checkboxes** - Select multiple items at once
- **Bulk actions** - Approve, remove, or mark-as-spam selected items
- **Filtering** - Filter by post/comment, keyword search
- **Queue counts** - Persistent caching of queue sizes with background refresh
- **Context popup** - Quick preview of post/comment context before taking action

### Wiki configuration
All moderation settings backed by your subreddit's wiki (no ModBox config needed):
- **Removal reasons** - Categorized by post/comment type, with suggested usernote types per reason
- **Quick Actions** - Macro buttons for common workflows (e.g., "Remove + ban AutoMod")
- **Playbooks** - Complex multi-step workflows with branching, templating, and modmail integration

### Settings & customization
Browser-based settings panel:
- **Theme mode** - Auto, Light, or Dark
- **Comment nuke behavior** - Skip distinguished comments when removing reply trees
- **Auto-close overlay** - Automatically close after successful actions

---

## How it Works

### Architecture

ModBox is built as a **modular content script** with clear separation of concerns:

```
extension/modules/
├── constants.js          # Version, selectors, configuration defaults
├── state.js              # Global state management (auth, subreddit, etc.)
├── utilities.js          # Shared helper functions
├── services/
│   ├── reddit-api.js     # Reddit API wrappers (json API, OAuth methods)
│   └── wiki-loader.js    # Wiki config parsing and caching
└── features/             # 18 feature modules
    ├── comment-nuke.js        # Remove comment + reply tree
    ├── context-popup.js       # Preview popup for queue items
    ├── core-ui.js             # Native Reddit button interception
    ├── css-injection.js       # Styling + theme support
    ├── dom-binding.js         # Attach UI elements to page
    ├── history-popup.js       # User history modal
    ├── modlog-popup.js        # User modlog popup
    ├── modmail.js             # Modmail integration (mark read, etc.)
    ├── overlay.js             # Core moderation overlay & action dispatch
    ├── profile-view.js        # User profile modal
    ├── queue-bar.js           # Queue counts & filters bar
    ├── queue-tools.js         # Bulk action toolbar
    ├── removal-config.js      # Removal reason parser
    ├── removal-config-editor.js  # Settings editor UI
    ├── theme.js               # Theme detection & switching
    ├── usernotes.js           # Usernotes editor & parser
    └── stubs.js               # Placeholder modules
```

**Build process:** All modules are bundled into a single `build/content.js` (~686 KB minified)

### Toolbox Influence

ModBox borrows heavily from Toolbox's design philosophy:

1. **Removal reasons wiki config** - Same format as Toolbox, parsed and rendered identically
2. **Inline pill buttons** - Modeled after Toolbox's N/H/P pills for quick access
3. **Queue filtering & bulk actions** - Inspired by Toolbox's queue tools usability patterns
4. **Usernotes** - Full support for Toolbox's usernotes format (read/write)
5. **User history** - Renders domain/subreddit statistics like Toolbox's user-history popup

However, ModBox also offers:
- **Modern UI** - Responsive design, dark/light theme support, smooth animations
- **Playbooks** - Multi-step workflows similar to Toolbox's "mod actions" chains
- **In-action notes** - Add a note as you remove, ban, etc. 
- **Shreddit compatibility** - Work in progress, currently functional from pill buttons. 
---

## Supported Platforms

- **www.reddit.com** (Reddit)
- **old.reddit.com** (classic Reddit)
- **mod.reddit.com** (mod pages)
- **sh.reddit.com** (Shreddit)

---

## Installation

### Chrome / Chromium / Edge

1. Download or clone this repository
2. Open `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (top right)
4. Click **Load unpacked**
5. Select the `extension` folder
6. Open any Reddit page and verify ModBox controls appear on posts/comments


### Pre-built Extension

Pre-built versions are available in the `build/` folder:
- `manifest.json` - Extension manifest
- `content.js` - Bundled content script
- `background.js` - Background service worker
- `assets/` - Icons and logo

---

## Quick Start

1. **Navigate to Reddit** (www.reddit.com, old.reddit.com, or mod.reddit.com/r/yoursubreddit)
2. **Open a moderated community** (one where you're a moderator)
3. Look for **ModBox action buttons** in the post/comment area
4. Click any button to open the moderation overlay

### Common Workflows

**Remove Content:**
1. Click the **R** (remove) button on any post or comment
2. Choose a removal reason from the dropdown
3. Optionally set a **usernote** to record the action
4. Click **Remove** → Post gets a **red border** ✓

**Approve Content:**
1. Click **Approve** on any modqueue item
2. Instantly approves
3. Item gets a **green border** ✓

**Bulk Moderation (Queue):**
1. Navigate to `/r/yoursubreddit/about/modqueue` (or unmoderated/reports)
2. A **queue bar** appears with counts, filters, and search
3. Select items and click **Approve**, **Remove**, or **Spam** ✓

**View User History:**
1. Click **H** next to a username
2. Popup shows account age, karma, top domains/subreddits

**Edit User Notes:**
1. Click **N** next to a username
2. Add/edit/remove notes (Toolbox-compatible format)

---

## Configuration

### Wiki Setup (Optional)

ModBox can pull all moderation config from your subreddit's wiki. Create these pages (on old.reddit.com) if you want custom config:

- **Removal reasons** - `wiki/modbox_removal_config`
- **Quick actions** - `wiki/modbox_quick_actions`
- **Playbooks** - `wiki/modbox_playbooks`

If these pages don't exist, ModBox works with basic remove/approve actions.


### Extension Settings

1. Open ModQueue Box on any moderated subreddit
2. Click the **gear icon** (⚙) 
3. Click "Extension Settings"
4. Adjust:
   - **Theme** - Auto, Light, Dark
   - **Comment nuke** - Skip distinguished comments
   - **Auto-close overlay** - Close after actions
5. Save Changes

---

## Development

### Project structure

- **extension/** - Source modules and manifest (development)
- **build/** - Pre-built extension (ready to load unpacked)
- **scripts/** - Build & deployment helpers
- **docs/** - Documentation
- **CHANGELOG.md** - Full release history

### Debugging

1. Open DevTools on any Reddit page (F12)
2. Look for `[ModBox]` console messages
3. Check **Storage** tab for cached config/state

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a complete history of releases and features.

---

## Troubleshooting

**ModBox controls don't appear:**
- Confirm your account moderates the current subreddit
- Reload the extension and refresh the Reddit page
- Check you're on a supported site (www.reddit.com, old.reddit.com, sh.reddit.com)

**Queue appears empty or stale:**
- Switch between queue tabs to refresh
- Verify the subreddit actually has items

**Usernotes/modlog seem outdated:**
- Reopen the overlay/popup to refresh
- Confirm moderator permissions

---

## License

MIT License - See [LICENSE](LICENSE)

---

## Acknowledgments

ModBox is inspired by [Reddit Toolbox](https://www.reddit.com/r/toolbox), the legendary browser extension that set the standard for Reddit moderation tools. ModBox aims to preserve Toolbox's usability while providing a modern alternative.

Special thanks to the Toolbox team and community.

---

## Permissions

The extension requests:
- `storage` - Save extension settings and cache
- `cookies` - Read auth information for Reddit integration
- Host access to Reddit domains for moderation and OAuth flows

See `build/manifest.json` for full details.


