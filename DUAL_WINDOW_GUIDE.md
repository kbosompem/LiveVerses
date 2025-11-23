# LiveVerses Dual-Window Setup Guide

## How to Control from Another Window

LiveVerses now supports **separate control and display windows** - perfect for Zoom presentations and live worship!

## Quick Start

### Step 1: Open the Control Window
1. Open `index.html` in your browser
2. This is your **CONTROL WINDOW** - keep this for yourself

### Step 2: Open the Display Window
1. Click the red **📺 Open Display Window** button at the top
2. A new window will pop up - this is your **DISPLAY WINDOW**
3. You should see "✓ Display Connected" status

### Step 3: Arrange Your Windows
**Option A - Two Monitors:**
- Keep Control Window on Monitor 1 (your screen)
- Move Display Window to Monitor 2 (projector/shared screen)

**Option B - Single Monitor:**
- Keep Control Window on top/side
- Resize Display Window to take most of the screen
- In Zoom, share ONLY the Display Window

### Step 4: Use It!
1. Type verses in the Control Window
2. Click "Lookup" or press Enter
3. Verses instantly appear in the Display Window!
4. Change colors, font size, etc. - all updates appear in Display Window

## How It Works

```
┌─────────────────────────┐         ┌─────────────────────────┐
│   CONTROL WINDOW        │         │   DISPLAY WINDOW        │
│   (You see this)        │ ──────> │   (Audience sees this)  │
│                         │         │                         │
│  [John 3:16] [Lookup]   │         │                         │
│  [Colors] [Font Size]   │         │   For God so loved...   │
│  [Versions] [Layout]    │         │                         │
│                         │         │                         │
│  Your preview shown     │         │   Clean, large text     │
│  below controls         │         │   for projection        │
└─────────────────────────┘         └─────────────────────────┘
```

## For Zoom Presentations

### Setup:
1. Open Control Window (index.html)
2. Click "📺 Open Display Window"
3. Position Display Window where you want it
4. In Zoom, click **"Share Screen"**
5. Select the **Display Window** (not the Control Window)
6. Click Share

### During Presentation:
- Audience sees ONLY the Display Window
- You control everything from the Control Window
- Type verses, change versions, adjust settings
- Changes appear INSTANTLY for participants
- No need to switch windows or disrupt presentation

## Features That Sync

Everything you do in the Control Window appears in the Display Window:

- ✅ **Verse Lookup** - Appears instantly
- ✅ **Version Selection** - KJV, ASV, WEB
- ✅ **Layout Changes** - Stacked or Side-by-Side
- ✅ **Background Color** - Custom colors
- ✅ **Text Color** - Adjust for contrast
- ✅ **Font Size** - Make bigger/smaller
- ✅ **Clear Display** - Blank the screen

## Connection Status

**"✓ Display Connected"** (Green)
- Display window is open and receiving updates
- Everything is working correctly

**"Display Not Connected"** (Gray)
- Display window is not open
- Click "📺 Open Display Window" to connect

## Troubleshooting

### Display Window Won't Open
**Problem:** Alert says "Could not open display window"

**Solutions:**
1. Allow popups for this site in your browser
2. Check browser popup blocker settings
3. Try a different browser (Chrome works best)

### Display Window Not Updating
**Problem:** Verses don't appear in Display Window

**Solutions:**
1. Check connection status - should say "✓ Display Connected"
2. Close Display Window and click "📺 Open Display Window" again
3. Refresh both windows (Cmd+R or Ctrl+R)
4. Make sure both windows are from the same domain/folder

### Display Window Closes Accidentally
**Solution:** Just click "📺 Open Display Window" again - it will reopen

## Tips & Best Practices

### Before Your Presentation:
1. ✅ Test the connection beforehand
2. ✅ Adjust colors and font size for your setup
3. ✅ Practice with a few verses
4. ✅ Make sure popups are enabled
5. ✅ Position windows on correct monitors

### During Presentation:
1. 📝 Keep a list of verses nearby
2. ⌨️ Use abbreviations (Jn 3:16, Rom 8:28) for speed
3. 🎨 Use high contrast colors for visibility
4. 📏 Adjust font size based on audience distance
5. 🧹 Use "Clear" button between different topics

### For Best Results:
- **Use Chrome or Edge** for best compatibility
- **Full screen** the Display Window for projection
- **Test your setup** before going live
- **Keep Control Window accessible** but hidden from audience

## Keyboard Shortcuts

In Control Window:
- **Enter** - Lookup verse
- **Tab** - Navigate controls
- **Esc** - (if Display Window is focused, brings it to front)

## Technical Notes

- Windows communicate using `BroadcastChannel API`
- No server or internet required
- Both windows must be from the same origin (same folder)
- Works in Chrome, Edge, Firefox, Safari (modern versions)
- Display Window has minimal UI for cleaner projection

## Common Workflows

### Worship Service:
1. Open both windows before service starts
2. Share Display Window in Zoom/projection
3. Keep Control Window on your device
4. Type verses as needed during service

### Bible Study:
1. Open Display Window on projector/TV
2. Keep Control Window on your laptop
3. Navigate through verses as you teach
4. Use multiple versions for comparison

### Personal Study:
1. Use just the Control Window
2. No need for Display Window
3. See verses in the main interface

---

## Need Help?

- Check browser console (F12) for errors
- Verify both windows are open
- Refresh both windows if issues occur
- Make sure popup blocker is off

**Enjoy seamless Bible verse projection with LiveVerses!**
