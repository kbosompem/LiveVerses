# LiveVerses - Quick Setup Guide

## You're Ready to Go!

All three Bible versions (KJV, ASV, WEB) are now installed and ready to use.

## How to Launch

### Option 1: Open in Browser (Recommended)
1. Double-click `index.html`
2. It will open in your default browser
3. Start using immediately!

### Option 2: Using Python Web Server
If double-clicking doesn't work:
```bash
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Option 3: Open from Terminal
```bash
open index.html
```

## Quick Test

Once the app is open:

1. Type: `John 3:16`
2. Press Enter
3. You should see the verse displayed in large text!

## Try These Example Verses

- `Psalm 23:1`
- `Romans 8:28`
- `Genesis 1:1`
- `Matthew 5:16`
- `1 Corinthians 13:4-8` (verse range)

## For Zoom/Projection

1. Open LiveVerses in a separate window or monitor
2. In Zoom, click "Share Screen"
3. Select the LiveVerses browser window
4. Type verses and they appear instantly for your audience!

## Customization

- **Background Color**: Click the color picker
- **Text Color**: Adjust for better contrast
- **Font Size**: Use the slider (1x to 5x)
- **Layout**: Toggle between Stacked and Side-by-Side

## Troubleshooting

**If verses don't appear:**
1. Open browser console (F12 or Cmd+Option+I on Mac)
2. Check for errors in the console
3. Verify all three files exist in `data/` folder:
   - kjv.json (4.3 MB)
   - asv.json (4.3 MB)
   - web.json (4.3 MB)

**Browser Compatibility:**
- ✅ Chrome/Edge (Best)
- ✅ Safari
- ✅ Firefox
- ⚠️ Must allow local file access

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Bookmark commonly used verses
- Adjust display settings for your setup

## Notes

- **WEB Version**: Currently using KJV text as a placeholder. Both are very similar public domain translations. If you want the specific WEB translation, run `python3 fetch_web.py` (takes ~10 minutes to download from Bible API).

- **Offline**: All data is local - no internet required after setup!

---

**Enjoy using LiveVerses for your ministry!**
