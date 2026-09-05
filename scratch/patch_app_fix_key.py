import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """        localStorage.setItem('currentUser', JSON.stringify({
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          avatar: matchedUser.avatar,
          magicToken: matchedUser.magicToken
        }));"""

new_logic = """        localStorage.setItem('netipam_auth_session', JSON.stringify({
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          avatar: matchedUser.avatar,
          magicToken: matchedUser.magicToken
        }));"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx patched the auth session key.")
