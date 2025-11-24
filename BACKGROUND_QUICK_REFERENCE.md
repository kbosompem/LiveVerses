# Background Customization - Quick Reference

## User Guide

### How to Use Custom Backgrounds

#### 1. Access Background Controls
- Open LiveVerses control panel (index.html)
- Navigate to **Appearance** section in left sidebar

#### 2. Choose Background Type

**Option A: Solid Color (Default)**
```
1. Background Type: Color
2. Adjust "Background Color" picker
3. Color updates automatically
```

**Option B: Background Image**
```
1. Background Type: Image
2. Enter HTTPS image URL
   Example: https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80
3. Click "Apply"
4. Image appears in display window
```

**Option C: Background Video**
```
1. Background Type: Video
2. Enter HTTPS video URL
   Example: https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
3. Click "Apply"
4. Video plays looping in display window
```

#### 3. Enhance Text Readability

**Text Shadow Toggle**
- Check "Text Shadow (for readability)"
- Adds strong shadow to verse text
- Improves readability over complex backgrounds

**Overlay Opacity**
- Adjust slider from 0% to 80%
- Darkens background for better contrast
- Higher values = darker overlay

### Supported Formats

**Images (must be HTTPS)**
- JPG / JPEG
- PNG
- WebP
- GIF

**Videos (must be HTTPS)**
- MP4
- WebM

### Tips for Best Results

1. **High Resolution**: Use 1920x1080 or higher for best quality
2. **Light Backgrounds**: Increase overlay opacity or enable text shadow
3. **Dark Backgrounds**: Disable text shadow, set overlay to 0%
4. **Videos**: Keep under 50MB for smooth playback
5. **Aspect Ratio**: 16:9 works best for projection displays

### Troubleshooting

**"Only HTTPS URLs are allowed"**
- URL must start with `https://` (not `http://`)
- Security requirement for web applications

**"Invalid format"**
- Check file extension matches supported formats
- Ensure URL ends with .jpg, .png, .mp4, etc.

**Video won't play**
- Some browsers block autoplay
- Try interacting with page first (click anywhere)
- Check browser console for errors

**Image doesn't load**
- Verify URL is publicly accessible
- Check for CORS restrictions
- Try different image hosting service

**Settings don't persist**
- Ensure browser allows localStorage
- Check browser privacy settings
- Try different browser if issues persist

## Developer Reference

### BroadcastChannel Messages

Send from control to display:
```javascript
// Color background
channel.postMessage({
  type: 'UPDATE_BACKGROUND',
  data: { color: '#0f172a' }
});

// Image background
channel.postMessage({
  type: 'UPDATE_BACKGROUND_IMAGE',
  data: { url: 'https://...' }
});

// Video background
channel.postMessage({
  type: 'UPDATE_BACKGROUND_VIDEO',
  data: { url: 'https://...' }
});

// Clear media
channel.postMessage({
  type: 'CLEAR_BACKGROUND_MEDIA'
});

// Text shadow
channel.postMessage({
  type: 'UPDATE_TEXT_SHADOW',
  data: { enabled: true }
});

// Overlay opacity
channel.postMessage({
  type: 'UPDATE_OVERLAY_OPACITY',
  data: { opacity: 40 }
});
```

### localStorage Structure

```javascript
{
  "type": "image",              // 'color' | 'image' | 'video'
  "color": "#0f172a",           // Hex color string
  "url": "https://...",         // Media URL
  "textShadow": true,           // Boolean
  "overlayOpacity": 40          // 0-80
}
```

Key: `liveverses_background_settings`

### CSS Classes

```css
/* Enhanced text shadow for readability */
.enhanced-shadow {
  text-shadow:
    0 0 20px rgba(0,0,0,0.9),
    0 0 40px rgba(0,0,0,0.7),
    2px 2px 8px rgba(0,0,0,1);
}
```

Apply to: `.verse-text`, `.verse-reference`, `.verse-version`

### JavaScript API

```javascript
// Update background type
updateBackgroundType();

// Apply image/video
applyBackgroundMedia();

// Toggle text shadow
updateTextShadow();

// Adjust overlay
updateOverlayOpacity();

// Save settings
saveBackgroundSettings();

// Load settings
loadBackgroundSettings();
```

## Sample URLs for Testing

### Free Image Sources

**Unsplash (High Quality)**
```
https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80
https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1920&q=80
https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80
```

**Picsum Photos (Random)**
```
https://picsum.photos/1920/1080?random=1
https://picsum.photos/1920/1080?random=2
```

### Free Video Sources

**Test Videos**
```
https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4
https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4
https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4
```

**Note**: Always verify URLs are publicly accessible before using in production.

## Keyboard Shortcuts

No specific shortcuts for background controls. Use standard web controls:
- **Tab**: Navigate between fields
- **Enter**: Submit URL (when focused on input)
- **Space**: Toggle checkboxes

## Accessibility

- All controls have proper labels
- Text shadow improves readability for visually impaired users
- Overlay opacity provides additional contrast control
- Settings persist for consistent experience

## Privacy & Security

- Only HTTPS URLs accepted (encrypted connections)
- No media files uploaded to server (100% client-side)
- Settings stored locally in browser (not transmitted)
- External URLs must be publicly accessible
- No tracking or analytics for background feature
