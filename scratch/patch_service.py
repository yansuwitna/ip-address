import re

with open('src/utils/servicePresets.ts', 'r') as f:
    content = f.read()

# E.g., bg-blue-50 border-blue-200 -> bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800
def repl_bg(m):
    color = m.group(1)
    return f"bg-{color}-50 dark:bg-{color}-900/30 border-{color}-200 dark:border-{color}-800"
content = re.sub(r'bg-([a-z]+)-50 border-\1-200', repl_bg, content)

def repl_text(m):
    color = m.group(1)
    if color == 'slate':
        return f"text-slate-700 dark:text-slate-300"
    return f"text-{color}-700 dark:text-{color}-400"
content = re.sub(r'text-([a-z]+)-700', repl_text, content)

with open('src/utils/servicePresets.ts', 'w') as f:
    f.write(content)
