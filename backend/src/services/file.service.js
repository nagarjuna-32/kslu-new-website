const fs = require('fs');
const path = require('path');
const cloudinary = require('cloudinary').v2;
const logger = require('../utils/logger');

const isCloudinaryConfigured = () => {
  return (
    process.env.UPLOAD_STORAGE === 'cloudinary' &&
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  logger.info('Cloudinary storage service configured.');
} else {
  logger.info('Using local disk storage service for uploads.');
}

/**
 * Uploads a file (from multer)
 * @param {Object} file - Multer file object
 * @param {string} folder - subfolder name e.g. 'pyqs' or 'notes'
 * @returns {Promise<{fileUrl: string, filePublicId: string|null, fileSize: number, fileType: string}>}
 */
const uploadFile = async (file, folder = 'resources') => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  const fileSize = file.size;
  const fileType = file.mimetype;

  // Cloudinary Upload if configured
  if (isCloudinaryConfigured()) {
    try {
      const uploadOptions = {
        folder: `${process.env.CLOUDINARY_FOLDER || 'kslu-circle'}/${folder}`,
        resource_type: file.mimetype === 'application/pdf' ? 'raw' : 'auto'
      };

      let result;
      if (file.path) {
        result = await cloudinary.uploader.upload(file.path, uploadOptions);
        // remove temporary file from local disk if multer saved to disk
        fs.unlink(file.path, () => {});
      } else if (file.buffer) {
        result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, uploadResult) => {
            if (error) return reject(error);
            resolve(uploadResult);
          });
          stream.end(file.buffer);
        });
      }

      return {
        fileUrl: result.secure_url,
        filePublicId: result.public_id,
        fileSize,
        fileType
      };
    } catch (error) {
      logger.error('Cloudinary upload failed, falling back to local storage:', error.message);
    }
  }

  // Local storage fallback
  const uploadsBase = path.resolve(__dirname, '../../uploads');
  const targetDir = path.join(uploadsBase, folder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
  const cleanOriginalName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${cleanOriginalName}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;
  const targetPath = path.join(targetDir, filename);

  if (file.path) {
    fs.copyFileSync(file.path, targetPath);
    fs.unlink(file.path, () => {});
  } else if (file.buffer) {
    fs.writeFileSync(targetPath, file.buffer);
  }

  const fileUrl = `/uploads/${folder}/${filename}`;
  return {
    fileUrl,
    filePublicId: null,
    fileSize,
    fileType
  };
};

/**
 * Deletes a file from storage
 */
const deleteFile = async (fileUrl, filePublicId = null) => {
  if (filePublicId && isCloudinaryConfigured()) {
    try {
      await cloudinary.uploader.destroy(filePublicId);
      return true;
    } catch (err) {
      logger.error('Failed to delete file from Cloudinary:', err.message);
    }
  }

  if (fileUrl && fileUrl.startsWith('/uploads/')) {
    try {
      const relativePath = fileUrl.replace('/uploads/', '');
      const fullPath = path.resolve(__dirname, '../../uploads', relativePath);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
      return true;
    } catch (err) {
      logger.error('Failed to delete local file:', err.message);
    }
  }

  return false;
};

module.exports = {
  uploadFile,
  deleteFile,
  isCloudinaryConfigured
};
