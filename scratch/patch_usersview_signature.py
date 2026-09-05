import os

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_sig = """  onSaveUser: (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
  }) => void;"""

new_sig = """  onSaveUser: (userData: {
    id?: string;
    username: string;
    name: string;
    email: string;
    password?: string;
    role?: string;
    avatar?: string;
    magicToken?: string;
  }) => void;"""

content = content.replace(old_sig, new_sig)
with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx signature patched.")
