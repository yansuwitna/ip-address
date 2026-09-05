import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """    if (data.users) {
      setUsers(data.users);
      saveUsers(data.users);
    }"""

new_logic = """    if (data.users) {
      const singleUser = data.users.length > 0 ? [data.users[0]] : [];
      setUsers(singleUser);
      saveUsers(singleUser);
    }"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx import single user patched.")
