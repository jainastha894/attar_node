import multer from "multer";
import path from "path";

// Set up storage engine
const storage= multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(process.cwd(), "public", "uploads"));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload= multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

export default upload;