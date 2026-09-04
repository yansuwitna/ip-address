import re

def patch(filename, replacements):
    with open(filename, 'r') as f:
        content = f.read()
    for k, v in replacements.items():
        content = content.replace(k, v)
    with open(filename, 'w') as f:
        f.write(content)

patch('src/components/IPTable.tsx', {
    'bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800': 'bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-800/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300',
    'bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-800': 'bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-800/50 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300',
    'bg-sky-100 text-sky-800 border border-sky-300': 'bg-sky-100 dark:bg-sky-900/40 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700'
})

patch('src/components/GroupList.tsx', {
    'hover:bg-rose-100 text-slate-400 hover:text-rose-600': 'hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400'
})

patch('src/components/ServiceModal.tsx', {
    'bg-blue-100 text-blue-800': 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'
})

