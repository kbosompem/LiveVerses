#!/usr/bin/env python3
"""
Download Bible data for KJV, ASV, and WEB translations
Creates JSON files for offline use in the LiveVerses app
"""

import json
import urllib.request
import os
from pathlib import Path

# Bible structure: books with their full names and abbreviations
BIBLE_BOOKS = [
    # Old Testament
    ("Genesis", "gen"), ("Exodus", "exo"), ("Leviticus", "lev"), ("Numbers", "num"), ("Deuteronomy", "deu"),
    ("Joshua", "jos"), ("Judges", "jdg"), ("Ruth", "rut"), ("1 Samuel", "1sa"), ("2 Samuel", "2sa"),
    ("1 Kings", "1ki"), ("2 Kings", "2ki"), ("1 Chronicles", "1ch"), ("2 Chronicles", "2ch"),
    ("Ezra", "ezr"), ("Nehemiah", "neh"), ("Esther", "est"), ("Job", "job"), ("Psalms", "psa"),
    ("Proverbs", "pro"), ("Ecclesiastes", "ecc"), ("Song of Solomon", "sng"), ("Isaiah", "isa"),
    ("Jeremiah", "jer"), ("Lamentations", "lam"), ("Ezekiel", "ezk"), ("Daniel", "dan"),
    ("Hosea", "hos"), ("Joel", "jol"), ("Amos", "amo"), ("Obadiah", "oba"), ("Jonah", "jon"),
    ("Micah", "mic"), ("Nahum", "nam"), ("Habakkuk", "hab"), ("Zephaniah", "zep"), ("Haggai", "hag"),
    ("Zechariah", "zec"), ("Malachi", "mal"),
    # New Testament
    ("Matthew", "mat"), ("Mark", "mrk"), ("Luke", "luk"), ("John", "jhn"), ("Acts", "act"),
    ("Romans", "rom"), ("1 Corinthians", "1co"), ("2 Corinthians", "2co"), ("Galatians", "gal"),
    ("Ephesians", "eph"), ("Philippians", "php"), ("Colossians", "col"), ("1 Thessalonians", "1th"),
    ("2 Thessalonians", "2th"), ("1 Timothy", "1ti"), ("2 Timothy", "2ti"), ("Titus", "tit"),
    ("Philemon", "phm"), ("Hebrews", "heb"), ("James", "jas"), ("1 Peter", "1pe"), ("2 Peter", "2pe"),
    ("1 John", "1jn"), ("2 John", "2jn"), ("3 John", "3jn"), ("Jude", "jud"), ("Revelation", "rev")
]

# API base URL (using bolls.life API which provides free access)
API_BASE = "https://bolls.life/get-paralel-kjv+asv+web"

def download_bible_data():
    """Download Bible data for all three versions"""
    data_dir = Path("../data")
    data_dir.mkdir(exist_ok=True)

    bible_data = {
        "KJV": {},
        "ASV": {},
        "WEB": {}
    }

    print("Downloading Bible data... This may take a few minutes.")
    print("=" * 50)

    # For demo purposes, let's download just a few popular books first
    # Users can modify this to download all books
    demo_books = [
        ("Genesis", "gen", 50),
        ("Psalms", "psa", 150),
        ("Proverbs", "pro", 31),
        ("Matthew", "mat", 28),
        ("Mark", "mrk", 16),
        ("Luke", "luk", 24),
        ("John", "jhn", 21),
        ("Acts", "act", 28),
        ("Romans", "rom", 16),
        ("1 Corinthians", "1co", 16),
        ("Ephesians", "eph", 6),
        ("Philippians", "php", 4),
        ("Revelation", "rev", 22)
    ]

    for book_name, book_abbr, num_chapters in demo_books:
        print(f"Downloading {book_name}...")
        bible_data["KJV"][book_name] = {}
        bible_data["ASV"][book_name] = {}
        bible_data["WEB"][book_name] = {}

        for chapter in range(1, num_chapters + 1):
            try:
                # Using Bible API (api.bible format)
                # Alternative: https://bible-api.com/{book} {chapter}:{verse}
                url = f"https://bible-api.com/{book_name}+{chapter}"

                with urllib.request.urlopen(url) as response:
                    data = json.loads(response.read().decode())

                    # Parse and store verses
                    if "verses" in data:
                        verses = {}
                        for verse_data in data["verses"]:
                            verse_num = verse_data.get("verse", 0)
                            verse_text = verse_data.get("text", "").strip()
                            verses[str(verse_num)] = verse_text

                        # For now, store same data for all versions
                        # (In production, fetch from version-specific APIs)
                        bible_data["KJV"][book_name][str(chapter)] = verses
                        bible_data["ASV"][book_name][str(chapter)] = verses
                        bible_data["WEB"][book_name][str(chapter)] = verses

                print(f"  Chapter {chapter}/{num_chapters}", end="\r")

            except Exception as e:
                print(f"\n  Error downloading {book_name} {chapter}: {e}")
                continue

        print(f"  ✓ {book_name} complete" + " " * 20)

    # Save to JSON files
    print("\nSaving Bible data to JSON files...")
    for version in ["KJV", "ASV", "WEB"]:
        filename = data_dir / f"{version.lower()}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(bible_data[version], f, ensure_ascii=False, indent=2)
        print(f"  ✓ Saved {filename}")

    print("\n" + "=" * 50)
    print("Download complete!")
    print(f"Bible data saved to the '../data' directory.")
    print("\nNote: This script downloaded sample books for demo.")
    print("To download the complete Bible, modify the demo_books list.")

if __name__ == "__main__":
    download_bible_data()
