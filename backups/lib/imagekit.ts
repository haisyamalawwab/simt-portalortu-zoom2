import ImageKit from '@imagekit/nodejs';

// Initialize ImageKit server-side client singleton
const globalForImageKit = globalThis as unknown as {
  imagekit: ImageKit | undefined;
};

export const imagekit =
  globalForImageKit.imagekit ??
  new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
  });

if (process.env.NODE_ENV !== 'production') {
  globalForImageKit.imagekit = imagekit;
}

/**
 * Uploads a file buffer to ImageKit
 * @param fileBuffer The file content as a Buffer
 * @param fileName The desired filename
 * @param folder The folder path in ImageKit (e.g. 'students/photos')
 * @returns Object containing url and fileId
 */
export async function uploadToImageKit(
  fileBuffer: Buffer,
  fileName: string,
  folder: string
): Promise<{ url: string; fileId: string }> {
  try {
    const response = await imagekit.upload({
      file: fileBuffer,
      fileName: fileName,
      folder: folder,
    });
    return {
      url: response.url,
      fileId: response.fileId,
    };
  } catch (error) {
    console.error('ImageKit upload error:', error);
    throw new Error('Gagal mengunggah file ke ImageKit');
  }
}
