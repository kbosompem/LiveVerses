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

// State
let currentTheme = localStorage.getItem('theme') || 'dark';

// Preview mode state
let previewMode = localStorage.getItem('previewMode') === 'true' || false;
let previewContent = null; // Stores HTML for preview
let liveContent = null;    // Stores HTML currently live

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
    const displayArea = document.getElementById('displayArea');
    displayArea.innerHTML = '';

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

    displayArea.appendChild(container);

    // Send to display window
    sendToDisplay('UPDATE_DISPLAY', { html: container.outerHTML });
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
});
