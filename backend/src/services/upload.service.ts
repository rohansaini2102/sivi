import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger';

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'sivi';
const PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

// Generate unique filename
const generateFileName = (originalName: string, folder: string): string => {
  const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  const uniqueId = uuidv4();
  const timestamp = Date.now();
  return `${folder}/${timestamp}-${uniqueId}.${ext}`;
};

// Optimize image using sharp
const optimizeImage = async (
  buffer: Buffer,
  options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}
): Promise<Buffer> => {
  const { width = 800, height = 600, quality = 80 } = options;

  try {
    const optimized = await sharp(buffer)
      .resize(width, height, {
        fit: 'cover',
        withoutEnlargement: true,
      })
      .webp({ quality })
      .toBuffer();

    return optimized;
  } catch (error) {
    logger.error('Image optimization failed:', error);
    // Return original buffer if optimization fails
    return buffer;
  }
};

// Upload file to R2
export const uploadToR2 = async (
  file: Express.Multer.File,
  folder: string = 'uploads',
  optimize: boolean = true
): Promise<{ url: string; key: string }> => {
  try {
    let buffer = file.buffer;
    let contentType = file.mimetype;
    let fileName = generateFileName(file.originalname, folder);

    // Optimize images
    if (optimize && file.mimetype.startsWith('image/')) {
      buffer = await optimizeImage(file.buffer, {
        width: folder === 'thumbnails' ? 800 : 1200,
        height: folder === 'thumbnails' ? 600 : 900,
        quality: 85,
      });
      contentType = 'image/webp';
      // Change extension to webp
      fileName = fileName.replace(/\.[^.]+$/, '.webp');
    }

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000', // 1 year cache
    });

    await s3Client.send(command);

    const url = `${PUBLIC_URL}/${fileName}`;
    logger.info(`File uploaded successfully: ${url}`);

    return { url, key: fileName };
  } catch (error) {
    logger.error('R2 upload failed:', error);
    throw new Error('Failed to upload file to storage');
  }
};

// Delete file from R2
export const deleteFromR2 = async (fileUrl: string): Promise<void> => {
  try {
    // Extract key from URL
    const key = fileUrl.replace(`${PUBLIC_URL}/`, '');

    if (!key || key === fileUrl) {
      logger.warn('Invalid file URL for deletion:', fileUrl);
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    logger.info(`File deleted successfully: ${key}`);
  } catch (error) {
    logger.error('R2 delete failed:', error);
    // Don't throw error for deletion failures
  }
};

// Upload thumbnail specifically
export const uploadThumbnail = async (
  file: Express.Multer.File
): Promise<{ url: string; key: string }> => {
  return uploadToR2(file, 'thumbnails', true);
};

// Upload PDF (no optimization)
export const uploadPDF = async (
  file: Express.Multer.File
): Promise<{ url: string; key: string }> => {
  return uploadToR2(file, 'pdfs', false);
};

export default {
  uploadToR2,
  deleteFromR2,
  uploadThumbnail,
  uploadPDF,
};
