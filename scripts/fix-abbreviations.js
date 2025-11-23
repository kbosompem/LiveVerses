// Fix abbreviation mismatches in Bible JSON files
const fs = require('fs');
const path = require('path');

// Load KJV as reference (it matches BIBLE_BOOKS in app.js)
const kjv = require('../data/kjv.json');

// Create abbreviation mapping from KJV
const abbrevMap = new Map();
kjv.forEach(book => {
  abbrevMap.set(book.name, book.abbrev);
});

console.log('Abbreviation map created from KJV with', abbrevMap.size, 'books\n');

// Function to fix a Bible version file
function fixBibleFile(filename) {
  const filePath = path.join(__dirname, '../data', filename);
  console.log(`Processing ${filename}...`);

  const data = require(filePath);
  let changes = 0;

  data.forEach(book => {
    const correctAbbrev = abbrevMap.get(book.name);
    if (correctAbbrev && book.abbrev !== correctAbbrev) {
      console.log(`  ${book.name}: ${book.abbrev} -> ${correctAbbrev}`);
      book.abbrev = correctAbbrev;
      changes++;
    }
  });

  if (changes > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✓ Fixed ${changes} abbreviations in ${filename}\n`);
  } else {
    console.log(`✓ No changes needed for ${filename}\n`);
  }

  return changes;
}

// Fix all Bible version files
console.log('=== Fixing Bible Abbreviations ===\n');

const totalChanges = {
  asv: fixBibleFile('asv.json'),
  web: fixBibleFile('web.json'),
  nlt: fixBibleFile('nlt.json')
};

console.log('=== Summary ===');
console.log(`ASV: ${totalChanges.asv} changes`);
console.log(`WEB: ${totalChanges.web} changes`);
console.log(`NLT: ${totalChanges.nlt} changes`);
console.log(`Total: ${Object.values(totalChanges).reduce((a, b) => a + b, 0)} changes`);
console.log('\n✅ All Bible files fixed!');
