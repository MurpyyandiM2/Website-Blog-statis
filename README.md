# 🚀 Murpyyandi Muslih - Portfolio Website

Website portfolio statis personal untuk mahasiswa Teknik Informatika dengan fitur Admin Panel, PDF Viewer, dan manajemen konten menggunakan LocalStorage.

![Portfolio Preview](https://img.shields.io/badge/Portfolio-Live-brightgreen)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

## ✨ Fitur Utama

### 🎨 Desain Modern
- **Dark/Light Theme** - Toggle tema dengan transisi smooth
- **Particle Background** - Animasi partikel interaktif
- **Typing Effect** - Efek mengetik pada hero section
- **Responsive Design** - Mobile-first, fully responsive
- **Professional Fonts** - Poppins & Plus Jakarta Sans

### 📄 PDF Viewer Built-in
- View PDF langsung di browser tanpa download
- Zoom in/out, navigasi halaman
- Download PDF yang sedang dilihat
- Powered by PDF.js

### 🔐 Admin Panel
- **Password Protected** - Akses terbatas dengan password
- **Manajemen Tugas** - CRUD tugas dengan kategori & status
- **Manajemen Sertifikat** - Upload & kelola sertifikat
- **Upload CV** - CV dapat didownload pengunjung
- **LocalStorage** - Data tersimpan di browser

### 📱 Section Lengkap
- **Hero** - Introduction dengan statistik dinamis
- **CV/Resume** - Riwayat pendidikan, skill, pengalaman
- **Sertifikat** - Gallery sertifikat dengan preview
- **Tugas** - Arsip akademik dengan filter kategori
- **Kontak** - Form kontak & social links

## 🛠️ Teknologi

| Teknologi | Kegunaan |
|-----------|----------|
| HTML5 | Struktur semantic markup |
| CSS3 | Styling, animation, responsive |
| Vanilla JavaScript | Logic & interaktivitas |
| PDF.js | Render PDF di browser |
| LocalStorage | Penyimpanan data client-side |
| Font Awesome | Icon library |

## 📁 Struktur File
portfolio-murpyyandi/
├── 📄 index.html          # Halaman utama (single page)
├── 📄 styles.css          # Styling & responsive design
├── 📄 script.js           # Logic, admin panel, PDF viewer
├── 📄 PANDUAN.md          # Panduan penggunaan (Bahasa Indonesia)
└── 📄 README.md           # File ini
plain
Copy

## 🚀 Cara Menggunakan

### 1. Clone/Download
```bash
git clone https://github.com/username/portfolio-murpyyandi.git
cd portfolio-murpyyandi

2. Buka di Browser
bash
Copy
# Cukup buka index.html di browser
open index.html

# Atau gunakan live server
npx live-server

3. Akses Admin Panel
Klik ikon gear (⚙️) di pojok kanan bawah
Password default: Siapa123apa@@1#
Kelola tugas, sertifikat, dan CV

⚙️ Konfigurasi
Ganti Password Admin
Edit file script.js:
JavaScript
Copy
const ADMIN_PASSWORD = 'password-baru-anda';
Kustomisasi Data
Semua data disimpan di localStorage dengan keys:
murpyyandi_tasks - Data tugas
murpyyandi_certificates - Data sertifikat
murpyyandi_cv - Data CV
theme - Preferensi tema
admin_session - Session login admin

📸 Screenshot
Table
Section	Deskripsi
Hero	Introduction dengan animasi typing & particle background
CV	Timeline pendidikan, skill bars, download CV
Sertifikat	Grid sertifikat dengan icon dan detail modal
Tugas	Card-based tasks dengan filter & status
Admin Panel	Modal dengan tab navigasi CRUD
🔒 Keamanan
⚠️ Penting: Website ini menggunakan client-side storage (LocalStorage)
Data tersimpan di browser pengguna
Tidak ada backend/database server
Password admin visible di source code (JavaScript)
Untuk production dengan data sensitif, gunakan backend authentication

🌐 Deployment
GitHub Pages
Push ke repository GitHub
Settings → Pages → Source: Deploy from branch
Pilih branch main dan folder / (root)
Website live di https://username.github.io/repo-name
Netlify/Vercel
Drag & drop folder project ke dashboard
Auto deploy dengan custom domain
📝 Changelog
v1.0.0
✅ Initial release
✅ Admin Panel dengan autentikasi
✅ PDF Viewer integrasi
✅ Dark/Light theme toggle
✅ Responsive mobile design
✅ Particle background animation
🤝 Kontribusi
Project ini untuk personal use, namun terbuka untuk:
Fork dan modifikasi
Bug reports via Issues
Feature requests

📧 Kontak
Email: murpyyandimuslih@gmail.com
GitHub: @MurpyyandiM2
LinkedIn: Murpyyandi Muslih
WhatsApp: +62 812-2332-6230
<p align="center">
  Made with ❤️ by <strong>Murpyyandi Muslih</strong><br>
  <em>Mahasiswa Teknik Informatika - IBI Kosgoro 1957</em>
</p>
