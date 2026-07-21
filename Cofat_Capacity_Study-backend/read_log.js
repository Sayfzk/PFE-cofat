
const fs = require('fs');
const path = require('path');

try {
    const content = fs.readFileSync(path.join(__dirname, 'import_log_v3.txt'), 'utf8'); // Assuming utf8, but might be utf16le if PowerShell redirected it weirdly
    console.log(content.substring(0, 2000)); // Print first 2000 chars
    console.log('...');
    console.log(content.substring(content.length - 2000)); // Print last 2000 chars
} catch (err) {
    // Try utf16le
    try {
        const content = fs.readFileSync(path.join(__dirname, 'import_log_v3.txt'), 'utf16le');
        console.log(content.substring(0, 2000));
        console.log('...');
        console.log(content.substring(content.length - 2000));
    } catch (e) {
        console.error(e);
    }
}
