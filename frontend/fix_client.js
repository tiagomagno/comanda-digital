const fs = require('fs');
const path = require('path');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const f of files) {
        const fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            const lines = content.split(/\r?\n/);
            
            let useClientIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                // We match the exact string 'use client'; or "use client"; etc
                if (line === "'use client';" || line === '"use client";' || line === "'use client'" || line === '"use client"') {
                    useClientIndex = i;
                    break;
                }
            }

            if (useClientIndex > 0) {
                const directive = lines[useClientIndex];
                lines.splice(useClientIndex, 1);
                lines.unshift(directive);
                fs.writeFileSync(fullPath, lines.join('\n'));
                console.log(`Fixed ${fullPath}`);
            }
        }
    }
}

processDir(path.join(__dirname, 'app'));
