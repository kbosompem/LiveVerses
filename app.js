// Bible verse projection app
let bibleData = {
    KJV: null,
    ASV: null,
    WEB: null,
    NLT: null
};

let currentLayout = 'stacked';

// History tracking
let verseHistory = [];
const MAX_HISTORY = 20;

// Agenda tracking - multiple agendas support
let agendas = []; // Array of agenda objects
let currentAgenda = null; // Currently selected agenda object
let currentAgendaItemIndex = -1; // Current item in agenda
let oldCurrentAgenda = []; // Temporary backwards compatibility
let oldCurrentAgendaIndex = -1;

// State
let currentTheme = localStorage.getItem('theme') || 'dark';

// Preview mode state
let previewMode = localStorage.getItem('previewMode') === 'true' || false;
let previewContent = null; // Stores HTML for preview
let liveContent = null;    // Stores HTML currently live

// Background settings state
let backgroundSettings = {
    type: 'color', // 'color', 'image', 'video'
    color: '#0f172a',
    url: '',
    textShadow: false,
    overlayOpacity: 0
};

// Notes storage and state
let savedNotes = [];
let currentEditingNoteId = null;

// Load notes from localStorage
function loadNotesFromStorage() {
    const stored = localStorage.getItem('liveverses_notes');
    if (stored) {
        try {
            savedNotes = JSON.parse(stored);
            updateSavedNotesList();
        } catch (e) {
            console.error('Error loading notes:', e);
            savedNotes = [];
        }
    }
}

// Save notes to localStorage
function saveNotesToStorage() {
    localStorage.setItem('liveverses_notes', JSON.stringify(savedNotes));
}

// Generate unique ID for notes
function generateNoteId() {
    return 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Initialize Theme
document.body.setAttribute('data-theme', currentTheme);
updateThemeIcon();

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.getElementById('themeIcon');
    if (icon) {
        icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Display window communication
const channel = new BroadcastChannel('liveverses_channel');
let displayWindow = null;
let displayConnected = false;

// Listen for messages from display window
channel.onmessage = (event) => {
    const { type } = event.data;

    if (type === 'DISPLAY_READY' || type === 'PONG') {
        displayConnected = true;
        updateDisplayStatus();

        // Send current settings to newly connected display window
        const bgColor = document.getElementById('bgColor')?.value || '#1a1a1a';
        const textColor = document.getElementById('textColor')?.value || '#ffffff';
        const fontSize = document.getElementById('fontSize')?.value || '2.5';

        sendToDisplay('UPDATE_BACKGROUND', { color: bgColor });
        sendToDisplay('UPDATE_TEXT_COLOR', { color: textColor });
        sendToDisplay('UPDATE_FONT_SIZE', { size: fontSize });

        // Send current verse if any is displayed
        const verseContainer = document.querySelector('.verse-container');
        if (verseContainer) {
            sendToDisplay('UPDATE_DISPLAY', { html: verseContainer.outerHTML });
        }
    }
};

// Update display status indicator
function updateDisplayStatus() {
    const statusEl = document.getElementById('displayStatus');
    if (statusEl) {
        const dot = statusEl.querySelector('.status-dot');
        const text = statusEl.querySelector('span');

        if (displayConnected) {
            dot.classList.add('connected');
            text.textContent = 'Display Connected';
        } else {
            dot.classList.remove('connected');
            text.textContent = 'Display Disconnected';
        }
    }
}

// Open display window
function openDisplayWindow() {
    if (displayWindow && !displayWindow.closed) {
        displayWindow.focus();
        return;
    }

    // Open in new window
    displayWindow = window.open(
        'display.html',
        'LiveVersesDisplay',
        'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no'
    );

    if (displayWindow) {
        // Send ping to check connection
        setTimeout(() => {
            channel.postMessage({ type: 'PING' });
        }, 500);

        console.log('Display window opened');
    } else {
        alert('Could not open display window. Please allow popups for this site.');
    }
}

// Send message to display window
function sendToDisplay(type, data = {}) {
    channel.postMessage({ type, data });
}

// Ping display window periodically
setInterval(() => {
    if (displayWindow && !displayWindow.closed) {
        channel.postMessage({ type: 'PING' });
    } else {
        displayConnected = false;
        updateDisplayStatus();
    }
}, 3000);

// Rapid verse selection state
let autocompleteState = {
    mode: 'book', // 'book', 'chapter', 'verse'
    selectedBook: null,
    selectedChapter: null,
    currentInput: ''
};

// Bible Book Data - Single Source of Truth
const BIBLE_BOOKS = [
    // Old Testament
    { name: 'Genesis', abbrev: 'gn', aliases: ['gen', 'ge'] },
    { name: 'Exodus', abbrev: 'ex', aliases: ['exo', 'exod'] },
    { name: 'Leviticus', abbrev: 'lv', aliases: ['lev'] },
    { name: 'Numbers', abbrev: 'nm', aliases: ['num'] },
    { name: 'Deuteronomy', abbrev: 'dt', aliases: ['deut', 'deu'] },
    { name: 'Joshua', abbrev: 'js', aliases: ['josh', 'jos'] },
    { name: 'Judges', abbrev: 'jud', aliases: ['jdg'] },
    { name: 'Ruth', abbrev: 'rt', aliases: ['rut', 'ru'] },
    { name: '1 Samuel', abbrev: '1sm', aliases: ['1sam', '1sa', '1s'] },
    { name: '2 Samuel', abbrev: '2sm', aliases: ['2sam', '2sa', '2s'] },
    { name: '1 Kings', abbrev: '1kgs', aliases: ['1ki', '1k'] },
    { name: '2 Kings', abbrev: '2kgs', aliases: ['2ki', '2k'] },
    { name: '1 Chronicles', abbrev: '1ch', aliases: ['1chr', '1chron'] },
    { name: '2 Chronicles', abbrev: '2ch', aliases: ['2chr', '2chron'] },
    { name: 'Ezra', abbrev: 'ezr', aliases: ['ez'] },
    { name: 'Nehemiah', abbrev: 'ne', aliases: ['neh'] },
    { name: 'Esther', abbrev: 'et', aliases: ['est', 'es'] },
    { name: 'Job', abbrev: 'job', aliases: ['jb'] },
    { name: 'Psalms', abbrev: 'ps', aliases: ['psalm', 'psa', 'pss'] },
    { name: 'Proverbs', abbrev: 'prv', aliases: ['prov', 'pro'] },
    { name: 'Ecclesiastes', abbrev: 'ec', aliases: ['ecc', 'eccl'] },
    { name: 'Song of Solomon', abbrev: 'so', aliases: ['song', 'sos', 'songofsongs'] },
    { name: 'Isaiah', abbrev: 'is', aliases: ['isa'] },
    { name: 'Jeremiah', abbrev: 'jr', aliases: ['jer'] },
    { name: 'Lamentations', abbrev: 'lm', aliases: ['lam'] },
    { name: 'Ezekiel', abbrev: 'ez', aliases: ['eze', 'ezek', 'ezk'] },
    { name: 'Daniel', abbrev: 'dn', aliases: ['dan', 'da'] },
    { name: 'Hosea', abbrev: 'ho', aliases: ['hos'] },
    { name: 'Joel', abbrev: 'jl', aliases: ['joe'] },
    { name: 'Amos', abbrev: 'am', aliases: ['amo'] },
    { name: 'Obadiah', abbrev: 'ob', aliases: ['oba'] },
    { name: 'Jonah', abbrev: 'jn', aliases: ['jon'] },
    { name: 'Micah', abbrev: 'mi', aliases: ['mic'] },
    { name: 'Nahum', abbrev: 'na', aliases: ['nah'] },
    { name: 'Habakkuk', abbrev: 'hk', aliases: ['hab'] },
    { name: 'Zephaniah', abbrev: 'zp', aliases: ['zeph', 'zep'] },
    { name: 'Haggai', abbrev: 'hg', aliases: ['hag'] },
    { name: 'Zechariah', abbrev: 'zc', aliases: ['zech', 'zec'] },
    { name: 'Malachi', abbrev: 'ml', aliases: ['mal'] },
    // New Testament
    { name: 'Matthew', abbrev: 'mt', aliases: ['matt', 'mat'] },
    { name: 'Mark', abbrev: 'mk', aliases: ['mar', 'mrk', 'mr'] },
    { name: 'Luke', abbrev: 'lk', aliases: ['luk', 'lu'] },
    { name: 'John', abbrev: 'jo', aliases: ['joh', 'jhn', 'jn'] },
    { name: 'Acts', abbrev: 'act', aliases: ['ac'] },
    { name: 'Romans', abbrev: 'rm', aliases: ['rom', 'ro'] },
    { name: '1 Corinthians', abbrev: '1co', aliases: ['1cor', '1co'] },
    { name: '2 Corinthians', abbrev: '2co', aliases: ['2cor', '2co'] },
    { name: 'Galatians', abbrev: 'gl', aliases: ['gal', 'ga'] },
    { name: 'Ephesians', abbrev: 'eph', aliases: ['ep'] },
    { name: 'Philippians', abbrev: 'ph', aliases: ['phil', 'php', 'pp'] },
    { name: 'Colossians', abbrev: 'cl', aliases: ['col'] },
    { name: '1 Thessalonians', abbrev: '1ts', aliases: ['1thess', '1th'] },
    { name: '2 Thessalonians', abbrev: '2ts', aliases: ['2thess', '2th'] },
    { name: '1 Timothy', abbrev: '1tm', aliases: ['1tim', '1ti'] },
    { name: '2 Timothy', abbrev: '2tm', aliases: ['2tim', '2ti'] },
    { name: 'Titus', abbrev: 'tt', aliases: ['tit', 'ti'] },
    { name: 'Philemon', abbrev: 'phm', aliases: ['phlm'] },
    { name: 'Hebrews', abbrev: 'hb', aliases: ['heb'] },
    { name: 'James', abbrev: 'jm', aliases: ['jas', 'jam', 'ja'] },
    { name: '1 Peter', abbrev: '1pe', aliases: ['1pet', '1pt', '1p'] },
    { name: '2 Peter', abbrev: '2pe', aliases: ['2pet', '2pt', '2p'] },
    { name: '1 John', abbrev: '1jo', aliases: ['1joh', '1jn'] },
    { name: '2 John', abbrev: '2jo', aliases: ['2joh', '2jn'] },
    { name: '3 John', abbrev: '3jo', aliases: ['3joh', '3jn'] },
    { name: 'Jude', abbrev: 'jd', aliases: ['jud'] },
    { name: 'Revelation', abbrev: 're', aliases: ['rev', 'rv'] }
];

// Load Bible data
async function loadBibleData() {
    try {
        console.log('Loading KJV...');
        const kjvResponse = await fetch('data/kjv.json');
        bibleData.KJV = await kjvResponse.json();

        console.log('Loading ASV...');
        const asvResponse = await fetch('data/asv.json');
        bibleData.ASV = await asvResponse.json();

        console.log('Loading WEB...');
        const webResponse = await fetch('data/web.json');
        bibleData.WEB = await webResponse.json();

        console.log('Loading NLT...');
        const nltResponse = await fetch('data/nlt.json');
        bibleData.NLT = await nltResponse.json();

        console.log('All Bible versions loaded successfully');
    } catch (error) {
        console.error('Error loading Bible data:', error);
        showError('Error loading Bible data. Please ensure all JSON files are in the data folder.');
    }
}

// Parse verse reference (e.g., "John 3:16", "Psalm 23:1-6", "Romans 8:28")
function parseReference(reference) {
    reference = reference.trim().toLowerCase();

    // Match patterns like "John 3:16" or "1 Corinthians 13:4-8"
    const match = reference.match(/^([\d\s]*[a-z]+(?:\s+of\s+[a-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?$/i);

    if (!match) {
        return null;
    }

    let [_, bookName, chapter, startVerse, endVerse] = match;
    bookName = bookName.replace(/\s+/g, '').toLowerCase();

    // Find book by name or alias
    const book = BIBLE_BOOKS.find(b =>
        b.name.toLowerCase().replace(/\s+/g, '') === bookName ||
        b.aliases.some(alias => alias.replace(/\s+/g, '') === bookName) ||
        b.abbrev === bookName
    );

    if (!book) {
        return null;
    }

    return {
        book: book.abbrev,
        chapter: parseInt(chapter),
        startVerse: parseInt(startVerse),
        endVerse: endVerse ? parseInt(endVerse) : parseInt(startVerse)
    };
}

// Get verse text from Bible data
function getVerseText(version, book, chapter, startVerse, endVerse) {
    const data = bibleData[version];
    if (!data) return null;

    // Find the book
    const bookData = data.find(b => b.abbrev === book);
    if (!bookData) return null;

    // Get the chapter (chapters are 1-indexed in reference, but 0-indexed in array)
    const chapterData = bookData.chapters[chapter - 1];
    if (!chapterData) return null;

    // Get the verse(s)
    let verses = [];
    for (let v = startVerse; v <= endVerse; v++) {
        const verse = chapterData[v - 1]; // verses are 1-indexed in reference, 0-indexed in array
        if (verse) {
            verses.push(verse);
        }
    }

    return verses.join(' ');
}

// Lookup and display verse(s)
function lookupVerse() {
    const input = document.getElementById('verseInput').value.trim();

    if (!input) {
        showError('Please enter a verse reference');
        return;
    }

    // Check if input contains comma-separated verses
    const references = input.split(',').map(r => r.trim()).filter(r => r.length > 0);

    if (references.length === 0) {
        showError('Please enter a verse reference');
        return;
    }

    // Parse all references
    const parsedRefs = [];
    for (const ref of references) {
        const parsed = parseReference(ref);
        if (!parsed) {
            showError(`Invalid verse reference: "${ref}". Try: John 3:16 or Psalm 23:1`);
            return;
        }
        parsedRefs.push({ input: ref, parsed: parsed });
    }

    // Get selected versions
    const selectedVersions = [];
    if (document.getElementById('kjvCheck').checked) selectedVersions.push('KJV');
    if (document.getElementById('asvCheck').checked) selectedVersions.push('ASV');
    if (document.getElementById('webCheck').checked) selectedVersions.push('WEB');
    if (document.getElementById('nltCheck').checked) selectedVersions.push('NLT');

    if (selectedVersions.length === 0) {
        showError('Please select at least one Bible version');
        return;
    }

    // Display verses
    if (parsedRefs.length === 1) {
        // Single verse - use normal display
        displayVerses(parsedRefs[0].parsed, selectedVersions);
    } else {
        // Multiple verses - use multi-verse display
        displayMultipleVerses(parsedRefs, selectedVersions);
    }

    // Add to history
    addToHistory(input, parsedRefs.length === 1 ? parsedRefs[0].parsed : parsedRefs, selectedVersions);
}

// Display verses
function displayVerses(parsedRef, versions) {
    const container = document.createElement('div');
    container.className = `verse-container ${currentLayout}`;

    versions.forEach(version => {
        const verseText = getVerseText(
            version,
            parsedRef.book,
            parsedRef.chapter,
            parsedRef.startVerse,
            parsedRef.endVerse
        );

        if (!verseText) {
            showError(`Verse not found in ${version}`);
            return;
        }

        const block = document.createElement('div');
        block.className = 'verse-block';

        const versionLabel = document.createElement('div');
        block.appendChild(versionLabel);
        versionLabel.className = 'verse-version';
        versionLabel.textContent = version;

        const reference = document.createElement('div');
        block.appendChild(reference);
        reference.className = 'verse-reference';
        const refText = `${getBookName(parsedRef.book)} ${parsedRef.chapter}:${parsedRef.startVerse}`;
        reference.textContent = parsedRef.endVerse > parsedRef.startVerse ?
            `${refText}-${parsedRef.endVerse}` : refText;

        const text = document.createElement('div');
        block.appendChild(text);
        text.className = 'verse-text';
        text.textContent = verseText;

        container.appendChild(block);
    });

    if (previewMode) {
        // Preview mode: show in preview pane only
        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = '';
        previewArea.appendChild(container.cloneNode(true));
        previewContent = container.outerHTML;

        // Enable Go Live button
        const goLiveBtn = document.getElementById('goLiveBtn');
        if (goLiveBtn) {
            goLiveBtn.disabled = false;
        }
    } else {
        // Direct mode: show in display area and send to display window
        const displayArea = document.getElementById('displayArea');
        displayArea.innerHTML = '';
        displayArea.appendChild(container);

        // Send to display window immediately
        sendToDisplay('UPDATE_DISPLAY', { html: container.outerHTML });
    }
}

// Display multiple verses
function displayMultipleVerses(parsedRefs, versions) {
    const container = document.createElement('div');
    container.className = 'verse-container stacked'; // Always stacked for multiple verses

    // For each verse reference
    parsedRefs.forEach(({ input, parsed }) => {
        versions.forEach(version => {
            const verseText = getVerseText(
                version,
                parsed.book,
                parsed.chapter,
                parsed.startVerse,
                parsed.endVerse
            );

            if (!verseText) {
                const errorBlock = document.createElement('div');
                errorBlock.className = 'error-message';
                errorBlock.textContent = `Verse not found: ${input} in ${version}`;
                container.appendChild(errorBlock);
                return;
            }

            const block = document.createElement('div');
            block.className = 'verse-block';
            block.style.marginBottom = '40px';

            const versionLabel = document.createElement('div');
            block.appendChild(versionLabel);
            versionLabel.className = 'verse-version';
            versionLabel.textContent = version;

            const reference = document.createElement('div');
            block.appendChild(reference);
            reference.className = 'verse-reference';
            const refText = `${getBookName(parsed.book)} ${parsed.chapter}:${parsed.startVerse}`;
            reference.textContent = parsed.endVerse > parsed.startVerse ?
                `${refText}-${parsed.endVerse}` : refText;

            const text = document.createElement('div');
            block.appendChild(text);
            text.className = 'verse-text';
            text.textContent = verseText;

            container.appendChild(block);
        });
    });

    if (previewMode) {
        // Preview mode: show in preview pane only
        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = '';
        previewArea.appendChild(container.cloneNode(true));
        previewContent = container.outerHTML;

        // Enable Go Live button
        const goLiveBtn = document.getElementById('goLiveBtn');
        if (goLiveBtn) {
            goLiveBtn.disabled = false;
        }
    } else {
        // Direct mode: show in display area and send to display window
        const displayArea = document.getElementById('displayArea');
        displayArea.innerHTML = '';
        displayArea.appendChild(container);

        // Send to display window immediately
        sendToDisplay('UPDATE_DISPLAY', { html: container.outerHTML });
    }
}

// Add verse to history
function addToHistory(reference, parsedRef, versions) {
    const historyItem = {
        reference: reference,
        parsedRef: parsedRef,
        versions: [...versions],
        timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    };

    // Don't add duplicates of the most recent item (same reference AND same versions)
    if (verseHistory.length > 0) {
        const lastItem = verseHistory[0];
        const sameRef = lastItem.reference === reference;
        const sameVersions = lastItem.versions.length === versions.length &&
            lastItem.versions.every(v => versions.includes(v));

        if (sameRef && sameVersions) {
            return; // Exact duplicate, don't add
        }
    }

    // Add to beginning of array
    verseHistory.unshift(historyItem);

    // Limit history size
    if (verseHistory.length > MAX_HISTORY) {
        verseHistory.pop();
    }

    // Update UI
    updateHistoryUI();
}

// Update history UI
function updateHistoryUI() {
    const historyList = document.getElementById('historyList');
    if (!historyList) return;

    if (verseHistory.length === 0) {
        historyList.innerHTML = '<div class="history-empty">No history yet</div>';
        return;
    }

    historyList.innerHTML = verseHistory.map((item, index) => `
        <div class="history-item" onclick="loadFromHistory(${index})">
            <div class="history-reference">${item.reference}</div>
            <div class="history-meta">
                <span class="history-versions">${item.versions.join(', ')}</span>
                <span class="history-time">${item.timestamp}</span>
            </div>
        </div>
    `).join('');
}

// Load verse from history
function loadFromHistory(index) {
    const item = verseHistory[index];
    if (!item) return;

    // Set the verse input
    document.getElementById('verseInput').value = item.reference;

    // Set the selected versions
    document.getElementById('kjvCheck').checked = item.versions.includes('KJV');
    document.getElementById('asvCheck').checked = item.versions.includes('ASV');
    document.getElementById('webCheck').checked = item.versions.includes('WEB');
    document.getElementById('nltCheck').checked = item.versions.includes('NLT');

    // Display the verses (without adding to history again)
    displayVerses(item.parsedRef, item.versions);
}

// Clear history
function clearHistory() {
    if (confirm('Clear all verse history?')) {
        verseHistory = [];
        updateHistoryUI();
    }
}

// Get full book name from abbreviation
function getBookName(abbrev) {
    const book = BIBLE_BOOKS.find(b => b.abbrev === abbrev);
    return book ? book.name : abbrev;
}

// Show error message
function showError(message) {
    const displayArea = document.getElementById('displayArea');
    displayArea.innerHTML = `<div class="error-message">${message}</div>`;
}

// Clear display
function clearDisplay() {
    const displayArea = document.getElementById('displayArea');
    displayArea.innerHTML = `
        <div class="placeholder-text">
            Enter a verse reference above to begin<br>
            <small style="color: #444; margin-top: 10px; display: block;">
                Try: John 3:16, Psalm 23:1, Romans 8:28, Genesis 1:1
            </small>
        </div>
    `;
    document.getElementById('verseInput').value = '';
    document.getElementById('verseInput').focus();

    // Send to display window
    sendToDisplay('CLEAR_DISPLAY');
}

// Set layout
function setLayout(layout) {
    currentLayout = layout;
    document.getElementById('stackedBtn').classList.toggle('active', layout === 'stacked');
    document.getElementById('sideBySideBtn').classList.toggle('active', layout === 'side-by-side');

    // Re-render if there's content
    const container = document.querySelector('.verse-container');
    if (container) {
        container.className = `verse-container ${currentLayout}`;

        // Send updated content to display window
        sendToDisplay('UPDATE_DISPLAY', { html: container.outerHTML });
    }
}

// Update background color
function updateBackground() {
    const color = document.getElementById('bgColor').value;
    document.getElementById('displayArea').style.backgroundColor = color;

    // Send to display window
    sendToDisplay('UPDATE_BACKGROUND', { color });
}

// Update text color
function updateTextColor() {
    const color = document.getElementById('textColor').value;
    document.querySelectorAll('.verse-text').forEach(el => {
        el.style.color = color;
    });

    // Send to display window
    sendToDisplay('UPDATE_TEXT_COLOR', { color });
}

// Update font size
function updateFontSize() {
    const size = document.getElementById('fontSize').value;
    document.getElementById('fontSizeValue').textContent = size + 'em';
    document.querySelectorAll('.verse-text').forEach(el => {
        el.style.fontSize = size + 'em';
    });

    // Send to display window
    sendToDisplay('UPDATE_FONT_SIZE', { size });
}

// Background customization functions
function updateBackgroundType() {
    const type = document.getElementById('bgType').value;
    const bgColorSection = document.getElementById('bgColorSection');
    const bgUrlSection = document.getElementById('bgUrlSection');

    backgroundSettings.type = type;

    if (type === 'color') {
        bgColorSection.style.display = 'block';
        bgUrlSection.style.display = 'none';
        // Apply current color
        updateBackground();
    } else {
        bgColorSection.style.display = 'none';
        bgUrlSection.style.display = 'block';
        // Show URL field for image/video
    }

    saveBackgroundSettings();
}

function applyBackgroundMedia() {
    const url = document.getElementById('bgUrl').value.trim();
    const type = backgroundSettings.type;

    // Validate HTTPS URL
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    if (!url.startsWith('https://')) {
        alert('Only HTTPS URLs are allowed for security reasons');
        return;
    }

    // Validate file extension
    const validImageExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const validVideoExts = ['.mp4', '.webm'];
    const urlLower = url.toLowerCase();

    if (type === 'image') {
        const hasValidExt = validImageExts.some(ext => urlLower.includes(ext));
        if (!hasValidExt) {
            alert('Please use a valid image format: JPG, PNG, WebP, or GIF');
            return;
        }
    } else if (type === 'video') {
        const hasValidExt = validVideoExts.some(ext => urlLower.includes(ext));
        if (!hasValidExt) {
            alert('Please use a valid video format: MP4 or WebM');
            return;
        }
    }

    backgroundSettings.url = url;

    // Clear previous background media
    sendToDisplay('CLEAR_BACKGROUND_MEDIA');

    // Apply new background
    if (type === 'image') {
        sendToDisplay('UPDATE_BACKGROUND_IMAGE', { url });
    } else if (type === 'video') {
        sendToDisplay('UPDATE_BACKGROUND_VIDEO', { url });
    }

    saveBackgroundSettings();
}

function updateTextShadow() {
    const enabled = document.getElementById('textShadowToggle').checked;
    backgroundSettings.textShadow = enabled;

    // Send to display window
    sendToDisplay('UPDATE_TEXT_SHADOW', { enabled });

    saveBackgroundSettings();
}

function updateOverlayOpacity() {
    const opacity = document.getElementById('overlayOpacity').value;
    document.getElementById('overlayOpacityValue').textContent = opacity + '%';
    backgroundSettings.overlayOpacity = parseInt(opacity);

    // Send to display window
    sendToDisplay('UPDATE_OVERLAY_OPACITY', { opacity: parseInt(opacity) });

    saveBackgroundSettings();
}

function saveBackgroundSettings() {
    localStorage.setItem('liveverses_background_settings', JSON.stringify(backgroundSettings));
}

function loadBackgroundSettings() {
    const saved = localStorage.getItem('liveverses_background_settings');
    if (saved) {
        try {
            backgroundSettings = JSON.parse(saved);

            // Restore UI state
            if (document.getElementById('bgType')) {
                document.getElementById('bgType').value = backgroundSettings.type;
                updateBackgroundType();
            }

            if (backgroundSettings.type === 'color' && document.getElementById('bgColor')) {
                document.getElementById('bgColor').value = backgroundSettings.color;
            } else if (backgroundSettings.url && document.getElementById('bgUrl')) {
                document.getElementById('bgUrl').value = backgroundSettings.url;
            }

            if (document.getElementById('textShadowToggle')) {
                document.getElementById('textShadowToggle').checked = backgroundSettings.textShadow;
            }

            if (document.getElementById('overlayOpacity')) {
                document.getElementById('overlayOpacity').value = backgroundSettings.overlayOpacity;
                document.getElementById('overlayOpacityValue').textContent = backgroundSettings.overlayOpacity + '%';
            }

            // Apply saved settings to display
            setTimeout(() => {
                if (backgroundSettings.type === 'color') {
                    sendToDisplay('UPDATE_BACKGROUND', { color: backgroundSettings.color });
                } else if (backgroundSettings.type === 'image' && backgroundSettings.url) {
                    sendToDisplay('UPDATE_BACKGROUND_IMAGE', { url: backgroundSettings.url });
                } else if (backgroundSettings.type === 'video' && backgroundSettings.url) {
                    sendToDisplay('UPDATE_BACKGROUND_VIDEO', { url: backgroundSettings.url });
                }

                if (backgroundSettings.textShadow) {
                    sendToDisplay('UPDATE_TEXT_SHADOW', { enabled: true });
                }

                if (backgroundSettings.overlayOpacity > 0) {
                    sendToDisplay('UPDATE_OVERLAY_OPACITY', { opacity: backgroundSettings.overlayOpacity });
                }
            }, 500);
        } catch (e) {
            console.error('Failed to load background settings:', e);
        }
    }
}

// Rapid verse selection - Smart autocomplete
function initRapidSelection() {
    const input = document.getElementById('verseInput');
    const dropdown = document.getElementById('autocompleteDropdown');
    let selectedIndex = -1;

    input.addEventListener('input', (e) => {
        handleRapidInput(e.target.value);
    });

    input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.autocomplete-item:not(.hidden)');
        const isGrid = dropdown.querySelector('.autocomplete-grid') !== null;

        // Calculate grid dimensions
        let cols = 1;
        if (isGrid) {
            const gridContainer = dropdown.querySelector('.autocomplete-grid');
            if (gridContainer) {
                const firstItem = gridContainer.querySelector('.autocomplete-item');
                if (firstItem) {
                    const containerWidth = gridContainer.offsetWidth;
                    const itemWidth = firstItem.offsetWidth;
                    cols = Math.floor(containerWidth / itemWidth);
                }
            }
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (isGrid) {
                // Grid navigation - move down by one row (cols items)
                selectedIndex = Math.min(selectedIndex + cols, items.length - 1);
            } else {
                // List navigation
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            }
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isGrid) {
                // Grid navigation - move up by one row
                selectedIndex = Math.max(selectedIndex - cols, -1);
            } else {
                // List navigation
                selectedIndex = Math.max(selectedIndex - 1, -1);
            }
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowRight' && isGrid) {
            e.preventDefault();
            selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'ArrowLeft' && isGrid) {
            e.preventDefault();
            selectedIndex = Math.max(selectedIndex - 1, -1);
            updateSelection(items, selectedIndex);
        } else if (e.key === 'Tab' && selectedIndex >= 0 && items[selectedIndex]) {
            e.preventDefault();
            items[selectedIndex].click();
        } else if (e.key === 'Escape') {
            hideAutocomplete();
            selectedIndex = -1;
        } else if (e.key === 'Enter') {
            if (selectedIndex >= 0 && items[selectedIndex]) {
                e.preventDefault();
                items[selectedIndex].click();
            } else if (autocompleteState.mode === 'book' || !dropdown.classList.contains('visible')) {
                // If in book mode or dropdown hidden, do normal lookup
                lookupVerse();
            }
        } else {
            selectedIndex = -1;
        }
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (!input.contains(e.target) && !dropdown.contains(e.target)) {
            hideAutocomplete();
        }
    });
}

function updateSelection(items, index) {
    items.forEach((item, i) => {
        if (i === index) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('selected');
        }
    });
}

function handleRapidInput(value) {
    const trimmed = value.trim();

    // Reset if empty
    if (!trimmed) {
        resetAutocomplete();
        hideAutocomplete();
        return;
    }

    // Check if this is a comma-separated list (multi-verse mode) or contains hyphen (verse range)
    const hasComma = trimmed.includes(',');
    const hasHyphen = /:\d+-/.test(trimmed); // Check for verse range like "3:14-16"

    if (hasComma || hasHyphen) {
        // Disable rapid selection for multi-verse input or verse ranges
        hideAutocomplete();
        resetAutocomplete();
        return;
    }

    // Detect what we're inputting
    const parts = trimmed.split(/[\s:]+/);

    if (autocompleteState.selectedBook && autocompleteState.selectedChapter) {
        // Mode: Verse selection
        const verseNum = parts[parts.length - 1];
        if (/^\d+$/.test(verseNum)) {
            showVerseOptions(parseInt(verseNum));
        }
    } else if (autocompleteState.selectedBook) {
        // Mode: Chapter selection
        const chapterNum = parts[parts.length - 1];
        if (/^\d+$/.test(chapterNum)) {
            showChapterOptions(parseInt(chapterNum));
        } else {
            // Show all chapters
            showChapterOptions(null);
        }
    } else {
        // Mode: Book selection
        showBookOptions(trimmed);
    }
}

function showBookOptions(query) {
    const dropdown = document.getElementById('autocompleteDropdown');
    const queryLower = query.toLowerCase();

    // Find matching books
    const matches = BIBLE_BOOKS.filter(book => {
        const nameLower = book.name.toLowerCase();
        const abbrevLower = book.abbrev.toLowerCase();
        const aliasMatch = book.aliases.some(a => a.toLowerCase().startsWith(queryLower));

        return nameLower.includes(queryLower) ||
               abbrevLower.startsWith(queryLower) ||
               aliasMatch;
    });

    if (matches.length === 0) {
        hideAutocomplete();
        return;
    }

    // If single match and query matches exactly, auto-select
    if (matches.length === 1) {
        const match = matches[0];
        const exactMatch = match.abbrev.toLowerCase() === queryLower ||
                          match.aliases.some(a => a.toLowerCase() === queryLower);

        if (exactMatch) {
            selectBook(match);
            return;
        }
    }

    // Show dropdown with matches
    dropdown.innerHTML = matches.map(book => `
        <div class="autocomplete-item" data-book="${book.abbrev}">
            <span class="book-abbrev">${book.abbrev}</span>
            <span class="book-name">${book.name}</span>
        </div>
    `).join('');

    // Add click handlers
    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const bookAbbrev = item.dataset.book;
            const book = BIBLE_BOOKS.find(b => b.abbrev === bookAbbrev);
            selectBook(book);
        });
    });

    dropdown.classList.add('visible');
    autocompleteState.mode = 'book';
}

function selectBook(book) {
    autocompleteState.selectedBook = book;
    autocompleteState.mode = 'chapter';

    const input = document.getElementById('verseInput');
    input.value = book.name + ' ';

    // Get chapter count from any loaded Bible version
    const version = bibleData.KJV || bibleData.ASV || bibleData.WEB || bibleData.NLT;
    if (version) {
        const bookData = version.find(b => b.abbrev === book.abbrev);
        if (bookData && bookData.chapters.length === 1) {
            // Single chapter book - skip to verse
            autocompleteState.selectedChapter = 1;
            input.value = book.name + ' 1:';
            autocompleteState.mode = 'verse';
            showVerseOptions(null);
            return;
        }
    }

    showChapterOptions(null);
    input.focus();
}

function showChapterOptions(filterNum) {
    const dropdown = document.getElementById('autocompleteDropdown');
    const version = bibleData.KJV || bibleData.ASV || bibleData.WEB || bibleData.NLT;

    if (!version || !autocompleteState.selectedBook) {
        hideAutocomplete();
        return;
    }

    const bookData = version.find(b => b.abbrev === autocompleteState.selectedBook.abbrev);
    if (!bookData) {
        hideAutocomplete();
        return;
    }

    const chapterCount = bookData.chapters.length;
    const chapters = Array.from({ length: chapterCount }, (_, i) => i + 1);

    // Filter if number provided
    const filtered = filterNum ? chapters.filter(c => c.toString().startsWith(filterNum.toString())) : chapters;

    if (filtered.length === 1 && filterNum) {
        // Auto-select single match
        selectChapter(filtered[0]);
        return;
    }

    // Show chapter grid
    dropdown.innerHTML = `
        <div class="autocomplete-grid chapter-grid">
            ${filtered.map(ch => `
                <div class="autocomplete-item grid-item" data-chapter="${ch}">
                    ${ch}
                </div>
            `).join('')}
        </div>
    `;

    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            selectChapter(parseInt(item.dataset.chapter));
        });
    });

    dropdown.classList.add('visible');
}

function selectChapter(chapter) {
    autocompleteState.selectedChapter = chapter;
    autocompleteState.mode = 'verse';

    const input = document.getElementById('verseInput');
    input.value = `${autocompleteState.selectedBook.name} ${chapter}:`;

    showVerseOptions(null);
    input.focus();
}

function showVerseOptions(filterNum) {
    const dropdown = document.getElementById('autocompleteDropdown');
    const version = bibleData.KJV || bibleData.ASV || bibleData.WEB || bibleData.NLT;

    if (!version || !autocompleteState.selectedBook || !autocompleteState.selectedChapter) {
        hideAutocomplete();
        return;
    }

    const bookData = version.find(b => b.abbrev === autocompleteState.selectedBook.abbrev);
    if (!bookData) {
        hideAutocomplete();
        return;
    }

    const chapterData = bookData.chapters[autocompleteState.selectedChapter - 1];
    if (!chapterData) {
        hideAutocomplete();
        return;
    }

    const verseCount = chapterData.length;
    const verses = Array.from({ length: verseCount }, (_, i) => i + 1);

    // Filter if number provided
    const filtered = filterNum ? verses.filter(v => v.toString().startsWith(filterNum.toString())) : verses;

    if (filtered.length === 1 && filterNum) {
        // Auto-complete single match
        const input = document.getElementById('verseInput');
        input.value = `${autocompleteState.selectedBook.name} ${autocompleteState.selectedChapter}:${filtered[0]}`;
        hideAutocomplete();
        return;
    }

    // Show verse grid
    dropdown.innerHTML = `
        <div class="autocomplete-grid verse-grid">
            ${filtered.map(v => `
                <div class="autocomplete-item grid-item" data-verse="${v}">
                    ${v}
                </div>
            `).join('')}
        </div>
    `;

    dropdown.querySelectorAll('.autocomplete-item').forEach(item => {
        item.addEventListener('click', () => {
            const verse = parseInt(item.dataset.verse);
            const input = document.getElementById('verseInput');
            input.value = `${autocompleteState.selectedBook.name} ${autocompleteState.selectedChapter}:${verse}`;
            hideAutocomplete();

            // Auto-lookup after verse selection
            setTimeout(() => lookupVerse(), 100);
        });
    });

    dropdown.classList.add('visible');
}

function hideAutocomplete() {
    const dropdown = document.getElementById('autocompleteDropdown');
    dropdown.classList.remove('visible');
    dropdown.innerHTML = '';
}

function resetAutocomplete() {
    autocompleteState = {
        mode: 'book',
        selectedBook: null,
        selectedChapter: null,
        currentInput: ''
    };
}

// Toggle preview mode
function togglePreviewMode() {
    previewMode = document.getElementById('previewModeToggle').checked;
    localStorage.setItem('previewMode', previewMode);

    const singleView = document.getElementById('singleView');
    const splitView = document.getElementById('splitView');

    if (previewMode) {
        singleView.style.display = 'none';
        splitView.style.display = 'block';
    } else {
        singleView.style.display = 'block';
        splitView.style.display = 'none';
    }
}

// Go Live - Send preview content to live and display
function goLive() {
    if (!previewContent) {
        console.log('No preview content to send live');
        return;
    }

    // Update live area
    const liveArea = document.getElementById('liveArea');
    liveArea.innerHTML = previewContent;
    liveContent = previewContent;

    // Send to display window
    sendToDisplay('UPDATE_DISPLAY', { html: previewContent });

    console.log('Content sent live!');
}

// Ctrl+Enter keyboard shortcut for Go Live
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (previewMode && previewContent) {
            goLive();
        }
    }
});

// YouTube Video Functions
function parseYouTubeUrl(input) {
    // Remove whitespace
    const trimmed = input.trim();

    // Try to extract video ID from various formats
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
        /^([a-zA-Z0-9_-]{11})$/ // Just the video ID
    ];

    for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
            return match[1];
        }
    }

    return null;
}

function getYouTubeThumbnail(videoId) {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

// Agenda Management Functions
function addVerseToAgenda() {
    const input = document.getElementById('verseInput').value.trim();

    if (!input) {
        showError('Please enter a verse reference');
        return;
    }

    // Parse the reference
    const references = input.split(',').map(r => r.trim()).filter(r => r.length > 0);
    const parsedRefs = [];

    for (const ref of references) {
        const parsed = parseReference(ref);
        if (!parsed) {
            showError(`Invalid verse reference: "${ref}"`);
            return;
        }
        parsedRefs.push({ input: ref, parsed: parsed });
    }

    // Get selected versions
    const selectedVersions = [];
    if (document.getElementById('kjvCheck').checked) selectedVersions.push('KJV');
    if (document.getElementById('asvCheck').checked) selectedVersions.push('ASV');
    if (document.getElementById('webCheck').checked) selectedVersions.push('WEB');
    if (document.getElementById('nltCheck').checked) selectedVersions.push('NLT');

    if (selectedVersions.length === 0) {
        showError('Please select at least one Bible version');
        return;
    }

    // Add to agenda
    currentAgenda.push({
        type: 'verse',
        reference: input,
        parsedRefs: parsedRefs,
        versions: selectedVersions
    });

    updateAgendaUI();

    // Clear input
    document.getElementById('verseInput').value = '';
    resetAutocomplete();
}

function addVideoToAgenda() {
    const input = document.getElementById('videoInput').value.trim();

    if (!input) {
        showError('Please enter a YouTube URL or video ID');
        return;
    }

    const videoId = parseYouTubeUrl(input);

    if (!videoId) {
        showError('Invalid YouTube URL or video ID');
        return;
    }

    // Add to agenda
    currentAgenda.push({
        type: 'video',
        videoId: videoId,
        title: `YouTube Video`,
        autoPlay: true
    });

    updateAgendaUI();

    // Clear input
    document.getElementById('videoInput').value = '';
}

function updateAgendaUI() {
    const agendaList = document.getElementById('agendaList');
    if (!agendaList) return;

    if (currentAgenda.length === 0) {
        agendaList.innerHTML = '<div class="agenda-empty">No items in agenda</div>';
        return;
    }

    agendaList.innerHTML = currentAgenda.map((item, index) => {
        const isActive = index === currentAgendaIndex;

        if (item.type === 'verse') {
            return `
                <div class="agenda-item ${isActive ? 'active' : ''}" data-index="${index}">
                    <div class="agenda-icon">📖</div>
                    <div class="agenda-content">
                        <div class="agenda-title">${item.reference}</div>
                        <div class="agenda-meta">${item.versions.join(', ')}</div>
                    </div>
                    <div class="agenda-actions">
                        <button class="btn-agenda-action" onclick="displayAgendaItem(${index})" title="Display">▶</button>
                        <button class="btn-agenda-action btn-agenda-remove" onclick="removeAgendaItem(${index})" title="Remove">✕</button>
                    </div>
                </div>
            `;
        } else if (item.type === 'video') {
            return `
                <div class="agenda-item ${isActive ? 'active' : ''}" data-index="${index}">
                    <div class="agenda-icon">🎬</div>
                    <div class="agenda-content">
                        <div class="agenda-title">${item.title}</div>
                        <div class="agenda-meta">Video ID: ${item.videoId}</div>
                    </div>
                    <div class="agenda-actions">
                        <button class="btn-agenda-action" onclick="displayAgendaItem(${index})" title="Display">▶</button>
                        <button class="btn-agenda-action" onclick="previewVideo('${item.videoId}')" title="Preview">👁</button>
                        <button class="btn-agenda-action btn-agenda-remove" onclick="removeAgendaItem(${index})" title="Remove">✕</button>
                    </div>
                </div>
            `;
        }
    }).join('');
}

function displayAgendaItem(index) {
    if (index < 0 || index >= currentAgenda.length) return;

    currentAgendaIndex = index;
    const item = currentAgenda[index];

    if (item.type === 'verse') {
        // Display verse
        if (item.parsedRefs.length === 1) {
            displayVerses(item.parsedRefs[0].parsed, item.versions);
        } else {
            displayMultipleVerses(item.parsedRefs, item.versions);
        }
    } else if (item.type === 'video') {
        // Display video
        displayVideo(item.videoId, item.autoPlay);
    }

    updateAgendaUI();
}

function displayVideo(videoId, autoPlay = true) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=${autoPlay ? 1 : 0}&rel=0`;

    // Create video container HTML
    const videoHtml = `
        <div class="video-container">
            <iframe
                width="100%"
                height="100%"
                src="${embedUrl}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
            </iframe>
        </div>
    `;

    if (previewMode) {
        // Preview mode: show in preview pane only
        const previewArea = document.getElementById('previewArea');
        previewArea.innerHTML = videoHtml;
        previewContent = videoHtml;

        // Enable Go Live button
        const goLiveBtn = document.getElementById('goLiveBtn');
        if (goLiveBtn) {
            goLiveBtn.disabled = false;
        }
    } else {
        // Direct mode: show in display area and send to display window
        const displayArea = document.getElementById('displayArea');
        displayArea.innerHTML = videoHtml;

        // Send to display window immediately
        sendToDisplay('UPDATE_DISPLAY_VIDEO', { videoId, autoPlay });
    }
}

function previewVideo(videoId) {
    const previewUrl = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`;

    // Open preview in small window
    const previewWindow = window.open(
        '',
        'VideoPreview',
        'width=640,height=360,menubar=no,toolbar=no,location=no,status=no'
    );

    if (previewWindow) {
        previewWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Video Preview</title>
                <style>
                    body { margin: 0; padding: 0; background: #000; }
                    iframe { width: 100%; height: 100vh; border: none; }
                </style>
            </head>
            <body>
                <iframe src="${previewUrl}" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </body>
            </html>
        `);
    }
}

function removeAgendaItem(index) {
    if (index < 0 || index >= currentAgenda.length) return;

    currentAgenda.splice(index, 1);

    // Adjust current index if needed
    if (currentAgendaIndex >= currentAgenda.length) {
        currentAgendaIndex = currentAgenda.length - 1;
    }

    updateAgendaUI();
}

function clearAgenda() {
    if (confirm('Clear all agenda items?')) {
        currentAgenda = [];
        currentAgendaIndex = -1;
        updateAgendaUI();
    }
}

function nextAgendaItem() {
    if (currentAgenda.length === 0) return;

    const nextIndex = (currentAgendaIndex + 1) % currentAgenda.length;
    displayAgendaItem(nextIndex);
}

function previousAgendaItem() {
    if (currentAgenda.length === 0) return;

    const prevIndex = currentAgendaIndex > 0 ? currentAgendaIndex - 1 : currentAgenda.length - 1;
    displayAgendaItem(prevIndex);
}

// ============================================
// NOTES FUNCTIONALITY
// ============================================

// Tab switching
function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab
    const tabId = tabName + 'Tab';
    const tabContent = document.getElementById(tabId);
    if (tabContent) {
        tabContent.classList.add('active');
    }

    // Activate button
    const buttons = document.querySelectorAll('.tab-btn');
    const tabMap = { 'verses': 0, 'notes': 1, 'agenda': 2 };
    const index = tabMap[tabName];
    if (buttons[index]) {
        buttons[index].classList.add('active');
    }
}

// Update markdown preview as user types
function updateMarkdownPreview() {
    const content = document.getElementById('noteContent')?.value || '';
    const preview = document.getElementById('notePreview');

    if (!preview) return;

    if (!content.trim()) {
        preview.innerHTML = '<p style="opacity: 0.5;">Preview will appear here...</p>';
        return;
    }

    try {
        // Use marked.js to render markdown
        const html = marked.parse(content);
        preview.innerHTML = html;
    } catch (e) {
        console.error('Markdown parsing error:', e);
        preview.innerHTML = `<p style="color: var(--accent-danger);">Error rendering markdown</p>`;
    }
}

// Save note (create or update)
function saveNote() {
    const title = document.getElementById('noteTitle')?.value.trim();
    const content = document.getElementById('noteContent')?.value.trim();

    if (!title) {
        alert('Please enter a note title');
        return;
    }

    if (!content) {
        alert('Please enter note content');
        return;
    }

    const now = Date.now();

    if (currentEditingNoteId) {
        // Update existing note
        const note = savedNotes.find(n => n.id === currentEditingNoteId);
        if (note) {
            note.title = title;
            note.content = content;
            note.updatedAt = now;
        }
        currentEditingNoteId = null;
    } else {
        // Create new note
        const newNote = {
            id: generateNoteId(),
            title: title,
            content: content,
            createdAt: now,
            updatedAt: now
        };
        savedNotes.push(newNote);
    }

    saveNotesToStorage();
    updateSavedNotesList();
    clearNoteEditor();

    alert('Note saved successfully!');
}

// Clear note editor
function clearNoteEditor() {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('notePreview').innerHTML = '<p style="opacity: 0.5;">Preview will appear here...</p>';
    currentEditingNoteId = null;
}

// Update saved notes list UI
function updateSavedNotesList() {
    const listContainer = document.getElementById('savedNotesList');
    if (!listContainer) return;

    if (savedNotes.length === 0) {
        listContainer.innerHTML = '<div class="notes-empty">No notes saved yet</div>';
        return;
    }

    listContainer.innerHTML = savedNotes.map(note => {
        // Create preview text (first 50 chars of plain text content)
        const preview = note.content.replace(/[#*>\-]/g, '').trim().substring(0, 50) + '...';

        return `
            <div class="saved-note-item" onclick="loadNote('${note.id}')">
                <div class="note-item-title">${escapeHtml(note.title)}</div>
                <div class="note-item-preview">${escapeHtml(preview)}</div>
                <div class="note-item-actions" onclick="event.stopPropagation()">
                    <button class="btn-note-action" onclick="editNote('${note.id}')">Edit</button>
                    <button class="btn-note-action" onclick="projectNoteById('${note.id}')">Project</button>
                    <button class="btn-note-action" onclick="addNoteToAgenda('${note.id}')">+ Agenda</button>
                    <button class="btn-note-action danger" onclick="deleteNote('${note.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Load note for viewing (without editing)
function loadNote(noteId) {
    const note = savedNotes.find(n => n.id === noteId);
    if (!note) return;

    // Just project it
    projectNoteById(noteId);
}

// Edit note
function editNote(noteId) {
    const note = savedNotes.find(n => n.id === noteId);
    if (!note) return;

    document.getElementById('noteTitle').value = note.title;
    document.getElementById('noteContent').value = note.content;
    currentEditingNoteId = noteId;

    // Update preview
    updateMarkdownPreview();

    // Scroll to top of editor
    document.getElementById('noteTitle').scrollIntoView({ behavior: 'smooth' });
}

// Delete note
function deleteNote(noteId) {
    if (!confirm('Delete this note?')) return;

    savedNotes = savedNotes.filter(n => n.id !== noteId);
    saveNotesToStorage();
    updateSavedNotesList();
}

// Project note to display
function projectNote() {
    const title = document.getElementById('noteTitle')?.value.trim();
    const content = document.getElementById('noteContent')?.value.trim();

    if (!content) {
        alert('Please enter note content to project');
        return;
    }

    projectNoteContent(title, content);
}

// Project note by ID
function projectNoteById(noteId) {
    const note = savedNotes.find(n => n.id === noteId);
    if (!note) return;

    projectNoteContent(note.title, note.content);
}

// Project note content to display
function projectNoteContent(title, content) {
    try {
        // Render markdown
        const html = marked.parse(content);

        // Create note container
        const container = document.createElement('div');
        container.className = 'note-container';

        if (title) {
            const titleDiv = document.createElement('div');
            titleDiv.className = 'note-title-display';
            titleDiv.textContent = title;
            container.appendChild(titleDiv);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'note-content-display';
        contentDiv.innerHTML = html;
        container.appendChild(contentDiv);

        if (previewMode) {
            // Preview mode: show in preview pane only
            const previewArea = document.getElementById('previewArea');
            previewArea.innerHTML = '';
            previewArea.appendChild(container.cloneNode(true));
            previewContent = container.outerHTML;

            // Enable Go Live button
            const goLiveBtn = document.getElementById('goLiveBtn');
            if (goLiveBtn) {
                goLiveBtn.disabled = false;
            }
        } else {
            // Direct mode: show in display area and send to display window
            const displayArea = document.getElementById('displayArea');
            displayArea.innerHTML = '';
            displayArea.appendChild(container);

            // Send to display window immediately
            sendToDisplay('UPDATE_DISPLAY_NOTE', { html: container.outerHTML });
        }
    } catch (e) {
        console.error('Error projecting note:', e);
        alert('Error rendering note: ' + e.message);
    }
}

// Filter notes by search
function filterNotes() {
    const searchTerm = document.getElementById('noteSearch')?.value.toLowerCase() || '';
    const noteItems = document.querySelectorAll('.saved-note-item');

    noteItems.forEach(item => {
        const title = item.querySelector('.note-item-title')?.textContent.toLowerCase() || '';
        const preview = item.querySelector('.note-item-preview')?.textContent.toLowerCase() || '';

        if (title.includes(searchTerm) || preview.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Add note to current agenda
function addNoteToAgenda(noteId) {
    const note = savedNotes.find(n => n.id === noteId);
    if (!note) return;

    if (!currentAgenda || !currentAgenda.items) {
        alert('Please select or create an agenda first');
        return;
    }

    currentAgenda.items.push({
        type: 'note',
        noteId: noteId,
        title: note.title
    });

    saveAgendas();
    updateAgendaUI();

    // Switch to agenda tab
    switchTab('agenda');

    alert('Note added to agenda');
}

// ============================================
// END NOTES FUNCTIONALITY
// ============================================

// Handle Enter key in input
document.addEventListener('DOMContentLoaded', () => {
    // Initialize rapid selection
    initRapidSelection();

    // Load Bible data on startup
    loadBibleData();

    // Initialize preview mode state
    const previewToggle = document.getElementById('previewModeToggle');
    if (previewToggle) {
        previewToggle.checked = previewMode;
        togglePreviewMode(); // Apply saved state
    }

    // Load background settings
    loadBackgroundSettings();

    // Initialize agenda UI
    updateAgendaUI();

    // Initialize new agenda system
    initAgendaSystem();

    // Load notes from storage
    loadNotesFromStorage();

    // Add markdown preview listener
    const noteContent = document.getElementById('noteContent');
    if (noteContent) {
        noteContent.addEventListener('input', updateMarkdownPreview);
    }
});

// ========================================
// DATA MANAGEMENT: Export / Import / Clear
// ========================================

// Export all LiveVerses data to JSON file
function exportAllData() {
    try {
        const exportData = {
            version: "1.0",
            exportDate: new Date().toISOString(),
            history: verseHistory,
            agendas: currentAgenda,
            settings: {
                theme: currentTheme,
                previewMode: previewMode,
                layout: currentLayout,
                bgColor: document.getElementById('bgColor')?.value || '#0f172a',
                textColor: document.getElementById('textColor')?.value || '#ffffff',
                fontSize: document.getElementById('fontSize')?.value || '2.5'
            },
            backgroundSettings: backgroundSettings || {},
            notes: savedNotes || []
        };

        // Collect all liveverses_* keys from localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('liveverses_')) {
                const shortKey = key.replace('liveverses_', '');
                // Skip keys already handled
                if (shortKey !== 'history' && shortKey !== 'background_settings') {
                    try {
                        const value = localStorage.getItem(key);
                        exportData[shortKey] = JSON.parse(value);
                    } catch (e) {
                        exportData[shortKey] = localStorage.getItem(key);
                    }
                }
            }
        }

        // Create JSON blob
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });

        // Create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;

        // Format filename with date
        const dateStr = new Date().toISOString().split('T')[0];
        a.download = `liveverses-backup-${dateStr}.json`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showDataMessage('Data exported successfully!', 'success');
    } catch (error) {
        console.error('Export error:', error);
        showDataMessage('Error exporting data: ' + error.message, 'error');
    }
}

// Import data from JSON file
function importDataFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target.result);

                // Validate structure
                if (!importData.version) {
                    throw new Error('Invalid backup file format');
                }

                // Ask user: merge or replace
                const shouldMerge = confirm(
                    'Import Options:\n\n' +
                    'OK = Merge with existing data\n' +
                    'Cancel = Replace all existing data\n\n' +
                    'Choose how to import:'
                );

                if (!shouldMerge) {
                    // Clear existing data first
                    clearAllDataInternal(false);
                }

                // Import history
                if (importData.history && Array.isArray(importData.history)) {
                    if (shouldMerge) {
                        const combined = [...importData.history, ...verseHistory];
                        verseHistory = combined.slice(0, MAX_HISTORY);
                    } else {
                        verseHistory = importData.history.slice(0, MAX_HISTORY);
                    }
                    localStorage.setItem('liveverses_history', JSON.stringify(verseHistory));
                    updateHistoryUI();
                }

                // Import agendas
                if (importData.agendas && Array.isArray(importData.agendas)) {
                    if (shouldMerge) {
                        currentAgenda = [...importData.agendas, ...currentAgenda];
                    } else {
                        currentAgenda = importData.agendas;
                    }
                    localStorage.setItem('liveverses_agendas', JSON.stringify(currentAgenda));
                    updateAgendaUI();
                }

                // Import settings
                if (importData.settings) {
                    const settings = importData.settings;

                    if (settings.theme) {
                        currentTheme = settings.theme;
                        localStorage.setItem('theme', currentTheme);
                        document.body.setAttribute('data-theme', currentTheme);
                        updateThemeIcon();
                    }

                    if (typeof settings.previewMode !== 'undefined') {
                        previewMode = settings.previewMode;
                        localStorage.setItem('previewMode', previewMode);
                        const previewToggle = document.getElementById('previewModeToggle');
                        if (previewToggle) {
                            previewToggle.checked = previewMode;
                            togglePreviewMode();
                        }
                    }

                    if (settings.layout) {
                        currentLayout = settings.layout;
                        setLayout(currentLayout);
                    }

                    if (settings.bgColor) {
                        const bgColorInput = document.getElementById('bgColor');
                        if (bgColorInput) {
                            bgColorInput.value = settings.bgColor;
                            updateBackground();
                        }
                    }

                    if (settings.textColor) {
                        const textColorInput = document.getElementById('textColor');
                        if (textColorInput) {
                            textColorInput.value = settings.textColor;
                            updateTextColor();
                        }
                    }

                    if (settings.fontSize) {
                        const fontSizeInput = document.getElementById('fontSize');
                        if (fontSizeInput) {
                            fontSizeInput.value = settings.fontSize;
                            updateFontSize();
                        }
                    }
                }

                // Import background settings
                if (importData.backgroundSettings) {
                    backgroundSettings = importData.backgroundSettings;
                    localStorage.setItem('liveverses_background_settings', JSON.stringify(backgroundSettings));
                    loadBackgroundSettings();
                }

                // Import notes
                if (importData.notes && Array.isArray(importData.notes)) {
                    if (shouldMerge) {
                        savedNotes = [...importData.notes, ...savedNotes];
                    } else {
                        savedNotes = importData.notes;
                    }
                    saveNotesToStorage();
                    updateSavedNotesList();
                }

                // Import other liveverses_* keys
                for (const key in importData) {
                    if (key !== 'version' && key !== 'exportDate' &&
                        key !== 'history' && key !== 'settings' &&
                        key !== 'agendas' && key !== 'notes' && key !== 'backgroundSettings') {
                        try {
                            localStorage.setItem('liveverses_' + key, JSON.stringify(importData[key]));
                        } catch (e) {
                            localStorage.setItem('liveverses_' + key, importData[key]);
                        }
                    }
                }

                showDataMessage('Data imported successfully!', 'success');
            } catch (error) {
                console.error('Import error:', error);
                showDataMessage('Error importing data: ' + error.message, 'error');
            }
        };

        reader.onerror = () => {
            showDataMessage('Error reading file', 'error');
        };

        reader.readAsText(file);
    };

    input.click();
}

// Clear all LiveVerses data
function clearAllData() {
    if (!confirm('⚠️ WARNING: This will permanently delete ALL LiveVerses data including:\n\n' +
                 '• Verse history\n' +
                 '• Agenda items\n' +
                 '• Saved settings\n' +
                 '• All preferences\n\n' +
                 'This action cannot be undone. Continue?')) {
        return;
    }

    clearAllDataInternal(true);
}

// Internal function to clear data (with optional confirmation)
function clearAllDataInternal(showMessage = true) {
    try {
        // Clear all liveverses_* keys
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('liveverses_')) {
                keysToRemove.push(key);
            }
        }

        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Also clear theme and previewMode
        localStorage.removeItem('theme');
        localStorage.removeItem('previewMode');

        // Reset in-memory state
        verseHistory = [];
        currentAgenda = [];
        currentAgendaIndex = -1;
        currentTheme = 'dark';
        previewMode = false;
        currentLayout = 'stacked';
        backgroundSettings = { type: 'color', color: '#0f172a', url: '', textShadow: false };

        // Reset UI
        updateHistoryUI();
        if (typeof updateAgendaUI === 'function') {
            updateAgendaUI();
        }

        // Reset theme
        document.body.setAttribute('data-theme', 'dark');
        updateThemeIcon();

        // Reset preview mode
        const previewToggle = document.getElementById('previewModeToggle');
        if (previewToggle) {
            previewToggle.checked = false;
            togglePreviewMode();
        }

        // Reset appearance controls
        const bgColorInput = document.getElementById('bgColor');
        const textColorInput = document.getElementById('textColor');
        const fontSizeInput = document.getElementById('fontSize');

        if (bgColorInput) bgColorInput.value = '#0f172a';
        if (textColorInput) textColorInput.value = '#ffffff';
        if (fontSizeInput) {
            fontSizeInput.value = '2.5';
            const fontSizeValue = document.getElementById('fontSizeValue');
            if (fontSizeValue) fontSizeValue.textContent = '2.5em';
        }

        // Reset layout
        setLayout('stacked');

        // Clear display
        clearDisplay();

        // Reset background settings
        if (typeof loadBackgroundSettings === 'function') {
            loadBackgroundSettings();
        }

        if (showMessage) {
            showDataMessage('All data cleared successfully', 'success');
        }
    } catch (error) {
        console.error('Error clearing data:', error);
        if (showMessage) {
            showDataMessage('Error clearing data: ' + error.message, 'error');
        }
    }
}

// Show data management message (success or error)
function showDataMessage(message, type = 'success') {
    const existingMsg = document.getElementById('dataManagementMessage');
    if (existingMsg) {
        existingMsg.remove();
    }

    const msgDiv = document.createElement('div');
    msgDiv.id = 'dataManagementMessage';
    msgDiv.textContent = message;
    msgDiv.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: slideInFromRight 0.3s ease-out;
        ${type === 'success'
            ? 'background: rgba(34, 197, 94, 0.9); color: white;'
            : 'background: rgba(239, 68, 68, 0.9); color: white;'}
    `;

    // Add animation styles if not already present
    if (!document.getElementById('dataManagementStyles')) {
        const style = document.createElement('style');
        style.id = 'dataManagementStyles';
        style.textContent = `
            @keyframes slideInFromRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutToRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(msgDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
        msgDiv.style.animation = 'slideOutToRight 0.3s ease-out';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}

// Calculate storage usage (optional feature)
function getStorageUsage() {
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('liveverses_') || key === 'theme' || key === 'previewMode')) {
            const value = localStorage.getItem(key);
            totalSize += key.length + (value ? value.length : 0);
        }
    }
    // Convert to KB
    return (totalSize / 1024).toFixed(2);
}

// Update storage indicator if it exists
function updateStorageIndicator() {
    const indicator = document.getElementById('storageUsage');
    if (indicator) {
        const usageKB = getStorageUsage();
        indicator.textContent = `Storage: ${usageKB} KB`;
    }
}

// ========================================
// END DATA MANAGEMENT
// ========================================

// ========================================
// NEW MULTI-AGENDA MANAGEMENT SYSTEM
// ========================================

// Initialize agenda system
function initAgendaSystem() {
    loadAgendasFromStorage();
    updateAgendaSelect();
}

// Load agendas from localStorage
function loadAgendasFromStorage() {
    const stored = localStorage.getItem('liveverses_agendas');
    if (stored) {
        try {
            const storedAgendas = JSON.parse(stored);
            // Only load if it's an array of agenda objects
            if (Array.isArray(storedAgendas) && storedAgendas.length > 0 && storedAgendas[0].id) {
                agendas = storedAgendas;
            }
        } catch (e) {
            console.error('Error loading agendas:', e);
            agendas = [];
        }
    }
}

// Save agendas to localStorage
function saveAgendasToStorage() {
    localStorage.setItem('liveverses_agendas', JSON.stringify(agendas));
}

// Update agenda select dropdown
function updateAgendaSelect() {
    const select = document.getElementById('agendaSelect');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">Select an agenda...</option>';

    agendas.forEach((agenda, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = agenda.title;
        select.appendChild(option);
    });

    // Restore selection if it still exists
    if (currentValue && agendas[currentValue]) {
        select.value = currentValue;
    }
}

// Show new agenda form
function showNewAgendaForm() {
    const form = document.getElementById('newAgendaForm');
    if (form) {
        form.style.display = 'block';
        document.getElementById('agendaTitleInput').focus();
    }
}

// Hide new agenda form
function hideNewAgendaForm() {
    const form = document.getElementById('newAgendaForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('agendaTitleInput').value = '';
    }
}

// Create new agenda
function createAgenda() {
    const titleInput = document.getElementById('agendaTitleInput');
    const title = titleInput.value.trim();

    if (!title) {
        alert('Please enter an agenda title');
        return;
    }

    const newAgenda = {
        id: generateUUID(),
        title: title,
        items: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    agendas.push(newAgenda);
    saveAgendasToStorage();
    updateAgendaSelect();

    // Select the new agenda
    const select = document.getElementById('agendaSelect');
    select.value = agendas.length - 1;
    loadAgenda();

    hideNewAgendaForm();
}

// Load selected agenda
function loadAgenda() {
    const select = document.getElementById('agendaSelect');
    const index = parseInt(select.value);

    if (isNaN(index) || !agendas[index]) {
        currentAgenda = null;
        currentAgendaItemIndex = -1;
        renderAgendaItems();
        return;
    }

    currentAgenda = agendas[index];
    currentAgendaItemIndex = currentAgenda.items.length > 0 ? 0 : -1;
    renderAgendaItems();
}

// Render agenda items
function renderAgendaItems() {
    const container = document.getElementById('agendaItems');
    const navigation = document.getElementById('agendaNavigation');
    const counter = document.getElementById('agendaCounter');

    if (!currentAgenda || currentAgenda.items.length === 0) {
        const emptyMsg = currentAgenda ? 'No items in this agenda' : 'No agenda selected';
        container.innerHTML = `<div class="agenda-empty">${emptyMsg}</div>`;
        if (navigation) navigation.style.display = 'none';
        if (counter) counter.textContent = '';
        return;
    }

    container.innerHTML = '';

    currentAgenda.items.forEach((item, index) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'agenda-item';
        itemEl.draggable = true;
        itemEl.dataset.index = index;

        if (index === currentAgendaItemIndex) {
            itemEl.classList.add('current');
        }

        // Drag handle
        const handle = document.createElement('div');
        handle.className = 'drag-handle';
        handle.textContent = '⋮⋮';
        itemEl.appendChild(handle);

        // Content
        const content = document.createElement('div');
        content.className = 'agenda-item-content';

        const type = document.createElement('div');
        type.className = 'agenda-item-type';
        type.textContent = item.type;
        content.appendChild(type);

        const title = document.createElement('div');
        title.className = 'agenda-item-title';
        title.textContent = getAgendaItemTitle(item);
        content.appendChild(title);

        itemEl.appendChild(content);

        // Actions
        const actions = document.createElement('div');
        actions.className = 'agenda-item-actions';

        const projectBtn = document.createElement('button');
        projectBtn.className = 'btn-small';
        projectBtn.textContent = '▶';
        projectBtn.title = 'Project';
        projectBtn.onclick = () => projectAgendaItem(index);
        actions.appendChild(projectBtn);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small danger';
        deleteBtn.textContent = '✕';
        deleteBtn.title = 'Delete';
        deleteBtn.onclick = () => deleteAgendaItem(index);
        actions.appendChild(deleteBtn);

        itemEl.appendChild(actions);

        // Drag events
        itemEl.addEventListener('dragstart', handleDragStart);
        itemEl.addEventListener('dragover', handleDragOver);
        itemEl.addEventListener('drop', handleDrop);
        itemEl.addEventListener('dragend', handleDragEnd);

        container.appendChild(itemEl);
    });

    if (navigation) navigation.style.display = 'flex';
    updateAgendaCounter();
}

// Get agenda item title
function getAgendaItemTitle(item) {
    switch (item.type) {
        case 'verse':
            return `${item.reference} (${item.versions.join(', ')})`;
        case 'note':
            return item.title || 'Untitled Note';
        case 'video':
            return item.title || 'Video';
        default:
            return 'Unknown Item';
    }
}

// Update agenda counter
function updateAgendaCounter() {
    const counter = document.getElementById('agendaCounter');
    if (!counter) return;
    
    if (!currentAgenda || currentAgenda.items.length === 0) {
        counter.textContent = '';
        return;
    }

    counter.textContent = `Item ${currentAgendaItemIndex + 1} of ${currentAgenda.items.length}`;
}

// Add current verse to agenda
function addCurrentVerseToAgenda() {
    if (!currentAgenda) {
        alert('Please select or create an agenda first');
        return;
    }

    const input = document.getElementById('verseInput').value.trim();
    if (!input) {
        alert('Please lookup a verse first');
        return;
    }

    // Get selected versions
    const selectedVersions = [];
    if (document.getElementById('kjvCheck').checked) selectedVersions.push('KJV');
    if (document.getElementById('asvCheck').checked) selectedVersions.push('ASV');
    if (document.getElementById('webCheck').checked) selectedVersions.push('WEB');
    if (document.getElementById('nltCheck').checked) selectedVersions.push('NLT');

    if (selectedVersions.length === 0) {
        alert('Please select at least one Bible version');
        return;
    }

    // Get the current displayed content
    const displayArea = previewMode ?
        document.getElementById('previewArea') :
        document.getElementById('displayArea');

    const verseContainer = displayArea.querySelector('.verse-container');
    if (!verseContainer) {
        alert('Please lookup a verse first');
        return;
    }

    const agendaItem = {
        type: 'verse',
        reference: input,
        versions: selectedVersions,
        content: verseContainer.outerHTML
    };

    currentAgenda.items.push(agendaItem);
    currentAgenda.updatedAt = Date.now();
    saveAgendasToStorage();
    renderAgendaItems();

    // Show confirmation
    console.log('Added verse to agenda:', input);
}

// Project agenda item
function projectAgendaItem(index) {
    if (!currentAgenda || !currentAgenda.items[index]) return;

    currentAgendaItemIndex = index;
    const item = currentAgenda.items[index];

    if (item.type === 'verse') {
        if (previewMode) {
            // Load to preview pane
            const previewArea = document.getElementById('previewArea');
            previewArea.innerHTML = item.content;
            previewContent = item.content;

            // Enable Go Live button
            const goLiveBtn = document.getElementById('goLiveBtn');
            if (goLiveBtn) {
                goLiveBtn.disabled = false;
            }
        } else {
            // Project directly
            const displayArea = document.getElementById('displayArea');
            displayArea.innerHTML = item.content;

            // Send to display window
            sendToDisplay('UPDATE_DISPLAY', { html: item.content });
        }
    } else if (item.type === 'note') {
        // Display note
        const noteHtml = `
            <div class="verse-container">
                <div class="verse-block">
                    <div class="verse-version">NOTE</div>
                    <div class="verse-reference">${item.title || 'Note'}</div>
                    <div class="verse-text">${item.content}</div>
                </div>
            </div>
        `;

        if (previewMode) {
            const previewArea = document.getElementById('previewArea');
            previewArea.innerHTML = noteHtml;
            previewContent = noteHtml;

            const goLiveBtn = document.getElementById('goLiveBtn');
            if (goLiveBtn) {
                goLiveBtn.disabled = false;
            }
        } else {
            const displayArea = document.getElementById('displayArea');
            displayArea.innerHTML = noteHtml;
            sendToDisplay('UPDATE_DISPLAY', { html: noteHtml });
        }
    } else if (item.type === 'video') {
        // Display video (use existing function)
        if (typeof displayVideo === 'function') {
            displayVideo(item.videoId, item.autoPlay !== false);
        }
    }

    renderAgendaItems(); // Re-render to update current indicator
}

// Project current agenda item
function projectCurrentAgendaItem() {
    if (currentAgendaItemIndex >= 0) {
        projectAgendaItem(currentAgendaItemIndex);
    }
}

// Navigate to previous agenda item
function previousAgendaItem() {
    if (!currentAgenda || currentAgenda.items.length === 0) return;

    currentAgendaItemIndex = Math.max(0, currentAgendaItemIndex - 1);
    projectAgendaItem(currentAgendaItemIndex);
}

// Navigate to next agenda item
function nextAgendaItem() {
    if (!currentAgenda || currentAgenda.items.length === 0) return;

    currentAgendaItemIndex = Math.min(currentAgenda.items.length - 1, currentAgendaItemIndex + 1);
    projectAgendaItem(currentAgendaItemIndex);
}

// Delete agenda item
function deleteAgendaItem(index) {
    if (!currentAgenda) return;

    if (confirm('Delete this agenda item?')) {
        currentAgenda.items.splice(index, 1);
        currentAgenda.updatedAt = Date.now();

        // Adjust current index if needed
        if (currentAgendaItemIndex >= currentAgenda.items.length) {
            currentAgendaItemIndex = Math.max(-1, currentAgenda.items.length - 1);
        }

        saveAgendasToStorage();
        renderAgendaItems();
    }
}

// Delete current agenda
function deleteCurrentAgenda() {
    const select = document.getElementById('agendaSelect');
    const index = parseInt(select.value);

    if (isNaN(index) || !agendas[index]) {
        alert('No agenda selected');
        return;
    }

    if (confirm(`Delete agenda "${agendas[index].title}"?`)) {
        agendas.splice(index, 1);
        currentAgenda = null;
        currentAgendaItemIndex = -1;

        saveAgendasToStorage();
        updateAgendaSelect();

        select.value = '';
        renderAgendaItems();
    }
}

// Drag and drop handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }

    if (draggedItem !== this) {
        const fromIndex = parseInt(draggedItem.dataset.index);
        const toIndex = parseInt(this.dataset.index);

        // Reorder items array
        const item = currentAgenda.items.splice(fromIndex, 1)[0];
        currentAgenda.items.splice(toIndex, 0, item);

        // Update current index if needed
        if (currentAgendaItemIndex === fromIndex) {
            currentAgendaItemIndex = toIndex;
        } else if (fromIndex < currentAgendaItemIndex && toIndex >= currentAgendaItemIndex) {
            currentAgendaItemIndex--;
        } else if (fromIndex > currentAgendaItemIndex && toIndex <= currentAgendaItemIndex) {
            currentAgendaItemIndex++;
        }

        currentAgenda.updatedAt = Date.now();
        saveAgendasToStorage();
        renderAgendaItems();
    }

    return false;
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
}

// ========================================
// END NEW MULTI-AGENDA MANAGEMENT SYSTEM
// ========================================
