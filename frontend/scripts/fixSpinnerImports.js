const fs = require('fs');
const path = require('path');

function fixImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            fixImports(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            let content = fs.readFileSync(full, 'utf8');
            if (content.includes('<LoadingSpinner') && !content.includes('import { LoadingSpinner }')) {
                // Find where the first import is
                const importMatch = content.match(/^import /m);
                if (importMatch) {
                    content = content.replace(/^import /m, "import { LoadingSpinner } from '@/components/ui/LoadingSpinner';\nimport ");
                } else {
                    content = "import { LoadingSpinner } from '@/components/ui/LoadingSpinner';\n" + content;
                }
                fs.writeFileSync(full, content);
                console.log('Fixed import in', full);
            }
        }
    }
}

fixImports(path.resolve(__dirname, '../app/(painel)'));
