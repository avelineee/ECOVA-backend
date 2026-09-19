# ♻️ ECOVA Backend

> **Eco Collection, Value & Action**  
> *Turn Waste Into Value.*

ECOVA Backend adalah RESTful API untuk **ECOVA (Eco Collection, Value & Action)**, sebuah aplikasi Bank Sampah Digital & Daur Ulang yang membantu proses pengelolaan sampah, penyetoran, perhitungan poin, penukaran hadiah, serta pengelolaan data bank sampah secara terintegrasi.

Backend ini dikembangkan menggunakan **NestJS, TypeScript, Prisma ORM, dan PostgreSQL (Supabase)** sebagai bagian dari project **Uji Kompetensi Keahlian (UKK) RPL 2026/2027**.

---

## 📖 Tentang ECOVA

ECOVA merupakan singkatan dari **Eco Collection, Value & Action**.

Nama ini menggambarkan proses utama aplikasi:

- **Eco Collection** — mengumpulkan dan mengelola sampah yang dapat didaur ulang.
- **Value** — mengubah sampah menjadi nilai berupa poin.
- **Action** — mendorong aksi nyata dalam menjaga lingkungan.

ECOVA memiliki dua role utama:

### 👤 Nasabah

Nasabah dapat melakukan registrasi, login, melihat kategori sampah, mengajukan penyetoran, memilih metode antar atau jemput, melihat histori transaksi, memperoleh poin dari hasil verifikasi sampah, serta menukarkan poin dengan hadiah.

### 🛠️ Admin Bank Sampah

Admin bertugas mengelola nasabah, kategori sampah, hadiah, jadwal penjemputan, memverifikasi penyetoran dan hasil timbang, mengelola transaksi penukaran poin, serta melihat dashboard dan rekapitulasi bank sampah.

---

## 🚀 Tech Stack

| Technology | Usage |
| --- | --- |
| **NestJS** | Backend Framework |
| **TypeScript** | Programming Language |
| **Prisma ORM** | Database ORM |
| **PostgreSQL** | Relational Database |
| **Supabase** | PostgreSQL Database Hosting |
| **JWT** | Authentication |
| **bcrypt** | Password Hashing |
| **Swagger** | API Documentation & Testing |
| **class-validator** | Request Validation |
| **Multer** | Local File Upload |

---

## ✨ Backend Features

### 🔐 Authentication & Authorization

- Register Nasabah
- Register Admin / Unit Bank Sampah
- Login Nasabah dan Admin
- JWT Authentication
- Role-based authorization
- Password hashing menggunakan bcrypt
- Get authenticated user profile
- Update profile
- Upload profile photo

Role yang digunakan:

```text
admin_bank
nasabah
```

---

### 👥 Nasabah Management

Admin dapat:

- Melihat seluruh nasabah
- Melihat detail nasabah
- Menambahkan nasabah
- Memperbarui data nasabah
- Menghapus nasabah sesuai aturan transaksi
- Melihat saldo poin nasabah

Saldo poin tidak diedit secara manual karena perubahan saldo berasal dari transaksi penyetoran dan penukaran poin.

---

### ♻️ Waste Category Management

Admin dapat melakukan CRUD kategori sampah.

Setiap kategori memiliki informasi seperti:

- Nama kategori
- Jenis sampah
- Harga per kilogram
- Poin per kilogram
- Foto kategori

Jenis sampah:

```text
plastik
kertas
logam
kaca
```

---

### 📦 Waste Deposit

Nasabah dapat mengajukan penyetoran satu atau beberapa jenis sampah dalam satu transaksi.

Flow status penyetoran:

```text
belum_dikonfirmasi
        ↓
     diproses
        ↓
      selesai
```

Pengajuan juga dapat berubah menjadi:

```text
ditolak
```

Berat yang dimasukkan Nasabah merupakan **estimasi awal**.

Ketika sampah diproses, Admin melakukan penimbangan ulang. **Berat hasil verifikasi Admin menjadi dasar perhitungan poin final.**

Contoh:

```text
Estimasi Nasabah : 4 kg
Poin / kg        : 15 poin

Hasil Timbang    : 3.7 kg

Poin Final:
3.7 × 15 = 55.5 poin
```

Setelah transaksi berhasil diselesaikan, poin final akan ditambahkan ke saldo poin Nasabah.

---

## 🚚 Deposit Method

ECOVA mendukung dua metode penyetoran:

### 🏦 Antar

Nasabah mengantarkan sampah secara langsung ke Bank Sampah ECOVA.

Informasi operasional yang dapat ditampilkan:

- Nama unit
- Alamat bank sampah
- Nomor telepon
- Hari operasional
- Jam buka
- Jam tutup

### 🚚 Jemput

Nasabah dapat meminta sampah dijemput dengan:

- Memilih jadwal penjemputan yang tersedia
- Mengisi alamat penjemputan
- Melihat perkembangan status penjemputan

Tracking penjemputan:

```text
menunggu
   ↓
menuju_lokasi
   ↓
sudah_diambil
   ↓
selesai
```

Status penjemputan dan status transaksi penyetoran dikelola secara terpisah.

---

## 📅 Pickup Schedule Management

Admin dapat:

- Menambahkan jadwal penjemputan
- Melihat jadwal
- Memperbarui jadwal
- Mengaktifkan / menonaktifkan jadwal
- Menghapus jadwal yang belum digunakan

Nasabah hanya dapat memilih jadwal penjemputan yang masih aktif dan tersedia.

---

## 🎁 Reward Management

Admin dapat melakukan CRUD hadiah yang dapat ditukarkan oleh Nasabah.

Informasi hadiah meliputi:

- Nama hadiah
- Poin yang dibutuhkan
- Stok
- Foto hadiah

Nasabah dapat melihat katalog hadiah dan menukarkan saldo poin yang dimiliki.

---

## 💰 Point Redemption

Flow penukaran poin:

```text
Nasabah memilih hadiah
        ↓
Validasi saldo poin
        ↓
Poin dikurangi
        ↓
Penukaran dibuat
        ↓
diproses
        ↓
Admin memproses
        ↓
selesai
```

Nasabah dapat melihat histori penukaran dan mencetak nota transaksi.

Admin dapat melihat seluruh transaksi penukaran serta memperbarui statusnya.

---

## 🧾 Transaction Receipt

Backend menyediakan data nota untuk:

- Nota penyetoran sampah
- Nota penukaran poin

Nota dapat diakses sesuai role dan kepemilikan transaksi.

---

## 📊 Dashboard

### Nasabah Dashboard

Dashboard Nasabah menyediakan informasi seperti:

- Saldo poin
- Total sampah yang berhasil disetor
- Pemasukan poin
- Pengeluaran poin
- Transaksi setoran terakhir
- Transaksi penukaran terakhir

### Admin Dashboard

Dashboard Admin menyediakan statistik seperti:

- Total nasabah
- Total kategori sampah
- Total hadiah
- Total transaksi setoran
- Total transaksi penukaran
- Total sampah terkumpul
- Total saldo poin
- Total poin yang diterbitkan

ECOVA juga menyediakan statistik publik untuk landing page yang dapat diakses tanpa autentikasi.

---

## 📈 Monthly Recap

Admin dapat melihat rekapitulasi berdasarkan bulan yang mencakup:

- Total sampah dalam kilogram
- Total sampah dalam ton
- Estimasi pembayaran
- Total poin diterbitkan
- Breakdown berdasarkan jenis sampah
- Total transaksi penukaran
- Total poin yang digunakan

Jenis breakdown:

```text
Plastik
Kertas
Logam
Kaca
```

---

## 🗄️ Main Database Entities

Database ECOVA terdiri dari beberapa entitas utama:

```text
User
│
├── Nasabah
│     │
│     └── SetorSampah
│           │
│           ├── DetailSetor
│           ├── Penjemputan
│           └── PenukaranPoin
│
└── AdminBank
      │
      └── SetorSampah

KategoriSampah
      │
      └── DetailSetor

Hadiah
      │
      └── PenukaranPoin

JadwalPenjemputan
      │
      └── Penjemputan
```

Database menggunakan **PostgreSQL** dengan **Prisma ORM**.

---

## 📂 Project Structure

```text
ecova-backend/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── src/
│   ├── auth/
│   ├── users/
│   ├── kategori-sampah/
│   ├── setor-sampah/
│   ├── hadiah/
│   ├── penukaran-poin/
│   ├── jadwal-penjemputan/
│   ├── rekapitulasi/
│   ├── dashboard/
│   ├── prisma/
│   ├── seed/
│   ├── app.module.ts
│   └── main.ts
│
├── test/
├── .gitignore
├── nest-cli.json
├── package.json
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone Repository

```bash
git clone <repository-url>
cd ecova-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Buat file:

```text
.env
```

Kemudian konfigurasi environment yang diperlukan, misalnya:

```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
```

> Jangan commit file `.env` ke repository.

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Database Migration

Untuk development:

```bash
npx prisma migrate dev
```

### 6. Start Development Server

```bash
npm run start:dev
```

Backend akan berjalan secara default pada:

```text
http://localhost:3000
```

---

## 📚 API Documentation

Dokumentasi REST API tersedia melalui **Swagger UI** setelah backend dijalankan.

```text
http://localhost:3000/api
```

Swagger dapat digunakan untuk:

- Melihat seluruh endpoint
- Melihat request body
- Melihat response API
- Menguji endpoint
- Menguji JWT authentication

Untuk endpoint protected, gunakan:

```text
Authorization: Bearer <access_token>
```

---

## 🔐 Security

ECOVA Backend menerapkan beberapa mekanisme keamanan:

- JWT Authentication
- Role-Based Access Control
- Password hashing menggunakan bcrypt
- DTO validation
- Request validation menggunakan `ValidationPipe`
- Protected Admin endpoints
- Transaction ownership validation
- File type validation untuk upload
- File size validation

---

## 📤 File Upload

Beberapa data ECOVA mendukung upload gambar, seperti:

```text
Profile
Kategori Sampah
Hadiah
```

File disimpan secara lokal pada backend melalui folder `uploads`.

Folder upload tidak disimpan ke repository karena merupakan runtime/user-generated data.

---

## 🔄 API Response Format

Response sukses menggunakan struktur:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Request berhasil diproses",
  "data": {}
}
```

Contoh error:

```json
{
  "statusCode": 400,
  "success": false,
  "message": "Request tidak valid"
}
```

---

## 🧪 API Testing

API dapat diuji menggunakan:

- Swagger UI
- Postman

Sebelum menguji endpoint protected:

1. Login sebagai Nasabah atau Admin.
2. Salin `access_token`.
3. Gunakan token sebagai Bearer Token.
4. Jalankan endpoint sesuai role.

---

## 🌱 ECOVA Philosophy

ECOVA dirancang dengan konsep sederhana:

```text
COLLECT
   ↓
VERIFY
   ↓
VALUE
   ↓
REWARD
   ↓
ACTION
```

Sampah yang dikumpulkan tidak hanya dicatat, tetapi diverifikasi dan dikonversi menjadi nilai berupa poin sehingga dapat mendorong partisipasi masyarakat dalam pengelolaan sampah yang lebih bertanggung jawab.

---

## 👩‍💻 Developer

**Aveline Voleta Wardani**  
Software Engineering Student  
SMK Telkom Malang

**Project:** Uji Kompetensi Keahlian RPL 2026/2027  
**Application:** ECOVA — Eco Collection, Value & Action

---

<p align="center">
  <b>ECOVA — Eco Collection, Value & Action</b><br>
  <i>Turn Waste Into Value.</i> ♻️
</p>
