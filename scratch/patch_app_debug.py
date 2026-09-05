import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """        // Token invalid
        Swal.fire({
          title: 'Akses Ditolak',
          text: 'Token Login tidak valid atau sudah diganti!',
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {
          window.history.replaceState({}, '', window.location.pathname);
          setAuthView('home');
        });"""

new_logic = """        // Token invalid - Debugging what is wrong!
        const storedToken = allUsers.length > 0 ? allUsers[0].magicToken : 'NO_USER';
        Swal.fire({
          title: 'Akses Ditolak (Debug)',
          html: `<div class="text-xs text-left overflow-hidden"><p><b>Token URL:</b> <br/>${token}</p><p class="mt-2"><b>Token DB:</b> <br/>${storedToken}</p></div>`,
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {
          window.history.replaceState({}, '', window.location.pathname);
          setAuthView('home');
        });"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx patched for debugging token.")
