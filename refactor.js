const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/SATISH/Desktop/PASC CCA PLATFORM/PASC CCA/PASC-CCA-Backend_2025/src/controllers';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip files that don't match the condition
  if (!content.includes('error instanceof Error ? error.message')) return;

  // Add import if not present
  if (!content.includes('../utils/errorHandler')) {
    content = 'import { handleError } from "../utils/errorHandler";\n' + content;
  }

  // Regex to replace `error instanceof Error ? error.message : 'Something'`
  content = content.replace(/error instanceof Error \? error\.message : (['"`][^'"`]+['"`])/g, "handleError(error, $1)");

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${file}`);
});
