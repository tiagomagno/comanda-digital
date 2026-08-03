const fs = require('fs');
const path = require('path');

function replaceSpinners(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            replaceSpinners(full);
        } else if (full.endsWith('.tsx') || full.endsWith('.ts')) {
            let content = fs.readFileSync(full, 'utf8');
            let original = content;

            // Simple replace of generic big loaders
            content = content.replace(
                /<div className="animate-spin[^>]+><\/div>\s*<p[^>]+>.*?<\/p>/g,
                '<LoadingSpinner size="lg" message="Carregando..." />'
            );
            
            // Replace standalone <div> spinner wrappers
            content = content.replace(
                /<div className="animate-spin[^>]+><\/div>/g,
                '<LoadingSpinner size="lg" />'
            );
            
            content = content.replace(
                /<div className="animate-spin[^>]+" \/>/g,
                '<LoadingSpinner size="lg" />'
            );

            if (content !== original) {
                if (!content.includes('LoadingSpinner')) {
                    content = "import { LoadingSpinner } from '@/components/ui/LoadingSpinner';\n" + content;
                }
                fs.writeFileSync(full, content);
                console.log('Migrated spinners in', full);
            }
        }
    }
}

replaceSpinners(path.resolve(__dirname, '../app/(painel)'));
