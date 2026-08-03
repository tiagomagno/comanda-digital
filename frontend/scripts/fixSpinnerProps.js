const fs = require('fs');
const path = require('path');

function replaceMessage(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            replaceMessage(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            let content = fs.readFileSync(full, 'utf8');
            let original = content;

            content = content.replace(/<LoadingSpinner size="lg" message="Carregando..." \/>/g, '<LoadingSpinner size="lg" label="Carregando..." />');

            if (content !== original) {
                fs.writeFileSync(full, content);
                console.log('Fixed message prop in', full);
            }
        }
    }
}

replaceMessage(path.resolve(__dirname, '../app/(painel)'));
