# LiveVerses - Bible Verse Projection App

A fast, lightweight Bible verse projection application for macOS designed for Zoom calls and live worship services. Features offline access to three complete public domain Bible versions: KJV, ASV, and WEB.

## Features

- **🎯 Dual-Window Mode**: Separate control and display windows - control from one window while sharing another!
- **Three Complete Bible Versions**: King James Version (KJV), American Standard Version (ASV), and World English Bible (WEB)
- **Fully Offline**: All Bible text stored locally - no internet required once installed
- **Multi-Version Display**: View multiple translations side-by-side or stacked
- **Projection-Ready**: Large, clean text perfect for screen sharing on Zoom or projection
- **Customizable Display**: Adjust background color, text color, and font size
- **Fast Lookup**: Instant verse retrieval with smart reference parsing
- **Keyboard Shortcuts**: Press Enter to lookup verses quickly

## Installation

1. **Download or Clone** this repository to your Mac

2. **Run the Bible Download Script** (if WEB isn't downloaded yet):
   ```bash
   python3 scripts/fetch_web.py
   ```
   This will download the World English Bible (takes a few minutes).

3. **Verify Data Files**: Ensure you have these files in the `data/` folder:
   - `kjv.json` (King James Version)
   - `asv.json` (American Standard Version)
   - `web.json` (World English Bible)

4. **Open the App**: Simply open `index.html` in your web browser (Chrome, Safari, or Firefox)

## Usage

📖 **[View the Complete Visual User Guide with Screenshots →](VISUAL_USER_GUIDE.md)**

### Basic Usage

1. **Enter a verse reference** in the input box (e.g., `John 3:16`)
2. **Select Bible version(s)** to display (KJV, ASV, and/or WEB)
3. **Press Enter** or click "Lookup" to display the verse
4. The verse will appear in large, readable text ready for projection

### Supported Reference Formats

The app recognizes various reference formats:

- `John 3:16` - Single verse
- `Psalm 23:1-6` - Verse range
- `Romans 8:28` - Any book, chapter, and verse
- `1 Corinthians 13:4` - Numbered books
- `Genesis 1:1` - Old Testament books

### Common Abbreviations

The app understands many abbreviations:

- `Gen 1:1` (Genesis)
- `Ps 23:1` (Psalms)
- `Matt 5:16` or `Mt 5:16` (Matthew)
- `1 Cor 13:4` or `1Co 13:4` (1 Corinthians)
- `Rev 21:1` (Revelation)

### For Zoom Presentations (Dual-Window Mode)

**NEW: Recommended Method**

1. **Open LiveVerses** (`index.html`)
2. **Click "📺 Open Display Window"** button at the top
3. **In Zoom**, click "Share Screen" and select the **Display Window**
4. **Keep the Control Window** on your screen (not shared)
5. **Type references** in Control Window - they appear instantly in Display Window for participants!

See [DUAL_WINDOW_GUIDE.md](DUAL_WINDOW_GUIDE.md) for detailed instructions.

**Alternative: Single Window Method**

1. Open LiveVerses and share the entire window in Zoom
2. Control everything while participants see your screen

### Display Customization

- **Background Color**: Click the color picker to change the background
- **Text Color**: Customize the verse text color for better contrast
- **Font Size**: Use the slider to increase or decrease text size (1em - 5em)
- **Layout**: Choose between "Stacked" (vertical) or "Side by Side" (horizontal) for multiple versions

### Keyboard Shortcuts

- **Enter**: Lookup the current verse reference
- **Tab**: Navigate between controls
- Focus stays in the input box for quick verse changes

## Tips for Live Services

1. **Test beforehand**: Make sure all Bible data is loaded and references work
2. **Prepare common verses**: Keep a list of frequently used verses nearby
3. **Use shortcuts**: Type abbreviated references (e.g., `Jn 3:16`) for speed
4. **Adjust for projection**: Increase font size for larger screens or audiences
5. **Keep it simple**: Stick to one or two versions for cleaner display

## File Structure

```
LiveVerses/
├── index.html          # Main application HTML
├── app.js             # JavaScript application logic
├── scripts/           # Utility scripts
│   ├── fetch_web.py       # Download WEB Bible
│   ├── download_bibles.py # Alternative download script
│   └── convert_nlt.py     # Convert NLT format
├── tests/             # Test files
├── README.md          # This file
└── data/              # Bible data folder
    ├── kjv.json       # King James Version (4.3MB)
    ├── asv.json       # American Standard Version (5.1MB)
    └── web.json       # World English Bible (~5MB when downloaded)
```

## Technical Details

- **No Server Required**: Pure client-side application (HTML, CSS, JavaScript)
- **Fast Loading**: Optimized JSON structure for quick verse lookup
- **Cross-Platform**: Works on macOS, Windows, and Linux (any modern browser)
- **No Dependencies**: No frameworks or libraries required
- **Public Domain**: All three Bible versions are in the public domain

## Bible Versions

### King James Version (KJV)
The 1769 edition of the Authorized Version. Public domain.

### American Standard Version (ASV)
Published in 1901 as a revision of the KJV. Public domain.

### World English Bible (WEB)
A modern English translation based on the ASV, updated in 1997. Public domain.

## Troubleshooting

### "Error loading Bible data"
- Make sure all three JSON files are in the `data/` folder
- Check browser console (F12) for specific error messages
- Try running the download script again

### Verse not found
- Check your spelling and reference format
- Verify the verse exists in that book/chapter
- Try using the full book name instead of abbreviation

### App is slow
- Make sure you're running locally (not over a network)
- Try a different browser (Chrome/Edge usually fastest)
- Close other browser tabs to free up memory

## Future Enhancements

Planned features:

- Save favorite verses for quick access
- Dark mode toggle
- Keyboard shortcuts for next/previous verse
- Search functionality
- More Bible versions
- Export verse images

## Credits

- Bible data sourced from public domain repositories
- KJV and ASV from [thiagobodruk/bible](https://github.com/thiagobodruk/bible)
- ASV from [bibleapi/bibleapi-bibles-json](https://github.com/bibleapi/bibleapi-bibles-json)
- WEB downloaded via bible-api.com

## License

This application is released into the public domain. All Bible versions included are in the public domain.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify all data files are properly downloaded
3. Test in a different browser

---

**Made for worship leaders, Bible teachers, and anyone who needs to display Scripture beautifully.**
