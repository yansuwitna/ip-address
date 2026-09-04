# IP Address - Network & IP Address Management System

Aplikasi manajemen jaringan modern, elegan, dan terintegrasi untuk mendata **Grup IP (Subnet / VLAN)** serta melacak alokasi seluruh **IP Address** yang sudah terpakai maupun yang masih tersedia dalam infrastruktur IT Anda.

Dibangun dengan **React 18/19 + TypeScript**, **Tailwind CSS**, dan tipografi modern **Poppins**.

---

## 🌟 Fitur Unggulan

1. **Halaman Beranda (Home Landing Page) & Portal Login**:
   - Landing page modern dengan metrik statistik global (Subnet, Host Digunakan, DHCP/Reserved, Kategori Device).
   - Gerbang autentikasi terpusat.
   - **Otomasi Akun Pertama**: Jika database akun belum memiliki pengguna, sistem otomatis langsung menampilkan formulir pendaftaran akun utama tanpa perlu modal tambahan.
2. **Manajemen Grup Subnet & Kalkulator CIDR**:
   - Penghitungan otomatis Subnet Network IP, Broadcast IP, Netmask, dan kapasitas *usable host*.
   - Bar visual pemanfaatan IP secara *real-time*.
3. **Peta Grid Matrix Alokasi IP**:
   - Visualisasi kotak interaktif alokasi IP host (.1 s/d .254) lengkap dengan kode warna status.
   - Tooltip detail perangkat serta klik langsung untuk alokasi baru.
4. **Klasifikasi Kategori Perangkat**:
   - Menu pengelolaan tipe perangkat kustom (Server, Router, Switch, Access Point, PC, CCTV, Printer, IoT, dsb.).
   - Dilengkapi proteksi integritas: kategori yang sedang digunakan oleh host tidak dapat terhapus secara tidak sengaja.
5. **Ekspor & Cadangan Terproteksi**:
   - **Ekspor Excel (.xlsx)**: Unduh laporan inventaris IP per subnet ke format spreadsheet Excel.
   - **Cadangan Lengkap (.json)**: Backup seluruh data (Subnet, Alokasi IP, Kategori, dan Akun Pengguna).
   - **Proteksi Hapus Data**: Tombol pembersihan data hanya dapat diaktifkan setelah cadangan lengkap berhasil diunduh.

---

## 💻 Menjalankan di Lingkungan Lokal (Development)

### Prasyarat:
- Node.js versi 18 atau 20+
- npm atau yarn / pnpm

### Langkah:
```bash
# 1. Masuk ke direktori proyek
cd /path/ke/proyek

# 2. Pasang dependensi
npm install

# 3. Jalankan development server
npm run dev
```
Buka browser di: **`http://localhost:5173`**

### Uji Build Produksi Lokal:
```bash
npm run build
npm run preview
```

---

## 🚀 Panduan Instalasi & Deployment dengan PM2 di Server VPS

Panduan ini ditujukan untuk deployment di server **Linux VPS** (Ubuntu 20.04 / 22.04 / 24.04 LTS, Debian 11/12, atau sejenisnya) menggunakan **PM2 Process Manager**.

### 1. Persiapan Server VPS

Perbarui paket sistem VPS Anda:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential
```

### 2. Instalasi Node.js & npm (LTS v20)

Gunakan NodeSource untuk menginstal Node.js versi LTS terbaru:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi versi
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 3. Instalasi PM2 secara Global

Pasang PM2 sebagai pengelola proses background di VPS:
```bash
sudo npm install -g pm2
```

---

### 4. Clone Repositori & Persiapan Aplikasi

Pindahkan / clone repositori proyek ke direktori server (contoh di `/var/www/ip-address` atau di folder user `~/apps/ip-address`):

```bash
# Contoh direktori /var/www/ip-address:
sudo mkdir -p /var/www/ip-address
sudo chown -R $USER:$USER /var/www/ip-address
cd /var/www/ip-address

# Clone repositori Anda (ganti URL dengan URL repositori Anda):
git clone <URL_REPOSITORI_ANDA> .

# Pasang seluruh dependensi proyek:
npm install

# Kompilasi build produksi (menghasilkan folder /dist):
npm run build
```

---

### 5. Menjalankan Aplikasi Menggunakan PM2

Ada 2 cara yang direkomendasikan untuk menjalankan aplikasi di server produksi:

#### Opsi A: Menggunakan `ecosystem.config.cjs` (Sangat Direkomendasikan)
Proyek ini sudah dilengkapi file konfigurasi PM2 [`ecosystem.config.cjs`](ecosystem.config.cjs). Cukup jalankan perintah:

```bash
pm2 start ecosystem.config.cjs
```

#### Opsi B: Menggunakan Static Server (`serve`)
Jika ingin menggunakan static web server ultra-ringan khusus aplikasi React/Vite:
```bash
sudo npm install -g serve
pm2 start serve --name "ip-address" -- -s dist -l 3000
```

#### Opsi C: Menggunakan Perintah Langsung Vite Preview
```bash
pm2 start "npm run preview -- --host 0.0.0.0 --port 3000" --name "ip-address"
```

---

### 6. Konfigurasi Autostart PM2 Saat Booting Server

Agar aplikasi otomatis menyala kembali saat server VPS di-restart atau mengalami reboot:

```bash
# 1. Simpan konfigurasi proses aktif saat ini
pm2 save

# 2. Buat script startup sistem
pm2 startup
```
*Salin dan jalankan baris perintah `sudo env PATH=...` yang dimunculkan oleh terminal jika diminta.*

---

### 7. Perintah Pemeliharaan PM2

Berikut daftar perintah berguna untuk memonitor aplikasi:

```bash
# Melihat daftar aplikasi yang berjalan
pm2 list
pm2 status

# Melihat log output & error secara real-time
pm2 logs ip-address

# Melihat ringkasan resource CPU & RAM
pm2 monit

# Me-restart aplikasi (misalnya setelah ada update build baru)
pm2 restart ip-address

# Menghentikan aplikasi
pm2 stop ip-address

# Menghapus aplikasi dari daftar PM2
pm2 delete ip-address
```

---

### 8. Alur Pembaruan Aplikasi (Update / CI/CD di VPS)

Jika ada perubahan kode baru di repository, perbarui di server dengan langkah berikut:

```bash
cd /var/www/ip-address
git pull origin master
npm install
npm run build
pm2 restart ip-address
```

---

### 9. Konfigurasi Nginx Reverse Proxy & Domain SSL (Opsional & Direkomendasikan)

Untuk menghubungkan domain Anda (misal `ipam.domainanda.com`) ke port 3000 PM2 serta mengaktifkan HTTPS gratis:

#### a. Pasang Nginx:
```bash
sudo apt install -y nginx
```

#### b. Buat Konfigurasi Blok Nginx:
```bash
sudo nano /etc/nginx/sites-available/ip-address
```

Masukkan konfigurasi berikut (sesuaikan `server_name`):
```nginx
server {
    listen 80;
    server_name ipam.domainanda.com; # Ganti dengan IP VPS atau Domain Anda

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### c. Aktifkan Konfigurasi & Restart Nginx:
```bash
sudo ln -s /etc/nginx/sites-available/ip-address /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### d. Pasang SSL Gratis dengan Certbot (Let's Encrypt):
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d ipam.domainanda.com
```

---

### 10. Konfigurasi Firewall Server (UFW)

Pastikan port web terbuka pada firewall VPS:
```bash
sudo ufw allow 22/tcp    # Port SSH (PENTING: Jangan sampai terkunci)
sudo ufw allow 80/tcp    # HTTP Nginx
sudo ufw allow 443/tcp   # HTTPS SSL
sudo ufw allow 3000/tcp  # (Opsional jika ingin akses langsung port 3000 tanpa Nginx)
sudo ufw enable
```

Aplikasi **IP Address** kini telah aktif dan berjalan stabil 24/7 di server VPS Anda dengan pengawasan otomatis dari PM2!
