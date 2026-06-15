# 🔄 SIMT Portal Ortu - Data Flow Documentation

## 📋 Table of Contents
1. [Authentication Flow](#authentication-flow)
2. [Parent Portal Flow](#parent-portal-flow)
3. [Student Portal Flow](#student-portal-flow)
4. [Data Synchronization](#data-synchronization)
5. [Multi-Tenant Architecture](#multi-tenant-architecture)

---

## 🔐 Authentication Flow

### Parent Login Flow

```mermaid
sequenceDiagram
    participant P as Parent
    participant UI as Frontend
    participant API as API Route
    participant DB as Database

    P->>UI: Enter email
    UI->>API: POST /api/auth { email }
    API->>DB: SELECT students WHERE parentEmail = ?
    DB-->>API: Return students[]
    
    alt Email found
        API-->>UI: 200 { students: [...] }
        UI->>P: Show student selection
        P->>UI: Select student
        UI->>UI: Store studentId in localStorage
        UI->>UI: Redirect to /dashboard
    else Email not found
        API-->>UI: 404 { error: "Email tidak terdaftar" }
        UI->>P: Show error message
    end
```

**Key Points:**
- Satu email bisa memiliki beberapa anak
- Tidak ada token/session (MVP - akan diganti)
- studentId disimpan di localStorage client-side
- Filter: `isActive: true` untuk siswa aktif saja

---

### Student Login Flow

```mermaid
sequenceDiagram
    participant S as Student
    participant UI as Frontend
    participant API as API Route
    participant DB as Database

    S->>UI: Enter NIS + password
    UI->>API: POST /api/student-auth { nis, password }
    API->>DB: SELECT student WHERE nis = ? AND isActive = true
    DB-->>API: Return student
    
    alt Student found
        API->>API: Verify password (plain text check)
        alt Password correct
            API-->>UI: 200 { student: {...} }
            UI->>UI: Store studentId & profile
            UI->>UI: Redirect to /student-dashboard
        else Password incorrect
            API-->>UI: 401 { error: "Password salah" }
            UI->>S: Show error
        end
    else Student not found
        API-->>UI: 404 { error: "NIS tidak terdaftar" }
        UI->>S: Show error
    end
    
    alt No password set
        API-->>UI: 403 { error: "Akun belum diaktifkan" }
        UI->>S: Contact admin message
    end
```

**Security Notes:**
- ⚠️ Password stored as plain text (MVP)
- ⚠️ TODO: Implement bcrypt hashing
- studentPassword harus diset oleh admin dulu
- Akses hanya untuk siswa aktif

---

## 👨‍👩‍👧 Parent Portal Flow

### Dashboard Data Loading

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant API as /api/dashboard
    participant DB as Database
    
    UI->>API: GET /api/dashboard?studentId=xxx&gradeType=PENGETAHUAN
    
    par Load Student Profile
        API->>DB: Get student with classroom, tenant, waliKelas
        DB-->>API: Student data
    and Load Attendance
        API->>DB: Get attendance (current month)
        DB-->>API: Attendance records
        alt No data this month
            API->>DB: Get latest month with data
            DB-->>API: Last month records
        end
    and Load Grades
        API->>DB: Get grades by type
        DB-->>API: Grade records
        API->>API: Calculate average, check KKM
    and Load Payments
        API->>DB: Get all payments
        DB-->>API: Payment records
        API->>API: Separate unpaid, calculate totals
    and Load Announcements
        API->>DB: Get active announcements
        DB-->>API: Announcement records
    end
    
    API->>API: Aggregate all data
    API-->>UI: 200 Complete dashboard data
    UI->>UI: Render dashboard components
```

**Data Processing:**
1. **Attendance Summary:**
   - Group by status (HADIR, SAKIT, IZIN, ALPHA)
   - Calculate percentages
   - Smart period detection (current month → fallback to last month)

2. **Grade Summary:**
   - Filter by selected type (PENGETAHUAN, KETERAMPILAN, etc.)
   - Calculate average score
   - Count subjects below KKM
   - Check if all subjects passing (tuntas)

3. **Payment Summary:**
   - Separate paid vs unpaid
   - Calculate total outstanding
   - Calculate total paid
   - Sort by due date

4. **Announcements:**
   - Filter by tenant
   - Show active announcements (not expired)
   - Order by pinned → publishedAt desc

---

### Grade Type Switching

```mermaid
graph TD
    A[User selects grade type] --> B{Already loaded?}
    B -->|No| C[API call with new gradeType]
    B -->|Yes| D[Filter from cache]
    C --> E[Update UI]
    D --> E
    
    E --> F[Show grades list]
    E --> G[Update average]
    E --> H[Update KKM count]
    E --> I[Update available types]
```

**Query Parameter:**
```
?gradeType=PENGETAHUAN  → Nilai Pengetahuan
?gradeType=KETERAMPILAN → Nilai Keterampilan
?gradeType=UTS          → Nilai Ujian Tengah Semester
?gradeType=UAS          → Nilai Ujian Akhir Semester
?gradeType=SIKAP        → Penilaian Sikap
```

---

## 🎓 Student Portal Flow

### Extended Dashboard Data

```mermaid
sequenceDiagram
    participant UI as Frontend
    participant API as /api/student-dashboard
    participant DB as Database
    
    Note over UI,DB: Same as parent dashboard +
    
    par Additional Data
        API->>DB: Get class schedules
        DB-->>API: Schedule records with subjects & teachers
    and Violations
        API->>DB: Get student violations
        DB-->>API: Violation records
        API->>API: Calculate total points
    and Achievements
        API->>DB: Get achievements
        DB-->>API: Achievement records
        API->>API: Count by level
    and Tahfiz Progress
        API->>DB: Get tahfiz records
        DB-->>API: Tahfiz records
        API->>API: Count surah memorized
        API->>API: Calculate average score
        API->>API: Separate ziyadah vs murajaah
    end
    
    API-->>UI: Complete student dashboard
    UI->>UI: Render extended UI
```

**Additional Features:**

1. **Class Schedule:**
   - Grouped by day of week (1-7)
   - Sorted by period (start → end)
   - Shows subject, teacher, time

2. **Violations:**
   - Total points accumulated
   - Category breakdown
   - Disciplinary actions taken
   - Handled by which teacher/staff

3. **Achievements:**
   - Categorized by type
   - Level (class → international)
   - Certificate links
   - Points/ranking

4. **Tahfiz Progress:**
   - Total Ziyadah (new memorization)
   - Total Murajaah (review)
   - Unique surahs memorized
   - Average fluency score
   - Latest records

---

## 🔄 Data Synchronization

### Real-time Update Pattern (Future)

```mermaid
graph LR
    A[Admin updates data] --> B[Database change]
    B --> C{Notification needed?}
    C -->|Yes| D[WhatsApp notification]
    C -->|Yes| E[Push notification]
    D --> F[Parent receives]
    E --> F
    F --> G[Parent refreshes portal]
    G --> H[New data displayed]
```

**Current Implementation:**
- Manual refresh required
- No real-time updates
- No push notifications (planned)

**Planned Features:**
- WebSocket for real-time updates
- Service Worker for push notifications
- WhatsApp Baileys integration for alerts

---

### Attendance Entry Flow (Admin Side - Future)

```mermaid
sequenceDiagram
    participant T as Teacher/Admin
    participant API as Admin API
    participant DB as Database
    participant WA as WhatsApp Service
    
    T->>API: POST /api/attendance/bulk
    Note over T,API: classroomId, date, students[]
    
    API->>DB: Begin transaction
    loop For each student
        DB->>DB: INSERT attendance record
    end
    API->>DB: Commit transaction
    
    par Notify parents
        API->>WA: Send notification (if alpha/sakit)
        WA->>WA: Queue messages
    end
    
    API-->>T: 201 Success
    
    Note over WA: Async message sending
    WA->>WA: Send queued WhatsApp messages
```

---

## 🏢 Multi-Tenant Architecture

### Tenant Isolation

```mermaid
graph TD
    A[Request] --> B{Has tenantId?}
    B -->|No| C[Error: Forbidden]
    B -->|Yes| D[Query with tenantId filter]
    
    D --> E[students WHERE tenantId = ?]
    D --> F[attendances WHERE student.tenantId = ?]
    D --> G[grades WHERE student.tenantId = ?]
    D --> H[payments WHERE student.tenantId = ?]
    
    E --> I[Return tenant-scoped data]
    F --> I
    G --> I
    H --> I
```

**Isolation Rules:**
1. Every query MUST include tenantId
2. Relations automatically inherit tenant scope
3. No cross-tenant data access
4. Slug used for subdomain routing (future)

**Example Query:**
```typescript
// ✅ Correct
const students = await db.student.findMany({
  where: { tenantId: session.tenantId }
});

// ❌ Wrong - missing tenant filter
const students = await db.student.findMany();
```

---

### Tenant Context Flow

```mermaid
sequenceDiagram
    participant U as User
    participant MW as Middleware
    participant API as API Route
    participant DB as Database
    
    U->>MW: Request with studentId
    MW->>DB: Get student.tenantId
    DB-->>MW: tenantId
    MW->>MW: Set tenant context
    MW->>API: Request + tenantContext
    
    API->>DB: Query with tenantId filter
    DB-->>API: Tenant-scoped data
    API-->>U: Response
    
    Note over U,DB: All queries auto-filtered by tenantId
```

**Implementation (Planned):**
```typescript
// Middleware
export async function tenantMiddleware(req) {
  const studentId = req.query.studentId;
  const student = await db.student.findUnique({
    where: { id: studentId },
    select: { tenantId: true }
  });
  
  req.tenantId = student.tenantId;
  return next();
}
```

---

## 📊 Database Query Optimization

### Efficient Data Loading

```typescript
// ✅ Good - Single query with includes
const student = await db.student.findUnique({
  where: { id: studentId },
  include: {
    classroom: {
      include: {
        academicYear: true,
        waliKelas: { select: { name: true, phone: true } }
      }
    },
    tenant: { select: { name: true, logo: true } }
  }
});

// ❌ Bad - N+1 queries
const student = await db.student.findUnique({ where: { id: studentId } });
const classroom = await db.classroom.findUnique({ where: { id: student.classroomId } });
const academicYear = await db.academicYear.findUnique({ where: { id: classroom.academicYearId } });
// ... multiple round trips
```

**Best Practices:**
1. Use `include` for related data
2. Use `select` to limit fields
3. Batch queries with `Promise.all()` when independent
4. Add database indexes for frequent queries

---

### Parallel Data Fetching

```typescript
// ✅ Good - Parallel fetching
const [student, attendances, grades, payments] = await Promise.all([
  db.student.findUnique({ where: { id: studentId }, include: {...} }),
  db.attendance.findMany({ where: { studentId } }),
  db.grade.findMany({ where: { studentId, type: gradeType } }),
  db.payment.findMany({ where: { studentId } })
]);

// ❌ Bad - Sequential fetching
const student = await db.student.findUnique({ where: { id: studentId } });
const attendances = await db.attendance.findMany({ where: { studentId } });
const grades = await db.grade.findMany({ where: { studentId } });
const payments = await db.payment.findMany({ where: { studentId } });
// Total time = sum of all queries
```

---

## 🔔 Notification Flow (Planned)

### WhatsApp Integration

```mermaid
graph TD
    A[Event occurs] --> B{Notification rule?}
    B -->|Yes| C[Create message]
    B -->|No| D[Skip]
    
    C --> E[Queue to WhatsApp service]
    E --> F{Session active?}
    F -->|Yes| G[Send via Baileys]
    F -->|No| H[Reconnect session]
    H --> G
    
    G --> I{Success?}
    I -->|Yes| J[Log sent]
    I -->|No| K[Retry queue]
    K --> L{Max retries?}
    L -->|No| E
    L -->|Yes| M[Log failed]
```

**Notification Triggers:**
- Attendance: Alpha status
- Grades: Below KKM
- Payments: Due date approaching
- Announcements: New urgent announcement
- Violations: New violation recorded

**Message Template:**
```
[MTs Al-Ikhlas]

Assalamu'alaikum Bpk/Ibu {parentName},

{notificationType}:
{message}

Siswa: {studentName} ({nis})
Kelas: {classroom}

Detail: {portalUrl}

Wassalamu'alaikum
```

---

## 📱 Client-Side State Management

### Parent Portal State

```mermaid
graph TD
    A[Login] --> B[Store studentId]
    B --> C[Fetch dashboard data]
    C --> D[Store in state]
    
    D --> E[Attendance component]
    D --> F[Grades component]
    D --> G[Payments component]
    D --> H[Announcements component]
    
    I[Grade type change] --> J[Refetch with new type]
    J --> D
    
    K[Refresh button] --> C
    L[Logout] --> M[Clear state]
```

**State Structure:**
```typescript
interface ParentPortalState {
  student: Student | null;
  attendanceSummary: AttendanceSummary;
  grades: GradeSummary;
  payments: PaymentSummary;
  announcements: Announcement[];
  selectedGradeType: GradeType;
  isLoading: boolean;
  error: string | null;
}
```

---

### Student Portal State

```typescript
interface StudentPortalState extends ParentPortalState {
  schedules: Schedule[];
  violations: ViolationSummary;
  achievements: AchievementSummary;
  tahfiz: TahfizSummary;
}
```

---

## 🔍 Search & Filter Patterns

### Attendance Period Selection

```mermaid
graph TD
    A[Load page] --> B{Current month has data?}
    B -->|Yes| C[Show current month]
    B -->|No| D[Find latest month]
    
    D --> E{Found data?}
    E -->|Yes| F[Show latest month]
    E -->|No| G[Show empty state]
    
    H[User selects month] --> I[Fetch selected period]
    I --> J[Update summary]
```

**Smart Fallback Logic:**
```typescript
// 1. Try current month
let data = await getAttendance(currentMonth);

// 2. If empty, find latest
if (data.length === 0) {
  const latest = await getLatestAttendance();
  if (latest) {
    data = await getAttendance(latest.month);
  }
}

return {
  data,
  periodLabel: formatPeriod(data[0]?.date || new Date())
};
```

---

## 🚀 Performance Considerations

### Caching Strategy (Planned)

```mermaid
graph LR
    A[Request] --> B{In cache?}
    B -->|Yes| C[Return cached]
    B -->|No| D[Fetch from DB]
    D --> E[Store in cache]
    E --> C
    
    F[Data updated] --> G[Invalidate cache]
    G --> B
```

**Cache Candidates:**
- Tenant information (rarely changes)
- Academic year data (stable)
- Subject list (stable)
- Announcements (TTL: 5 minutes)

**Implementation:**
- Redis for session storage
- In-memory cache for reference data
- CDN for static assets

---

## 📈 Analytics & Monitoring (Future)

### Key Metrics to Track

```typescript
interface AnalyticsEvent {
  event: 'login' | 'dashboard_view' | 'grade_view' | 'payment_view';
  userId: string;
  tenantId: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}
```

**Tracked Events:**
- Login frequency
- Most viewed sections
- Average session duration
- Error rates by endpoint
- Response time per query

---

## 🛡️ Security Flow

### Request Validation (Planned)

```mermaid
sequenceDiagram
    participant C as Client
    participant MW as Middleware
    participant API as API Handler
    
    C->>MW: Request
    MW->>MW: Validate JWT token
    MW->>MW: Check rate limit
    MW->>MW: Validate request schema
    
    alt Valid
        MW->>API: Forward request
        API->>API: Business logic
        API-->>C: Response
    else Invalid
        MW-->>C: 401/403/429 Error
    end
```

**Validation Layers:**
1. JWT token verification
2. Rate limiting (per IP/user)
3. Request schema validation (Zod)
4. Business rule validation
5. SQL injection prevention (Prisma ORM)

---

## 📝 Summary

### Current Implementation
✅ Basic authentication (email/NIS+password)  
✅ Multi-tenant data isolation  
✅ Parent & Student dashboards  
✅ Smart attendance period detection  
✅ Grade type filtering  
✅ Payment tracking  

### Planned Features
⏳ JWT-based session management  
⏳ Real-time notifications  
⏳ WhatsApp integration  
⏳ Push notifications  
⏳ Advanced caching  
⏳ Analytics dashboard  
⏳ Rate limiting  
⏳ Request validation middleware  

---

**Documentation Version:** 1.0.0  
**Last Updated:** Juni 2026  
**Related Docs:** [API Documentation](./API_DOCUMENTATION.md), [OpenAPI Spec](./openapi.yaml)
