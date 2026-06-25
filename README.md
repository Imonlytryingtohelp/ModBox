# ModBox

**A lightweight, Reddit-native browser extension that brings Toolbox-style moderation tools directly into Reddit.**

![Version](https://img.shields.io/badge/version-1.6.0-blue) ![License](https://img.shields.io/badge/license-Apache%202.0-blue)

---

## What is ModBox?

ModBox is a moderation extension for Reddit that helps you moderate faster **without leaving the page**. It brings tools directly into Reddit's interface, inspired by the legendary [Reddit Toolbox](https://www.reddit.com/r/toolbox) extension.

Whether you're removing spam, banning users, organizing removal reasons, or executing complex multi-step workflows—ModBox keeps everything in context with a clean, modern interface.

**Works on:** www.reddit.com, old.reddit.com, mod.reddit.com, and sh.reddit.com

---

## Key Features

### 🎯 Quick Moderation Actions

**Quick moderation directly on posts and comments:**
- **Remove** content with categorized removal reasons
- **Approve** posts and comments
- **Ban/Unban** users (temporary or permanent)
- **Spam** content with removal messages
- **Flair** posts and edit user flair
- **Add usernotes** while you act (no need to switch tabs)

### 📋 Inline Action Pills

**Quick-access buttons next to usernames:**
- **N** - Open user notes editor (full Toolbox compatibility)
- **H** - View user history (account age, karma breakdown, domain/subreddit stats)
- **P** - Open user profile (overview, posts, comments)
- **R** - Nuke comment and reply tree (if enabled in settings)
- **ML** - Show modlog entries for this post/comment

### 📦 Queue Management

**Powerful bulk moderation tools:**
- **Batch select** items from your queues
- **Bulk actions** (approve/remove/spam all selected)
- **Live queue counts** with background refresh
- **Context preview** before taking action
- **Modlog display** showing recent actions on each item

### 🔧 Playbooks & Workflows

**Multi-step automation:**
- **Playbooks** - Chain actions together (remove + ban + usernote + modmail)
- **Quick Actions** - Pre-configured buttons for common workflows
- **Templated messages** - Use variables in removal comments and bans
- **One-click execution** - Replace multiple clicks with 1

### ⚙️ Wiki-Powered Configuration

**Store all config in your subreddit's wiki (no extra setup):**
- **Removal reasons** - Categorized, with dropdowns and suggested usernote types
- **Quick Actions** - Custom macro buttons for your subreddit
- **Playbooks** - Complex workflows saved to wiki
- **No ModBox account needed** - Everything is local to your browser

### 🎨 Modern UI

- **Dark/Light theme** support with auto-detection
- **Responsive design** that works everywhere
- **Smooth animations** and instant feedback
- **Toast notifications** for action status
- **Theme options** for removal reason editor, modlog colors, and more

---

## Installation

### Chrome / Edge / Brave

**Please note: I recommend running on Chrome for now**

1. Download the latest `.zip` file from [Releases](https://github.com/Imonlytryingtohelp/ModBox/releases)
2. Extract the zip file to a folder
3. Go to `chrome://extensions` (or `edge://extensions` / `brave://extensions`)
4. Turn on **Developer mode** (top right toggle)
5. Click **Load unpacked** and select the extracted folder
6. ✅ Done! Look for ModBox buttons on any moderated subreddit

---

## Quick Start

### 1️⃣ Find ModBox on a Post or Comment

Navigate to a subreddit you moderate on old.reddit.com (works best there). You'll see a **MOD ACTIONS** button appear.

### 2️⃣ Common Actions

**Remove with a reason:**
1. Click **MOD ACTIONS**
2. Select a removal reason from the dropdown
3. (Optional) Add a usernote
4. Click **Remove** ✓

**Bulk moderate a queue:**
1. Go to `/r/yoursubreddit/about/modqueue`
2. Use the ModBox queue bar to filter and select items
3. Click **Approve**, **Remove**, or **Spam** ✓

**Check user history:**
1. Click the **H** pill next to a username
2. See account age, karma, top domains/subreddits ✓

**Add a user note:**
1. Click the **N** pill next to a username
2. Manage all notes on that user (Toolbox format) ✓

---

## Configuration

### Setting Up Wiki Config (Optional)

For custom removal reasons, quick actions, and playbooks, create these pages in your subreddit's wiki:

- `wiki/modbox_removal_config` - Your removal reasons (Toolbox format)
- `wiki/modbox_quick_actions` - Custom quick action buttons
- `wiki/modbox_playbooks` - Multi-step workflows

**If you don't create these pages, ModBox works fine with basic actions.**

### Editing Settings

1. Open any moderated subreddit
2. Click the **ModBox Queue Box** (bottom right)
3. Click the **gear icon** (⚙️)
4. Edit theme, notification settings, queue bar position, etc.
5. Click **Save Changes**

See [mod_wiki.md](mod_wiki.md) for detailed configuration guides.

---

## How It Works

### Architecture

ModBox is built as a modular content script. Each feature is independent and clearly organized:

```
extension/modules/
├── services/               # API wrappers & utilities
│   ├── reddit-api.js       # Reddit API integration
│   └── wiki-loader.js      # Wiki config parsing
├── features/               # 24 feature modules
│   ├── overlay.js          # Core moderation panel
│   ├── queue-tools.js      # Bulk moderation
│   ├── removal-config.js   # Removal reason logic
│   ├── usernotes.js        # Usernotes (Toolbox format)
│   ├── history-popup.js    # User history modal
│   ├── playbooks.js        # Multi-step workflows
│   └── ...17 more features
└── constants.js, state.js, utilities.js
```

All modules are bundled into `build/content.js` (~686 KB).

### Toolbox Compatibility

ModBox is **compatible with Toolbox** for:
- ✅ Removal reason format and parsing
- ✅ Usernotes (read and write)
- ✅ Inline pill buttons (N/H/P/R/ML)
- ✅ User history statistics

But ModBox adds:
- 🆕 Modern responsive UI
- 🆕 Playbooks for automation
- 🆕 Wiki-based configuration  
- 🆕 In-action usernotes (add notes while removing)
- 🆕 Queue modlog display
- 🆕 Canned replies for quick responses

---

## Features in Detail

### Moderation Overlay

The main panel that appears when you click **MOD ACTIONS**:

**Post/Comment Actions Tab:**
- Remove with categorized reasons
- Set removal reason dropdowns
- Approve without removal
- Mark as spam
- Auto-select removal reason categories (for posts vs comments)

**User Actions Tab:**
- Ban users (temporary or permanent)
- Ban message with templating (auto-includes post/comment link)
- Unban users
- Set/edit user flair

**Quick Actions Tab:**
- Pre-configured buttons for common tasks
- Customizable via wiki configuration

**Playbooks Tab:**
- Complex workflows in one click
- Chain removal → ban → modmail → usernote
- Add optional confirmation prompts
- Edit/add new playbooks in settings

**Settings Tab:**
- Theme (auto/light/dark)
- Auto-close after successful action
- Comment nuke settings
- Notifications and queue display options

### Queue Management

**Queue bar** appears on modqueue, unmoderated, and reports:
- Filter by post/comment type
- Search by keyword
- Bulk select checkboxes for multiple items
- Bulk action buttons (Approve All, Remove All, Spam All)
- Context preview before taking action
- Displays last 2 modlog entries under each item

### Inline Pills

Appear next to every username:

| Pill | Action |
|------|--------|
| **N** | Edit user notes (Toolbox format) |
| **H** | Show user history & stats |
| **P** | Open user profile modal |
| **R** | Remove comment + reply tree (nuke) |
| **ML** | Show recent modlog actions |

*(Can be toggled on/off in settings)*

### Usernotes

**Full Toolbox compatibility:**
- View all notes on a user
- Add color-coded notes with types (ban, warning, etc.)
- Delete notes
- Edit note types
* Reddit native modnotes support (read-only)

### Canned Replies

Quick-access buttons for common messages:
- Store templates in wiki
- One-click copy to clipboard
- Available in modmail and comments
- Mod-specific (not shared between moderators)

---

## Supported Platforms

| Platform | Support |
|----------|---------|
| www.reddit.com | ✅ Full |
| old.reddit.com | ✅ Full (recommended) |
| mod.reddit.com | ✅ Full |
| sh.reddit.com | ✅ Pills only (work in progress) |
| Mobile | ❌ Not supported |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| ModBox buttons don't appear | 1. Confirm you're a moderator 2. Refresh the page 3. Check supported platform |
| Queue shows no items | Switch between queue tabs to refresh |
| Usernotes seem outdated | Reopen the notes editor to refresh |
| Config isn't loading | Check wiki page name: `modbox_removal_config`, `modbox_quick_actions`, `modbox_playbooks` |
| Extension won't install | Enable Developer Mode in `chrome://extensions` |

For more help, check the [mod_wiki.md](mod_wiki.md) guide.

---

## Guides

- **[Moderator Guide](mod_wiki.md)** - Detailed walkthrough of all features
- **[Changelog](CHANGELOG.md)** - Release history and updates
- **[GitHub](https://github.com/Imonlytryingtohelp/ModBox)** - Source code and issue tracking

---

## Permissions

ModBox requests minimal permissions:

- **`storage`** - Save your settings locally
- **`cookies`** - Read Reddit authentication
- **`host_permissions`** - Access Reddit domains for moderation

No data is sent to external servers. Everything runs locally in your browser.

---

## Development

### For Developers

- **Source:** `extension/modules/` (modular architecture)
- **Build:** `scripts/build-content.ps1` (PowerShell)
- **Testing:** Load unpacked from `build/` folder
- **Releases:** `scripts/create-release.ps1` (generates .crx and .zip)

See the [extension directory](extension/) for architecture details.

### Debugging

1. Open DevTools on Reddit (F12)
2. Look for `[ModBox]` console messages
3. Check DevTools **Storage** > **Local Storage** for state

---

## License

**Apache License 2.0** - Use, modify, and distribute freely, but you must provide attribution to the original project.

---

## Credits

**ModBox** is inspired by and built with respect for [Reddit Toolbox](https://www.reddit.com/r/toolbox), the gold standard of Reddit moderation tools.

ModBox aims to preserve Toolbox's philosophy (fast, in-context moderation) while offering a modern UI and new features like playbooks.

**Special thanks to:**
- The Toolbox team for setting the standard
- All moderators using ModBox to keep Reddit clean


