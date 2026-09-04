const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const replacements = [
        // bg-white -> bg-white dark:bg-slate-900
        { regex: /bg-white(?!\s+dark:bg-)/g, replacement: 'bg-white dark:bg-slate-900' },
        // bg-slate-50 -> bg-slate-50 dark:bg-slate-950
        { regex: /bg-slate-50(?!\s+dark:bg-)/g, replacement: 'bg-slate-50 dark:bg-slate-800/50' }, // maybe slate-800/50 is better for alternate row backgrounds
        // bg-slate-100 -> bg-slate-100 dark:bg-slate-800
        { regex: /bg-slate-100(?!\s+dark:bg-)/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
        // border-slate-200/90 -> border-slate-200/90 dark:border-slate-800
        { regex: /border-slate-200\/90(?!\s+dark:border-)/g, replacement: 'border-slate-200/90 dark:border-slate-800' },
        // border-slate-200 -> border-slate-200 dark:border-slate-700
        { regex: /border-slate-200(?!\/)(?!\s+dark:border-)/g, replacement: 'border-slate-200 dark:border-slate-700' },
        // border-slate-300 -> border-slate-300 dark:border-slate-600
        { regex: /border-slate-300(?!\s+dark:border-)/g, replacement: 'border-slate-300 dark:border-slate-600' },
        
        // Text colors
        { regex: /text-slate-900(?!\s+dark:text-)/g, replacement: 'text-slate-900 dark:text-slate-100' },
        { regex: /text-slate-800(?!\s+dark:text-)/g, replacement: 'text-slate-800 dark:text-slate-200' },
        { regex: /text-slate-700(?!\s+dark:text-)/g, replacement: 'text-slate-700 dark:text-slate-300' },
        { regex: /text-slate-600(?!\s+dark:text-)/g, replacement: 'text-slate-600 dark:text-slate-400' },
        { regex: /text-slate-500(?!\s+dark:text-)/g, replacement: 'text-slate-500 dark:text-slate-400' },
        
        // Hovers
        { regex: /hover:bg-slate-50(?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-800/80' },
        { regex: /hover:bg-slate-100(?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
        { regex: /hover:bg-slate-200(?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-slate-200 dark:hover:bg-slate-700' },
        
        // hover texts
        { regex: /hover:text-slate-900(?!\s+dark:hover:text-)/g, replacement: 'hover:text-slate-900 dark:hover:text-slate-100' },
        { regex: /hover:text-slate-800(?!\s+dark:hover:text-)/g, replacement: 'hover:text-slate-800 dark:hover:text-slate-200' },
    ];

    replacements.forEach(rule => {
        content = content.replace(rule.regex, rule.replacement);
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

function processDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            processFile(fullPath);
        }
    }
}

processDirectory('./src/components');
processFile('./src/App.tsx');
