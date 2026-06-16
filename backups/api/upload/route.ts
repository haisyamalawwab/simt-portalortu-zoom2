import { NextRequest, NextResponse } from 'next/server';
import { uploadFileToCloud } from '@/lib/storage';

export const dynamic = 'force-dynamic';

// Allowed file types: jpg, jpeg, png, webp, pdf
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json(
        { error: 'Tidak ada file yang diunggah' },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Ukuran file melebihi batas maksimal 5MB' },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak diizinkan. Gunakan JPG, JPEG, PNG, WEBP, atau PDF' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate safe unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const fileName = `${uniqueSuffix}-${sanitizedName}`;

    // Upload to active cloud storage
    const result = await uploadFileToCloud(buffer, fileName, folder);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API Upload error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal saat mengunggah file' },
      { status: 500 }
    );
  }
}
