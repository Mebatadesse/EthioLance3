
const errorMiddleware = (err, req, res, next) => {
    // If the response has already been sent, pass the error onward
    if (res.headersSent) {
        return next(err);
    }

    // Log the full error for debugging
    console.error(err);

    // Handle Multer upload errors
if (err.name === "MulterError") {
    const multerError = new Error(
        err.code === "LIMIT_FILE_SIZE"
            ? "File size exceeds the 5 MB limit"
            : err.message
    );

    multerError.statusCode = 400;
    err = multerError;
}

// Handle unsupported file types
if (err.message === "Unsupported file type") {
    err.statusCode = 400;
}

    // Determine the HTTP status code
    const statusCode =
        Number.isInteger(err.statusCode) &&
        err.statusCode >= 400 &&
        err.statusCode <= 599
            ? err.statusCode
            : 500;

    // Avoid exposing internal error details in production
    const message =
        statusCode === 500 && process.env.NODE_ENV === "production"
            ? "Internal Server Error"
            : err.message || "Internal Server Error";

    return res.status(statusCode).json({
        success: false,
        message,
    });
};

module.exports = errorMiddleware;
