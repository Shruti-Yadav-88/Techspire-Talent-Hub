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
        
        // 1. Remove all active classes from nav links
        content = content.replace(/<a([^>]*)class="([^"]*)\bactive\b([^"]*)"([^>]*)>/g, '<a$1class="$2$3"$4>');
        
        // 2. Add type="module" to the main script.js script tag
        content = content.replace(
            /<script src="script\.js"><\/script>/,
            '<script type="module" src="script.js"></script>'
        );
        
        // 3. Add navigation.js before the closing body tag
        content = content.replace(
            /<\/body>/,
            '    <script type="module" src="js/navigation.js"></script>\n</body>'
        );
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${file}`);
    } else {
        console.log(`Skipped (not found): ${file}`);
    }
});

console.log('HTML files update complete!');
