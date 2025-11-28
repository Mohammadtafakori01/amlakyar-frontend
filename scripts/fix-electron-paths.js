const fs = require('fs');
const path = require('path');

/**
 * Fix relative paths in HTML files for Electron file:// protocol
 * Changes ./_next/... to ../_next/... for files in subdirectories
 * and ensures all paths are relative to the out directory root
 */
function fixElectronPaths(dir, depth = 0) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Recursively process subdirectories
      fixElectronPaths(filePath, depth + 1);
    } else if (file.endsWith('.html')) {
      // Read the HTML file
      let content = fs.readFileSync(filePath, 'utf8');

      // Calculate how many levels deep we are from the 'out' directory
      // out/index.html = depth 0 (no ../ needed, use ./)
      // out/dashboard/index.html = depth 1 (need ../)
      // out/dashboard/profile/index.html = depth 2 (need ../../)
      // depth already represents the correct level (0 = out root, 1 = one level deep, etc.)

      if (depth > 0) {
        // Create the prefix to go back to root (e.g., ../ or ../../)
        const prefix = '../'.repeat(depth);

        // Fix absolute paths (starting with /) - convert to relative
        content = content.replace(/(src|href)="\/(_next|fonts|icons|manifest\.json|logo\.png|favicon\.ico)/g, `$1="${prefix}$2`);
        
        // Fix relative paths (starting with ./) - ensure they go back to root
        content = content.replace(/(src|href)="\.\/(_next|fonts|icons|manifest\.json|logo\.png|favicon\.ico)/g, `$1="${prefix}$2`);
        
        // Remove crossorigin from font preloads (not needed for file:// protocol)
        content = content.replace(/crossorigin="anonymous"/g, '');

        // Write the fixed content back
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Fixed paths in: ${filePath} (depth: ${depth}, prefix: ${prefix})`);
      } else {
        // Root level files (index.html) - convert absolute paths to relative
        // Fix absolute paths (starting with /) - convert to ./
        const originalContent = content;
        content = content.replace(/(src|href)="\/(_next|fonts|icons|manifest\.json|logo\.png|favicon\.ico)/g, '$1="./$2');
        
        // Remove crossorigin from font preloads (not needed for file:// protocol)
        content = content.replace(/crossorigin="anonymous"/g, '');
        
        if (content !== originalContent) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`Fixed root paths in: ${filePath}`);
        }
      }
    }
  });
}

// Get the out directory path
const outDir = path.join(__dirname, '..', 'out');

if (!fs.existsSync(outDir)) {
  console.error('Error: out directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('Fixing paths in HTML files for Electron...');
fixElectronPaths(outDir);
console.log('Done! Paths have been fixed for Electron file:// protocol.');

