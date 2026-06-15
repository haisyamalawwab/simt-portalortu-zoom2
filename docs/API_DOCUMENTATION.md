# 📚 SIMT Portal Ortu - REST API Documentation

## 🏗️ System Overview

**Platform:** Next.js 16.1.1 dengan App Router  
**Database:** SQLite dengan Prisma ORM  
**Authentication:** Email-based (Parent) / NIS+Password (Student)  
**Multi-Tenant:** Ya - setiap sekolah memiliki data terpisah  

---

## 🔐 Authentication

### Parent Authentication

#### POST `/api/auth`

Login untuk orang tua/wali menggunakan email yang terdaftar.

**Request Body:**
```json
{
  "email": "parent@example.com"
}
```

**Success Response (200):**
```json
{
  "students": [
    {
      "id": "clxxx123",
      "name": "Ahmad Fauzi",
      "nis": "2024001",
      "classroom": "7A",
      "level": 7,
      "tenant": {
        "name": "MTs Al-Ikhlas",
        "slug": "mts-alikhlas"
      }
    }
  ]
}
```

**Error Responses:**
- `400` - Email wajib diisi
- `404` - Email tidak terdaftar sebagai wali murid

**Notes:**
- Satu email bisa memiliki beberapa anak
- Hanya mengembalikan siswa dengan status `isActive: true`

---

### Student Authentication

#### POST `/api/student-auth`

Login untuk siswa menggunakan NIS dan password.

**Request Body:**
```json
{
  "nis": "2024001",
  "password": "password123"
}
```

**Success Response (200):**
```json
{
  "student": {
    "id": "clxxx123",
    "name": "Ahmad Fauzi",
    "nis": "2024001",
    "nisn": "0123456789",
    "gender": "L",
    "classroom": "7A",
    "level": 7,
    "tenant": {
      "name": "MTs Al-Ikhlas",
      "slug": "mts-alikhlas"
    },
    "birthPlace": "Malang",
    "birthDate": "2010-05-15T00:00:00.000Z",
    "address": "Jl. Soekarno Hatta No. 123",
    "photo": "/uploads/students/photo.jpg"
  }
}
```

**Error Responses:**
- `400` - NIS dan password wajib diisi
- `401` - Password salah
- `403` - Akun siswa belum diaktifkan
- `404` - NIS tidak terdaftar

**Security Notes:**
- ⚠️ MVP: Password disimpan plain text (akan diganti bcrypt)
- Password harus sudah diset oleh admin sekolah
- Hanya siswa aktif yang bisa login

---

## 👨‍👩‍👧 Parent Dashboard API

### GET `/api/dashboard`

Mendapatkan data lengkap siswa untuk Parent Portal.

**Query Parameters:**
- `studentId` (required) - ID siswa
- `gradeType` (optional) - Jenis nilai: `PENGETAHUAN` | `KETERAMPILAN` | `UTS` | `UAS` | `SIKAP` (default: `PENGETAHUAN`)

**Example Request:**
```
GET /api/dashboard?studentId=clxxx123&gradeType=PENGETAHUAN
```

**Success Response (200):**
```json
{
  "student": {
    "id": "clxxx123",
    "name": "Ahmad Fauzi",
    "nis": "2024001",
    "nisn": "0123456789",
    "gender": "L",
    "birthPlace": "Malang",
    "birthDate": "2010-05-15T00:00:00.000Z",
    "address": "Jl. Soekarno Hatta No. 123",
    "photo": "/uploads/students/photo.jpg",
    "fatherName": "Budi Santoso",
    "fatherPhone": "081234567890",
    "motherName": "Siti Aminah",
    "motherPhone": "081234567891",
    "parentEmail": "parent@example.com",
    "classroom": {
      "id": "clyyy456",
      "name": "7A",
      "level": 7,
      "capacity": 30,
      "academicYear": {
        "id": "clzzz789",
        "name": "2024/2025",
        "semester": 1,
        "startDate": "2024-07-15T00:00:00.000Z",
        "endDate": "2025-06-30T00:00:00.000Z",
        "isActive": true
      },
      "waliKelas": {
        "name": "Ustadz Ahmad",
        "phone": "081234567892"
      }
    },
    "tenant": {
      "name": "MTs Al-Ikhlas",
      "slug": "mts-alikhlas",
      "logo": "/uploads/logo.png"
    }
  },
  "attendanceSummary": {
    "hadir": 18,
    "sakit": 1,
    "izin": 0,
    "alpha": 1,
    "total": 20,
    "recent": [
      {
        "id": "claaa111",
        "date": "2025-01-15T00:00:00.000Z",
        "status": "HADIR",
        "timeIn": "07:15:00",
        "timeOut": "14:00:00",
        "notes": null
      }
    ],
    "periodLabel": "Bulan Januari 2025",
    "hasData": true
  },
  "grades": {
    "list": [
      {
        "id": "clbbb222",
        "subjectId": "clccc333",
        "subject": {
          "id": "clccc333",
          "name": "Matematika",
          "code": "MTK",
          "category": "UMUM"
        },
        "type": "PENGETAHUAN",
        "score": 85,
        "kkm": 75,
        "notes": "Baik",
        "teacherId": "clddd444",
        "teacher": {
          "name": "Ustadz Mahmud"
        },
        "createdAt": "2025-01-10T00:00:00.000Z"
      }
    ],
    "average": 82.5,
    "count": 8,
    "activeType": "PENGETAHUAN",
    "availableTypes": ["PENGETAHUAN", "KETERAMPILAN", "UTS"],
    "hasData": true,
    "belowKKMCount": 1,
    "pengetahuanAverage": 82.5,
    "isAllTuntas": false
  },
  "payments": {
    "all": [
      {
        "id": "cleee555",
        "type": "SPP",
        "amount": 250000,
        "month": "Januari",
        "year": 2025,
        "status": "LUNAS",
        "paidAmount": 250000,
        "paymentDate": "2025-01-05T00:00:00.000Z",
        "paymentMethod": "TRANSFER",
        "notes": null
      }
    ],
    "unpaid": [
      {
        "id": "clhhh888",
        "type": "SPP",
        "amount": 250000,
        "month": "Februari",
        "year": 2025,
        "status": "BELUM_BAYAR",
        "dueDate": "2025-02-10T00:00:00.000Z"
      }
    ],
    "totalUnpaid": 250000,
    "totalPaid": 1750000,
    "hasData": true
  },
  "announcements": [
    {
      "id": "cliii999",
      "title": "Libur Semester Ganjil",
      "content": "Libur semester akan dimulai tanggal 15 Juni 2025",
      "category": "AKADEMIK",
      "isPinned": true,
      "publishedAt": "2025-01-10T00:00:00.000Z",
      "expiresAt": null,
      "createdBy": {
        "name": "Admin MTs"
      }
    }
  ]
}
```

**Error Responses:**
- `400` - studentId wajib diisi
- `404` - Siswa tidak ditemukan

**Features:**
- **Smart Attendance Period:** Otomatis menampilkan bulan ini, atau bulan terakhir yang ada data jika bulan ini kosong
- **Grade Type Switching:** Bisa filter berdasarkan jenis nilai
- **Payment Tracking:** Memisahkan lunas dan belum bayar
- **Recent Data:** Menampilkan 10 kehadiran terakhir

---

## 🎓 Student Dashboard API

### GET `/api/student-dashboard`

Mendapatkan data lengkap untuk Student Portal (termasuk data tambahan: jadwal, pelanggaran, prestasi, tahfiz).

**Query Parameters:**
- `studentId` (required) - ID siswa
- `gradeType` (optional) - Jenis nilai (default: `PENGETAHUAN`)

**Example Request:**
```
GET /api/student-dashboard?studentId=clxxx123&gradeType=UTS
```

**Success Response (200):**
```json
{
  "student": { /* sama seperti /api/dashboard */ },
  "attendanceSummary": { /* sama seperti /api/dashboard */ },
  "grades": { /* sama seperti /api/dashboard */ },
  "payments": { /* sama seperti /api/dashboard */ },
  "announcements": [ /* sama seperti /api/dashboard */ ],
  
  "schedules": [
    {
      "id": "cljjj000",
      "dayOfWeek": 1,
      "startPeriod": 1,
      "endPeriod": 2,
      "subject": {
        "id": "clccc333",
        "name": "Matematika",
        "code": "MTK"
      },
      "teacher": {
        "id": "clddd444",
        "name": "Ustadz Mahmud",
        "phone": "081234567893"
      },
      "classroom": {
        "name": "7A"
      }
    }
  ],
  
  "violations": {
    "list": [
      {
        "id": "clkkk111",
        "date": "2025-01-12T00:00:00.000Z",
        "category": "TERLAMBAT",
        "description": "Terlambat masuk kelas 15 menit",
        "points": 5,
        "action": "Peringatan lisan",
        "handledBy": {
          "name": "Ustadz Ahmad"
        }
      }
    ],
    "totalPoints": 5,
    "count": 1
  },
  
  "achievements": {
    "list": [
      {
        "id": "clmmm333",
        "date": "2024-12-20T00:00:00.000Z",
        "title": "Juara 1 Lomba Tahfiz",
        "category": "PRESTASI_AKADEMIK",
        "level": "KOTA",
        "ranking": 1,
        "organizer": "Kemenag Kota Malang",
        "certificateUrl": "/uploads/certificates/cert.pdf",
        "notes": "Hafal 5 Juz"
      }
    ],
    "count": 1
  },
  
  "tahfiz": {
    "totalRecords": 45,
    "ziyadahCount": 25,
    "murajaahCount": 20,
    "averageScore": 88.5,
    "surahMemorized": 12,
    "latestRecords": [
      {
        "id": "clnnn444",
        "date": "2025-01-14T00:00:00.000Z",
        "type": "ZIYADAH",
        "surah": "Al-Baqarah",
        "ayahStart": 1,
        "ayahEnd": 5,
        "score": 90,
        "fluency": "LANCAR",
        "notes": "Makharijul huruf baik",
        "teacher": {
          "name": "Ustadzah Fatimah"
        }
      }
    ]
  }
}
```

**Error Responses:**
- `400` - studentId wajib diisi
- `404` - Siswa tidak ditemukan

**Additional Data:**
- **schedules:** Jadwal pelajaran mingguan
- **violations:** Catatan pelanggaran dan poin pelanggaran
- **achievements:** Prestasi akademik dan non-akademik
- **tahfiz:** Progress hafalan Al-Qur'an (Ziyadah & Murajaah)

---

## 📊 Data Models Reference

### Attendance Status
```typescript
enum AttendanceStatus {
  HADIR    // Hadir tepat waktu
  SAKIT    // Sakit dengan surat keterangan
  IZIN     // Izin dengan surat
  ALPHA    // Tidak hadir tanpa keterangan
}
```

### Grade Types
```typescript
enum GradeType {
  PENGETAHUAN   // Nilai pengetahuan (kognitif)
  KETERAMPILAN  // Nilai keterampilan (psikomotorik)
  UTS           // Ujian Tengah Semester
  UAS           // Ujian Akhir Semester
  SIKAP         // Penilaian sikap (afektif)
  RAPOR         // Nilai rapor akhir
}
```

### Payment Status
```typescript
enum PaymentStatus {
  BELUM_BAYAR   // Belum dibayar
  MENUNGGU      // Menunggu konfirmasi
  LUNAS         // Sudah lunas
  SEBAGIAN      // Dibayar sebagian
}
```

### Payment Types
```typescript
enum PaymentType {
  SPP                 // Sumbangan Pembinaan Pendidikan (bulanan)
  DAFTAR_ULANG        // Biaya daftar ulang
  SERAGAM             // Pembelian seragam
  KEGIATAN            // Biaya kegiatan
  LAIN_LAIN           // Pembayaran lainnya
}
```

### Announcement Categories
```typescript
enum AnnouncementCategory {
  UMUM        // Pengumuman umum
  AKADEMIK    // Terkait akademik
  KEAGAMAAN   // Terkait kegiatan keagamaan
  KEUANGAN    // Terkait pembayaran
  EKSTRAKURIKULER  // Terkait ekskul
}
```

### Violation Categories
```typescript
enum ViolationCategory {
  TERLAMBAT           // Terlambat masuk
  TIDAK_MASUK         // Tidak masuk tanpa keterangan
  PAKAIAN             // Pelanggaran pakaian/seragam
  BERKELAHI           // Berkelahi
  MEROKOK             // Merokok
  MEMBAWA_HP          // Membawa HP tanpa izin
  LAINNYA             // Pelanggaran lainnya
}
```

### Achievement Categories
```typescript
enum AchievementCategory {
  PRESTASI_AKADEMIK     // Akademik (olimpiade, lomba)
  PRESTASI_OLAHRAGA     // Olahraga
  PRESTASI_SENI         // Seni & budaya
  PRESTASI_KEAGAMAAN    // Keagamaan (tahfiz, MTQ)
  LAINNYA               // Lainnya
}
```

### Achievement Levels
```typescript
enum AchievementLevel {
  KELAS          // Tingkat kelas
  SEKOLAH        // Tingkat sekolah
  KECAMATAN      // Tingkat kecamatan
  KABUPATEN_KOTA // Tingkat kabupaten/kota
  PROVINSI       // Tingkat provinsi
  NASIONAL       // Tingkat nasional
  INTERNASIONAL  // Tingkat internasional
}
```

### Tahfiz Types
```typescript
enum TahfizType {
  ZIYADAH   // Hafalan baru
  MURAJAAH  // Mengulang hafalan lama
}
```

### Tahfiz Fluency
```typescript
enum TahfizFluency {
  SANGAT_LANCAR  // 90-100
  LANCAR         // 80-89
  CUKUP_LANCAR   // 70-79
  KURANG_LANCAR  // <70
}
```

---

## 🔄 Data Flow & Business Logic

### 1. Attendance Period Detection

**Smart Logic:**
1. Cek kehadiran bulan ini
2. Jika kosong, cari bulan terakhir yang ada data
3. Return periode label (contoh: "Bulan Januari 2025")

```typescript
// Pseudo-code
if (currentMonthAttendances.length > 0) {
  return currentMonthData
} else {
  lastRecord = findLatestAttendance()
  return lastMonthData with lastRecord.month
}
```

### 2. Grade Calculation

**KKM Checking:**
- Setiap nilai dibandingkan dengan KKM (default: 75)
- `belowKKMCount`: Jumlah mata pelajaran di bawah KKM
- `isAllTuntas`: True jika semua nilai >= KKM

**Average Calculation:**
```typescript
average = sum(all_scores) / total_subjects
```

### 3. Payment Tracking

**Status Logic:**
- `BELUM_BAYAR`: paidAmount = 0
- `SEBAGIAN`: 0 < paidAmount < amount
- `LUNAS`: paidAmount >= amount

**Total Calculation:**
```typescript
totalUnpaid = sum(payments where status != LUNAS)
totalPaid = sum(payments.paidAmount)
```

### 4. Tahfiz Progress

**Surah Memorized:**
- Count distinct surahs from all records
- Filter by type (ZIYADAH for new memorization)

**Average Score:**
```typescript
averageScore = sum(all_scores) / total_records
```

---

## 🔒 Security & Multi-Tenant

### Multi-Tenant Isolation

Setiap query harus menyertakan `tenantId`:

```typescript
const students = await db.student.findMany({
  where: { 
    tenantId: tenant.id,  // ✅ Wajib
    isActive: true 
  }
});
```

### Authentication Middleware (Planned)

```typescript
// TODO: Implement middleware
export async function authMiddleware(request) {
  const token = request.headers.get('Authorization');
  const session = verifyToken(token);
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }
  
  return session;
}
```

### Rate Limiting (Planned)

```typescript
// TODO: Implement rate limiting
const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // max 100 requests per window
});
```

---

## 🚀 Future API Endpoints (Roadmap)

### Student Management
- `POST /api/students` - Create student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Soft delete student
- `POST /api/students/bulk-import` - Import from Excel

### Attendance
- `POST /api/attendance` - Record attendance
- `POST /api/attendance/bulk` - Bulk entry for class
- `PUT /api/attendance/:id` - Update attendance
- `GET /api/attendance/report` - Generate report

### Grades
- `POST /api/grades` - Add grade
- `PUT /api/grades/:id` - Update grade
- `POST /api/grades/bulk` - Bulk entry for subject
- `GET /api/grades/report` - Generate report card

### Payments
- `POST /api/payments` - Record payment
- `PUT /api/payments/:id` - Update payment
- `GET /api/payments/invoice/:id` - Get invoice
- `POST /api/payments/midtrans` - Midtrans webhook

### Announcements
- `POST /api/announcements` - Create announcement
- `PUT /api/announcements/:id` - Update announcement
- `DELETE /api/announcements/:id` - Delete announcement

### Reports
- `GET /api/reports/attendance` - PDF attendance report
- `GET /api/reports/grades` - PDF grade report
- `GET /api/reports/rapor/:studentId` - PDF rapor
- `GET /api/reports/payments` - PDF payment report

### WhatsApp Integration
- `POST /api/whatsapp/send` - Send message
- `POST /api/whatsapp/broadcast` - Broadcast to parents
- `GET /api/whatsapp/status` - Check connection status
- `POST /api/whatsapp/reconnect` - Reconnect session

### File Upload
- `POST /api/upload/photo` - Upload student photo
- `POST /api/upload/certificate` - Upload certificate
- `POST /api/upload/document` - Upload document

---

## 📱 Response Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request |
| 400 | Bad Request | Invalid parameters or missing required fields |
| 401 | Unauthorized | Invalid credentials |
| 403 | Forbidden | Account not activated or insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate entry (e.g., NIS already exists) |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

---

## 🧪 Testing Examples

### Parent Login
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com"}'
```

### Student Login
```bash
curl -X POST http://localhost:3000/api/student-auth \
  -H "Content-Type: application/json" \
  -d '{"nis":"2024001","password":"password123"}'
```

### Get Dashboard Data
```bash
curl "http://localhost:3000/api/dashboard?studentId=clxxx123&gradeType=PENGETAHUAN"
```

### Get Student Dashboard
```bash
curl "http://localhost:3000/api/student-dashboard?studentId=clxxx123"
```

---

## 📝 Notes & Best Practices

### 1. Data Consistency
- Selalu gunakan `isActive: true` filter untuk entity utama
- Soft delete dengan update `isActive: false`
- Include relations seperlunya untuk minimize N+1 queries

### 2. Performance
- Use pagination untuk list endpoint (belum diimplementasi)
- Cache announcement dan tenant data
- Index database untuk query yang sering digunakan

### 3. Security
- ⚠️ **TODO:** Implement bcrypt untuk password hashing
- ⚠️ **TODO:** Add JWT token authentication
- ⚠️ **TODO:** Implement CORS properly
- ⚠️ **TODO:** Add request validation middleware
- ⚠️ **TODO:** Sanitize user inputs

### 4. Error Handling
- Consistent error response format
- Log errors untuk debugging
- User-friendly error messages dalam Bahasa Indonesia

### 5. Documentation
- Update dokumentasi setiap ada perubahan API
- Include example requests dan responses
- Document breaking changes

---

## 🔗 Related Resources

- [Prisma Schema](../prisma/schema.prisma)
- [Laravel Reference Implementation](../download/simt-laravel/)
- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)

---

## 📧 Support

Untuk pertanyaan atau issue, hubungi tim development atau buat issue di repository.

**Version:** 1.0.0  
**Last Updated:** Juni 2026  
**Status:** MVP - Active Development
