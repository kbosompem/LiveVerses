#!/usr/bin/env python3
"""
Convert NLT from dict format to array format to match KJV/ASV/WEB
"""

import json

# Book order and abbreviations (same as KJV)
BOOK_INFO = [
    ("Genesis", "gn"), ("Exodus", "ex"), ("Leviticus", "lv"), ("Numbers", "nm"), ("Deuteronomy", "dt"),
    ("Joshua", "js"), ("Judges", "jud"), ("Ruth", "rt"), ("1 Samuel", "1sm"), ("2 Samuel", "2sm"),
    ("1 Kings", "1kgs"), ("2 Kings", "2kgs"), ("1 Chronicles", "1ch"), ("2 Chronicles", "2ch"),
    ("Ezra", "ezr"), ("Nehemiah", "ne"), ("Esther", "et"), ("Job", "job"), ("Psalms", "ps"),
    ("Proverbs", "prv"), ("Ecclesiastes", "ec"), ("Song of Solomon", "so"), ("Isaiah", "is"),
    ("Jeremiah", "jr"), ("Lamentations", "lm"), ("Ezekiel", "ez"), ("Daniel", "dn"),
    ("Hosea", "ho"), ("Joel", "jl"), ("Amos", "am"), ("Obadiah", "ob"), ("Jonah", "jn"),
    ("Micah", "mi"), ("Nahum", "na"), ("Habakkuk", "hk"), ("Zephaniah", "zp"), ("Haggai", "hg"),
    ("Zechariah", "zc"), ("Malachi", "ml"),
    ("Matthew", "mt"), ("Mark", "mk"), ("Luke", "lk"), ("John", "jo"), ("Acts", "act"),
    ("Romans", "rm"), ("1 Corinthians", "1co"), ("2 Corinthians", "2co"), ("Galatians", "gl"),
    ("Ephesians", "eph"), ("Philippians", "ph"), ("Colossians", "cl"), ("1 Thessalonians", "1ts"),
    ("2 Thessalonians", "2ts"), ("1 Timothy", "1tm"), ("2 Timothy", "2tm"), ("Titus", "tt"),
    ("Philemon", "phm"), ("Hebrews", "hb"), ("James", "jm"), ("1 Peter", "1pe"), ("2 Peter", "2pe"),
    ("1 John", "1jo"), ("2 John", "2jo"), ("3 John", "3jo"), ("Jude", "jd"), ("Revelation", "re")
]

print("Converting NLT to standard format...")

# Load original NLT
with open('../data/nlt.json', 'r', encoding='utf-8') as f:
    nlt_dict = json.load(f)

print(f"Loaded {len(nlt_dict)} books from NLT")

# Convert to array format
nlt_array = []

for book_name, book_abbrev in BOOK_INFO:
    if book_name not in nlt_dict:
        print(f"Warning: {book_name} not found in NLT!")
        continue

    book_data = nlt_dict[book_name]

    # Convert chapters from dict to array
    chapters = []
    chapter_nums = sorted([int(k) for k in book_data.keys()])

    for chapter_num in chapter_nums:
        chapter_dict = book_data[str(chapter_num)]

        # Convert verses from dict to array
        verses = []
        verse_nums = sorted([int(k) for k in chapter_dict.keys()])

        for verse_num in verse_nums:
            verses.append(chapter_dict[str(verse_num)])

        chapters.append(verses)

    nlt_array.append({
        "name": book_name,
        "abbrev": book_abbrev,
        "chapters": chapters
    })

    print(f"  ✓ {book_name} ({len(chapters)} chapters)")

# Save converted NLT
with open('../data/nlt.json', 'w', encoding='utf-8') as f:
    json.dump(nlt_array, f, ensure_ascii=False, indent=2)

print(f"\n✓ Converted {len(nlt_array)} books")
print(f"✓ Saved to ../data/nlt.json")

# Verify John 3:16
john = [b for b in nlt_array if b['name'] == 'John'][0]
print(f"\nVerification - John 3:16:")
print(f"  {john['chapters'][2][15][:80]}...")
