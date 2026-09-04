# NetIPAM - Network & IP Address Management System

Aplikasi manajemen jaringan modern untuk mendata **Grup IP (Subnet / VLAN)** dan melacak alokasi seluruh **IP Address** yang sudah terpakai maupun yang masih tersedia.

Dibangun dengan **React 19 + TypeScript**, **Tailwind CSS**, dan tipografi **Poppins**.

---

## 🚀 Fitur Utama

1. **Manajemen Grup IP (Subnet / VLAN)**:
   - Pendataan nama segmen jaringan, Subnet CIDR (misal: `192.168.10.0/24`), Gateway, VLAN ID, PIC, dan lokasi.
   - Kalkulator subnet otomatis: Network IP, Broadcast IP, Netmask, kapasitas host usable.
   - Indikator kapasitas dan bar visual utilisasi real-time.

2. **Visual IP Matrix (Peta Interaktif Subnet)**:
   - Visualisasi kotak seluruh host IP (seperti phpIPAM & NetBox).
   - Kode warna instan:
     - 🟢 **Bebas (Tersedia)**: IP belum dialokasikan dan siap dipakai.
     - 🔵 **Terpakai (In-Use)**: Sedang digunakan oleh perangkat aktif.
     - 🟡 **Dicadangkan (Reserved)**: Reservasi VIP / kebutuhan khusus.
     - 🟣 **DHCP Pool**: Rentang alokasi otomatis DHCP.
     - 🔵 **Gateway**: Default gateway segmen.
   - Klik langsung pada kotak IP mana saja untuk mengalokasikan atau mengedit data.

3. **Pendataan Alokasi IP Lengkap**:
   - Hostname / Nama Perangkat.
   - Kategori Perangkat (Server, Router, Switch, AP WiFi, PC Workstation, CCTV, Printer, IoT, dll.).
   - MAC Address (dengan validasi format dan tombol salin cepat).
   - PIC / Pengguna dan Departemen.
   - Status Alokasi dan Tanggal Penetapan.
   - Catatan / Dokumentasi port & lokasi.

4. **Alat Bantu Otomasi**:
   - **Cari IP Kosong Otomatis (Next Free IP)**: Memilih IP kosong pertama dalam subnet secara instan dengan satu klik.
   - **Reservasi Rentang (Batch Allocation)**: Alokasi rentang IP sekaligus (misal untuk pool DHCP).
   - **Simulasi Uji Ping (ICMP)**: Diagnostic tool interaktif dengan visual terminal dan latensi ms.

5. **Data & Cadangan**:
   - **Ekspor CSV**: Unduh laporan inventaris IP per grup untuk dibuka di Excel.
   - **Backup & Restore JSON**: Simpan dan pulihkan seluruh konfigurasi kapan saja.
   - **Reset Demo Data**: Muat contoh data konfigurasi kantor, server DMZ, dan sistem CCTV.

---

## 🛠️ Cara Menjalankan

### Menjalankan Server Development:
```bash
npm run dev
```
Akses di browser pada: **`http://localhost:5173`**

### Membuat Build Produksi:
```bash
npm run build
```

---

## 📁 Struktur File Penting
- [`rencana.md`](file:///home/kali/apps/web/jaringan/rencana.md): Dokumen rencana pengembangan dan arsitektur sistem.
- [`src/types/ipam.ts`](file:///home/kali/apps/web/jaringan/src/types/ipam.ts): Interface TypeScript (IPGroup, IPAllocation, DeviceType).
- [`src/utils/ipCalculator.ts`](file:///home/kali/apps/web/jaringan/src/utils/ipCalculator.ts): Logika perhitungan subnet CIDR dan sorting numerik oktet IP.
- [`src/components/IPMatrixGrid.tsx`](file:///home/kali/apps/web/jaringan/src/components/IPMatrixGrid.tsx): Peta grid interaktif seluruh host IP.
- [`src/components/IPTable.tsx`](file:///home/kali/apps/web/jaringan/src/components/IPTable.tsx): Tabel pencarian & filter inventaris IP.
