# Panduan Penggunaan Website Portfolio Murpyyandi

## Fitur Website

Website portfolio ini memiliki fitur-fitur berikut:

### 1. Font Profesional
Website menggunakan kombinasi font profesional:
- **Poppins** - untuk heading dan judul
- **Plus Jakarta Sans** - untuk body text dan konten

### 2. Logo MM Elegan
Logo MM dibuat menggunakan SVG dengan desain monogram yang elegan dan profesional dengan efek gradient dan glow.

### 3. Download CV
Tombol download CV akan berfungsi setelah Anda mengupload file CV melalui Admin Panel.

### 4. Section Proyek Disembunyikan
Section Proyek & Inisiatif telah disembunyikan sesuai permintaan.

### 5. Admin Panel
Admin Panel memungkinkan Anda untuk:
- Menambahkan tugas baru dengan file PDF dan PPT
- Mengelola sertifikat
- Upload CV

### 6. Fitur Tugas
- Filter tugas berdasarkan kategori
- Detail tugas dengan download file
- Status tugas (Selesai, Dalam Proses, Menunggu)

### 7. Fitur Sertifikat
- Sertifikat bisa diklik untuk melihat detail
- Download file sertifikat

---

## Cara Menggunakan Admin Panel

### Akses Admin Panel

1. Klik ikon **gear** (pengaturan) di pojok kanan bawah layar
2. Masukkan password: `Siapa123apa@@1#`
3. Klik tombol "Login"

### Menambahkan Tugas Baru

1. Di Admin Panel, pastikan tab "Kelola Tugas" aktif
2. Isi form "Tambah Tugas Baru":
   - **Judul Tugas**: Nama tugas
   - **Mata Kuliah**: Nama mata kuliah
   - **Kategori**: Pilih kategori (Pemrograman, Basis Data, Jaringan, Multimedia)
   - **Status**: Pilih status (Selesai, Dalam Proses, Menunggu)
   - **Deskripsi**: Deskripsi tugas
   - **File Laporan PDF**: Upload file PDF (opsional)
   - **File Presentasi PPT**: Upload file PPT (opsional)
3. Klik tombol "Tambah Tugas"

### Menambahkan Sertifikat Baru

1. Klik tab "Kelola Sertifikat"
2. Isi form "Tambah Sertifikat Baru":
   - **Judul Sertifikat**: Nama sertifikat
   - **Penerbit**: Nama institusi penerbit
   - **Tahun**: Tahun sertifikat diterbitkan
   - **Ikon**: Pilih ikon yang sesuai
   - **File Sertifikat**: Upload file PDF atau gambar (opsional)
3. Klik tombol "Tambah Sertifikat"

### Upload CV

1. Klik tab "Upload CV"
2. Pilih file CV dalam format PDF
3. Klik tombol "Upload CV"
4. Sekarang tombol "Download CV" di halaman CV akan berfungsi

### Logout

Klik tombol "Logout" untuk keluar dari Admin Panel.

---

## Catatan Penting

### Password Admin
- Password default: `Siapa123apa@@1#`
- **PENTING**: Untuk keamanan, sebaiknya ganti password di file `script.js` pada bagian `const ADMIN_PASSWORD = 'Siapa123apa@@1#';`

### Penyimpanan Data
- Semua data (tugas, sertifikat, CV) disimpan di browser menggunakan localStorage
- Data akan tetap ada meskipun browser ditutup
- Untuk menghapus semua data, clear browser localStorage

### File Upload
- File yang diupload dikonversi ke base64 dan disimpan di localStorage
- Ukuran file yang terlalu besar mungkin tidak bisa disimpan
- Disarankan untuk mengupload file dengan ukuran maksimal 5MB

---

## Struktur Folder

```
website/
├── index.html          # Halaman utama
├── styles.css          # File CSS
├── script.js           # File JavaScript
├── PANDUAN.md          # File panduan ini
└── uploads/            # Folder untuk upload file
    ├── tasks/          # Folder tugas
    ├── certificates/   # Folder sertifikat
    └── cv/             # Folder CV
```

---

## Troubleshooting

### Data tidak tersimpan
- Pastikan browser mendukung localStorage
- Cek apakah mode private/incognito aktif (localStorage tidak berfungsi di mode private)

### File tidak bisa diupload
- Periksa ukuran file (maksimal 5MB)
- Pastikan format file sesuai

### Admin Panel tidak bisa dibuka
- Pastikan JavaScript aktif di browser
- Cek console browser untuk error

---

## Kontak

Jika ada pertanyaan atau masalah, silakan hubungi:
- Email: murpyyandimuslih@gmail.com

---

**Dibuat dengan oleh Murpyyandi Muslih**
