# Rencana Pengembangan Aplikasi: NetIPAM (IP Address Management)

Aplikasi berbasis web modern untuk mengelola Grup IP (Subnet / VLAN) dan mendata secara detail alokasi penggunaan IP Address di setiap grup jaringan.

---

## 1. Spesifikasi & Tech Stack
- **Framework**: React 19 (TypeScript) + Vite (Ultra-fast build & HMR)
- **Styling**: Tailwind CSS (Modern, responsif, clean enterprise UI)
- **Tipografi**: Font **Poppins** (Google Fonts: 300, 400, 500, 600, 700)
- **Icons**: Lucide Icons (Icon set tajam untuk jaringan & infrastruktur IT)
- **Penyimpanan**: LocalStorage dengan sinkronisasi otomatis + Dukungan Ekspor/Impor (JSON & CSV)
- **Kalkulator Jaringan**: Modul utilitas perhitungan CIDR, Netmask, Broadcast, Total Usable IP, dan konversi integer IP untuk sorting akurat.

---

## 2. Fitur Utama

### A. Manajemen Grup IP (Subnet / VLAN)
1. **Pendataan Grup IP**:
   - Nama Grup (contoh: *LAN Kantor Lt. 1*, *Server Farm DMZ*, *WiFi Tamu*, *CCTV & IoT*)
   - Subnet CIDR (contoh: `192.168.1.0/24`, `10.10.20.0/24`, `172.16.1.0/28`)
   - Gateway IP (contoh: `192.168.1.1`)
   - VLAN ID (opsional, contoh: `10`, `20`, `100`)
   - Deskripsi, Lokasi, dan Penanggung Jawab (PIC)
   - Tag warna visual untuk identifikasi cepat
2. **Kalkulator Subnet Otomatis**:
   - Perhitungan otomatis Network Address, Broadcast Address, Subnet Mask
   - Kapasitas total IP dan IP yang dapat dipakai (Usable Host Range)
   - Kalkulasi real-time jumlah IP terpakai (*Used*), dicadangkan (*Reserved*), DHCP pool, dan sisa IP bebas (*Available*)
   - Indikator kapasitas bar visual (% utilisasi dengan peringatan jika >80%)

### B. Pendataan Alokasi IP dalam Setiap Grup
1. **Visual IP Matrix (Peta Grid Interaktif)**:
   - Tampilan visual kotak seluruh host IP (misal: .1 s/d .254) seperti pada aplikasi IPAM enterprise (phpIPAM / NetBox)
   - Indikator status warna:
     - 🟢 **Available (Kosong / Bebas)**: IP belum digunakan dan siap dialokasikan
     - 🔴 **Used (Terpakai)**: Sudah digunakan oleh perangkat aktif
     - 🟡 **Reserved (Dicadangkan)**: Disiapkan untuk kebutuhan tertentu/VIP
     - 🟣 **DHCP Pool**: Rentang alokasi otomatis DHCP router
     - 🔵 **Gateway / Network / Broadcast**: Alokasi khusus sistem
   - Interaksi satu klik pada kotak IP untuk langsung melihat detail atau mengalokasikan IP baru.
2. **Detail Atribut Setiap IP**:
   - Alamat IP (contoh: `192.168.1.15`)
   - Nama Host / Perangkat (contoh: `srv-db-prod-01`, `printer-finance`, `ap-lantai-2`)
   - Kategori Perangkat (Server, Router, Switch, Access Point, PC/Laptop, CCTV, Printer, Smartphone, IoT)
   - MAC Address (dengan validasi format `AA:BB:CC:DD:EE:FF`)
   - Pengguna / Departemen / PIC (contoh: `Ahmad - Tim Finance`)
   - Status: *Used*, *Reserved*, *DHCP*, *Available*
   - Tanggal dialokasikan / diperbarui
   - Keterangan / Catatan tambahan
3. **Tabel Data & Fitur Pencarian Lengkap**:
   - Pencarian instan berdasarkan IP, Hostname, MAC Address, maupun Pengguna
   - Filter cepat berdasarkan status (Semua, Terpakai, Bebas, Dicadangkan, DHCP)
   - Filter berdasarkan jenis perangkat
   - Pengurutan numerik oktet IP yang benar (bukan sekadar urutan alfabetis teks)

### C. Fitur Tambahan & Otomasi
1. **Fitur "Cari IP Kosong Otomatis" (Next Available IP)**:
   - Tombol satu klik untuk otomatis memilih IP pertama yang masih kosong di dalam grup.
2. **Batch Allocation / Alokasi Rentang (Range)**:
   - Kemudahan mencadangkan sekaligus rentang IP (misal: .100 s/d .150 untuk DHCP pool atau kebutuhan khusus).
   - Validasi bentrok IP (mencegah duplikasi IP di grup yang sama).
3. **Simulasi Cek Status / Ping Ping Tool**:
   - Fitur simulasi pengecekan koneksi IP dengan waktu respon / latency (Online/Offline).
4. **Ekspor & Impor Data**:
   - Ekspor laporan ke format **CSV** (dapat langsung dibuka di Excel).
   - Backup & Restore seluruh database dalam format **JSON**.
   - Tombol "Muat Data Contoh" (Demo Data) untuk eksplorasi langsung.

---

## 3. Struktur Direktori Proyek
```
/home/kali/apps/web/jaringan/
├── index.html                  # HTML entry point dengan link Google Fonts Poppins
├── package.json                # Dependencies: React 19, Tailwind CSS, Lucide-React, Vite
├── vite.config.ts              # Konfigurasi Vite
├── tailwind.config.js          # Konfigurasi Tailwind & Font Poppins
├── postcss.config.js           # Konfigurasi PostCSS
├── src/
│   ├── main.tsx                # React Root Render
│   ├── App.tsx                 # Layout & Navigasi Utama
│   ├── index.css               # Global CSS + Poppins font utility
│   ├── types/
│   │   └── ipam.ts             # Interface TypeScript (IPGroup, IPAllocation, DeviceType, dll.)
│   ├── utils/
│   │   ├── ipCalculator.ts     # Logika kalkulasi CIDR, Subnet, Usable IP, Octet Sorting
│   │   ├── storage.ts          # Penyimpanan LocalStorage & inisialisasi Demo Data
│   │   └── exportImport.ts     # Parser CSV & Export/Import JSON
│   └── components/
│       ├── Header.tsx          # Topbar navigasi, quick search, dan export/import
│       ├── DashboardStats.tsx  # Kartu ringkasan total IP, utilisasi, dan sebaran perangkat
│       ├── GroupList.tsx       # Sidebar / Daftar Grup IP dengan indikator utilisasi
│       ├── GroupModal.tsx      # Modal tambah/edit Grup IP baru
│       ├── IPMatrixGrid.tsx    # Visual Grid peta seluruh IP dalam Subnet
│       ├── IPTable.tsx         # Tabel daftar IP dengan filter & aksi
│       ├── IPAllocationModal.tsx # Modal form tambah/edit pemakaian IP
│       ├── BatchReserveModal.tsx # Modal reservasi rentang IP sekaligus (DHCP/Range)
│       └── PingSimulatorModal.tsx # Modal simulasi uji ping perangkat
```

---

## 4. Rencana Tahapan Eksekusi
1. **Fase 1**: Penyiapan Proyek & Konfigurasi (Vite, React, Tailwind CSS, Font Poppins).
2. **Fase 2**: Definisi Type Data & Algoritma Kalkulasi IP (CIDR, IP-to-Integer, usable hosts range).
3. **Fase 3**: Implementasi Modul Storage & Demo Data lengkap (Grup LAN, Server DMZ, CCTV).
4. **Fase 4**: Pembuatan Komponen Tampilan (Dashboard, Sidebar Grup IP, Modal Tambah Grup).
5. **Fase 5**: Pembuatan Visual IP Matrix Grid & Tabel Alokasi IP (dengan pencarian IP kosong otomatis).
6. **Fase 6**: Fitur Pendukung (Batch Reserve, Ping Tool, Ekspor CSV & Backup/Restore JSON).
7. **Fase 7**: Build testing, verifikasi fungsionalitas, dan dokumentasi cara menjalankan.
