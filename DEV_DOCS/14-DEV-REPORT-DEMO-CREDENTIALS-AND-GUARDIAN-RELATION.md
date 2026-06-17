# 14 — Dev Report: Penyesuaian Akun Demo & Relasi Wali-Siswa

> **Tanggal:** 2026-06-16  
> **Status:** ✅ Selesai Diimplementasikan & Didokumentasikan  
> **Repository:** simt-portalortu (Frontend) & simt-backend (Laravel)

---

## I. Penyesuaian Akun Demo Login

Akun demo login pada antarmuka web (baik portal Orang Tua maupun Siswa) telah diselaraskan dengan data migrasi/seeder `PitchingDemoSeeder.php` dari `simt-backend`.

### Perubahan pada [page.tsx](file:///d:/laragon/www/simt-portalortu/src/app/page.tsx)

#### 1. Portal Orang Tua (Wali Murid)
*   **Form Login:** Sekarang mewajibkan pengisian **Email** dan **Password** (sebelumnya hanya email tanpa password).
*   **State Baru:** Menambahkan state `parentPassword` dan `showParentPassword` untuk memproses input password secara terenkripsi dan aman.
*   **Placeholder Input:** Diubah menjadi `wali_0001@simt.local`.
*   **Petunjuk Demo:**
    *   **Email:** `wali_0001@simt.local` s/d `wali_0010@simt.local`
    *   **Password:** `password`

#### 2. Portal Siswa
*   **Placeholder Input:** Diubah menjadi `0001` (sesuai format NIS zero-padded 4 digit dari seeder).
*   **Petunjuk Demo:**
    *   **NIS:** `0001` s/d `0010`
    *   **Password:** `siswa123`

---

## II. Struktur Relasi Wali Murid & Siswa di Database

Relasi antara **Wali Murid (User)** dan **Siswa (Student)** menggunakan hubungan **Many-to-Many (Belongs to Many)** melalui tabel pivot untuk mengakomodasi kondisi riil di lapangan (misal: satu wali memiliki beberapa anak, atau satu anak dipantau oleh ayah & ibu dengan akun terpisah).

### 1. Struktur Tabel Pivot (`guardian_student`)
Tabel pivot ini didefinisikan pada file migrasi `simt-backend`:

```php
Schema::create('guardian_student', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();    // ID Wali (User)
    $table->foreignId('student_id')->constrained('students')->cascadeOnDelete(); // ID Siswa
    $table->string('relation', 50)->default('ayah');                         // Hubungan (ayah, ibu, wali)
    $table->timestamps();
    
    // Constraint unik untuk mencegah duplikasi relasi yang sama
    $table->unique(['user_id', 'student_id']);
});
```

### 2. Hubungan Model Eloquent Laravel

*   **Model `Student` ([app/Models/Student.php](file:///d:/laragon/www/simt-backend/app/Models/Student.php#L40-L45)):**
    ```php
    public function guardians(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'guardian_student', 'student_id', 'user_id')
            ->withPivot('relation')
            ->withTimestamps();
    }
    ```

*   **Model `User` ([app/Models/User.php](file:///d:/laragon/www/simt-backend/app/Models/User.php#L57-L62)):**
    ```php
    public function guardianStudents(): BelongsToMany
    {
        return $this->belongsToMany(Student::class, 'guardian_student', 'user_id', 'student_id')
            ->withPivot('relation')
            ->withTimestamps();
    }
    ```

---

## III. Query Database Hubungan Wali & Siswa

Untuk melakukan pengecekan atau mengambil data hubungan antara siswa dan wali, berikut adalah instruksi query-nya:

### 1. SQL Query (Raw Database)

#### A. Mengambil semua siswa (anak) dari Wali tertentu berdasarkan email:
```sql
SELECT 
    students.id AS student_id,
    students.nis,
    students.name AS student_name,
    guardian_student.relation
FROM students
INNER JOIN guardian_student ON students.id = guardian_student.student_id
INNER JOIN users ON users.id = guardian_student.user_id
WHERE users.email = 'wali_0001@simt.local';
```

#### B. Memeriksa apakah Siswa A (ID: 5) memiliki hubungan keluarga dengan Wali A (ID: 12):
```sql
SELECT EXISTS (
    SELECT 1 
    FROM guardian_student 
    WHERE student_id = 5 
      AND user_id = 12
) AS is_related;
```

### 2. Laravel Eloquent ORM

#### A. Mendapatkan koleksi anak dari Wali yang sedang login:
```php
$wali = Auth::user(); 
$students = $wali->guardianStudents; // Mengembalikan Collection of Student
```

#### B. Memvalidasi hubungan sebelum memproses data dashboard anak:
```php
$isChild = $wali->guardianStudents()->where('students.id', $studentId)->exists();
if (!$isChild) {
    abort(403, 'Anda tidak memiliki akses ke data siswa ini.');
}
```
