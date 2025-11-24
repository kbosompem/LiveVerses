# Background Image/Video Feature - Testing Guide

## Feature Overview
Custom background images and videos have been implemented for the LiveVerses display window (issue #2).

## Implementation Summary

### Files Modified:
1. **index.html** - Added background customization controls
2. **display.html** - Added support for background images and videos
3. **app.js** - Added background update functions and localStorage persistence

## Testing Instructions

### 1. Start the Development Server
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

### 2. Test Background Color (Default)
- Launch the application at http://localhost:8000
- Open Display window (📺 Launch Display button)
- In Appearance section, verify "Background Type" is set to "Color"
- Change the "Background Color" picker
- Verify color changes in both control and display windows

### 3. Test Background Image
- Change "Background Type" to "Image"
- Enter a test HTTPS image URL in the "Media URL" field

**Sample Image URLs for Testing:**
```
https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80
https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80
https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80
```

- Click "Apply" button
- Verify image appears in display window as background
- Image should be cover-sized, centered, no-repeat

### 4. Test Background Video
- Change "Background Type" to "Video"
- Enter a test HTTPS video URL

**Sample Video URLs for Testing:**
```
https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
```

- Click "Apply" button
- Verify video plays in display window as background
- Video should loop, be muted, and cover the screen

### 5. Test Text Shadow
- Enable "Text Shadow (for readability)" checkbox
- Display a verse (e.g., "John 3:16")
- Verify text has enhanced shadow for better readability over backgrounds

### 6. Test Overlay Opacity
- With an image or video background active
- Adjust "Overlay Opacity" slider from 0% to 80%
- Verify dark overlay darkens background for better text contrast

### 7. Test URL Validation
**Should REJECT (alert shown):**
- HTTP URLs (non-HTTPS): `http://example.com/image.jpg`
- Invalid image formats: `https://example.com/file.pdf`
- Invalid video formats: `https://example.com/file.avi`

**Should ACCEPT:**
- HTTPS image URLs: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- HTTPS video URLs: `.mp4`, `.webm`

### 8. Test localStorage Persistence
- Set a custom background (image or video)
- Enable text shadow
- Adjust overlay opacity
- Refresh the page (F5)
- Verify settings are restored from localStorage

### 9. Test BroadcastChannel Sync
- Open display window
- Change background settings in control window
- Verify changes immediately appear in display window
- Close and reopen display window
- Verify current settings are synced to new display window

## Expected Behavior

### Background Layers (z-index)
```
-2: backgroundVideo or backgroundImage (whichever is active)
-1: backgroundOverlay (opacity controlled by slider)
 1: displayArea with verse content
```

### Control Panel Layout
```
Appearance
├── Background Type: [Color ▼] [Text Color picker]
├── Background Color: [#0f172a] (shown when type=color)
├── Media URL: [https://...] [Apply] (shown when type=image/video)
├── ☐ Text Shadow (for readability)
├── Overlay Opacity: 0% [────────────] 80%
└── Font Size: 2.5em [────────────]
```

### BroadcastChannel Messages
- `UPDATE_BACKGROUND` - Color background
- `UPDATE_BACKGROUND_IMAGE` - Image URL
- `UPDATE_BACKGROUND_VIDEO` - Video URL
- `CLEAR_BACKGROUND_MEDIA` - Remove image/video
- `UPDATE_TEXT_SHADOW` - Enable/disable enhanced shadow
- `UPDATE_OVERLAY_OPACITY` - Dark overlay percentage

### localStorage Key
```
liveverses_background_settings = {
  type: 'color' | 'image' | 'video',
  color: '#0f172a',
  url: '',
  textShadow: false,
  overlayOpacity: 0
}
```

## Known Limitations
1. Only HTTPS URLs accepted (security requirement)
2. Video autoplay may fail in some browsers without user interaction
3. Large video files may take time to load
4. CORS restrictions may prevent some external media URLs

## Accessibility Notes
- Text shadow option improves readability over complex backgrounds
- Overlay opacity provides additional contrast control
- Settings persist across sessions for consistent experience
