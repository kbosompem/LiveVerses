# YouTube Video Integration for LiveVerses

## Overview
This document describes the YouTube video integration feature added to LiveVerses agenda system, allowing users to include YouTube videos in their service agendas alongside Bible verses.

## Implementation Summary

### Files Modified

1. **`app.js`** - Added video parsing and display functions
   - `parseYouTubeUrl(input)` - Parses YouTube URLs in various formats
   - `getYouTubeThumbnail(videoId)` - Returns thumbnail URL for a video
   - `displayVideo(videoId, autoPlay)` - Displays video in control window
   - `previewVideo(videoId)` - Opens video preview in popup window
   - Updated `displayAgendaItem()` to handle video items
   - Added support for UPDATE_DISPLAY_VIDEO broadcast message

2. **`agenda.js`** (NEW) - Agenda management system
   - `initAgendaSystem()` - Initializes the agenda system
   - `showNewAgendaForm()` / `hideNewAgendaForm()` - Form management
   - `createAgenda()` - Creates new agenda
   - `loadAgenda()` - Loads saved agenda from localStorage
   - `updateAgendaItemsDisplay()` - Renders agenda items with video support
   - `addCurrentVideoToAgenda()` - Adds YouTube video to current agenda
   - `selectAgendaItem()` / `projectCurrentAgendaItem()` - Navigation
   - `removeFromAgenda()` / `deleteCurrentAgenda()` - Management
   - Video items display with 🎬 icon

3. **`index.html`** - UI updates
   - Added video container CSS styles
   - Added agenda icon/content/title/meta styles
   - Added agenda.js script tag
   - Video input field already in agenda tab
   - Agenda tab already exists with proper UI

4. **`display.html`** - Display window updates
   - Added UPDATE_DISPLAY_VIDEO message handler
   - Added `updateDisplayVideo(videoId, autoPlay)` function
   - Added video container CSS styles
   - Full-screen YouTube iframe embed support

### Features Implemented

#### 1. YouTube URL Parsing
Supports multiple URL formats:
- Full URL: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- Short URL: `https://youtu.be/dQw4w9WgXcQ`
- Embed URL: `https://www.youtube.com/embed/dQw4w9WgXcQ`
- Video ID only: `dQw4w9WgXcQ`

#### 2. Agenda Data Structure
Video items in agendas have this structure:
```javascript
{
  type: 'video',
  videoId: 'dQw4w9WgXcQ',
  title: 'YouTube Video',
  autoPlay: true
}
```

Verse items remain unchanged:
```javascript
{
  type: 'verse',
  reference: 'John 3:16',
  parsedRefs: [...],
  versions: ['KJV', 'ASV']
}
```

#### 3. Display Window Integration
- Videos displayed using YouTube's nocookie embed domain
- IFrame API enabled for potential future controls
- Autoplay enabled by default
- Related videos disabled (`rel=0`)
- Modest branding for cleaner appearance
- Full allowfullscreen support

#### 4. BroadcastChannel Messages
New message type added:
```javascript
{
  type: 'UPDATE_DISPLAY_VIDEO',
  data: {
    videoId: 'dQw4w9WgXcQ',
    autoPlay: true
  }
}
```

#### 5. Preview Functionality
- Click the eye icon (👁) on video items to preview
- Opens in popup window (640x360)
- Non-autoplay preview
- Independent of main display

## Usage Guide

### Adding Videos to Agenda

1. **Create or Select an Agenda**
   - Go to "Agenda" tab in sidebar
   - Click "+" to create new agenda or select existing

2. **Add a YouTube Video**
   - Navigate to the Agenda tab
   - Scroll to "Add Video to Agenda" section
   - Paste YouTube URL or video ID
   - Click "+ Add Video"

3. **Navigate Agenda**
   - Click on any item to select it
   - Use "← Previous" / "Next →" buttons
   - Click "Project" to send to display window

### Displaying Videos

Videos can be displayed in two ways:

1. **Direct Mode** (Preview disabled)
   - Video displays immediately in control window
   - Simultaneously broadcast to display window

2. **Preview Mode** (Preview enabled)
   - Video loads in preview pane
   - Click "Go Live" or press Ctrl+Enter to send to display
   - Appears in live pane and display window

### Supported YouTube URL Formats

All these formats work:
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/embed/dQw4w9WgXcQ
dQw4w9WgXcQ
```

## Technical Details

### YouTube Embed Configuration
```javascript
const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=1&rel=0&modestbranding=1`;
```

Parameters:
- `enablejsapi=1` - Enables JavaScript API for future features
- `autoplay=1` - Auto-plays video when loaded
- `rel=0` - Hides related videos at end
- `modestbranding=1` - Minimal YouTube branding

### Storage
Agendas (including videos) are stored in localStorage:
```javascript
localStorage.setItem('savedAgendas', JSON.stringify(savedAgendas));
```

Each agenda is an array of items (verses and videos mixed).

### Video Container CSS
```css
.video-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #000;
}

.video-container iframe {
    width: 100%;
    height: 100%;
    border: none;
}
```

## Future Enhancements

Potential improvements:
1. Add video title fetching via YouTube API
2. Add thumbnail preview in agenda list
3. Add start time parameter support
4. Add custom video title input
5. Add video duration display
6. Add YouTube API integration for metadata
7. Add playlist support
8. Add volume control
9. Add play/pause control via BroadcastChannel

## Testing

To test the feature:

1. **Start HTTP Server**
   ```bash
   python3 -m http.server 8000
   ```

2. **Open Control Window**
   ```
   http://localhost:8000/index.html
   ```

3. **Open Display Window**
   - Click "📺 Launch Display" button
   - Or manually open: `http://localhost:8000/display.html`

4. **Test Video Playback**
   - Go to Agenda tab
   - Create a new agenda (e.g., "Test Service")
   - Add sample video: `dQw4w9WgXcQ`
   - Click the play button (▶) to display
   - Verify video plays in display window

### Sample Test Videos
```
dQw4w9WgXcQ - Rick Astley - Never Gonna Give You Up
jNQXAC9IVRw - Me at the zoo (first YouTube video)
9bZkp7q19f0 - PSY - GANGNAM STYLE
```

## Compatibility

- **Browsers**: All modern browsers with iframe support
- **YouTube**: Uses nocookie domain for privacy
- **CORS**: No issues (embedded iframe)
- **File Protocol**: Works via HTTP server (required for LiveVerses)

## Security Considerations

- Using `youtube-nocookie.com` for enhanced privacy
- No user data collected
- Videos load in sandboxed iframe
- All communication via BroadcastChannel (same-origin only)

## Known Limitations

1. Requires active internet connection for video playback
2. YouTube availability dependent on region
3. No offline video support
4. No custom video player controls (relies on YouTube embed)
5. Age-restricted videos may not play in embed

## Issue Reference

Implements feature request from **Issue #5**: YouTube video integration for LiveVerses agendas.
