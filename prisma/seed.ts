import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SIMT MTs database (v2 - complete data)...');

  // 1. Create Tenant (Yayasan)
  const tenant = await prisma.tenant.create({
    data: {
      name: 'MTs Al-Hikmah Malang',
      slug: 'mts-al-hikmah',
      code: 'MTS-AH-001',
      address: 'Jl. Raden Panji Suryo Niti Kusuma No. 12, Kedungkandang',
      city: 'Malang',
      province: 'Jawa Timur',
      phone: '0341-712345',
      email: 'info@mtsalhikmah.sch.id',
      npsn: '20512345',
      nism: '11123205001',
      isActive: true,
      subscriptionEnd: new Date('2026-12-31'),
      maxStudents: 500,
      currentStudents: 288,
    },
  });
  console.log(`✅ Tenant: ${tenant.name}`);

  // 2. Create Users
  const kepalaMadrasah = await prisma.user.create({
    data: {
      tenantId: tenant.id, name: 'H. Ahmad Fauzi, M.Pd.I',
      email: 'kepala@mtsalhikmah.sch.id', password: '$2b$10$dummyHash',
      phone: '081234567890', role: 'KEPALA_MADRASAH', nuptk: '1234567890123456', nip: '196801011990031001',
    },
  });
  const waliKelas7A = await prisma.user.create({
    data: {
      tenantId: tenant.id, name: 'Siti Nurhaliza, S.Pd',
      email: 'siti.nurhaliza@mtsalhikmah.sch.id', password: '$2b$10$dummyHash',
      phone: '081234567891', role: 'WALI_KELAS', nuptk: '1234567890123457',
    },
  });
  const guruMatematika = await prisma.user.create({
    data: {
      tenantId: tenant.id, name: 'Budi Santoso, S.Pd',
      email: 'budi.santoso@mtsalhikmah.sch.id', password: '$2b$10$dummyHash',
      phone: '081234567892', role: 'GURU',
    },
  });
  const tataUsaha = await prisma.user.create({
    data: {
      tenantId: tenant.id, name: 'Rina Wulandari',
      email: 'rina.wulandari@mtsalhikmah.sch.id', password: '$2b$10$dummyHash',
      phone: '081234567893', role: 'TATA_USAHA',
    },
  });
  console.log('✅ Users: 4 created');

  // 3. Academic Year
  const academicYear = await prisma.academicYear.create({
    data: {
      tenantId: tenant.id, name: '2025/2026', semester: 2, isActive: true,
      startDate: new Date('2026-01-05'), endDate: new Date('2026-06-15'),
    },
  });
  console.log(`✅ Academic Year: ${academicYear.name} Semester ${academicYear.semester}`);

  // 4. Classrooms
  const classes = await Promise.all([
    prisma.classroom.create({ data: { tenantId: tenant.id, academicYearId: academicYear.id, name: 'VII-A', level: 7, capacity: 36, waliKelasId: waliKelas7A.id } }),
    prisma.classroom.create({ data: { tenantId: tenant.id, academicYearId: academicYear.id, name: 'VIII-B', level: 8, capacity: 36 } }),
    prisma.classroom.create({ data: { tenantId: tenant.id, academicYearId: academicYear.id, name: 'IX-C', level: 9, capacity: 36 } }),
  ]);
  console.log(`✅ Classrooms: ${classes.map(c => c.name).join(', ')}`);

  // 5. Subjects for each classroom
  const subjectDefs = [
    { name: 'Matematika', code: 'MTK', hours: 5, cat: 'UMUM' as const },
    { name: 'Bahasa Arab', code: 'BAR', hours: 4, cat: 'ARAB' as const },
    { name: 'Al-Quran & Hadits', code: 'QHD', hours: 3, cat: 'QURAN' as const },
    { name: 'IPA', code: 'IPA', hours: 4, cat: 'UMUM' as const },
    { name: 'Bahasa Inggris', code: 'BIG', hours: 3, cat: 'UMUM' as const },
    { name: 'Pendidikan Agama Islam', code: 'PAI', hours: 3, cat: 'AGAMA_ISLAM' as const },
    { name: 'IPS', code: 'IPS', hours: 3, cat: 'UMUM' as const },
    { name: 'Bahasa Indonesia', code: 'BIN', hours: 4, cat: 'UMUM' as const },
  ];

  const subjects: { id: string; name: string; code: string }[] = [];
  for (const cls of classes) {
    for (const sd of subjectDefs) {
      const s = await prisma.subject.create({
        data: {
          tenantId: tenant.id, classroomId: cls.id, name: sd.name, code: sd.code,
          hoursPerWeek: sd.hours, teacherId: guruMatematika.id, category: sd.cat,
        },
      });
      if (cls.name === 'VII-A') subjects.push({ id: s.id, name: s.name, code: s.code });
    }
  }
  console.log(`✅ Subjects: ${subjects.length} for VII-A + ${classes.length * subjectDefs.length} total`);

  // 6. Students (8 in VII-A + 2 siblings sharing same parent email)
  const studentNames = [
    { name: 'Ahmad Rizki Pratama', gender: 'L' as const, father: 'H. Rizki Setiawan', mother: 'Hj. Siti Aminah', email: 'ortu1@email.com' },
    { name: 'Fatimah Azzahra', gender: 'P' as const, father: 'Abdul Karim', mother: 'Khadijah', email: 'ortu2@email.com' },
    { name: 'Muhammad Farhan', gender: 'L' as const, father: 'Hasan Basri', mother: 'Nur Jannah', email: 'ortu3@email.com' },
    { name: 'Aisyah Putri Ramadhani', gender: 'P' as const, father: 'Ramadhani', mother: 'Dewi Sartika', email: 'ortu4@email.com' },
    { name: 'Umar Hakim', gender: 'L' as const, father: 'Hakim Zarkasji', mother: 'Yumni Safitri', email: 'ortu5@email.com' },
    { name: 'Zahra Kamila', gender: 'P' as const, father: 'M. Kamal', mother: 'Halimah', email: 'ortu6@email.com' },
    { name: 'Bilal Ibrahim', gender: 'L' as const, father: 'Ibrahim Hidayat', mother: 'Maryam', email: 'ortu7@email.com' },
    { name: 'Khadijah Nuraini', gender: 'P' as const, father: 'Nuraini', mother: 'Safura', email: 'ortu8@email.com' },
    // Multi-student parent (same email for 2 siblings)
    { name: 'Hasan Ali', gender: 'L' as const, father: 'Ali Mustofa', mother: 'Siti Khodijah', email: 'ortu_multi@email.com' },
    { name: 'Husna Aliya', gender: 'P' as const, father: 'Ali Mustofa', mother: 'Siti Khodijah', email: 'ortu_multi@email.com' },
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
    // Place siblings in different classes (Hasan in VII-A, Husna in VIII-B)
    const classIdx = i < 8 ? 0 : (i === 8 ? 0 : 1);
    const student = await prisma.student.create({
      data: {
        tenantId: tenant.id, classroomId: classes[classIdx].id,
        nis: `2025${String(i + 1).padStart(4, '0')}`, nisn: `00${String(12345600 + i)}`,
        name: s.name, gender: s.gender,
        birthPlace: 'Malang', birthDate: new Date(2012, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        address: `Jl. Merdeka No. ${i + 1}, Kedungkandang, Malang`,
        fatherName: s.father, fatherPhone: `08123456${String(7800 + i)}`,
        motherName: s.mother, motherPhone: `08123456${String(7910 + i)}`,
        parentEmail: s.email,
        nik: `3507${String(2012010000 + i)}`, religion: 'Islam',
        enrollmentDate: new Date('2025-07-15'), isActive: true,
      },
    });
    students.push(student);
  }
  console.log(`✅ Students: ${students.length} created`);

  // 7. Attendance for ALL students - May AND June 2026
  const attendanceData = [];
  const statuses = ['HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'SAKIT', 'IZIN', 'HADIR'] as const;

  for (const student of students) {
    for (const month of [4, 5]) { // May = 4 (0-indexed = May), June = 5
      for (let day = 1; day <= 30; day++) {
        const date = new Date(2026, month, day);
        if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends
        // Skip future dates (current date is June 12, 2026)
        if (month === 5 && day > 12) continue;
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        attendanceData.push(
          prisma.attendance.create({
            data: {
              tenantId: tenant.id, studentId: student.id, date, status,
              timeIn: status === 'HADIR' ? new Date(2026, month, day, 6, 45 + Math.floor(Math.random() * 15)) : null,
              timeOut: status === 'HADIR' ? new Date(2026, month, day, 13, 30 + Math.floor(Math.random() * 30)) : null,
              note: status === 'SAKIT' ? 'Sakit demam, ada surat dokter' : status === 'IZIN' ? 'Izin keperluan keluarga' : null,
              recordedBy: waliKelas7A.id,
            },
          })
        );
      }
    }
  }
  const attendances = await Promise.all(attendanceData);
  console.log(`✅ Attendances: ${attendances.length} records (May+June for all students)`);

  // 8. Grades for ALL students - multiple types
  const gradeData = [];
  for (const student of students) {
    for (const subject of subjects) {
      // Pengetahuan
      gradeData.push(
        prisma.grade.create({
          data: {
            tenantId: tenant.id, studentId: student.id, subjectId: subject.id,
            teacherId: guruMatematika.id, type: 'PENGETAHUAN',
            score: 65 + Math.floor(Math.random() * 30),
          },
        })
      );
      // Keterampilan
      gradeData.push(
        prisma.grade.create({
          data: {
            tenantId: tenant.id, studentId: student.id, subjectId: subject.id,
            teacherId: guruMatematika.id, type: 'KETERAMPILAN',
            score: 68 + Math.floor(Math.random() * 27),
          },
        })
      );
      // UTS
      gradeData.push(
        prisma.grade.create({
          data: {
            tenantId: tenant.id, studentId: student.id, subjectId: subject.id,
            teacherId: guruMatematika.id, type: 'UTS',
            score: 60 + Math.floor(Math.random() * 35),
          },
        })
      );
    }
  }
  const grades = await Promise.all(gradeData);
  console.log(`✅ Grades: ${grades.length} records (3 types x ${students.length} students x ${subjects.length} subjects)`);

  // 9. Payments (SPP Jan-Jun 2026) for ALL students
  const paymentData = [];
  const months = [1, 2, 3, 4, 5, 6];
  for (const student of students) {
    for (const month of months) {
      const isPaid = month <= 4; // Jan-Apr paid, May-Jun unpaid
      paymentData.push(
        prisma.payment.create({
          data: {
            tenantId: tenant.id, studentId: student.id, type: 'SPP',
            amount: 250000, month, year: 2026,
            status: isPaid ? 'LUNAS' : 'BELUM_BAYAR',
            paidAt: isPaid ? new Date(2026, month - 1, 10 + Math.floor(Math.random() * 5)) : null,
            paymentMethod: isPaid ? 'transfer' : null,
            dueDate: new Date(2026, month - 1, 10),
          },
        })
      );
    }
  }
  const payments = await Promise.all(paymentData);
  console.log(`✅ Payments: ${payments.length} records`);

  // 10. Announcements
  const announcements = await Promise.all([
    prisma.announcement.create({
      data: {
        tenantId: tenant.id, title: 'Libur Hari Raya Idul Fitri 1447 H',
        content: 'Diberitahukan kepada seluruh siswa dan wali murid bahwa kegiatan belajar mengajar diliburkan mulai tanggal 15-23 Maret 2026 dalam rangka Hari Raya Idul Fitri 1447 H. Kegiatan KBM kembali normal pada tanggal 24 Maret 2026. Selamat merayakan Idul Fitri, mohon maaf lahir dan batin.',
        category: 'keagamaan', isPinned: true,
        publishedAt: new Date('2026-03-01'), expiresAt: new Date('2026-03-25'),
      },
    }),
    prisma.announcement.create({
      data: {
        tenantId: tenant.id, title: 'Jadwal UAS Semester Genap 2025/2026',
        content: 'Ujian Akhir Semester Genap akan dilaksanakan pada tanggal 1-10 Juni 2026. Silakan persiapkan diri dengan baik. Jadwal ujian per mata pelajaran akan dibagikan oleh wali kelas masing-masing. Siswa wajib hadir 30 menit sebelum ujian dimulai.',
        category: 'akademik', isPinned: true, publishedAt: new Date('2026-05-15'),
      },
    }),
    prisma.announcement.create({
      data: {
        tenantId: tenant.id, title: 'Pembayaran SPP Bulan Mei-Juni 2026',
        content: 'Mohon untuk segera menyelesaikan pembayaran SPP bulan Mei dan Juni 2026 sebelum tanggal 10 masing-masing bulan. Pembayaran dapat dilakukan melalui transfer bank ke rekening BRI 0123-4567-8901 a.n. MTs Al-Hikmah atau langsung ke bagian TU. Keterlambatan pembayaran akan dikenakan denda sebesar Rp 10.000 per bulan.',
        category: 'keuangan', publishedAt: new Date('2026-05-01'),
      },
    }),
    prisma.announcement.create({
      data: {
        tenantId: tenant.id, title: 'Lomba HUT RI ke-81',
        content: 'Dalam rangka memperingati HUT Kemerdekaan RI ke-81, MTs Al-Hikmah menyelenggarakan berbagai lomba: pidato, puisi, kaligrafi, dan tahfidz. Pendaftaran dibuka sampai 10 Agustus 2026 di perpustakaan. Setiap kelas wajib mengirimkan minimal 2 peserta.',
        category: 'umum', publishedAt: new Date('2026-07-20'),
      },
    }),
  ]);
  console.log(`✅ Announcements: ${announcements.length} created`);

  // 11. WhatsApp Config
  await prisma.whatsappConfig.create({
    data: {
      tenantId: tenant.id, sessionName: 'mts-al-hikmah-wa', isConnected: true,
      phoneNumber: '6281234567890', lastConnectedAt: new Date(),
    },
  });
  console.log('✅ WhatsApp Config created');

  console.log('\n🎉 Seeding complete! SIMT MTs demo data ready (v2 - complete).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
