import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_sig = """  const handleSaveUser = (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
  }) => {"""

new_sig = """  const handleSaveUser = (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
    magicToken?: string;
  }) => {"""

content = content.replace(old_sig, new_sig)
with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx signature patched.")
