const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            replaceInDir(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let originalContent = fs.readFileSync(fullPath, 'utf8');
            let content = originalContent;
            
            // Fix 1: `${config.apiUrl}/path/to', { -> `${config.apiUrl}/path/to`, {
            content = content.replace(/(`\$\{config\.apiUrl\}[^'"]*?)['"]\s*,/g, '$1`,');
            
            // Fix 2: `${config.apiUrl}/path/to') -> `${config.apiUrl}/path/to`)
            content = content.replace(/(`\$\{config\.apiUrl\}[^'"]*?)['"]\s*\)/g, '$1`)');
            
            // Fix 3: const res = await fetch(`${config.apiUrl}' ... -- just in case some pure string
            content = content.replace(/(`\$\{config\.apiUrl\}[^'"]*?)['"]/g, '$1`');

            if (content !== originalContent) {
                fs.writeFileSync(fullPath, content);
                console.log('Fixed syntax in', fullPath);
            }
        }
    }
}
replaceInDir(path.resolve(__dirname, '../app'));
