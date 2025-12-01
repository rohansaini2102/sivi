import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Allowed image types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Allowed document types
const ALLOWED_DOC_TYPES = ['application/pdf'];

// Max file sizes
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50MB

// File filter for images
const imageFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed'));
  }
};

// File filter for PDFs
const pdfFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (ALLOWED_DOC_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'));
  }
};

// File filter for both images and PDFs
const mixedFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if ([...ALLOWED_IMAGE_TYPES, ...ALLOWED_DOC_TYPES].includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPEG, PNG, WebP, GIF) and PDFs are allowed'));
  }
};

// Memory storage (files stored in buffer, not on disk)
const storage = multer.memoryStorage();

// Image upload middleware
export const uploadImage = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

// PDF upload middleware
export const uploadPDF = multer({
  storage,
  fileFilter: pdfFilter,
  limits: {
    fileSize: MAX_PDF_SIZE,
  },
});

// Mixed upload middleware (images and PDFs)
export const uploadMixed = multer({
  storage,
  fileFilter: mixedFilter,
  limits: {
    fileSize: MAX_PDF_SIZE, // Use larger limit
  },
});

// Single thumbnail upload
export const uploadThumbnail = uploadImage.single('thumbnail');

// Single file upload (any allowed type)
export const uploadSingleFile = uploadMixed.single('file');

// Error handler middleware for multer errors
export const handleMulterError = (
  err: Error,
  _req: Request,
  res: any,
  next: any
) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'File size too large. Maximum size is 5MB for images, 50MB for PDFs.',
          code: 'FILE_TOO_LARGE',
        },
      });
    }
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'UPLOAD_ERROR',
      },
    });
  }

  if (err.message.includes('Only')) {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        code: 'INVALID_FILE_TYPE',
      },
    });
  }

  next(err);
};

export default {
  uploadImage,
  uploadPDF,
  uploadMixed,
  uploadThumbnail,
  uploadSingleFile,
  handleMulterError,
};
