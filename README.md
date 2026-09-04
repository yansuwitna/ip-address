# NetIPAM - Network & IP Address Management System

Aplikasi manajemen jaringan modern, unik, dan cerah untuk mendata **Grup IP (Subnet / VLAN)** serta melacak alokasi seluruh **IP Address** yang sudah terpakai maupun yang masih tersedia.

Dibangun dengan **React 19 + TypeScript**, **Tailwind CSS**, dan tipografi **Poppins**.

---

## 🔐 Autentikasi & Akun Login

Aplikasi ini dilindungi oleh gerbang login (portal autentikasi). Data jaringan hanya dapat dilihat dan dikelola setelah pengguna berhasil login.

| Akun | Username | Password | Hak Akses |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | Akses penuh manajemen grup, alokasi IP, backup/restore |
| **Operator** | `operator` | `operator123` | Akses operasional pemantauan dan update IP |

> *Tersedia tombol **1-Klik Masuk Demo** di halaman login untuk kemudahan pengujian.*

---

## ☀️ Tampilan Modern, Unik & Cerah (Bright Theme)

- **Desain Cerah & Segar**: Latar belakang bersih (`bg-slate-50`), kartu putih modern (`bg-white shadow-xs rounded-2xl`), dan border halus (`border-slate-200/90`).
- **Indikator Status Jaringan Visual**:
  - 🟢 **Bebas (Tersedia)**: IP belum dialokasikan dan siap dipakai.
  - 🔵 **Terpakai (In-Use)**: Sedang digunakan oleh perangkat aktif.
  - 🟡 **Dicadangkan (Reserved)**: Reservasi khusus / VIP.
  - 🟣 **DHCP Pool**: Rentang alokasi otomatis DHCP.
  - 🔵 **Gateway**: Default gateway segmen jaringan.
- **Tipografi Poppins**: Tipografi Google Fonts Poppins yang ramah mata dan tajam.

---

## 🚀 Fitur Utama

1. **Portal Login & Proteksi Data**:
   - Sesi login tersimpan di penyimpanan browser (`localStorage`).
   - Widget profil pengguna di navbar atas beserta tombol Keluar (*Logout*).
2. **Manajemen Grup IP (Subnet / VLAN)**:
   - Pendataan nama segmen jaringan, Subnet CIDR (misal: `192.168.10.0/24`), Gateway, VLAN ID, PIC, dan lokasi.
   - Kalkulator subnet otomatis: Network IP, Broadcast IP, Netmask, kapasitas host usable.
   - Bar visual utilisasi real-time (% kapasitas grup).
3. **Visual IP Matrix (Peta Interaktif Subnet)**:
   - Visualisasi kotak seluruh host IP (.1 s/d .254) seperti pada aplikasi enterprise IPAM.
   - Interaksi hover detail perangkat dan klik langsung untuk alokasi baru.
4. **Pendataan Alokasi IP Lengkap**:
   - Hostname, Tipe Perangkat (Server, Router, Switch, AP, PC, CCTV, Printer, IoT), MAC Address, PIC, dan Status.
   - Tombol salin MAC address satu klik.
5. **Alat Bantu Otomasi**:
   - **Cari IP Kosong Otomatis (*Next Free IP*)**: Memilih IP pertama yang belum terpakai dalam subnet secara otomatis.
   - **Reservasi Rentang (*Batch Reserve*)**: Alokasi rentang IP sekaligus (misal pool DHCP).
   - **Simulasi Uji Ping (ICMP)**: Terminal diagnostik interaktif bergaya Unix dengan latensi ms.
6. **Ekspor & Cadangan**:
   - **Ekspor CSV**: Unduh laporan inventaris IP per grup untuk Excel.
   - **Backup & Restore JSON**: Simpan dan pulihkan database secara instan.

---

## 🛠️ Cara Menjalankan

### Menjalankan Server Development:
```bash
npm run dev
```
Buka browser di: **`http://localhost:5173`**

### Membuat Build Produksi:
```bash
npm run build
```
# ip-address
