import os

filepath = 'src/components/UsersView.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """    onSaveUser({
      ...singleUser,
      password: undefined, // ensure password isn't overridden with empty
      magicToken: token
    } as any);
  };"""

new_logic = """    const res = onSaveUser({
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

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("UsersView.tsx token save patched.")
