import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding SIMT MTs database (v3 - student portal)...');

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
  const guruTahfiz = await prisma.user.create({
    data: {
      tenantId: tenant.id, name: 'Ust. Muhammad Ridwan, Haf',
      email: 'ridwan@mtsalhikmah.sch.id', password: '$2b$10$dummyHash',
      phone: '081234567894', role: 'GURU',
    },
  });
  const tataUsaha = await prisma.user.create({
    data: {
      tenantId: tenant.id, name: 'Rina Wulandari',
      email: 'rina.wulandari@mtsalhikmah.sch.id', password: '$2b$10$dummyHash',
      phone: '081234567893', role: 'TATA_USAHA',
    },
  });
  console.log('✅ Users: 5 created');

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

  const subjects7A: { id: string; name: string; code: string }[] = [];
  const allSubjects: { id: string; name: string; code: string; classroomId: string }[] = [];
  for (const cls of classes) {
    for (const sd of subjectDefs) {
      const s = await prisma.subject.create({
        data: {
          tenantId: tenant.id, classroomId: cls.id, name: sd.name, code: sd.code,
          hoursPerWeek: sd.hours, teacherId: guruMatematika.id, category: sd.cat,
        },
      });
      allSubjects.push({ id: s.id, name: s.name, code: s.code, classroomId: cls.id });
      if (cls.name === 'VII-A') subjects7A.push({ id: s.id, name: s.name, code: s.code });
    }
  }
  console.log(`✅ Subjects: ${subjects7A.length} for VII-A + ${allSubjects.length} total`);

  // 6. Students (10 students, all with studentPassword for Student Portal)
  const studentNames = [
    { name: 'Ahmad Rizki Pratama', gender: 'L' as const, father: 'H. Rizki Setiawan', mother: 'Hj. Siti Aminah', email: 'ortu1@email.com', pwd: 'siswa123' },
    { name: 'Fatimah Azzahra', gender: 'P' as const, father: 'Abdul Karim', mother: 'Khadijah', email: 'ortu2@email.com', pwd: 'siswa123' },
    { name: 'Muhammad Farhan', gender: 'L' as const, father: 'Hasan Basri', mother: 'Nur Jannah', email: 'ortu3@email.com', pwd: 'siswa123' },
    { name: 'Aisyah Putri Ramadhani', gender: 'P' as const, father: 'Ramadhani', mother: 'Dewi Sartika', email: 'ortu4@email.com', pwd: 'siswa123' },
    { name: 'Umar Hakim', gender: 'L' as const, father: 'Hakim Zarkasji', mother: 'Yumni Safitri', email: 'ortu5@email.com', pwd: 'siswa123' },
    { name: 'Zahra Kamila', gender: 'P' as const, father: 'M. Kamal', mother: 'Halimah', email: 'ortu6@email.com', pwd: 'siswa123' },
    { name: 'Bilal Ibrahim', gender: 'L' as const, father: 'Ibrahim Hidayat', mother: 'Maryam', email: 'ortu7@email.com', pwd: 'siswa123' },
    { name: 'Khadijah Nuraini', gender: 'P' as const, father: 'Nuraini', mother: 'Safura', email: 'ortu8@email.com', pwd: 'siswa123' },
    { name: 'Hasan Ali', gender: 'L' as const, father: 'Ali Mustofa', mother: 'Siti Khodijah', email: 'ortu_multi@email.com', pwd: 'siswa123' },
    { name: 'Husna Aliya', gender: 'P' as const, father: 'Ali Mustofa', mother: 'Siti Khodijah', email: 'ortu_multi@email.com', pwd: 'siswa123' },
  ];

  const students = [];
  for (let i = 0; i < studentNames.length; i++) {
    const s = studentNames[i];
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
        studentPassword: s.pwd,
        nik: `3507${String(2012010000 + i)}`, religion: 'Islam',
        enrollmentDate: new Date('2025-07-15'), isActive: true,
      },
    });
    students.push(student);
  }
  console.log(`✅ Students: ${students.length} created (all with studentPassword)`);

  // 7. Schedules for VII-A
  const dayNames = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const scheduleData = [];
  // Senin
  const mondaySchedule = [
    { subjIdx: 0, start: 1, end: 2 }, // MTK jam 1-2
    { subjIdx: 5, start: 3, end: 3 }, // PAI jam 3
    { subjIdx: 2, start: 4, end: 5 }, // QHD jam 4-5
    { subjIdx: 3, start: 6, end: 7 }, // IPA jam 6-7
    { subjIdx: 7, start: 8, end: 9 }, // BIN jam 8-9
  ];
  // Selasa
  const tuesdaySchedule = [
    { subjIdx: 1, start: 1, end: 2 }, // BAR jam 1-2
    { subjIdx: 4, start: 3, end: 4 }, // BIG jam 3-4
    { subjIdx: 6, start: 5, end: 6 }, // IPS jam 5-6
    { subjIdx: 0, start: 7, end: 8 }, // MTK jam 7-8
    { subjIdx: 2, start: 9, end: 9 }, // QHD jam 9
  ];
  // Rabu
  const wednesdaySchedule = [
    { subjIdx: 7, start: 1, end: 2 }, // BIN jam 1-2
    { subjIdx: 3, start: 3, end: 4 }, // IPA jam 3-4
    { subjIdx: 5, start: 5, end: 6 }, // PAI jam 5-6
    { subjIdx: 1, start: 7, end: 8 }, // BAR jam 7-8
  ];
  // Kamis
  const thursdaySchedule = [
    { subjIdx: 0, start: 1, end: 3 }, // MTK jam 1-3
    { subjIdx: 4, start: 4, end: 5 }, // BIG jam 4-5
    { subjIdx: 6, start: 6, end: 7 }, // IPS jam 6-7
    { subjIdx: 2, start: 8, end: 9 }, // QHD jam 8-9
  ];
  // Jumat
  const fridaySchedule = [
    { subjIdx: 5, start: 1, end: 2 }, // PAI jam 1-2
    { subjIdx: 1, start: 3, end: 4 }, // BAR jam 3-4
    { subjIdx: 0, start: 5, end: 5 }, // MTK jam 5
  ];
  // Sabtu
  const saturdaySchedule = [
    { subjIdx: 7, start: 1, end: 2 }, // BIN jam 1-2
    { subjIdx: 3, start: 3, end: 4 }, // IPA jam 3-4
  ];

  const allSchedules = [
    { day: 1, slots: mondaySchedule },
    { day: 2, slots: tuesdaySchedule },
    { day: 3, slots: wednesdaySchedule },
    { day: 4, slots: thursdaySchedule },
    { day: 5, slots: fridaySchedule },
    { day: 6, slots: saturdaySchedule },
  ];

  for (const daySchedule of allSchedules) {
    for (const slot of daySchedule.slots) {
      scheduleData.push(
        prisma.schedule.create({
          data: {
            tenantId: tenant.id,
            classroomId: classes[0].id,
            subjectId: subjects7A[slot.subjIdx].id,
            dayOfWeek: daySchedule.day,
            startPeriod: slot.start,
            endPeriod: slot.end,
            teacherId: guruMatematika.id,
          },
        })
      );
    }
  }
  const schedules = await Promise.all(scheduleData);
  console.log(`✅ Schedules: ${schedules.length} for VII-A`);

  // 8. Attendance for ALL students - May AND June 2026
  const attendanceData = [];
  const statuses = ['HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'HADIR', 'SAKIT', 'IZIN', 'HADIR'] as const;

  for (const student of students) {
    for (const month of [4, 5]) {
      for (let day = 1; day <= 30; day++) {
        const date = new Date(2026, month, day);
        if (date.getDay() === 0 || date.getDay() === 6) continue;
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
  console.log(`✅ Attendances: ${attendances.length} records`);

  // 9. Grades for ALL students - multiple types
  const gradeData = [];
  for (const student of students) {
    const classSubjects = allSubjects.filter(s => s.classroomId === student.classroomId);
    for (const subject of classSubjects) {
      gradeData.push(
        prisma.grade.create({
          data: {
            tenantId: tenant.id, studentId: student.id, subjectId: subject.id,
            teacherId: guruMatematika.id, type: 'PENGETAHUAN',
            score: 65 + Math.floor(Math.random() * 30),
          },
        })
      );
      gradeData.push(
        prisma.grade.create({
          data: {
            tenantId: tenant.id, studentId: student.id, subjectId: subject.id,
            teacherId: guruMatematika.id, type: 'KETERAMPILAN',
            score: 68 + Math.floor(Math.random() * 27),
          },
        })
      );
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
  console.log(`✅ Grades: ${grades.length} records`);

  // 10. Payments (SPP Jan-Jun 2026) for ALL students
  const paymentData = [];
  const months = [1, 2, 3, 4, 5, 6];
  for (const student of students) {
    for (const month of months) {
      const isPaid = month <= 4;
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

  // 11. Announcements
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
        content: 'Mohon untuk segera menyelesaikan pembayaran SPP bulan Mei dan Juni 2026 sebelum tanggal 10 masing-masing bulan. Pembayaran dapat dilakukan melalui transfer bank ke rekening BRI 0123-4567-8901 a.n. MTs Al-Hikmah atau langsung ke bagian TU.',
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

  // 12. Violations (Pelanggaran) for some students
  const violationData = [
    { studentIdx: 0, category: 'ringan', description: 'Terlambat masuk kelas lebih dari 15 menit', points: 5, action: 'Peringatan lisan', date: new Date('2026-03-15') },
    { studentIdx: 2, category: 'sedang', description: 'Tidak mengerjakan PR 3 kali berturut-turut', points: 15, action: 'Pemanggilan orang tua', date: new Date('2026-04-10') },
    { studentIdx: 4, category: 'ringan', description: 'Tidak memakai seragam lengkap', points: 5, action: 'Peringatan lisan', date: new Date('2026-05-05') },
    { studentIdx: 0, category: 'ringan', description: 'Tidak membawa buku pelajaran', points: 3, action: 'Peringatan tertulis', date: new Date('2026-05-20') },
    { studentIdx: 6, category: 'sedang', description: 'Membawa HP di area sekolah', points: 20, action: 'HP disita 1 minggu, surat pernyataan', date: new Date('2026-04-22') },
    { studentIdx: 2, category: 'ringan', description: 'Terlambat mengumpulkan tugas', points: 5, action: 'Peringatan lisan', date: new Date('2026-05-10') },
  ];
  const violations = await Promise.all(
    violationData.map(v =>
      prisma.studentViolation.create({
        data: {
          tenantId: tenant.id, studentId: students[v.studentIdx].id,
          date: v.date, category: v.category, description: v.description,
          points: v.points, action: v.action, recordedBy: waliKelas7A.id,
        },
      })
    )
  );
  console.log(`✅ Violations: ${violations.length} records`);

  // 13. Achievements (Prestasi) for some students
  const achievementData = [
    { studentIdx: 1, title: 'Juara 1 Olimpiade Matematika Kota Malang', category: 'akademik', level: 'kota', ranking: 'Juara 1', date: new Date('2026-02-20'), desc: 'Olimpiade Sains Nasional tingkat Kota Malang' },
    { studentIdx: 5, title: 'Juara 2 Lomba Pidato Bahasa Arab', category: 'keagamaan', level: 'kecamatan', ranking: 'Juara 2', date: new Date('2026-03-10'), desc: 'Lomba pidato bahasa Arab MTs se-Kecamatan Kedungkandang' },
    { studentIdx: 0, title: 'Juara 3 Lomba Kaligrafi', category: 'seni', level: 'sekolah', ranking: 'Juara 3', date: new Date('2026-04-15'), desc: 'Lomba kaligrafi dalam rangka Isra Miraj' },
    { studentIdx: 3, title: 'Peserta Aktif Ekstrakurikuler Pramuka', category: 'non-akademik', level: 'sekolah', ranking: 'Peserta', date: new Date('2026-01-30'), desc: 'Keikutsertaan aktif dalam kegiatan pramuka' },
    { studentIdx: 7, title: 'Juara 1 MTQ Tingkat Kecamatan', category: 'keagamaan', level: 'kecamatan', ranking: 'Juara 1', date: new Date('2026-05-01'), desc: 'Musabaqah Tilawatil Quran se-Kecamatan' },
    { studentIdx: 1, title: 'Juara 2 Lomba Cerdas Cermat IPA', category: 'akademik', level: 'kota', ranking: 'Juara 2', date: new Date('2026-05-15'), desc: 'Lomba cerdas cermat IPA antar MTs se-Kota Malang' },
  ];
  const achievements = await Promise.all(
    achievementData.map(a =>
      prisma.studentAchievement.create({
        data: {
          tenantId: tenant.id, studentId: students[a.studentIdx].id,
          date: a.date, title: a.title, category: a.category,
          level: a.level, ranking: a.ranking, description: a.desc,
        },
      })
    )
  );
  console.log(`✅ Achievements: ${achievements.length} records`);

  // 14. Tahfiz Records for ALL students
  const surahList = [
    { name: 'Al-Fatihah', total: 7 },
    { name: 'An-Nas', total: 6 },
    { name: 'Al-Falaq', total: 5 },
    { name: 'Al-Ikhlas', total: 4 },
    { name: 'Al-Lahab', total: 5 },
    { name: 'An-Nasr', total: 3 },
    { name: 'Al-Kafirun', total: 6 },
    { name: 'Al-Kautsar', total: 3 },
    { name: 'Al-Maun', total: 7 },
    { name: 'Quraisy', total: 4 },
    { name: 'Al-Fil', total: 5 },
    { name: 'Al-Humazah', total: 9 },
    { name: 'Al-Ashr', total: 3 },
    { name: 'At-Takatsur', total: 8 },
    { name: 'Al-Qariah', total: 11 },
    { name: 'Al-Adiyat', total: 11 },
    { name: 'Al-Zalzalah', total: 8 },
    { name: 'Al-Bayyinah', total: 8 },
    { name: 'Al-Qadr', total: 5 },
    { name: 'Al-Alaq', total: 19 },
  ];
  const tahfizData = [];
  for (const student of students) {
    // Each student has 10-15 tahfiz records over 2 months
    const recordCount = 10 + Math.floor(Math.random() * 6);
    for (let i = 0; i < recordCount; i++) {
      const surah = surahList[Math.floor(Math.random() * surahList.length)];
      const isZiyadah = Math.random() > 0.4;
      const score = isZiyadah ? 60 + Math.floor(Math.random() * 35) : 70 + Math.floor(Math.random() * 30);
      const fluencyOptions = ['lancar', 'cukup', 'kurang'];
      const fluency = score >= 85 ? 'lancar' : score >= 70 ? 'cukup' : 'kurang';
      const month = Math.random() > 0.5 ? 4 : 5; // May or June
      const day = 1 + Math.floor(Math.random() * 25);

      tahfizData.push(
        prisma.tahfizRecord.create({
          data: {
            tenantId: tenant.id, studentId: student.id,
            date: new Date(2026, month, day),
            surah: surah.name,
            ayahStart: 1,
            ayahEnd: surah.total,
            type: isZiyadah ? 'ziyadah' : 'murajaah',
            score,
            fluency,
            note: isZiyadah ? 'Hafalan baru' : 'Murajaah rutin',
            recordedBy: guruTahfiz.id,
          },
        })
      );
    }
  }
  const tahfizRecords = await Promise.all(tahfizData);
  console.log(`✅ Tahfiz Records: ${tahfizRecords.length} records`);

  // 15. WhatsApp Config
  await prisma.whatsappConfig.create({
    data: {
      tenantId: tenant.id, sessionName: 'mts-al-hikmah-wa', isConnected: true,
      phoneNumber: '6281234567890', lastConnectedAt: new Date(),
    },
  });
  console.log('✅ WhatsApp Config created');

  console.log('\n🎉 Seeding complete! SIMT MTs demo data ready (v3 - student portal).');
  console.log('\n📧 Parent Portal login: ortu1@email.com ~ ortu8@email.com, ortu_multi@email.com');
  console.log('🎓 Student Portal login: NIS 20250001 ~ 20250010, password: siswa123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
