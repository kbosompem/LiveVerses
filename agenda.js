// Agenda System for LiveVerses
// Handles persistent agendas with verses and YouTube videos

// Agenda persistence state - use consistent key with app.js
let savedAgendas = JSON.parse(localStorage.getItem('liveverses_agendas') || '{}');
let currentAgendaName = null;

function initAgendaSystem() {
    updateAgendaDropdown();
    updateAgendaItemsDisplay();
}

function showNewAgendaForm() {
    const form = document.getElementById('newAgendaForm');
    if (form) {
        form.style.display = 'block';
        document.getElementById('agendaTitleInput').focus();
    }
}

function hideNewAgendaForm() {
    const form = document.getElementById('newAgendaForm');
    if (form) {
        form.style.display = 'none';
        document.getElementById('agendaTitleInput').value = '';
    }
}

function createAgenda() {
    const titleInput = document.getElementById('agendaTitleInput');
    const title = titleInput.value.trim();

    if (!title) {
        showError('Please enter an agenda title');
        return;
    }

    if (savedAgendas[title]) {
        if (!confirm('An agenda with this name already exists. Overwrite?')) {
            return;
        }
    }

    // Create new empty agenda
    savedAgendas[title] = [];
    localStorage.setItem('liveverses_agendas', JSON.stringify(savedAgendas));

    // Update dropdown
    updateAgendaDropdown();

    // Select the new agenda
    const select = document.getElementById('agendaSelect');
    select.value = title;
    loadAgenda();

    hideNewAgendaForm();
}

function updateAgendaDropdown() {
    const select = document.getElementById('agendaSelect');
    if (!select) return;

    // Save current selection
    const currentSelection = select.value;

    // Clear and rebuild options
    select.innerHTML = '<option value="">Select an agenda...</option>';

    Object.keys(savedAgendas).sort().forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });

    // Restore selection if it still exists
    if (currentSelection && savedAgendas[currentSelection]) {
        select.value = currentSelection;
    }
}

function loadAgenda() {
    const select = document.getElementById('agendaSelect');
    const agendaName = select.value;

    if (!agendaName) {
        currentAgenda = [];
        currentAgendaIndex = -1;
        currentAgendaName = null;
        updateAgendaItemsDisplay();
        return;
    }

    currentAgendaName = agendaName;
    currentAgenda = savedAgendas[agendaName] || [];
    currentAgendaIndex = -1;

    updateAgendaItemsDisplay();
}

function updateAgendaItemsDisplay() {
    const container = document.getElementById('agendaItems');
    const navigation = document.getElementById('agendaNavigation');
    const counter = document.getElementById('agendaCounter');

    if (!container) return;

    if (currentAgenda.length === 0) {
        container.innerHTML = currentAgendaName ?
            '<div class="agenda-empty">No items yet. Add verses or videos above.</div>' :
            '<div class="agenda-empty">No agenda selected</div>';
        if (navigation) navigation.style.display = 'none';
        if (counter) counter.textContent = '';
        return;
    }

    // Show navigation
    if (navigation) navigation.style.display = 'flex';

    // Update counter
    if (counter) {
        const current = currentAgendaIndex >= 0 ? currentAgendaIndex + 1 : 0;
        counter.textContent = `${current} / ${currentAgenda.length}`;
    }

    // Build agenda items list
    container.innerHTML = currentAgenda.map((item, index) => {
        const isActive = index === currentAgendaIndex;

        if (item.type === 'verse') {
            return `
                <div class="agenda-item ${isActive ? 'active' : ''}" onclick="selectAgendaItem(${index})">
                    <div class="agenda-icon">📖</div>
                    <div class="agenda-content">
                        <div class="agenda-title">${item.reference}</div>
                        <div class="agenda-meta">${item.versions.join(', ')}</div>
                    </div>
                    <button class="btn-agenda-remove" onclick="removeFromAgenda(event, ${index})" title="Remove">✕</button>
                </div>
            `;
        } else if (item.type === 'video') {
            return `
                <div class="agenda-item ${isActive ? 'active' : ''}" onclick="selectAgendaItem(${index})">
                    <div class="agenda-icon">🎬</div>
                    <div class="agenda-content">
                        <div class="agenda-title">${item.title || 'YouTube Video'}</div>
                        <div class="agenda-meta">Video ID: ${item.videoId}</div>
                    </div>
                    <button class="btn-agenda-remove" onclick="removeFromAgenda(event, ${index})" title="Remove">✕</button>
                </div>
            `;
        } else if (item.type === 'note') {
            return `
                <div class="agenda-item ${isActive ? 'active' : ''}" onclick="selectAgendaItem(${index})">
                    <div class="agenda-icon">📝</div>
                    <div class="agenda-content">
                        <div class="agenda-title">${item.title || 'Note'}</div>
                        <div class="agenda-meta">Markdown Note</div>
                    </div>
                    <button class="btn-agenda-remove" onclick="removeFromAgenda(event, ${index})" title="Remove">✕</button>
                </div>
            `;
        }
    }).join('');
}

function selectAgendaItem(index) {
    currentAgendaIndex = index;
    updateAgendaItemsDisplay();
}

function projectCurrentAgendaItem() {
    if (currentAgendaIndex < 0 || currentAgendaIndex >= currentAgenda.length) {
        // If nothing selected, start from first item
        if (currentAgenda.length > 0) {
            currentAgendaIndex = 0;
            displayAgendaItem(0);
        } else {
            showError('No items in agenda');
        }
        return;
    }

    displayAgendaItem(currentAgendaIndex);
}

function displayAgendaItem(index) {
    if (index < 0 || index >= currentAgenda.length) return;

    currentAgendaIndex = index;
    const item = currentAgenda[index];

    if (item.type === 'verse') {
        // Display verse - call functions from app.js
        if (item.parsedRefs && item.parsedRefs.length === 1) {
            displayVerses(item.parsedRefs[0].parsed, item.versions);
        } else if (item.parsedRefs && item.parsedRefs.length > 1) {
            displayMultipleVerses(item.parsedRefs, item.versions);
        }
    } else if (item.type === 'video') {
        // Display video - call function from app.js
        displayVideo(item.videoId, item.autoPlay);
    } else if (item.type === 'note') {
        // Display note - call function from app.js
        if (typeof projectNoteContent === 'function') {
            projectNoteContent(item.title, item.content);
        }
    }

    updateAgendaItemsDisplay();
}

function removeFromAgenda(event, index) {
    event.stopPropagation(); // Prevent selecting the item

    if (index < 0 || index >= currentAgenda.length) return;

    currentAgenda.splice(index, 1);

    // Adjust current index
    if (currentAgendaIndex >= currentAgenda.length) {
        currentAgendaIndex = currentAgenda.length - 1;
    }

    // Save to localStorage
    if (currentAgendaName) {
        savedAgendas[currentAgendaName] = currentAgenda;
        localStorage.setItem('liveverses_agendas', JSON.stringify(savedAgendas));
    }

    updateAgendaItemsDisplay();
}

function deleteCurrentAgenda() {
    if (!currentAgendaName) {
        showError('No agenda selected');
        return;
    }

    if (!confirm(`Delete agenda "${currentAgendaName}"?`)) {
        return;
    }

    delete savedAgendas[currentAgendaName];
    localStorage.setItem('liveverses_agendas', JSON.stringify(savedAgendas));

    currentAgenda = [];
    currentAgendaIndex = -1;
    currentAgendaName = null;

    updateAgendaDropdown();
    updateAgendaItemsDisplay();
}

// Add current verse/video to the selected agenda
function addCurrentVerseToAgenda() {
    if (!currentAgendaName) {
        showError('Please select or create an agenda first');
        return;
    }

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

    // Add to current agenda
    currentAgenda.push({
        type: 'verse',
        reference: input,
        parsedRefs: parsedRefs,
        versions: selectedVersions
    });

    // Save to localStorage
    savedAgendas[currentAgendaName] = currentAgenda;
    localStorage.setItem('liveverses_agendas', JSON.stringify(savedAgendas));

    updateAgendaItemsDisplay();

    // Clear input
    document.getElementById('verseInput').value = '';
    resetAutocomplete();
}

function addCurrentVideoToAgenda() {
    if (!currentAgendaName) {
        showError('Please select or create an agenda first');
        return;
    }

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

    // Add to current agenda
    currentAgenda.push({
        type: 'video',
        videoId: videoId,
        title: 'YouTube Video',
        autoPlay: true
    });

    // Save to localStorage
    savedAgendas[currentAgendaName] = currentAgenda;
    localStorage.setItem('liveverses_agendas', JSON.stringify(savedAgendas));

    updateAgendaItemsDisplay();

    // Clear input
    document.getElementById('videoInput').value = '';
}

// Navigation functions
function nextAgendaItem() {
    if (currentAgenda.length === 0) {
        showError('No items in agenda');
        return;
    }

    currentAgendaIndex++;
    if (currentAgendaIndex >= currentAgenda.length) {
        currentAgendaIndex = currentAgenda.length - 1;
    }

    updateAgendaItemsDisplay();
}

function previousAgendaItem() {
    if (currentAgenda.length === 0) {
        showError('No items in agenda');
        return;
    }

    currentAgendaIndex--;
    if (currentAgendaIndex < 0) {
        currentAgendaIndex = 0;
    }

    updateAgendaItemsDisplay();
}
