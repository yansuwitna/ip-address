import os

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """  const generateMagicToken = () => {
    if (!singleUser) return;
    
    // Generate 100 char alphanumeric string
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    const array = new Uint8Array(100);
    crypto.getRandomValues(array);
    for (let i = 0; i < 100; i++) {
      token += chars[array[i] % chars.length];
    }
    
    const res = onSaveUser({
      ...singleUser,
      password: undefined, // ensure password isn't overridden with empty
      magicToken: token
    } as any);
    
    // @ts-ignore
    if (res && res.success === false) {
      // @ts-ignore
      setFormError(res.error || 'Gagal menyimpan token ke database!');
    }
  };"""

new_logic = """  const generateMagicToken = () => {
    if (!singleUser) return;
    
    Swal.fire({
      title: singleUser.magicToken ? 'Generate Ulang Token?' : 'Buat Token Baru?',
      text: singleUser.magicToken 
        ? 'Token lama akan hangus dan URL/PWA shortcut lama Anda tidak bisa lagi digunakan untuk bypass login. Yakin ingin mengganti?' 
        : 'Token ini akan menghasilkan link khusus yang memungkinkan Anda login langsung tanpa password. Lanjutkan?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Buat Token',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        // Generate 100 char alphanumeric string
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        const array = new Uint8Array(100);
        crypto.getRandomValues(array);
        for (let i = 0; i < 100; i++) {
          token += chars[array[i] % chars.length];
        }
        
        const res = onSaveUser({
          ...singleUser,
          password: undefined, // ensure password isn't overridden with empty
          magicToken: token
        } as any);
        
        // @ts-ignore
        if (res && res.success === false) {
          // @ts-ignore
          setFormError(res.error || 'Gagal menyimpan token ke database!');
        } else {
          Swal.fire({
            title: 'Berhasil!',
            text: 'Token baru telah aktif dan tersimpan ke database.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
          });
        }
      }
    });
  };"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView token confirm patched.")
