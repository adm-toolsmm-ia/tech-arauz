const fs = require('fs');
const path = require('path');

const srcDir = '.claude/commands/AIOS';
const destBaseDir = '_deprecated/aios-era/claude-commands-AIOS';

function moveDirectory(src, dest) {
  try {
    console.log('Attempting to move:', src, 'to:', dest);
    
    // Check if source exists
    if (!fs.existsSync(src)) {
      console.log('Source does not exist:', src);
      console.log('Current dir:', process.cwd());
      console.log('Dir contents:',fs.readdirSync('.'));
      return;
    }
    
    // Create destination
    fs.mkdirSync(dest, { recursive: true });
    
    // Copy recursively
    function copyRecursive(src, dest) {
      const stat = fs.statSync(src);
      if (stat.isDirectory()) {
        fs.mkdirSync(dest, { recursive: true });
        fs.readdirSync(src).forEach(file => {
          copyRecursive(path.join(src, file), path.join(dest, file));
        });
      } else {
        fs.copyFileSync(src, dest);
      }
    }
    
    copyRecursive(src, dest);
    console.log('Copied successfully');
    
    // Remove original
    function removeRecursive(dir) {
      if (fs.existsSync(dir)) {
        fs.readdirSync(dir).forEach(file => {
          const filePath = path.join(dir, file);
          if (fs.statSync(filePath).isDirectory()) {
            removeRecursive(filePath);
          } else {
            fs.unlinkSync(filePath);
          }
        });
        fs.rmdirSync(dir);
      }
    }
    
    removeRecursive(src);
    console.log('Removed original');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

moveDirectory(srcDir, destBaseDir);
