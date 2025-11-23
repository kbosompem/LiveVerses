#!/usr/bin/env python3
"""
Normalize Bible JSON data to a consistent format
Handles different source formats and ensures all versions work with app.js
"""

import json
import codecs

# Book number to abbreviation mapping (standard)
BOOK_MAP = {
    1: 'gn', 2: 'ex', 3: 'lv', 4: 'nm', 5: 'dt',
    6: 'jos', 7: 'jdg', 8: 'ru', 9: '1sm', 10: '2sm',
    11: '1kgs', 12: '2kgs', 13: '1chr', 14: '2chr',
    15: 'ezr', 16: 'neh', 17: 'est', 18: 'job', 19: 'ps',
    20: 'prv', 21: 'eccl', 22: 'song', 23: 'is',
    24: 'jer', 25: 'lam', 26: 'ezk', 27: 'dn',
    28: 'hos', 29: 'jl', 30: 'am', 31: 'ob', 32: 'jnh',
    33: 'mc', 34: 'na', 35: 'hb', 36: 'zep', 37: 'hg',
    38: 'zec', 39: 'mal',
    40: 'mt', 41: 'mk', 42: 'lk', 43: 'jn', 44: 'act',
    45: 'rom', 46: '1cor', 47: '2cor', 48: 'gal',
    49: 'eph', 50: 'php', 51: 'col', 52: '1thes',
    53: '2thes', 54: '1tm', 55: '2tm', 56: 'ti',
    57: 'phm', 58: 'heb', 59: 'jas', 60: '1pt', 61: '2pt',
    62: '1jn', 63: '2jn', 64: '3jn', 65: 'jude', 66: 'rv'
}

BOOK_NAMES = [
    "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
    "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
    "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
    "Ezra", "Nehemiah", "Esther", "Job", "Psalms",
    "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
    "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
    "Hosea", "Joel", "Amos", "Obadiah", "Jonah",
    "Micah", "Nahum", "Habakkuk", "Zephaniah", "Haggai",
    "Zechariah", "Malachi",
    "Matthew", "Mark", "Luke", "John", "Acts",
    "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
    "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
    "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus",
    "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
    "1 John", "2 John", "3 John", "Jude", "Revelation"
]

def normalize_asv():
    """Convert ASV from resultset format to standard format"""
    print("Normalizing ASV...")

    with open('../data/asv.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Initialize books structure
    books = {}
    for i in range(1, 67):
        books[i] = {
            "name": BOOK_NAMES[i-1],
            "abbrev": BOOK_MAP[i],
            "chapters": {}
        }

    # Process rows
    for row in data['resultset']['row']:
        field = row['field']
        verse_id = field[0]  # Format: BBCCCVVV (Book, Chapter, Verse)
        book_num = verse_id // 1000000
        chapter_num = (verse_id // 1000) % 1000
        verse_num = verse_id % 1000
        verse_text = field[4]

        if book_num not in books:
            continue

        if chapter_num not in books[book_num]["chapters"]:
            books[book_num]["chapters"][chapter_num] = []

        books[book_num]["chapters"][chapter_num].append(verse_text)

    # Convert to final format (array of books with chapter arrays)
    output = []
    for book_num in sorted(books.keys()):
        book = books[book_num]
        chapters = []
        for chapter_num in sorted(book["chapters"].keys()):
            chapters.append(book["chapters"][chapter_num])

        output.append({
            "name": book["name"],
            "abbrev": book["abbrev"],
            "chapters": chapters
        })

    # Save
    with open('../data/asv_normalized.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"✓ ASV normalized: {len(output)} books")
    return output

def check_kjv():
    """Verify KJV format"""
    print("Checking KJV...")

    with codecs.open('../data/kjv.json', 'r', encoding='utf-8-sig') as f:
        data = json.load(f)

    print(f"✓ KJV loaded: {len(data)} books")
    return data

def main():
    print("=" * 50)
    print("Bible Data Normalization")
    print("=" * 50)

    # Check KJV (already in correct format)
    kjv = check_kjv()

    # Normalize ASV
    asv = normalize_asv()

    # Replace ASV file with normalized version
    print("\nReplacing ASV with normalized version...")
    with open('../data/asv.json', 'w', encoding='utf-8') as f:
        json.dump(asv, f, ensure_ascii=False, indent=2)

    print("\n" + "=" * 50)
    print("Normalization complete!")
    print("=" * 50)
    print("\nNote: WEB Bible still needs to be downloaded.")
    print("The app will work with KJV and ASV for now.")

if __name__ == "__main__":
    main()
