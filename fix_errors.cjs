
const fs = require('fs');
const content = fs.readFileSync('build_errors.txt', 'utf16le');
fs.writeFileSync('errors_utf8.txt', content, 'utf8');
