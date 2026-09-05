# Panduan Otomatisasi Pesan Commit Git Menggunakan `pesan-git.txt`

Dokumen ini menjelaskan beberapa metode untuk menggunakan isi file `pesan-git.txt` sebagai pesan commit Git secara otomatis.

---

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
