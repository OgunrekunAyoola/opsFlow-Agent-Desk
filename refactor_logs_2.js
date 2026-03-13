const fs = require('fs');
const path = require('path');

const projectRoot = 'c:\\Users\\F MORE\\OneDrive\\Desktop\\opsFlow-Agent-Desk\\backend';
const srcRoot = path.join(projectRoot, 'src');

const files = [
    'routes/clients.ts',
    'routes/dashboard.ts',
    'routes/events.ts',
    'routes/integrations.ts',
    'routes/portal.ts',
    'routes/settings.ts',
    'routes/tenants.ts',
    'utils/encryption.ts'
];

files.forEach(relPath => {
    const fullPath = path.join(srcRoot, relPath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${relPath}`);
        return;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (!content.includes('console.log') && !content.includes('console.error') && !content.includes('console.warn')) {
        console.log(`No console calls in ${relPath}`);
        return;
    }

    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.error\(/g, 'logger.error(');
    content = content.replace(/console\.warn\(/g, 'logger.warn(');

    if (!content.includes('import logger from')) {
        const segments = relPath.split('/');
        const depth = segments.length - 1;
        let prefix = depth === 0 ? './' : '../'.repeat(depth);
        const loggerPath = `${prefix}shared/utils/logger`;
        
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ') || lines[i].trim().startsWith('const ') || lines[i].trim().startsWith('export ')) {
                if (lines[i].trim().startsWith('import ')) lastImportIndex = i;
            } else if (lines[i].trim() === '' && lastImportIndex !== -1) {
                // empty lines
            } else if (lastImportIndex !== -1) {
                break;
            }
        }
        
        const importLine = `import logger from '${loggerPath}';`;
        if (lastImportIndex === -1) {
            lines.unshift(importLine);
        } else {
            lines.splice(lastImportIndex + 1, 0, importLine);
        }
        content = lines.join('\n');
    }

    fs.writeFileSync(fullPath, content);
    console.log(`Refactored ${relPath}`);
});
