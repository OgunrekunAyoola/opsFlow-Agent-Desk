const fs = require('fs');
const path = require('path');

const projectRoot = 'c:\\Users\\F MORE\\OneDrive\\Desktop\\opsFlow-Agent-Desk\\backend';
const srcRoot = path.join(projectRoot, 'src');

const files = [
    'db.ts',
    'index.ts',
    'socket.ts',
    'worker.ts',
    'agents/ActionAgent.ts',
    'agents/RAGAgent.ts',
    'core/orchestrator/TicketOrchestrator.ts',
    'integrations/DummyProvider.ts',
    'integrations/MockApiProvider.ts',
    'middleware/errorHandler.ts',
    'queue/index.ts',
    'services/ActionService.ts',
    'services/AssignmentService.ts',
    'services/GeminiLLMService.ts',
    'services/IntegrationSyncService.ts',
    'services/RAGService.ts',
    'services/ResolvedTicketEmbeddingService.ts',
    'services/TicketService.ts',
    'workers/lifecycle.worker.ts',
    'workers/slaMonitor.worker.ts'
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
        // Still check if import exists and needs update if we moved it
        return;
    }

    // Replace console.log BEFORE adding import to avoid duplicates if already present but wrong
    content = content.replace(/console\.log\(/g, 'logger.info(');
    content = content.replace(/console\.error\(/g, 'logger.error(');
    content = content.replace(/console\.warn\(/g, 'logger.warn(');

    // Add import if missing
    if (!content.includes('import logger from')) {
        const lines = content.split('\n');
        let lastImportIndex = -1;
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
                lastImportIndex = i;
            } else if (lines[i].trim() === '' && lastImportIndex !== -1) {
                // Keep going if there are empty lines between imports
            } else if (lastImportIndex !== -1) {
                // End of imports
                break;
            }
        }
        
        const segments = relPath.split('/');
        const depth = segments.length - 1;
        let prefix = depth === 0 ? './' : '../'.repeat(depth);
        const loggerPath = `${prefix}shared/utils/logger`;
        
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
