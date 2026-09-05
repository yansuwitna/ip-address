import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """    const token = urlParams.get('token');
    if (token) {
      const allUsers = loadUsers();
      const matchedUser = allUsers.find(u => u.magicToken === token);"""

new_logic = """    const token = urlParams.get('token');
    if (token) {
      const cleanToken = token.trim();
      const allUsers = loadUsers();
      const matchedUser = allUsers.find(u => u.magicToken && u.magicToken.trim() === cleanToken);"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx token logic made robust.")
