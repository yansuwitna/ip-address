import os
import re

filepath = 'src/App.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """        // Token invalid - Debugging what is wrong!
        const storedToken = allUsers.length > 0 ? allUsers[0].magicToken : 'NO_USER';
        Swal.fire({
          title: 'Akses Ditolak (Debug)',
          html: `<div class="text-xs text-left overflow-hidden"><p><b>Token URL:</b> <br/>${token}</p><p class="mt-2"><b>Token DB:</b> <br/>${storedToken}</p></div>`,
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {"""

new_logic = """        // Token invalid - Debugging what is wrong!
        const storedToken = allUsers.length > 0 ? allUsers[0].magicToken : 'NO_USER';
        const userObjStr = allUsers.length > 0 ? JSON.stringify(allUsers[0]) : 'NONE';
        Swal.fire({
          title: 'Akses Ditolak (Debug)',
          html: `<div class="text-xs text-left overflow-hidden" style="max-height: 300px; overflow-y: auto;">
            <p><b>Token URL:</b> <br/>${token}</p>
            <p class="mt-2"><b>Token DB:</b> <br/>${storedToken}</p>
            <p class="mt-2"><b>Full User Object:</b> <br/>${userObjStr}</p>
          </div>`,
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("App.tsx patched for full object debug.")
