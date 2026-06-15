<?php

return [

    'app_name' => env('SIMT_APP_NAME', 'SIMT MTs'),
    'app_version' => env('SIMT_APP_VERSION', '1.0.0'),

    'current_tenant_id' => null,

    'passing_grade' => env('SIMT_PASSING_GRADE', 75),

    'max_upload_size' => env('SIMT_MAX_UPLOAD_SIZE', 10240),

    'modules' => [
        'pendaftaran' => [
            'name' => 'Pendaftaran',
            'description' => 'Modul pendaftaran siswa baru dan siswa pindahan',
            'icon' => 'clipboard-list',
            'default_access' => true,
        ],
        'akademik' => [
            'name' => 'Akademik',
            'description' => 'Modul pengelolaan data akademik, kelas, dan mata pelajaran',
            'icon' => 'academic-cap',
            'default_access' => true,
        ],
        'presensi' => [
            'name' => 'Presensi',
            'description' => 'Modul pencatatan kehadiran siswa dan guru',
            'icon' => 'calendar-check',
            'default_access' => true,
        ],
        'keuangan' => [
            'name' => 'Keuangan',
            'description' => 'Modul pengelolaan SPP, pembayaran, dan keuangan madrasah',
            'icon' => 'currency-dollar',
            'default_access' => true,
        ],
        'nilai' => [
            'name' => 'Nilai',
            'description' => 'Modul pengelolaan nilai dan rapor siswa',
            'icon' => 'chart-bar',
            'default_access' => true,
        ],
        'pegawai' => [
            'name' => 'Pegawai',
            'description' => 'Modul pengelolaan data guru dan tenaga kependidikan',
            'icon' => 'users',
            'default_access' => true,
        ],
        'persuratan' => [
            'name' => 'Persuratan',
            'description' => 'Modul pengelolaan surat menyurat madrasah',
            'icon' => 'document-text',
            'default_access' => false,
        ],
        'perpustakaan' => [
            'name' => 'Perpustakaan',
            'description' => 'Modul pengelolaan perpustakaan madrasah',
            'icon' => 'book-open',
            'default_access' => false,
        ],
        'dapur' => [
            'name' => 'Dapur',
            'description' => 'Modul pengelolaan dapur dan catering madrasah',
            'icon' => 'fire',
            'default_access' => false,
        ],
        'kantin' => [
            'name' => 'Kantin',
            'description' => 'Modul pengelolaan kantin madrasah',
            'icon' => 'shopping-bag',
            'default_access' => false,
        ],
        'alumni' => [
            'name' => 'Alumni',
            'description' => 'Modul pengelolaan data alumni madrasah',
            'icon' => 'user-group',
            'default_access' => true,
        ],
        'ppdb' => [
            'name' => 'PPDB',
            'description' => 'Modul penerimaan peserta didik baru (online)',
            'icon' => 'login',
            'default_access' => true,
        ],
        'berita' => [
            'name' => 'Berita',
            'description' => 'Modul pengelolaan berita dan pengumuman madrasah',
            'icon' => 'newspaper',
            'default_access' => true,
        ],
    ],

    'dapodik' => [
        'api_url' => env('DAPODIK_API_URL', 'https://dapo.kemdikbud.go.id/api'),
        'api_token' => env('DAPODIK_API_TOKEN', ''),
        'npsn' => env('DAPODIK_NPSN', ''),
        'enabled' => env('DAPODIK_ENABLED', false),
        'sync_interval' => env('DAPODIK_SYNC_INTERVAL', 86400),
    ],

    'emis' => [
        'api_url' => env('EMIS_API_URL', 'https://emis.kemenag.go.id/api'),
        'api_token' => env('EMIS_API_TOKEN', ''),
        'nism' => env('EMIS_NISM', ''),
        'enabled' => env('EMIS_ENABLED', false),
        'sync_interval' => env('EMIS_SYNC_INTERVAL', 86400),
    ],

    'payment' => [
        'gateway' => env('PAYMENT_GATEWAY', 'midtrans'),
        'spp_default_amount' => env('SPP_DEFAULT_AMOUNT', 150000),
        'payment_timeout' => env('PAYMENT_TIMEOUT', 86400),
        'auto_remind_days' => env('PAYMENT_AUTO_REMIND_DAYS', 3),

        'midtrans' => [
            'server_key' => env('MIDTRANS_SERVER_KEY', ''),
            'client_key' => env('MIDTRANS_CLIENT_KEY', ''),
            'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
            'is_sanitized' => env('MIDTRANS_IS_SANITIZED', true),
            'is_3ds' => env('MIDTRANS_IS_3DS', true),
            'merchant_id' => env('MIDTRANS_MERCHANT_ID', ''),
            'callback_url' => env('MIDTRANS_CALLBACK_URL', ''),
        ],

        'xendit' => [
            'secret_key' => env('XENDIT_SECRET_KEY', ''),
            'public_key' => env('XENDIT_PUBLIC_KEY', ''),
            'callback_token' => env('XENDIT_CALLBACK_TOKEN', ''),
            'is_production' => env('XENDIT_IS_PRODUCTION', false),
            'callback_url' => env('XENDIT_CALLBACK_URL', ''),
        ],
    ],

    'whatsapp' => [
        'enabled' => env('WHATSAPP_ENABLED', false),
        'baileys_url' => env('BAILEYS_URL', 'http://localhost:3003'),
        'baileys_api_key' => env('BAILEYS_API_KEY', ''),
        'default_session_prefix' => 'simt_',
        'max_retries' => env('WHATSAPP_MAX_RETRIES', 3),
        'retry_delay' => env('WHATSAPP_RETRY_DELAY', 5000),
        'bulk_delay_ms' => env('WHATSAPP_BULK_DELAY_MS', 500),

        'templates' => [
            'attendance_alert' => 'Assalamualaikum {parent_name}, kami ingin menginformasikan bahwa anak Anda {student_name} hari ini {status} pada tanggal {date}. Terima kasih. - {school_name}',
            'payment_reminder' => 'Assalamualaikum {parent_name}, ini adalah pengingat bahwa SPP bulan {month} untuk anak Anda {student_name} sebesar Rp {amount} belum dibayar. Batas waktu: {due_date}. Terima kasih. - {school_name}',
            'payment_confirmation' => 'Assalamualaikum {parent_name}, pembayaran {type} untuk anak Anda {student_name} sebesar Rp {amount} telah kami terima pada {paid_date}. Terima kasih. - {school_name}',
            'announcement' => '{title}\n\n{content}\n\n- {school_name}',
        ],
    ],

    'parent_portal' => [
        'enabled' => env('PARENT_PORTAL_ENABLED', true),
        'nextjs_url' => env('NEXTJS_PARENT_PORTAL_URL', 'http://localhost:3000'),
        'registration_enabled' => env('PARENT_REGISTRATION_ENABLED', true),
    ],

    'report' => [
        'rapor_template' => env('RAPOR_TEMPLATE', 'default'),
        'header_image' => env('REPORT_HEADER_IMAGE', ''),
        'footer_text' => env('REPORT_FOOTER_TEXT', ''),
        'paper_size' => env('REPORT_PAPER_SIZE', 'a4'),
        'orientation' => env('REPORT_ORIENTATION', 'portrait'),
    ],

    'backup' => [
        'enabled' => env('BACKUP_ENABLED', true),
        'interval' => env('BACKUP_INTERVAL', 86400),
        'retention_days' => env('BACKUP_RETENTION_DAYS', 30),
        'disk' => env('BACKUP_DISK', 'local'),
    ],
];
