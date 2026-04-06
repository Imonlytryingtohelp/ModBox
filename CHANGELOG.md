# Changelog

All notable changes to this project are documented in this file.

## 1.2.0 - Reddit Native Usernotes

### Added

- **Read-only Reddit native usernotes** - Display native modnotes (Reddit's built-in usernotes) alongside Toolbox usernotes with full deletion support for your own notes
- **Request deduplication for native notes** - Automatically deduplicate concurrent API requests for the same user to prevent rate limiting when viewing pages with many users
- **Global "Open on Reddit" link host setting** - The "Open on Reddit link host" setting now applies across all modules (profile view, context popups, and overlay) not just the queue bar

### Improved

- **Extension settings label** - Renamed "Queue bar link host" to "Open on Reddit link host" for clarity on what the setting controls

## 1.1.2 - Fixes

### Fixed

- **Profile view removed items dark mode** - Fixed removed post/comment highlighting to work in both light and dark themes.
- **Modlog entries in mod queues** - Fixed an issue causing extra lines. Each entry is now on it's own line with no gaps. 

## 1.1.1 - Queue Modlog Display

### Added

- **Modlog entries in mod queues** - Display the last 2 modlog entries (if any) below each post/comment in the modqueue, unmoderated, and reports queues for quick context without leaving the queue page or clicking `ML`.
- **Removed post highlighting in profile view** - Posts and comments removed in your moderated subreddits are now highlighted with a red background in the profile view modal for quick visual identification.



## 1.1.0 - Fast UX & Background Execution

### Added

- **Background action execution** - Removals, Quick Actions, and Playbooks now execute in background with fast overlay close for snappier UX
- **Toast notifications** - Real-time feedback on action completion/errors (auto-dismiss after 5 seconds, top-right fixed position)
- **Complete removal workflow in background** - Removals now run full logic in background including:
  - Post flair application
  - Item locking
  - Removal comment posting
  - Modmail notifications
  - Usernote saving

### Improved

- **Playbook step handlers** - Restored all playbook step types:
  - Removal with full workflow
  - Comment posting
  - Lock/unlock items
  - Approve items
  - Ban/unban users
  - Send modmail
  - Set post/user flair
  - Add usernotes
  - Distinguish comments
- **Quick Actions performance** - Now execute in background with instant overlay close
- **Overlay data persistence** - Background actions have access to overlay state for feature-complete execution

## 1.0.1 - Bug Squashing

### Fixed

- **MOD ACTIONS target detection** - Fixed issue where MOD ACTIONS button would target wrong post/comment on www.reddit and sh.reddit. Now correctly extracts fullname from element `id` attribute as priority #1.
- **Queue bar spacing** - Fixed inconsistent spacing in queue bar container on www.reddit and sh.reddit layouts (3 locations corrected).
- **Quick Actions "Lock item" label** - Changed from "Lock post after action (posts only)" to "Lock item" to reflect that it now works on both posts and comments.
- **Quick Actions optional comment** - Quick Actions no longer require an empty comment body; other actions (lock, ban, etc.) now execute even without a comment.
- **Pill buttons in new reddit modqueues** - N,H,P and Mod Actions now correctly appear in the new reddit (shreddit) mod queues. 

## 1.0.0 - First Release

### Added

#### Core Moderation Features
- **Moderation overlay** - In-page overlay for approve, remove, spam, ban/unban, lock/unlock, and flair actions
- **Inline moderation pills** - Quick-access buttons next to usernames:
  - **N** - Usernotes editor (Toolbox-compatible format)
  - **H** - User history popup (karma, account age, domain/subreddit statistics)
  - **P** - User profile modal (overview, submissions, comments tabs)
  - **R** - Inline remove button on post/comment
  - **ML** - Modlog popup showing recent actions on current item
- **Comment nuke** - Remove comment and entire reply tree with configurable distinguished comment handling
- **Approve/Remove visual indicators** - Colored borders applied to moderated items (red for remove/spam, green for approve)

#### Queue Tools
- **Queue bar** - Appears on mod queue pages with queue counts, filters, and status
- **Multi-select checkboxes** - Select multiple queue items for bulk actions
- **Bulk moderation** - Approve, remove, or mark-as-spam multiple items simultaneously
- **Queue filtering** - Filter by post/comment type with keyword search
- **Context popup** - Quick preview of post/comment content before moderation
- **Queue count caching** - Local persistence with 4-hour TTL and background refresh

#### Configuration & Settings
- **Wiki-backed config** - Pull removal reasons, quick actions, and playbooks from subreddit wiki
- **Removal reasons editor** - Add, edit, and organize removal reasons per-subreddit
- **Quick Actions** - Macro buttons for common mod workflows (e.g., "Remove + Ban")
- **Playbooks** - Complex multi-step workflows with:
  - Remove steps with optional comment as subreddit
  - Ban/unban options (temporary, permanent)
  - Comment posting with templates
  - Modmail sending with templates
  - Lock/unlock and approve actions
  - Custom flair setting
  - Distinguish/undistinguish comments
- **Suggested note types** - Per-removal-reason usernote type dropdown

#### Theme & Customization
- **Theme mode setting** - Auto, Light, Dark modes with persistent storage
- **Light/Dark theme CSS** - Complete styling for all ModBox surfaces
- **Inline pill customization** - Enable/disable N/H/P/R/ML buttons individually
- **Auto-close setting** - Automatically close overlay after successful removal/playbook
- **Extension settings editor** - Full GUI for all extension preferences

#### User Management
- **Usernotes support** - Full read/write support for Toolbox usernote format
  - Add notes with customizable note types per-subreddit
  - View note history with timestamps
  - Sync to subreddit wiki
  - Uses existing toolbox usernotes wiki page.
- **User history modal** - Detailed stats on user activity:
  - User karma (link, comment)
  - Account age and trophies
  - Top domains submitted to (with ratios)
  - Top subreddits submitted to (with karma counts)
  - Top subreddits commented in
  - Account/media provider statistics
- **User profile modal** - Comprehensive user view with:
  - User info sidebar (avatar, karma, trophies)
  - Three tabs: Overview, Submitted, Comments
  - Search and filtering within tabs
  - Moderator subreddit listing

#### API & OAuth Integration
- **Reddit API wrapper** - OAuth-based authentication for authenticated requests
- **Modmail integration** - Send modmail from subreddit modteam with templates
- **User flair management** - Apply/remove user flair directly from overlay
- **Post flair management** - Set post flair from removal overlay
- **Ban management** - Temporary and permanent ban support and unban

#### Platform Support
- **Multi-site support** - Support for:
  - www.reddit.com (new Reddit)
  - old.reddit.com (classic Reddit)
  - sh.reddit.com (shreddit)
  - mod.reddit.com (mod pages)
- **Native Reddit button integration (old reddit only for now)** - Interception of native Reddit approve/remove buttons with visual feedback
- **Dark mode detection** - Automatic theme selection based on Reddit's system theme

#### Performance & UX
- **Request scheduling** - Lightweight scheduler for background requests (2-concurrent, 10s cache TTL)
- **Mutation observer optimization** - Scoped container binding to reduce lag on heavy subreddits
- **Queue bar fast binding** - Immediate initialization on page load without delays
- **Network retry logic** - Graceful fallback and retry-with-backoff for API failures


### Known Limitations
- Shreddit functionality is restricted to pill buttons only, no native remove capture. 

---

## Release Information

**Build Status:** ✅ All 23 modules verified OK  
**File Size:** ~686 KB (bundled)  
**Supported Platforms:** Chrome, Edge, Chromium  
**Min Requirements:** Manifest v2 compatible browser, Reddit account with mod permissions

**Key Dependencies:**
- Reddit API (json API + OAuth endpoints)
- Browser storage API
- Subreddit wiki (for config)

**Architecture:** Modular content script with 18 feature modules + 2 services + core utilities/state management.

---

## Browser Installation

### Chrome / Chromium / Edge
1. Clone repository
2. Open `chrome://extensions` → Enable Developer mode
3. Click **Load unpacked** → Select `REFACTOR` folder
4. Verify ModBox controls appear on Reddit pages

### Pre-built
- Ready-to-load extension available in `build/` folder

---

## Acknowledgments

ModBox is inspired by [Reddit Toolbox](https://www.reddit.com/r/toolbox), the industry-standard moderation extension. This release brings Toolbox-style workflows to a lightweight, Reddit-native platform.

Special thanks to the Toolbox team and moderation community for establishing the standard that ModBox follows.
