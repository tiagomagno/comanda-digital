const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: Backticks (template literal). ex: `http://localhost:3001/api/pedidos/${pedidoId}`
    // We can just replace http://localhost:3001/api with ${config.apiUrl}
    content = content.replace(/`http:\/\/localhost:3001\/api(.*?)[`]/g, '`${config.apiUrl}$1`');

    // Pattern 2: Single quotes. ex: 'http://localhost:3001/api/pedidos'
    content = content.replace(/'http:\/\/localhost:3001\/api(.*?)[']/g, '`${config.apiUrl}$1`');

    // Pattern 3: Double quotes. ex: "http://localhost:3001/api/pedidos"
    content = content.replace(/"http:\/\/localhost:3001\/api(.*?)["]/g, '`${config.apiUrl}$1`');

    // If something changed, inject the import
    if (content !== original) {
        if (!content.includes('@/lib/config')) {
            content = 'import { config } from "@/lib/config";\n' + content;
        }
        fs.writeFileSync(filePath, content);
        console.log('Fixed', filePath);
    }
}

function traverse(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const full = path.join(dir, file);
        if (fs.statSync(full).isDirectory()) {
            traverse(full);
        } else if (full.endsWith('.ts') || full.endsWith('.tsx')) {
            processFile(full);
        }
    }
}

traverse(path.resolve(__dirname, '../app'));
