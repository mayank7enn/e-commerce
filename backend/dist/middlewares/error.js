export const errorMiddelware = (err, req, res, next) => {
    err.message || (err.message = "Internal Server Error");
    err.statusCode || (err.statusCode = 500);
    if (err.name === "CastError")
        err.message = "Invalid ID";
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    });
};
// error.js
export const TryCatch = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
