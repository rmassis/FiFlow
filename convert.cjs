
const fs = require('fs');
const content = fs.readFileSync('icon_errors.txt', 'utf16le');
fs.writeFileSync('icon_errors_utf8.txt', content, 'utf8');
console.log(content);
