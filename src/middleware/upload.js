import multer from "multer";
import path from "path";
import sharp from "sharp";
import fs from "fs";

// Set up storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "src", "public", "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage, 
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (before resizing)
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware to resize images after upload
export const resizeImages = async (req, res, next) => {
    // Handle single file upload (profile pic)
    if (req.file && !req.files) {
        req.files = [req.file];
    }
    
    if (!req.files || req.files.length === 0) {
        return next();
    }

    const uploadsPath = path.join(process.cwd(), "src", "public", "uploads");
    const maxWidth = 1200; // Maximum width in pixels
    const maxHeight = 1200; // Maximum height in pixels
    const quality = 85; // JPEG/WebP quality (1-100)
    const maxFileSize = 500 * 1024; // 500KB target max file size

    try {
        for (const file of req.files) {
            const filePath = path.join(uploadsPath, file.filename);
            
            // Check if file exists
            if (!fs.existsSync(filePath)) {
                continue;
            }

            // Get image metadata
            const metadata = await sharp(filePath).metadata();
            const originalSize = fs.statSync(filePath).size;
            const fileExt = path.extname(file.filename).toLowerCase();
            const isJpeg = ['.jpg', '.jpeg'].includes(fileExt);
            const isPng = fileExt === '.png';
            const isWebp = fileExt === '.webp';
            
            let needsResize = metadata.width > maxWidth || metadata.height > maxHeight;
            let needsOptimize = originalSize > maxFileSize;
            
            if (needsResize || needsOptimize) {
                let sharpInstance = sharp(filePath);
                
                // Resize if needed
                if (needsResize) {
                    sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
                        fit: 'inside',
                        withoutEnlargement: true
                    });
                }
                
                // Apply format-specific optimization
                if (isJpeg) {
                    sharpInstance = sharpInstance.jpeg({ 
                        quality: quality,
                        mozjpeg: true // Better compression
                    });
                } else if (isPng) {
                    sharpInstance = sharpInstance.png({
                        quality: quality,
                        compressionLevel: 9,
                        adaptiveFiltering: true
                    });
                } else if (isWebp) {
                    sharpInstance = sharpInstance.webp({
                        quality: quality
                    });
                } else {
                    // For other formats, convert to JPEG for better compression
                    sharpInstance = sharpInstance.jpeg({ 
                        quality: quality,
                        mozjpeg: true
                    });
                    // Update filename extension
                    const newFilename = file.filename.replace(/\.[^.]+$/, '.jpg');
                    file.filename = newFilename;
                    const newFilePath = path.join(uploadsPath, newFilename);
                    await sharpInstance.toFile(newFilePath);
                    // Delete old file if format changed
                    if (filePath !== newFilePath) {
                        fs.unlinkSync(filePath);
                    }
                    // Update file size
                    const newStats = fs.statSync(newFilePath);
                    file.size = newStats.size;
                    continue;
                }
                
                // Save optimized image
                await sharpInstance.toFile(filePath + '.tmp');
                
                // Replace original with optimized version
                fs.renameSync(filePath + '.tmp', filePath);
                
                // Update file size in req.files
                const newStats = fs.statSync(filePath);
                file.size = newStats.size;
                
                console.log(`Image optimized: ${file.filename} - ${(originalSize / 1024).toFixed(2)}KB -> ${(file.size / 1024).toFixed(2)}KB`);
            }
        }
    } catch (error) {
        console.error('Error resizing images:', error);
        // Continue even if resizing fails
    }

    next();
};

export default upload;