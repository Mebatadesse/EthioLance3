// creating a function called middleware
// err - error thet happend
// req - incoming request
// res - the response that send back
// next - pass the control to another middleware
const errorMiddleware = (err, req, res, next) => {
    // prints the error information
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    
    // send the response to wo=ho ever called the API
    // res.status(statusCode)  sets the HTTPs status
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error",
    });
};

// to use it in another file
module.exports = errorMiddleware;