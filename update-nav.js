// Script to update navigation active states
const fs = require('fs');
const path = require('path');

const htmlFiles = [
    'about.html',
    'arts.html',
    'blogs.html',
    'contact.html',
    'crafts.html',
    'dance.html',
    'dashboard.html',
    'index.html',
    'innovations.html',
    'login.html',
    'poetry.html',
    'profile.html',
    'register.html',
    'singing.html',
    'submit.html'
];

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        // Remove all active classes from nav links
        content = content.replace(/<a([^>]*)class="([^"]*)\bactive\b([^"]*)"([^>]*)>/g, '<a$1class="$2$3"$4>');
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${file}`);
    } else {
        console.log(`Skipped (not found): ${file}`);
    }
});

console.log('Navigation update complete!');
