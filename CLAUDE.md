# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LiveVerses is a Bible verse projection application designed for Zoom calls and live worship services. It's a pure client-side HTML/CSS/JavaScript application with no framework dependencies that displays Bible verses in projection-ready format.

**Key constraint:** The app must work via `file://` protocol OR via HTTP server. CORS restrictions prevent `fetch()` from loading local JSON files when opened directly as `file://`, so development and deployment require HTTP serving.

## Running the Application

### Development Server (Required for Testing)
```bash
# Option 1: Python (built-in)
python3 -m http.server 8000
# Then open: http://localhost:8000

# Option 2: For macOS users with nginx
# Files deployed to: /opt/homebrew/var/www/liveverses/
# Access at: http://localhost:8080/liveverses/
```

**Critical:** Never test by opening `index.html` directly in browser - it will fail due to CORS. Always use HTTP server.

### Testing
```bash
# Run all Playwright tests (auto-starts HTTP server)
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Generate user guide screenshots
npm run screenshots
```

## Architecture

### Dual-Window System
The app uses BroadcastChannel API for communication between windows:
- **Control Window** (`index.html`): User inputs verses, changes settings, views history
- **Display Window** (`display.html`): Clean projection view for screen sharing

Messages sent via `liveverses_channel`:
- `UPDATE_DISPLAY` - Send verse HTML to display
- `UPDATE_BACKGROUND` / `UPDATE_TEXT_COLOR` / `UPDATE_FONT_SIZE` - Appearance sync
- `CLEAR_DISPLAY` - Remove verses
- `PING` / `PONG` / `DISPLAY_READY` - Connection health check

### Bible Data Structure
Each Bible version (`kjv.json`, `asv.json`, `web.json`, `nlt.json`) follows this schema:
```javascript
[
  {
    "name": "Genesis",
    "abbrev": "gn",  // CRITICAL: Must match BIBLE_BOOKS in app.js
    "chapters": [
      ["verse 1 text", "verse 2 text", ...],  // Chapter 1 (0-indexed)
      ["verse 1 text", "verse 2 text", ...]   // Chapter 2
    ]
  }
]
```

**IMPORTANT:** Book abbreviations must be consistent across all Bible versions. If adding a new version or editing data, run:
```bash
node scripts/fix-abbreviations.js
```

This script ensures all Bible files use the same abbreviations as defined in `BIBLE_BOOKS` array in `app.js` (sourced from KJV).

### Verse Reference Parsing
The `parseReference()` function in `app.js` handles multiple formats:
- Single verse: `John 3:16`
- Verse range: `Psalm 23:1-6`
- Multiple verses: `John 3:16, Genesis 1:1` (comma-separated)
- Abbreviations: `Gen 1:1`, `1 Cor 13:4`, `Rev 21:4`

Book matching uses three strategies:
1. Full name (case-insensitive): `john` → `John`
2. Aliases: `jn`, `joh`, `jhn` → `John`
3. Abbreviation: `jo` → `John`

### History System
- Stores last 20 verse lookups in `verseHistory` array
- Each entry includes: `{reference, parsedRef, versions[], timestamp}`
- Duplicate detection: Only adds if reference OR versions differ from most recent
- Clicking history item restores both verse and selected versions

## Key Files

### Core Application
- **`app.js`** - Main application logic (530+ lines)
  - Bible data loading and caching
  - Verse parsing and lookup
  - Display rendering (single and multiple verses)
  - Window communication
  - History management
  - Contains `BIBLE_BOOKS` constant (66 books) - source of truth for abbreviations

- **`index.html`** - Control panel UI
  - Verse input with HTML5 datalist autocomplete
  - Version checkboxes (KJV, ASV, WEB, NLT)
  - Layout toggle (stacked/side-by-side)
  - Appearance controls (colors, font size)
  - History panel with click-to-load

- **`display.html`** - Projection view
  - Minimal UI, maximum readability
  - Status indicator (bottom-left: green=connected, red=disconnected)
  - Receives updates via BroadcastChannel

### Data Files (`data/` directory)
- `kjv.json` - King James Version (4.3MB)
- `asv.json` - American Standard Version (5.1MB)
- `web.json` - World English Bible (5MB)
- `nlt.json` - New Living Translation (if available)

### Scripts
- **`scripts/fix-abbreviations.js`** - Ensures abbreviation consistency across Bible files
- **`scripts/fetch_web.py`** - Downloads WEB Bible from bible-api.com
- **`scripts/normalize_bibles.py`** - Standardizes Bible JSON format

### Testing
- **`playwright.config.js`** - Playwright test configuration
  - Auto-starts Python HTTP server on port 8000
  - Runs in Chromium only (workers: 1, fullyParallel: false)

- **`tests/`** directory contains:
  - `quick-test.js` - Fast smoke test for basic verse lookup
  - `test-all-fixes.js` - Comprehensive test of all features
  - `test-history-feature.js` - History functionality tests
  - `user-guide.spec.js` - Screenshot generation for documentation

## Common Development Tasks

### Adding a New Bible Version
1. Add JSON file to `data/` with correct schema
2. Run `node scripts/fix-abbreviations.js` to align abbreviations
3. Update `bibleData` object in `app.js` (line 2)
4. Add checkbox in `index.html` Versions section
5. Add to version selection logic in `lookupVerse()` function
6. Test with: `npm run test:headed`

### Debugging Verse Lookup Issues
1. Check browser console for "Loading [VERSION]..." messages
2. Verify all Bible JSON files loaded: `window.bibleData` in console
3. Test reference parsing: Call `parseReference("John 3:16")` in console
4. Check abbreviation matches: Books must use same `abbrev` values

### Deploying to nginx (macOS)
```bash
# Copy files to nginx web root
cp app.js index.html display.html /opt/homebrew/var/www/liveverses/
cp data/*.json /opt/homebrew/var/www/liveverses/data/

# Fix permissions (nginx runs as 'nobody')
chmod -R a+rX /opt/homebrew/var/www/liveverses/

# Access at: http://localhost:8080/liveverses/
```

## Recent Issues Fixed

1. **ASV abbreviation mismatch** - ASV used "jn" for John while app expected "jo". Fixed by standardizing all versions to KJV abbreviations.

2. **History not capturing translation changes** - History only checked reference, not versions. Now checks both for duplicate detection.

3. **Multiple verses support** - Added comma-separated parsing: `John 3:16, Gen 1:1` displays both verses.

4. **Typeahead autocomplete** - HTML5 datalist with 18 popular verses for quick entry.

## Important Constants

- `MAX_HISTORY` (app.js:13) - Maximum history entries (default: 20)
- `BIBLE_BOOKS` (app.js:121-190) - Canonical book list with abbreviations
- Broadcast channel name: `'liveverses_channel'`
- Display ping interval: 3000ms (3 seconds)
- Connection timeout: 5000ms (5 seconds)
