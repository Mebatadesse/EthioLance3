const multer = require("multer");

const storage = multer.memoryStorage();

const createUpload = (allowedTypes, maxSize = 5 * 1024 * 1024) =>
    multer({
        storage,
        limits: {
            fileSize: maxSize,
        },
        fileFilter: (req, file, cb) => {
            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error("Unsupported file type"), false);
            }
        },
    });

const uploadProfileImage = createUpload([
    "image/jpeg",
    "image/png",
    "image/webp",
]);

const uploadCertificate = createUpload([
    "application/pdf",
]);

const uploadPortfolio = createUpload([
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "audio/mpeg",
    "video/mp4",
], 50 * 1024 * 1024);

module.exports = {
    uploadProfileImage,
    uploadCertificate,
    uploadPortfolio,
};
