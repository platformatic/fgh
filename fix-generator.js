// This is a helper script to fix the generator.ts file
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the generator.ts file
const generatorPath = path.join(__dirname, 'src', 'generator.ts');
const content = fs.readFileSync(generatorPath, 'utf8');

// Check if there's code before the import statements
const importIndex = content.indexOf('/* eslint no-new-func: "off" */');
if (importIndex > 0) {
  // There's code before the imports - this needs to be moved
  console.log('Found code before imports that needs to be fixed');
  
  // Find the code for the generatePipe method to see where to place the moved code
  const pipeMethodIndex = content.indexOf('private generatePipe');
  
  if (pipeMethodIndex !== -1) {
    // Extract the code before imports
    const codeBeforeImports = content.substring(0, importIndex).trim();
    
    // Remove the code before imports
    let fixedContent = content.substring(importIndex);
    
    // Find where to insert the missing method code in the generatePipe method
    const pipeMethodBodyStart = fixedContent.indexOf('{', pipeMethodIndex) + 1;
    
    // Add the code at the beginning of the generatePipe method
    fixedContent = 
      fixedContent.substring(0, pipeMethodBodyStart) + '\n' + 
      codeBeforeImports + '\n' + 
      fixedContent.substring(pipeMethodBodyStart);
    
    // Write the fixed content back to the file
    fs.writeFileSync(generatorPath, fixedContent, 'utf8');
    console.log('Fixed the generator.ts file');
  } else {
    console.log('Could not find the generatePipe method');
  }
} else {
  console.log('No issues found with the generator.ts file');
}
