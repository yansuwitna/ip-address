import os
import re

filepath = 'src/utils/auth.ts'
with open(filepath, 'r') as f:
    content = f.read()

if "import { syncToServer, wipeServer } from './api';" not in content:
    content = "import { syncToServer, wipeServer } from './api';\n" + content

# Patch saveUsers
pattern1 = r"export function saveUsers\(users: UserAccount\[\]\): void \{\s*try \{\s*localStorage\.setItem\(USERS_STORAGE_KEY, JSON\.stringify\(users\)\);\s*\} catch \(e\) \{\s*console\.error\('Failed to save users:', e\);\s*\}\s*\}"
new1 = """export function saveUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    syncToServer(USERS_STORAGE_KEY, users);
  } catch (e) {
    console.error('Failed to save users:', e);
  }
}"""
content = re.sub(pattern1, new1, content)

# Patch wipeAllUsers
pattern2 = r"export function wipeAllUsers\(\): void \{\s*try \{\s*localStorage\.setItem\(USERS_STORAGE_KEY, JSON\.stringify\(\[\]\)\);\s*localStorage\.removeItem\(AUTH_STORAGE_KEY\);\s*\} catch \(e\) \{\s*console\.error\('Failed to wipe users:', e\);\s*\}\s*\}"
new2 = """export function wipeAllUsers(): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem(AUTH_STORAGE_KEY);
    wipeServer();
  } catch (e) {
    console.error('Failed to wipe users:', e);
  }
}"""
content = re.sub(pattern2, new2, content)

with open(filepath, 'w') as f:
    f.write(content)
print("auth.ts patched.")
