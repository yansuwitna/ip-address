import os

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

magic_link_logic = """
  // Magic Link Auto Login
  useEffect(() => {
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
          avatar: matchedUser.avatar,
          magicToken: matchedUser.magicToken
        }));
        setCurrentUser(matchedUser);
        setAuthView('home');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

"""

if "// Magic Link Auto Login" not in content:
    content = content.replace("  // Theme State", magic_link_logic + "  // Theme State")

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx token logic injected.")
