# Panduan Otomatisasi Pesan Commit Git Menggunakan `pesan-git.txt`

Dokumen ini menjelaskan beberapa metode untuk menggunakan isi file `pesan-git.txt` sebagai pesan commit Git secara otomatis.

---

## Opsi 1: Otomatis Penuh Menggunakan Git Hook (`prepare-commit-msg`) — Direkomendasikan ⭐

Metode ini membuat Git secara otomatis membaca isi file `pesan-git.txt` setiap kali Anda mengetik perintah `git commit` tanpa perlu mengetik flag `-m` atau `-F`.

### 1. Pasang Script Hook
Jalankan perintah berikut di terminal proyek:

```bash
cat << 'HOOK_EOF' > .git/hooks/prepare-commit-msg
#!/bin/bash
COMMIT_MSG_FILE=$1
COMMIT_SOURCE=$2

# Jika file pesan-git.txt ada dan tidak kosong
if [ -f "pesan-git.txt" ] && [ -s "pesan-git.txt" ]; then
    # Jika tidak ada argumen -m dari pengguna, gunakan isi pesan-git.txt
    if [ -z "$COMMIT_SOURCE" ]; then
        cat pesan-git.txt > "$COMMIT_MSG_FILE"
    fi
fi
HOOK_EOF
```

### 2. Beri Izin Eksekusi (*Executable*)
```bash
chmod +x .git/hooks/prepare-commit-msg
```

### 3. Cara Penggunaan
1. Isi pesan yang ingin Anda gunakan ke file `pesan-git.txt`:
   ```bash
   echo "feat: perbarui sistem autentikasi dan enkripsi password" > pesan-git.txt
   ```
2. Lakukan staging dan commit:
   ```bash
   git add .
   git commit
   ```
3. Pesan commit akan langsung terisi dari `pesan-git.txt`.

---

## Opsi 2: Menggunakan Flag `-F` Bawaan Git

Jika Anda tidak ingin memasang Git hook, Git memiliki opsi bawaan `-F` (*file*) untuk mengambil pesan dari file teks:

```bash
git add .
git commit -F pesan-git.txt
```

### Mempersingkat dengan Git Alias
Agar tidak perlu mengetik panjang setiap saat, buat alias di konfigurasi Git:

```bash
git config alias.cm 'commit -F pesan-git.txt'
```

Setelah alias dibuat, cukup jalankan:
```bash
git add .
git cm
```

---

## Opsi 3: Menggunakan Konfigurasi `commit.template`

Jika Anda ingin isi file `pesan-git.txt` dijadikan template standar yang otomatis muncul saat editor commit terbuka:

```bash
git config commit.template pesan-git.txt
```

Untuk commit:
```bash
git add .
git commit
```
Editor Git (nano/vim/VS Code) akan terbuka dengan pesan dari `pesan-git.txt` sudah siap digunakan.

---

## 💡 Tips Tambahan

Agar file `pesan-git.txt` tidak ikut terdorong (*push*) ke remote repository GitHub/GitLab, tambahkan ke `.gitignore`:

```bash
echo "pesan-git.txt" >> .gitignore
```
