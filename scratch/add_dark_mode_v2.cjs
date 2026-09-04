const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const replacements = [
        // bg
        { regex: /(?<!dark:)\bbg-white\b(?!\s+dark:bg-)/g, replacement: 'bg-white dark:bg-slate-900' },
        { regex: /(?<!hover:)(?<!dark:)\bbg-slate-50\b(?!\s+dark:bg-)/g, replacement: 'bg-slate-50 dark:bg-slate-800/40' },
        { regex: /(?<!hover:)(?<!dark:)\bbg-slate-100\b(?!\s+dark:bg-)/g, replacement: 'bg-slate-100 dark:bg-slate-800' },
        { regex: /(?<!hover:)(?<!dark:)\bbg-slate-200\b(?!\s+dark:bg-)/g, replacement: 'bg-slate-200 dark:bg-slate-700' },

        // borders
        { regex: /(?<!dark:)\bborder-slate-200\/90\b(?!\s+dark:border-)/g, replacement: 'border-slate-200/90 dark:border-slate-800' },
        { regex: /(?<!dark:)\bborder-slate-200\b(?!\/)(?!\s+dark:border-)/g, replacement: 'border-slate-200 dark:border-slate-700' },
        { regex: /(?<!dark:)\bborder-slate-300\b(?!\/)(?!\s+dark:border-)/g, replacement: 'border-slate-300 dark:border-slate-600' },

        // text
        { regex: /(?<!hover:)(?<!dark:)\btext-slate-900\b(?!\s+dark:text-)/g, replacement: 'text-slate-900 dark:text-slate-100' },
        { regex: /(?<!hover:)(?<!dark:)\btext-slate-800\b(?!\s+dark:text-)/g, replacement: 'text-slate-800 dark:text-slate-200' },
        { regex: /(?<!hover:)(?<!dark:)\btext-slate-700\b(?!\s+dark:text-)/g, replacement: 'text-slate-700 dark:text-slate-300' },
        { regex: /(?<!hover:)(?<!dark:)\btext-slate-600\b(?!\s+dark:text-)/g, replacement: 'text-slate-600 dark:text-slate-400' },
        { regex: /(?<!hover:)(?<!dark:)\btext-slate-500\b(?!\s+dark:text-)/g, replacement: 'text-slate-500 dark:text-slate-400' },

        // hover bg
        { regex: /(?<!dark:)hover:bg-slate-50\b(?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-slate-50 dark:hover:bg-slate-800/60' },
        { regex: /(?<!dark:)hover:bg-slate-100\b(?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-slate-100 dark:hover:bg-slate-800' },
        { regex: /(?<!dark:)hover:bg-slate-200\b(?!\s+dark:hover:bg-)/g, replacement: 'hover:bg-slate-200 dark:hover:bg-slate-700' },

        // hover text
        { regex: /(?<!dark:)hover:text-slate-900\b(?!\s+dark:hover:text-)/g, replacement: 'hover:text-slate-900 dark:hover:text-slate-100' },
        { regex: /(?<!dark:)hover:text-slate-800\b(?!\s+dark:hover:text-)/g, replacement: 'hover:text-slate-800 dark:hover:text-slate-200' },
        { regex: /(?<!dark:)hover:text-slate-700\b(?!\s+dark:hover:text-)/g, replacement: 'hover:text-slate-700 dark:hover:text-slate-300' },
        { regex: /(?<!dark:)hover:text-slate-600\b(?!\s+dark:hover:text-)/g, replacement: 'hover:text-slate-600 dark:hover:text-slate-300' },
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
