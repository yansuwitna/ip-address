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

# 3. Salin file environment jika belum ada
cp .env.example .env

# 4. Generate Prisma Client & Database (default SQLite)
npx prisma generate
npx prisma db push

# 5. Jalankan development server
npm run dev
```
Buka browser di: **`http://localhost:3000`**

### Uji Build Produksi Lokal:
```bash
npm run build
npm run preview
```

---

## 🗄️ Panduan Konfigurasi Database (SQLite, PostgreSQL, MySQL)

Aplikasi ini menggunakan **Prisma ORM** yang fleksibel dan mendukung berbagai jenis database relasional. Data tersimpan murni di database (tanpa cache browser / localStorage).

### 1. SQLite (Bawaan / Default)
Tidak memerlukan instalasi server database terpisah, sangat cocok untuk VPS berkapasitas hemat atau deployment mandiri cepat.
- **File `.env`**:
  ```bash
  DATABASE_URL="file:./dev.db"
  ```
- **File `prisma/schema.prisma`**:
  ```prisma
  datasource db {
    provider = "sqlite"
    url      = env("DATABASE_URL")
  }
  ```

---

### 2. PostgreSQL
Cocok untuk infrastruktur perusahaan dengan keandalan tinggi dan konkurensi besar.
1. Buat database di PostgreSQL:
   ```sql
   CREATE DATABASE netipam;
   ```
2. Ubah `provider` di file `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
3. Atur string koneksi di file `.env`:
   ```bash
   # Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
   DATABASE_URL="postgresql://postgres:password123@localhost:5432/netipam?schema=public"
   ```
4. Terapkan tabel ke PostgreSQL:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

---

### 3. MySQL / MariaDB
Pilihan populer yang banyak digunakan di berbagai server Linux.
1. Buat database di MySQL:
   ```sql
   CREATE DATABASE netipam CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Ubah `provider` di file `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "mysql"
     url      = env("DATABASE_URL")
   }
   ```
3. Atur string koneksi di file `.env`:
   ```bash
   # Format: mysql://USER:PASSWORD@HOST:PORT/DATABASE
   DATABASE_URL="mysql://root:password123@localhost:3306/netipam"
   ```
4. Terapkan tabel ke MySQL:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

---

## 🚀 Panduan Instalasi & Deployment dengan PM2 di Server VPS Debian

Panduan lengkap ini ditujukan untuk deployment di server **Debian Linux (Debian 11 Bullseye / Debian 12 Bookworm)** menggunakan **PM2 Process Manager** dan arsitektur Fullstack (Frontend React + Backend Express + SQLite & Prisma).

### 1. Persiapan Server VPS Debian

Perbarui paket repository sistem Debian Anda dan pasang dependensi esensial:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git build-essential sqlite3 ca-certificates gnupg
```

### 2. Instalasi Node.js (LTS v20) di Debian

Gunakan NodeSource repository resmi untuk memasang Node.js LTS:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verifikasi instalasi
node -v   # v20.x.x
npm -v    # 10.x.x
```

### 3. Instalasi PM2 secara Global

Pasang PM2 sebagai pengelola proses background di server Debian:
```bash
sudo npm install -g pm2
```

---

### 4. Clone Repositori & Setup Aplikasi

Siapkan direktori aplikasi (contoh di `/var/www/ip-address` atau di home directory `~/apps/jaringan`):

```bash
# Contoh direktori /var/www/ip-address:
sudo mkdir -p /var/www/ip-address
sudo chown -R $USER:$USER /var/www/ip-address
cd /var/www/ip-address

# Clone repositori Anda:
git clone <URL_REPOSITORI_ANDA> .

# Pasang dependensi proyek:
npm install

# Siapkan Prisma Client & migrasi database SQLite:
npx prisma generate
npx prisma db push

# Kompilasi build frontend produksi (menghasilkan folder dist/):
npm run build
```

---

### 5. Menjalankan Aplikasi Menggunakan PM2 (Port 3000)

Aplikasi ini menggunakan arsitektur *unified fullstack* di mana backend Express melayani API sekaligus file statis frontend di port **3000**. File konfigurasi [`ecosystem.config.cjs`](ecosystem.config.cjs) sudah disiapkan.

Jalankan aplikasi dengan PM2:
```bash
pm2 start ecosystem.config.cjs
```

Aplikasi sekarang aktif di: **`http://IP_SERVER_ANDA:3000`**.

---

### 6. Konfigurasi Autostart PM2 Saat Booting Server

Agar aplikasi otomatis berjalan kembali jika server VPS Debian di-reboot:

```bash
# 1. Simpan daftar proses aktif PM2
pm2 save

# 2. Aktifkan service startup systemd
pm2 startup
```
> *Salin dan jalankan baris perintah `sudo env PATH=...` yang muncul di terminal setelah mengetik `pm2 startup`.*

---

### 7. Perintah Pemeliharaan PM2

Daftar perintah yang sering digunakan untuk memantau aplikasi:

```bash
# Melihat status proses
pm2 list
pm2 status

# Melihat log aplikasi secara langsung (real-time)
pm2 logs ip-address

# Melihat penggunaan CPU dan RAM
pm2 monit

# Me-restart aplikasi (misal setelah pull update atau ganti konfigurasi)
pm2 restart ip-address

# Menghentikan aplikasi
pm2 stop ip-address

# Menghapus aplikasi dari PM2
pm2 delete ip-address
```

---

### 8. Alur Pembaruan Aplikasi (Update di VPS)

Jika ada pembaruan kode di repositori Git, jalankan langkah ini di VPS:

```bash
cd /var/www/ip-address
git pull origin main
npm install
npx prisma generate
npx prisma db push
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
