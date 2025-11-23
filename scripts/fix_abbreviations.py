#!/usr/bin/env python3
"""
Fix book abbreviations in app.js to match Bible JSON data
"""

import json

# Load KJV to get correct abbreviations
with open('../data/kjv.json', 'r', encoding='utf-8-sig') as f:
    kjv = json.load(f)

print("Generating correct book mappings...")
print("\n// BOOK_NAMES - maps user input to Bible data abbreviations")
print("const BOOK_NAMES = {")

# Create mappings from various inputs to correct abbreviations
mappings = {}

for book in kjv:
    abbrev = book['abbrev']
    name = book['name']
    name_lower = name.lower().replace(' ', '')

    # Full name
    mappings[name_lower] = abbrev

    # Common variations for Song of Solomon
    if name == 'Song of Solomon':
        mappings['song'] = abbrev
        mappings['songofsolomon'] = abbrev
        mappings['songofongs'] = abbrev
        mappings['sos'] = abbrev

    # Common abbreviations for each book
    common_abbrevs = {
        'Genesis': ['gen'],
        'Exodus': ['exo', 'exod'],
        'Leviticus': ['lev'],
        'Numbers': ['num'],
        'Deuteronomy': ['deut', 'deu'],
        'Joshua': ['josh', 'jos'],
        'Judges': ['judg', 'jdg'],
        'Ruth': ['rut', 'ru'],
        '1 Samuel': ['1sam', '1sa', '1s'],
        '2 Samuel': ['2sam', '2sa', '2s'],
        '1 Kings': ['1kgs', '1ki', '1k'],
        '2 Kings': ['2kgs', '2ki', '2k'],
        '1 Chronicles': ['1chr', '1chron'],
        '2 Chronicles': ['2chr', '2chron'],
        'Ezra': ['ez'],
        'Nehemiah': ['neh'],
        'Esther': ['est', 'es'],
        'Psalms': ['psalm', 'psa', 'ps'],
        'Proverbs': ['prov'],
        'Ecclesiastes': ['eccl', 'ecc'],
        'Isaiah': ['isa'],
        'Jeremiah': ['jer'],
        'Lamentations': ['lam'],
        'Ezekiel': ['ezek', 'ezk', 'eze'],
        'Daniel': ['dan', 'da'],
        'Hosea': ['hos'],
        'Joel': ['joe'],
        'Amos': ['amo'],
        'Obadiah': ['oba'],
        'Jonah': ['jon'],
        'Micah': ['mic'],
        'Nahum': ['nah'],
        'Habakkuk': ['hab'],
        'Zephaniah': ['zeph', 'zep'],
        'Haggai': ['hag'],
        'Zechariah': ['zech', 'zec'],
        'Malachi': ['mal'],
        'Matthew': ['matt', 'mat'],
        'Mark': ['mar', 'mrk', 'mr'],
        'Luke': ['luk', 'lu'],
        'John': ['joh', 'jhn', 'jn'],
        'Acts': ['ac'],
        'Romans': ['rom', 'ro'],
        '1 Corinthians': ['1cor', '1co', '1corinthians'],
        '2 Corinthians': ['2cor', '2co', '2corinthians'],
        'Galatians': ['gal', 'ga'],
        'Ephesians': ['eph', 'ep'],
        'Philippians': ['phil', 'php', 'pp'],
        'Colossians': ['col'],
        '1 Thessalonians': ['1thess', '1th', '1thessalonians'],
        '2 Thessalonians': ['2thess', '2th', '2thessalonians'],
        '1 Timothy': ['1tim', '1ti', '1timothy'],
        '2 Timothy': ['2tim', '2ti', '2timothy'],
        'Titus': ['tit', 'ti'],
        'Philemon': ['phlm', 'phm'],
        'Hebrews': ['heb'],
        'James': ['jas', 'jam', 'ja'],
        '1 Peter': ['1pet', '1pe', '1pt', '1p', '1peter'],
        '2 Peter': ['2pet', '2pe', '2pt', '2p', '2peter'],
        '1 John': ['1joh', '1jn', '1jo', '1john'],
        '2 John': ['2joh', '2jn', '2jo', '2john'],
        '3 John': ['3joh', '3jn', '3jo', '3john'],
        'Jude': ['jud'],
        'Revelation': ['rev', 'rv', 're'],
    }

    if name in common_abbrevs:
        for abbr in common_abbrevs[name]:
            mappings[abbr] = abbrev

# Sort and print
for key in sorted(mappings.keys()):
    print(f"    '{key}': '{mappings[key]}',")

print("};")

print("\n\n// Reverse mapping for display")
print("function getBookName(abbrev) {")
print("    const bookMap = {")
for book in kjv:
    print(f"        '{book['abbrev']}': '{book['name']}',")
print("    };")
print("    return bookMap[abbrev] || abbrev;")
print("}")
