---
Task ID: 1
Agent: Super Z (Main)
Task: Add Student Portal module to SIMT MTs with login switch between Parent/Student mode

Work Log:
- Read existing design document (Rancangan Fitur SIMT MTs.docx) from /home/z/my-project/upload/
- Identified student portal requirements from document: Dashboard, Jadwal, Presensi, Nilai, Tahfiz, Kesiswaan, Pengumuman
- Updated Prisma schema with 4 new models: Schedule, StudentViolation, StudentAchievement, TahfizRecord
- Added studentPassword field to Student model for student portal login
- Added ScheduleTeacher relation to User model
- Added schedules relation to Classroom, Subject, and Tenant models
- Reset database and ran prisma db push to apply schema changes
- Updated prisma/seed.ts (v3) with comprehensive demo data:
  - 23 schedule entries for VII-A (Senin-Sabtu)
  - 6 violation records for various students
  - 6 achievement records (academic, keagamaan, seni, non-akademik)
  - 128 tahfiz records (ziyadah & muraja'ah) across all students
  - studentPassword "siswa123" for all 10 students
- Created /api/student-auth/route.ts: NIS + password authentication
- Created /api/student-dashboard/route.ts: Full student dashboard with attendance, grades, schedules, violations, achievements, tahfiz, announcements
- Rewrote /app/page.tsx as unified portal with:
  - Portal mode switcher (Orang Tua / Siswa) on login page
  - Parent Portal component (5 tabs: Beranda, Presensi, Nilai, SPP, Info)
  - Student Portal component (6 tabs: Beranda, Jadwal, Nilai, Tahfiz, Siswa, Info)
  - DonutChart component shared between portals
  - Blue/indigo theme for student portal vs emerald/teal for parent portal
- Tested all functionality via agent browser testing
- All 11 test steps passed: login, dashboard, schedule, grades, tahfiz, kesiswaan, announcements, parent portal
- Edge case testing: wrong password → "Password salah", wrong NIS → "NIS tidak terdaftar", empty fields → validation error

Stage Summary:
- Student Portal fully implemented with 6 tabs matching design document requirements
- Login switcher allows seamless mode toggle between Parent and Student portals
- All API endpoints working correctly with proper error handling
- Demo data supports both portals with realistic data
- Build successful with no errors
- Student login: NIS 20250001-20250010, password: siswa123
- Parent login: ortu1@email.com - ortu8@email.com (no password)
