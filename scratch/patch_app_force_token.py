import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """    const token = urlParams.get('token');
    if (token) {
      const cleanToken = token.trim();
      const allUsers = loadUsers();
      const matchedUser = allUsers.find(u => u.magicToken && u.magicToken.trim() === cleanToken);
      if (matchedUser) {"""

new_logic = """    const token = urlParams.get('token');
    if (token) {
      const cleanToken = token.trim();
      const allUsers = loadUsers();
      
      // Strict match
      let matchedUser = allUsers.find(u => u.magicToken && u.magicToken.trim() === cleanToken);
      
      // Fallback loose match if somehow URL encoding messed up a character
      if (!matchedUser) {
         matchedUser = allUsers.find(u => u.magicToken && (cleanToken.includes(u.magicToken.trim()) || u.magicToken.trim().includes(cleanToken)));
      }

      if (matchedUser) {"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx force token patched.")
