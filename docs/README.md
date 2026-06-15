# 📚 SIMT Portal Ortu - Documentation

Selamat datang di dokumentasi lengkap SIMT (Sistem Informasi Manajemen Terpadu) Portal Orang Tua dan Siswa.

## 📋 Daftar Dokumentasi

### 1. [API Documentation](./API_DOCUMENTATION.md)
Dokumentasi lengkap REST API endpoints, request/response format, dan contoh penggunaan.

**Isi:**
- Authentication (Parent & Student login)
- Dashboard endpoints
- Data models & enums
- Error handling
- Security guidelines
- Future endpoints roadmap

**Untuk siapa:**
- Frontend developers
- Mobile app developers
- Third-party integrators
- QA testers

---

### 2. [OpenAPI Specification](./openapi.yaml)
Spesifikasi OpenAPI 3.0 yang bisa digunakan untuk:
- Generate API client code
- Test API dengan Swagger UI/Postman
- Validate requests/responses
- Auto-generate documentation

**Cara menggunakan:**

#### Swagger UI (Online)
```bash
# Copy isi openapi.yaml
# Paste di https://editor.swagger.io/
```

#### Postman
```bash
# Import file openapi.yaml ke Postman
# Collection akan otomatis terbuat
```

#### Generate TypeScript Client
```bash
npm install -g @openapitools/openapi-generator-cli
openapi-generator-cli generate -i docs/openapi.yaml -g typescript-axios -o src/api-client
```

---

### 3. [Data Flow Documentation](./DATA_FLOW.md)
Dokumentasi flow data, sequence diagrams, dan arsitektur sistem.

**Isi:**
- Authentication flow (Parent & Student)
- Dashboard data loading
- Multi-tenant architecture
- Database optimization patterns
- Notification flow (planned)
- Security validation flow
- Caching strategy

**Untuk siapa:**
- System architects
- Backend developers
- DevOps engineers
- Technical leads

---

## 🚀 Quick Start

### 1. Setup Development Environment

```bash
# Clone repository
git clone <repo-url>
cd simt-portalortu

# Install dependencies
bun install

# Setup database
cp .env.example .env
# Edit DATABASE_URL di .env

# Push schema ke database
bun run db:push

# Generate Prisma client
bun run db:generate

# Start dev server
bun run dev
```

Aplikasi akan berjalan di `http://localhost:3000`

---

### 2. Test API Endpoints

#### Parent Login
```bash
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"parent@example.com"}'
```

#### Student Login
```bash
curl -X POST http://localhost:3000/api/student-auth \
  -H "Content-Type: application/json" \
  -d '{"nis":"2024001","password":"password123"}'
```

#### Get Dashboard
```bash
curl "http://localhost:3000/api/dashboard?studentId=clxxx123"
```

---

### 3. Browse API Documentation

#### Option A: Swagger Editor
1. Buka https://editor.swagger.io/
2. Copy-paste isi `docs/openapi.yaml`
3. Explore endpoints dan test langsung

#### Option B: Local Swagger UI (Optional)
```bash
npm install -g swagger-ui-express
npx serve-swagger docs/openapi.yaml
```

---

## 🏗️ Architecture Overview

```
SIMT Portal Ortu
├── Frontend (Next.js)
│   ├── Parent Portal (/dashboard)
│   ├── Student Portal (/student-dashboard)
│   └── Public pages (landing, about)
│
├── Backend API (Next.js API Routes)
│   ├── /api/auth - Parent authentication
│   ├── /api/student-auth - Student authentication
│   ├── /api/dashboard - Parent dashboard data
│   └── /api/student-dashboard - Student dashboard data
│
├── Database (SQLite + Prisma)
│   ├── Multi-tenant architecture
│   ├── 20+ data models
│   └── DAPODIK/EMIS integration ready
│
└── Services (Planned)
    ├── WhatsApp (Baileys)
    ├── File upload (local/S3)
    └── PDF generation
```

---

## 📊 Database Schema

Lihat file `prisma/schema.prisma` untuk schema lengkap.

**Core Entities:**
- `Tenant` - Sekolah/Yayasan
- `User` - Staff, guru, admin
- `Student` - Data siswa
- `Classroom` - Kelas (7A, 8B, etc.)
- `Subject` - Mata pelajaran
- `AcademicYear` - Tahun ajaran

**Operational Data:**
- `Attendance` - Kehadiran
- `Grade` - Nilai
- `Payment` - Pembayaran SPP
- `Announcement` - Pengumuman

**Extended Features:**
- `Schedule` - Jadwal pelajaran
- `StudentViolation` - Pelanggaran
- `StudentAchievement` - Prestasi
- `TahfizRecord` - Hafalan Quran
- `WhatsappConfig` - Konfigurasi WA

---

## 🔐 Authentication & Authorization

### Current Implementation (MVP)
- **Parent:** Login dengan email (simple lookup)
- **Student:** Login dengan NIS + password (plain text)
- **Session:** Stored in localStorage (client-side)

⚠️ **Security Warning:** Implementasi saat ini untuk MVP only!

### Planned Improvements
- [ ] NextAuth.js integration
- [ ] JWT token-based sessions
- [ ] Bcrypt password hashing
- [ ] Role-based access control (RBAC)
- [ ] Refresh token mechanism
- [ ] Session expiration & renewal

---

## 🎯 API Usage Examples

### Parent Portal Integration

```typescript
// 1. Login parent
const loginResponse = await fetch('/api/auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'parent@example.com' })
});

const { students } = await loginResponse.json();

// 2. Select student (if multiple children)
const selectedStudent = students[0];
localStorage.setItem('studentId', selectedStudent.id);

// 3. Load dashboard
const dashboardResponse = await fetch(
  `/api/dashboard?studentId=${selectedStudent.id}&gradeType=PENGETAHUAN`
);

const dashboard = await dashboardResponse.json();

// 4. Access data
console.log(dashboard.student.name);
console.log(dashboard.attendanceSummary);
console.log(dashboard.grades);
console.log(dashboard.payments);
```

---

### Student Portal Integration

```typescript
// 1. Login student
const loginResponse = await fetch('/api/student-auth', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    nis: '2024001', 
    password: 'password123' 
  })
});

const { student } = await loginResponse.json();
localStorage.setItem('studentId', student.id);

// 2. Load dashboard with extended data
const dashboardResponse = await fetch(
  `/api/student-dashboard?studentId=${student.id}`
);

const dashboard = await dashboardResponse.json();

// 3. Access extended features
console.log(dashboard.schedules);      // Class schedule
console.log(dashboard.violations);     // Violations
console.log(dashboard.achievements);   // Achievements
console.log(dashboard.tahfiz);         // Tahfiz progress
```

---

### Grade Type Switching

```typescript
const gradeTypes = ['PENGETAHUAN', 'KETERAMPILAN', 'UTS', 'UAS', 'SIKAP'];

async function switchGradeType(type: string) {
  const studentId = localStorage.getItem('studentId');
  const response = await fetch(
    `/api/dashboard?studentId=${studentId}&gradeType=${type}`
  );
  
  const data = await response.json();
  return data.grades; // Only grades change, rest stays same
}

// Usage
const pengetahuan = await switchGradeType('PENGETAHUAN');
const uts = await switchGradeType('UTS');
```

---

## 🔄 Data Refresh Strategy

### Manual Refresh (Current)
```typescript
function refreshDashboard() {
  const studentId = localStorage.getItem('studentId');
  fetchDashboard(studentId); // Re-fetch all data
}

// User clicks refresh button
<button onClick={refreshDashboard}>Refresh</button>
```

### Auto Refresh (Planned)
```typescript
// Polling every 30 seconds
useEffect(() => {
  const interval = setInterval(() => {
    refreshDashboard();
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### Real-time Updates (Future)
```typescript
// WebSocket connection
const ws = new WebSocket('ws://localhost:3000/ws');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  
  if (update.type === 'attendance') {
    updateAttendanceState(update.data);
  } else if (update.type === 'grade') {
    updateGradeState(update.data);
  }
};
```

---

## 🧪 Testing

### Manual Testing

#### 1. Seed Test Data
```bash
# Create test tenant & students
bun run prisma db seed
```

#### 2. Test Endpoints
```bash
# Test parent login
curl -X POST http://localhost:3000/api/auth \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test dashboard
curl "http://localhost:3000/api/dashboard?studentId=<id>"
```

### Automated Testing (Planned)
```bash
# Unit tests
bun test

# Integration tests
bun test:integration

# E2E tests
bun test:e2e
```

---

## 📦 Deployment

### Development
```bash
bun run dev
```

### Production Build
```bash
# Build standalone
bun run build

# Start production server
bun run start
```

### Docker Deployment
```bash
# Build image
docker build -t simt-portal .

# Run container
docker run -p 3000:3000 -e DATABASE_URL="..." simt-portal
```

### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Note:** Untuk production, gunakan PostgreSQL atau MySQL, bukan SQLite.

---

## 🔧 Configuration

### Environment Variables

```bash
# .env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Optional
WHATSAPP_ENABLED="false"
FILE_UPLOAD_PATH="./public/uploads"
```

### Next.js Config

```javascript
// next.config.js
module.exports = {
  output: 'standalone', // For Docker
  experimental: {
    serverActions: true
  }
};
```

---

## 📱 Mobile App Integration

### React Native Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://portal.simt.example.com/api'
});

// Login
async function loginParent(email: string) {
  const response = await api.post('/auth', { email });
  return response.data.students;
}

// Get dashboard
async function getDashboard(studentId: string) {
  const response = await api.get('/dashboard', {
    params: { studentId }
  });
  return response.data;
}
```

### Flutter Example

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class SimtApi {
  static const baseUrl = 'https://portal.simt.example.com/api';
  
  Future<List<Student>> loginParent(String email) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email})
    );
    
    final data = jsonDecode(response.body);
    return (data['students'] as List)
      .map((s) => Student.fromJson(s))
      .toList();
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Error
```
Error: P1003 - Database does not exist
```
**Solution:**
```bash
bun run db:push
```

#### 2. Missing Prisma Client
```
Error: Cannot find module '@prisma/client'
```
**Solution:**
```bash
bun run db:generate
```

#### 3. Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution:**
```bash
# Use different port
bun run dev -- -p 3001
```

#### 4. Student Not Found
```
Error: 404 - Siswa tidak ditemukan
```
**Check:**
- studentId valid?
- Student.isActive = true?
- Using correct tenantId?

---

## 📚 Additional Resources

### Documentation
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

### Tools
- [Swagger Editor](https://editor.swagger.io/) - API spec editor
- [Postman](https://www.postman.com/) - API testing
- [Prisma Studio](https://www.prisma.io/studio) - Database GUI

### Reference Implementation
- [Laravel Backend](../download/simt-laravel/) - Original implementation
- [PRD Document](../download/PRD_MVP_SIMT_MTs_3Bulan_5Juta.docx) - Product requirements

---

## 🤝 Contributing

### Development Workflow

1. **Fork & Clone**
   ```bash
   git clone <your-fork>
   cd simt-portalortu
   ```

2. **Create Branch**
   ```bash
   git checkout -b feature/nama-fitur
   ```

3. **Make Changes**
   - Update code
   - Update documentation if needed
   - Add tests

4. **Test**
   ```bash
   bun test
   bun run lint
   ```

5. **Commit & Push**
   ```bash
   git commit -m "feat: add fitur X"
   git push origin feature/nama-fitur
   ```

6. **Create Pull Request**

### Commit Convention

```
feat: add new feature
fix: fix bug
docs: update documentation
style: formatting changes
refactor: code refactoring
test: add tests
chore: maintenance tasks
```

---

## 📞 Support

### Contact
- Email: support@simt.example.com
- GitHub Issues: [Create Issue](https://github.com/your-repo/issues)
- Telegram: @simt_support

### FAQ

**Q: Apakah bisa digunakan untuk SMP?**  
A: Ya, sistem dirancang untuk MTs/SMP sederajat.

**Q: Berapa maksimal siswa per tenant?**  
A: Default 500, bisa disesuaikan di `tenant.maxStudents`.

**Q: Apakah support mobile app?**  
A: Ya, API bisa diintegrasikan dengan React Native atau Flutter.

**Q: Database apa yang didukung?**  
A: SQLite (dev), PostgreSQL, MySQL, SQL Server via Prisma.

---

## 📝 Changelog

### Version 1.0.0 (Current)
- ✅ Multi-tenant architecture
- ✅ Parent & Student authentication
- ✅ Dashboard endpoints
- ✅ Attendance, grades, payments tracking
- ✅ Tahfiz, violations, achievements
- ✅ OpenAPI specification

### Version 1.1.0 (Planned)
- ⏳ NextAuth integration
- ⏳ Password hashing
- ⏳ WhatsApp notifications
- ⏳ File upload service
- ⏳ PDF report generation

### Version 2.0.0 (Future)
- 📅 Real-time updates (WebSocket)
- 📅 Mobile push notifications
- 📅 Advanced analytics
- 📅 DAPODIK/EMIS sync
- 📅 Multi-language support

---

## 📄 License

MIT License - see LICENSE file for details.

---

**Happy Coding! 🚀**

*Last updated: Juni 2026*
