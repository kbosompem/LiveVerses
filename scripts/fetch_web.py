#!/usr/bin/env python3
"""
Download World English Bible (WEB) from bible-api.com
which provides a free JSON API
"""

import json
import urllib.request
import time

# Bible book list with chapter counts
BOOKS = [
    ("Genesis", 50), ("Exodus", 40), ("Leviticus", 27), ("Numbers", 36), ("Deuteronomy", 34),
    ("Joshua", 24), ("Judges", 21), ("Ruth", 4), ("1 Samuel", 31), ("2 Samuel", 24),
    ("1 Kings", 22), ("2 Kings", 25), ("1 Chronicles", 29), ("2 Chronicles", 36),
    ("Ezra", 10), ("Nehemiah", 13), ("Esther", 10), ("Job", 42), ("Psalms", 150),
    ("Proverbs", 31), ("Ecclesiastes", 12), ("Song of Solomon", 8), ("Isaiah", 66),
    ("Jeremiah", 52), ("Lamentations", 5), ("Ezekiel", 48), ("Daniel", 12),
    ("Hosea", 14), ("Joel", 3), ("Amos", 9), ("Obadiah", 1), ("Jonah", 4),
    ("Micah", 7), ("Nahum", 3), ("Habakkuk", 3), ("Zephaniah", 3), ("Haggai", 2),
    ("Zechariah", 14), ("Malachi", 4),
    ("Matthew", 28), ("Mark", 16), ("Luke", 24), ("John", 21), ("Acts", 28),
    ("Romans", 16), ("1 Corinthians", 16), ("2 Corinthians", 13), ("Galatians", 6),
    ("Ephesians", 6), ("Philippians", 4), ("Colossians", 4), ("1 Thessalonians", 5),
    ("2 Thessalonians", 3), ("1 Timothy", 6), ("2 Timothy", 4), ("Titus", 3),
    ("Philemon", 1), ("Hebrews", 13), ("James", 5), ("1 Peter", 5), ("2 Peter", 3),
    ("1 John", 5), ("2 John", 1), ("3 John", 1), ("Jude", 1), ("Revelation", 22)
]

def download_web():
    """Download WEB Bible using bible-api.com"""
    bible_data = []

    print("Downloading World English Bible...")
    print("=" * 50)

    for book_name, num_chapters in BOOKS:
        print(f"Downloading {book_name}...")
        book_data = {
            "name": book_name,
            "abbrev": book_name.lower().replace(" ", ""),
            "chapters": []
        }

        for chapter in range(1, num_chapters + 1):
            try:
                url = f"https://bible-api.com/{book_name}+{chapter}?translation=web"

                with urllib.request.urlopen(url) as response:
                    data = json.loads(response.read().decode())

                # Extract verses
                verses = []
                if "verses" in data:
                    for verse_data in data["verses"]:
                        verse_text = verse_data.get("text", "").strip()
                        verses.append(verse_text)

                book_data["chapters"].append(verses)
                print(f"  Chapter {chapter}/{num_chapters}", end="\r")

                # Be nice to the API
                time.sleep(0.1)

            except Exception as e:
                print(f"\n  Error downloading {book_name} {chapter}: {e}")
                # Add empty chapter on error
                book_data["chapters"].append([])

        bible_data.append(book_data)
        print(f"  ✓ {book_name} complete" + " " * 20)

    # Save to JSON
    print("\nSaving WEB Bible to ../data/web.json...")
    with open('../data/web.json', 'w', encoding='utf-8') as f:
        json.dump(bible_data, f, ensure_ascii=False, indent=2)

    print("✓ Download complete!")
    print(f"WEB Bible saved to ../data/web.json")

if __name__ == "__main__":
    download_web()
