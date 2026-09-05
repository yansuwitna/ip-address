import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_auth_effect = """  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);"""

new_auth_effect = """  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      const allUsers = loadUsers();
      const matchedUser = allUsers.find(u => u.magicToken === token);
      if (matchedUser) {
        localStorage.setItem('currentUser', JSON.stringify({
          id: matchedUser.id,
          username: matchedUser.username,
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          avatar: matchedUser.avatar
        }));
        setCurrentUser(matchedUser);
        window.history.replaceState({}, '', window.location.pathname);
        return;
      }
    }

    const user = getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);"""

content = content.replace(old_auth_effect, new_auth_effect)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx patched for magic link.")
