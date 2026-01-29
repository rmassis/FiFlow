
const fs = require('fs');
const content = fs.readFileSync('build_errors.txt', 'utf16le');
console.log(content);
