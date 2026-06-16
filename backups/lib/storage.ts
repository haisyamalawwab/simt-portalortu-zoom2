import { uploadToImageKit } from './imagekit';
import { uploadToCloudinary } from './cloudinary';

export type StorageProvider = 'imagekit' | 'cloudinary';

/**
 * Uploads a file to the active cloud storage provider configured in env variables
 * @param fileBuffer The file content as a Buffer
 * @param fileName The desired filename
 * @param folder The folder path in the storage provider (e.g. 'students/photos')
 * @returns Object containing url and fileId
 */
export async function uploadFileToCloud(
  fileBuffer: Buffer,
  fileName: string,
  folder: string
): Promise<{ url: string; fileId: string }> {
  const provider = (process.env.STORAGE_PROVIDER || 'imagekit').toLowerCase() as StorageProvider;

  switch (provider) {
    case 'imagekit':
      return uploadToImageKit(fileBuffer, fileName, folder);
    case 'cloudinary':
      return uploadToCloudinary(fileBuffer, fileName, folder);
    default:
      console.warn(`Peringatan: Provider "${provider}" tidak dikenal. Menggunakan fallback ImageKit.`);
      return uploadToImageKit(fileBuffer, fileName, folder);
  }
}
