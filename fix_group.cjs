const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const cssDir = path.join(rootDir, 'css');
const cssComponentsDir = path.join(cssDir, 'components');
const componentsDir = path.join(rootDir, 'components');

const cssFiles = [
  { css: path.join(cssDir, 'App.css'), tsx: path.join(rootDir, 'App.tsx') }
];

if (fs.existsSync(cssComponentsDir) && fs.existsSync(componentsDir)) {
  const files = fs.readdirSync(cssComponentsDir).filter(f => f.endsWith('.css'));
  for (const file of files) {
    const baseName = path.basename(file, '.css');
    cssFiles.push({
      css: path.join(cssComponentsDir, file),
      tsx: path.join(componentsDir, `${baseName}.tsx`)
    });
  }
}

for (const { css, tsx } of cssFiles) {
  if (!fs.existsSync(css) || !fs.existsSync(tsx)) continue;
  
  let cssContent = fs.readFileSync(css, 'utf8');
  let tsxContent = fs.readFileSync(tsx, 'utf8');
  let changed = false;

  // Regex to find CSS blocks like .classname-element-1 { ... }
  const cssBlockRegex = /\.([a-zA-Z0-9_-]+)\s*\{([^}]+)\}/g;
  
  cssContent = cssContent.replace(cssBlockRegex, (match, className, body) => {
    let newBody = body;
    let appendedClasses = [];
    
    // Check if body has @apply with group or peer
    const applyRegex = /@apply([^;]+);/g;
    newBody = newBody.replace(applyRegex, (applyMatch, applyClasses) => {
      let classes = applyClasses.split(/\s+/).filter(Boolean);
      let newClasses = [];
      
      for (const cls of classes) {
        if (cls === 'group' || cls === 'peer') {
          appendedClasses.push(cls);
        } else {
          newClasses.push(cls);
        }
      }
      
      if (newClasses.length === 0) {
          // If the apply directive only had group/peer and is now empty, we need to handle it.
          // Tailwind doesn't like empty @apply, but let's assume there are other classes.
          return `/* @apply removed empty */`;
      }
      return `@apply ${newClasses.join(' ')};`;
    });
    
    if (appendedClasses.length > 0) {
      changed = true;
      // Now inject these classes back into the TSX
      const tsxRegex = new RegExp(`className="${className}"`, 'g');
      tsxContent = tsxContent.replace(tsxRegex, `className="${appendedClasses.join(' ')} ${className}"`);
    }
    
    return `.${className} {${newBody}}`;
  });

  if (changed) {
    fs.writeFileSync(css, cssContent, 'utf8');
    fs.writeFileSync(tsx, tsxContent, 'utf8');
    console.log(`Fixed group/peer in ${path.basename(css)}`);
  }
}

console.log("Groups fixed, attempting build...");
