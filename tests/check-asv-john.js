// Check if John 3:16 exists in ASV
const asvData = require('../data/asv.json');

const john = asvData.find(b => b.name === 'John');
console.log('John found:', !!john);

if (john) {
  console.log('Book name:', john.name);
  console.log('Abbrev:', john.abbrev);
  console.log('Total chapters:', john.chapters.length);
  console.log('Chapter 3 exists:', !!john.chapters[2]);
  console.log('Chapter 3 verse count:', john.chapters[2]?.length);

  if (john.chapters[2] && john.chapters[2][15]) {
    console.log('\nJohn 3:16 in ASV:');
    console.log(john.chapters[2][15]);
  } else {
    console.log('\nJohn 3:16 NOT FOUND in ASV');
  }
}

// Also check the abbrev used in the code
const johnByAbbrev = asvData.find(b => b.abbrev === 'jo');
console.log('\nBook with abbrev "jo" found:', !!johnByAbbrev);
if (johnByAbbrev) {
  console.log('Book name:', johnByAbbrev.name);
}
