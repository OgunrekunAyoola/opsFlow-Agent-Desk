const fs = require('fs');
const path = require('path');

const modelsDir = 'c:\\Users\\F MORE\\OneDrive\\Desktop\\opsFlow-Agent-Desk\\backend\\src\\models';
const files = fs.readdirSync(modelsDir);

files.forEach(file => {
  const filePath = path.join(modelsDir, file);
  if (!filePath.endsWith('.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Schema(') && !content.includes('deletedAt:')) {
    console.log(`Updating ${file}`);
    content = content.replace(/Schema\(\s*\{/, 'Schema(\n  {\n    deletedAt: { type: Date, default: null },');
    fs.writeFileSync(filePath, content);
  } else {
    console.log(`Skipping ${file} (already has deletedAt or no Schema)`);
  }
});
