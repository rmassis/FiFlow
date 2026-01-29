
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk('c:/Users/rodri/OneDrive/Documents/FiFlow/src/react-app');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lucideMatch = content.match(/import\s+{([^}]+)}\s+from\s+["']lucide-react["']/);
    if (lucideMatch) {
        const imported = lucideMatch[1].split(',').map(s => s.trim());
        const usedMatches = content.match(/<([A-Z][a-zA-Z0-9]+)/g);
        if (usedMatches) {
            const used = usedMatches.map(m => m.slice(1));
            // Common lucide components
            used.forEach(icon => {
                if (icon !== 'div' && icon !== 'span' && icon !== 'button' && icon !== 'input' && icon !== 'label' && icon !== 'form' && icon !== 'h1' && icon !== 'h2' && icon !== 'h3' && icon !== 'p' && icon !== 'a' && icon !== 'img' && icon !== 'svg' && icon !== 'path' && icon !== 'circle' && icon !== 'rect' && icon !== 'line' && icon !== 'polyline' && icon !== 'polygon' && icon !== 'ellipse') {
                    // Check if it's imported from lucide
                    // This is a naive check as it might be imported from elsewhere
                    // But if it's typical lucide icon name and NOT imported from elsewhere, it's suspicious
                    if (icon.match(/^[A-Z][a-z]+([A-Z][a-z]+)*$/)) {
                        // Check if imported in the file
                        if (!content.includes(`import ${icon}`) && !content.includes(icon + ',') && !content.includes(',' + icon) && !content.includes('{ ' + icon) && !content.includes(icon + ' }')) {
                            // Also check if defined locally
                            if (!content.includes(`function ${icon}`) && !content.includes(`const ${icon}`)) {
                                console.log(`Suspicious: ${icon} used in ${file} but not imported or defined.`);
                            }
                        }
                    }
                }
            });
        }
    }
});
