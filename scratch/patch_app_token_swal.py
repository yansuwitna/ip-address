import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

# Make sure Swal is imported in App.tsx
if "import Swal from 'sweetalert2';" not in content:
    content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect } from 'react';\nimport Swal from 'sweetalert2';")

old_token_logic = """  // Magic Link Auto Login
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
  }, []);"""

new_token_logic = """  // Magic Link Auto Login
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
        
        // Use a tiny timeout to ensure React state updates before we replace the URL and show alert
        setTimeout(() => {
          Swal.fire({
            title: 'Berhasil Masuk!',
            text: `Selamat datang, ${matchedUser.name}. Anda masuk via Token.`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
          window.history.replaceState({}, '', window.location.pathname);
        }, 100);
      } else {
        // Token invalid
        Swal.fire({
          title: 'Akses Ditolak',
          text: 'Token Login tidak valid atau sudah diganti!',
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {
          window.history.replaceState({}, '', window.location.pathname);
          setAuthView('home');
        });
      }
    }
  }, []);"""

content = content.replace(old_token_logic, new_token_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx token logic with swal patched.")
