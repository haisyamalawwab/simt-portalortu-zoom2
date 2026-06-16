import { v2 as cloudinary } from 'cloudinary';
import path from 'path';

// Configure Cloudinary client
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

export { cloudinary };

/**
 * Uploads a file buffer to Cloudinary using streams
 * @param fileBuffer The file content as a Buffer
 * @param fileName The desired filename
 * @param folder The folder path in Cloudinary (e.g. 'students/photos')
 * @returns Object containing url and fileId
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName: string,
  folder: string
): Promise<{ url: string; fileId: string }> {
  return new Promise((resolve, reject) => {
    // Get public ID without extension
    const publicId = path.parse(fileName).name;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto', // Auto-detect image, raw (PDF/docs), or video
      },
      (error, result) => {
        if (error || !result) {
          console.error('Cloudinary upload error:', error);
          return reject(new Error('Gagal mengunggah file ke Cloudinary'));
        }
        resolve({
          url: result.secure_url,
          fileId: result.public_id,
        });
      }
    );

    uploadStream.end(fileBuffer);
  });
}
