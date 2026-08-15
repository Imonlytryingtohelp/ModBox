# Changelog

All notable changes to this project are documented in this file.

## 1.8.4 - More Bug Fixes

- **Fixed** [~~Issue #3~~](https://github.com/Imonlytryingtohelp/ModBox/issues/3) About page now correctly displays links in changelogs. 
- **Updated** About page changelog view now preserves markdown formatting. (Bold, italics, etc.)
- **Updated** Playbook confirmation popup now warns when running a playbook with a ban step. 

## 1.8.3 - Bug Fixes + Wiki Update

- **Fixed** Queue bar can only be dragged from a dedicated drag area. Preventing box movement when clicking buttons. 
- **Fixed** Post Preview module no longer breaks ModBox GUI if the post contains code-blocks.
- **Wiki Update** Updated [wiki](https://github.com/Imonlytryingtohelp/ModBox/wiki) to include current feature set. 

## 1.8.2 - Queue Box Improvements

- **Draggable Queue Bar** - ModBox Queue Bar can now be moved temporarily by clicking and dragging the header to reposition it out of the way of native Reddit buttons or other elements. The box stays in the new position until the page is refreshed or the header is double-clicked to snap back to the original preset position.

## 1.8.1 - Bug Fixes

- **Fixed** malformed "Open on Reddit" link generation. `buildRedditUrl()` now normalizes permalinks (handles absolute and protocol-relative URLs, recovers from malformed inputs like `https//...`) and ensures the correct reddit host.    
- Added a `Download Latest Release` button to the About ModBox popup, using the update checker’s release URL and falling back to the GitHub Releases page when no direct download link was available.
- Updated the About ModBox popup so the changelog section scrolls independently, removing the outer modal scrollbar for a cleaner display.
- Modbox Link Generator on about page is now hidden by default and can be enabled in `Extension Settings`   
- Re-enabled Notes and Profile view pill buttons in modmail conversations. 

## 1.8.0 - Reddit Host Compatibility

- Temporarily disabled inline ModBox pill buttons on `www.reddit.com` and `sh.reddit.com` to avoid layout issues while preserving queue bar functionality.
- Added an `old.reddit` button to the ModBox Queue Bar on `www.reddit.com` and `sh.reddit.com` for quick post navigation.

## 1.7.2 - Queue Bar Z-Index Fix

- Lowered the ModBox Queues box stacking order so the Reddit chat overlay on `reddit.com` `old.reddit.com` and `sh.reddit.com` displays on top.

## 1.7.1 - Repost Checker Fixes

- Fixed CSS precedence so the Repost Checker warning (orange) takes visual precedence over the available (blue) state.
- Hidden the current post from the Repost Checker table while keeping it in fetched results; the module still passes and uses `currentPostId` to avoid self-matches, and availability counts only consider prior posts (the current post is excluded from the availability count).
- Improved post-id extraction in `dom-binding.js` for listing views (derive from element attributes/target when pathname is not sufficient).
- Added runtime debug logs (`[ModBox][RepostChecker][preload]` and `[ModBox][RepostChecker][open]`) to help diagnose matching and availability decisions.
- Added a footer note in the Repost Checker popup explaining the current post is not shown in the list.
- Repost Checker title links now respect the "Target host for queue bar links" extension setting (uses configured link host instead of always opening reddit.com).
- Silenced a non-actionable console error about the message channel closing when fetching native modnotes to avoid showing an error indicator in the extension.


## 1.7.0 - Repost Checker + Bug Fixes

- Prevented users clicking "remove" when no reason is selected in removal reasons GUI. 
- Added `RC` (Repost Checker) pill: shows a user's recent submissions in the subreddit and highlights possible reposts. The pill preloads data in the background on page load so it updates colour state without clicking.




## 1.6.0 - QoL Improvements

### Improved

- **Extension settings organization** - Reorganized settings into logical groups.
- **Extension settings labels** - Clearer, more direct wording.
- **Extension settings help text** - Added clarification for queue bar options.
- **Settings modal layering** - Fixed queue bar z-index so the Extension Settings screen and reddit chat display on top.
- **Auto scroll and auto keys** - Hidden the internal reason key field behind an override toggle so users only see it when needed. Auto scroll page to new item when adding removal reasons, quick actions or playbooks.
- **Repo tidying** - Removed redundant fils and streamlined release process. 


## 1.5.4 - Bug Fixes

- Changes to canned replies. Improving load speed and usability. 
- Disabled caching for wiki loads before writes. Making multiple new notes quickly no longer overwrites previous notes. 
- Fixed playbook editor modal collapsing when clicking dropdowns

## 1.5.3 - Removal Reason Dropdown Validation

- Removal reasons with dropdown options now require all dropdowns to be completed before removal
- Remove button is disabled when any dropdown selection is incomplete
- Clear validation message displays above buttons explaining which dropdowns need values
- Prevents accidental removals without completing required dropdown selections

## 1.5.2 - Ban Message Improvements

- Prefilled default ban message in User Actions ban panel with link to the post/comment that contributed to the ban
- Ban message is editable before sending
- Usernotes modlog entries now include "via ModBox" to indicate they were created by the extension

## 1.5.1 - UI + ModBox Links Fixes

- About page now only displays one close button.   
- Suppressed non-critical errors so they don't appear in chrome. 
- Moved ModBox link generator to the about page. 
- Fixed z-index issue with ModBox link generator page. It now displays correctly on top of the current window.
- Updated ModBox link generator to include subreddit, ban duration, and, note type. 

## 1.5.0 - Update Checker

- Automatically checks for new updates every 6 hours. 
- ModBox Queues will display "Update available!" and turn orange when an update is available. 
- Extension loads version from reddit, so no additional permissions required. 
- About page (info icon in ModBox Queues box) now shows current version, changelog, and a manual update checker. 

## 1.4.2 - ModBox Links Updates & Bug Fixes

- Further Z-index fixes to restore functionality on new/sh reddit. 
- ModBox Links now display cleanly when using the extension. 
- ModBox Links now display a toast notification when clicked. 

## 1.4.1 - Bug Fixes

- Fixed Z-index issue causing incorrect element layering 
- Added Extension Settings option to position ModBox Queues Box at bottom-left or bottom-right 
- Canned replies now function on non-moderated subreddits and non-subreddit pages. 

## 1.4.0 - ModBox Links

### Added

- **ModBox Links** - New `modbox://` protocol links for executing moderation actions with a single click:
  - Currently limited to one-click bans. 
  - Ban users with `modbox://ban?user=username&reason=message&subreddit=subreddit`
  - Set temporary ban durations with `durationDays` parameter (e.g., `durationDays=7` for 7-day ban, omit for permanent)
  - Automatically add Toolbox usernotes with `note` and `notetype` parameters (e.g., `note=spam&notetype=Temp+Ban`)
  - Auto-detect subreddit from current page or modmail thread, or explicitly set via `subreddit` parameter
  - Toast notifications confirm action completion with ban duration and note type details

## 1.3.5 - Canned Replies Editor

### Added

- **Canned Replies editor GUI** - Edit button in canned replies modal opens a dedicated editor interface
- **Add/remove/edit canned replies** - Full CRUD operations for managing canned replies directly in the GUI

## 1.3.4 - Usernotes & Canned Replies Improvements

### Improved

- **Canned Replies clipboard copy** - Changed behavior to copy reply text to clipboard instead of auto-filling reply textareas, with visual confirmation notification
- **Canned Replies button placement** - Relocated canned replies button from individual reply forms to the ModBox Queue Bar header for quicker access
- **Usernotes deletion workflow** - Removed confirmation modal when deleting notes for faster, more streamlined deletion

## 1.3.2 - Bug Fixes

### Fixed

- **Removal reason textarea HTML entity encoding** - Fixed quotes and special characters in removal reason descriptions being displayed as HTML entities (`&#39;`, `&quot;`) instead of actual characters after save and reload

## 1.3.1 - Canned Replies & Documentation

### Added

- **Canned Replies feature** - Quick-access buttons for canned moderation responses next to reply forms (modmail, comments). Integrates with wiki configuration for customizable reply templates.
- **Various Bug Fixes** ready for mod testing. 

## 1.2.2 - Fixes

### Fixed

- **Usernote author display** - Restored moderator name display in usernote popup headers (shows as "u/moderatorname · date")

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
