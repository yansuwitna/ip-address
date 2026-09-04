import re

with open('src/components/IPMatrixGrid.tsx', 'r') as f:
    content = f.read()

# E.g. bg-emerald-50 border border-emerald-400
# I will use a series of string replacements for the specific classes

replacements = {
    'bg-emerald-50 border border-emerald-400': 'bg-emerald-50 dark:bg-emerald-900/40 border border-emerald-400 dark:border-emerald-500/50',
    'bg-blue-100 border border-blue-400': 'bg-blue-100 dark:bg-blue-900/50 border border-blue-400 dark:border-blue-500/50',
    'bg-amber-100 border border-amber-400': 'bg-amber-100 dark:bg-amber-900/50 border border-amber-400 dark:border-amber-500/50',
    'bg-purple-100 border border-purple-400': 'bg-purple-100 dark:bg-purple-900/50 border border-purple-400 dark:border-purple-500/50',
    'bg-sky-200 border border-sky-500': 'bg-sky-200 dark:bg-sky-800/60 border border-sky-500 dark:border-sky-400/50',
    
    'bg-sky-100 border-sky-400 text-sky-900 hover:bg-sky-200': 'bg-sky-100 dark:bg-sky-900/60 border-sky-400 dark:border-sky-500/60 text-sky-900 dark:text-sky-100 hover:bg-sky-200 dark:hover:bg-sky-800/80',
    'bg-blue-100/90 border-blue-300 text-blue-900 hover:bg-blue-200': 'bg-blue-100/90 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700/60 text-blue-900 dark:text-blue-100 hover:bg-blue-200 dark:hover:bg-blue-800/70',
    'bg-amber-100/90 border-amber-300 text-amber-900 hover:bg-amber-200': 'bg-amber-100/90 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-100 hover:bg-amber-200 dark:hover:bg-amber-800/70',
    'bg-purple-100/90 border-purple-300 text-purple-900 hover:bg-purple-200': 'bg-purple-100/90 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700/60 text-purple-900 dark:text-purple-100 hover:bg-purple-200 dark:hover:bg-purple-800/70',
    'bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-400': 'bg-emerald-50/70 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-800/60 hover:border-emerald-400 dark:hover:border-emerald-500',
    
    'bg-blue-600': 'bg-blue-600 dark:bg-blue-500',
    'bg-emerald-400': 'bg-emerald-400 dark:bg-emerald-500',
    
    'bg-sky-100 text-sky-800 border border-sky-300': 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700',
    
    "'bg-blue-100 text-blue-800'": "'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'",
    "'bg-amber-100 text-amber-800'": "'bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300'",
    "'bg-purple-100 text-purple-800'": "'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300'",
    "'bg-emerald-100 text-emerald-800'": "'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300'",
    
    'bg-blue-50 border border-blue-200 text-blue-800': 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
    
    "? 'bg-blue-600 text-white font-semibold shadow-xs'": "? 'bg-blue-600 dark:bg-blue-500 text-white font-semibold shadow-xs'"
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open('src/components/IPMatrixGrid.tsx', 'w') as f:
    f.write(content)
